import type { Layout } from './types';
import { hills } from './types';
import { offering, ritualSet, lanternRow } from './common';

/**
 * Kōyasan Danjō Garan, Wakayama.
 * Mountain-top monastery among giant cedars. The vermilion two-storey Chūmon gate opens onto a gravel
 * precinct with the Kondō (main hall); to its right rises the Konpon Daitō, the great vermilion tahōtō
 * with its white dome, and to the west the smaller Saitō. The Miedō sits behind. Often in mist.
 */
export const koyasan: Layout = (ctx) => {
  const { arch, nat } = ctx;
  ctx.setGround((x, z) => {
    const inside = Math.abs(x) < 44 && z < 60 && z > -46;
    return inside ? 0 : Math.max(0, hills(x, z, 2.2, 0.05)) + Math.max(0, Math.abs(x) - 44) * 0.2;
  });
  ctx.terrain(0x3a4f30);
  ctx.path([[0, 80], [0, 44]], 8, 'gravel');
  ctx.path([[0, 44], [0, -40]], 70, 'gravel');

  // Chūmon: two-storey vermilion gate (rebuilt 2015 with the Four Heavenly Kings)
  ctx.add(arch.gate({ w: 16, d: 7, h: 6, stories: 2, pillar: 'vermilion', wall: 'plaster', roofTone: 'tile', nio: true }), 0, 40);

  // Kondō: main hall
  const kondo = arch.hall({
    w: 26, d: 18, wallH: 6, podium: 1.0, pillar: 'vermilion', wall: 'plaster', front: 'lattice', railing: 'vermilion',
    roof: { kind: 'irimoya', tone: 'bark', h: 10, gableTone: 'vermilion' }, overhang: 3, bracket: 'vermilion',
  });
  ctx.add(kondo, 0, 6);
  offering(ctx, 0, 16.6, kondo.userData.floorY - 0.3, 'temple');

  // Konpon Daitō (east) and Saitō (west)
  ctx.add(arch.tahoto(15, 'vermilion'), 28, -22);
  ctx.add(arch.tahoto(8, 'darkWood'), -30, -24);
  // Miedō behind
  ctx.add(arch.hall({ w: 14, d: 12, wallH: 4.4, podium: 0.8, pillar: 'darkWood', wall: 'darkWood', front: 'doors', roof: { kind: 'pyramid', tone: 'bark', h: 6 }, overhang: 2.2 }), -4, -30);

  lanternRow(ctx, 34, 18, 7, 8, 2.8);
  ritualSet(ctx, { temizuya: [-14, 30, 0.4], ema: [14, 26, -0.4], omikuji: [-14, 22, 0.4] });

  // Giant cedars (Kōya-maki and sugi)
  const clear = (x: number, z: number) => (Math.abs(x) < 46 && z < 62 && z > -48) || (Math.abs(x) < 7 && z > 40);
  ctx.scene.add(nat.forest('cedar', nat.scatter(220, { x0: -130, x1: 130, z0: -140, z1: 130 }, clear, 5), [1.1, 1.7], ctx.ground));
  ctx.scene.add(nat.forest('cedar', [[-40, 30], [40, 34], [-38, -40], [42, -42], [20, 50], [-22, 52]], [1.5, 1.8], ctx.ground));
  ctx.scene.add(nat.forest('maple', nat.scatter(18, { x0: -44, x1: 44, z0: -44, z1: 56 }, (x, z) => Math.abs(x) < 34 && z > -36 && z < 50, 8), [0.8, 1], ctx.ground));

  return {
    spawn: { x: 0, z: 74, rotY: 0 },
    bounds: { x0: -44, x1: 44, z0: -44, z1: 78 },
    anchors: {
      torii: { at: [0, 48], look: [0, 40] },
      temizuya: { at: [-10.5, 30], look: [-14, 30] },
      pagoda: { at: [14, -6], look: [28, -22] },
      haiden: { at: [0, 24], look: [0, 6] },
      ema: { at: [11, 26], look: [14, 26] },
      omikuji: { at: [-11, 22], look: [-14, 22] },
    },
    particles: 'none',
    fog: 1.35,
    orbit: { x: 4, z: -4, r: 46, y: 18 },
  };
};
