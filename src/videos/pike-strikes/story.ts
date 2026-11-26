import * as T from 'three';
import {applyView, dolly, macro, orbit, overhead, pov, ramp, tracking, view} from './camera';
import {ENTRY, PikeWorld, setLine, SURFACE} from './world';
import words from './timing/words.json';
import events from './timing/events.json';

const normalize = (word: string) => word.toLowerCase().replace(/[^a-z]/g, '');
function beat(word: string, after = 0) {
  const timing = words.find(w => w.start_frame >= after && normalize(w.word) === word);
  if (!timing) throw new Error(`Missing aligned word: ${word} after frame ${after}`);
  return timing.start_frame - 2;
}

const sound = (key: keyof typeof events) => Math.round(events[key] * 30);
const cast = beat('cast');
const entry = sound('entry');
const rewind = beat('one');
const lastTwitchBeat = beat('twitch', 1700);
const wobble = beat('wobble');
const flash = beat('flash');
const speed = beat('sudden');
const pause = beat('pauses');
const turn = beat('turns');
const twitch = beat('twitch');
const bend = beat('bends');
const drive = beat('drives');
const jaws = beat('jaws');
const hit = sound('impact') - 2;

const scenes = [
  ['eye', 0],
  ['reveal', beat('attack')],
  ['cast', rewind],
  ['surface', beat('beneath')],
  ['entry', beat('ripples')],
  ['weed', beat('weeds')],
  ['wobble', wobble],
  ['speed', speed],
  ['pov', beat('to', 470)],
  ['wake', beat('movement')],
  ['flank', beat('lateral')],
  ['pause', beat('now')],
  ['turn', turn],
  ['follow', beat('a', 1000)],
  ['twitch', beat('then')],
  ['bend', bend],
  ['drive', drive],
  ['jaws', jaws],
  ['impact', beat('an', 1245)],
  ['aftermath', beat('was')],
  ['school', beat('conditions')],
  ['callback', beat('your', 1570)],
] as const;
export const SHOTS = scenes.map(([id, start], i) => ({id, start, end: scenes[i + 1]?.[1] ?? 1800}));
export const shotAt = (frame: number) => SHOTS.find(s => frame < s.end) ?? SHOTS[SHOTS.length - 1];

const point = (x: number, y: number, z: number) => new T.Vector3(x, y, z);
const mix = T.MathUtils.lerp;
const saturate = (n: number) => T.MathUtils.clamp(n, 0, 1);
const eyeLocal = point(1.81, .09, .04);
const noseLocal = point(2.56, -.04, .02);
const tailLocal = point(-1.91, -.02, 0);
const lureNose = point(.205, .006, 0);

function anchored(model: T.Object3D, local: T.Vector3) {
  return local.clone().multiply(model.scale).applyEuler(model.rotation).add(model.position);
}

function bow(line: T.Line, a: T.Vector3, b: T.Vector3, slack: number) {
  setLine(line, Array.from({length: 7}, (_, i) => {
    const p = a.clone().lerp(b, i / 6);
    p.y -= Math.sin(i * Math.PI / 6) * slack;
    return p;
  }));
}

function castAction(w: PikeWorld, f: number) {
  const takeback = ramp(f, cast - 15, cast - 5);
  const release = ramp(f, cast - 6, cast + 6);
  const finish = ramp(f, cast + 6, cast + 21);
  w.angler.position.set(-1.12 + release * .16, 2.02, 1);
  w.angler.rotation.z = .16 * takeback - .28 * release + .09 * finish;
  const grip = anchored(w.angler, point(.65, .24, .025));
  w.rod.position.copy(grip);
  w.rod.rotation.z = .30 + .71 * takeback - 2.07 * release - .12 * finish;
  const tip = anchored(w.rod, point(0, 3.3, 0));
  const fly = saturate((f - cast) / (entry - cast));
  w.castLure.position.copy(point(1.05, 4.40, 1.05).lerp(ENTRY, fly));
  w.castLure.position.y += Math.sin(fly * Math.PI) * 1.3;
  w.castLure.rotation.z = -.3 - fly * .9;
  w.castLure.visible = f >= cast && f < entry;
  w.castLine.visible = f >= cast;
  bow(w.castLine, tip, w.castLure.position, .47 * fly * fly);
  for (const [i, ring] of w.ripples.entries()) {
    const age = f - entry - i * 3;
    ring.visible = age >= 0 && age <= 31;
    ring.scale.setScalar(.11 + Math.max(0, age) * .065);
    ring.material.opacity = .8 * (1 - saturate(age / 31));
  }
}

function swimAction(w: PikeWorld, f: number) {
  const glide = ramp(f, turn - 4, turn + 35) - ramp(f, 1060, twitch);
  const coil = ramp(f, bend - 9, bend + 15);
  const driveKick = ramp(f, drive - 4, drive + 7);
  const load = coil * (1 - driveKick);
  // A fast launch, a short held moment on the jaws, then a second burst into contact.
  const launch = .38 * ramp(f, drive, drive + 9) + .17 * ramp(f, drive + 9, jaws + 1)
    + .45 * ramp(f, jaws + 1, hit);
  const follow = ramp(f, hit, hit + 30);
  const retreat = ramp(f, 1315, 1510);
  const decay = 1 - ramp(f, hit + 13, hit + 53);
  const tailBeat = Math.sin(f * .105) * .08 + load * .59 - driveKick * .37 * (1 - launch)
    + Math.sin((f - hit) * .30) * .31 * follow * decay;
  w.fish.scale.setScalar(.84);
  w.fish.position.set(-.97 + glide * .38 - load * .15 + launch * 1.21 + follow * .76 - retreat * 2.9,
    2.22 + .04 * Math.sin(f * .046) + launch * .16 - follow * .38 - retreat * .47,
    -.05 - glide * .14 + follow * .23 - retreat * 2.3);
  w.fish.rotation.set(0, -.04 - glide * .24 + retreat * .23, -.05 * load + .10 * launch - .20 * follow + .12 * retreat);
  const body = w.body.geometry.getAttribute('position');
  const dorsal = w.dorsal.geometry.getAttribute('position');
  for (let i = 0; i < body.count; i++) {
    const x = body.getX(i);
    const flex = Math.max(0, (1.0 - x) / 2.91) ** 2;
    body.setZ(i, tailBeat * flex);
    dorsal.setY(i, w.dorsal.geometry.getAttribute('uv').getY(i) * 1.7 - .85 + tailBeat * flex);
  }
  body.needsUpdate = true;
  dorsal.needsUpdate = true;
  w.tail.position.copy(tailLocal).add(point(0, 0, tailBeat));
  w.tail.rotation.set(0, tailBeat * -.75, Math.sin(f * .15) * .055 + load * .11);
  w.jaw.rotation.z = -.26 * ramp(f, jaws - 5, jaws + 2) * (1 - ramp(f, hit - 1, hit + 8));

  const sink = ramp(f, entry, 327);
  const lureClose = ramp(f, 305, 379);
  const tempo = ramp(f, speed - 3, speed + 15);
  const stop = ramp(f, pause - 7, pause + 5);
  const jerk = ramp(f, twitch - 2, twitch + 4) * (1 - ramp(f, twitch + 5, twitch + 21));
  const drawIn = ramp(f, jaws, hit);
  const recoil = ramp(f, hit, hit + 12);
  const lift = ramp(f, hit + 3, hit + 52);
  const callback = ramp(f, 1580, 1630);
  const lastTwitch = ramp(f, lastTwitchBeat - 3, lastTwitchBeat + 5);
  const swim = (1 - stop) * (.08 + .10 * tempo);
  const lureX = mix(2.6, 2.03, lureClose) + .26 * tempo - .18 * stop + .23 * jerk + .45 * recoil - .55 * callback;
  const lureY = mix(SURFACE - .06, 2.63, sink) + swim * Math.sin(f * .17) - .14 * stop + .21 * jerk - .16 * drawIn * (1 - lift) + lift * 4.3 - callback * 3.36 + .19 * lastTwitch;
  w.lure.position.set(lureX, lureY, (1 - lureClose) * .8 + .19);
  if (f < rewind) {
    w.lure.position.set(.19 + .099 * f, 2.80 - ramp(f, 0, 18) * .19, .83 - ramp(f, 1, 40) * .40);
  }
  w.lure.rotation.set(
    .62 * Math.sin(f * (.20 + .04 * tempo)) * (1 - stop) + .65 * jerk,
    .1 + .57 * Math.sin(f * .20) * (1 - stop) + .63 * ramp(f, flash - 2, flash + 2) * (1 - ramp(f, flash + 3, flash + 10)),
    .1 * Math.sin(f * .24) * (1 - stop) - .38 * stop + .29 * jerk + .9 * recoil * (1 - callback),
  );
  w.lure.visible = f < hit + 46 || f >= 1580;
  w.line.visible = w.lure.visible && f >= entry;
  const plug = anchored(w.lure, lureNose);
  bow(w.line, point(plug.x + .46, SURFACE, .25), plug, .2 + stop * .33 - recoil * .18);
  return {
    eye: anchored(w.fish, eyeLocal),
    nose: anchored(w.fish, noseLocal),
    tail: anchored(w.fish, tailLocal),
    plug: w.lure.position,
  };
}

function environment(w: PikeWorld, f: number) {
  const t = f / 30;
  for (const time of w.surfaceTimes) time.value = t;
  for (const [i, plant] of w.plants.entries()) {
    const distance = Math.hypot(plant.position.x - 1.65, plant.position.z - .3);
    const start = hit - 3 + distance * 3;
    const age = Math.max(0, f - start);
    const kick = Math.sin(age * .23) * Math.exp(-age / 15) * .30 / (1 + distance * .27);
    plant.rotation.z = .05 * Math.sin(t * 1.3 + i) + kick;
    plant.rotation.x = .04 * Math.sin(t * 1.5 + i * .8) - kick * .35;
  }
  for (const [i, plant] of w.shoreReeds.entries()) plant.rotation.z = .08 * Math.sin(t * 2 + i);
  for (const [i, ray] of w.rays.entries()) {
    ray.rotation.z = -.28 + .10 * Math.sin(t * .35 + i);
    ray.material.opacity = .09 + Math.sin(t * .55 + i * .68) * .045;
  }
  const wake = ramp(f, 621, 648) * (1 - ramp(f, 755, 787));
  for (const [i, speck] of w.particles.entries()) {
    const nearLure = i < 16 && wake > 0;
    if (nearLure) {
      const age = (f * .043 + i * .19) % 1;
      const angle = i * 2.39 + age;
      speck.position.copy(w.lure.position).add(point(-.2 - age * 1.35, Math.sin(angle) * age * .44, Math.cos(angle) * age * .43));
      speck.material.opacity = wake * .66 * Math.sin(age * Math.PI);
    } else {
      speck.position.set(i * 1.37 % 16 - 8 + Math.sin(t * .45 + i) * .22, (i * 1.91 + t * .10) % 6, i * .79 % 15 - 10);
      speck.material.opacity = .25;
    }
  }
  for (const [i, bubble] of w.bubbles.entries()) {
    const entering = f < 302;
    const age = f - (entering ? entry : hit) - i % 8;
    const live = age >= 0 && age < (entering ? 74 : 59);
    bubble.visible = live;
    if (!live) continue;
    const x = i * 2.39996;
    const travel = 1 - Math.exp(-age * .061);
    const origin = entering ? point(2.6, SURFACE - .16, .85) : point(1.85, 2.52, .17);
    bubble.position.copy(origin).add(point(
      Math.cos(x) * travel * (.42 + i % 4 * .20) + age * .004,
      entering ? -.83 * travel + age * .010 + Math.sin(x) * travel * .32 : Math.sin(x) * travel * .60 + age * .017,
      Math.sin(x) * travel * (.48 + i % 3 * .19),
    ));
    bubble.scale.setScalar((.022 + i % 5 * .015) * (1 - age / 110));
    bubble.material.opacity = .67 * (1 - age / (entering ? 74 : 59));
  }
  const scatter = ramp(f, hit, hit + 32);
  for (const [i, fish] of w.minnows.entries()) {
    fish.position.set((f * .009 + i * .47) % 10 - 5 + scatter * (i % 2 ? 1.9 : -2.5),
      3.30 + i % 3 * .31 + .12 * Math.sin(t * 1.7 + i) + scatter * ((i % 3) - 1) * .83,
      -3.7 - i % 5 * .31);
    fish.rotation.set(0, i % 2 ? .3 : -2.8, Math.sin(t * 6 + i) * .11 + scatter * .11);
  }
}

function setLook(w: PikeWorld, scene: T.Scene, id: typeof SHOTS[number]['id']) {
  const shore = id === 'cast' || id === 'surface';
  const high = ['entry', 'turn', 'drive'].includes(id);
  const shaded = ['eye', 'weed', 'pov', 'pause', 'bend', 'jaws'].includes(id);
  const bg = shore ? '#89bcda' : shaded ? '#286869' : high ? '#57a19c' : '#3e878b';
  scene.background = new T.Color(bg);
  scene.fog = new T.Fog(bg, shore ? 9 : 3.7, shore ? 41 : 22);
  w.shore.visible = shore;
  w.water.visible = !shore;
  w.sun.color.set(shore ? '#ffe4b2' : high ? '#f7ffd0' : '#ffeac3');
  w.sun.intensity = shore ? 2.45 : shaded ? 1.48 : 2.21;
  w.skyLight.intensity = shaded ? 1.23 : 1.58;
  w.rimLight.intensity = shore ? 2.15 : shaded ? 1.72 : 1.47;
  w.sun.position.set(shaded ? 6 : 2, 8, high ? 1 : -3);
}

export function pose(w: PikeWorld, f: number, camera: T.PerspectiveCamera, scene: T.Scene) {
  const shot = shotAt(f);
  const id = shot.id;
  const u = (f - shot.start) / (shot.end - shot.start);
  setLook(w, scene, id);
  castAction(w, f);
  const {eye, nose, tail, plug} = swimAction(w, f);
  environment(w, f);
  w.dorsal.visible = id === 'turn' || id === 'drive';
  w.flank.visible = !w.dorsal.visible && id !== 'pov';
  w.lure.children[0].visible = !w.dorsal.visible;
  w.lure.children[1].visible = w.dorsal.visible;
  camera.layers.enableAll();
  const focus = (shotView: ReturnType<typeof view>, rack?: Parameters<typeof applyView>[2]) => applyView(camera, shotView, rack);

  switch (id) {
    case 'eye':
      return focus(dolly([.77, 2.69, 2.86], [.16, 2.55, 1.69], eye, ramp(f, 1, 28),
        {fov: 34, roll: -.10 + u * .04, blur: 18}), {from: point(.55, 2.75, .83), to: eye, amount: ramp(f, 3, 19)});
    case 'reveal':
      return focus(orbit(point(-.05, 2.45, 0), 9.8 - u * 1.3, .1 + u * .9, .22, -.27, u, {fov: 51, focus: eye}));
    case 'cast':
      return focus(dolly([-1.0, 2.35, 7.0], [.35, 3.38, 6.1], point(-.4, 2.40, 1), u, {fov: 43, roll: -.045, focus: w.angler.position}));
    case 'surface':
      return focus(overhead(ENTRY.clone().add(point(-.12, 0, 0)), 3.8 - u * .45, -.48 + u * .5, {fov: 52, roll: -.18, blur: 5}));
    case 'entry':
      return focus(tracking(plug, [-.46 + u * .36, -.62 + u * .55, 3.25 + u * .6], [-.03, -.35, 0], {fov: 44, blur: 13}));
    case 'weed':
      return focus(dolly([-2.22, 1.55, 6.3], [-.23, 2.18, 5.84], point(.05, 2.02, 0), u, {fov: 51, focus: eye, blur: 18}),
        {from: point(-1.95, 1.35, 2.2), to: eye, amount: ramp(f, 273, 304)});
    case 'wobble':
      return focus(macro(plug, [.29 - .22 * u, .22, 2.20 - .40 * u], {fov: 37, roll: .05, blur: 13}));
    case 'speed':
      return focus(tracking(plug, [2.43 - u * .6, -.29, 2.14 + .6 * u], [-.38, .03, 0], {fov: 43, roll: -.12, focus: plug, blur: 11}));
    case 'pov':
      return focus(pov(eye.clone().add(point(-.64 + .25 * u, .04, .75)), plug.clone().add(point(-.04, -.16, 0)), {fov: 57, roll: .04, focus: plug, blur: 12}));
    case 'wake':
      return focus(tracking(plug, [-.96 - u * .2, .90, 2.45], [-.42, -.10, 0], {fov: 48, roll: .11, focus: plug, blur: 10}));
    case 'flank':
      return focus(dolly([-1.55, 2.56, 2.30], [.32, 2.49, 2.08], point(-.51 + u * 1.58, 2.29, 0), u, {fov: 34, roll: -.03, blur: 16}));
    case 'pause':
      return focus(orbit(eye.clone().lerp(plug, .58), 4.95 - .32 * u, .45, .50, .16, u, {fov: 45, blur: 21}),
        {from: plug, to: eye, amount: ramp(f, pause + 5, turn - 2)});
    case 'turn':
      return focus(overhead(point(.13, 2.35, .1), 3.1 - u * .29, -.5 + u * .8, {fov: 63, roll: -1.24, blur: 8}));
    case 'follow':
      return focus(tracking(nose, [.18 - .35 * u, .29, 5.0 + .65 * u], [.22, .04, .02], {fov: 50, focus: eye, blur: 12}));
    case 'twitch':
      return focus(macro(plug, [.34, -.26 + .24 * u, 1.62 + .3 * u], {fov: 40, roll: -.16, blur: 14}));
    case 'bend':
      return focus(tracking(tail, [-.24, .51 - .25 * u, 2.01], [.24, .09, 0], {fov: 45, roll: -.20, blur: 12}));
    case 'drive':
      return focus(overhead(w.fish.position.clone().add(point(1.02, 0, 0)), 2.94, -.28 + u * .2, {fov: 72, roll: -1.23, blur: 5}));
    case 'jaws':
      return focus(tracking(nose, [.19 + .14 * u, .25, 2.92 - .42 * u], [-.29, -.07, .02], {fov: 47,
        roll: frameKick(f, hit), focus: nose, blur: 14}));
    case 'impact':
      return focus(dolly([2.45, 1.80, 6.4], [3.06, 2.62, 8.6], point(1.89 - u * .60, 2.28, .1), u, {fov: 49, blur: 10}));
    case 'aftermath':
      return focus(orbit(point(-.07, 1.48, -1.1), 8.7 + 1.4 * u, .85 + .88 * u, -.55, -.1, u, {fov: 57, focus: w.fish.position, blur: 6}));
    case 'school': {
      const minnow = w.minnows[4].position;
      return focus(tracking(minnow, [1.58, .33 - u * .22, 3.11], [.26, -.18, 0], {fov: 46, roll: .05, blur: 9}));
    }
    case 'callback': {
      const aim = eye.clone().lerp(plug, .52);
      aim.y = mix(eye.y, Math.min(plug.y, 4.05), .52);
      return focus(dolly([2.06, 3.58, 7.0], [.80, 2.94, 5.7], aim, u, {fov: 53, focus: plug, blur: 14}),
        {from: eye, to: plug, amount: ramp(f, 1690, 1756)});
    }
  }
}

function frameKick(frame: number, impact: number) {
  const age = frame - impact;
  return -.08 + (age >= 0 && age < 8 ? (-1) ** age * .04 * (1 - age / 8) : 0);
}
