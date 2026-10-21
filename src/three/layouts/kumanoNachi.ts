import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { offering, ritualSet } from './common';

import { fudoFalls } from '../encounters/legends';
/**
 * Kumano Nachi Taisha & Seiganto-ji, Wakayama.
 * Up hundreds of mossy stone steps through the forest to the vermilion Kumano-style shrine halls, the
 * giant camphor, and the Buddhist temple Seiganto-ji right beside them (shrine and temple were one until
 * 1868). The three-legged crow Yatagarasu, Kumano's messenger, guards the way. Beyond, the classic view:
 * the vermilion three-storey pagoda in front of Nachi-no-Taki, Japan's tallest single-drop waterfall
 * (133 m), itself worshipped as a god. A trail leads down to the falls and the Hirō shrine torii.
 */
export const kumanoNachi: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const PLAT = 18, TER = 17, VAL = -10;
  const A: [number, number] = [32, -32], B: [number, number] = [62, -112];
  const trailT = (x: number, z: number) => {
    const dx = B[0] - A[0], dz = B[1] - A[1];
    const t = Math.max(0, Math.min(1, ((x - A[0]) * dx + (z - A[1]) * dz) / (dx * dx + dz * dz)));
    const d = Math.hypot(x - (A[0] + dx * t), z - (A[1] + dz * t));
    return { t, d };
  };
  const onStairs = (x: number, z: number) => Math.abs(x) < 5 && z >= 60 && z < 116;
  const onPlat = (x: number, z: number) => x > -36 && x < 26 && z > -14 && z < 60;
  const onTer = (x: number, z: number) => x > 12 && x < 50 && z > -36 && z <= 10;
  ctx.setGround((x, z) => {
    if (onStairs(x, z)) return z > 86 ? ramp(z, 116, 86, 0, 9) : z > 80 ? 9 : ramp(z, 80, 60, 9, PLAT);
    if (onPlat(x, z)) return PLAT;
    if (x > 6 && x < 26 && z > -14 && z <= -6) return ramp(z, -6, -14, PLAT, TER);
    if (onTer(x, z)) return TER;
    const tr = trailT(x, z);
    const trailY = TER + (VAL + 0.4 - TER) * tr.t;
    if (tr.d < 3.2) return trailY;
    // the gorge: falls away from the precinct toward the plunge pool, sides rising gently
    if (x > 20 && z < -30) {
      const pool = Math.hypot(x - 66, z + 128) < 24 ? VAL : Infinity;
      return Math.min(pool, trailY + Math.min(4, Math.max(0, tr.d - 3.2) * 0.3) + hills(x, z, 0.6));
    }
    // a soft rim just below the precinct level, so nothing rises in front of the views
    if (x > -44 && x < 48 && z > -44 && z < 60) return PLAT - 0.6 - Math.max(0, x - 26) * 0.12;
    // forested mountainside
    const base = z > 60 ? ramp(z, 116, 60, 0, PLAT) : PLAT;
    return base + Math.max(0, Math.abs(x) - 40) * 0.3 + hills(x, z, 2);
  });
  ctx.terrain(0x34492b, 520, 200);

  // stone stairs
  ctx.scene.add(arch.stairs({ w: 8, z0: 116, z1: 86, y0: 0, y1: 9 }));
  ctx.path([[0, 86], [0, 80]], 8, 'paving');
  ctx.scene.add(arch.stairs({ w: 8, z0: 80, z1: 60, y0: 9, y1: PLAT }));
  ctx.add(arch.torii({ style: 'myojin', tone: 'vermilion', h: 8, plaque: '熊野那智大社' }), 0, 57);
  // Yatagarasu, the three-legged crow
  const crow = new THREE.Group();
  const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), m.granite);
  stone.position.y = 0.6;
  crow.add(stone);
  const crowMat = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.5 });
  const cb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), crowMat);
  cb.scale.set(0.8, 0.9, 1.3);
  cb.position.y = 1.9;
  crow.add(cb);
  const ch = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), crowMat);
  ch.position.set(0, 2.35, 0.42);
  crow.add(ch);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.32, 6), crowMat);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 2.33, 0.72);
  crow.add(beak);
  [-0.16, 0, 0.16].forEach((x) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 4), crowMat);
    leg.position.set(x, 1.45, 0.05);
    crow.add(leg);
  });
  ctx.add(crow, 5.5, 55, -0.4);

  // Kumano-zukuri halls in a row, and the Reikō-den worship hall
  for (let k = 0; k < 5; k++) {
    const h = arch.hall({ w: 5, d: 6, wallH: 3.2, podium: 0.8, pillar: 'vermilion', wall: 'plaster', front: 'lattice', veranda: false, roof: { kind: 'nagare', tone: 'bark', h: 3.4, gableTone: 'vermilion' }, overhang: 1.2, bracket: 'vermilion' });
    ctx.add(h, -28 + k * 6.2, -6);
  }
  const reiko = arch.hall({ w: 20, d: 7, wallH: 3.6, podium: 0.6, pillar: 'vermilion', wall: 'plaster', front: 'open', railing: 'vermilion', roof: { kind: 'irimoya', tone: 'bark', h: 3.8, gableTone: 'vermilion' }, overhang: 1.8, bracket: 'vermilion' });
  ctx.add(reiko, -16, 10);
  offering(ctx, -16, 15.2, 0.6, 'shrine');
  ctx.scene.add(nat.forest('camphor', [[-32, 26, 1.5]], [1.5, 1.5], ctx.ground));

  // Seiganto-ji
  const sg = arch.hall({ w: 16, d: 12, wallH: 4.8, podium: 0.8, pillar: 'darkWood', wall: 'darkWood', front: 'lattice', railing: 'darkWood', roof: { kind: 'irimoya', tone: 'bark', h: 6, gableTone: 'darkWood' }, overhang: 2.2 });
  ctx.add(sg, 14, 22, -Math.PI / 2);

  // three-storey pagoda on its terrace, and the falls beyond
  ctx.add(arch.pagoda({ stories: 3, w: 7, storyH: 3.8, tone: 'vermilion', roofTone: 'darkCopper' }), 22, -30);
  const fallsRot = Math.atan2(28 - 70, -24 + 140);
  const falls = nat.waterfall(104, 9);
  falls.position.set(70, VAL, -140);
  falls.rotation.y = fallsRot;
  ctx.scene.add(falls);
  ctx.add(arch.torii({ style: 'myojin', tone: 'vermilion', h: 6 }), B[0] - 1, B[1] + 4, fallsRot);
  ctx.add(arch.shimenawa(10, 0.35), 70 + Math.sin(fallsRot) * 2, -140 + Math.cos(fallsRot) * 2, fallsRot, 0);

  ritualSet(ctx, { temizuya: [9, 52, -0.4], ema: [-32, 6, 0.6], omikuji: [4, 4, -0.6] });

  // mountains and forest
  const clear = (x: number, z: number) => onStairs(x, z) || onPlat(x, z) || onTer(x, z) || trailT(x, z).d < 6 || Math.abs(x) < 8 && z > 56 || Math.hypot(x - 66, z + 128) < 22 || (() => { const t = Math.max(0, Math.min(1, ((x - 38) * 32 + (z + 11) * -129) / (32 * 32 + 129 * 129))); return Math.hypot(x - (38 + 32 * t), z - (-11 - 129 * t)) < 14; })();
  ctx.scene.add(nat.forest('cedar', nat.scatter(260, { x0: -160, x1: 170, z0: -230, z1: 170 }, clear, 7), [1.1, 1.6], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(140, { x0: -160, x1: 170, z0: -230, z1: 170 }, clear, 31), [1, 1.5], ctx.ground));
  [[90, -340, 180, 200], [-120, -200, 120, 110], [230, -150, 110, 120]].forEach(([x, z, r, h], i) => {
    const mt = nat.mountain(r, h, 0x2f472b, i + 4);
    mt.position.set(x, VAL, z);
    ctx.scene.add(mt);
  });

  const poolC: [number, number] = [70 + Math.sin(fallsRot) * 12.6, -140 + Math.cos(fallsRot) * 12.6];
  return {
    encounters: [fudoFalls({ zone: (x, z) => Math.hypot(x - poolC[0], z - poolC[1]) < 14, exit: { x: 62, z: -112, rotY: Math.atan2(-(poolC[0] - 62), -(poolC[1] + 112)) } })],
    secrets: [
      {
        id: 'nachi-yatagarasu',
        at: [5.5, 55],
        r: 2.2,
        trigger: 'linger',
        seconds: 2.5,
        hint: 'A black crow on a stone… does it have three legs?',
        luck: 3,
        card: {
          title: 'Yatagarasu, the three-legged crow',
          jp: '八咫烏',
          body: [
            'In the Kojiki, the gods sent a great crow, Yatagarasu, to guide the legendary first emperor, Jimmu, through the trackless Kumano mountains to Yamato.',
            "The crow became Kumano's messenger and a symbol of guidance. Today it is also the emblem of the Japan Football Association, guiding the ball to the goal.",
          ],
          ending: 'The crow stares back with its head cocked, as if to say: this way.',
        },
      },
    ],
    etiquette: {
      centerLines: [[0, 116, 0, 60]],
      forbidden: [{ test: (x, z) => x > -31.5 && x < 0.5 && z > -10 && z < -1.5, reason: 'These are the halls of the Kumano gods. Please pray from the worship hall in front.' }],
    },
    // the classic view: pagoda on the left, the falls rising behind on the right
    spawn: { x: 46, z: 6, rotY: Math.atan2(-(16 - 46), -(-100 - 6)) },
    bounds: { x0: -36, x1: 72, z0: -124, z1: 116 },
    walkable: (x, z) => onStairs(x, z) || onPlat(x, z) || onTer(x, z) || (x > 6 && x < 26 && z > -14 && z <= -6) || (trailT(x, z).d < 3 && Math.hypot(x - poolC[0], z - poolC[1]) > 14),
    anchors: {
      torii: { at: [18, -8], look: [62, -126] },
      temizuya: { at: [6, 52], look: [9, 52] },
      haiden: { at: [-16, 24], look: [-16, 10] },
      ema: { at: [-29, 8], look: [-32, 6] },
      omikuji: { at: [1, 6], look: [4, 4] },
    },
    particles: 'none',
    fog: 0.38,
    orbit: { x: 20, z: -20, r: 60, y: 28 },
  };
};
