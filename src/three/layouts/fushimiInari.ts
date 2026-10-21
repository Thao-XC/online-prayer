import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { lanternRow, offering, ritualSet } from './common';

/**
 * Fushimi Inari Taisha, Kyoto.
 * Real sequence from Inari station: vermilion Ichi-no-torii → second torii → stone steps up to the
 * two-storey Rōmon (gifted by Toyotomi Hideyoshi) flanked by kitsune → open Gehaiden (dance pavilion)
 * → Honden with cypress-bark roof → behind it the Senbon Torii: two parallel tunnels of vermilion
 * gates climbing Mt. Inari through cedar and bamboo.
 */
export const fushimiInari: Layout = (ctx) => {
  const { arch, nat } = ctx;
  const COURT = 1.4;
  ctx.setGround((x, z) => {
    let y = z > 36 ? 0 : z > 31 ? ramp(z, 36, 31, 0, COURT) : COURT;
    if (z < -14) y = COURT + (-14 - z) * 0.2; // Mt. Inari slope
    y += Math.max(0, Math.abs(x) - 26) * 0.3; // wooded banks
    if (Math.abs(x) > 30 || z < -20) y += hills(x, z, 0.8);
    return y;
  });
  ctx.terrain(0x3c5230);

  // Approach
  ctx.path([[0, 78], [0, 36]], 7, 'paving');
  ctx.path([[0, 36], [0, -8]], 9, 'gravel');
  ctx.scene.add(arch.stairs({ w: 9, z0: 36, z1: 31, y0: 0, y1: COURT }));
  ctx.add(arch.torii({ style: 'myojin', tone: 'vermilion', h: 12, plaque: '稲荷大社' }), 0, 64);
  ctx.add(arch.torii({ style: 'myojin', tone: 'vermilion', h: 9 }), 0, 46);
  lanternRow(ctx, 60, 38, 5.2, 5.5, 2.4);

  // Rōmon gate with kitsune guardians (one holds the granary key, one the jewel)
  ctx.add(arch.gate({ w: 15, d: 6.5, h: 6, stories: 2, pillar: 'vermilion', wall: 'plaster', roofTone: 'bark' }), 0, 26);
  const foxL = ctx.builder.buildKitsuneStatue(true);
  foxL.scale.setScalar(1.3);
  ctx.add(foxL, -6.5, 30, 0.4);
  const foxR = ctx.builder.buildKitsuneStatue(false);
  foxR.scale.setScalar(1.3);
  ctx.add(foxR, 6.5, 30, -0.4);

  // Gehaiden: open-sided pavilion hung with lanterns
  const ge = new THREE.Group();
  const geW = 12, geD = 8, geH = 4.2;
  ge.add(new THREE.Mesh(new THREE.BoxGeometry(geW + 1, 0.6, geD + 1), ctx.m.granite));
  ge.children[0].position.y = 0.3;
  for (let i = 0; i <= 4; i++)
    for (let j = 0; j <= 2; j++) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, geH, 10), ctx.m.wood.vermilion);
      p.position.set(-geW / 2 + (geW * i) / 4, 0.6 + geH / 2, -geD / 2 + (geD * j) / 2);
      ge.add(p);
    }
  const geRoof = arch.roof({ w: geW + 4, d: geD + 4, kind: 'irimoya', tone: 'bark', gableTone: 'vermilion' });
  geRoof.position.y = 0.6 + geH + 0.4;
  ge.add(geRoof);
  for (let i = 0; i < 5; i++) {
    const l = ctx.builder.buildHangingLantern();
    l.position.set(-geW / 2 + 1 + i * ((geW - 2) / 4), geH - 0.6, geD / 2);
    ge.add(l);
  }
  ctx.add(ge, 0, 15);

  // Honden: vermilion, white walls, flowing cypress-bark roof
  const honden = arch.hall({
    w: 20, d: 11, wallH: 5.2, podium: 1, pillar: 'vermilion', wall: 'plaster', front: 'lattice', railing: 'vermilion',
    roof: { kind: 'nagare', tone: 'bark', h: 6.5, gableTone: 'vermilion' }, overhang: 2.6, bracket: 'vermilion',
  });
  ctx.add(honden, 0, -6);
  offering(ctx, 0, 1.4, honden.userData.floorY - 0.3, 'shrine');

  // Kitsune pair before the Honden too
  ctx.add(ctx.builder.buildKitsuneStatue(true), -7, 4, 0.3);
  ctx.add(ctx.builder.buildKitsuneStatue(false), 7, 4, -0.3);

  ritualSet(ctx, { temizuya: [-12, 20, 0.5], ema: [12, 2, -0.6], omikuji: [-12, 2, 0.6] });

  // Senbon Torii: two parallel tunnels climbing behind the Honden
  const xf: THREE.Matrix4[] = [];
  [-17.2, -20.6].forEach((x) => {
    for (let z = -4; z > -76; z -= 0.75) {
      const y = ctx.ground(x, z);
      const yb = ctx.ground(x, z - 0.75);
      xf.push(
        new THREE.Matrix4().compose(
          new THREE.Vector3(x, y, z),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.atan2(y - yb, 0.75) * 0.3, 0, 0)),
          new THREE.Vector3(1, 1, 1)
        )
      );
    }
  });
  ctx.scene.add(arch.toriiInstances(xf, 3.3, 2.5));
  ctx.path([[-17.2, 0], [-17.2, -78]], 2.4, 'paving');
  ctx.path([[-20.6, 0], [-20.6, -78]], 2.4, 'paving');
  ctx.path([[-6, -2], [-18.9, -2]], 3, 'gravel');
  // small stone foxes at the tunnel mouth
  ctx.add(nat.figure('komainu'), -15.5, -1.5, 0.4);
  ctx.add(nat.figure('komainu'), -22.4, -1.5, -0.4);

  // Forest of Mt. Inari: cedar, bamboo, a few sakura by the gate
  const avoid = (x: number, z: number) =>
    (Math.abs(x) < 15 && z > -20 && z < 80) || (x < -14 && x > -24 && z < 2) || (Math.abs(x) < 9 && z > 30);
  ctx.scene.add(nat.forest('cedar', nat.scatter(150, { x0: -90, x1: 90, z0: -140, z1: 90 }, avoid, 11), [0.9, 1.4], ctx.ground));
  ctx.scene.add(nat.forest('bamboo', nat.scatter(40, { x0: -40, x1: 0, z0: -90, z1: -8 }, avoid, 23), [0.9, 1.2], ctx.ground));
  ctx.scene.add(nat.forest('sakura', [[-11, 40], [11, 42], [-12, 52], [12, 55]], [1.1, 1.3], ctx.ground));
  const mt = nat.mountain(110, 70, 0x3c5934, 2);
  mt.position.set(0, 0, -190);
  ctx.scene.add(mt);

  return {
    spawn: { x: 0, z: 74, rotY: 0 },
    bounds: { x0: -32, x1: 32, z0: -78, z1: 80 },
    anchors: {
      torii: { at: [0, 58], look: [0, 40] },
      temizuya: { at: [-9, 20], look: [-12, 20] },
      'spot-senbon': { at: [-18.9, 0], look: [-18.9, -30] },
      haiden: { at: [0, 9], look: [0, -8] },
      ema: { at: [9, 3], look: [12, 2] },
      omikuji: { at: [-9, 3], look: [-12, 2] },
    },
    particles: 'sakura',
    fog: 0.7,
    orbit: { x: 0, z: 10, r: 34, y: 12 },
  };
};
