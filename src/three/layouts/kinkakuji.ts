import * as THREE from 'three';
import type { Layout } from './types';
import { hills } from './types';
import { offering, ritualSet } from './common';
import type { Architecture } from '../kit/architecture';
import type { KitMaterials } from '../kit/materials';

import { mirrorWorld } from '../encounters/legends';
/**
 * Kinkaku-ji (Rokuon-ji), Kyoto.
 * The Golden Pavilion stands at the edge of Kyōko-chi, the Mirror Pond, dotted with pine-topped rock
 * islets, Mt. Kinugasa behind. Three floors in three styles: natural-wood shinden first floor, gold-leaf
 * samurai-style second, gold Zen-style third, shingle roofs and a golden phoenix on top. Visitors enter
 * through the Sōmon gate and follow a path around the pond's south shore for the classic view.
 */
export const kinkakuji: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const PCX = 0, PCZ = -6, PRX = 38, PRZ = 24;
  const pondT = (x: number, z: number) => ((x - PCX) / PRX) ** 2 + ((z - PCZ) / PRZ) ** 2;
  ctx.setGround((x, z) => {
    const t = pondT(x, z);
    if (t < 1) return -1.2 + Math.max(0, (t - 0.85) / 0.15) * 1.2;
    const h = Math.max(0, hills(x, z, 1.2, 0.06));
    return z < -40 ? h + (-40 - z) * 0.25 : h * 0.4;
  });
  ctx.terrain(0x3f5634, 420, 160);
  const pondGeo = new THREE.CircleGeometry(1, 64);
  const pond = new THREE.Mesh(pondGeo, m.water.clone());
  (pond.material as THREE.MeshStandardMaterial).color.set(0x2d5156);
  pond.scale.set(PRX * 1.02, PRZ * 1.02, 1);
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(PCX, 0.05, PCZ);
  ctx.scene.add(pond);

  // Rock islets with pines (Ashiwara-jima, crane & turtle islands)
  [[-12, -4, 3.2], [9, 2, 2.4], [-24, 6, 2.0], [18, -14, 1.8], [-4, 8, 1.4]].forEach(([x, z, r]) => {
    const isle = nat.mountain(r, 1.6, 0x4f6a3e, x);
    isle.position.set(x, -0.3, z);
    ctx.scene.add(isle);
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(r * 0.35, 0), m.rock);
    rock.position.set(x + r * 0.4, 0.4, z + r * 0.3);
    ctx.scene.add(rock);
    ctx.scene.add(nat.forest('pine', [[x, z, 0.55 + r * 0.08]], [0.6, 0.8], () => 0.9));
  });

  // The Golden Pavilion
  const kin = goldenPavilion(arch, m);
  kin.position.set(0, -0.6, -26);
  ctx.scene.add(kin);

  // Sōmon entrance gate and the path around the south shore
  ctx.add(arch.gate({ w: 8, d: 4.5, h: 4.4, stories: 1, pillar: 'darkWood', wall: 'darkWood', roofTone: 'bark' }), 44, 46, Math.PI * 0.75);
  const route: [number, number][] = [[54, 58], [44, 46], [32, 32], [14, 24], [0, 23], [-22, 21], [-40, 6], [-42, -16], [-30, -34], [-12, -38]];
  ctx.path(route, 4.4, 'gravel');
  ctx.path([[32, 32], [36, 10], [30, -24], [18, -34], [8, -38]], 3.4, 'gravel');
  // viewing terrace on the south shore
  const terrace = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 4), m.gravel);
  ctx.add(terrace, 0, 22.5, 0, 0.1);

  // Fudō-dō style prayer stop near the pavilion (offering box under a small roof)
  const fudo = arch.hall({ w: 6, d: 5, wallH: 3, podium: 0.4, pillar: 'darkWood', wall: 'darkWood', front: 'doors', roof: { kind: 'irimoya', tone: 'bark', h: 2.6, gableTone: 'darkWood' }, overhang: 1.2 });
  ctx.add(fudo, 30, -30, -Math.PI / 3);
  offering(ctx, 26.5, -27.5, 0.4, 'temple', undefined, -Math.PI / 3);

  ritualSet(ctx, { temizuya: [36, 42, Math.PI * 0.75], ema: [22, 30, -0.6], omikuji: [24, 36, -0.9] });

  // Trees: pine, maple, cedar; Mt. Kinugasa behind
  const keep = (x: number, z: number) => pondT(x, z) < 1.25 || (x > 8 && x < 60 && z > 18 && z < 64) || (x > 14 && x < 40 && z < -18 && z > -40) || (Math.abs(x) < 14 && z < -16 && z > -38);
  ctx.scene.add(nat.forest('pine', nat.scatter(60, { x0: -70, x1: 70, z0: -60, z1: 50 }, keep, 3), [0.9, 1.3], ctx.ground));
  ctx.scene.add(nat.forest('maple', nat.scatter(40, { x0: -70, x1: 70, z0: -60, z1: 60 }, keep, 31), [0.8, 1.2], ctx.ground));
  ctx.scene.add(nat.forest('cedar', nat.scatter(110, { x0: -130, x1: 130, z0: -160, z1: -42 }, keep, 7), [1, 1.4], ctx.ground));
  const mt = nat.mountain(120, 75, 0x3b5533, 4);
  mt.position.set(-10, 0, -190);
  ctx.scene.add(mt);

  return {
    encounters: [mirrorWorld({ zone: (x, z) => pondT(x, z) < 1, exit: { x: 0, z: 23, rotY: 0 } })],
    spawn: { x: 0, z: 23, rotY: 0 },
    bounds: { x0: -48, x1: 58, z0: -44, z1: 62 },
    walkable: (x, z) => pondT(x, z) > 1.04,
    anchors: {
      torii: { at: [40, 42], look: [44, 46] },
      temizuya: { at: [33, 39], look: [36, 42] },
      'spot-pavilion': { at: [0, 22], look: [0, -26] },
      haiden: { at: [21, -22], look: [30, -30] },
      ema: { at: [19, 27], look: [22, 30] },
      omikuji: { at: [21, 33], look: [24, 36] },
    },
    particles: 'none',
    fog: 0.6,
    orbit: { x: 0, z: -10, r: 46, y: 16 },
  };
};

/** Kinkaku (three floors, three styles, gold leaf, phoenix on top). Origin at ground level. */
export function goldenPavilion(arch: Architecture, m: KitMaterials): THREE.Group {
  const kin = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(17, 1.2, 13), m.granite);
  base.position.y = 0.6;
  kin.add(base);
  const f1 = arch.hall({ w: 13, d: 9.5, wallH: 3.4, podium: 0, pillar: 'cypress', wall: 'shoji', front: 'shoji', railing: 'cypress', roof: { kind: 'hip', tone: 'bark', h: 1.3, curve: 1.2, lift: 0.4, ridge: false }, overhang: 1.6, bracket: 'cypress' });
  f1.position.y = 1.2;
  kin.add(f1);
  const y2 = 1.2 + 0.3 + 3.4 + 1.6;
  const f2 = new THREE.Mesh(new THREE.BoxGeometry(11, 3.2, 8.4), m.wood.gold);
  f2.position.y = y2 + 1.6;
  kin.add(f2);
  const bal2 = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.18, 10), m.wood.gold);
  bal2.position.y = y2 + 0.9;
  kin.add(bal2);
  const r2 = arch.roof({ w: 15, d: 12.5, h: 1.5, kind: 'hip', tone: 'bark', curve: 1.2, lift: 0.45, ridge: false });
  r2.position.y = y2 + 3.4;
  kin.add(r2);
  const y3 = y2 + 4.6;
  const f3 = new THREE.Mesh(new THREE.BoxGeometry(7.2, 3, 7.2), m.wood.gold);
  f3.position.y = y3 + 1.5;
  kin.add(f3);
  // Zen bell-shaped (katōmado) windows on the third floor
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((rot) =>
    [-2.3, 0, 2.3].forEach((x) => {
      const win = new THREE.Group();
      const arch1 = new THREE.Mesh(new THREE.CircleGeometry(0.55, 16, 0, Math.PI), m.wood.black);
      arch1.position.y = 0.55;
      win.add(arch1);
      const sq = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), m.wood.black);
      win.add(sq);
      win.position.set(Math.sin(rot) * 3.61 + Math.cos(rot) * x, y3 + 1.2, Math.cos(rot) * 3.61 - Math.sin(rot) * x);
      win.rotation.y = rot;
      if (x === 0) win.scale.set(1.2, 1.2, 1);
      kin.add(win);
    })
  );
  const r3 = arch.roof({ w: 11.5, d: 11.5, h: 3.6, kind: 'pyramid', tone: 'bark', curve: 1.45, lift: 0.55 });
  r3.position.y = y3 + 3.2;
  kin.add(r3);
  // golden phoenix (hōō)
  const ph = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.45, 10, 8), m.wood.gold);
  body.scale.set(0.8, 1, 1.5);
  ph.add(body);
  [-1, 1].forEach((s) => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.6), m.wood.gold);
    wing.position.set(s * 0.8, 0.35, 0);
    wing.rotation.z = s * 0.5;
    ph.add(wing);
  });
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.25, 1.4, 6), m.wood.gold);
  tail.rotation.x = Math.PI / 2.4;
  tail.position.set(0, 0.2, -0.9);
  ph.add(tail);
  ph.position.y = y3 + 3.2 + 3.9;
  kin.add(ph);
  return kin;
}
