import * as THREE from 'three';
import type { EncounterDef, EncounterKit, EncounterRuntime } from './types';
import {
  mermaid, heikeCrab, fishSchool, shark, koi, turtle, coralPatch, seaweed, raijin, fudo, monk,
  uzume, rooster, dragon, robedFigure, spiritOrbs, ghostFlames, tamatebako, lightShaft,
} from './figures';
import { goldenPavilion } from '../layouts/kinkakuji';
import { soundService } from '../../services/soundService';

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

type Place = { zone: (x: number, z: number) => boolean; exit: { x: number; z: number; rotY: number } };

/** fire-once events keyed by name */
function timeline() {
  const fired = new Set<string>();
  return (key: string, cond: boolean, fn: () => void) => {
    if (cond && !fired.has(key)) {
      fired.add(key);
      fn();
    }
  };
}

/** ground mesh for a pocket world, following its own height function */
function floor(root: THREE.Group, ground: (x: number, z: number) => number, size: number, color: number, seg = 60) {
  const geo = new THREE.PlaneGeometry(size, size, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setY(i, ground(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1, flatShading: true }));
  m.receiveShadow = true;
  root.add(m);
  return m;
}

function place<T extends THREE.Object3D>(root: THREE.Group, o: T, x: number, y: number, z: number, rotY = 0, s = 1): T {
  o.position.set(x, y, z);
  o.rotation.y = rotY;
  o.scale.multiplyScalar(s);
  root.add(o);
  return o;
}

/** a water surface seen from below */
function surfaceFromBelow(root: THREE.Group, y: number, size: number, color: number) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })
  );
  m.rotation.x = Math.PI / 2;
  m.position.y = y;
  root.add(m);
  return m;
}

const dist = (p: { x: number; z: number }, x: number, z: number) => Math.hypot(p.x - x, p.z - z);
const ring = (r: number) => ({ x0: -r, x1: r, z0: -r, z1: r });

/* ------------------------------------------------------------------ */
/* 1. Itsukushima — Ryūgū-jō, the Dragon Palace                        */
/* ------------------------------------------------------------------ */
export const ryuguJo = (p: Place): EncounterDef => ({
  id: 'itsukushima-ryugu',
  title: 'Ryūgū-jō',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x0d5566,
  card: {
    title: 'Ryūgū-jō, the Dragon Palace',
    jp: '竜宮城',
    body: [
      'Itsukushima was the family shrine of the Taira (Heike) clan. In 1185 they were destroyed in the sea battle of Dan-no-ura. As the boy-emperor Antoku was carried into the waves, his grandmother is said to have told him: "There is a capital beneath the waves, too."',
      'Fishermen of the Inland Sea still find Heike crabs, whose shells look like scowling samurai faces: the drowned warriors, they say.',
      'In the old tale of Urashima Tarō, a fisherman is welcomed into the Dragon Palace by Princess Otohime. When he goes home she gives him a jewelled box and tells him never to open it. He opens it anyway: white smoke pours out, and three hundred years have passed.',
    ],
    ending: 'You opened the box. White smoke… and you are standing on the shrine platform again. How long were you gone?',
  },
  build: (k: EncounterKit): EncounterRuntime => {
    const { root, arch, m } = k;
    const ground = (x: number, z: number) => Math.sin(x * 0.12) * Math.cos(z * 0.1) * 0.6 + Math.max(0, Math.hypot(x, z + 6) - 34) * 0.6;
    floor(root, ground, 110, 0xc8b88f);
    surfaceFromBelow(root, 16, 200, 0x6fd6e6);
    const anims: ((t: number) => void)[] = [];
    // palace (Ryūgū-jō is drawn with a white turret gate, like Akama Shrine's Suitenmon)
    const gate = arch.gate({ w: 12, d: 6, h: 5, stories: 2, pillar: 'vermilion', wall: 'plaster', roofTone: 'copper', bracket: 'gold' });
    place(root, gate, 0, 0, -16);
    const hall = arch.hall({ w: 20, d: 12, wallH: 5, podium: 1, pillar: 'vermilion', wall: 'gold', front: 'open', railing: 'vermilion', roof: { kind: 'irimoya', tone: 'copper', h: 6, gableTone: 'gold' }, overhang: 2.4, bracket: 'gold' });
    place(root, hall, 0, 0, -34);
    const palaceGlow = new THREE.PointLight(0xffc77a, 40, 40, 1.6);
    palaceGlow.position.set(0, 6, -24);
    root.add(palaceGlow);
    // Otohime and her box
    const oto = robedFigure({ robe: 0xf3a8c0, under: 0xf6e6c8, longHair: true, hat: 'crown', h: 1.75 });
    place(root, oto, 0, 0, -10.5, 0);
    const box = place(root, tamatebako(), 0, 0, -8.6);
    // sea life
    const mer = mermaid();
    root.add(mer);
    anims.push(mer.userData.animate!);
    const school = place(root, fishSchool(90, [0xf2c94c, 0xbfe3ff, 0xff8a5c], 14, 8), 0, 3, 0);
    anims.push(school.userData.animate!);
    const kelp = place(root, seaweed(60, 50, 0x3f7a3a, 4), 0, 0, 0);
    anims.push(kelp.userData.animate!);
    place(root, coralPatch(40, 44, 3), 0, 0, 4);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const r = 5 + Math.random() * 12;
      place(root, heikeCrab(), Math.cos(a) * r, ground(Math.cos(a) * r, Math.sin(a) * r), Math.sin(a) * r + 6, Math.random() * 6, 1.2);
    }
    [[-8, 4], [9, -2], [0, 12], [-14, -12], [14, -18]].forEach(([x, z]) => place(root, lightShaft(18, 2.2), x, 0, z));
    const tl = timeline();
    return {
      enter: { x: 0, z: 18, rotY: 0 },
      ground,
      bounds: ring(30),
      env: { bg: 0x0b3b4a, fog: 0x1d6f7d, density: 0.04, sun: 0.9, sunColor: 0xbfe9ff, hemi: 0.9, ambient: 0.35 },
      underwater: true,
      update: (t, _dt, pl, api) => {
        anims.forEach((a) => a(t));
        mer.position.set(Math.cos(t * 0.35) * 9, 4 + Math.sin(t * 0.7), Math.sin(t * 0.35) * 9 + 4);
        mer.rotation.set(0, -t * 0.35, Math.PI / 2.6);
        box.rotation.y = t * 0.4;
        oto.rotation.y = Math.atan2(pl.x - oto.position.x, pl.z - oto.position.z);
        tl('in', t > 0.4, () => {
          soundService.playSplash();
          api.caption('You sink beneath the Seto Inland Sea…', 4);
        });
        tl('crabs', t > 6, () => api.caption('Shells on the seabed stare back: the faces of drowned Heike warriors.', 5));
        tl('mermaid', t > 13, () => api.caption('A ningyo, a mermaid, circles above you.', 4));
        tl('palace', dist(pl, 0, -16) < 16, () => api.caption('A palace of coral and vermilion: Ryūgū-jō. Princess Otohime is waiting.', 5));
        tl('box', dist(pl, 0, -8.6) < 2.6, () => {
          api.caption('Otohime gives you a lacquered box. "Never open it." You open it.', 4);
          api.flash(0xffffff, 0.9, 1.2);
          api.end(0xffffff, 2.2);
        });
        tl('timeout', t > 120, () => {
          api.caption('The current carries you gently home.', 4);
          api.end(0x0d5566, 2);
        });
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 2. Naminoue — the reef, Nirai Kanai … and the shark                 */
/* ------------------------------------------------------------------ */
export const niraiKanai = (p: Place): EncounterDef => ({
  id: 'naminoue-nirai',
  title: 'Nirai Kanai',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x1aa5b8,
  card: {
    title: 'Nirai Kanai, the land beyond the sea',
    jp: 'ニライカナイ',
    body: [
      'In Ryukyuan belief, Nirai Kanai lies far across the eastern sea. It is the home of the gods and the source of life, rain and good harvests, and the place souls return to.',
      'Naminoue-gū\'s founding legend tells of a fisherman who found a shining stone on this shore that spoke to him and brought rich catches: a gift from the gods of Nirai Kanai. He enshrined it on the cliff above the waves, where the shrine stands today.',
      'The sea gives, and the sea takes. Okinawans have always prayed here for safe voyages.',
    ],
    ending: 'Tiger shark! You wake on Naminoue beach, sunburned and shaken, but alive.',
  },
  build: (k): EncounterRuntime => {
    const { root } = k;
    const ground = (x: number, z: number) => Math.sin(x * 0.2) * Math.cos(z * 0.17) * 0.4 + Math.max(0, Math.abs(x) - 26) * 0.5;
    floor(root, ground, 120, 0xeadfbe);
    surfaceFromBelow(root, 12, 220, 0x9df2ff);
    const anims: ((t: number) => void)[] = [];
    place(root, coralPatch(120, 50, 7), 0, 0, -6);
    ['a', 'b', 'c'].forEach((_, i) => {
      const sch = place(root, fishSchool(70, [[0xffd23a, 0x3fb6ff, 0xff7aa2], [0x6af0c6, 0xffffff, 0xff9a3a], [0x2c6bff, 0xffe066, 0xff5a5a]][i], 6 + i * 4, 5), -10 + i * 10, 1.5, -4 - i * 8);
      anims.push(sch.userData.animate!);
    });
    const tur = place(root, turtle(), 0, 4, -6);
    anims.push(tur.userData.animate!);
    [[-10, 0], [8, -8], [0, -20]].forEach(([x, z]) => place(root, lightShaft(14, 2.6, 0xe9ffff), x, 0, z));
    // the glow of Nirai Kanai on the horizon
    const nk = new THREE.Group();
    const sun = new THREE.Mesh(new THREE.CircleGeometry(6, 40), new THREE.MeshBasicMaterial({ color: 0xfff1b8, fog: false }));
    nk.add(sun);
    const halo = new THREE.Mesh(new THREE.RingGeometry(6.5, 11, 40), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.35, fog: false }));
    nk.add(halo);
    place(root, nk, 0, 6, -48);
    const sh = shark(4.6);
    sh.visible = false;
    root.add(sh);
    anims.push(sh.userData.animate!);
    const tl = timeline();
    let attackT = -1;
    return {
      enter: { x: 0, z: 18, rotY: 0 },
      ground,
      bounds: ring(30),
      env: { bg: 0x0f6f8a, fog: 0x2bb5c4, density: 0.028, sun: 1.6, sunColor: 0xeaffff, hemi: 1.1, ambient: 0.5 },
      underwater: true,
      update: (t, _dt, pl, api) => {
        anims.forEach((a) => a(t));
        tur.position.set(Math.cos(t * 0.2) * 8, 4 + Math.sin(t * 0.5) * 0.6, Math.sin(t * 0.2) * 8 - 6);
        tur.rotation.y = -t * 0.2;
        halo.rotation.z = t * 0.2;
        tl('in', t > 0.4, () => {
          soundService.playSplash();
          api.caption('The water is warm and impossibly clear.', 4);
        });
        tl('nirai', t > 7, () => api.caption('Far to the east, a glow on the horizon: Nirai Kanai, where the gods live.', 5));
        tl('blessing', dist(pl, 0, -48) < 22, () => {
          api.caption('The gods of Nirai Kanai send you home with a blessing.', 4);
          api.flash(0xfff1b8, 0.9, 1);
          api.end(0xfff1b8, 2);
        });
        tl('circling', t > 17, () => {
          sh.visible = true;
          soundService.playRumble(2);
          api.caption('Something large is circling…', 3);
        });
        if (sh.visible) {
          if (t < 27) {
            const r = Math.max(5, 22 - (t - 17) * 1.6);
            const a = t * 0.9;
            sh.position.set(pl.x + Math.cos(a) * r, pl.y - 1, pl.z + Math.sin(a) * r);
            sh.rotation.y = -a + Math.PI;
          } else {
            if (attackT < 0) {
              attackT = t;
              api.caption('Tiger shark!', 2);
              api.shake(0.25, 1.2);
            }
            const k2 = Math.min(1, (t - attackT) / 1.1);
            const dx = pl.x - sh.position.x, dz = pl.z - sh.position.z;
            sh.position.x += dx * k2 * 0.12;
            sh.position.z += dz * k2 * 0.12;
            sh.position.y += (pl.y - 0.3 - sh.position.y) * 0.1;
            sh.rotation.y = Math.atan2(dx, dz);
            tl('chomp', Math.hypot(dx, dz) < 2.4 || t - attackT > 1.6, () => {
              api.flash(0x9e0f0f, 0.95, 0.4);
              api.shake(0.5, 0.6);
              api.end(0x000000, 0.9);
            });
          }
        }
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 3. Kinkaku-ji — the world under the Mirror Pond                     */
/* ------------------------------------------------------------------ */
export const mirrorWorld = (p: Place): EncounterDef => ({
  id: 'kinkaku-mirror',
  title: 'Under the Mirror Pond',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x1e3b38,
  card: {
    title: 'The burning of the Golden Pavilion',
    jp: '金閣寺放火事件',
    body: [
      'Kyōko-chi, the "Mirror Pond", was laid out so the Golden Pavilion would float twice: once in the air, once upside down in the water.',
      'On 2 July 1950 a 21-year-old acolyte of the temple set the pavilion on fire, and the 14th-century building burned to the ground. Yukio Mishima turned the event into his novel The Temple of the Golden Pavilion.',
      'The pavilion you see today was rebuilt in 1955 and re-covered in fresh gold leaf in 1987.',
    ],
    ending: 'The reflection burned, but the pavilion above still stands. You climb out on the south shore.',
  },
  build: (k): EncounterRuntime => {
    const { root, arch, m } = k;
    const ground = (x: number, z: number) => Math.sin(x * 0.2) * Math.cos(z * 0.25) * 0.4 + Math.max(0, Math.hypot(x * 0.8, z) - 22) * 0.6;
    floor(root, ground, 90, 0x3b3a2a);
    surfaceFromBelow(root, 14, 160, 0x8fb7a8);
    const anims: ((t: number) => void)[] = [];
    // the reflection: the pavilion hanging upside down from the surface
    const inv = goldenPavilion(arch, m);
    inv.scale.set(1, -1, 1);
    inv.position.set(0, 14, -12);
    root.add(inv);
    inv.traverse((c) => {
      const mesh = c as THREE.Mesh;
      if (mesh.isMesh) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.side = THREE.DoubleSide;
        mesh.material = mat;
      }
    });
    const flames = ghostFlames(70, 14, 0xff8a2a);
    flames.position.set(0, 2, -10);
    flames.visible = false;
    root.add(flames);
    anims.push(flames.userData.animate!);
    const fireLight = new THREE.PointLight(0xff8a3a, 0, 40, 1.5);
    fireLight.position.set(0, 6, -12);
    root.add(fireLight);
    const ko = koi(3.2, [0xf6efe6, 0xd8461f]);
    root.add(ko);
    anims.push(ko.userData.animate!);
    const reeds = place(root, seaweed(70, 60, 0x4f6a3a, 5), 0, 0, 0);
    anims.push(reeds.userData.animate!);
    const tl = timeline();
    let burn = -1;
    return {
      enter: { x: 0, z: 16, rotY: 0 },
      ground,
      bounds: ring(26),
      env: { bg: 0x0d1f1d, fog: 0x264a44, density: 0.045, sun: 0.7, sunColor: 0xd8ffe8, hemi: 0.7, ambient: 0.3 },
      underwater: true,
      update: (t, _dt, pl, api) => {
        anims.forEach((a) => a(t));
        ko.position.set(Math.cos(t * 0.3) * 7, 3 + Math.sin(t * 0.6) * 0.5, Math.sin(t * 0.3) * 7 + 2);
        ko.rotation.y = -t * 0.3;
        tl('in', t > 0.4, () => {
          soundService.playSplash();
          api.caption('Under the Mirror Pond the pavilion hangs upside down: its reflection, made real.', 5);
        });
        tl('koi', t > 8, () => api.caption('A koi older than the temple circles you, unblinking.', 4));
        tl('burn', t > 16 || dist(pl, 0, -12) < 9, () => {
          burn = t;
          flames.visible = true;
          soundService.playRumble(3);
          api.caption('The reflection shivers… and catches fire.', 4);
          api.flash(0xff8a3a, 0.6, 0.8);
        });
        if (burn > 0) {
          const k2 = Math.min(1, (t - burn) / 6);
          flames.scale.setScalar(0.4 + k2 * 1.6);
          fireLight.intensity = 60 * k2;
          api.setEnv({ fog: 0x4a2a18 });
        }
        tl('end', burn > 0 && t - burn > 9, () => api.end(0x000000, 1.8));
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 4. Tōdai-ji — Uneme, the drowned court lady                         */
/* ------------------------------------------------------------------ */
export const unemeGhost = (p: Place): EncounterDef => ({
  id: 'todaiji-uneme',
  title: 'The Weeping Court Lady',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x16261b,
  card: {
    title: 'Uneme, the drowned court lady',
    jp: '采女',
    body: [
      'In the Nara period, a court lady (uneme) who had lost the emperor\'s favour drowned herself in Sarusawa Pond, a short walk from here.',
      'The little Uneme Shrine beside that pond stands with its back to the water. Legend says it turned around by itself overnight, because her spirit could not bear to look at the pond where she died.',
      'Every year at the mid-autumn full moon, the Uneme Festival floats a boat decked with autumn flowers across the pond to comfort her.',
    ],
    ending: 'Her comb sinks back into the dark. You come up gasping at the pond\'s edge.',
  },
  build: (k): EncounterRuntime => {
    const { root } = k;
    const ground = (x: number, z: number) => Math.sin(x * 0.3 + z * 0.2) * 0.3 + Math.max(0, Math.hypot(x, z) - 18) * 0.7;
    floor(root, ground, 70, 0x2a2a1c);
    surfaceFromBelow(root, 7, 120, 0x5d7a5a);
    const anims: ((t: number) => void)[] = [];
    const reeds = place(root, seaweed(140, 34, 0x51663a, 5.5), 0, 0, 0);
    anims.push(reeds.userData.animate!);
    const comb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.18), new THREE.MeshStandardMaterial({ color: 0x3a1a10, emissive: 0x401a08, roughness: 0.3 }));
    place(root, comb, 0, ground(0, -8) + 0.05, -8, 0.3);
    const ghost = robedFigure({ robe: 0xeef3f0, under: 0xd9e2dd, skin: 0xe6eeea, longHair: true, ghost: true, h: 1.75 });
    place(root, ghost, 0, 0.3, -13);
    const coldLight = new THREE.PointLight(0x9fd3c0, 8, 12, 2);
    ghost.add(coldLight);
    coldLight.position.y = 1.3;
    const tl = timeline();
    return {
      enter: { x: 0, z: 10, rotY: 0 },
      ground,
      bounds: ring(16),
      env: { bg: 0x0a140e, fog: 0x1d3424, density: 0.06, sun: 0.35, sunColor: 0xcfe8c8, hemi: 0.35, ambient: 0.15 },
      underwater: true,
      update: (t, dt, pl, api) => {
        anims.forEach((a) => a(t));
        tl('in', t > 0.4, () => {
          soundService.playSplash();
          api.caption('The pond is green, cold, and very still.', 4);
        });
        tl('pale', t > 6, () => api.caption('Something pale moves between the reeds.', 4));
        tl('comb', dist(pl, 0, -8) < 3, () => api.caption('A lacquered comb lies in the mud. Somewhere, a woman is weeping.', 5));
        if (t > 6) {
          // drift slowly toward you, hair over her face
          const dx = pl.x - ghost.position.x, dz = pl.z - ghost.position.z;
          const d = Math.hypot(dx, dz);
          const sp = Math.min(1.6, 0.5 + t * 0.03) * dt;
          if (d > 1.2) {
            ghost.position.x += (dx / d) * sp;
            ghost.position.z += (dz / d) * sp;
          }
          ghost.position.y = 0.3 + Math.sin(t * 0.8) * 0.25;
          ghost.rotation.y = Math.atan2(dx, dz);
          tl('face', d < 2.6, () => {
            api.caption('She lifts her face—', 2);
            api.shake(0.15, 0.6);
            api.flash(0xe8f2ee, 0.95, 0.4);
            api.end(0xcfe0d8, 1.4);
          });
        }
        tl('timeout', t > 70, () => api.end(0x16261b, 2));
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 5. Dazaifu — Tenjin, the god of thunder                             */
/* ------------------------------------------------------------------ */
export const tenjinStorm = (p: Place): EncounterDef => ({
  id: 'dazaifu-tenjin',
  title: 'The Thunder of Tenjin',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x0c0f18,
  card: {
    title: 'Tenjin, lord of learning — and of thunder',
    jp: '天神・菅原道真',
    body: [
      'Sugawara no Michizane was a brilliant scholar and statesman of the Heian court. Falsely accused by his rivals, he was exiled to Dazaifu, where he died in 903.',
      'Afterwards disaster struck the capital: his rivals died one after another, and in 930 lightning hit the imperial palace itself. The court decided his angry spirit was to blame. To calm him they restored his honours and worshipped him as Tenjin, a god of thunder who became the god of learning. Students still pray here before exams.',
      'The plum tree he loved in Kyoto is said to have flown here overnight to be with him: the Tobiume, still blooming in front of the main hall.',
    ],
    ending: 'Plum blossom falls on still water. The storm has passed.',
  },
  build: (k): EncounterRuntime => {
    const { root, nat } = k;
    const ground = (x: number, z: number) => (Math.hypot(x * 0.7, z) < 18 ? -0.9 : 0.3 + Math.max(0, Math.hypot(x * 0.7, z) - 18) * 0.3);
    floor(root, ground, 100, 0x2c3a24);
    const pond = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({ color: 0x1c2a33, roughness: 0.55, metalness: 0.05 }));
    pond.scale.set(25, 18, 1);
    pond.rotation.x = -Math.PI / 2;
    pond.position.y = -0.05;
    root.add(pond);
    root.add(nat.forest('plum', Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2;
      return [Math.cos(a) * 30, Math.sin(a) * 23] as [number, number];
    }), [1.1, 1.4], () => 0.3));
    const anims: ((t: number) => void)[] = [];
    const rj = raijin();
    place(root, rj, 0, 7.5, -20, 0, 1.4);
    anims.push(rj.userData.animate!);
    const michi = robedFigure({ robe: 0x14141a, under: 0x3a2a6a, hat: 'eboshi', ghost: false, h: 1.8 });
    place(root, michi, 0, -2.5, 0);
    const aura = new THREE.PointLight(0xb8c8ff, 0, 10, 2);
    aura.position.y = 1.4;
    michi.add(aura);
    // rain
    const rainN = 900;
    const rainPos = new Float32Array(rainN * 3);
    for (let i = 0; i < rainN; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 40;
      rainPos[i * 3 + 1] = Math.random() * 20;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    const rainGeo = new THREE.BufferGeometry();
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rain = new THREE.Points(rainGeo, new THREE.PointsMaterial({ color: 0xaab8c8, size: 0.08, transparent: true, opacity: 0.7 }));
    root.add(rain);
    // falling plum petals for the calm
    const petN = 300;
    const petPos = new Float32Array(petN * 3);
    for (let i = 0; i < petN; i++) {
      petPos[i * 3] = (Math.random() - 0.5) * 30;
      petPos[i * 3 + 1] = Math.random() * 14;
      petPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    const petGeo = new THREE.BufferGeometry();
    petGeo.setAttribute('position', new THREE.BufferAttribute(petPos, 3));
    const petals = new THREE.Points(petGeo, new THREE.PointsMaterial({ color: 0xffe3ee, size: 0.25, transparent: true, opacity: 0.9 }));
    petals.visible = false;
    root.add(petals);
    const tl = timeline();
    let nextBolt = 2.5;
    let calm = -1;
    return {
      enter: { x: 0, z: 10, rotY: 0 },
      ground,
      bounds: ring(17),
      env: { bg: 0x0c0f18, fog: 0x1a1f2b, density: 0.03, sun: 0.25, sunColor: 0x9fb0d0, hemi: 0.3, ambient: 0.12 },
      update: (t, dt, pl, api) => {
        anims.forEach((a) => a(t));
        if (calm < 0) {
          const a = rain.geometry.getAttribute('position') as THREE.BufferAttribute;
          const arr = a.array as Float32Array;
          for (let i = 1; i < arr.length; i += 3) {
            arr[i] -= dt * 22;
            if (arr[i] < -1) arr[i] = 20;
          }
          a.needsUpdate = true;
          if (t > nextBolt) {
            nextBolt = t + 3 + Math.random() * 3;
            api.flash(0xf2f6ff, 0.8, 0.35);
            api.shake(0.12, 0.4);
            soundService.playThunder();
          }
        } else {
          const a = petals.geometry.getAttribute('position') as THREE.BufferAttribute;
          const arr = a.array as Float32Array;
          for (let i = 0; i < arr.length; i += 3) {
            arr[i + 1] -= dt * 0.8;
            arr[i] += Math.sin(t + i) * dt * 0.3;
            if (arr[i + 1] < 0) arr[i + 1] = 14;
          }
          a.needsUpdate = true;
          rj.position.y += dt * 2;
        }
        tl('in', t > 0.3, () => api.caption('You wade into the heart-shaped pond. The sky goes black.', 4));
        tl('raijin', t > 6, () => api.caption('Thunder, and Raijin, the thunder god, beats his drums above you.', 5));
        tl('rise', t > 11, () => api.caption('A courtier in black robes rises from the water: Sugawara no Michizane.', 5));
        if (t > 11 && michi.position.y < 0) {
          michi.position.y = Math.min(0, -2.5 + (t - 11) * 1.2);
          aura.intensity = 12;
        }
        if (t > 11) michi.rotation.y = Math.atan2(pl.x - michi.position.x, pl.z - michi.position.z);
        tl('calm', t > 19, () => {
          calm = t;
          rain.visible = false;
          petals.visible = true;
          soundService.playBellChime();
          api.caption('His anger fades. Plum blossoms begin to fall.', 5);
          api.setEnv({ bg: 0xbfd2e6, fog: 0xe6dbe6, density: 0.02, sun: 1.4, sunColor: 0xfff2e6, hemi: 0.9, ambient: 0.35 });
        });
        tl('end', calm > 0 && t - calm > 7, () => api.end(0xfff0f4, 1.8));
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 6. Kumano Nachi — Mongaku under the falls, Fudō Myōō                */
/* ------------------------------------------------------------------ */
export const fudoFalls = (p: Place): EncounterDef => ({
  id: 'nachi-fudo',
  title: 'Under Nachi Falls',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0xdfe8e6,
  card: {
    title: 'Mongaku and Fudō Myōō at the falls',
    jp: '文覚の荒行・不動明王',
    body: [
      'Nachi-no-Taki falls 133 metres in a single drop, the tallest in Japan. The waterfall itself is a god: Hiryū Gongen, the origin of the shrine. Mountain ascetics came to stand in its plunge pool as a trial of faith.',
      'The Tale of the Heike tells of the monk Mongaku, who vowed to stand in the freezing pool for twenty-one days. When he lost consciousness and was swept downstream, two boys sent by Fudō Myōō, Kongara and Seitaka, carried him back to life.',
      'Fudō, the "Immovable", is a fierce protector: blue-skinned, holding a sword to cut through delusion and a rope to bind evil, surrounded by flames.',
    ],
    ending: 'Cold water, warm flames. You find yourself set down gently on the trail.',
  },
  build: (k): EncounterRuntime => {
    const { root, nat } = k;
    const ground = (x: number, z: number) => (Math.hypot(x, z + 6) < 16 ? -0.9 : 0.4 + (Math.hypot(x, z + 6) - 16) * 0.8);
    floor(root, ground, 90, 0x3d4a38);
    const fall = nat.waterfall(46, 6);
    fall.position.set(0, -0.9, -22);
    fall.traverse((c) => {
      const mm = (c as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (mm && mm.transparent && mm.opacity < 0.5) mm.opacity = 0.1;
    });
    root.add(fall);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(14, 40), new THREE.MeshStandardMaterial({ color: 0x3f6f78, roughness: 0.3 }));
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, -0.05, -4);
    root.add(pool);
    const mk = monk();
    place(root, mk, 0, -0.8, -15, 0, 1.2);
    const fd = fudo();
    place(root, fd, 0, -0.9, -6, 0, 0.001);
    const boys = [-1, 1].map((s) => place(root, robedFigure({ robe: s < 0 ? 0xf2efe6 : 0xc8261b, h: 1.1 }), s * 3.6, -0.9, -5, -s * 0.4, 0.001));
    const fire = new THREE.PointLight(0xff8a3a, 0, 20, 1.6);
    fire.position.set(0, 4, -4);
    root.add(fire);
    root.add(nat.forest('cedar', Array.from({ length: 30 }, (_, i) => {
      const a = Math.PI * 0.15 + (i / 30) * Math.PI * 1.7;
      return [Math.sin(a) * 22, Math.cos(a) * 22 - 4] as [number, number];
    }), [1.2, 1.6], ground));
    const tl = timeline();
    let appear = -1;
    return {
      enter: { x: 0, z: 6, rotY: 0 },
      ground,
      bounds: ring(13),
      env: { bg: 0x6f8a86, fog: 0xb5c8c4, density: 0.022, sun: 1.0, sunColor: 0xeaf6ff, hemi: 0.8, ambient: 0.35 },
      update: (t, _dt, _pl, api) => {
        tl('in', t > 0.3, () => {
          soundService.playSplash();
          api.caption('The roar of Nachi-no-Taki: 133 metres of falling water.', 4);
        });
        tl('monk', t > 5, () => api.caption('A monk sits in the freezing torrent: Mongaku, on his twenty-one-day vow.', 5));
        tl('cold', t > 11, () => {
          api.caption('The cold takes you. The world goes white—', 3);
          api.flash(0xffffff, 0.95, 1.6);
          soundService.playTempleGong();
        });
        tl('fudo', t > 13, () => {
          appear = t;
          api.caption('Flames in the spray: Fudō Myōō, and his two boy attendants, Kongara and Seitaka.', 6);
          api.setEnv({ fog: 0xd8b49a, sun: 1.3, sunColor: 0xffd2a8 });
        });
        if (appear > 0) {
          const k2 = Math.min(1, (t - appear) / 2.5);
          const s = 0.001 + k2 * 1.3;
          fd.scale.setScalar(s);
          boys.forEach((b) => b.scale.setScalar(0.001 + k2));
          fire.intensity = 30 * k2;
          fd.userData.animate?.(t);
        }
        tl('end', appear > 0 && t - appear > 9, () => api.end(0xff8a2a, 1.8));
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 7. Ise — Ama-no-Iwato, the Heavenly Rock Cave                        */
/* ------------------------------------------------------------------ */
export const amaNoIwato = (p: Place): EncounterDef => ({
  id: 'ise-iwato',
  title: 'Ama-no-Iwato',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x05060a,
  card: {
    title: 'Ama-no-Iwato, the Heavenly Rock Cave',
    jp: '天岩戸',
    body: [
      'Amaterasu, the sun goddess enshrined at Ise\'s Naikū, was so angered by her brother Susanoo that she shut herself in a cave and sealed it with a boulder. The world fell into darkness.',
      'The gods gathered outside. They set roosters crowing to call the dawn, and hung a mirror and jewels on a sacred sakaki tree. The goddess Ame-no-Uzume danced so wildly on an upturned tub that the gods roared with laughter.',
      'Curious, Amaterasu peeked out, saw her own radiance shining in the mirror, and was drawn out. Light returned to the world. That mirror, Yata no Kagami, is said to be enshrined at Ise. The roosters strolling the grounds today are Ise\'s sacred chickens.',
    ],
    ending: 'Light floods back into the world. You stand dripping on the bank of the Isuzu River.',
  },
  build: (k): EncounterRuntime => {
    const { root, nat, m } = k;
    const ground = (x: number, z: number) => Math.max(0, -z - 12) * 1.2 + Math.max(0, Math.abs(x) - 16) * 0.6;
    floor(root, ground, 80, 0x2a2622);
    // cliff and cave
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(46, 22, 6, 12, 8, 2), new THREE.MeshStandardMaterial({ color: 0x3f3a35, roughness: 1, flatShading: true }));
    const cp = cliff.geometry.attributes.position;
    for (let i = 0; i < cp.count; i++) cp.setZ(i, cp.getZ(i) + Math.sin(cp.getX(i) * 0.5 + cp.getY(i)) * 1.2);
    cliff.geometry.computeVertexNormals();
    cliff.position.set(0, 11, -19);
    root.add(cliff);
    const caveLight = new THREE.Mesh(new THREE.PlaneGeometry(5, 6), new THREE.MeshBasicMaterial({ color: 0xfff2c0, fog: false }));
    caveLight.position.set(0, 3, -15.9);
    root.add(caveLight);
    const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(4.2, 1), new THREE.MeshStandardMaterial({ color: 0x55504a, roughness: 1, flatShading: true }));
    boulder.position.set(0, 3.6, -14);
    root.add(boulder);
    const sunLight = new THREE.PointLight(0xffe9a8, 0, 80, 1.2);
    sunLight.position.set(0, 4, -12);
    root.add(sunLight);
    // sakaki tree with mirror and jewels
    const sak = nat.forest('broadleaf', [[-7, -8, 0.5]], [0.5, 0.5], () => 0);
    root.add(sak);
    const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.7, 32), new THREE.MeshStandardMaterial({ color: 0xe8e4d8, metalness: 0.95, roughness: 0.1, side: THREE.DoubleSide }));
    mirror.position.set(-7, 3.4, -6.9);
    root.add(mirror);
    for (let i = 0; i < 5; i++) {
      const j = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.06, 6, 10, Math.PI * 1.4), m.patina);
      j.position.set(-8 + i * 0.5, 2.6 - Math.abs(i - 2) * 0.15, -7);
      root.add(j);
    }
    const anims: ((t: number) => void)[] = [];
    const uz = place(root, uzume(), 5, 0, -6, -0.5);
    anims.push(uz.userData.animate!);
    for (let i = 0; i < 6; i++) {
      const r = place(root, rooster(), -10 + i * 4 + Math.random(), 0, 2 + Math.random() * 3, Math.random() * 6);
      anims.push(r.userData.animate!);
    }
    // the gods, waiting around bonfires
    const gods = [0xf2efe6, 0x2a3f6a, 0x6a2a2a, 0x3a5a3a, 0x8a6a2a, 0xf2efe6];
    gods.forEach((c, i) => {
      const a = Math.PI * 0.2 + (i / gods.length) * Math.PI * 0.6;
      place(root, robedFigure({ robe: c, hat: i % 2 ? 'eboshi' : 'none', h: 1.75 }), Math.cos(a + Math.PI) * 11, 0, -Math.sin(a) * 4 + 2, Math.PI);
    });
    [[-12, -2], [12, -2]].forEach(([x, z]) => {
      const fire = new THREE.PointLight(0xff8a3a, 14, 14, 1.8);
      fire.position.set(x, 1.2, z);
      root.add(fire);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.6, 6), new THREE.MeshBasicMaterial({ color: 0xff9a3a }));
      flame.position.set(x, 0.8, z);
      root.add(flame);
    });
    const tl = timeline();
    let open = -1;
    return {
      enter: { x: 0, z: 12, rotY: 0 },
      ground,
      bounds: { x0: -15, x1: 15, z0: -9, z1: 14 },
      env: { bg: 0x05060a, fog: 0x0a0c14, density: 0.03, sun: 0.05, sunColor: 0x8899cc, hemi: 0.2, ambient: 0.08 },
      update: (t, _dt, _pl, api) => {
        anims.forEach((a) => a(t));
        tl('in', t > 0.3, () => api.caption('Darkness. The sun goddess has hidden herself in the Heavenly Rock Cave.', 5));
        tl('rooster', t > 5, () => {
          soundService.playRooster();
          api.caption('The gods set roosters crowing to call back the dawn.', 4);
        });
        tl('rooster2', t > 7.5, () => soundService.playRooster());
        tl('dance', t > 10, () => {
          soundService.playClap(3);
          api.caption('Ame-no-Uzume dances on an upturned tub, and the gods roar with laughter.', 5);
        });
        tl('peek', t > 16, () => {
          open = t;
          soundService.playRumble(3);
          api.caption('Curious, Amaterasu peeks out, and sees a radiance in the mirror.', 5);
        });
        if (open > 0) {
          const k2 = Math.min(1, (t - open) / 5);
          boulder.position.x = k2 * 8;
          boulder.rotation.z = -k2 * 2;
          sunLight.intensity = 400 * k2;
          api.setEnv({ sun: 0.05 + k2 * 2, hemi: 0.2 + k2, ambient: 0.08 + k2 * 0.5, bg: k2 > 0.6 ? 0xffe8b0 : 0x05060a, fog: k2 > 0.6 ? 0xfff2d0 : 0x0a0c14 });
        }
        tl('flash', open > 0 && t - open > 5, () => {
          soundService.playTempleGong();
          api.flash(0xfff6d8, 1, 1.4);
        });
        tl('end', open > 0 && t - open > 7, () => api.end(0xfff6d8, 1.6));
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 8. Kiyomizu — Seiryū, the blue dragon, at Otowa                      */
/* ------------------------------------------------------------------ */
export const seiryuDragon = (p: Place): EncounterDef => ({
  id: 'kiyomizu-seiryu',
  title: 'Seiryū at Otowa',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x0e1c33,
  card: {
    title: 'Seiryū, the Blue Dragon of the East',
    jp: '青龍',
    body: [
      'Kiyomizu-dera is said to be guarded by Seiryū, the blue dragon of the east, who comes down from the hills at night to drink from the Otowa waterfall.',
      'The temple\'s very name means "pure water", after this spring. Its three streams are said to grant long life, success in study, and luck in love. Visitors drink from one, and taking all three is thought greedy.',
      'In spring and autumn the temple holds the Seiryū-e, when a great blue dragon is paraded through the precinct.',
    ],
    ending: 'The dragon drinks, looks at you with one golden eye, and is gone into the hills.',
  },
  build: (k): EncounterRuntime => {
    const { root, arch, nat } = k;
    const ground = (x: number, z: number) => Math.max(0, Math.abs(x) - 10) * 0.5 + Math.max(0, -z - 4) * 2 + Math.max(0, z - 14) * 0.4;
    floor(root, ground, 90, 0x22301f);
    // stone ledge with three streams, under a small roof
    const ledge = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 4, 8, 6, 2), new THREE.MeshStandardMaterial({ color: 0x3e4438, roughness: 1, flatShading: true }));
    const lp = ledge.geometry.attributes.position;
    for (let i = 0; i < lp.count; i++) lp.setZ(i, lp.getZ(i) + Math.sin(lp.getX(i) * 1.7 + lp.getY(i)) * 0.35);
    ledge.geometry.computeVertexNormals();
    ledge.position.set(0, 4, -7);
    root.add(ledge);
    [-2, 0, 2].forEach((x) => {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4, 6), new THREE.MeshBasicMaterial({ color: 0xcfeaff, transparent: true, opacity: 0.8 }));
      s.position.set(x, 2.6, -4.8);
      root.add(s);
    });
    const pool = new THREE.Mesh(new THREE.CircleGeometry(5, 24), new THREE.MeshStandardMaterial({ color: 0x1d3a4a, roughness: 0.2 }));
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(0, 0.05, -3);
    root.add(pool);
    const roof = arch.roof({ w: 10, d: 4, h: 1.4, kind: 'gable', tone: 'bark', seg: 10 });
    roof.position.set(0, 5.5, -4);
    root.add(roof);
    // the stage on the hillside above, and the moon
    const hall = arch.hall({ w: 22, d: 12, wallH: 5, podium: 0, pillar: 'darkWood', wall: 'darkWood', front: 'lattice', roof: { kind: 'irimoya', tone: 'bark', h: 8 }, overhang: 2.6 });
    place(root, hall, -14, 16, -28);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: 0xfdf6dc, fog: false }));
    place(root, moon, 18, 42, -70);
    root.add(nat.forest('maple', Array.from({ length: 24 }, (_, i) => [(-1 + (i % 2) * 2) * (12 + Math.random() * 14), -4 + Math.random() * 30] as [number, number]), [0.9, 1.2], ground));
    [-5, 5].forEach((x) => {
      const l = k.builder.buildHangingLantern();
      l.position.set(x, 3.6, -1);
      root.add(l);
      const ll = new THREE.PointLight(0xffb070, 6, 10, 2);
      ll.position.set(x, 3.2, -1);
      root.add(ll);
    });
    const dr = dragon({ color: 0x2f7fa8, len: 30, segs: 44, radius: 0.75 });
    root.add(dr);
    let phase2 = -1;
    const center = new THREE.Vector3(0, 11, -14);
    dr.userData.pathAt = (u: number, t: number) => {
      const T = t * 0.35 - u * 6;
      if (phase2 < 0 || t < phase2) {
        return new THREE.Vector3(center.x + Math.cos(T) * 15, center.y + Math.sin(T * 2) * 3, center.z + Math.sin(T) * 9);
      }
      const k2 = Math.min(1, (t - phase2) / 6);
      const r = 15 - k2 * 8;
      const y = center.y - k2 * 6 + Math.sin(T * 2) * 2;
      return new THREE.Vector3(Math.cos(T) * r, y, -6 + Math.sin(T) * r * 0.6);
    };
    const tl = timeline();
    return {
      enter: { x: 0, z: 8, rotY: 0 },
      ground,
      bounds: { x0: -10, x1: 10, z0: -2, z1: 14 },
      env: { bg: 0x0a1424, fog: 0x14223a, density: 0.018, sun: 0.5, sunColor: 0x9fb8ff, hemi: 0.35, ambient: 0.15 },
      update: (t, _dt, _pl, api) => {
        dr.userData.animate!(t);
        tl('in', t > 0.3, () => api.caption('Night at the Otowa waterfall: three streams, for long life, learning, and love.', 5));
        tl('shape', t > 6, () => {
          soundService.playRumble(2);
          api.caption('Something vast is moving over the hills of Higashiyama.', 4);
        });
        tl('descend', t > 12, () => {
          phase2 = t;
          api.caption('Seiryū, the Blue Dragon of the East, comes down to drink.', 5);
        });
        tl('eye', t > 22, () => {
          api.shake(0.08, 1.5);
          api.caption('It turns one golden eye toward you…', 4);
        });
        tl('end', t > 27, () => api.end(0x1b3f6a, 1.8));
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 9. Kamakura — inside the Great Buddha                                */
/* ------------------------------------------------------------------ */
export const insideDaibutsu = (p: Place): EncounterDef => ({
  id: 'kamakura-inside',
  title: 'Inside the Great Buddha',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x1d2620,
  card: {
    title: 'Inside the Great Buddha',
    jp: '大仏胎内',
    body: [
      'Kamakura\'s Amida Buddha was cast in bronze in the mid-13th century, in many separate pieces joined together. You can still see the seams from inside.',
      'It once sat in a great wooden hall, but storms and a tsunami in 1498 swept the hall away, and the Buddha has sat in the open air ever since.',
      'For a small fee, visitors really can step inside, through a door in its side, and look up into the hollow head.',
    ],
    ending: 'You step back out into the sunlight, under the Buddha\'s calm gaze.',
  },
  build: (k): EncounterRuntime => {
    const { root, m } = k;
    const ground = () => 0;
    const bronze = new THREE.MeshStandardMaterial({ color: 0x4f5f4f, roughness: 0.55, metalness: 0.55, side: THREE.BackSide, flatShading: true });
    const shell = new THREE.Mesh(new THREE.SphereGeometry(7, 24, 18), bronze);
    shell.scale.set(1, 1.6, 0.8);
    shell.position.y = 6;
    root.add(shell);
    // casting seams
    for (let i = 0; i < 6; i++) {
      const seam = new THREE.Mesh(new THREE.TorusGeometry(6.6 - Math.abs(i - 2.5) * 0.6, 0.07, 6, 40), m.bronzeDark);
      seam.rotation.x = Math.PI / 2;
      seam.position.y = 1.2 + i * 2.1;
      seam.scale.y = 0.8;
      root.add(seam);
    }
    const fl = new THREE.Mesh(new THREE.CircleGeometry(6.5, 32), new THREE.MeshStandardMaterial({ color: 0x3a3a34, roughness: 1 }));
    fl.rotation.x = -Math.PI / 2;
    root.add(fl);
    // light through the two windows in its back
    const win = new THREE.PointLight(0xfff0d0, 25, 18, 1.8);
    win.position.set(0, 9, -4);
    root.add(win);
    [-1.2, 1.2].forEach((x) => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.4), new THREE.MeshBasicMaterial({ color: 0xfff6e0, fog: false }));
      w.position.set(x, 9, -5.5);
      root.add(w);
    });
    const tl = timeline();
    return {
      enter: { x: 0, z: 3.5, rotY: 0 },
      ground,
      walkable: (x, z) => Math.hypot(x, z / 0.8) < 5,
      bounds: ring(6),
      env: { bg: 0x101410, fog: 0x1d2620, density: 0.02, sun: 0.2, sunColor: 0xfff0d0, hemi: 0.4, ambient: 0.25 },
      update: (t, _dt, _pl, api) => {
        tl('in', t > 0.3, () => api.caption('Inside the Great Buddha. Cool, echoing bronze.', 4));
        tl('seams', t > 5, () => api.caption('The walls were cast in many pieces. You can see where they were joined.', 5));
        tl('up', t > 11, () => api.caption('Light falls through two windows in its back. High above you is the hollow of its head.', 5));
        tl('end', t > 20, () => api.end(0xfff6e0, 1.6));
      },
    };
  },
});

/* ------------------------------------------------------------------ */
/* 10. Zenkō-ji — Okaidan-meguri, the key to paradise in the dark       */
/* ------------------------------------------------------------------ */
export const okaidan = (p: Place): EncounterDef => ({
  id: 'zenkoji-okaidan',
  title: 'Okaidan-meguri',
  zone: p.zone,
  exit: p.exit,
  diveColor: 0x000000,
  card: {
    title: 'Okaidan-meguri: the key to paradise',
    jp: 'お戒壇巡り・極楽の錠前',
    body: [
      'Beneath the inner sanctuary of Zenkō-ji runs a pitch-dark passage. Visitors walk it with their right hand on the wall, in total darkness.',
      'Somewhere along the wall hangs a metal lock, the "key to paradise", directly beneath the hidden Buddha. The image is so sacred that no one is allowed to see it. Touching the lock is said to form a bond with the Buddha and assure rebirth in paradise.',
      'The darkness is part of the teaching: you meet yourself there, with nothing to see.',
    ],
    ending: 'Your fingers found the cold metal. You climb back up into the light of the main hall.',
  },
  build: (k): EncounterRuntime => {
    const { root } = k;
    const ground = () => 0;
    const segs: [number, number, number, number][] = [[0, 2, 0, -16], [0, -16, 9, -16], [9, -16, 9, -2]];
    const inPath = (x: number, z: number) =>
      segs.some(([x0, z0, x1, z1]) => x >= Math.min(x0, x1) - 1.1 && x <= Math.max(x0, x1) + 1.1 && z >= Math.min(z0, z1) - 1.1 && z <= Math.max(z0, z1) + 1.1);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 1 });
    segs.forEach(([x0, z0, x1, z1]) => {
      const len = Math.hypot(x1 - x0, z1 - z0) + 2.4;
      const horiz = z0 === z1;
      [-1.3, 1.3].forEach((o) => {
        const w = new THREE.Mesh(new THREE.BoxGeometry(horiz ? len : 0.2, 3, horiz ? 0.2 : len), wallMat);
        w.position.set((x0 + x1) / 2 + (horiz ? 0 : o), 1.5, (z0 + z1) / 2 + (horiz ? o : 0));
        root.add(w);
      });
    });
    const lock = new THREE.Group();
    lock.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 0.1), new THREE.MeshStandardMaterial({ color: 0x8a6a2a, metalness: 0.8, roughness: 0.3, emissive: 0x1a1000 })));
    lock.position.set(10.2, 1.2, -3);
    root.add(lock);
    const faint = new THREE.PointLight(0xffd27a, 0.6, 3, 2);
    faint.position.set(9.8, 1.3, -3);
    root.add(faint);
    const tl = timeline();
    return {
      enter: { x: 0, z: 1.5, rotY: 0 },
      ground,
      walkable: inPath,
      bounds: { x0: -2, x1: 11, z0: -18, z1: 3 },
      env: { bg: 0x000000, fog: 0x000000, density: 0.35, sun: 0, hemi: 0.03, ambient: 0.02 },
      update: (t, _dt, pl, api) => {
        tl('in', t > 0.3, () => api.caption('Okaidan-meguri. Total darkness beneath the hall.', 4));
        tl('hand', t > 4.5, () => api.caption('Keep your right hand on the wall, and walk on.', 4));
        tl('turn', dist(pl, 0, -16) < 2, () => api.caption('The wall turns. You follow it.', 3));
        tl('lock', dist(pl, 9, -3) < 1.6, () => {
          soundService.playBellChime();
          api.caption('Your fingers find cold metal: the Key to Paradise.', 4);
          api.flash(0xffe9b0, 0.7, 1);
          api.end(0xffe9b0, 2);
        });
        tl('timeout', t > 90, () => api.end(0x000000, 1.5));
      },
    };
  },
});
