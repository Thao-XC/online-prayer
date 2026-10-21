import * as THREE from 'three';
import type { Layout } from './types';
import { hills } from './types';
import { offering, ritualSet } from './common';

/**
 * Hokkaidō Jingū, Sapporo (Maruyama Park).
 * Shown in its classic winter: the plain-timber torii and gravel sandō cleared through deep snow, Ezo
 * spruce and white birch, snow-laden roofs on the Shinmon gate and the unpainted Shinmei-style halls,
 * stone lanterns capped with snow. Kaitaku Jinja, honouring Hokkaidō's settlers, stands to the side.
 */
export const hokkaidoJingu: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  ctx.setGround((x, z) => (Math.abs(x) < 30 && z > -34 ? 0 : Math.max(0, hills(x, z, 2, 0.045)) + Math.max(0, Math.abs(x) - 30) * 0.15));
  ctx.terrain(0xe9eef2, 380, 140);
  ctx.path([[0, 108], [0, 20]], 9, 'gravel');
  ctx.path([[0, 20], [0, -26]], 30, 'gravel');
  // snow banks along the cleared path
  [-5.6, 5.6].forEach((x) => {
    const bank = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 84, 4, 8), m.roof.snow);
    bank.rotation.x = Math.PI / 2;
    bank.scale.set(1.4, 1, 0.5);
    ctx.add(bank, x, 64, 0, 0.1);
  });

  ctx.add(arch.torii({ style: 'myojin', tone: 'cypress', h: 10, plaque: '北海道神宮' }), 0, 92);
  ctx.add(arch.torii({ style: 'myojin', tone: 'cypress', h: 8 }), 0, 54);

  const snowyLantern = () => {
    const l = arch.stoneLantern(2.6);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.66, 0.35, 6), m.roof.snow);
    cap.position.y = 2.65;
    l.add(cap);
    return l;
  };
  for (let z = 84; z > 26; z -= 8) [-7.5, 7.5].forEach((x) => ctx.add(snowyLantern(), x, z));

  // Shinmon gate and the courtyard
  ctx.add(arch.gate({ w: 13, d: 6, h: 5, stories: 1, pillar: 'cypress', wall: 'cypress', roofTone: 'snow', bracket: 'cypress' }), 0, 20);
  const haiden = arch.hall({
    w: 20, d: 10, wallH: 4.6, podium: 0.8, pillar: 'cypress', wall: 'cypress', front: 'doors', railing: 'cypress',
    roof: { kind: 'gable', tone: 'snow', h: 5, curve: 1.15, gableTone: 'cypress' }, overhang: 2.4, bracket: 'cypress',
  });
  const ck = arch.chigiKatsuogi(haiden.children[haiden.children.length - 1] as THREE.Group, 16, 6, 'cypress', true);
  ck.position.y = haiden.userData.eaveY;
  haiden.add(ck);
  ctx.add(haiden, 0, -14);
  offering(ctx, 0, -7.4, haiden.userData.floorY - 0.3, 'shrine');
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.6), m.paper);
  ctx.add(curtain, 0, -8.85, 0, haiden.userData.floorY + 3.2);

  // Kaitaku Jinja (small shrine to the settlers)
  const kai = arch.hall({ w: 7, d: 5, wallH: 3, podium: 0.5, pillar: 'cypress', wall: 'cypress', front: 'doors', roof: { kind: 'gable', tone: 'snow', h: 2.6, gableTone: 'cypress' }, overhang: 1.2 });
  ctx.add(kai, 22, 4, -Math.PI / 2);
  ctx.add(arch.torii({ style: 'shinmei', tone: 'cypress', h: 4.6 }), 14, 4, -Math.PI / 2);

  ritualSet(ctx, { temizuya: [-12, 26, 0.4], ema: [13, -4, -0.6], omikuji: [-13, -4, 0.6] });

  // Ezo spruce and birch
  const clear = (x: number, z: number) => Math.abs(x) < 32 && z > -36 && z < 112;
  ctx.scene.add(nat.forest('spruceSnow', nat.scatter(170, { x0: -120, x1: 120, z0: -130, z1: 150 }, clear, 7), [1.1, 1.7], ctx.ground));
  ctx.scene.add(nat.forest('birch', nat.scatter(70, { x0: -90, x1: 90, z0: -100, z1: 140 }, clear, 3), [1, 1.3], ctx.ground));
  ctx.scene.add(nat.forest('spruceSnow', [[-22, 40], [22, 44], [-24, 70], [24, 76], [-20, -24], [21, -26]], [1.3, 1.5], ctx.ground));
  const mt = nat.mountain(110, 55, 0xdfe6ea, 4); // snowy Maruyama
  mt.position.set(-30, 0, -170);
  ctx.scene.add(mt);

  // an Ezo squirrel at the foot of a spruce
  const sq = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color: 0x7a4a2a, roughness: 0.9 });
  const sb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), fur);
  sb.scale.set(0.9, 1.1, 1.2);
  sb.position.y = 0.2;
  sq.add(sb);
  const sh = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), fur);
  sh.position.set(0, 0.38, 0.1);
  sq.add(sh);
  [-0.05, 0.05].forEach((x) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.12, 5), fur);
    ear.position.set(x, 0.5, 0.08);
    sq.add(ear);
  });
  const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.3, 4, 8), fur);
  tail.position.set(0, 0.35, -0.2);
  tail.rotation.x = 0.4;
  sq.add(tail);
  ctx.add(sq, -5.6, 60, 2.4, 0.4);
  nat.animated.push({ update: (t) => (sq.position.y = ctx.ground(-5.6, 60) + 0.4 + Math.max(0, Math.sin(t * 5)) * 0.15 * (Math.sin(t * 0.7) > 0.6 ? 1 : 0)) });

  return {
    secrets: [
      {
        id: 'hokkaido-squirrel',
        at: [-4, 60],
        r: 2.6,
        trigger: 'linger',
        seconds: 2,
        luck: 2,
        card: {
          title: 'Ezo risu, the Hokkaidō squirrel',
          jp: 'エゾリス',
          body: [
            "Maruyama Park's forest around the shrine is home to Ezo squirrels, a Hokkaidō subspecies of the red squirrel, with tufted ears in winter.",
            "They don't hibernate. In deep snow you can see them darting between the spruces, digging up the nuts they buried in autumn.",
          ],
          ending: 'It freezes, stares at you, and bounds off into the spruces.',
        },
      },
    ],
    etiquette: {
      centerLines: [[0, 108, 0, 0]],
      forbidden: [{ test: (x, z) => Math.abs(x) < 11 && z < -7.5 && z > -20, reason: 'The worship hall is for priests. Please pray from in front.' }],
    },
    spawn: { x: 0, z: 104, rotY: 0 },
    bounds: { x0: -28, x1: 28, z0: -28, z1: 108 },
    walkable: (x, z) => (z > 22 ? Math.abs(x) < 5 || (x < -6 && x > -16 && z < 32) : true),
    anchors: {
      torii: { at: [0, 98], look: [0, 92] },
      temizuya: { at: [-8.5, 26], look: [-12, 26] },
      haiden: { at: [0, 2], look: [0, -14] },
      ema: { at: [10, -3], look: [13, -4] },
      omikuji: { at: [-10, -3], look: [-13, -4] },
    },
    particles: 'snow',
    fog: 1.25,
    orbit: { x: 0, z: 4, r: 40, y: 16 },
  };
};
