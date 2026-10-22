import * as THREE from 'three';
import { soundService } from '../../services/soundService';
import { BASIN_STEPS, RIVER_STEPS, type TemizuStepText } from '../../data/temizuSteps';

/**
 * First-person temizu inside the 3D shrine.
 *
 * The camera steps up to the shrine's real basin (or kneels at Ise's river), and a pair of
 * first-person hands and a hishaku ladle are drawn in a "rig": a group at eye level that
 * turns with you but does not pitch, so "down" is always down. Every step the hands move
 * into place, then the visitor holds to perform it. Water is real particles that fall from
 * the ladle's lip, splash and run off.
 */

export interface TemizuSite {
  kind: 'basin' | 'river';
  /** where the eye is, in world space */
  eye: THREE.Vector3;
  /** direction the visitor faces (radians, scene convention) */
  yaw: number;
  /** world height of the water surface */
  waterY: number;
  /** world height of the ground under the visitor (water runs off to here) */
  groundY: number;
  /** the ladle on the basin that we pick up (hidden while we hold ours) */
  rackLadle?: THREE.Object3D | null;
}

export interface TemizuState {
  steps: TemizuStepText[];
  step: number;
  progress: number;
  ready: boolean;
  done: boolean;
}

type HandPose = { p: THREE.Vector3; rot: THREE.Euler; curl: number };
interface Pose {
  /** ladle cup centre, rig space */
  c: THREE.Vector3;
  /** handle direction from the cup toward the hand */
  dir: THREE.Vector3;
  /** roll of the cup about the handle (radians, + tips it to the left) */
  roll: number;
  holder: 'L' | 'R' | 'none';
  fill: number;
  L: HandPose;
  R: HandPose;
  /** palm at the lips: the view dims */
  mouth: number;
  /** river: how far you have crouched 0..1 */
  crouch: number;
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const N = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
const E = (x = 0, y = 0, z = 0) => new THREE.Euler(x, y, z);
const H = (p: THREE.Vector3, rot = E(), curl = 0.15): HandPose => ({ p, rot, curl });

function clonePose(p: Pose): Pose {
  return {
    c: p.c.clone(),
    dir: p.dir.clone(),
    roll: p.roll,
    holder: p.holder,
    fill: p.fill,
    L: { p: p.L.p.clone(), rot: p.L.rot.clone(), curl: p.L.curl },
    R: { p: p.R.p.clone(), rot: p.R.rot.clone(), curl: p.R.curl },
    mouth: p.mouth,
    crouch: p.crouch,
  };
}
function mod(base: Pose, o: Partial<Omit<Pose, 'L' | 'R'>> & { L?: Partial<HandPose>; R?: Partial<HandPose> }): Pose {
  const n = clonePose(base);
  Object.assign(n, { ...o, L: n.L, R: n.R });
  if (o.L) Object.assign(n.L, o.L);
  if (o.R) Object.assign(n.R, o.R);
  return n;
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
function mixEuler(a: THREE.Euler, b: THREE.Euler, t: number) {
  _q1.setFromEuler(a);
  _q2.setFromEuler(b);
  return new THREE.Euler().setFromQuaternion(_q1.slerp(_q2, t));
}
function mix(a: Pose, b: Pose, t: number): Pose {
  return {
    c: a.c.clone().lerp(b.c, t),
    dir: a.dir.clone().lerp(b.dir, t).normalize(),
    roll: lerp(a.roll, b.roll, t),
    holder: t < 0.5 ? a.holder : b.holder,
    fill: lerp(a.fill, b.fill, t),
    L: { p: a.L.p.clone().lerp(b.L.p, t), rot: mixEuler(a.L.rot, b.L.rot, t), curl: lerp(a.L.curl, b.L.curl, t) },
    R: { p: a.R.p.clone().lerp(b.R.p, t), rot: mixEuler(a.R.rot, b.R.rot, t), curl: lerp(a.R.curl, b.R.curl, t) },
    mouth: lerp(a.mouth, b.mouth, t),
    crouch: lerp(a.crouch, b.crouch, t),
  };
}

/* ------------------------------------------------------------------ */
/* poses (rig space: x right, y up, -z forward, metres)                */
/* ------------------------------------------------------------------ */
function basinPoses(waterLocalY: number): { start: Pose; steps: [Pose, Pose][]; end: Pose } {
  const w = waterLocalY; // about -0.62
  const restL = H(V(-0.24, -0.62, -0.22), E(0.3, 0.3, 0.5), 0.3);
  const restR = H(V(0.24, -0.62, -0.22), E(0.3, -0.3, -0.5), 0.3);
  const start: Pose = { c: V(0.28, w + 0.2, -0.95), dir: N(0, 0, 1), roll: Math.PI, holder: 'none', fill: 0, L: restL, R: restR, mouth: 0, crouch: 0 };
  const palmL = H(V(-0.09, w + 0.17, -0.47), E(0.05, -0.15, 0.1), 0.2);
  const palmR = H(V(0.09, w + 0.17, -0.47), E(0.05, 0.15, -0.1), 0.2);
  const rightHold = N(0.5, 0.18, 0.55);
  const leftHold = N(-0.5, 0.18, 0.55);
  const s1r = mod(start, { c: V(0.07, w + 0.16, -0.72), dir: rightHold, roll: 0, holder: 'R' });
  const s1d = mod(s1r, { c: V(0.05, w - 0.03, -0.8), fill: 1 });
  const s2r = mod(s1d, { c: V(-0.05, w + 0.3, -0.5), dir: rightHold, L: palmL });
  const s2d = mod(s2r, { roll: 1.55, fill: 0.72 });
  const s3r = mod(s2d, { c: V(0.06, w + 0.3, -0.5), dir: leftHold, roll: 0, holder: 'L', R: palmR });
  const s3d = mod(s3r, { roll: -1.55, fill: 0.46 });
  const s4r = mod(s3d, { c: V(-0.04, w + 0.3, -0.48), dir: rightHold, roll: 0, holder: 'R', R: restR, L: H(V(-0.07, w + 0.17, -0.44), E(0.05, -0.1, 0.05), 0.75) });
  const s4d = mod(s4r, { roll: 1.25, fill: 0.3 });
  const s5r = mod(s4d, { c: V(0.2, w + 0.08, -0.55), dir: N(0.3, 0.35, 0.6), roll: 0 });
  const s5d = mod(s5r, { mouth: 1, L: H(V(0.0, -0.13, -0.13), E(0.9, 0, 0), 0.75) });
  const s6r = mod(s5d, { c: V(-0.05, w + 0.3, -0.5), dir: rightHold, roll: 0, mouth: 0, L: palmL });
  const s6d = mod(s6r, { roll: 1.55, fill: 0.14 });
  const s7r = mod(s6d, { c: V(0.08, w + 0.4, -0.5), dir: N(0.35, 0.1, 0.6), L: restL });
  const s7d = mod(s7r, { c: V(0.09, w + 0.62, -0.5), dir: N(0.05, -1, 0.12), fill: 0 });
  const end = mod(start, {});
  return { start, steps: [[s1r, s1d], [s2r, s2d], [s3r, s3d], [s4r, s4d], [s5r, s5d], [s6r, s6d], [s7r, s7d]], end };
}

function riverPoses(waterLocalY: number): { start: Pose; steps: [Pose, Pose][]; end: Pose } {
  // waterLocalY is measured from the standing eye; crouching lowers the eye by 0.55
  const restL = H(V(-0.24, -0.62, -0.22), E(0.3, 0.3, 0.5), 0.3);
  const restR = H(V(0.24, -0.62, -0.22), E(0.3, -0.3, -0.5), 0.3);
  const start: Pose = { c: V(0, -5, 0), dir: N(0, 0, 1), roll: 0, holder: 'none', fill: 0, L: restL, R: restR, mouth: 0, crouch: 0 };
  const crouched = mod(start, { crouch: 1, L: H(V(-0.13, -0.4, -0.38), E(0.1, -0.2, 0.2), 0.2), R: H(V(0.13, -0.4, -0.38), E(0.1, 0.2, -0.2), 0.2) });
  const w = waterLocalY + 0.55; // water, seen from the crouched eye
  const dipped = mod(crouched, { L: H(V(-0.08, w - 0.07, -0.6), E(0.05, -0.1, 0.1), 0.25), R: H(V(0.08, w - 0.07, -0.6), E(0.05, 0.1, -0.1), 0.25) });
  const risen = mod(crouched, { crouch: 0, L: restL, R: restR });
  return { start, steps: [[start, crouched], [crouched, dipped], [dipped, risen]], end: risen };
}

/* ------------------------------------------------------------------ */
/* models                                                              */
/* ------------------------------------------------------------------ */
const SKIN = 0xc98f6a;
function makeHand(side: 1 | -1) {
  const skin = new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.65 });
  const sleeve = new THREE.MeshStandardMaterial({ color: 0x2f3a56, roughness: 0.85 });
  const cuff = new THREE.MeshStandardMaterial({ color: 0xece6d8, roughness: 0.8 });
  const hand = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.024, 0.09), skin);
  palm.position.z = -0.045;
  hand.add(palm);
  const heel = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), skin);
  heel.scale.set(1.05, 0.38, 0.9);
  heel.position.z = -0.012;
  hand.add(heel);
  const fingers: THREE.Group[] = [];
  [-0.03, -0.01, 0.01, 0.03].forEach((x, i) => {
    const pivot = new THREE.Group();
    pivot.position.set(x * side, 0.002, -0.088);
    const len = [0.06, 0.075, 0.07, 0.055][side === 1 ? 3 - i : i];
    const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, len, 3, 8), skin);
    f.rotation.x = Math.PI / 2;
    f.position.z = -len / 2 - 0.006;
    pivot.add(f);
    hand.add(pivot);
    fingers.push(pivot);
  });
  const thumbPivot = new THREE.Group();
  thumbPivot.position.set(-0.045 * side, 0, -0.03);
  const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, 0.05, 3, 8), skin);
  thumb.rotation.set(Math.PI / 2, 0, 0);
  thumb.position.z = -0.03;
  thumbPivot.add(thumb);
  thumbPivot.rotation.y = 0.6 * side;
  hand.add(thumbPivot);
  // forearm and sleeve are separate so they can reach back to an elbow below the view
  const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.034, 1, 10), skin);
  const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.07, 1, 12, 1, true), sleeve);
  (sl.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  const cf = new THREE.Mesh(new THREE.CylinderGeometry(0.059, 0.059, 0.025, 12, 1, true), cuff);
  (cf.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  [hand, fore, sl, cf].forEach((o) => o.traverse((c) => ((c as THREE.Mesh).isMesh ? (((c as THREE.Mesh).renderOrder = 2), void 0) : void 0)));
  return { hand, fingers, thumbPivot, fore, sleeve: sl, cuff: cf, skin };
}

function makeLadle() {
  const wood = new THREE.MeshStandardMaterial({ color: 0xcaa46c, roughness: 0.7 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x8a6a3a, roughness: 0.7, side: THREE.DoubleSide });
  const g = new THREE.Group();
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.043, 0.075, 18, 1, true), wood);
  (cup.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  g.add(cup);
  const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.043, 18), dark);
  bottom.rotation.x = -Math.PI / 2;
  bottom.position.y = -0.037;
  g.add(bottom);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.0035, 6, 20), dark);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.0375;
  g.add(rim);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.0445, 0.0025, 6, 20), dark);
  band.rotation.x = Math.PI / 2;
  band.position.y = -0.01;
  g.add(band);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.041, 18), new THREE.MeshStandardMaterial({ color: 0x8fd6e6, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 }));
  water.rotation.x = -Math.PI / 2;
  g.add(water);
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.009, 0.42, 8), wood);
  handle.rotation.x = Math.PI / 2 - 0.12;
  handle.position.set(0, 0.03, 0.045 + 0.21);
  g.add(handle);
  g.traverse((c) => ((c as THREE.Mesh).isMesh ? ((c as THREE.Mesh).renderOrder = 2) : 0));
  return { g, water };
}

/** position a unit-height cylinder between two points */
function stretch(m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) {
  const d = b.clone().sub(a);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.scale.set(1, d.length(), 1);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
}

/* ------------------------------------------------------------------ */
/* the ritual                                                          */
/* ------------------------------------------------------------------ */
export class TemizuRitual {
  readonly steps: TemizuStepText[];
  private rig = new THREE.Group();
  private hands: { L: ReturnType<typeof makeHand>; R: ReturnType<typeof makeHand> };
  private ladle: ReturnType<typeof makeLadle>;
  private poses: { start: Pose; steps: [Pose, Pose][]; end: Pose };
  private cur: Pose;
  private step = 0;
  private phase: 'approach' | 'ready' | 'finish' | 'outro' | 'done' = 'approach';
  private t = 0;
  private progress = 0;
  private from: Pose;
  holding = false;
  private wet = { L: 0, R: 0 };
  private drops: THREE.Points;
  private dropVel: Float32Array;
  private dropLife: Float32Array;
  private stream: THREE.Mesh;
  private ripple: THREE.Mesh;
  private lastSound = 0;
  private lastEmit = 0;
  private elapsed = 0;
  private camFrom: { p: THREE.Vector3; q: THREE.Quaternion };
  private camIn = 0;
  private savedFov: number;

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera,
    readonly site: TemizuSite,
    private onState: (s: TemizuState) => void,
    private setDim: (amount: number) => void
  ) {
    this.steps = site.kind === 'river' ? RIVER_STEPS : BASIN_STEPS;
    this.rig.position.copy(site.eye);
    this.rig.rotation.y = site.yaw;
    scene.add(this.rig);
    const waterLocal = site.waterY - site.eye.y;
    this.poses = site.kind === 'river' ? riverPoses(waterLocal) : basinPoses(waterLocal);
    this.cur = clonePose(this.poses.start);
    this.from = clonePose(this.poses.start);
    this.hands = { L: makeHand(1), R: makeHand(-1) };
    (['L', 'R'] as const).forEach((k) => {
      const h = this.hands[k];
      this.rig.add(h.hand, h.fore, h.sleeve);
    });
    this.ladle = makeLadle();
    this.rig.add(this.ladle.g);
    this.ladle.g.visible = site.kind === 'basin';
    if (site.rackLadle) site.rackLadle.visible = false;

    // water particles (world space)
    const n = 500;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3).fill(-9999), 3));
    this.drops = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xeafaff, size: 0.017, transparent: true, opacity: 0.95, depthWrite: false }));
    this.drops.frustumCulled = false;
    this.dropVel = new Float32Array(n * 3);
    this.dropLife = new Float32Array(n);
    scene.add(this.drops);
    this.stream = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 1, 8), new THREE.MeshStandardMaterial({ color: 0xe6fbff, emissive: 0x3a6a78, transparent: true, opacity: 0.8, roughness: 0.05 }));
    this.stream.visible = false;
    scene.add(this.stream);
    this.ripple = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.04, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide }));
    this.ripple.rotation.x = -Math.PI / 2;
    scene.add(this.ripple);

    this.camFrom = { p: camera.position.clone(), q: camera.quaternion.clone() };
    this.savedFov = camera.fov;
    camera.fov = camera.aspect < 0.8 ? 74 : 60;
    camera.updateProjectionMatrix();
    this.apply();
    this.emit();
  }

  private stepPoses() {
    return this.poses.steps[Math.min(this.step, this.poses.steps.length - 1)];
  }

  private emitState() {
    this.onState({ steps: this.steps, step: this.step, progress: this.progress, ready: this.phase === 'ready', done: this.phase === 'done' || this.phase === 'outro' });
  }
  private emit() {
    this.emitState();
  }

  update(dt: number) {
    this.elapsed += dt;
    // camera glides in to the basin
    this.camIn = Math.min(1, this.camIn + dt / 0.9);
    const k = ease(this.camIn);
    const eye = this.site.eye.clone();
    eye.y -= this.cur.crouch * 0.55;
    this.rig.position.copy(eye);
    const pitch = this.site.kind === 'river' ? -0.62 : -0.58;
    const target = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, this.site.yaw, 0, 'YXZ'));
    this.camera.position.lerpVectors(this.camFrom.p, eye, k);
    this.camera.quaternion.copy(this.camFrom.q).slerp(target, k);

    const [ready, done] = this.stepPoses();
    if (this.phase === 'approach') {
      this.t = Math.min(1, this.t + dt / 0.7);
      this.cur = mix(this.from, ready, ease(this.t));
      if (this.t >= 1 && this.camIn >= 1) {
        this.phase = 'ready';
        this.emit();
      }
    } else if (this.phase === 'ready') {
      if (this.holding) {
        this.progress = Math.min(1, this.progress + dt / this.steps[this.step].hold);
        this.cur = mix(ready, done, ease(this.progress));
        this.onHoldEffects();
        if (this.progress >= 1) {
          this.phase = 'finish';
          this.t = 0;
          this.completeStep();
        }
        this.emitThrottled();
      }
    } else if (this.phase === 'finish') {
      this.t += dt;
      if (this.t > 0.45) {
        this.from = clonePose(this.cur);
        this.step++;
        this.progress = 0;
        this.t = 0;
        if (this.step >= this.steps.length) {
          this.phase = 'outro';
          soundService.playFuurin();
        } else this.phase = 'approach';
        this.emit();
      }
    } else if (this.phase === 'outro') {
      // put the ladle back, face down, and let the hands drop
      this.t = Math.min(1, this.t + dt / 0.9);
      this.cur = mix(this.from, this.poses.end, ease(this.t));
      if (this.t >= 1) {
        this.phase = 'done';
        this.ladle.g.visible = false;
        if (this.site.rackLadle) this.site.rackLadle.visible = true;
        this.emit();
      }
    }
    this.apply();
    this.updateWater(dt);
    this.setDim(this.cur.mouth * 0.35);
  }

  private lastEmitT = 0;
  private emitThrottled() {
    if (this.elapsed - this.lastEmitT > 0.05) {
      this.lastEmitT = this.elapsed;
      this.emitState();
    }
  }

  private completeStep() {
    const id = this.steps[this.step].id;
    if (id === 'left' || id === 'left2') this.wet.L = 1;
    if (id === 'right') this.wet.R = 1;
    if (id === 'hands') this.wet = { L: 1, R: 1 };
    if (id === 'scoop' || id === 'hands') soundService.playTemizuWater();
    if (id === 'mouth') soundService.playZenTone(2);
  }

  private onHoldEffects() {
    const id = this.steps[this.step].id;
    if ((this.pouring() || id === 'hands') && this.elapsed - this.lastSound > 0.7) {
      this.lastSound = this.elapsed;
      soundService.playTemizuWater();
    }
    if (id === 'scoop' && this.progress > 0.4 && this.progress < 0.95) this.splashRipple(this.ladleWorld(V(0, 0, 0)));
  }

  private pouring() {
    const st = this.steps[this.step]?.id;
    return this.phase === 'ready' && this.holding && ['left', 'right', 'palm', 'left2', 'handle'].includes(st ?? '') && this.progress > 0.12 && this.cur.fill > 0.02;
  }

  /* --------------------------- drawing --------------------------- */
  private ladleWorld(local: THREE.Vector3) {
    return this.ladle.g.localToWorld(local.clone());
  }

  private apply() {
    const p = this.cur;
    // ladle
    const L = this.ladle.g;
    L.position.copy(p.c);
    const base = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.dir);
    const roll = new THREE.Quaternion().setFromAxisAngle(p.dir, p.roll);
    L.quaternion.copy(roll).multiply(base);
    this.ladle.water.visible = p.fill > 0.02;
    this.ladle.water.position.y = -0.03 + p.fill * 0.055;
    this.ladle.water.scale.setScalar(0.85 + p.fill * 0.15);
    this.rig.updateMatrixWorld(true);
    // hands
    (['L', 'R'] as const).forEach((k) => {
      const side = k === 'L' ? 1 : -1;
      const h = this.hands[k];
      let pos: THREE.Vector3, q: THREE.Quaternion, curl: number;
      if (p.holder === k) {
        // a fist around the end of the handle, pointing back up the handle toward the cup
        pos = p.c.clone().addScaledVector(p.dir, 0.43);
        q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, -1), p.dir.clone().negate());
        q.premultiply(new THREE.Quaternion().setFromAxisAngle(p.dir.clone().negate(), side * 1.35 + p.roll * 0.6));
        curl = 1;
      } else {
        const hp = p[k];
        pos = hp.p.clone();
        q = new THREE.Quaternion().setFromEuler(hp.rot);
        curl = hp.curl;
      }
      h.hand.position.copy(pos);
      h.hand.quaternion.copy(q);
      h.fingers.forEach((f, i) => (f.rotation.x = curl * (1.5 + i * 0.05)));
      h.thumbPivot.rotation.x = curl * 0.6;
      // forearm to an elbow below and behind the view
      const wrist = pos.clone().add(new THREE.Vector3(0, 0, 0.012).applyQuaternion(q));
      const elbow = wrist.clone().add(V(k === 'L' ? -0.12 : 0.12, -0.3, 0.36));
      stretch(h.fore, wrist, elbow);
      const sleeveStart = wrist.clone().lerp(elbow, 0.38);
      stretch(h.sleeve, sleeveStart, elbow.clone().add(elbow.clone().sub(wrist).multiplyScalar(0.6)));
      const wet = this.wet[k];
      h.skin.roughness = 0.65 - wet * 0.42;
      h.skin.color.setHex(wet ? 0xcf9874 : SKIN);
    });
  }

  private splashRipple(at: THREE.Vector3) {
    this.ripple.position.set(at.x, this.site.waterY + 0.004, at.z);
    (this.ripple.material as THREE.MeshBasicMaterial).opacity = 0.7;
    this.ripple.scale.setScalar(1);
  }

  private updateWater(dt: number) {
    const pos = this.drops.geometry.getAttribute('position') as THREE.BufferAttribute;
    const a = pos.array as Float32Array;
    const n = this.dropLife.length;
    const id = this.steps[Math.min(this.step, this.steps.length - 1)].id;
    // emit
    const pouring = this.pouring();
    let src: THREE.Vector3 | null = null;
    if (pouring) {
      if (id === 'handle') src = this.ladleWorld(V(0, 0.03 + 0.05, 0.45)); // runs off the end of the handle
      else {
        const side = Math.sign(this.cur.roll) || 1;
        src = this.ladleWorld(V(-0.046 * side, 0.03, 0));
      }
    }
    if (id === 'hands' && this.phase === 'ready' && this.holding && this.progress > 0.25) {
      // splashes as the hands move in the river
      src = this.hands.L.hand.getWorldPosition(new THREE.Vector3()).lerp(this.hands.R.hand.getWorldPosition(new THREE.Vector3()), Math.random());
      src.y = this.site.waterY + 0.01;
    }
    if (src && this.elapsed - this.lastEmit > 0.012) {
      this.lastEmit = this.elapsed;
      for (let k = 0; k < 6; k++) {
        const i = Math.floor(Math.random() * n);
        a[i * 3] = src.x + (Math.random() - 0.5) * 0.012;
        a[i * 3 + 1] = src.y;
        a[i * 3 + 2] = src.z + (Math.random() - 0.5) * 0.012;
        const splash = id === 'hands';
        this.dropVel[i * 3] = (Math.random() - 0.5) * (splash ? 0.6 : 0.08);
        this.dropVel[i * 3 + 1] = splash ? 0.4 + Math.random() * 0.6 : -0.1;
        this.dropVel[i * 3 + 2] = (Math.random() - 0.5) * (splash ? 0.6 : 0.08);
        this.dropLife[i] = 1.6;
      }
    }
    // a continuous thread of water from the lip
    this.stream.visible = pouring && id !== 'handle';
    if (this.stream.visible && src) {
      const end = src.clone();
      end.y -= 0.22;
      stretch(this.stream, end, src);
    }
    // move
    const floorY = this.site.groundY + 0.01;
    for (let i = 0; i < n; i++) {
      if (this.dropLife[i] <= 0) continue;
      this.dropLife[i] -= dt;
      this.dropVel[i * 3 + 1] -= 9.8 * dt;
      a[i * 3] += this.dropVel[i * 3] * dt;
      a[i * 3 + 1] += this.dropVel[i * 3 + 1] * dt;
      a[i * 3 + 2] += this.dropVel[i * 3 + 2] * dt;
      // land on the gravel (never back into the basin)
      if (a[i * 3 + 1] < floorY || this.dropLife[i] <= 0) {
        this.dropLife[i] = 0;
        a[i * 3 + 1] = -9999;
      }
    }
    pos.needsUpdate = true;
    // ripple fades
    const rm = this.ripple.material as THREE.MeshBasicMaterial;
    if (rm.opacity > 0) {
      rm.opacity = Math.max(0, rm.opacity - dt * 0.9);
      this.ripple.scale.multiplyScalar(1 + dt * 2.2);
    }
  }

  dispose() {
    this.scene.remove(this.rig, this.drops, this.stream, this.ripple);
    if (this.site.rackLadle) this.site.rackLadle.visible = true;
    this.camera.fov = this.savedFov;
    this.camera.updateProjectionMatrix();
    this.setDim(0);
  }
}
