import * as T from 'three';
import {card, dorsalPike, fishArt, fishermanArt, minnowArt, painted, terrainTexture} from './art';
import {NOINK} from './ink';

export const SURFACE = 5.9;
export const FLOOR = -.65;
export const ENTRY = new T.Vector3(2.6, -.78, 1.15);
const lightTexture = () => painted(64, 128, g => {
  const glow = g.createRadialGradient(32, 35, 1, 32, 41, 31);
  glow.addColorStop(0, '#fffbd7d0');
  glow.addColorStop(.5, '#c3ecc685');
  glow.addColorStop(1, '#96d4ab00');
  g.fillStyle = glow;
  g.save();
  g.scale(1, 2);
  g.fillRect(0, 0, 64, 64);
  g.restore();
});

export function setLine(line: T.Line, points: T.Vector3[]) {
  const data = line.geometry.getAttribute('position');
  points.forEach((p, i) => data.setXYZ(i, p.x, p.y, p.z));
  data.needsUpdate = true;
}

function fishingLine(color: string, opacity: number, count: number) {
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(count * 3), 3));
  const line = new T.Line(geometry, new T.LineBasicMaterial({color, opacity, transparent: true, depthWrite: false}));
  line.frustumCulled = false;
  line.layers.set(NOINK);
  return line;
}

/** Animated painted light pattern with perspective and fog supplied by Three. */
function patternedSurface(color: string, map: T.Texture, water: boolean) {
  const time = {value: 0};
  const material = water
    ? new T.MeshBasicMaterial({color, side: T.DoubleSide})
    : new T.MeshLambertMaterial({color, map, side: T.DoubleSide});
  material.onBeforeCompile = shader => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 patternUV;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\npatternUV = position.xy;');
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 patternUV; uniform float uTime;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        vec2 p = patternUV * ${water ? '3.8' : '1.8'};
        float a = sin(p.x + sin(p.y * .88 + uTime * .6) * 1.5 + uTime * .38);
        float b = sin(p.y * 1.17 + sin(p.x * .77 - uTime * .43) * 1.3);
        float streak = pow(1.0 - abs(a * .54 + b * .46), 11.0);
        float pool = .83 + .17 * sin(p.x * .33 - p.y * .22 + uTime * .38);
        diffuseColor.rgb *= pool;
        diffuseColor.rgb += streak * vec3(.14,.23,.18) * ${water ? '.29' : '.64'};
      `);
  };
  material.customProgramCacheKey = () => water ? 'lake-surface' : 'lake-bed';
  return {material, time};
}

function groundPlane(material: T.Material, y: number) {
  const mesh = new T.Mesh(new T.PlaneGeometry(125, 125), material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  return mesh;
}

function reed(height: number, colors: string[]) {
  const tuft = new T.Group();
  for (let j = 0; j < 5; j++) {
    const h = height * (.76 + j * .06);
    const s = new T.Shape();
    s.moveTo(0, 0);
    s.bezierCurveTo(-.15, h * .43, -.29, h * .78, .10, h);
    s.bezierCurveTo(.07, h * .75, .26, h * .40, 0, 0);
    const leaf = new T.Mesh(new T.ShapeGeometry(s, 9), new T.MeshLambertMaterial({color: colors[j % colors.length], side: T.DoubleSide}));
    leaf.rotation.set(0, j * .71, (j - 2) * .21);
    tuft.add(leaf);
  }
  return tuft;
}

export class PikeWorld {
  root = new T.Group();
  water = new T.Group();
  shore = new T.Group();
  fish = new T.Group();
  flank = new T.Group();
  lure = new T.Group();
  body: T.Mesh;
  tail: T.Mesh;
  jaw: T.Mesh;
  dorsal: T.Mesh;
  angler: T.Mesh;
  rod: T.Mesh;
  castLure: T.Mesh;
  line = fishingLine('#c4e4cb', .67, 7);
  castLine = fishingLine('#e7ebe0', .82, 7);
  skyLight = new T.HemisphereLight('#c8efd4', '#394961', 1.5);
  sun = new T.DirectionalLight('#fff1c5', 2.35);
  rimLight = new T.DirectionalLight('#d5f7df', 1.2);
  plants: T.Group[] = [];
  shoreReeds: T.Group[] = [];
  rays: T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial>[] = [];
  particles: T.Mesh<T.SphereGeometry, T.MeshBasicMaterial>[] = [];
  bubbles: T.Mesh<T.SphereGeometry, T.MeshBasicMaterial>[] = [];
  minnows: T.Mesh[] = [];
  ripples: T.Mesh<T.RingGeometry, T.MeshBasicMaterial>[] = [];
  surfaceTimes: {value: number}[] = [];

  constructor() {
    this.root.add(this.water, this.shore, this.skyLight, this.sun, this.rimLight);
    this.sun.position.set(3, 9, -3);
    this.rimLight.position.set(-2, 4, 7);
    const terrain = terrainTexture();
    const bed = patternedSurface('#909c74', terrain, false);
    const water = patternedSurface('#48928f', terrain, true);
    const lake = patternedSurface('#74aeb8', terrain, true);
    this.surfaceTimes.push(bed.time, water.time, lake.time);
    const ceiling = groundPlane(water.material, SURFACE);
    ceiling.layers.set(NOINK);
    this.water.add(groundPlane(bed.material, FLOOR), ceiling);
    this.shore.add(groundPlane(lake.material, -.8));

    const rockShape = new T.DodecahedronGeometry(1, 1);
    const rockMats = ['#839789', '#b3ac86', '#536e72'].map(color => new T.MeshLambertMaterial({map: terrain, color}));
    for (let i = 0; i < 32; i++) {
      const rock = new T.Mesh(rockShape, rockMats[i % rockMats.length]);
      const size = .19 + i % 6 * .15;
      rock.position.set(i * 3.731 % 19 - 9, -.57, i * 2.371 % 17 - 11);
      rock.rotation.y = i * 1.17;
      rock.scale.set(size * 1.55, size * .66, size);
      this.water.add(rock);
    }
    for (let i = 0; i < 34; i++) {
      const plant = reed(1 + i % 7 * .36, i % 3 ? ['#6d9460', '#486e54', '#84975e'] : ['#4f8274', '#316b63']);
      plant.position.set(i * 2.719 % 18 - 9, FLOOR, -1.8 - i * 1.381 % 12);
      this.plants.push(plant);
      this.water.add(plant);
    }
    // Near clusters flank the swim lane and give side and through-reed shots parallax.
    for (const [x, z, h] of [[-3.4, 2.6, 3.5], [-1.95, 2.2, 2.1], [3.8, 2.5, 2.95], [4.4, .2, 3.4], [-3, -.7, 3.25], [.2, 1.5, 1.6]]) {
      const plant = reed(h, ['#5d8353', '#365d50', '#819452']);
      plant.position.set(x, FLOOR, z);
      this.plants.push(plant);
      this.water.add(plant);
    }

    this.body = card(fishArt('body'), 6, 2.4);
    this.body.geometry = new T.PlaneGeometry(6, 2.4, 24, 1);
    this.tail = card(fishArt('tail'), 6, 2.4);
    this.tail.geometry.translate(1.9, .02, 0);
    this.jaw = card(fishArt('jaw'), 6, 2.4);
    this.jaw.geometry.translate(-1.5, .13, 0);
    this.jaw.position.set(1.5, -.13, .024);
    this.flank.add(this.tail, this.body, this.jaw);
    this.dorsal = card(dorsalPike(), 6, 1.7);
    this.dorsal.rotation.x = -Math.PI / 2;
    this.dorsal.geometry = new T.PlaneGeometry(6, 1.7, 24, 1);
    this.fish.add(this.flank, this.dorsal);
    this.water.add(this.fish);
    const lureArt = fishArt('lure');
    this.lure.add(card(lureArt, 2.3, .92));
    const lureTop = card(lureArt, 2.3, .38);
    lureTop.rotation.x = -Math.PI / 2;
    // The perpendicular drawing keeps the plug readable from the surface.
    this.lure.add(lureTop);
    this.water.add(this.lure, this.line);

    const speck = new T.SphereGeometry(1, 8, 6);
    for (let i = 0; i < 74; i++) {
      const p = new T.Mesh(speck, new T.MeshBasicMaterial({color: i % 3 ? '#d4e5bd' : '#b3cc99', transparent: true, opacity: .25, depthWrite: false}));
      p.scale.setScalar(.015 + i % 4 * .008);
      this.particles.push(p);
      this.water.add(p);
    }
    for (let i = 0; i < 22; i++) {
      const p = new T.Mesh(speck, new T.MeshBasicMaterial({color: '#dcf5dc', transparent: true, depthWrite: false}));
      this.bubbles.push(p);
      this.water.add(p);
    }
    const minnow = minnowArt();
    for (let i = 0; i < 8; i++) {
      const m = card(minnow, .68 + i % 3 * .22, .3);
      this.minnows.push(m);
      this.water.add(m);
    }
    const shaft = lightTexture();
    for (let i = 0; i < 8; i++) {
      const ray = new T.Mesh(new T.PlaneGeometry(1.5 + i % 3 * .6, 10), new T.MeshBasicMaterial({map: shaft, color: '#d2ebbf', transparent: true, depthWrite: false, side: T.DoubleSide}));
      ray.position.set(i * 2.1 - 7.5, 4.1, -4.5 - i % 3 * 2);
      this.rays.push(ray);
      this.water.add(ray);
    }

    const bank = new T.Mesh(new T.BoxGeometry(12, .8, 6), new T.MeshLambertMaterial({map: terrain, color: '#cbbb99'}));
    bank.position.set(-4, -.52, 0);
    this.shore.add(bank);
    this.angler = card(fishermanArt(), 2.4, 4);
    this.shore.add(this.angler);
    this.rod = new T.Mesh(new T.CylinderGeometry(.018, .031, 3.3, 8).translate(0, 1.65, 0), new T.MeshLambertMaterial({color: '#493548'}));
    this.castLure = card(lureArt, 1, .4);
    this.shore.add(this.rod, this.castLure, this.castLine);
    for (let i = 0; i < 3; i++) {
      const ripple = new T.Mesh(new T.RingGeometry(.88, .91, 48), new T.MeshBasicMaterial({color: '#f1f2dc', transparent: true, depthWrite: false, side: T.DoubleSide}));
      ripple.rotation.x = -Math.PI / 2;
      ripple.position.copy(ENTRY);
      this.ripples.push(ripple);
      this.shore.add(ripple);
    }
    const treeMats = ['#527e72', '#659388', '#779a88'].map(color => new T.MeshLambertMaterial({color}));
    for (let i = 0; i < 25; i++) {
      const crown = new T.Mesh(new T.ConeGeometry(1.1 + i % 3 * .32, 3.8 + i % 6 * .52, 8), treeMats[i % 3]);
      crown.position.set(i * 1.61 - 19, 1.25 + i % 6 * .23, -10 - i % 4 * 2);
      this.shore.add(crown);
    }
    for (const [x, z] of [[-2.4, 3], [1.55, 2.6], [-2, -1]]) {
      const tuft = reed(1.45, ['#5f8054', '#c4a572']);
      tuft.position.set(x, -.13, z);
      this.shoreReeds.push(tuft);
      this.shore.add(tuft);
    }
  }
}
