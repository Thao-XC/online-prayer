import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { offering, ritualSet } from './common';

import { seiryuDragon } from '../encounters/legends';
/**
 * Kiyomizu-dera, Kyoto (Higashiyama).
 * Up the shop-lined Kiyomizu-zaka slope to the vermilion Niōmon on its stone steps, past the Saimon and
 * the vermilion three-storey pagoda, to the Hondō whose famous wooden stage juts out over the valley on
 * a lattice of tall zelkova pillars (no nails). Below, the Otowa waterfall's three streams. Maples
 * everywhere, and Kyoto's rooftops in the distance.
 */
export const kiyomizudera: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const PLAT = 8, VAL = -6;
  const inStage = (x: number, z: number) => x <= -27 && x >= -45 && Math.abs(z) <= 14;
  const inOtowaPath = (x: number, z: number) => z > 24 && z < 36 && x < -20 && x > -46;
  ctx.setGround((x, z) => {
    if (inStage(x, z)) return PLAT;
    if (z >= 40) {
      const base = z > 50 ? ramp(z, 92, 50, 0, 6) : ramp(z, 50, 40, 6, PLAT);
      return base + Math.max(0, Math.abs(x) - 12) * 0.35;
    }
    if (inOtowaPath(x, z) && x > -40) return ramp(x, -20, -40, PLAT, VAL);
    if (x < -28) return VAL + Math.max(0, -90 - x) * 0.4 + hills(x, z, 0.6);
    return PLAT + Math.max(0, -26 - z) * 0.4 + Math.max(0, x - 30) * 0.3;
  });
  ctx.terrain(0x45583a, 460, 180);

  // Kiyomizu-zaka: shops stepping up the slope
  ctx.path([[0, 96], [0, 50]], 7, 'paving');
  for (let z = 88; z > 52; z -= 4.2) {
    ctx.add(nat.shopRow(4.2, 1), -9.5, z);
    ctx.add(nat.shopRow(4.2, -1), 9.5, z);
  }
  ctx.scene.add(arch.stairs({ w: 11, z0: 50, z1: 40.5, y0: 6, y1: PLAT }));

  // Niōmon, Saimon, three-storey pagoda
  ctx.add(arch.gate({ w: 13, d: 6, h: 5.4, stories: 2, pillar: 'vermilion', wall: 'plaster', roofTone: 'bark', nio: true }), 0, 36);
  ctx.add(arch.gate({ w: 9, d: 5, h: 4.4, stories: 1, pillar: 'vermilion', wall: 'plaster', roofTone: 'bark' }), 0, 22);
  ctx.add(arch.pagoda({ stories: 3, w: 6.5, storyH: 3.4, tone: 'vermilion', roofTone: 'bark' }), 14, 14);
  ctx.path([[0, 40], [0, 8], [-22, 2]], 6, 'paving');

  // Hondō facing west over the valley, and its stage on tall pillars
  const hondo = arch.hall({
    w: 26, d: 16, wallH: 6, podium: 0, pillar: 'darkWood', wall: 'darkWood', front: 'lattice', veranda: false,
    roof: { kind: 'irimoya', tone: 'bark', h: 11, gableTone: 'darkWood' }, overhang: 3.4,
  });
  ctx.add(hondo, -19.5, 0, -Math.PI / 2);
  const stage = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(18, 0.45, 28.5), m.wood.cypress);
  deck.position.set(-36, PLAT - 0.22, 0);
  stage.add(deck);
  const rail = (len: number, x: number, z: number, rot: number) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, 0.16), m.wood.darkWood);
    r.position.set(x, PLAT + 1.0, z);
    r.rotation.y = rot;
    stage.add(r);
  };
  rail(18, -36, 14.2, 0);
  rail(18, -36, -14.2, 0);
  rail(28.5, -45, 0, Math.PI / 2);
  for (let x = -29; x >= -45; x -= 3.2)
    for (let z = -14; z <= 14; z += 3.5) {
      const h = PLAT - VAL;
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, h, 10), m.wood.darkWood);
      p.position.set(x, VAL + h / 2, z);
      stage.add(p);
    }
  [1.5, 5.5, 9.5].forEach((yy) => {
    for (let z = -14; z <= 14; z += 3.5) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(16.5, 0.26, 0.26), m.wood.darkWood);
      b.position.set(-37, VAL + yy, z);
      stage.add(b);
    }
    for (let x = -29; x >= -45; x -= 3.2) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.26, 28), m.wood.darkWood);
      b.position.set(x, VAL + yy, 0);
      stage.add(b);
    }
  });
  ctx.scene.add(stage);
  offering(ctx, -29.4, 0, 0, 'temple', '清水寺', -Math.PI / 2);

  // Otowa waterfall: three streams under a small roof, reached by steps down from the precinct
  const ot = new THREE.Group();
  [-1.6, 0, 1.6].forEach((dz) => {
    const f = nat.waterfall(3.6, 0.3);
    f.position.z = dz;
    f.scale.set(1, 1, 0.6);
    ot.add(f);
  });
  const otRoof = arch.roof({ w: 7, d: 3.4, h: 1.2, kind: 'gable', tone: 'bark', seg: 10 });
  otRoof.rotation.y = Math.PI / 2;
  otRoof.position.set(0.6, 4.4, 0);
  ot.add(otRoof);
  ot.rotation.y = Math.PI / 2;
  ot.position.set(-46, VAL, 30);
  ctx.scene.add(ot);
  ctx.path([[-20, 30], [-40, 30], [-44, 30]], 3.4, 'paving', 0.08);

  ritualSet(ctx, { temizuya: [12, 32, -0.5], ema: [8, 2, -0.8], omikuji: [10, -6, -1.2] });
  // Jishu Shrine (god of love and matchmaking) and its two love-fortune stones
  const jishu = arch.hall({ w: 8, d: 5, wallH: 3, podium: 0.6, pillar: 'vermilion', wall: 'plaster', front: 'lattice', roof: { kind: 'irimoya', tone: 'bark', h: 3, gableTone: 'vermilion' }, overhang: 1.4, bracket: 'gold' });
  ctx.add(jishu, 11, -20.5);
  [6, 16].forEach((x) => {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.7, 9), m.granite);
    ctx.add(st, x, -15, 0, 0.35);
    const rope = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 6, 16), m.rope);
    rope.rotation.x = Math.PI / 2;
    ctx.add(rope, x, -15, 0, 0.55);
  });

  // Maples and cedars on the slopes; Kyoto's rooftops far below
  const clear = (x: number, z: number) => (Math.abs(x) < 16 && z > 4) || (x > -48 && x < 22 && Math.abs(z) < 16) || inOtowaPath(x, z) || (x < -27 && x > -50 && Math.abs(z) < 14);
  ctx.scene.add(nat.forest('maple', nat.scatter(110, { x0: -110, x1: 70, z0: -80, z1: 100 }, clear, 9), [0.9, 1.3], ctx.ground));
  ctx.scene.add(nat.forest('cedar', nat.scatter(70, { x0: -40, x1: 90, z0: -140, z1: -20 }, clear, 21), [1, 1.4], ctx.ground));
  const roofs: THREE.Matrix4[] = [];
  for (let i = 0; i < 260; i++) {
    const x = -130 - Math.random() * 120, z = -120 + Math.random() * 260;
    roofs.push(new THREE.Matrix4().compose(new THREE.Vector3(x, VAL - 4 + Math.random() * 2, z), new THREE.Quaternion(), new THREE.Vector3(5 + Math.random() * 6, 3 + Math.random() * 4, 5 + Math.random() * 6)));
  }
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x7c7a78, roughness: 0.9 }), roofs.length);
  roofs.forEach((r, i) => city.setMatrixAt(i, r));
  city.computeBoundingSphere();
  ctx.scene.add(city);

  return {
    encounters: [seiryuDragon({ zone: (x, z) => x < -43 && z > 24 && z < 36, exit: { x: -36, z: 30, rotY: -Math.PI / 2 } })],
    secrets: [
      {
        id: 'kiyomizu-koi',
        at: [6, -15],
        to: [16, -15],
        r: 1.3,
        trigger: 'blindwalk',
        hint: 'Two stones, about ten metres apart, in front of the little vermilion shrine…',
        luck: 3,
        card: {
          title: 'The love-fortune stones of Jishu Shrine',
          jp: '恋占いの石',
          body: [
            'Behind the main hall stands Jishu Shrine, dedicated to the god of love and good matches.',
            'Close your eyes at one stone and walk to the other. Reach it, and your love will come true. Reach it in one go, and it will come quickly.',
            'If a friend has to guide you, you will need someone\'s help in love too.',
          ],
          ending: 'Eyes still closed, your foot finds the second stone.',
        },
      },
    ],
    spawn: { x: 0, z: 92, rotY: 0 },
    bounds: { x0: -46, x1: 26, z0: -22, z1: 96 },
    walkable: (x, z) => !(x < -27 && z < 40 && !inStage(x, z) && !inOtowaPath(x, z)) && !(x > -27.5 && x < -11 && Math.abs(z) < 12.2),
    anchors: {
      torii: { at: [0, 44], look: [0, 36] },
      temizuya: { at: [9, 30], look: [12, 32] },
      haiden: { at: [-36, 0], look: [-20, 0] },
      'spot-otowa': { at: [-38, 30], look: [-46, 30] },
      ema: { at: [5, 5], look: [8, 2] },
      omikuji: { at: [6, -4], look: [10, -6] },
    },
    particles: 'maple',
    fog: 0.55,
    orbit: { x: -20, z: 4, r: 44, y: 16 },
  };
};
