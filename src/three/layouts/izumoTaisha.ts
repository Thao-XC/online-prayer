import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { offering, ritualSet } from './common';

/**
 * Izumo Taisha, Shimane.
 * From the wooden Seidamari torii the sandō goes *down* (kudari-sandō), then along the pine avenue lined
 * with little hare statues (the White Hare of Inaba), through the bronze torii to the haiden with its
 * shimenawa. Behind, within its fence, the towering Taisha-zukuri main hall — raised high, steep gable,
 * entered from the gable end. To the west the Kaguraden carries Japan's largest shimenawa (13.6 m, 5 t).
 * Mt. Yakumo rises behind.
 */
export const izumoTaisha: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  ctx.setGround((x, z) => {
    let y = z > 92 ? 4 : z > 70 ? ramp(z, 92, 70, 4, 0) : 0;
    if (z < -44) y += (-44 - z) * 0.45;
    y += Math.max(0, Math.abs(x) - 46) * 0.25;
    return y + (Math.abs(x) > 48 || z < -46 ? hills(x, z, 1.4) : 0);
  });
  ctx.terrain(0x3c5232);
  ctx.path([[0, 116], [0, 70]], 9, 'gravel');
  ctx.path([[0, 70], [0, 26]], 7, 'gravel');
  ctx.path([[0, 26], [0, -14]], 28, 'gravel');
  ctx.path([[-14, 8], [-36, 8]], 10, 'gravel');

  ctx.add(arch.torii({ style: 'myojin', tone: 'cypress', h: 9 }), 0, 96);
  ctx.add(arch.torii({ style: 'myojin', tone: 'bronze', h: 7.5, plaque: '出雲大社' }), 0, 30);

  // Pine avenue with hare statues
  const pines: [number, number][] = [];
  for (let z = 68; z > 32; z -= 5) [-9, 9].forEach((x) => pines.push([x + (Math.random() - 0.5), z]));
  ctx.scene.add(nat.forest('pine', pines, [1.2, 1.5], ctx.ground));
  [[-4.5, 60], [4.6, 52], [-4.8, 44], [4.4, 38], [-6, 22], [6, 18], [-3, 6], [8, 2]].forEach(([x, z], i) => ctx.add(nat.figure('rabbit'), x, z, i));

  // Haiden with shimenawa
  const haiden = arch.hall({ w: 16, d: 10, wallH: 4.6, podium: 0.8, pillar: 'cypress', wall: 'cypress', front: 'doors', railing: 'cypress', roof: { kind: 'gable', tone: 'copper', h: 5.2, gableTone: 'cypress' }, overhang: 2, bracket: 'cypress' });
  ctx.add(haiden, 0, 4);
  ctx.add(arch.shimenawa(9, 0.6), 0, 9.6, 0, haiden.userData.eaveY - 1.1);
  offering(ctx, 0, 10.4, haiden.userData.floorY - 0.3, 'shrine');

  // Fenced Taisha-zukuri main hall
  const fence = new THREE.Group();
  [[34, 0, 13, 0], [34, 0, -13, 0], [26, -17, 0, Math.PI / 2], [26, 17, 0, Math.PI / 2]].forEach(([len, x, z, r]) => {
    const f = arch.fence(len, 3.2, 'cypress', true);
    f.position.set(x, 0, z);
    f.rotation.y = r;
    fence.add(f);
  });
  ctx.add(fence, 0, -26);
  const honden = new THREE.Group();
  const H = 7.5; // raised floor height
  for (let i = -1; i <= 1; i++)
    for (let j = -1; j <= 1; j++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.6, H + 7, 12), m.wood.cypress);
      p.position.set(i * 5, (H + 7) / 2, j * 5);
      honden.add(p);
    }
  const floor = new THREE.Mesh(new THREE.BoxGeometry(12, 0.5, 12), m.wood.cypress);
  floor.position.y = H;
  honden.add(floor);
  const body = new THREE.Mesh(new THREE.BoxGeometry(10.6, 6.6, 10.6), m.wood.cypress);
  body.position.y = H + 3.6;
  honden.add(body);
  const hr = arch.roof({ w: 15, d: 16, h: 9, kind: 'gable', tone: 'bark', curve: 1.25, lift: 0.6, gableTone: 'cypress' });
  hr.rotation.y = Math.PI / 2;
  hr.position.y = H + 6.9;
  honden.add(hr);
  const ck = arch.chigiKatsuogi(hr, 15, 3, 'cypress', true);
  ck.rotation.y = Math.PI / 2;
  ck.position.y = H + 6.9;
  honden.add(ck);
  // covered stair up the front-right (entry on the gable side)
  for (let k = 0; k < 14; k++) {
    const st = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 0.9), m.wood.cypress);
    st.position.set(2.5, H - k * (H / 14), 6.2 + k * 0.9);
    honden.add(st);
  }
  const sr = arch.roof({ w: 3.4, d: 13, h: 1.0, kind: 'gable', tone: 'bark', seg: 10, lift: 0 });
  sr.rotation.y = Math.PI / 2;
  sr.rotation.z = -0.5;
  sr.position.set(2.5, H + 1.4, 12);
  honden.add(sr);
  ctx.add(honden, 0, -28);

  // Kaguraden with the great shimenawa
  const kagura = arch.hall({ w: 20, d: 12, wallH: 4.8, podium: 0.8, pillar: 'cypress', wall: 'cypress', front: 'doors', railing: 'cypress', roof: { kind: 'irimoya', tone: 'copper', h: 5.4, gableTone: 'cypress' }, overhang: 2.2, bracket: 'cypress' });
  ctx.add(kagura, -38, -4);
  ctx.add(arch.shimenawa(14, 1.4), -38, 2.4, 0, kagura.userData.eaveY - 1.7);

  ritualSet(ctx, { temizuya: [-10, 22, 0.5], ema: [13, 14, -0.6], omikuji: [-13, 14, 0.6] });

  // forest & Mt. Yakumo
  const clear = (x: number, z: number) => (Math.abs(x) < 14 && z > -46 && z < 110) || (x > -54 && x < 22 && z > -44 && z < 22);
  ctx.scene.add(nat.forest('pine', nat.scatter(70, { x0: -110, x1: 110, z0: -60, z1: 120 }, clear, 4), [1, 1.4], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(150, { x0: -140, x1: 140, z0: -160, z1: 130 }, clear, 8), [1, 1.5], ctx.ground));
  const mt = nat.mountain(130, 80, 0x3d5733, 6);
  mt.position.set(0, 0, -200);
  ctx.scene.add(mt);

  // Jūkusha: two long halls where the gods of all Japan lodge in Kamiari-zuki
  [-21, 21].forEach((x) => {
    const j = arch.hall({ w: 26, d: 4, wallH: 2.6, podium: 0.4, pillar: 'cypress', wall: 'cypress', front: 'doors', veranda: false, roof: { kind: 'gable', tone: 'copper', h: 2.2, gableTone: 'cypress' }, overhang: 1 });
    ctx.add(j, x, -28, Math.PI / 2);
  });
  // the gathered gods, as drifting lights (night only)
  const gods = new THREE.Group();
  [-21, 21, 0].forEach((x, i) => {
    const orbs = new THREE.Group();
    const n = i === 2 ? 30 : 22;
    for (let k = 0; k < n; k++) {
      const o = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe7a8 }));
      o.position.set((Math.random() - 0.5) * (i === 2 ? 30 : 6), 2 + Math.random() * 6, (Math.random() - 0.5) * 26);
      o.userData.base = o.position.clone();
      orbs.add(o);
    }
    orbs.position.set(x, 0, i === 2 ? -6 : -28);
    gods.add(orbs);
  });
  const godLight = new THREE.PointLight(0xffd58a, 30, 50, 1.4);
  godLight.position.set(0, 8, -14);
  gods.add(godLight);
  ctx.scene.add(gods);
  gods.visible = false;
  nat.animated.push({
    update: (t) =>
      gods.children.forEach((grp) =>
        grp.children.forEach((o, k) => {
          const b = o.userData.base as THREE.Vector3 | undefined;
          if (b) o.position.set(b.x + Math.sin(t * 0.5 + k) * 0.8, b.y + Math.sin(t * 0.8 + k * 1.3) * 0.6, b.z + Math.cos(t * 0.4 + k) * 0.8);
        })
      ),
  });

  return {
    nightObjects: [gods],
    secrets: [
      {
        id: 'izumo-kamiari',
        at: [10, 2],
        r: 14,
        trigger: 'night',
        hint: 'Long empty halls stand on either side of the main shrine…',
        luck: 4,
        card: {
          title: 'Kamiari-zuki: the month the gods gather',
          jp: '神在月',
          body: [
            'Each year in the tenth month of the old calendar, the "eight million gods" of Japan leave their shrines and gather at Izumo to decide the fates of the coming year, above all who will meet and marry whom.',
            'Everywhere else it is Kannazuki, "the month without gods". Only here in Izumo is it Kamiari-zuki, "the month with gods". They stay in the long Jūkusha halls on either side of the main shrine.',
            'Izumo Taisha has its own way to pray: two bows, four claps, one bow.',
          ],
          ending: 'Lights drift over the long halls. The gods have arrived.',
        },
      },
    ],
    etiquette: {
      centerLines: [[0, 116, 0, 30]],
      forbidden: [
        { test: (x, z) => Math.abs(x) < 17 && z < -13 && z > -39, reason: "The main hall's enclosure is for priests. Please pray from outside the fence." },
        { test: (x, z) => Math.abs(x) < 9 && z > -2 && z < 10.5, reason: 'Please pray from in front of the haiden, not inside it.' },
      ],
    },
    spawn: { x: 0, z: 110, rotY: 0 },
    bounds: { x0: -50, x1: 24, z0: -12, z1: 114 },
    anchors: {
      torii: { at: [0, 88], look: [0, 60] },
      temizuya: { at: [-6.5, 22], look: [-10, 22] },
      'spot-shimenawa': { at: [-38, 16], look: [-38, 4] },
      haiden: { at: [0, 16], look: [0, 4] },
      ema: { at: [10, 15], look: [13, 14] },
      omikuji: { at: [-10, 15], look: [-13, 14] },
    },
    particles: 'none',
    fog: 0.85,
    orbit: { x: -10, z: -6, r: 46, y: 20 },
  };
};
