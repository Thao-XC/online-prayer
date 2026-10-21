import * as THREE from 'three';
import type { Layout } from './types';
import { offering, ritualSet } from './common';
import { ramp } from './types';

/**
 * Sensō-ji, Asakusa, Tokyo.
 * Kaminarimon (Thunder Gate) with its giant red 雷門 lantern and Fūjin/Raijin → Nakamise-dōri,
 * 250 m of little shops → Hōzōmon, the two-storey inner gate with its 小舟町 lantern → the incense
 * burner (jōkōro) → the vermilion Main Hall (Kannon-dō) with its huge steep roof. The five-storey pagoda
 * stands to the left, Asakusa Shrine to the right, city all around, and the Skytree on the horizon.
 */
export const sensoji: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  // the Main Hall stands on a 2 m podium reached by a broad flight of steps
  ctx.setGround((x, z) =>
    Math.abs(x) < 7 && z < -26 && z > -28.6 ? ramp(z, -26, -28.6, 0, 2) : Math.abs(x) < 16 && z <= -28.6 && z > -51 ? 2 : 0
  );
  ctx.terrain(0x6b6b63, 420, 40);
  ctx.path([[0, 112], [0, -24]], 13, 'paving');
  ctx.path([[-36, -6], [36, -6]], 60, 'paving');

  // Kaminarimon
  ctx.add(arch.gate({ w: 12, d: 6, h: 5.2, stories: 1, pillar: 'vermilion', wall: 'vermilion', roofTone: 'tile', lantern: { text: '雷門', size: 3.9 }, nio: true }), 0, 90);

  // Nakamise-dōri shops
  ctx.add(nat.shopRow(66, 1), -10, 48);
  ctx.add(nat.shopRow(66, -1), 10, 48);

  // Hōzōmon: two storeys, with lantern
  ctx.add(arch.gate({ w: 16, d: 7, h: 6, stories: 2, pillar: 'vermilion', wall: 'vermilion', roofTone: 'tile', lantern: { text: '小舟町', size: 3.4 }, nio: true }), 0, 6);
  // giant straw sandals (ō-waraji) on the back of Hōzōmon
  [-4.5, 4.5].forEach((x) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.25, 20), m.rope);
    w.scale.set(1, 1, 2.2);
    w.rotation.x = Math.PI / 2;
    ctx.add(w, x, 2.2, 0, 3.4);
  });

  // Five-storey pagoda (left) and incense burner
  ctx.add(arch.pagoda({ stories: 5, w: 6.5, storyH: 2.9, tone: 'vermilion', roofTone: 'tile' }), -24, -12);
  ctx.add(ctx.builder.buildJokoro(), 0, -10);

  // Main hall (Kannon-dō): huge steep tiled roof
  const hondo = arch.hall({
    w: 30, d: 20, wallH: 7, podium: 2.0, pillar: 'vermilion', wall: 'vermilion', front: 'open', railing: 'vermilion',
    roof: { kind: 'irimoya', tone: 'tile', h: 13, curve: 1.8, gableTone: 'vermilion' }, overhang: 3.2, bracket: 'vermilion',
  });
  ctx.add(hondo, 0, -40, 0, -2);
  ctx.scene.add(arch.stairs({ w: 14, z0: -26, z1: -28.6, y0: 0, y1: 2.0 }));
  offering(ctx, 0, -30.2, 0, 'temple', '志ほ入');

  // Asakusa Shrine (gongen-zukuri, black lacquer and copper)
  const jinja = arch.hall({ w: 12, d: 8, wallH: 3.6, podium: 0.6, pillar: 'black', wall: 'black', front: 'doors', roof: { kind: 'irimoya', tone: 'copper', h: 4, gableTone: 'black' }, overhang: 1.8, bracket: 'gold' });
  ctx.add(jinja, 26, -34, -Math.PI / 2);
  ctx.add(arch.torii({ style: 'myojin', tone: 'stone', h: 6 }), 16, -34, -Math.PI / 2);

  ritualSet(ctx, { ema: [13, -18, -0.4], omikuji: [-11, -24, 0.4] });

  // Trees inside the precinct
  ctx.scene.add(nat.forest('ginkgo', [[-14, -24], [15, -24], [-30, 4], [30, 2], [24, -50], [-24, -52]], [1.0, 1.3]));

  // City around the temple: instanced blocks
  const blocks: THREE.Matrix4[] = [];
  const add = (x: number, z: number, w: number, d: number, h: number) =>
    blocks.push(new THREE.Matrix4().compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d)));
  let seed = 5;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let z = 130; z > -110; z -= 12) {
    [-1, 1].forEach((s) => {
      if (z > 14 && z < 84) add(s * (19 + rnd() * 3), z, 10, 10, 5 + rnd() * 5);
      add(s * (50 + rnd() * 8), z, 12 + rnd() * 6, 10, 7 + rnd() * 12);
      add(s * (78 + rnd() * 10), z, 14, 11, 12 + rnd() * 28);
    });
  }
  for (let x = -60; x <= 60; x += 14) add(x, -78 - rnd() * 6, 12, 12, 10 + rnd() * 24);
  const winC = document.createElement('canvas');
  winC.width = winC.height = 64;
  const wg = winC.getContext('2d')!;
  wg.fillStyle = '#b9b2a6';
  wg.fillRect(0, 0, 64, 64);
  wg.fillStyle = '#5d6670';
  for (let wy = 6; wy < 64; wy += 16) for (let wx = 6; wx < 64; wx += 16) wg.fillRect(wx, wy, 8, 7);
  const winTex = new THREE.CanvasTexture(winC);
  winTex.wrapS = winTex.wrapT = THREE.RepeatWrapping;
  winTex.repeat.set(3, 4);
  winTex.colorSpace = THREE.SRGBColorSpace;
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ map: winTex, color: 0xd8d0c4, roughness: 0.85 }), blocks.length);
  blocks.forEach((b, i) => city.setMatrixAt(i, b));
  city.instanceMatrix.needsUpdate = true;
  city.computeBoundingSphere();
  ctx.add(city, 0, 0);

  // Tokyo Skytree on the horizon
  const tree = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 9, 150, 3), new THREE.MeshStandardMaterial({ color: 0xeef3f6, roughness: 0.4, metalness: 0.4, wireframe: false }));
  mast.position.y = 75;
  tree.add(mast);
  [96, 128].forEach((y, k) => {
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(k ? 4.2 : 6, k ? 4.2 : 6, k ? 3 : 6, 24), new THREE.MeshStandardMaterial({ color: 0xc5d3dc, metalness: 0.5, roughness: 0.3 }));
    deck.position.y = y;
    tree.add(deck);
  });
  const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.4, 40, 8), mast.material);
  ant.position.y = 170;
  tree.add(ant);
  ctx.add(tree, 130, -110);

  return {
    spawn: { x: 0, z: 104, rotY: 0 },
    bounds: { x0: -34, x1: 34, z0: -30, z1: 108 },
    walkable: (x, z) => (z > 14 && z < 84 ? Math.abs(x) < 6.8 : true),
    anchors: {
      torii: { at: [0, 97], look: [0, 90] },
      jokoro: { at: [0, -4], look: [0, -10] },
      pagoda: { at: [-15, -6], look: [-24, -12] },
      haiden: { at: [0, -21], look: [0, -40] },
      ema: { at: [10, -15], look: [13, -18] },
      omikuji: { at: [-8, -21], look: [-11, -24] },
    },
    particles: 'none',
    fog: 0.55,
    orbit: { x: 0, z: -14, r: 44, y: 18 },
    smoke: [0, 2.2, -10],
  };
};
