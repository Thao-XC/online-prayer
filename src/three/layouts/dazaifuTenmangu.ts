import * as THREE from 'three';
import type { Layout } from './types';
import { hills } from './types';
import { offering, ritualSet, lanternRow } from './common';

/**
 * Dazaifu Tenmangū, Fukuoka.
 * Through a shop-lined approach and stone torii to Shinji-ike, the pond shaped like the character 心
 * (heart), crossed by three bridges — arched, flat, arched — for past, present and future. Then the
 * vermilion Rōmon, and the honden (Momoyama style, cypress-bark roof) with the legendary Tobiume plum
 * that flew from Kyoto to follow Sugawara no Michizane. Bronze oxen (rub the head for wisdom) and
 * thousands of plum trees; giant camphors behind.
 */
export const dazaifuTenmangu: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const pond = (x: number, z: number) => Math.abs(x) < 34 && z > 40 && z < 72 && ((x / 34) ** 2 + ((z - 56) / 16) ** 2 < 1 || Math.abs(x) < 26);
  // three bridges along x=0: arched 72→63, flat 63→58, arched 58→49
  const archA = arch.archBridge(9, 4.6, 1.8);
  const archB = arch.archBridge(9, 4.6, 1.8);
  const bridgeY = (z: number) => {
    if (z <= 72 && z > 63) return (archA.userData.yAt as (z: number) => number)(z - 67.5) + 0.4;
    if (z <= 63 && z > 58) return 0.95;
    if (z <= 58 && z > 49) return (archB.userData.yAt as (z: number) => number)(z - 53.5) + 0.4;
    return 0.4;
  };
  ctx.setGround((x, z) => {
    if (Math.abs(x) < 2.1 && z > 46 && z < 74) return bridgeY(z);
    if (pond(x, z)) return -1.2;
    return Math.max(0, Math.abs(x) - 40) * 0.25 + (Math.abs(x) > 44 || z < -40 ? hills(x, z, 1.4) : 0) + (z < -42 ? (-42 - z) * 0.3 : 0);
  });
  ctx.terrain(0x4b6338);
  const water = new THREE.Mesh(new THREE.CircleGeometry(1, 48), m.water.clone());
  water.scale.set(34, 16, 1);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.35, 56);
  ctx.scene.add(water);
  const water2 = ctx.water(-0.36, 52, 30, 0, 56);
  water2.scale.set(1, 1, 1);

  ctx.path([[0, 130], [0, 74]], 8, 'paving');
  ctx.path([[0, 46], [0, -6]], 22, 'gravel');
  // shops on the approach
  ctx.add(nat.shopRow(34, 1), -10, 112);
  ctx.add(nat.shopRow(34, -1), 10, 112);
  ctx.add(arch.torii({ style: 'myojin', tone: 'stone', h: 8, plaque: '天満宮' }), 0, 92);
  ctx.add(arch.torii({ style: 'myojin', tone: 'stone', h: 7.4 }), 0, 80);

  // the three bridges
  ctx.add(archA, 0, 67.5, 0, 0.4 - ctx.ground(0, 67.5));
  const flat = arch.flatBridge(5, 4.6, 'darkWood', 'vermilion');
  ctx.add(flat, 0, 60.5, 0, 0.95 - 0.78 - ctx.ground(0, 60.5));
  ctx.add(archB, 0, 53.5, 0, 0.4 - ctx.ground(0, 53.5));

  // Rōmon and honden
  ctx.add(arch.gate({ w: 16, d: 7, h: 5.6, stories: 2, pillar: 'vermilion', wall: 'plaster', roofTone: 'bark', bracket: 'vermilion' }), 0, 32);
  const honden = arch.hall({
    w: 20, d: 12, wallH: 5, podium: 1.0, pillar: 'vermilion', wall: 'plaster', front: 'lattice', railing: 'vermilion',
    roof: { kind: 'irimoya', tone: 'bark', h: 7.2, gableTone: 'gold' }, overhang: 2.6, bracket: 'gold',
  });
  ctx.add(honden, 0, -2);
  offering(ctx, 0, 5.8, honden.userData.floorY - 0.3, 'shrine');
  // Tobiume (right) and Kōbai red plum (left) in front of the honden
  ctx.scene.add(nat.forest('plum', [[11, 8, 1.5], [-11, 8, 1.4]], [1.4, 1.5], ctx.ground));
  [[-5, 28, 0.3], [6, 40, -0.4], [-4, 86, 0.2], [5, 100, -0.3]].forEach(([x, z, r]) => ctx.add(nat.figure('ox'), x, z, r));
  lanternRow(ctx, 26, 12, 8.5, 7, 2.6);

  ritualSet(ctx, { temizuya: [-12, 40, 0.5], ema: [14, 18, -0.6], omikuji: [-14, 18, 0.6] });

  // plum groves, camphors, Mt. Hōman
  const clear = (x: number, z: number) => (Math.abs(x) < 12 && z > -10) || pond(x, z) || (Math.abs(x) < 24 && z > -16 && z < 44);
  ctx.scene.add(nat.forest('plum', nat.scatter(90, { x0: -70, x1: 70, z0: -40, z1: 100 }, clear, 5), [0.9, 1.3], ctx.ground));
  ctx.scene.add(nat.forest('camphor', nat.scatter(30, { x0: -110, x1: 110, z0: -120, z1: 20 }, clear, 9), [0.9, 1.2], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(80, { x0: -140, x1: 140, z0: -160, z1: 150 }, (x, z) => clear(x, z) || (Math.abs(x) < 70 && z > -40 && z < 100), 17), [1, 1.5], ctx.ground));
  const mt = nat.mountain(120, 70, 0x3d5733, 2);
  mt.position.set(-40, 0, -200);
  ctx.scene.add(mt);

  return {
    spawn: { x: 0, z: 124, rotY: 0 },
    bounds: { x0: -30, x1: 30, z0: -12, z1: 128 },
    walkable: (x, z) => (pond(x, z) ? Math.abs(x) < 1.9 && z > 46 && z < 74 : true) && !(z > 95 && z < 129 && Math.abs(x) > 6.8),
    anchors: {
      torii: { at: [0, 78], look: [0, 60] },
      temizuya: { at: [-8.5, 40], look: [-12, 40] },
      haiden: { at: [0, 12], look: [0, -2] },
      ema: { at: [11, 17], look: [14, 18] },
      omikuji: { at: [-11, 17], look: [-14, 18] },
    },
    particles: 'plum',
    fog: 0.8,
    orbit: { x: 0, z: 24, r: 44, y: 18 },
  };
};
