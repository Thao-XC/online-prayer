import * as THREE from 'three';
import type { Layout } from './types';
import { hills } from './types';
import { ritualSet, offering } from './common';

import { ryuguJo } from '../encounters/legends';
/**
 * Itsukushima Shrine, Miyajima.
 * Vermilion halls and corridors stand on piers over the tidal cove, facing the sea. The Ō-torii
 * (ryōbu style, with four auxiliary legs) stands ~200 m out in the water. Behind: the forested slopes
 * of Mt. Misen and a five-storey pagoda on the hill. Deer wander the beach.
 */
export const itsukushima: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const DECK = 1.5;
  const SEA = 0.35;
  type R = [number, number, number, number];
  const decks: R[] = [
    [-9, 9, -30, 16], // main platform with halls (hirabutai at the front)
    [9, 47, -8.5, -3.5], // east corridor
    [43, 49, -36, -3.5], // east corridor to land
    [-47, -9, -8.5, -3.5], // west corridor
    [-49, -43, -36, -3.5], // west corridor to land
    [14, 26, -13, -3.5], // ema deck
    [-26, -14, -13, -3.5], // omikuji deck
    [-36, -26, -22, -8], // Noh stage
  ];
  const inDeck = (x: number, z: number) => decks.some(([x0, x1, z0, z1]) => x >= x0 && x <= x1 && z >= z0 && z <= z1);
  const land = (x: number, z: number) => Math.max(-36 - z, Math.abs(x) - 64);
  ctx.setGround((x, z) => {
    if (inDeck(x, z)) return DECK;
    const ld = land(x, z);
    if (ld > 0) return 0.6 + ld * 0.16 + hills(x, z, 1.2);
    return -1.4 + Math.max(0, Math.min(1, (ld + 8) / 8)) * 2.0;
  });
  ctx.terrain(0x55683f, 420, 170);
  const sea = ctx.water(SEA, 900, 900, 0, 120, 0x3f8f9e);

  // Decks on piers
  decks.forEach(([x0, x1, z0, z1]) => {
    const w = x1 - x0, d = z1 - z0;
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.3, d), m.wood.darkWood);
    ctx.add(deck, (x0 + x1) / 2, (z0 + z1) / 2, 0, -0.15);
    for (let x = x0 + 1; x < x1; x += 3.2)
      for (let z = z0 + 1; z < z1; z += 3.2) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 3.2, 8), m.wood.darkWood);
        ctx.add(p, x, z, 0, -1.8);
      }
  });

  // Main halls: honden, haiden, haraiden — vermilion with cypress-bark roofs
  const honden = arch.hall({ w: 18, d: 9, wallH: 4.6, podium: 0, pillar: 'vermilion', wall: 'plaster', front: 'lattice', roof: { kind: 'gable', tone: 'bark', h: 5.2, gableTone: 'vermilion' }, overhang: 2.4, bracket: 'vermilion' });
  ctx.add(honden, 0, -24);
  const haiden = arch.hall({ w: 22, d: 8, wallH: 4.4, podium: 0, pillar: 'vermilion', wall: 'plaster', front: 'open', roof: { kind: 'irimoya', tone: 'bark', h: 4.6, gableTone: 'vermilion' }, overhang: 2.2, bracket: 'vermilion' });
  ctx.add(haiden, 0, -12);
  const haraiden = new THREE.Group();
  [-8, -3, 3, 8].forEach((px) =>
    [-3, 0, 3].forEach((pz) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 4, 10), m.wood.vermilion);
      p.position.set(px, 2, pz);
      haraiden.add(p);
    })
  );
  const hr = arch.roof({ w: 20, d: 10, kind: 'irimoya', tone: 'bark', h: 4, gableTone: 'vermilion' });
  hr.position.y = 4.3;
  haraiden.add(hr);
  ctx.add(haraiden, 0, -3);
  offering(ctx, 0, -6.5, 0, 'shrine');

  // Hirabutai front platform: takabutai dance stage + lantern at the tip
  const stage = new THREE.Mesh(new THREE.BoxGeometry(6, 0.6, 6), m.wood.vermilion);
  ctx.add(stage, 0, 7, 0, 0.3);
  [-5.5, 5.5].forEach((x) => ctx.add(arch.stoneLantern(2.2, m.bronzeDark), x, 15.2));
  [-1, 1].forEach((s) => ctx.add(nat.figure('komainu', m.bronzeDark), s * 7.5, 12, 0));

  // Corridors (kairō) with hanging lanterns
  const corr = (len: number, cx: number, cz: number, rot: number) => {
    const c = arch.corridor(len, { w: 4.6, h: 3.1, pillar: 'vermilion', roofTone: 'bark', floor: false });
    ctx.add(c, cx, cz, rot);
    for (let k = -len / 2 + 3; k < len / 2; k += 6) {
      const l = ctx.builder.buildHangingLantern();
      l.scale.setScalar(0.8);
      const lx = rot ? cx + k : cx, lz = rot ? cz : cz + k;
      ctx.add(l, lx, lz, 0, 2.9);
    }
  };
  corr(38, 28, -6, Math.PI / 2);
  corr(38, -28, -6, Math.PI / 2);
  corr(30, 46, -21, 0);
  corr(30, -46, -21, 0);

  // Noh stage on the west
  const noh = arch.hall({ w: 7, d: 7, wallH: 3.6, podium: 0, pillar: 'cypress', wall: 'cypress', front: 'open', veranda: false, roof: { kind: 'irimoya', tone: 'bark', h: 3.4, gableTone: 'cypress' }, overhang: 1.6 });
  ctx.add(noh, -31, -15, Math.PI / 2);

  ritualSet(ctx, { ema: [20, -11, 0], omikuji: [-20, -10.5, 0], temizuya: [52, -46, -0.6] });

  // The great floating torii, out in the sea
  ctx.add(arch.torii({ style: 'ryobu', tone: 'vermilion', h: 16, span: 11, plaque: '嚴島神社' }), 0, 100);

  // Shore: stone lanterns, deer, pagoda on the hill, Mt. Misen
  for (let x = -60; x <= 60; x += 10) if (Math.abs(x) > 50 || Math.abs(x) < 4) continue; else ctx.add(arch.stoneLantern(2.6), x, -40);
  [[30, -46, 0.6], [-22, -44, 2.1], [12, -52, 4], [38, -58, 1.2], [-40, -50, 3]].forEach(([x, z, r]) => ctx.add(nat.figure('deer'), x, z, r));
  ctx.add(arch.pagoda({ stories: 5, w: 5.5, storyH: 2.6, tone: 'vermilion', roofTone: 'bark' }), -40, -72);
  const avoidShrine = (x: number, z: number) => land(x, z) < 6 || (Math.abs(x) < 46 && z > -48);
  ctx.scene.add(nat.forest('pine', nat.scatter(30, { x0: -70, x1: 70, z0: -56, z1: -40 }, (x, z) => land(x, z) < 1, 4), [0.9, 1.3], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(140, { x0: -160, x1: 160, z0: -200, z1: -48 }, avoidShrine, 9), [1, 1.6], ctx.ground));
  ctx.scene.add(nat.forest('maple', nat.scatter(30, { x0: -90, x1: 90, z0: -110, z1: -50 }, avoidShrine, 13), [0.9, 1.2], ctx.ground));
  { const mt = nat.mountain(150, 110, 0x3f5a35, 5); mt.position.set(0, 0, -250); ctx.scene.add(mt); }
  { const mt = nat.mountain(110, 60, 0x4a6440, 8); mt.position.set(-190, 0, -120); ctx.scene.add(mt); }
  { const mt = nat.mountain(110, 55, 0x4a6440, 11); mt.position.set(190, 0, -110); ctx.scene.add(mt); }

  return {
    encounters: [ryuguJo({ zone: (x, z) => !inDeck(x, z) && land(x, z) < -1, exit: { x: 0, z: 10, rotY: Math.PI } })],
    etiquette: {
      forbidden: [{ test: (x, z) => Math.abs(x) < 10 && z < -18 && z > -29.5, reason: 'The honden is the dwelling of the kami. Please pray from the haiden.' }],
    },
    spawn: { x: 0, z: 12, rotY: Math.PI },
    bounds: { x0: -70, x1: 70, z0: -90, z1: 16 },
    walkable: (x, z) => inDeck(x, z) || land(x, z) > -1,
    anchors: {
      torii: { at: [0, 13], look: [0, 100] },
      temizuya: { at: [48, -42], look: [52, -46] },
      'spot-kairo': { at: [30, -6], look: [-10, -6] },
      haiden: { at: [0, 4], look: [0, -14] },
      ema: { at: [20, -6.5], look: [20, -11] },
      omikuji: { at: [-20, -6.5], look: [-20, -11] },
    },
    particles: 'none',
    fog: 0.45,
    orbit: { x: 0, z: 10, r: 52, y: 18 },
    bobbingWater: sea,
  };
};
