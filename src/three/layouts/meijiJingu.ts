import * as THREE from 'three';
import type { Layout } from './types';
import { hills } from './types';
import { offering, ritualSet } from './common';

/**
 * Meiji Jingū, Tokyo.
 * A wide gravel sandō through a man-made forest of 100,000 trees. Unpainted cypress torii (the Ōtorii
 * is Japan's largest wooden myōjin torii), a wall of decorated sake barrels, the Minami Shinmon gate
 * with copper roof, and a square inner court enclosed by corridors, with the twin camphor trees
 * (Meoto Kusu) in front of the copper-roofed, unpainted cypress shrine.
 */
export const meijiJingu: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  // centre line of the gently bending sandō: x=-10 at the entrance, -4 at the first torii, straight from z=60
  const pathX = (z: number) => (z > 80 ? -4 - ((z - 80) / 32) * 6 : z > 60 ? (-4 * (z - 60)) / 20 : 0);
  ctx.setGround((x, z) => {
    const inPath = Math.abs(x - pathX(z)) < 9 && z > 4;
    const inCourt = Math.abs(x) < 28 && z < 10 && z > -48;
    return inPath || inCourt ? 0 : Math.max(0, hills(x, z, 0.9, 0.05));
  });
  ctx.terrain(0x34482b);

  ctx.path([[-10, 112], [-4, 80], [0, 60], [0, 4]], 12, 'gravel');
  ctx.path([[0, 6], [0, -40]], 48, 'gravel');

  // Torii: unpainted cypress
  ctx.add(arch.torii({ style: 'myojin', tone: 'cypress', h: 10 }), -4, 82, Math.atan2(6, 30));
  ctx.add(arch.torii({ style: 'myojin', tone: 'cypress', h: 12.5, span: 9.5, plaque: '明治神宮' }), 0, 28);

  // Wall of sake barrels (kazaridaru) facing the path
  const sake = nat.barrels(10, 3);
  ctx.add(sake, 9.5, 44, -Math.PI / 2);
  const wine = nat.barrels(8, 3);
  ctx.add(wine, -9.5, 46, Math.PI / 2);

  // Temizuya
  ritualSet(ctx, { temizuya: [-11, 16, Math.PI / 2] });

  // Minami Shinmon (south gate) with copper roof, and the corridor square
  ctx.add(arch.gate({ w: 13, d: 6, h: 5.2, stories: 1, pillar: 'cypress', wall: 'cypress', roofTone: 'copper', bracket: 'cypress' }), 0, 8);
  const corr = (len: number, x: number, z: number, rot: number) =>
    ctx.add(arch.corridor(len, { w: 3.6, h: 3.4, pillar: 'cypress', roofTone: 'copper' }), x, z, rot);
  corr(19, -17, 8, Math.PI / 2);
  corr(19, 17, 8, Math.PI / 2);
  corr(54, -26.5, -19, 0);
  corr(54, 26.5, -19, 0);
  corr(53, 0, -46, Math.PI / 2);

  // Meoto Kusu: twin camphor trees, each in a low fence
  [-14, 14].forEach((x) => {
    ctx.scene.add(nat.forest('camphor', [[x, -8, 1]]));
    const f = new THREE.Group();
    [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((r) => {
      const side = arch.fence(5, 0.9, 'cypress');
      side.position.set(Math.sin(r) * 2.5, 0, Math.cos(r) * 2.5);
      side.rotation.y = r;
      f.add(side);
    });
    ctx.add(f, x, -8);
  });

  // Main shrine: unpainted cypress, flowing copper roof
  const haiden = arch.hall({
    w: 24, d: 10, wallH: 5, podium: 1.0, pillar: 'cypress', wall: 'cypress', front: 'doors', railing: 'cypress',
    roof: { kind: 'nagare', tone: 'copper', h: 6, gableTone: 'cypress' }, overhang: 2.8, bracket: 'cypress',
  });
  ctx.add(haiden, 0, -32);
  offering(ctx, 0, -24.5, haiden.userData.floorY - 0.3, 'shrine');
  // white curtain with the imperial chrysanthemum
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.2), m.paper);
  ctx.add(curtain, 0, -26.8, 0, haiden.userData.floorY + 3.6);

  ritualSet(ctx, { ema: [17, -20, -0.5], omikuji: [-17, -20, 0.5] });

  // The forest
  const clear = (x: number, z: number) => (Math.abs(x - pathX(z)) < 12 && z > 0) || (Math.abs(x) < 32 && z < 14 && z > -52);
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(230, { x0: -110, x1: 110, z0: -120, z1: 150 }, clear, 3), [0.9, 1.5], ctx.ground));
  ctx.scene.add(nat.forest('cedar', nat.scatter(90, { x0: -110, x1: 110, z0: -120, z1: 150 }, clear, 17), [0.9, 1.3], ctx.ground));
  ctx.scene.add(nat.forest('camphor', nat.scatter(24, { x0: -60, x1: 60, z0: -80, z1: 130 }, clear, 29), [0.8, 1.0], ctx.ground));

  // Kiyomasa's Well, down a little side path into the forest
  ctx.path([[-7, 40], [-21, 40]], 2.6, 'gravel');
  const well = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.3, 0.6, 20, 1, true), m.granite);
  rim.material = m.granite.clone();
  (rim.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
  rim.position.y = 0.3;
  well.add(rim);
  const wwater = new THREE.Mesh(new THREE.CircleGeometry(1.15, 20), new THREE.MeshStandardMaterial({ color: 0x3f7f86, roughness: 0.2 }));
  wwater.rotation.x = -Math.PI / 2;
  wwater.position.y = 0.4;
  well.add(wwater);
  ctx.add(well, -22, 40);
  const post = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.6, 0.6), m.wood.cypress);
  ctx.add(post, -8, 42, 0, 0.8);

  return {
    secrets: [
      {
        id: 'meiji-kiyomasa',
        at: [-20, 40],
        r: 2.6,
        trigger: 'linger',
        seconds: 3,
        luck: 3,
        card: {
          title: "Kiyomasa's Well",
          jp: '清正井',
          body: [
            "Hidden in the shrine's inner garden is a spring said to have been dug by the samurai general Katō Kiyomasa in the early 1600s, when the land was a daimyō's estate.",
            'Clear water wells up all year round at about 15 °C, around 60 litres a minute, and the well has become one of Tokyo\'s best-known "power spots".',
            'The whole forest around you was planted by hand: about 100,000 trees donated from all over Japan in 1920, designed to grow into a self-sustaining wood.',
          ],
          ending: 'You watch the spring trembling up through the sand, and feel oddly calm.',
        },
      },
    ],
    etiquette: {
      centerLines: [[-10, 112, -4, 80], [-4, 80, 0, 60], [0, 60, 0, -8]],
      forbidden: [{ test: (x, z) => Math.abs(x) < 13 && z < -25 && z > -38, reason: 'The main hall is for the kami and priests. Please pray from in front.' }],
    },
    spawn: { x: -9.5, z: 108, rotY: -Math.atan2(6, 30) },
    bounds: { x0: -26, x1: 26, z0: -44, z1: 114 },
    walkable: (x, z) => (Math.abs(x - pathX(z)) < 7.5 && z > 6) || (Math.abs(x) < 24.5 && z <= 10 && z > -42) || (x > -15 && x < -6 && z > 10 && z < 22) || (x > -22 && x < -6 && Math.abs(z - 40) < 1.6),
    anchors: {
      torii: { at: [-3, 72], look: [0, 28] },
      temizuya: { at: [-7.5, 16], look: [-11, 16] },
      'spot-sando': { at: [0, 56], look: [0, 28] },
      haiden: { at: [0, -12], look: [0, -32] },
      ema: { at: [13, -18], look: [17, -20] },
      omikuji: { at: [-13, -18], look: [-17, -20] },
    },
    particles: 'none',
    fog: 1.1,
    orbit: { x: 0, z: -14, r: 40, y: 16 },
  };
};
