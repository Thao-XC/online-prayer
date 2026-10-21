import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { offering, ritualSet } from './common';

/**
 * Chūson-ji, Hiraizumi (Iwate).
 * Climb Tsukimizaka, a steep earthen slope lined with centuries-old cedars, past the Hondō to the
 * Konjikidō (1124): a small hall covered entirely in gold leaf and mother-of-pearl, the resting place
 * of the Ōshū Fujiwara lords. Today it stands inside a protective concrete hall (the Sayado), seen
 * through glass. Nearby, the old wooden Sayado, the sutra repository, and Hakusan Shrine's Noh stage.
 */
export const chusonji: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const TOP = 18;
  const slopeX = (z: number) => (z > 40 ? Math.sin((z - 40) * 0.05) * 5 : 0);
  ctx.setGround((x, z) => {
    let y = z > 120 ? 0 : z > 40 ? ramp(z, 120, 40, 0, TOP) : TOP;
    const half = z > 40 ? 6 : 34;
    y += Math.max(0, Math.abs(x - slopeX(z)) - half) * 0.35 + (Math.abs(x) > half + 6 ? hills(x, z, 1.5) : 0);
    if (z < -44) y += (-44 - z) * 0.3;
    return y;
  });
  ctx.terrain(0x3a4c2e);
  const slope: [number, number][] = [];
  for (let z = 126; z >= 40; z -= 4) slope.push([slopeX(z), z]);
  ctx.path(slope, 6, 'dirt');
  ctx.path([[0, 40], [0, -30]], 8, 'gravel');
  ctx.path([[-24, 26], [24, 26]], 6, 'gravel');

  // Hondō with its gate
  ctx.add(arch.gate({ w: 7, d: 4, h: 4, stories: 1, pillar: 'darkWood', wall: 'darkWood', roofTone: 'tile' }), -18, 30, Math.PI / 2);
  const hondo = arch.hall({ w: 16, d: 12, wallH: 4.6, podium: 0.8, pillar: 'darkWood', wall: 'darkWood', front: 'doors', railing: 'darkWood', roof: { kind: 'irimoya', tone: 'tile', h: 6, gableTone: 'darkWood' }, overhang: 2.2 });
  ctx.add(hondo, -32, 26, Math.PI / 2);

  // Sayado (concrete protective hall) with the golden Konjikidō visible through glass
  const sayado = arch.hall({
    w: 18, d: 18, wallH: 8, podium: 0.6, pillar: 'stone', wall: 'plaster', veranda: false,
    roof: { kind: 'hip', tone: 'darkCopper', h: 5, curve: 1.2 }, overhang: 1.6, hollow: { door: 12 }, bracket: 'stone',
  });
  ctx.add(sayado, 0, -24);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.4), new THREE.MeshStandardMaterial({ color: 0xbfd9e0, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0.3 }));
  ctx.add(glass, 0, -15.2, 0, sayado.userData.floorY + 3.7);
  // Konjikidō: 5.5 m square, gold all over, pyramidal roof
  const kon = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.7, 7.4), m.wood.black);
  base.position.y = 0.35;
  kon.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.3, 5.5), m.wood.gold);
  body.position.y = 0.7 + 1.65;
  kon.add(body);
  for (let i = -1; i <= 1; i += 2)
    for (let j = -1; j <= 1; j += 2) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.3, 10), m.wood.gold);
      p.position.set(i * 2.8, 2.35, j * 2.8);
      kon.add(p);
    }
  const kr = arch.roof({ w: 8.5, d: 8.5, h: 2.6, kind: 'pyramid', tone: 'gold', curve: 1.3, lift: 0.3 });
  kr.position.y = 4.1;
  kon.add(kr);
  const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), m.wood.gold);
  jewel.position.y = 6.9;
  kon.add(jewel);
  const glow = new THREE.PointLight(0xffd27a, 18, 16, 2);
  glow.position.set(0, 4, 3);
  kon.add(glow);
  ctx.add(kon, 0, -25, 0, sayado.userData.floorY);
  offering(ctx, 0, -12.2, 0, 'temple');

  // sutra repository and the old wooden Sayado
  ctx.add(arch.hall({ w: 7, d: 7, wallH: 3.6, podium: 0.6, pillar: 'darkWood', wall: 'darkWood', front: 'doors', roof: { kind: 'pyramid', tone: 'bark', h: 3.4 }, overhang: 1.4 }), 22, -30);
  ctx.add(arch.hall({ w: 9, d: 9, wallH: 4, podium: 0.4, pillar: 'darkWood', wall: 'darkWood', front: 'doors', roof: { kind: 'hip', tone: 'bark', h: 3.6 }, overhang: 1.6 }), -22, -32);
  // Hakusan Shrine Noh stage
  const noh = arch.hall({ w: 7, d: 7, wallH: 3.6, podium: 1, pillar: 'cypress', wall: 'cypress', front: 'open', veranda: false, roof: { kind: 'irimoya', tone: 'bark', h: 3.6, gableTone: 'cypress' }, overhang: 1.8 });
  ctx.add(noh, 26, 6, -Math.PI / 2);

  ritualSet(ctx, { temizuya: [10, 32, -0.5], ema: [-12, 16, 0.6], omikuji: [12, 16, -0.6] });

  // ancient cedars lining Tsukimizaka, forest beyond, ginkgo near the halls
  const lining: [number, number][] = [];
  for (let z = 122; z > 42; z -= 5.5) [-5.5, 5.5].forEach((dx) => lining.push([slopeX(z) + dx + (Math.random() - 0.5) * 0.8, z]));
  ctx.scene.add(nat.forest('cedar', lining, [1.7, 2.1], ctx.ground));
  const clear = (x: number, z: number) => (Math.abs(x - slopeX(z)) < 9 && z > 38) || (Math.abs(x) < 38 && z <= 40 && z > -46);
  ctx.scene.add(nat.forest('cedar', nat.scatter(200, { x0: -130, x1: 130, z0: -130, z1: 160 }, clear, 9), [1.3, 1.8], ctx.ground));
  ctx.scene.add(nat.forest('ginkgo', [[-14, 36], [16, 38], [-20, 4], [20, -10], [-30, -10]], [1.1, 1.3], ctx.ground));

  return {
    spawn: { x: slopeX(124), z: 124, rotY: 0 },
    bounds: { x0: -36, x1: 34, z0: -16, z1: 128 },
    walkable: (x, z) => (z > 40 ? Math.abs(x - slopeX(z)) < 3.4 : !(Math.abs(x) < 9 && z < -15.4 && Math.abs(x) > 6)),
    anchors: {
      torii: { at: [slopeX(110), 110], look: [slopeX(80), 80] },
      temizuya: { at: [7, 32], look: [10, 32] },
      haiden: { at: [0, -2], look: [0, -25] },
      ema: { at: [-9, 16], look: [-12, 16] },
      omikuji: { at: [9, 16], look: [12, 16] },
    },
    particles: 'ginkgo',
    fog: 0.85,
    orbit: { x: 0, z: 0, r: 44, y: 20 },
  };
};
