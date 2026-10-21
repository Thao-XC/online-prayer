import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { offering, ritualSet } from './common';

import { amaNoIwato } from '../encounters/legends';
/**
 * Ise Jingū — Naikū (Kōtai Jingū), Mie.
 * Cross the cypress Uji Bridge over the Isuzu River between two plain torii; walk the white-gravel
 * paths under giant cedars; purify at the Mitarashi stone steps down to the river; climb the stone
 * steps to the sanctuary, where the thatched, unpainted Shinmei-zukuri main hall with its chigi and ten
 * katsuogi sits behind layered wooden fences, a white curtain at the gate. Beside it lies the empty
 * plot (kodenchi) for the next rebuild — the shrine is renewed every 20 years. No vermilion anywhere.
 */
export const iseJingu: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const riverA = (z: number) => z > 56 && z < 76; // runs along x, crossed by Uji Bridge
  const riverB = (x: number, z: number) => x < -30 && x > -48 && z < 56 && z > -20; // the Isuzu again, by Mitarashi
  ctx.setGround((x, z) => {
    if (Math.abs(x) < 3.6 && riverA(z)) return 1.1; // bridge deck
    if (riverA(z)) return -2.2 + Math.max(0, Math.abs(z - 66) - 8) * 0.9;
    if (riverB(x, z)) return -2.2 + Math.max(0, Math.abs(x + 39) - 7) * 0.9;
    // Mitarashi steps down to the water
    if (x <= -24 && x >= -32 && z > 10 && z < 22) return ramp(x, -24, -32, 0, -1.6);
    let y = 0;
    if (z < -34) y = z > -42 ? ramp(z, -34, -42, 0, 3) : 3; // stone steps to the sanctuary
    return y + (Math.abs(x) > 58 ? hills(x, z, 1.4) + (Math.abs(x) - 58) * 0.3 : 0);
  });
  ctx.terrain(0x34472b);
  ctx.water(-0.6, 400, 20, 0, 66, 0x4a8c8a);
  ctx.water(-0.6, 18, 76, -39, 18, 0x4a8c8a);

  // Uji Bridge with a shinmei torii at each end
  const bridge = arch.flatBridge(22, 7, 'cypress', 'cypress');
  ctx.add(bridge, 0, 66, 0, -0.78); // deck top (local 0.78) sits at the 1.1 m walking height
  ctx.add(arch.torii({ style: 'shinmei', tone: 'cypress', h: 7.4 }), 0, 79);
  ctx.add(arch.torii({ style: 'shinmei', tone: 'cypress', h: 7.4 }), 0, 53);

  // gravel paths: straight, then the turn toward the sanctuary
  ctx.path([[0, 96], [0, 79]], 8, 'gravel');
  ctx.path([[0, 53], [0, 28], [-6, 14], [0, 0], [0, -34]], 10, 'gravel');
  ctx.path([[-6, 16], [-24, 16]], 5, 'gravel');
  ctx.scene.add(arch.stairs({ w: 8, z0: -34, z1: -42, y0: 0, y1: 3 }));
  // Mitarashi stone steps
  ctx.scene.add(
    (() => {
      const g = new THREE.Group();
      for (let k = 0; k < 6; k++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 10), m.granite);
        step.position.set(-24.7 - k * 1.35, -0.15 - k * 0.27, 16);
        g.add(step);
      }
      return g;
    })()
  );

  // Kaguraden / amulet office (plain cypress, copper roof)
  const kagura = arch.hall({ w: 14, d: 8, wallH: 3.4, podium: 0.5, pillar: 'cypress', wall: 'cypress', front: 'lattice', roof: { kind: 'irimoya', tone: 'copper', h: 4, gableTone: 'cypress' }, overhang: 1.8, bracket: 'cypress' });
  ctx.add(kagura, 18, 14, -Math.PI / 2);
  ritualSet(ctx, { temizuya: [10, 44, -Math.PI / 2], ema: [12, 4, -1.2], omikuji: [12, 24, -1.6] });

  // The sanctuary: layered fences, gate with white curtain, thatched shinmei-zukuri main hall
  const SY = 3;
  [[40, 34], [30, 26], [20, 18]].forEach(([w, d], k) => {
    const tone = k === 0 ? 'cypress' : 'cypress';
    const solid = k !== 1;
    const zc = -60;
    const f = new THREE.Group();
    const front = (len: number, x: number) => {
      const p = arch.fence(len, k === 0 ? 3.0 : 2.4, tone, solid);
      p.position.set(x, 0, d / 2);
      f.add(p);
    };
    const gap = 5;
    front((w - gap) / 2, -(gap / 2 + (w - gap) / 4));
    front((w - gap) / 2, gap / 2 + (w - gap) / 4);
    const back = arch.fence(w, k === 0 ? 3.0 : 2.4, tone, solid);
    back.position.z = -d / 2;
    f.add(back);
    [-1, 1].forEach((s) => {
      const side = arch.fence(d, k === 0 ? 3.0 : 2.4, tone, solid);
      side.rotation.y = Math.PI / 2;
      side.position.x = (s * w) / 2;
      f.add(side);
    });
    ctx.add(f, 0, zc);
  });
  // gate (thatched shinmei gate) with the white curtain
  const gate = new THREE.Group();
  [-2.2, 2.2].forEach((x) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 4, 10), m.wood.cypress);
    p.position.set(x, 2, 0);
    gate.add(p);
  });
  const gr = arch.roof({ w: 7, d: 3.6, h: 1.6, kind: 'gable', tone: 'thatch', curve: 1.05, lift: 0, seg: 12 });
  gr.position.y = 4;
  gate.add(gr);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.0), m.paper);
  curtain.position.set(0, 2.4, 0.1);
  gate.add(curtain);
  ctx.add(gate, 0, -43);
  offering(ctx, 0, -42.2, 0, 'temple'); // offerings are placed before the white curtain; no bell

  // main hall: raised floor, unpainted cypress, thatched gable roof, chigi + 10 katsuogi
  const honden = arch.hall({
    w: 11, d: 6.5, wallH: 3.4, podium: 0, raised: 2.2, pillar: 'cypress', wall: 'cypress', front: 'doors', railing: 'cypress',
    roof: { kind: 'gable', tone: 'thatch', h: 4.6, curve: 1.0, lift: 0, gableTone: 'cypress' }, overhang: 1.6, bracket: 'cypress',
  });
  const ck = arch.chigiKatsuogi(honden.children[honden.children.length - 1] as THREE.Group, 12, 10, 'cypress', true);
  ck.position.y = honden.userData.eaveY;
  honden.add(ck);
  // free-standing ridge-support pillars at the gable ends (munamochi-bashira)
  [-7.4, 7.4].forEach((x) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, honden.userData.ridgeY, 10), m.wood.cypress);
    p.position.set(x, honden.userData.ridgeY / 2, 0);
    honden.add(p);
  });
  ctx.add(honden, 0, -61);
  // kodenchi: empty white-stone plot with the tiny shelter (oikya)
  const plot = new THREE.Mesh(new THREE.BoxGeometry(34, 0.2, 30), new THREE.MeshStandardMaterial({ color: 0xe9e6dd, roughness: 1 }));
  ctx.add(plot, 46, -60, 0, 0.1);
  const oi = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.6, 1.2), m.wood.cypress);
  ctx.add(oi, 46, -60, 0, 0.9);

  // giant cedars and broadleaf forest
  const clear = (x: number, z: number) => (Math.abs(x) < 9 && z > -34) || (x > -50 && x < 26 && z > 2 && z < 30) || riverA(z) || riverB(x, z) || (Math.abs(x) < 66 && z < -36 && z > -80) || (x > 4 && x < 26 && z > 0 && z < 50);
  ctx.scene.add(nat.forest('cedar', nat.scatter(240, { x0: -130, x1: 130, z0: -150, z1: 140 }, clear, 3), [1.4, 2.0], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(80, { x0: -130, x1: 130, z0: -150, z1: 140 }, clear, 19), [1, 1.4], ctx.ground));

  // Ise's sacred chickens wander the gravel
  [[6, 30, 1], [-5, 36, 3], [7, 38, 5]].forEach(([x, z, r]) => {
    const c = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshStandardMaterial({ color: 0xf6f1e6 }));
    body.scale.set(0.8, 1, 1.2);
    body.position.y = 0.45;
    c.add(body);
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.14), new THREE.MeshStandardMaterial({ color: 0xd02a1d }));
    comb.position.set(0, 0.85, 0.18);
    c.add(comb);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), body.material);
    head.position.set(0, 0.75, 0.18);
    c.add(head);
    ctx.add(c, x, z, r);
  });

  return {
    encounters: [amaNoIwato({ zone: (x, z) => (riverA(z) && Math.abs(x) > 3.4) || riverB(x, z), exit: { x: -22, z: 16, rotY: -Math.PI / 2 } })],
    secrets: [
      {
        id: 'ise-sengu',
        at: [12, -34],
        r: 3,
        trigger: 'linger',
        seconds: 3,
        hint: 'Beside the sanctuary lies an empty plot of white stones…',
        luck: 2,
        card: {
          title: 'Shikinen Sengū: rebuilt every 20 years',
          jp: '式年遷宮',
          body: [
            'Every twenty years the main sanctuary is rebuilt, exactly as before, on the empty plot right beside it, and the goddess is moved to her new home by night.',
            'The custom has been kept, with a few interruptions, since the year 690. The 62nd rebuilding was completed in 2013, and the next is due in 2033.',
            'The rebuilding passes the old carpentry skills from one generation to the next. The shrine is ancient and brand new at the same time.',
          ],
          ending: 'You look from the new hall to the empty plot, and back again.',
        },
      },
    ],
    etiquette: {
      centerLines: [[0, 96, 0, 79], [0, 53, 0, 28], [0, 0, 0, -33]],
      forbidden: [{ test: (x, z) => z < -43 && Math.abs(x) < 20, reason: 'Beyond the white curtain only priests may enter. Visitors pray at the gate.', penalty: 4 }],
    },
    spawn: { x: 0, z: 94, rotY: 0 },
    bounds: { x0: -34, x1: 30, z0: -44, z1: 98 },
    walkable: (x, z) => (riverA(z) ? Math.abs(x) < 3.2 : true) && !riverB(x, z),
    anchors: {
      torii: { at: [0, 84], look: [0, 66] },
      temizuya: { at: [-27, 16], look: [-34, 16] },
      haiden: { at: [0, -33], look: [0, -52] },
      ema: { at: [9, 6], look: [12, 4] },
      omikuji: { at: [9, 22], look: [12, 24] },
    },
    particles: 'none',
    fog: 0.85,
    orbit: { x: 0, z: -40, r: 42, y: 20 },
  };
};
