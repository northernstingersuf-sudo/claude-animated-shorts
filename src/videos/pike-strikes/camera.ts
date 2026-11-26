import {MathUtils, PerspectiveCamera, Vector3} from 'three';

type Point = readonly [number, number, number];
type Target = Point | Vector3;
type Lens = {fov?: number; roll?: number; blur?: number; focus?: Target};
type Rack = {from: Target; to: Target; amount: number};

const vector = (p: Target) => p instanceof Vector3 ? p.clone() : new Vector3(...p);
export const ease = (t: number) => MathUtils.smootherstep(t, 0, 1);
export const between = (a: Target, b: Target, t: number) => vector(a).lerp(vector(b), t);
export const ramp = (frame: number, from: number, to: number) => ease((frame - from) / (to - from));

export function view(position: Target, aim: Target, lens: Lens = {}) {
  return {position: vector(position), aim: vector(aim), ...lens};
}

export function dolly(from: Point, to: Point, aim: Target, progress: number, lens?: Lens) {
  return view(between(from, to, progress), aim, lens);
}

export function tracking(subject: Target, offset: Point, lead: Point, lens?: Lens) {
  return view(vector(subject).add(vector(offset)), vector(subject).add(vector(lead)), lens);
}

export function orbit(subject: Target, radius: number, height: number, start: number, end: number, progress: number, lens?: Lens) {
  const angle = MathUtils.lerp(start, end, ease(progress));
  return tracking(subject, [Math.sin(angle) * radius, height, Math.cos(angle) * radius], [0, 0, 0], lens);
}

export function overhead(subject: Target, height: number, drift: number, lens?: Lens) {
  return tracking(subject, [drift, height, .65], [0, 0, 0], {fov: 37, ...lens});
}

export function pov(eye: Target, subject: Target, lens?: Lens) {
  return view(eye, subject, {fov: 38, ...lens});
}

export function macro(subject: Target, offset: Point, lens?: Lens) {
  return tracking(subject, offset, [0, 0, 0], {fov: 30, blur: 17, ...lens});
}

export function applyView(camera: PerspectiveCamera, shot: ReturnType<typeof view>, rack?: Rack) {
  camera.position.copy(shot.position);
  camera.fov = shot.fov ?? 42;
  camera.lookAt(shot.aim);
  camera.rotateZ(shot.roll ?? 0);
  camera.updateProjectionMatrix();
  const target = rack ? between(rack.from, rack.to, ease(rack.amount)) : vector(shot.focus ?? shot.aim);
  // Thin lens expects axial depth, not distance along an off-center ray.
  return {distance: Math.max(camera.near, target.sub(camera.position).dot(camera.getWorldDirection(new Vector3()))), blur: shot.blur ?? 9};
}
