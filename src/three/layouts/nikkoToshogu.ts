import * as THREE from 'three';
import type { Layout } from './types';
import { hills, ramp } from './types';
import { offering, ritualSet } from './common';

/**
 * Nikkō Tōshō-gū, Tochigi.
 * Up stone steps to the granite Ishidorii, with the vermilion five-storey pagoda on the left; through the
 * Omotemon (Niōmon) into the lower court with the plain-wood Sacred Stable (home of the three wise
 * monkeys); more steps up to the dazzling white-and-gold Yōmeimon, then the white Karamon and the
 * black-lacquer and gold Gongen-style worship hall. Bronze lanterns and giant cedars throughout.
 */
export const nikkoToshogu: Layout = (ctx) => {
  const { arch, nat, m } = ctx;
  ctx.setGround((x, z) => {
    let y = z > 74 ? 0 : z > 66 ? ramp(z, 74, 66, 0, 2.4) : z > 24 ? 2.4 : z > 18 ? ramp(z, 24, 18, 2.4, 5) : 5;
    if (z < -32) y += (-32 - z) * 0.4;
    y += Math.max(0, Math.abs(x) - 30) * 0.35;
    return y + (Math.abs(x) > 34 ? hills(x, z, 1.2) : 0);
  });
  ctx.terrain(0x354a2c);
  ctx.path([[0, 100], [0, 74]], 9, 'paving');
  ctx.path([[0, 66], [0, 24]], 22, 'gravel');
  ctx.path([[0, 18], [0, -30]], 30, 'gravel');
  ctx.scene.add(arch.stairs({ w: 12, z0: 74, z1: 66, y0: 0, y1: 2.4 }));
  ctx.scene.add(arch.stairs({ w: 10, z0: 24, z1: 18, y0: 2.4, y1: 5 }));

  // Ishidorii (granite) and the pagoda on the left
  ctx.add(arch.torii({ style: 'myojin', tone: 'stone', h: 9, plaque: '東照大権現' }), 0, 62);
  ctx.add(arch.pagoda({ stories: 5, w: 6, storyH: 2.8, tone: 'vermilion', roofTone: 'darkCopper' }), -18, 58);

  // Omotemon with niō
  ctx.add(arch.gate({ w: 13, d: 6, h: 5.4, stories: 1, pillar: 'vermilion', wall: 'vermilion', roofTone: 'darkCopper', nio: true, bracket: 'gold' }), 0, 44);
  // Sacred Stable (Shinkyūsha) – plain wood, with the monkey carvings
  const stable = arch.hall({ w: 10, d: 5, wallH: 3, podium: 0.4, pillar: 'darkWood', wall: 'darkWood', front: 'open', veranda: false, roof: { kind: 'irimoya', tone: 'bark', h: 3, gableTone: 'darkWood' }, overhang: 1.4 });
  ctx.add(stable, 16, 34, -Math.PI / 2);
  for (let k = 0; k < 8; k++) {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), new THREE.MeshStandardMaterial({ color: [0x2f6b4f, 0xc8862a, 0x3c5aa0][k % 3], roughness: 0.6 }));
    ctx.add(panel, 13.4, 30.5 + k * 1.0, -Math.PI / 2, 3.6);
  }

  // Yōmeimon: white pillars, gold and colour bracketing, two storeys
  ctx.add(arch.gate({ w: 12, d: 8, h: 5.4, stories: 2, pillar: 'white', wall: 'white', roofTone: 'darkCopper', bracket: 'gold' }), 0, 10);
  // the white-and-gold fence (tamagaki) running off each side of Yōmeimon
  [-1, 1].forEach((s) => ctx.add(arch.fence(18, 2.2, 'white', true), s * 16, 10));

  // Karamon (small white gate with gold) and the main shrine
  ctx.add(arch.gate({ w: 6.5, d: 4, h: 4, stories: 1, pillar: 'white', wall: 'gold', roofTone: 'darkCopper', bracket: 'gold' }), 0, -4);
  const haiden = arch.hall({
    w: 22, d: 12, wallH: 4.8, podium: 1.2, pillar: 'black', wall: 'black', front: 'doors', railing: 'gold',
    roof: { kind: 'irimoya', tone: 'darkCopper', h: 6.2, gableTone: 'gold' }, overhang: 2.4, bracket: 'gold',
  });
  ctx.add(haiden, 0, -20);
  offering(ctx, 0, -12.2, haiden.userData.floorY - 0.3, 'shrine');

  // Bronze lanterns lining the lower court (gifts of the daimyō)
  for (let z = 56; z > 26; z -= 6) [-9, 9].forEach((x) => ctx.add(arch.bronzeLantern(3.4), x, z));
  for (let z = 4; z > -10; z -= 5) [-11, 11].forEach((x) => ctx.add(arch.stoneLantern(2.6, m.bronzeDark), x, z));

  ritualSet(ctx, { temizuya: [-14, 32, 0.5], ema: [12, -2, -0.6], omikuji: [-12, -2, 0.6] });

  // Giant cedar avenue and forest
  const clear = (x: number, z: number) => Math.abs(x) < 26 && z > -34 && z < 104;
  const avenue: [number, number][] = [];
  for (let z = 100; z < 180; z += 6) [-7, 7].forEach((x) => avenue.push([x + (Math.random() - 0.5), z]));
  ctx.scene.add(nat.forest('cedar', avenue, [1.5, 1.9], ctx.ground));
  ctx.scene.add(nat.forest('cedar', nat.scatter(200, { x0: -130, x1: 130, z0: -130, z1: 180 }, (x, z) => clear(x, z) || (Math.abs(x) < 10 && z >= 100), 13), [1.3, 1.8], ctx.ground));
  ctx.scene.add(nat.forest('maple', nat.scatter(20, { x0: -40, x1: 40, z0: -40, z1: 100 }, (x, z) => Math.abs(x) < 24, 5), [0.9, 1.1], ctx.ground));

  // Sakashitamon, the little gate toward Ieyasu's tomb, with the Sleeping Cat carving above it
  const sk = arch.gate({ w: 4, d: 2.6, h: 3, stories: 1, pillar: 'vermilion', wall: 'vermilion', roofTone: 'darkCopper', bracket: 'gold' });
  ctx.add(sk, 22, -6, -Math.PI / 2);
  {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 96;
    const g = c.getContext('2d')!;
    g.fillStyle = '#2f6b4f';
    g.fillRect(0, 0, 256, 96);
    g.fillStyle = '#f2efe6';
    g.beginPath();
    g.ellipse(128, 62, 70, 24, 0, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(70, 50, 20, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#1a1a1a';
    g.fillRect(58, 48, 9, 2);
    g.fillRect(73, 48, 9, 2);
    g.fillStyle = '#e88aa0';
    [[150, 20], [180, 30], [210, 18]].forEach(([x, y]) => {
      g.beginPath();
      g.arc(x, y, 8, 0, Math.PI * 2);
      g.fill();
    });
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const cat = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), new THREE.MeshStandardMaterial({ map: tex }));
    ctx.add(cat, 20.6, -6, -Math.PI / 2, 3.2);
  }

  return {
    secrets: [
      {
        id: 'nikko-nemuri-neko',
        at: [19, -6],
        r: 2.4,
        trigger: 'linger',
        seconds: 2.5,
        hint: 'A small gate leads east, up toward the tomb. Look above it…',
        luck: 3,
        card: {
          title: 'Nemuri-neko, the Sleeping Cat',
          jp: '眠り猫',
          body: [
            "Above the gate to Ieyasu's tomb sleeps a small carved cat, attributed to the legendary carver Hidari Jingorō.",
            'On the back of the same beam, sparrows play. Because the cat is asleep, the sparrows are safe: a picture of the peace the Tokugawa brought after a century of war.',
            "Beyond the gate, 207 stone steps climb through the cedars to Tokugawa Ieyasu's resting place.",
          ],
          ending: 'You tiptoe past so as not to wake it.',
        },
      },
      {
        id: 'nikko-monkeys',
        at: [13, 34],
        r: 2.6,
        trigger: 'linger',
        seconds: 3,
        luck: 2,
        card: {
          title: 'See no evil, hear no evil, speak no evil',
          jp: '三猿',
          body: [
            'The famous three wise monkeys are carved on the Sacred Stable, where the shrine\'s sacred horse is kept. Monkeys were believed to protect horses.',
            'They are one panel in a series of eight telling the story of a life. Here, as children, they learn to shut out evil.',
          ],
          ending: 'You cover your eyes, ears and mouth, just to see how it feels.',
        },
      },
    ],
    etiquette: {
      centerLines: [[0, 100, 0, 24], [0, 18, 0, -6]],
      forbidden: [{ test: (x, z) => Math.abs(x) < 12 && z < -12 && z > -27, reason: 'The worship hall is for priests. Please pray from in front.' }],
    },
    spawn: { x: 0, z: 96, rotY: 0 },
    bounds: { x0: -26, x1: 26, z0: -30, z1: 100 },
    walkable: (x, z) => !(z > 9 && z < 11 && Math.abs(x) > 6.5 && Math.abs(x) < 26),
    anchors: {
      torii: { at: [0, 66], look: [0, 60] },
      temizuya: { at: [-10.5, 32], look: [-14, 32] },
      'spot-yomeimon': { at: [0, 22], look: [0, 12] },
      haiden: { at: [0, -7], look: [0, -20] },
      ema: { at: [9, -1], look: [12, -2] },
      omikuji: { at: [-9, -1], look: [-12, -2] },
    },
    particles: 'none',
    fog: 1.2,
    orbit: { x: 0, z: 20, r: 42, y: 18 },
  };
};
