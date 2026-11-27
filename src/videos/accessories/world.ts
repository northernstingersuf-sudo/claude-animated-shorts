import * as T from "three";
const V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z);
export const smooth = (t: number) => {
  t = T.MathUtils.clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};
const ease = (t: number, a: number, b: number) => smooth((t - a) / (b - a));
const mat = (c: string, r = 0.45, m = 0) =>
  new T.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const steel = mat("#9aa9b1", 0.22, 0.88),
  black = mat("#151b1e", 0.65),
  skin = mat("#bd8d70", 0.62),
  nail = mat("#d9b49c", 0.42);
function mesh(g: T.BufferGeometry, m: T.Material, p: T.Vector3, s?: T.Vector3) {
  const o = new T.Mesh(g, m);
  o.position.copy(p);
  if (s) o.scale.copy(s);
  o.castShadow = true;
  o.receiveShadow = true;
  return o;
}
function box(parent: T.Object3D, p: number[], s: number[], m: T.Material) {
  const o = mesh(
    new T.BoxGeometry(...(s as [number, number, number])),
    m,
    V(...p),
  );
  parent.add(o);
  return o;
}
function ball(parent: T.Object3D, p: number[], s: number[], m: T.Material) {
  const o = mesh(new T.SphereGeometry(1, 24, 16), m, V(...p), V(...s));
  parent.add(o);
  return o;
}
function wire(
  parent: T.Object3D,
  pts: number[][],
  r = 0.018,
  m: T.Material = steel,
) {
  const c = new T.CatmullRomCurve3(pts.map((p) => V(...p)));
  const o = mesh(new T.TubeGeometry(c, 40, r, 8, false), m, V());
  parent.add(o);
  return o;
}
function ring(parent: T.Object3D, p: number[], r = 0.075) {
  const o = mesh(new T.TorusGeometry(r, 0.013, 8, 36), steel, V(...p));
  parent.add(o);
  return o;
}
function texture(kind: "bait" | "cloth" | "bench", color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += kind === "bait" ? 18 : 4) {
    for (let x = 0; x < 512; x += kind === "bait" ? 22 : 4) {
      const n = ((x * 31 + y * 17) % 53) / 53;
      ctx.strokeStyle = `rgba(${kind === "bait" ? "225,237,151" : "165,170,162"},${0.025 + n * 0.1})`;
      if (kind === "bait") {
        ctx.beginPath();
        ctx.arc(x + (y % 36 ? 11 : 0), y, 10, 0, Math.PI);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(5,10,12,${n * 0.16})`;
        ctx.fillRect(x, y, 2, kind === "cloth" ? 3 : 1);
      }
    }
  }
  const t = new T.CanvasTexture(c);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.colorSpace = T.SRGBColorSpace;
  return t;
}
function fish(color: string, length = 1.6, stripes = false, hard = false) {
  const g = new T.Group();
  const tex = texture("bait", color);
  const body = new T.MeshStandardMaterial({
    map: tex,
    roughness: hard ? 0.2 : 0.31,
    metalness: 0.08,
  });
  const geo = new T.LatheGeometry(
    new T.SplineCurve([
      new T.Vector2(0.01, -length * 0.86),
      new T.Vector2(0.06, -length * 0.76),
      new T.Vector2(0.12, -length * 0.58),
      new T.Vector2(0.17, -length * 0.35),
      new T.Vector2(0.165, -length * 0.16),
      new T.Vector2(0.1, -length * 0.035),
      new T.Vector2(0.015, 0),
    ]).getPoints(80),
    64,
  );
  const b = mesh(geo, body, V());
  b.scale.z = 0.65;
  g.add(b);
  ball(
    g,
    [0, -length * 0.35, 0.095],
    [0.105, length * 0.29, 0.035],
    mat("#e2e6b0", 0.4),
  );
  if (!hard) {
    const tail = ball(g, [0, -length * 0.91, 0], [0.16, 0.15, 0.05], body);
    tail.rotation.y = 0.35;
  } else {
    const lip = box(
      g,
      [0, -0.035, 0.19],
      [0.13, 0.19, 0.025],
      new T.MeshPhysicalMaterial({
        color: "#c5dfe3",
        transparent: true,
        opacity: 0.5,
        roughness: 0.15,
      }),
    );
    lip.rotation.x = 0.65;
    ring(g, [0, -length * 0.9, 0], 0.04);
    const tailHook = treble();
    tailHook.position.set(0, -length * 1.14, 0);
    g.add(tailHook);
  }
  for (const z of [-1, 1]) {
    ball(
      g,
      [0.075, -length * 0.12, z * 0.09],
      [0.052, 0.052, 0.014],
      mat("#d9ab32", 0.27, 0.45),
    );
    ball(
      g,
      [0.075, -length * 0.12, z * 0.104],
      [0.025, 0.027, 0.008],
      mat("#080d0c", 0.2),
    );
    wire(
      g,
      [
        [0.11, -length * 0.21, z * 0.08],
        [0.14, -length * 0.25, z * 0.08],
        [0.1, -length * 0.29, z * 0.09],
      ],
      0.007,
      mat("#333e21"),
    );
  }
  for (let i = 0; i < 6; i++)
    if (stripes) {
      const o = ball(
        g,
        [0, -0.26 - i * 0.13, 0.11],
        [0.12, 0.018, 0.008],
        mat("#172220"),
      );
      o.rotation.z = 0.3;
    }
  ring(g, [0.12, -0.1, 0.05], 0.045).name = "noseEyelet";
  return g;
}
function treble() {
  const g = new T.Group();
  wire(
    g,
    [
      [0, 0.18, 0],
      [0, -0.12, 0],
    ],
    0.013,
  );
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    wire(
      g,
      [
        [0, -0.1, 0],
        [Math.cos(a) * 0.08, -0.22, Math.sin(a) * 0.08],
        [Math.cos(a) * 0.16, -0.18, Math.sin(a) * 0.16],
        [Math.cos(a) * 0.15, -0.06, Math.sin(a) * 0.15],
      ],
      0.012,
    );
  }
  ring(g, [0, 0.21, 0], 0.035);
  return g;
}
function hand() {
  const g = new T.Group();
  ball(g, [0.28, 0.16, 0.03], [0.27, 0.16, 0.12], skin);
  const sleeve = mat("#292d30", 0.88);
  ball(g, [0.78, 0.27, -0.03], [0.6, 0.19, 0.18], sleeve);
  for (let i = 0; i < 4; i++) {
    const finger = wire(
      g,
      [
        [0.23, 0.14 - i * 0.065, 0.1],
        [0.07, 0.12 - i * 0.06, 0.16],
        [-0.04, 0.1 - i * 0.055, 0.1],
      ],
      0.045,
      skin,
    );
    ball(g, [-0.04, 0.1 - i * 0.055, 0.1], [0.045, 0.045, 0.045], skin);
    ball(g, [-0.035, 0.1 - i * 0.055, 0.131], [0.045, 0.043, 0.014], nail);
    finger.castShadow = true;
  }
  wire(
    g,
    [
      [0.36, 0.25, 0.08],
      [0.12, 0.3, 0.13],
      [-0.045, 0.19, 0.1],
    ],
    0.065,
    skin,
  );
  g.scale.setScalar(0.75);
  return g;
}
export class AccessoriesWorld {
  noseEyelet!: T.Object3D;
  bench!: T.Mesh;
  apron!: T.Mesh;
  root = new T.Group();
  hero = fish("#799b25");
  rig = new T.Group();
  passengers = new T.Group();
  gate = new T.Group();
  right = hand();
  left = hand();
  case = new T.Group();
  lid = new T.Group();
  bag = new T.Group();
  torso = new T.Group();
  tray = new T.Group();
  clasp = new T.Group();
  constructor() {
    const floor = mat("#34393b", 0.9);
    floor.map = texture("bench", "#44494a");
    floor.map.repeat.set(6, 6);
    this.bench = box(this.root, [0, -0.16, 0], [15, 0.3, 10], floor);
    box(this.root, [0, 3, -4], [15, 8, 0.2], mat("#262c2d", 0.96));
    // Quiet architecture: wall seams, bench apron, screw heads, nothing decorative.
    for (let x = -6; x <= 6; x += 3)
      box(this.root, [x, 2, -3.88], [0.025, 5, 0.025], mat("#202626"));
    this.apron = box(
      this.root,
      [0, -0.5, 2.8],
      [12, 0.6, 0.12],
      mat("#24282a"),
    );
    const tr = mat("#202a2d", 0.53);
    box(this.tray, [0, 0, 0], [2.6, 0.12, 2.9], tr);
    for (const z of [-1.45, 1.45])
      box(this.tray, [0, 0.18, z], [2.65, 0.36, 0.05], tr);
    for (const x of [-1.3, 1.3, -0.45, 0.45])
      box(this.tray, [x, 0.16, 0], [0.045, 0.3, 2.9], tr);
    this.tray.position.set(-1.4, 0.03, -0.08);
    this.root.add(this.tray);
    const clear = new T.MeshPhysicalMaterial({
      color: "#b3d9de",
      roughness: 0.18,
      metalness: 0.04,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
      side: T.DoubleSide,
    });
    const edge = mat("#b4ced0", 0.2, 0.35);
    box(this.case, [0, 0.02, 0], [1.94, 0.04, 0.64], clear);
    for (const x of [-0.97, 0.97]) {
      box(this.case, [x, 0.19, 0], [0.035, 0.38, 0.65], clear);
      box(this.case, [x, 0.38, 0], [0.022, 0.022, 0.65], edge);
    }
    for (const z of [-0.32, 0.32]) {
      box(this.case, [0, 0.19, z], [1.94, 0.38, 0.025], clear);
      box(this.case, [0, 0.38, z], [1.94, 0.018, 0.018], edge);
    }
    this.lid.position.set(0, 0.39, -0.33);
    box(this.lid, [0, 0, 0.33], [2, 0.025, 0.67], clear);
    for (const x of [-0.99, 0.99])
      box(this.lid, [x, 0, 0.33], [0.018, 0.024, 0.67], edge);
    for (const z of [0, 0.66])
      box(this.lid, [0, 0, z], [2, 0.024, 0.018], edge);
    this.case.add(this.lid);
    this.clasp.position.set(0, 0.28, 0.35);
    box(this.clasp, [0, 0, 0], [0.22, 0.17, 0.045], edge);
    box(this.clasp, [0, 0, 0.03], [0.12, 0.06, 0.025], black);
    this.case.add(this.clasp);
    for (const x of [-0.65, 0.65])
      box(this.case, [x, 0.38, -0.34], [0.19, 0.07, 0.09], edge);
    this.root.add(this.case);
    // Unbranded front snap and a cable with two distinct treble positions.
    const front = mesh(
      new T.TorusGeometry(0.075, 0.013, 8, 48, Math.PI * 2 - 0.9),
      steel,
      V(),
    );
    front.rotation.z = Math.PI / 2 + 0.45;
    this.rig.add(front);
    wire(
      this.rig,
      [
        [0, -0.075, 0],
        [-0.15, -0.65, 0.01],
        [-0.12, -1.28, 0],
      ],
      0.015,
    );
    for (const y of [-0.65, -1.25]) {
      const hook = treble();
      hook.position.set(-0.12, y, 0.04);
      this.rig.add(hook);
    }
    this.gate.position.set(-0.0326, 0.0675, 0);
    wire(
      this.gate,
      [
        [0, 0, 0],
        [0.0652, 0, 0],
      ],
      0.013,
    );
    this.rig.add(this.gate);
    const orange = fish("#cb571d", 1.05, false, true);
    orange.position.set(-0.3, -1.35, 0.1);
    orange.rotation.z = -0.38;
    this.passengers.add(orange);
    const stripe = fish("#94a08d", 1.18, true);
    stripe.position.set(0.36, -1.05, -0.015);
    stripe.rotation.z = 0.32;
    this.passengers.add(stripe);
    const spoon = new T.Group();
    ball(spoon, [0, -0.42, 0], [0.16, 0.43, 0.045], mat("#cad2d7", 0.18, 0.92));
    for (let i = 0; i < 6; i++)
      ball(
        spoon,
        [Math.sin(i) * 0.07, -0.13 - i * 0.1, 0.047],
        [0.024, 0.024, 0.007],
        steel,
      );
    ring(spoon, [0, 0, 0], 0.045);
    const h = treble();
    h.position.y = -0.96;
    spoon.add(h);
    spoon.position.set(0.02, -1.75, 0.26);
    spoon.rotation.z = -0.18;
    this.passengers.add(spoon);
    for (const [x, y, z] of [
      [-0.3, -1.35, 0.1],
      [0.36, -1.05, 0],
      [0, -1.75, 0.26],
    ]) {
      wire(
        this.passengers,
        [
          [-0.12, -1.0, 0],
          [x * 0.4, y + 0.2, z],
          [x, y, z],
        ],
        0.012,
      );
      ring(this.passengers, [x, y, z], 0.055);
    }
    this.rig.add(this.passengers);
    this.root.add(this.rig, this.hero, this.right, this.left);
    // The removable nose fitting leaves with the stinger: the packed soft bait is bare.
    this.noseEyelet = this.hero.getObjectByName("noseEyelet")!;
    this.hero.remove(this.noseEyelet);
    this.root.add(this.noseEyelet);
    // Woven olive bag, piping, zipper teeth, webbing, seam lines and buckle hardware.
    const fabric = mat("#414a31", 0.94);
    fabric.map = texture("cloth", "#414a31");
    fabric.map.repeat.set(5, 5);
    ball(this.bag, [0, 0, 0], [1.55, 1.82, 0.5], fabric);
    box(this.bag, [0.45, -0.42, 0.47], [1.9, 1.35, 0.18], fabric);
    for (const x of [-1.2, 1.2]) {
      box(this.bag, [x, 0, 0.4], [0.16, 2.8, 0.12], black);
      for (let i = 0; i < 25; i++)
        box(
          this.bag,
          [x, -1.2 + i * 0.1, 0.47],
          [0.18, 0.013, 0.016],
          mat("#6c735e", 0.9),
        );
    }
    wire(
      this.bag,
      [
        [-1.25, -1.3, 0.35],
        [-1.4, 1.15, 0.25],
        [0, 1.65, 0.27],
        [1.4, 1.15, 0.25],
        [1.25, -1.3, 0.35],
      ],
      0.025,
      mat("#697157", 0.9),
    );
    wire(
      this.bag,
      [
        [-0.5, 1.55, 0],
        [-0.45, 2.1, 0],
        [0.45, 2.1, 0],
        [0.5, 1.55, 0],
      ],
      0.075,
      black,
    );
    for (let i = 0; i < 46; i++)
      box(
        this.bag,
        [-0.46 + i * 0.04, 0.25, 0.59],
        [0.018, 0.04, 0.025],
        steel,
      );
    const zip = ring(this.bag, [1.26, 0.2, 0.61], 0.08);
    zip.scale.y = 1.6;
    box(this.bag, [0.48, -0.4, 1.2], [1.99, 0.12, 0.07], black);
    for (const x of [-0.52, 1.48])
      box(this.bag, [x, -0.4, 0.88], [0.09, 0.12, 0.66], black);
    box(this.bag, [-0.88, 0.77, 0.5], [0.16, 0.4, 0.09], black);
    ring(this.bag, [-0.88, 0.65, 0.57], 0.12);
    ball(this.torso, [0, 1, -0.5], [2.1, 3, 0.5], mat("#272b2e", 0.91));
    this.root.add(this.torso, this.bag);
    const key = new T.DirectionalLight("#fff5e8", 4.1);
    key.position.set(-3, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -6;
    key.shadow.camera.right = 6;
    key.shadow.camera.top = 7;
    key.shadow.camera.bottom = -4;
    key.shadow.normalBias = 0.025;
    key.shadow.bias = -0.0002;
    key.shadow.radius = 4;
    this.root.add(key);
    const fill = new T.DirectionalLight("#e7eff3", 1.4);
    fill.position.set(4, 4, 3);
    this.root.add(fill);
    const rim = new T.DirectionalLight("#f4fbff", 3);
    rim.position.set(0, 5, -3);
    this.root.add(rim, new T.HemisphereLight("#b7c6cd", "#39392f", 1.1));
  }
  update(f: number, cam: T.PerspectiveCamera) {
    const t = f / 30;
    this.bench.position.y = t < 11.3 ? -0.16 : -3.4;
    this.apron.visible = t < 11.3;
    this.clasp.rotation.x = t < 9.5 ? -0.4 : -0.4 * (1 - ease(t, 9.5, 9.8));
    let nose = V(-0.7, 3.15 + 0.4 * ease(t, 0.2, 1.2), 0);
    let rig = nose.clone().add(V(0.17, -0.14, 0.06));
    let rz = 0;
    let hp = nose.clone();
    let lp = V(-3, 0, 0);
    let cp = V(1.4, 0.04, 0.12);
    let lid = -Math.PI * 0.64;
    let pos = V(0, 3.1, 8.1),
      look = V(-0.25, 2.45, 0),
      fov = 37;
    this.bag.visible = this.torso.visible = t >= 11.3;
    this.tray.visible = t < 11.3;
    this.bag.position.set(0, 1.7, 0);
    this.torso.position.set(0, 2, 0);
    this.hero.visible = true;
    this.left.visible = t >= 3.25 && t < 7.4;
    this.gate.rotation.z = 0;
    if (t < 1.8) {
      look.y += 0.22 * ease(t, 0.35, 1.15);
    } else if (t < 3.8) {
      const q = ease(t, 1.8, 2.65);
      nose = V(-0.7 + 1.15 * q, 3.55 - 0.48 * ease(t, 2.5, 2.95), 0);
      rig = nose.clone().add(V(0.17, -0.14, 0.06));
      pos = V(-0.25 + 1.0 * ease(t, 1.9, 2.75), 4.3, 8.7);
      look = V(0.45, 1.55, 0);
      fov = 44;
      lp = V(0.15, 1.0 + 1.0 * ease(t, 3.25, 3.6), 0.18);
    } else if (t < 7.4) {
      nose = V(-0.7, 2.95, 0);
      rig = nose.clone().add(V(0.17, -0.14, 0.06));
      lp = V(-0.58, 2.99, -0.05);
      if (t < 5.5) {
        const q = ease(t, 4.1, 4.85);
        pos = V(-0.45, 3.8, 3.8 - 0.35 * q);
        look = V(-0.58, 2.85, 0);
        fov = 26;
      } else {
        const q = ease(t, 5.95, 6.25);
        nose.add(V(0.35 * q, 0.56 * q, 0));
        rig.y -= 2.35 * ease(t, 6.25, 6.85);
        rig.z -= 1.6 * ease(t, 6.25, 6.85);
        lp.y = rig.y + 0.18;
        lp.z = rig.z - 0.08;
        this.gate.rotation.z = -1.0 * ease(t, 5.5, 5.95);
        pos = V(-0.25, 4.1, 5.1);
        look = V(-0.45, 2.73, 0);
        fov = 29;
      }
    } else if (t < 11.3) {
      const q = ease(t, 7.4, 8.1);
      nose = V(-0.35 + 2.53 * q, 2.9 - 2.65 * q, 0.12);
      rz = (-Math.PI / 2) * q;
      rig = V(-1.15, 0.46, -1.54);
      lid = -Math.PI * 0.64 * (1 - ease(t, 8.5, 9));
      if (t < 9.5) {
        pos = V(1.25, 7.8, 0.12);
        look = V(1.25, 0, 0.12);
        fov = 38;
        cam.up.set(0, 0, -1);
      } else {
        nose = V(2.18, 0.25, 0.12);
        rz = -Math.PI / 2;
        pos = V(0.3, 3.8, 9.2);
        look = V(0.3, 0.55, -0.3);
        fov = 44;
        rig.y += 1.6 * ease(t, 10.85, 11.3);
        rig.z += 1.2 * ease(t, 10.85, 11.3);
        hp = V(1.4, 0.48, 0.25).lerp(
          rig.clone().add(V(0.04, 0.05, 0.1)),
          ease(t, 10.15, 10.8),
        );
        this.clasp.rotation.x = -0.4 * (1 - ease(t, 9.5, 9.8));
      }
    } else {
      this.tray.visible = false;
      this.case.visible = t >= 13.2;
      rig = V(-0.88, 2.31, 0.74);
      this.gate.rotation.z = -0.8 * (1 - ease(t, 11.65, 12.3));
      if (t < 13.2) {
        pos = V(-0.6, 2.5, 4.5);
        look = V(-0.85, 2.45, 0.5);
        fov = 23;
        hp = V(-1.4 + 0.55 * ease(t, 11.3, 11.65), 2.4, 0.75);
        hp.x += 2 * ease(t, 12.5, 13.0);
      } else {
        const q = ease(t, 13.2, 13.6);
        pos = V(0, 3.35, 5.9 + 2.8 * q);
        look = V(0, 1.8, 0);
        fov = 48;
        cp = V(0.55, 1.2 + 0.6 * (1 - ease(t, 13.2, 13.9)), 0.85);
        nose = cp.clone().add(V(0.78, 0.21, 0));
        rz = -Math.PI / 2;
        lid = 0;
        hp = V(1.1, cp.y + 0.4, 1.0);
        hp.x += 1.7 * ease(t, 13.9, 14.2);
        const pat = ease(t, 14.4, 14.65) * (1 - ease(t, 14.75, 15));
        hp.lerp(V(1.1, cp.y + 0.45, 0.95), pat);
        const step = 0.22 * ease(t, 15.1, 16);
        this.bag.position.x = step;
        this.torso.position.x = step;
        rig.x += step;
        cp.x += step;
        nose.x += step;
        rig.z += 0.035 * Math.sin((t - 13.2) * 7);
      }
    }
    if (t < 9.5) hp = nose.clone().add(V(0.04, 0.05, 0.1));
    this.case.position.copy(cp);
    this.case.visible = t < 11.3 || t >= 13.2;
    this.lid.rotation.x = lid;
    this.hero.position.copy(nose);
    this.hero.rotation.set(0, 0, rz);
    this.rig.position.copy(rig);
    this.rig.rotation.x =
      t < 6.25
        ? 0
        : t < 7.4
          ? -1.42 * ease(t, 6.25, 6.85)
          : t < 11.3
            ? -1.42 * (1 - ease(t, 10.85, 11.3))
            : 0;
    this.rig.rotation.z =
      t < 3.8
        ? 0.045 * Math.sin(t * 5) * Math.exp(-t * 0.5)
        : t >= 13.2
          ? 0.025 * Math.sin(t * 6)
          : 0;
    this.right.position.copy(hp);
    this.left.position.copy(lp);
    this.left.rotation.z = Math.PI;
    this.right.visible = true;
    cam.position.copy(pos);
    if (!(t >= 7.4 && t < 9.5)) cam.up.set(0, 1, 0);
    cam.fov = fov;
    cam.lookAt(look);
    cam.updateProjectionMatrix();
    this.root.updateMatrixWorld(true);
    this.noseEyelet.position.copy(
      t < 5.95
        ? this.hero.localToWorld(V(0.12, -0.1, 0.05))
        : this.rig.localToWorld(V(-0.05, 0.04, -0.01)),
    );
    this.noseEyelet.quaternion.copy(
      t < 5.95 ? this.hero.quaternion : this.rig.quaternion,
    );
    this.noseEyelet.updateMatrixWorld(true);
  }
  dispose() {
    this.root.traverse((o) => {
      if (o instanceof T.Mesh) {
        o.geometry.dispose();
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          m.dispose();
      }
    });
  }
}
