import * as THREE from 'three';
import type { Layout } from './types';
import { ramp } from './types';
import { offering, ritualSet } from './common';

/**
 * Naminoue-gū, Naha (Okinawa).
 * Chief shrine of the Ryukyus, on a coral-limestone cliff above Naminoue beach and the East China Sea.
 * Ryukyu-style halls: vermilion pillars and red clay tiles set in white mortar; shisa lions instead of
 * komainu; palms, hibiscus and banyan (gajumaru). Legend says a fisherman found a glowing, talking stone
 * here — a gift from Nirai Kanai, the paradise beyond the sea.
 */
export const naminoue: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  const CLIFF = 12, SEA = 0.2;
  const cliffEdge = -30;
  const onStair = (x: number, z: number) => Math.abs(z - 32) < 2.4 && x > -42 && x < -27;
  ctx.setGround((x, z) => {
    if (onStair(x, z)) return ramp(x, -42, -28, 1.2, CLIFF);
    if (x > cliffEdge) return CLIFF + Math.max(0, x - 50) * 0.05;
    if (x > cliffEdge - 6) return ramp(x, cliffEdge, cliffEdge - 6, CLIFF, 1.2); // limestone face
    if (x > -64) return ramp(x, -36, -64, 1.2, 0.5); // beach
    return -3 + Math.max(0, x + 64) * 0; // reef shelf under the sea
  });
  ctx.terrain(0x6c8f45, 460, 200);
  // sand + cliff colouring
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(30, 300), new THREE.MeshStandardMaterial({ color: 0xeee2c2, roughness: 1 }));
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(-50, 0.62, 0);
  ctx.scene.add(sand);
  const face = new THREE.Mesh(new THREE.BoxGeometry(6, CLIFF, 300, 2, 8, 30), new THREE.MeshStandardMaterial({ color: 0xc9bf9f, roughness: 1, flatShading: true }));
  const fp = face.geometry.attributes.position;
  for (let i = 0; i < fp.count; i++) fp.setX(i, fp.getX(i) + (Math.sin(fp.getZ(i) * 0.4) + Math.cos(fp.getY(i) * 1.3)) * 0.6);
  face.geometry.computeVertexNormals();
  face.position.set(cliffEdge - 3, CLIFF / 2, 0);
  ctx.scene.add(face);
  const sea = ctx.water(SEA, 700, 700, -400, 0, 0x22b0b4);
  const stair = arch.stairs({ w: 4.6, z0: 0, z1: 14, y0: 1.2, y1: CLIFF });
  stair.position.set(-42, 0, 32);
  stair.rotation.y = Math.PI / 2;
  ctx.scene.add(stair);

  ctx.path([[60, 0], [20, 0]], 9, 'paving');
  ctx.path([[20, 0], [-6, 0]], 22, 'paving');

  // light stone torii and shisa
  ctx.add(arch.torii({ style: 'myojin', tone: 'stone', h: 7.4, plaque: '波上宮' }), 44, 0, -Math.PI / 2);
  [-1, 1].forEach((s) => ctx.add(nat.figure('shisa'), 40, s * 5, -Math.PI / 2 + s * 0.3));

  // Ryukyu-style haiden and honden with red tiles
  const haiden = arch.hall({
    w: 18, d: 10, wallH: 4.2, podium: 1.0, pillar: 'vermilion', wall: 'plaster', front: 'lattice', railing: 'vermilion',
    roof: { kind: 'irimoya', tone: 'redtile', h: 5, curve: 1.15, lift: 0.25, gableTone: 'vermilion' }, overhang: 2.4, bracket: 'vermilion',
  });
  ctx.add(haiden, 0, 0, -Math.PI / 2);
  offering(ctx, 7, 0, haiden.userData.floorY - 0.3, 'shrine', undefined, -Math.PI / 2);
  const honden = arch.hall({ w: 10, d: 8, wallH: 3.8, podium: 1.4, pillar: 'vermilion', wall: 'plaster', front: 'doors', roof: { kind: 'hip', tone: 'redtile', h: 4, curve: 1.1, lift: 0.2 }, overhang: 1.8, bracket: 'vermilion' });
  ctx.add(honden, -16, 0, -Math.PI / 2);
  // coral-stone walls (low, curved Ryukyu masonry)
  [-1, 1].forEach((s) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(40, 1.6, 1.2), new THREE.MeshStandardMaterial({ color: 0xd9cfb0, roughness: 1 }));
    ctx.add(wall, 6, s * 18, 0, 0.8);
  });

  ritualSet(ctx, { temizuya: [26, 12, Math.PI], ema: [14, -14, 0.2], omikuji: [-22, -10, 0.6] });

  // tropical planting, Naha behind
  ctx.scene.add(nat.forest('palm', [[30, 14], [30, -14], [18, 20], [-8, 20], [-24, 16], [-26, -16], [-46, 30], [-44, -40], [-50, 60], [-48, -80]], [0.9, 1.2], ctx.ground));
  ctx.scene.add(nat.forest('hibiscus', [[34, 8], [34, -8], [22, 12], [22, -12], [-4, 14], [-4, -14], [-20, 12]], [1, 1.3], ctx.ground));
  ctx.scene.add(nat.forest('broadleaf', [[48, 20], [52, -22], [-18, 24], [10, 26], [10, -26]], [1.2, 1.5], ctx.ground));
  const blocks: THREE.Matrix4[] = [];
  for (let i = 0; i < 90; i++) {
    const x = 70 + Math.random() * 140, z = -160 + Math.random() * 320, h = 6 + Math.random() * 22;
    blocks.push(new THREE.Matrix4().compose(new THREE.Vector3(x, CLIFF + h / 2, z), new THREE.Quaternion(), new THREE.Vector3(12, h, 12)));
  }
  const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xf1ede4, roughness: 0.9 }), blocks.length);
  blocks.forEach((b, i) => city.setMatrixAt(i, b));
  city.computeBoundingSphere();
  ctx.scene.add(city);

  return {
    spawn: { x: 58, z: 0, rotY: Math.PI / 2 },
    bounds: { x0: -62, x1: 62, z0: -40, z1: 40 },
    walkable: (x, z) => x > cliffEdge + 0.5 || onStair(x, z) || (x < cliffEdge - 6 && x > -62),
    anchors: {
      torii: { at: [52, 0], look: [44, 0] },
      temizuya: { at: [26, 9], look: [26, 12] },
      haiden: { at: [19, 0], look: [0, 0] },
      ema: { at: [14, -11], look: [14, -14] },
      omikuji: { at: [-22, -7], look: [-22, -10] },
    },
    particles: 'none',
    fog: 0.35,
    orbit: { x: -6, z: 0, r: 46, y: 20 },
    bobbingWater: sea,
  };
};
