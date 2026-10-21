import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { offering, ritualSet } from './common';

import { unemeGhost } from '../encounters/legends';
/**
 * Tōdai-ji, Nara.
 * Deer greet you on the approach to the Nandaimon, the colossal two-storey unpainted gate guarded by
 * 8 m Niō. The vermilion Chūmon and corridor enclose a gravel court; in front of the Daibutsuden stands
 * the octagonal bronze lantern (8th c.). The Daibutsuden — long the world's largest wooden building —
 * has a double roof, golden shibi on the ridge, and the arched window that frames the Buddha's face.
 * Inside sits the 15 m bronze Vairocana on a lotus, with a golden halo.
 */
export const todaiji: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const pond = (x: number, z: number) => ((x + 40) / 16) ** 2 + ((z - 56) / 10) ** 2 < 1;
  const POD = 1.6; // the Daibutsuden's stone platform, reached by steps
  const onPod = (x: number, z: number) => Math.abs(x) < 23 && z <= -17.4 && z > -55;
  ctx.setGround((x, z) => (onPod(x, z) ? POD : Math.abs(x) < 6 && z < -14.8 && z > -17.4 ? ramp(z, -14.8, -17.4, 0, POD) : pond(x, z) ? -1.2 : Math.max(0, Math.abs(x) - 52) * 0.2 + (Math.abs(x) > 56 || z < -64 ? hills(x, z, 1.5) : 0) + (z < -64 ? (-64 - z) * 0.3 : 0)));
  ctx.terrain(0x52683d);
  ctx.water(-0.3, 34, 22, -40, 56, 0x466f5f);
  ctx.path([[0, 120], [0, 34]], 9, 'paving');
  ctx.path([[0, 30], [0, -12]], 70, 'gravel');

  // Nandaimon
  ctx.add(arch.gate({ w: 24, d: 11, h: 9, stories: 2, pillar: 'darkWood', wall: 'darkWood', roofTone: 'tile', nio: true, bracket: 'darkWood' }), 0, 84);

  // Chūmon and the corridor enclosure
  ctx.add(arch.gate({ w: 18, d: 8, h: 6.4, stories: 2, pillar: 'vermilion', wall: 'plaster', roofTone: 'tile' }), 0, 34);
  const corr = (len: number, x: number, z: number, r: number) => ctx.add(arch.corridor(len, { w: 4.4, h: 3.8, pillar: 'vermilion', roofTone: 'tile' }), x, z, r);
  corr(26, -23, 34, Math.PI / 2);
  corr(26, 23, 34, Math.PI / 2);
  corr(96, -37, -14, 0);
  corr(96, 37, -14, 0);

  // Daibutsuden: hollow so the Great Buddha is visible through the doors
  const hall = arch.hall({
    w: 44, d: 34, wallH: 13, podium: 1.6, pillar: 'darkWood', wall: 'plaster', railing: 'darkWood',
    roof: { kind: 'irimoya', tone: 'tile', h: 15, curve: 1.6 }, overhang: 4, mokoshi: true, hollow: { door: 9 }, bracket: 'darkWood',
  });
  ctx.add(hall, 0, -36, 0, -POD);
  const ridgeY = hall.userData.ridgeY as number;
  [-1, 1].forEach((s) => {
    const shibi = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 1.0), m.wood.gold);
    b.rotation.z = s * -0.25;
    shibi.add(b);
    const fin = new THREE.Mesh(new THREE.ConeGeometry(0.8, 2.2, 6), m.wood.gold);
    fin.position.set(s * 0.6, 1.4, 0);
    fin.rotation.z = s * 0.8;
    shibi.add(fin);
    ctx.add(shibi, s * 16.5, -36, 0, ridgeY + 1.6 - POD);
  });
  // karahafu arched window (kangen-mado) in the front eave
  const kangen = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 1.2, 24, 1, false, 0, Math.PI), m.wood.darkWood);
  kangen.rotation.set(Math.PI / 2, 0, -Math.PI / 2);
  ctx.add(kangen, 0, -17.6, 0, hall.userData.eaveY - 0.6 - POD);
  // the Great Buddha inside, with halo
  ctx.add(nat.buddha(15, 'bronze', true), 0, -42, 0, hall.userData.floorY - POD);
  // octagonal bronze lantern in front
  ctx.add(arch.bronzeLantern(4.8), 0, 4);
  ctx.scene.add(arch.stairs({ w: 12, z0: -14.8, z1: -17.4, y0: 0, y1: 1.6 }));
  offering(ctx, 0, -18.4, 0, 'temple');

  ritualSet(ctx, { temizuya: [-14, 24, 0.4], ema: [14, 18, -0.4], omikuji: [-14, 14, 0.4] });

  // Deer! On the approach and in the court
  const deer = [[-6, 108, 0.4], [5, 102, 2.6], [-3, 96, 1.2], [8, 92, 3.8], [-9, 70, 0.2], [6, 64, 2.2], [-4, 50, 4], [12, 6, 1], [-16, 2, 2.8], [3, 112, 5]].map(([x, z, r]) =>
    ctx.add(nat.figure('deer'), x, z, r)
  );
  // when you bow, nearby deer turn to you and bow back
  let deerBow = -1;
  const deerYaw = deer.map((d) => d.rotation.y);
  nat.animated.push({
    update: (t) => {
      if (deerBow < 0) {
        deerBow = Number.NaN;
        return;
      }
      if (Number.isNaN(deerBow)) return;
      const k = t - deerBow;
      deer.forEach((d, i) => {
        if (d.position.z < 40) return;
        d.rotation.y = deerYaw[i] + (Math.PI - deerYaw[i] - (d.position.x > 0 ? 0.3 : -0.3)) * Math.min(1, k / 0.8);
        d.rotation.x = k > 0.8 && k < 2.4 ? Math.sin(((k - 0.8) / 1.6) * Math.PI * 2) * 0.25 : 0;
      });
      if (k > 2.6) deerBow = Number.NaN;
    },
  });
  const startDeerBow = () => (deerBow = performance.now() / 1000);

  const clear = (x: number, z: number) => (Math.abs(x) < 14 && z > 34) || (Math.abs(x) < 42 && z < 40 && z > -62) || pond(x, z);
  ctx.scene.add(nat.forest('pine', nat.scatter(40, { x0: -80, x1: 80, z0: 40, z1: 130 }, clear, 3), [1, 1.4], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(120, { x0: -150, x1: 150, z0: -150, z1: 140 }, clear, 15), [1, 1.5], ctx.ground));
  ctx.scene.add(nat.forest('maple', nat.scatter(26, { x0: -70, x1: 70, z0: 40, z1: 120 }, clear, 27), [0.9, 1.2], ctx.ground));
  const mt = nat.mountain(130, 60, 0x587548, 9); // Wakakusa-yama, grassy
  mt.position.set(60, 0, -190);
  ctx.scene.add(mt);

  // the pillar with a hole the size of the Buddha's nostril (hashira-kuguri)
  const pil = new THREE.Group();
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 12.4, 16), m.wood.darkWood);
  top.position.y = 0.6 + 6.2;
  pil.add(top);
  [-1, 1].forEach((s) => {
    const side = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.6, 1.4), m.wood.darkWood);
    side.position.set(s * 0.5, 0.3, 0);
    pil.add(side);
  });
  ctx.add(pil, 10, -46, 0, POD);

  return {
    encounters: [unemeGhost({ zone: (x, z) => pond(x, z), exit: { x: -27, z: 42, rotY: Math.atan2(13, -14) } })],
    secrets: [
      {
        id: 'nara-deer-bow',
        at: [0, 100],
        r: 14,
        trigger: 'bow',
        luck: 3,
        onFound: () => startDeerBow(),
        card: {
          title: 'The bowing deer of Nara',
          jp: '奈良の鹿',
          body: [
            'More than a thousand deer roam freely around Tōdai-ji and Nara Park. They are protected as a National Natural Monument and are traditionally seen as messengers of the gods of nearby Kasuga Taisha.',
            'Bow to a deer and it will often bow back. Partly that is good manners, and partly it has learned that bowing gets rice crackers (shika-senbei).',
          ],
          ending: 'You bow. The deer looks at you thoughtfully, and bows back.',
        },
      },
      {
        id: 'todaiji-pillar',
        at: [10, -46],
        r: 0.9,
        trigger: 'enter',
        hint: 'One pillar behind the Buddha has a small square hole at its base…',
        luck: 3,
        card: {
          title: 'Hashira-kuguri: through the Buddha\'s nostril',
          jp: '柱くぐり',
          body: [
            "One of the great hall's pillars has a hole at its base the same size as one of the Great Buddha's nostrils, about 30 by 37 centimetres.",
            'Squeeze through it, and you are promised enlightenment in your next life, or at least good luck for the year. Children slip through easily, and adults get stuck to everyone\'s amusement.',
          ],
          ending: 'Some wriggling, some laughter, and you are through.',
        },
      },
    ],
    etiquette: {
      forbidden: [{ test: (x, z) => Math.hypot(x, z + 42) < 7.8, reason: 'Please don\'t climb on the Great Buddha.' }],
    },
    spawn: { x: 0, z: 118, rotY: 0 },
    bounds: { x0: -34, x1: 34, z0: -52, z1: 122 },
    walkable: (x, z) =>
      !pond(x, z) &&
      !(z < -18.4 && z > -19.8 && Math.abs(x) > 4.4) && // front wall, doorway open
      !(z <= -19.8 && (Math.abs(x) > 20.6 || z < -51.5)) && // inside the hall only
 !(z > 31 && z < 37 && Math.abs(x) > 9 && Math.abs(x) < 36),
    anchors: {
      torii: { at: [0, 92], look: [0, 84] },
      temizuya: { at: [-10.5, 24], look: [-14, 24] },
      haiden: { at: [0, -10], look: [0, -36] },
      ema: { at: [11, 18], look: [14, 18] },
      omikuji: { at: [-11, 14], look: [-14, 14] },
    },
    particles: 'none',
    fog: 0.75,
    orbit: { x: 0, z: -20, r: 58, y: 26 },
  };
};
