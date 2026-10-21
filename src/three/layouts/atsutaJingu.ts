import * as THREE from 'three';
import type { Layout } from './types';
import { offering, ritualSet } from './common';

/**
 * Atsuta Jingū, Nagoya.
 * Home of the sacred sword Kusanagi. Plain shinmei torii, a broad gravel sandō under giant camphor trees
 * (the 1,000-year-old Ōkusu, roped with shimenawa), the Nobunaga-bei — the tiled clay wall Oda Nobunaga
 * donated after praying here before the battle of Okehazama — and the Hongū, rebuilt in 1893 in the
 * Shinmei style of Ise: unpainted cypress, chigi and katsuogi, within wooden fences. The city all around.
 */
export const atsutaJingu: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  ctx.setGround(() => 0);
  ctx.terrain(0x40573a, 420, 40);
  ctx.path([[0, 110], [0, -4]], 11, 'gravel');
  ctx.path([[-26, 60], [0, 60]], 8, 'gravel');

  ctx.add(arch.torii({ style: 'shinmei', tone: 'cypress', h: 8.5 }), 0, 92);
  ctx.add(arch.torii({ style: 'shinmei', tone: 'cypress', h: 8 }), 0, 48);
  ctx.add(arch.torii({ style: 'shinmei', tone: 'cypress', h: 7 }), -20, 60, Math.PI / 2);

  // Ōkusu: the great camphor, roped with shimenawa
  ctx.scene.add(nat.forest('camphor', [[13, 34, 1.7]], [1.7, 1.7]));
  const rope = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.22, 8, 24), m.rope);
  rope.rotation.x = Math.PI / 2;
  ctx.add(rope, 13, 34, 0, 3);
  // Nobunaga-bei
  ctx.add(arch.tileWall(16, 2.6, 'ochre'), -17, 55.2);

  // Hongū: haiden at the fence line, shinmei-style main hall behind
  // front fence, open where the haiden stands
  [-14.5, 14.5].forEach((x) => ctx.add(arch.fence(11, 2.8, 'cypress', true), x, -10));
  const haiden = arch.hall({ w: 18, d: 8, wallH: 4.4, podium: 0.8, pillar: 'cypress', wall: 'cypress', front: 'doors', railing: 'cypress', roof: { kind: 'gable', tone: 'copper', h: 4.4, gableTone: 'cypress' }, overhang: 2, bracket: 'cypress' });
  ctx.add(haiden, 0, -12);
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.8), m.paper);
  ctx.add(curtain, 0, -7.85, 0, haiden.userData.floorY + 2.9);
  offering(ctx, 0, -6.6, haiden.userData.floorY - 0.3, 'shrine');
  const honden = arch.hall({
    w: 12, d: 7, wallH: 3.6, podium: 0, raised: 2, pillar: 'cypress', wall: 'cypress', front: 'doors', railing: 'cypress',
    roof: { kind: 'gable', tone: 'copper', h: 4.4, curve: 1.05, lift: 0, gableTone: 'cypress' }, overhang: 1.6, bracket: 'cypress',
  });
  const ck = arch.chigiKatsuogi(honden.children[honden.children.length - 1] as THREE.Group, 12, 8, 'cypress', true);
  ck.position.y = honden.userData.eaveY;
  honden.add(ck);
  ctx.add(honden, 0, -32);
  [[40, 0, -50, 0], [40, -20, -30, Math.PI / 2], [40, 20, -30, Math.PI / 2]].forEach(([len, x, z, r]) => ctx.add(arch.fence(len, 2.8, 'cypress', true), x, z, r));

  ritualSet(ctx, { temizuya: [-11, 22, 0.5], ema: [13, 6, -0.6], omikuji: [-13, 6, 0.6] });

  // camphor forest, then Nagoya
  const clear = (x: number, z: number) => (Math.abs(x) < 16 && z > -10) || (Math.abs(x) < 26 && z <= -8 && z > -54) || (x < -12 && x > -34 && Math.abs(z - 60) < 6);
  ctx.scene.add(nat.forest('camphor', nat.scatter(70, { x0: -80, x1: 80, z0: -80, z1: 120 }, clear, 3), [0.9, 1.2]));
  ctx.scene.add(nat.forest('broadleaf', nat.scatter(90, { x0: -90, x1: 90, z0: -90, z1: 130 }, clear, 21), [1, 1.4]));
  const blocks: THREE.Matrix4[] = [];
  for (let a = 0; a < Math.PI * 2; a += 0.09) {
    const r = 120 + Math.random() * 40;
    const h = 10 + Math.random() * 45;
    blocks.push(new THREE.Matrix4().compose(new THREE.Vector3(Math.cos(a) * r, h / 2, Math.sin(a) * r), new THREE.Quaternion(), new THREE.Vector3(14, h, 14)));
  }
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xc9c4ba, roughness: 0.85 }), blocks.length);
  blocks.forEach((b, i) => city.setMatrixAt(i, b));
  city.computeBoundingSphere();
  ctx.scene.add(city);

  return {
    secrets: [
      {
        id: 'atsuta-okusu',
        at: [6.2, 34],
        r: 2.6,
        trigger: 'linger',
        seconds: 4,
        hint: 'This camphor is more than a thousand years old…',
        luck: 2,
        card: {
          title: 'Ōkusu, the great camphor',
          jp: '大楠',
          body: [
            'This sacred camphor is said to have been planted by the monk Kōbō Daishi (Kūkai) over a thousand years ago. People stand beside it to feel its quiet strength.',
            'Atsuta Jingū keeps Kusanagi no Tsurugi, one of the three Imperial Regalia of Japan. No one is allowed to see it, not even the priests.',
          ],
          ending: 'You rest your hand near the bark and breathe slowly.',
        },
      },
      {
        id: 'atsuta-nobunaga',
        at: [-17, 57],
        r: 2.4,
        trigger: 'linger',
        seconds: 3,
        luck: 2,
        card: {
          title: 'Nobunaga-bei, the warlord\'s wall',
          jp: '信長塀',
          body: [
            'In 1560 the young Oda Nobunaga stopped here to pray for victory on his way to fight Imagawa Yoshimoto, whose army was many times larger.',
            "He won the Battle of Okehazama, and in thanks donated this wall of clay and roof tiles. It is counted among Japan's three great earthen walls.",
          ],
          ending: 'You run your eyes along the layered tiles, built in thanks for a victory.',
        },
      },
    ],
    etiquette: {
      centerLines: [[0, 110, 0, -6]],
    },
    spawn: { x: 0, z: 106, rotY: 0 },
    bounds: { x0: -30, x1: 26, z0: -8, z1: 110 },
    walkable: (x, z) => (z > 10 ? Math.abs(x) < 7 || (x < -6 && x > -28 && Math.abs(z - 60) < 4) || (x > -16 && x < -6 && z < 28) : true),
    anchors: {
      torii: { at: [0, 98], look: [0, 92] },
      temizuya: { at: [-7.5, 22], look: [-11, 22] },
      haiden: { at: [0, 4], look: [0, -12] },
      ema: { at: [10, 6], look: [13, 6] },
      omikuji: { at: [-10, 6], look: [-13, 6] },
    },
    particles: 'none',
    fog: 0.8,
    orbit: { x: 0, z: 0, r: 42, y: 18 },
  };
};
