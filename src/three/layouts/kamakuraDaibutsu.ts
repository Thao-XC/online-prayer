import * as THREE from 'three';
import type { Layout } from './types';
import { hills } from './types';
import { offering, ritualSet } from './common';

/**
 * Kōtoku-in (Kamakura Daibutsu), Kanagawa.
 * Through the Niōmon into a broad gravel court where the 13 m bronze Amida Buddha sits in the open air
 * — its hall was washed away by the tsunami of 1498 and never rebuilt. Green patina, meditation mudra,
 * incense smoking before it, lotus-shaped bronze vases, pines and the green hills of Kamakura behind.
 */
export const kamakuraDaibutsu: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  ctx.setGround((x, z) => {
    const inside = Math.abs(x) < 34 && z > -40 && z < 90;
    if (inside) return 0;
    return Math.max(0, hills(x, z, 2, 0.05)) + Math.max(0, Math.abs(x) - 34) * 0.4 + Math.max(0, -40 - z) * 0.6;
  });
  ctx.terrain(0x48613a);
  ctx.path([[0, 100], [0, 30]], 7, 'paving');
  ctx.path([[0, 30], [0, -18]], 44, 'gravel');

  ctx.add(arch.gate({ w: 11, d: 5.5, h: 5, stories: 1, pillar: 'darkWood', wall: 'darkWood', roofTone: 'tile', nio: true }), 0, 64);

  // The Great Buddha on its stone base
  ctx.add(nat.buddha(14, 'patina'), 0, -12, 0, 0.2);
  // lotus bronze vases and incense
  [-7, 7].forEach((x) => {
    const vase = arch.bronzeLantern(2.6);
    ctx.add(vase, x, 2);
  });
  ctx.add(ctx.builder.buildJokoro(), 0, 10);
  offering(ctx, 0, 1, 0, 'temple');

  // Kangetsu-dō (small hall from Korea's Joseon court) to the side
  const kan = arch.hall({ w: 8, d: 6, wallH: 3.2, podium: 0.6, pillar: 'darkWood', wall: 'darkWood', front: 'doors', roof: { kind: 'irimoya', tone: 'tile', h: 3.2, gableTone: 'darkWood' }, overhang: 1.4 });
  ctx.add(kan, 24, -22, -0.6);
  // giant straw sandals (waraji) offered on the wall
  const wall = arch.tileWall(14, 2.4);
  ctx.add(wall, -22, -16, Math.PI / 2);
  [-2.2, 2.2].forEach((dz) => {
    const waraji = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.2, 18), m.rope);
    waraji.scale.set(1, 1, 2.0);
    waraji.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    ctx.add(waraji, -21.4, -16 + dz, 0, 1.9);
  });
  ritualSet(ctx, { temizuya: [-12, 40, 0.5], ema: [14, 22, -0.6], omikuji: [-14, 22, 0.6] });

  const clear = (x: number, z: number) => (Math.abs(x) < 26 && z > -34 && z < 96) || (Math.abs(x) < 7 && z >= 96);
  ctx.scene.add(nat.forest('pine', nat.scatter(70, { x0: -90, x1: 90, z0: -80, z1: 110 }, clear, 6), [1, 1.4], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(120, { x0: -140, x1: 140, z0: -160, z1: 140 }, clear, 12), [1, 1.5], ctx.ground));
  ctx.scene.add(nat.forest('sakura', [[-16, 50], [16, 52], [-20, 32], [22, 30], [-24, 6], [24, 2]], [1, 1.2], ctx.ground));
  const mt = nat.mountain(90, 40, 0x3f5a35, 3);
  mt.position.set(0, 0, -120);
  ctx.scene.add(mt);

  return {
    spawn: { x: 0, z: 96, rotY: 0 },
    bounds: { x0: -26, x1: 26, z0: -26, z1: 100 },
    walkable: (x, z) => Math.hypot(x, z + 12) > 9,
    anchors: {
      torii: { at: [0, 72], look: [0, 64] },
      temizuya: { at: [-8.5, 40], look: [-12, 40] },
      haiden: { at: [0, 28], look: [0, -6] },
      ema: { at: [11, 22], look: [14, 22] },
      omikuji: { at: [-11, 22], look: [-14, 22] },
    },
    particles: 'none',
    fog: 0.8,
    orbit: { x: 0, z: -6, r: 34, y: 14 },
    smoke: [0, 2.2, 10],
  };
};
