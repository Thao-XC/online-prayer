import * as THREE from 'three';
import type { Layout } from './types';
import { hills } from './types';
import { offering, ritualSet } from './common';

/**
 * Zenkō-ji, Nagano.
 * Up the stone-paved Nakamise-dōri (7,777 paving stones, they say), through the Niōmon, past the six
 * bronze Jizō in red bibs, to the great two-storey Sanmon with its 善光寺 plaque, the incense burner, and
 * the Hondō: one of Japan's largest wooden halls, unpainted, under a vast cypress-bark roof whose ridges
 * form a T (shumoku-zukuri). The snowy Northern Alps rise behind the city.
 */
export const zenkoji: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  ctx.setGround((x, z) => (Math.abs(x) < 40 && z > -66 ? 0 : Math.max(0, hills(x, z, 1.8, 0.05)) + Math.max(0, Math.abs(x) - 40) * 0.25 + Math.max(0, -66 - z) * 0.3));
  ctx.terrain(0x4f6540);
  ctx.path([[0, 130], [0, -14]], 10, 'paving');
  ctx.path([[-30, 8], [30, 8]], 26, 'paving');

  // Nakamise
  for (let z = 126; z > 92; z -= 4.2) {
    ctx.add(nat.shopRow(4.2, 1), -10.5, z);
    ctx.add(nat.shopRow(4.2, -1), 10.5, z);
  }
  ctx.add(arch.gate({ w: 12, d: 6, h: 5.4, stories: 1, pillar: 'darkWood', wall: 'darkWood', roofTone: 'bark', nio: true }), 0, 82);

  // Rokujizō: six bronze Jizō with red bibs, on lotus pedestals
  for (let k = 0; k < 6; k++) {
    const j = new THREE.Group();
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.9, 1.4, 12), m.granite);
    ped.position.y = 0.7;
    j.add(ped);
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.4, 4, 10), m.patina);
    body.position.y = 2.3;
    j.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), m.patina);
    head.position.y = 3.6;
    j.add(head);
    const bib = new THREE.Mesh(new THREE.ConeGeometry(0.62, 0.7, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xc8261b, side: THREE.DoubleSide }));
    bib.position.y = 2.8;
    j.add(bib);
    ctx.add(j, -22 + k * 2.4, 58, 0);
  }

  // Sanmon (two storeys, cypress-bark roof, plaque)
  ctx.add(arch.gate({ w: 16, d: 8, h: 6, stories: 2, pillar: 'darkWood', wall: 'darkWood', roofTone: 'bark', plaque: '善光寺' }), 0, 40);
  ctx.add(ctx.builder.buildJokoro(), 0, 12);

  // Hondō: deep hall, ridge running front-to-back, crossed by a front roof (T-shaped)
  const hondo = arch.hall({
    w: 44, d: 26, wallH: 9, podium: 1.4, pillar: 'darkWood', wall: 'darkWood', front: 'lattice', railing: 'darkWood',
    roof: { kind: 'irimoya', tone: 'bark', h: 14, curve: 1.6, gableTone: 'darkWood' }, overhang: 3.6, mokoshi: true,
  });
  ctx.add(hondo, 0, -40, Math.PI / 2);
  const cross = arch.roof({ w: 32, d: 13, h: 9, kind: 'irimoya', tone: 'bark', curve: 1.6, gableTone: 'darkWood' });
  ctx.add(cross, 0, -21, 0, hondo.userData.eaveY - 0.4);
  const facade = new THREE.Mesh(new THREE.PlaneGeometry(22, 8), m.wood.darkWood);
  ctx.add(facade, 0, -17.4, 0, hondo.userData.floorY + 4);
  for (let k = 0; k < 12; k++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 8, 0.12), m.wood.black);
    ctx.add(slat, -10 + k * (20 / 11), -17.3, 0, hondo.userData.floorY + 4);
  }
  offering(ctx, 0, -15.6, 0, 'temple');

  ritualSet(ctx, { temizuya: [13, 26, -0.4], ema: [14, -2, -0.6], omikuji: [-14, -2, 0.6] });

  // trees, city, snowy Alps
  const clear = (x: number, z: number) => (Math.abs(x) < 34 && z > -68 && z < 70) || (Math.abs(x) < 16 && z >= 70);
  ctx.scene.add(nat.forest('pine', nat.scatter(40, { x0: -80, x1: 80, z0: -80, z1: 90 }, clear, 2), [1, 1.3], ctx.ground));
  ctx.scene.add(nat.forest('sakura', [[-20, 30], [22, 28], [-26, 14], [26, 0], [-24, -6]], [1, 1.2], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(110, { x0: -150, x1: 150, z0: -170, z1: 150 }, clear, 14), [1, 1.5], ctx.ground));
  [[-120, -300, 150, 120], [60, -320, 170, 140], [220, -260, 130, 100]].forEach(([x, z, r, h], i) => {
    const mt = nat.mountain(r, h, 0x6a7d78, i + 2);
    mt.position.set(x, 0, z);
    ctx.scene.add(mt);
    const cap = nat.mountain(r * 0.42, h * 0.32, 0xf2f5f7, i + 2);
    cap.position.set(x, h * 0.7, z);
    ctx.scene.add(cap);
  });

  return {
    spawn: { x: 0, z: 128, rotY: 0 },
    bounds: { x0: -30, x1: 30, z0: -16, z1: 132 },
    walkable: (x, z) => (z > 90 ? Math.abs(x) < 7.5 : true),
    anchors: {
      torii: { at: [0, 50], look: [0, 40] },
      temizuya: { at: [9.5, 26], look: [13, 26] },
      haiden: { at: [0, 4], look: [0, -30] },
      ema: { at: [11, -1], look: [14, -2] },
      omikuji: { at: [-11, -1], look: [-14, -2] },
    },
    particles: 'none',
    fog: 0.6,
    orbit: { x: 0, z: -10, r: 54, y: 24 },
    smoke: [0, 2.2, 12],
  };
};
