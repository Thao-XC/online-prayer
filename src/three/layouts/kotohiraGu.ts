import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { offering, ritualSet } from './common';

/**
 * Kotohira-gū (Konpira-san), Kagawa.
 * The famous 785 stone steps up Mt. Zōzu: first between souvenir shops, then through the big Ōmon gate,
 * past the ornate Asahi-sha, and finally up to the Hongū, where the view opens over the Sanuki plain
 * to the perfect cone of Sanuki-Fuji. Shrine of sailors: the ema hall is full of ship paintings, and a
 * "Konpira dog" statue recalls the dogs once sent on pilgrimage on their owners' behalf.
 */
type Seg = { z0: number; z1: number; y0: number; y1: number; w: number };
export const kotohiraGu: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  // flights (rising toward -z) and landings
  const segs: Seg[] = [
    { z0: 126, z1: 96, y0: 0, y1: 6, w: 6 }, // shop street, gentle steps
    { z0: 96, z1: 86, y0: 6, y1: 12, w: 8 }, // first flight
    { z0: 86, z1: 72, y0: 12, y1: 12, w: 26 }, // Ōmon landing
    { z0: 72, z1: 46, y0: 12, y1: 24, w: 7 }, // second flight
    { z0: 46, z1: 28, y0: 24, y1: 24, w: 36 }, // Asahi-sha landing
    { z0: 28, z1: 6, y0: 24, y1: 36, w: 7 }, // final flight
    { z0: 6, z1: -34, y0: 36, y1: 36, w: 50 }, // summit (Hongū)
  ];
  const seg = (z: number) => segs.find((s) => z <= s.z0 && z > s.z1);
  const pathY = (z: number) => {
    const s = seg(z);
    if (s) return ramp(z, s.z0, s.z1, s.y0, s.y1);
    return z > 126 ? 0 : 36;
  };
  ctx.setGround((x, z) => {
    const s = seg(z);
    const y = pathY(z);
    const half = s ? s.w / 2 : 25;
    // mountain flanks rise away from the stairway; the summit falls away to the plain beyond
    let extra = Math.max(0, Math.abs(x) - half) * 0.45 + (Math.abs(x) > half + 4 ? hills(x, z, 1.6) : 0);
    if (z < -34) extra = -(-34 - z) * 0.9;
    return y + extra;
  });
  ctx.terrain(0x3f5733, 460, 190);

  segs.forEach((s) => {
    if (s.y0 === s.y1) ctx.path([[0, s.z0], [0, s.z1]], s.w * 0.9, 'paving');
    else ctx.scene.add(arch.stairs({ w: s.w, z0: s.z0, z1: s.z1, y0: s.y0, y1: s.y1 }));
  });

  // souvenir shops along the lower steps
  for (let z = 122; z > 98; z -= 4.2) {
    ctx.add(nat.shopRow(4.2, 1), -7.5, z);
    ctx.add(nat.shopRow(4.2, -1), 7.5, z);
  }
  ctx.add(nat.figure('dog', m.wood.gold), 5.5, 84, -0.5);

  // Ōmon (unpainted, tiled)
  ctx.add(arch.gate({ w: 12, d: 6, h: 5.4, stories: 1, pillar: 'darkWood', wall: 'darkWood', roofTone: 'tile', plaque: '琴平山' }), 0, 78);
  ritualSet(ctx, { temizuya: [10, 80, -0.5] });

  // Asahi-sha: ornate unpainted hall with copper roof
  const asahi = arch.hall({ w: 16, d: 12, wallH: 5, podium: 1, pillar: 'cypress', wall: 'cypress', front: 'lattice', railing: 'cypress', roof: { kind: 'irimoya', tone: 'copper', h: 6.6, gableTone: 'cypress' }, overhang: 2.4, bracket: 'gold', mokoshi: true });
  ctx.add(asahi, -12, 36, Math.PI / 2);

  // Hongū on the summit, with the ema hall and a view platform
  const hongu = arch.hall({ w: 18, d: 10, wallH: 4.8, podium: 1, pillar: 'cypress', wall: 'cypress', front: 'doors', railing: 'cypress', roof: { kind: 'nagare', tone: 'bark', h: 5.8, gableTone: 'cypress' }, overhang: 2.4, bracket: 'gold' });
  ctx.add(hongu, 0, -16);
  offering(ctx, 0, -9.6, hongu.userData.floorY - 0.3, 'shrine');
  const emaHall = arch.hall({ w: 12, d: 6, wallH: 3.4, podium: 0.4, pillar: 'darkWood', wall: 'darkWood', front: 'open', veranda: false, roof: { kind: 'gable', tone: 'tile', h: 2.6, gableTone: 'darkWood' }, overhang: 1.4 });
  ctx.add(emaHall, 18, -6, -Math.PI / 2);
  // ship-painting ema on its back wall
  for (let k = 0; k < 6; k++) {
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1), new THREE.MeshStandardMaterial({ color: [0x2c5a8a, 0xd8c9a0, 0x7a3b2a][k % 3], roughness: 0.8 }));
    ctx.add(pic, 20.4, -8.5 + k * 1.0, -Math.PI / 2, 2.8);
  }
  ctx.add(ctx.builder.buildEmaRack(), 14, -4, -1.2);
  ritualSet(ctx, { omikuji: [-14, -4, 1.2] });
  const rail = arch.fence(30, 1.1, 'darkWood');
  ctx.add(rail, 0, -33);

  // forest on Mt. Zōzu, and Sanuki-Fuji out on the plain
  const clear = (x: number, z: number) => {
    const s = seg(z);
    return (s ? Math.abs(x) < s.w / 2 + 3 : Math.abs(x) < 26) && z > -36;
  };
  ctx.scene.add(nat.forest('camphor', nat.scatter(60, { x0: -110, x1: 110, z0: -40, z1: 150 }, clear, 3), [0.8, 1.1], ctx.ground));
  ctx.scene.add(nat.forest('cedar', nat.scatter(150, { x0: -130, x1: 130, z0: -40, z1: 160 }, clear, 11), [1, 1.4], ctx.ground));
  ctx.scene.add(nat.forest('sakura', [[-9, 90], [9, 92], [-14, 44], [16, 40]], [1, 1.2], ctx.ground));
  const fuji = nat.mountain(60, 70, 0x4d6a42, 1);
  fuji.scale.set(1, 1, 1);
  fuji.position.set(70, -50, -300);
  ctx.scene.add(fuji);

  return {
    secrets: [
      {
        id: 'kotohira-dog',
        at: [5.5, 84],
        r: 2.2,
        trigger: 'linger',
        seconds: 2.5,
        hint: 'A little dog statue with a pouch around its neck…',
        luck: 3,
        card: {
          title: 'Konpira-inu, the pilgrim dogs',
          jp: 'こんぴら狗',
          body: [
            'In the Edo period a pilgrimage to Konpira was the trip of a lifetime. Those who could not make it sometimes sent their dog instead, with a pouch of money and a note round its neck saying "Going to Konpira".',
            'Travellers along the road fed the dog and passed it on until it reached the shrine, received a charm, and was guided all the way home.',
          ],
          ending: 'You pat the bronze dog on the head. It has come a long way.',
        },
      },
      {
        id: 'kotohira-summit',
        at: [0, 2],
        r: 3,
        trigger: 'enter',
        luck: 2,
        card: {
          title: '785 steps',
          jp: '御本宮まで七百八十五段',
          body: [
            'From the foot of the mountain to the main shrine is 785 stone steps. Konpira-san is the guardian of sailors and the sea, and its ema hall is hung with paintings and models of ships.',
            'From the top you can look out over the Sanuki plain to Sanuki-Fuji, and on a clear day to the Seto Inland Sea.',
          ],
          ending: 'You made it to the top, out of breath and grinning.',
        },
      },
    ],
    etiquette: {
      forbidden: [{ test: (x, z) => Math.abs(x) < 10 && z < -9.5 && z > -22, reason: 'The main hall is for priests. Please pray from in front.' }],
    },
    spawn: { x: 0, z: 136, rotY: 0 },
    bounds: { x0: -26, x1: 26, z0: -33, z1: 140 },
    walkable: (x, z) => {
      const s = seg(z);
      return s ? Math.abs(x) < s.w / 2 - 0.5 : z > 126 ? Math.abs(x) < 3 : z > -33;
    },
    anchors: {
      torii: { at: [0, 84], look: [0, 78] },
      temizuya: { at: [7, 80], look: [10, 80] },
      haiden: { at: [0, -2], look: [0, -16] },
      ema: { at: [11, -2], look: [14, -4] },
      omikuji: { at: [-11, -2], look: [-14, -4] },
    },
    particles: 'none',
    fog: 0.55,
    orbit: { x: 0, z: 30, r: 60, y: 30 },
  };
};
