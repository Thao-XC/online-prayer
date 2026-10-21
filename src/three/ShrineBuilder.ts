import * as THREE from 'three';
import { ShrineTextureLibrary } from './proceduralTextures';
import { ShrineData } from '../types/shrine';

export class ShrineBuilder {
  private textures: ShrineTextureLibrary;

  // Materials
  private matVermilion: THREE.MeshStandardMaterial;
  private matDarkWood: THREE.MeshStandardMaterial;
  private matCypress: THREE.MeshStandardMaterial;
  private matRoofTile: THREE.MeshStandardMaterial;
  private matGranite: THREE.MeshStandardMaterial;
  private matShoji: THREE.MeshStandardMaterial;
  private matGold: THREE.MeshStandardMaterial;
  private matRope: THREE.MeshStandardMaterial;
  private matBlackLacquer: THREE.MeshStandardMaterial;
  private matWater: THREE.MeshStandardMaterial;
  private matPaperWhite: THREE.MeshStandardMaterial;
  private matLanternGlow: THREE.MeshBasicMaterial;

  constructor(textures: ShrineTextureLibrary) {
    this.textures = textures;

    this.matVermilion = new THREE.MeshStandardMaterial({
      map: textures.vermilion,
      roughness: 0.35,
      metalness: 0.05,
      color: 0xdd3318,
    });

    this.matDarkWood = new THREE.MeshStandardMaterial({
      map: textures.darkWood,
      roughness: 0.75,
      metalness: 0.02,
      color: 0x3d2c20,
    });

    this.matCypress = new THREE.MeshStandardMaterial({
      map: textures.cypressWood,
      roughness: 0.6,
      metalness: 0.02,
      color: 0xc49762,
    });

    this.matRoofTile = new THREE.MeshStandardMaterial({
      map: textures.roofTile,
      roughness: 0.45,
      metalness: 0.15,
      color: 0x22262b,
    });

    this.matGranite = new THREE.MeshStandardMaterial({
      map: textures.graniteStone,
      roughness: 0.85,
      metalness: 0.05,
      color: 0x858990,
    });

    this.matShoji = new THREE.MeshStandardMaterial({
      map: textures.shojiPaper,
      roughness: 0.9,
      metalness: 0.0,
      color: 0xfffcf5,
    });

    this.matGold = new THREE.MeshStandardMaterial({
      map: textures.goldTrim,
      roughness: 0.25,
      metalness: 0.85,
      color: 0xf5be38,
    });

    this.matRope = new THREE.MeshStandardMaterial({
      map: textures.braidedRope,
      roughness: 0.9,
      metalness: 0.0,
      color: 0xd6b785,
    });

    this.matBlackLacquer = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.18,
      metalness: 0.1,
    });

    this.matWater = new THREE.MeshStandardMaterial({
      map: textures.waterFlow,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
      color: 0x2a5d74,
    });

    this.matPaperWhite = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
    });

    this.matLanternGlow = new THREE.MeshBasicMaterial({
      color: 0xffe090,
    });
  }

  /**
   * Build Grand Torii Gate (10+ distinct parts, authentic silhouette)
   */
  public buildToriiGate(isVermilion = true, scale = 1.0): THREE.Group {
    const group = new THREE.Group();
    const woodMat = isVermilion ? this.matVermilion : this.matCypress;
    const baseMat = this.matBlackLacquer;

    const postH = 9 * scale;
    const postR = 0.45 * scale;
    const postSpacing = 6 * scale;

    // 1 & 2. Main Hashira Pillars (tapered, slight inward lean)
    [-postSpacing / 2, postSpacing / 2].forEach((xPos, idx) => {
      const postGeom = new THREE.CylinderGeometry(postR * 0.92, postR, postH, 24);
      const post = new THREE.Mesh(postGeom, woodMat);
      post.position.set(xPos, postH / 2, 0);
      post.rotation.z = idx === 0 ? -0.015 : 0.015;
      post.castShadow = true;
      post.receiveShadow = true;
      group.add(post);

      // Stone/lacquer foundation sleeves (Kamebara / Nemaki)
      const baseGeom = new THREE.CylinderGeometry(postR * 1.35, postR * 1.45, 0.9 * scale, 24);
      const base = new THREE.Mesh(baseGeom, baseMat);
      base.position.set(xPos, 0.45 * scale, 0);
      base.castShadow = true;
      group.add(base);

      // Black tie collar near top
      const collarGeom = new THREE.CylinderGeometry(postR * 1.08, postR * 1.08, 0.3 * scale, 24);
      const collar = new THREE.Mesh(collarGeom, baseMat);
      collar.position.set(xPos, postH * 0.72, 0);
      group.add(collar);
    });

    // 3. Nuki (Lower penetrating crossbeam)
    const nukiLen = (postSpacing + 2.8) * scale;
    const nukiGeom = new THREE.BoxGeometry(nukiLen, 0.5 * scale, 0.4 * scale);
    const nuki = new THREE.Mesh(nukiGeom, woodMat);
    nuki.position.set(0, postH * 0.72, 0);
    nuki.castShadow = true;
    group.add(nuki);

    // Nuki wedges (Kusabi) on pillar sides
    [-postSpacing / 2 - 0.4 * scale, postSpacing / 2 + 0.4 * scale].forEach((kx) => {
      const wedgeGeom = new THREE.BoxGeometry(0.12 * scale, 0.65 * scale, 0.45 * scale);
      const wedge = new THREE.Mesh(wedgeGeom, baseMat);
      wedge.position.set(kx, postH * 0.72, 0);
      group.add(wedge);
    });

    // 4. Shimaki (Secondary lintel resting on pillars)
    const shimakiLen = (postSpacing + 3.6) * scale;
    const shimakiGeom = new THREE.BoxGeometry(shimakiLen, 0.45 * scale, 0.7 * scale);
    const shimaki = new THREE.Mesh(shimakiGeom, woodMat);
    shimaki.position.set(0, postH + 0.22 * scale, 0);
    shimaki.castShadow = true;
    group.add(shimaki);

    // 5. Kasagi (Topmost curved roof beam with upward flared ends)
    const kasagiLen = (postSpacing + 4.6) * scale;
    const kasagiShape = new THREE.Shape();
    kasagiShape.moveTo(-kasagiLen / 2, 0);
    kasagiShape.lineTo(kasagiLen / 2, 0);
    kasagiShape.lineTo(kasagiLen / 2 + 0.3 * scale, 0.55 * scale);
    kasagiShape.lineTo(-kasagiLen / 2 - 0.3 * scale, 0.55 * scale);
    kasagiShape.closePath();

    const extrudeSettings = { depth: 0.8 * scale, bevelEnabled: true, bevelThickness: 0.05 * scale, bevelSize: 0.05 * scale, bevelSegments: 3 };
    const kasagiGeom = new THREE.ExtrudeGeometry(kasagiShape, extrudeSettings);
    kasagiGeom.center();
    const kasagi = new THREE.Mesh(kasagiGeom, woodMat);
    kasagi.position.set(0, postH + 0.65 * scale, 0);
    kasagi.castShadow = true;
    group.add(kasagi);

    // Black copper roof cap on Kasagi
    const capGeom = new THREE.BoxGeometry(kasagiLen + 0.6 * scale, 0.12 * scale, 0.9 * scale);
    const cap = new THREE.Mesh(capGeom, baseMat);
    cap.position.set(0, postH + 0.98 * scale, 0);
    group.add(cap);

    // 6. Gakuzuka (Center tablet strut with name plaque)
    const tabletFrameGeom = new THREE.BoxGeometry(1.2 * scale, 1.8 * scale, 0.2 * scale);
    const tabletFrame = new THREE.Mesh(tabletFrameGeom, baseMat);
    tabletFrame.position.set(0, postH * 0.88, 0);
    group.add(tabletFrame);

    const plaqueGeom = new THREE.BoxGeometry(0.95 * scale, 1.55 * scale, 0.24 * scale);
    const plaqueMat = this.matGold;
    const plaque = new THREE.Mesh(plaqueGeom, plaqueMat);
    plaque.position.set(0, postH * 0.88, 0.02 * scale);
    group.add(plaque);

    // 7. Shimenawa Rope hanging across Nuki
    const ropeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-postSpacing * 0.42, postH * 0.72 - 0.1 * scale, 0),
      new THREE.Vector3(0, postH * 0.72 - 0.55 * scale, 0),
      new THREE.Vector3(postSpacing * 0.42, postH * 0.72 - 0.1 * scale, 0)
    ]);
    const ropeGeom = new THREE.TubeGeometry(ropeCurve, 20, 0.15 * scale, 8, false);
    const rope = new THREE.Mesh(ropeGeom, this.matRope);
    group.add(rope);

    // Hanging paper Shide zig-zags
    [-1.2 * scale, 0, 1.2 * scale].forEach((sx) => {
      const shideGeom = new THREE.PlaneGeometry(0.35 * scale, 0.8 * scale);
      const shide = new THREE.Mesh(shideGeom, this.matPaperWhite);
      shide.position.set(sx, postH * 0.72 - 0.7 * scale, 0);
      shide.rotation.z = Math.sin(sx) * 0.1;
      group.add(shide);
    });

    return group;
  }

  /**
   * Senbon Torii Tunnel (Array of torii gates winding forward)
   */
  public buildToriiTunnel(count = 14, spacing = 2.4): THREE.Group {
    const tunnelGroup = new THREE.Group();
    for (let i = 0; i < count; i++) {
      const zPos = -i * spacing;
      // Gentle winding curve
      const xOffset = Math.sin(i * 0.35) * 1.2;
      const rotY = Math.cos(i * 0.35) * 0.08;

      const torii = this.buildToriiGate(true, 0.65);
      torii.position.set(xOffset, 0, zPos);
      torii.rotation.y = rotY;
      tunnelGroup.add(torii);
    }
    return tunnelGroup;
  }

  /**
   * Main Worship Sanctuary (Haiden / Honden)
   */
  public buildSanctuary(style: string): THREE.Group {
    const hall = new THREE.Group();
    const isTemple = style === 'sensoji_pagoda' || style === 'koyasan_mountain' || style === 'todaiji_daibutsu';
    const isNaturalCypress = style === 'meiji_sacred_forest' || style === 'ise_jingu' || style === 'izumo_taisha';
    const primaryMat = isNaturalCypress ? this.matCypress : isTemple ? this.matDarkWood : this.matVermilion;

    const width = 16;
    const depth = 12;
    const height = 6.5;

    // 1. Stone Foundation Platform (Kidan)
    const platGeom = new THREE.BoxGeometry(width + 3, 1.0, depth + 3);
    const plat = new THREE.Mesh(platGeom, this.matGranite);
    plat.position.set(0, 0.5, 0);
    plat.castShadow = true;
    plat.receiveShadow = true;
    hall.add(plat);

    // Front stone stairway
    const stepGeom = new THREE.BoxGeometry(6, 0.4, 2.5);
    const step1 = new THREE.Mesh(stepGeom, this.matGranite);
    step1.position.set(0, 0.2, (depth + 3) / 2 + 0.8);
    step1.receiveShadow = true;
    hall.add(step1);

    const step2 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 1.4), this.matGranite);
    step2.position.set(0, 0.6, (depth + 3) / 2 + 0.2);
    step2.receiveShadow = true;
    hall.add(step2);

    // 2. Wooden Veranda Deck (Engawa)
    const deckGeom = new THREE.BoxGeometry(width + 1.2, 0.3, depth + 1.2);
    const deck = new THREE.Mesh(deckGeom, isNaturalCypress ? this.matCypress : this.matDarkWood);
    deck.position.set(0, 1.15, 0);
    deck.castShadow = true;
    hall.add(deck);

    // Veranda balustrade railings
    const railMat = primaryMat;
    const railFGeom = new THREE.BoxGeometry(width + 1.0, 0.8, 0.12);
    const railFront = new THREE.Mesh(railFGeom, railMat);
    railFront.position.set(0, 1.7, depth / 2 + 0.5);
    hall.add(railFront);

    // 3. Main Chamber Body & Shoji Walls
    const chamberGeom = new THREE.BoxGeometry(width - 1.5, height, depth - 1.5);
    const chamber = new THREE.Mesh(chamberGeom, this.matDarkWood);
    chamber.position.set(0, 1.3 + height / 2, 0);
    chamber.castShadow = true;
    hall.add(chamber);

    // Shoji Screen Facade (Front)
    const shojiGeom = new THREE.PlaneGeometry(width - 3, height - 1.6);
    const shoji = new THREE.Mesh(shojiGeom, this.matShoji);
    shoji.position.set(0, 1.3 + height / 2, depth / 2 - 0.7);
    hall.add(shoji);

    // 4. Perimeter Pillars (Nuki & Hashira grid)
    const pillarCountX = 6;
    const pillarSpacingX = (width - 1.6) / (pillarCountX - 1);
    for (let i = 0; i < pillarCountX; i++) {
      const px = - (width - 1.6) / 2 + i * pillarSpacingX;
      // Front and rear pillars
      [depth / 2 - 0.6, -depth / 2 + 0.6].forEach((pz) => {
        const pilGeom = new THREE.CylinderGeometry(0.28, 0.3, height, 16);
        const pil = new THREE.Mesh(pilGeom, primaryMat);
        pil.position.set(px, 1.3 + height / 2, pz);
        pil.castShadow = true;
        hall.add(pil);
      });
    }

    // 5. Massive Curved Japanese Roof (Irimoya-zukuri with Kawara tiles)
    const roofBaseY = 1.3 + height;
    const roofW = width + 4.5;
    const roofD = depth + 4.5;
    const roofH = 4.2;

    const roofGeom = new THREE.ConeGeometry(roofW * 0.58, roofH, 4, 1, false, Math.PI / 4);
    roofGeom.scale(1.2, 1, 0.9);
    const roof = new THREE.Mesh(roofGeom, this.matRoofTile);
    roof.position.set(0, roofBaseY + roofH / 2, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    hall.add(roof);

    // Eaves overhang fascia (Black/Gold trimmed)
    const eavesGeom = new THREE.BoxGeometry(roofW + 0.4, 0.45, roofD + 0.4);
    const eaves = new THREE.Mesh(eavesGeom, this.matBlackLacquer);
    eaves.position.set(0, roofBaseY, 0);
    hall.add(eaves);

    // Gold decorative ridge beam (Munegi)
    const ridgeGeom = new THREE.BoxGeometry(roofW * 0.65, 0.55, 0.6);
    const ridge = new THREE.Mesh(ridgeGeom, this.matGold);
    ridge.position.set(0, roofBaseY + roofH + 0.1, 0);
    hall.add(ridge);

    // Shinto Chigi (X-shaped finials) & Katsuogi (rounded cross logs) if shrine
    if (!isTemple) {
      [-roofW * 0.28, roofW * 0.28].forEach((cx) => {
        const chigiShape1 = new THREE.BoxGeometry(0.25, 2.2, 0.4);
        const chigi1 = new THREE.Mesh(chigiShape1, this.matGold);
        chigi1.position.set(cx, roofBaseY + roofH + 0.8, 0);
        chigi1.rotation.z = 0.45;
        hall.add(chigi1);

        const chigi2 = new THREE.Mesh(chigiShape1, this.matGold);
        chigi2.position.set(cx, roofBaseY + roofH + 0.8, 0);
        chigi2.rotation.z = -0.45;
        hall.add(chigi2);
      });

      // Katsuogi logs along ridge
      for (let k = -2; k <= 2; k++) {
        const katsGeom = new THREE.CylinderGeometry(0.22, 0.22, 1.2, 16);
        const kats = new THREE.Mesh(katsGeom, this.matGold);
        kats.position.set(k * 1.5, roofBaseY + roofH + 0.45, 0);
        kats.rotation.x = Math.PI / 2;
        hall.add(kats);
      }
    }

    // 6. Sacred Shimenawa Rope hanging under front eaves
    const shimenawaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-width * 0.35, roofBaseY - 0.2, depth / 2 + 0.4),
      new THREE.Vector3(0, roofBaseY - 0.7, depth / 2 + 0.4),
      new THREE.Vector3(width * 0.35, roofBaseY - 0.2, depth / 2 + 0.4)
    ]);
    const ropeGeom = new THREE.TubeGeometry(shimenawaCurve, 24, 0.22, 8, false);
    const ropeMesh = new THREE.Mesh(ropeGeom, this.matRope);
    hall.add(ropeMesh);

    // 7. Saisen Offering Box (Saisen-bako) centered in front
    const saisenGroup = this.buildSaisenBox();
    saisenGroup.position.set(0, 1.3, depth / 2 + 1.2);
    hall.add(saisenGroup);

    // 8. Overhead Brass Suzu Bell with red/white braided rope
    const bellGroup = this.buildSuzuBell();
    bellGroup.position.set(0, roofBaseY - 0.3, depth / 2 + 1.2);
    hall.add(bellGroup);

    // 9. Twin hanging lanterns on the veranda eaves
    [-width * 0.38, width * 0.38].forEach((lx) => {
      const lantern = this.buildHangingLantern();
      lantern.position.set(lx, roofBaseY - 0.8, depth / 2 + 0.5);
      hall.add(lantern);
    });

    return hall;
  }

  /**
   * Saisen Offering Box (Wood slats, gold kanji, coin drop slot)
   */
  public buildSaisenBox(): THREE.Group {
    const boxGroup = new THREE.Group();
    const boxW = 2.4;
    const boxH = 0.95;
    const boxD = 1.3;

    // Outer dark polished wood chest
    const chestGeom = new THREE.BoxGeometry(boxW, boxH, boxD);
    const chest = new THREE.Mesh(chestGeom, this.matDarkWood);
    chest.position.set(0, boxH / 2, 0);
    chest.castShadow = true;
    boxGroup.add(chest);

    // Gold brass rim corners
    [-boxW / 2 + 0.05, boxW / 2 - 0.05].forEach((bx) => {
      const cornerGeom = new THREE.BoxGeometry(0.12, boxH + 0.04, boxD + 0.04);
      const corner = new THREE.Mesh(cornerGeom, this.matGold);
      corner.position.set(bx, boxH / 2, 0);
      boxGroup.add(corner);
    });

    // Top slatted coin grate (Angled wooden bars)
    for (let s = -boxW / 2 + 0.25; s <= boxW / 2 - 0.25; s += 0.28) {
      const slatGeom = new THREE.BoxGeometry(0.08, 0.06, boxD - 0.15);
      const slat = new THREE.Mesh(slatGeom, this.matCypress);
      slat.position.set(s, boxH + 0.02, 0);
      slat.rotation.z = 0.35;
      boxGroup.add(slat);
    }

    // Gold "奉納" (Dedication) plaque in center
    const plaqueGeom = new THREE.BoxGeometry(0.8, 0.45, 0.04);
    const plaque = new THREE.Mesh(plaqueGeom, this.matGold);
    plaque.position.set(0, boxH * 0.6, boxD / 2 + 0.02);
    boxGroup.add(plaque);

    return boxGroup;
  }

  /**
   * Overhead Brass Suzu Bell with Braided Shake Rope
   */
  public buildSuzuBell(): THREE.Group {
    const group = new THREE.Group();

    // Brass Bell (Suzu) - rounded sphere/cone with bell mouth slit
    const bellGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const bell = new THREE.Mesh(bellGeom, this.matGold);
    bell.scale.set(1, 0.85, 1);
    group.add(bell);

    // Hanging hook
    const hookGeom = new THREE.TorusGeometry(0.12, 0.03, 8, 16);
    const hook = new THREE.Mesh(hookGeom, this.matGold);
    hook.position.set(0, 0.32, 0);
    group.add(hook);

    // Thick braided rope (Red/white cloth & hemp)
    const ropeGeom = new THREE.CylinderGeometry(0.08, 0.07, 3.2, 12);
    const ropeMat = new THREE.MeshStandardMaterial({
      map: this.textures.vermilion,
      roughness: 0.8,
      color: 0xcc2211,
    });
    const rope = new THREE.Mesh(ropeGeom, ropeMat);
    rope.position.set(0, -1.6, 0);
    rope.name = 'suzuRope';
    group.add(rope);

    // Bottom decorative tassel
    const tasselGeom = new THREE.ConeGeometry(0.16, 0.5, 12);
    const tassel = new THREE.Mesh(tasselGeom, this.matPaperWhite);
    tassel.position.set(0, -3.4, 0);
    tassel.rotation.x = Math.PI;
    group.add(tassel);

    return group;
  }

  /**
   * Hanging Chōchin Paper Lantern
   */
  public buildHangingLantern(): THREE.Group {
    const group = new THREE.Group();

    // Red ribbed paper body
    const bodyGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.9, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      map: this.textures.lanternPaper,
      roughness: 0.6,
      emissive: 0x661100,
      emissiveIntensity: 0.35,
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    group.add(body);

    // Black top and bottom rims
    [-0.45, 0.45].forEach((y) => {
      const rimGeom = new THREE.CylinderGeometry(0.34, 0.34, 0.1, 16);
      const rim = new THREE.Mesh(rimGeom, this.matBlackLacquer);
      rim.position.set(0, y, 0);
      group.add(rim);
    });

    // Hanging cord
    const cordGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 8);
    const cord = new THREE.Mesh(cordGeom, this.matBlackLacquer);
    cord.position.set(0, 0.75, 0);
    group.add(cord);

    return group;
  }

  /**
   * Five-Story Pagoda (Gojū-no-tō) or Konpon Daito Stupa
   */
  public buildPagoda(isTwoTierStupa = false): THREE.Group {
    const pagoda = new THREE.Group();
    const tiers = isTwoTierStupa ? 2 : 5;
    const baseWidth = isTwoTierStupa ? 14 : 9;
    const tierHeight = isTwoTierStupa ? 5.5 : 3.8;

    // Stone base podium
    const baseGeom = new THREE.BoxGeometry(baseWidth + 3, 1.2, baseWidth + 3);
    const base = new THREE.Mesh(baseGeom, this.matGranite);
    base.position.set(0, 0.6, 0);
    base.castShadow = true;
    pagoda.add(base);

    let currentY = 1.2;
    for (let t = 0; t < tiers; t++) {
      const scaleFactor = 1.0 - t * (isTwoTierStupa ? 0.22 : 0.12);
      const currentW = baseWidth * scaleFactor;

      // Tier wall chamber
      const chamberGeom = new THREE.BoxGeometry(currentW * 0.75, tierHeight, currentW * 0.75);
      const chamber = new THREE.Mesh(chamberGeom, isTwoTierStupa ? this.matVermilion : this.matDarkWood);
      chamber.position.set(0, currentY + tierHeight / 2, 0);
      chamber.castShadow = true;
      pagoda.add(chamber);

      // Veranda balustrade around tier
      const deckGeom = new THREE.BoxGeometry(currentW * 0.95, 0.25, currentW * 0.95);
      const deck = new THREE.Mesh(deckGeom, this.matDarkWood);
      deck.position.set(0, currentY + 0.12, 0);
      pagoda.add(deck);

      // Flaring Japanese tiled roof
      const roofH = isTwoTierStupa ? 3.0 : 2.0;
      const roofW = currentW * 1.35;
      const roofGeom = new THREE.ConeGeometry(roofW * 0.6, roofH, 4, 1, false, Math.PI / 4);
      const roof = new THREE.Mesh(roofGeom, this.matRoofTile);
      roof.position.set(0, currentY + tierHeight + roofH / 2, 0);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      pagoda.add(roof);

      currentY += tierHeight + roofH * 0.75;
    }

    // Top Sacred Finial (Sōrin) - Nine Sacred Rings, Water Flame, Jewel
    const sorinH = 5.5;
    const mastGeom = new THREE.CylinderGeometry(0.12, 0.2, sorinH, 16);
    const mast = new THREE.Mesh(mastGeom, this.matGold);
    mast.position.set(0, currentY + sorinH / 2, 0);
    pagoda.add(mast);

    // Nine sacred bronze rings (Kurinzō)
    for (let r = 0; r < 9; r++) {
      const ringGeom = new THREE.TorusGeometry(0.45 - r * 0.02, 0.06, 8, 20);
      const ring = new THREE.Mesh(ringGeom, this.matGold);
      ring.position.set(0, currentY + 1.2 + r * 0.32, 0);
      ring.rotation.x = Math.PI / 2;
      pagoda.add(ring);
    }

    // Sacred Hōju Jewel at very peak
    const jewelGeom = new THREE.SphereGeometry(0.35, 16, 16);
    const jewel = new THREE.Mesh(jewelGeom, this.matGold);
    jewel.position.set(0, currentY + sorinH + 0.2, 0);
    pagoda.add(jewel);

    return pagoda;
  }

  /**
   * Temizuya Purification Pavilion (Chōzubachi water basin, bamboo kakehi, hishaku ladles)
   */
  public buildTemizuya(): THREE.Group {
    const group = new THREE.Group();
    const w = 4.2;
    const d = 3.2;
    const h = 3.6;

    // Stone base slab
    const slabGeom = new THREE.BoxGeometry(w + 1.2, 0.3, d + 1.2);
    const slab = new THREE.Mesh(slabGeom, this.matGranite);
    slab.position.set(0, 0.15, 0);
    slab.receiveShadow = true;
    group.add(slab);

    // Four Cedar Pillars
    [[-w / 2 + 0.3, -d / 2 + 0.3], [w / 2 - 0.3, -d / 2 + 0.3], [-w / 2 + 0.3, d / 2 - 0.3], [w / 2 - 0.3, d / 2 - 0.3]].forEach(([px, pz]) => {
      const colGeom = new THREE.CylinderGeometry(0.16, 0.18, h, 16);
      const col = new THREE.Mesh(colGeom, this.matCypress);
      col.position.set(px, h / 2 + 0.3, pz);
      col.castShadow = true;
      group.add(col);

      // Stone pillar base
      const pbGeom = new THREE.CylinderGeometry(0.24, 0.26, 0.3, 16);
      const pb = new THREE.Mesh(pbGeom, this.matGranite);
      pb.position.set(px, 0.45, pz);
      group.add(pb);
    });

    // Crossbeams (Nuki)
    const beamGeom = new THREE.BoxGeometry(w + 0.4, 0.25, d + 0.4);
    const beam = new THREE.Mesh(beamGeom, this.matDarkWood);
    beam.position.set(0, h + 0.2, 0);
    group.add(beam);

    // Hipped Roof (Kawara)
    const roofGeom = new THREE.ConeGeometry(w * 0.72, 1.8, 4, 1, false, Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoofTile);
    roof.position.set(0, h + 1.2, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // Carved Granite Water Basin (Chōzubachi)
    const basinGeom = new THREE.BoxGeometry(2.2, 0.9, 1.4);
    const basin = new THREE.Mesh(basinGeom, this.matGranite);
    basin.position.set(0, 0.75, 0);
    basin.castShadow = true;
    group.add(basin);

    // Water surface inside basin
    const waterGeom = new THREE.PlaneGeometry(1.9, 1.1);
    const water = new THREE.Mesh(waterGeom, this.matWater);
    water.position.set(0, 1.15, 0);
    water.rotation.x = -Math.PI / 2;
    group.add(water);

    // Bamboo Kakehi (Water spout with running stream)
    const spoutGeom = new THREE.CylinderGeometry(0.06, 0.06, 1.1, 12);
    const spoutMat = new THREE.MeshStandardMaterial({ color: 0x7a8b48, roughness: 0.5 });
    const spout = new THREE.Mesh(spoutGeom, spoutMat);
    spout.position.set(0, 1.5, -0.6);
    spout.rotation.x = 0.6;
    group.add(spout);

    // Wooden Ladle (Hishaku) resting on bamboo rails
    [-0.4, 0.4].forEach((lx) => {
      const ladleGroup = new THREE.Group();
      // Bamboo cup
      const cupGeom = new THREE.CylinderGeometry(0.09, 0.08, 0.12, 12);
      const cup = new THREE.Mesh(cupGeom, this.matCypress);
      cup.position.set(0, 0, 0);
      ladleGroup.add(cup);

      // Long wooden handle
      const handleGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
      const handle = new THREE.Mesh(handleGeom, this.matCypress);
      handle.position.set(0, 0, 0.4);
      handle.rotation.x = Math.PI / 2;
      ladleGroup.add(handle);

      ladleGroup.position.set(lx, 1.25, 0.1);
      group.add(ladleGroup);
    });

    return group;
  }

  /**
   * Stone Lantern (Ishidōrō) - 6 parts with glowing candle chamber
   */
  public buildIshidoro(hasLight = true): THREE.Group {
    const ishidoro = new THREE.Group();

    // 1. Base (Kiso)
    const kisoGeom = new THREE.CylinderGeometry(0.65, 0.75, 0.35, 6);
    const kiso = new THREE.Mesh(kisoGeom, this.matGranite);
    kiso.position.set(0, 0.18, 0);
    kiso.castShadow = true;
    ishidoro.add(kiso);

    // 2. Shaft (Sao)
    const saoGeom = new THREE.CylinderGeometry(0.3, 0.35, 1.4, 6);
    const sao = new THREE.Mesh(saoGeom, this.matGranite);
    sao.position.set(0, 1.05, 0);
    sao.castShadow = true;
    ishidoro.add(sao);

    // 3. Middle Platform (Chūdai)
    const chudaiGeom = new THREE.CylinderGeometry(0.7, 0.55, 0.3, 6);
    const chudai = new THREE.Mesh(chudaiGeom, this.matGranite);
    chudai.position.set(0, 1.9, 0);
    chudai.castShadow = true;
    ishidoro.add(chudai);

    // 4. Fire Chamber (Hibukuro) with open lattice
    const hibukuroGeom = new THREE.BoxGeometry(0.65, 0.65, 0.65);
    const hibukuro = new THREE.Mesh(hibukuroGeom, this.matLanternGlow);
    hibukuro.position.set(0, 2.38, 0);
    ishidoro.add(hibukuro);

    if (hasLight) {
      const lanternLight = new THREE.PointLight(0xffaa44, 1.2, 8, 1.5);
      lanternLight.position.set(0, 2.38, 0);
      lanternLight.name = 'lanternPointLight';
      ishidoro.add(lanternLight);
    }

    // 5. Roof (Kasa) with 6 corner points
    const kasaGeom = new THREE.ConeGeometry(0.95, 0.5, 6);
    const kasa = new THREE.Mesh(kasaGeom, this.matGranite);
    kasa.position.set(0, 2.95, 0);
    kasa.castShadow = true;
    ishidoro.add(kasa);

    // 6. Finial Jewel (Hōju)
    const hojuGeom = new THREE.SphereGeometry(0.18, 12, 12);
    const hoju = new THREE.Mesh(hojuGeom, this.matGranite);
    hoju.position.set(0, 3.32, 0);
    ishidoro.add(hoju);

    return ishidoro;
  }

  /**
   * Kitsune Fox Guardian Statue (for Fushimi Inari)
   */
  public buildKitsuneStatue(holdsJewel = true): THREE.Group {
    const fox = new THREE.Group();

    // Stone Pedestal
    const pedGeom = new THREE.BoxGeometry(1.1, 0.9, 1.4);
    const ped = new THREE.Mesh(pedGeom, this.matGranite);
    ped.position.set(0, 0.45, 0);
    ped.castShadow = true;
    fox.add(ped);

    // Fox Body (Sitting haunches)
    const bodyGeom = new THREE.CylinderGeometry(0.28, 0.42, 1.1, 12);
    const body = new THREE.Mesh(bodyGeom, this.matGranite);
    body.position.set(0, 1.35, 0);
    fox.add(body);

    // Fox Chest & Slender Neck
    const neckGeom = new THREE.CylinderGeometry(0.2, 0.26, 0.65, 12);
    const neck = new THREE.Mesh(neckGeom, this.matGranite);
    neck.position.set(0, 1.85, 0.1);
    neck.rotation.x = -0.15;
    fox.add(neck);

    // Fox Head with pointed snout
    const headGeom = new THREE.ConeGeometry(0.22, 0.55, 8);
    const head = new THREE.Mesh(headGeom, this.matGranite);
    head.position.set(0, 2.2, 0.28);
    head.rotation.x = Math.PI / 2;
    fox.add(head);

    // Pointed Ears
    [-0.14, 0.14].forEach((ex) => {
      const earGeom = new THREE.ConeGeometry(0.08, 0.24, 6);
      const ear = new THREE.Mesh(earGeom, this.matGranite);
      ear.position.set(ex, 2.45, 0.15);
      fox.add(ear);
    });

    // Fox Bushy Tail curved upward
    const tailGeom = new THREE.CylinderGeometry(0.12, 0.05, 1.0, 8);
    const tail = new THREE.Mesh(tailGeom, this.matGranite);
    tail.position.set(0, 1.4, -0.42);
    tail.rotation.x = -0.55;
    fox.add(tail);

    // Red cloth votive bib (Yodarekake)
    const bibGeom = new THREE.BoxGeometry(0.48, 0.45, 0.06);
    const bibMat = new THREE.MeshStandardMaterial({ color: 0xcc2211, roughness: 0.7 });
    const bib = new THREE.Mesh(bibGeom, bibMat);
    bib.position.set(0, 1.6, 0.28);
    fox.add(bib);

    // Sacred mouth object (Jewel or Scroll)
    if (holdsJewel) {
      const jewelGeom = new THREE.SphereGeometry(0.12, 12, 12);
      const jewel = new THREE.Mesh(jewelGeom, this.matGold);
      jewel.position.set(0, 2.15, 0.58);
      fox.add(jewel);
    } else {
      const scrollGeom = new THREE.CylinderGeometry(0.05, 0.05, 0.35, 8);
      const scroll = new THREE.Mesh(scrollGeom, this.matPaperWhite);
      scroll.position.set(0, 2.15, 0.58);
      scroll.rotation.z = Math.PI / 2;
      fox.add(scroll);
    }

    return fox;
  }

  /**
   * Ema Votive Board Rack
   */
  public buildEmaRack(): THREE.Group {
    const rack = new THREE.Group();
    const w = 4.6;
    const h = 2.8;

    // Wooden Posts
    [-w / 2, w / 2].forEach((x) => {
      const postGeom = new THREE.BoxGeometry(0.2, h, 0.2);
      const post = new THREE.Mesh(postGeom, this.matDarkWood);
      post.position.set(x, h / 2, 0);
      post.castShadow = true;
      rack.add(post);
    });

    // Top beam & mini pitched roof
    const beamGeom = new THREE.BoxGeometry(w + 0.6, 0.2, 0.25);
    const beam = new THREE.Mesh(beamGeom, this.matDarkWood);
    beam.position.set(0, h, 0);
    rack.add(beam);

    const roofGeom = new THREE.BoxGeometry(w + 0.8, 0.1, 0.8);
    const roof = new THREE.Mesh(roofGeom, this.matRoofTile);
    roof.position.set(0, h + 0.15, 0);
    rack.add(roof);

    // 4 Horizontal wire hanging bars
    for (let r = 0; r < 4; r++) {
      const barY = 0.8 + r * 0.45;
      const barGeom = new THREE.CylinderGeometry(0.02, 0.02, w - 0.2, 8);
      const bar = new THREE.Mesh(barGeom, this.matDarkWood);
      bar.position.set(0, barY, 0);
      bar.rotation.z = Math.PI / 2;
      rack.add(bar);

      // Hanging Ema tablets
      for (let c = -w / 2 + 0.4; c <= w / 2 - 0.4; c += 0.5) {
        if (Math.random() > 0.15) {
          const emaGeom = new THREE.BoxGeometry(0.3, 0.22, 0.02);
          const ema = new THREE.Mesh(emaGeom, this.matCypress);
          ema.position.set(c + (Math.random() * 0.06 - 0.03), barY - 0.14, (Math.random() * 0.04 - 0.02));
          ema.rotation.z = (Math.random() * 0.2 - 0.1);
          rack.add(ema);
        }
      }
    }

    return rack;
  }

  /**
   * Jōkōro (Giant Bronze Incense Urn for Senso-ji)
   */
  public buildJokoro(): THREE.Group {
    const urnGroup = new THREE.Group();

    // 3 Curved Bronze Legs
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const legGeom = new THREE.CylinderGeometry(0.12, 0.16, 0.9, 12);
      const leg = new THREE.Mesh(legGeom, this.matBlackLacquer);
      leg.position.set(Math.cos(angle) * 0.7, 0.45, Math.sin(angle) * 0.7);
      leg.rotation.z = 0.2 * Math.cos(angle);
      leg.rotation.x = 0.2 * Math.sin(angle);
      urnGroup.add(leg);
    }

    // Heavy Bronze Urn Bowl (Incense Cauldron)
    const bowlGeom = new THREE.CylinderGeometry(1.2, 0.8, 0.9, 24);
    const bowl = new THREE.Mesh(bowlGeom, this.matDarkWood);
    bowl.position.set(0, 1.25, 0);
    bowl.castShadow = true;
    urnGroup.add(bowl);

    // Glowing Incense Ash Bed
    const ashGeom = new THREE.CylinderGeometry(1.15, 1.15, 0.1, 24);
    const ashMat = new THREE.MeshStandardMaterial({
      color: 0x4a3a30,
      emissive: 0xdd4411,
      emissiveIntensity: 0.35,
    });
    const ash = new THREE.Mesh(ashGeom, ashMat);
    ash.position.set(0, 1.65, 0);
    urnGroup.add(ash);

    // Hexagonal Bronze Roof Canopy with Smoke Exhaust
    const canopyGeom = new THREE.ConeGeometry(1.6, 1.1, 6);
    const canopy = new THREE.Mesh(canopyGeom, this.matBlackLacquer);
    canopy.position.set(0, 2.7, 0);
    urnGroup.add(canopy);

    // 4 Support Rods
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI * 2) / 4;
      const rodGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.0, 8);
      const rod = new THREE.Mesh(rodGeom, this.matBlackLacquer);
      rod.position.set(Math.cos(angle) * 0.9, 2.15, Math.sin(angle) * 0.9);
      urnGroup.add(rod);
    }

    // Top Lotus Finial
    const finialGeom = new THREE.SphereGeometry(0.2, 12, 12);
    const finial = new THREE.Mesh(finialGeom, this.matGold);
    finial.position.set(0, 3.35, 0);
    urnGroup.add(finial);

    return urnGroup;
  }

  /**
   * Japanese Tree (Pine, Sakura, or Ancient Cedar)
   */
  public buildTree(type: 'sakura' | 'pine' | 'cedar', scale = 1.0): THREE.Group {
    const tree = new THREE.Group();

    if (type === 'sakura') {
      // Gnarled dark trunk
      const trunkCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.3 * scale, 2.0 * scale, 0),
        new THREE.Vector3(-0.2 * scale, 3.8 * scale, 0.2 * scale)
      ]);
      const trunkGeom = new THREE.TubeGeometry(trunkCurve, 12, 0.4 * scale, 8, false);
      const trunk = new THREE.Mesh(trunkGeom, this.matDarkWood);
      trunk.castShadow = true;
      tree.add(trunk);

      // Pink Sakura Foliage Puffs
      const sakuraMat = new THREE.MeshStandardMaterial({
        color: 0xffb7c5,
        roughness: 0.8,
        metalness: 0.0,
      });

      const leafPositions = [
        [0, 4.2 * scale, 0, 1.8 * scale],
        [-1.2 * scale, 3.8 * scale, 0.8 * scale, 1.4 * scale],
        [1.3 * scale, 3.6 * scale, -0.6 * scale, 1.5 * scale],
        [0.4 * scale, 4.8 * scale, 0.8 * scale, 1.2 * scale],
      ];

      leafPositions.forEach(([lx, ly, lz, s]) => {
        const puffGeom = new THREE.DodecahedronGeometry(s, 1);
        const puff = new THREE.Mesh(puffGeom, sakuraMat);
        puff.position.set(lx, ly, lz);
        puff.castShadow = true;
        tree.add(puff);
      });
    } else if (type === 'pine') {
      // Twisted Bonsai/Niwaki style pine
      const trunkGeom = new THREE.CylinderGeometry(0.25 * scale, 0.45 * scale, 5 * scale, 8);
      const trunk = new THREE.Mesh(trunkGeom, this.matDarkWood);
      trunk.position.set(0, 2.5 * scale, 0);
      trunk.rotation.z = 0.08;
      tree.add(trunk);

      const pineMat = new THREE.MeshStandardMaterial({
        color: 0x22492f,
        roughness: 0.9,
      });

      // Layered cloud plates of needles
      for (let l = 0; l < 4; l++) {
        const plateGeom = new THREE.CylinderGeometry(1.6 * scale - l * 0.3 * scale, 1.8 * scale - l * 0.3 * scale, 0.5 * scale, 8);
        const plate = new THREE.Mesh(plateGeom, pineMat);
        plate.position.set(Math.sin(l) * 0.4 * scale, (2.6 + l * 1.0) * scale, Math.cos(l) * 0.3 * scale);
        plate.castShadow = true;
        tree.add(plate);
      }
    } else {
      // Towering Cryptomeria Sacred Cedar (Sugi)
      const cedarH = 12 * scale;
      const trunkGeom = new THREE.CylinderGeometry(0.3 * scale, 0.65 * scale, cedarH, 12);
      const trunk = new THREE.Mesh(trunkGeom, this.matDarkWood);
      trunk.position.set(0, cedarH / 2, 0);
      trunk.castShadow = true;
      tree.add(trunk);

      const cedarMat = new THREE.MeshStandardMaterial({
        color: 0x1b3824,
        roughness: 0.85,
      });

      // Tall conical layered foliage
      for (let c = 0; c < 5; c++) {
        const coneGeom = new THREE.ConeGeometry((2.4 - c * 0.35) * scale, 3.2 * scale, 8);
        const cone = new THREE.Mesh(coneGeom, cedarMat);
        cone.position.set(0, (4.5 + c * 1.8) * scale, 0);
        cone.castShadow = true;
        tree.add(cone);
      }
    }

    return tree;
  }

  /**
   * Kinkaku-ji (3-Tier Golden Pavilion with pure gold leaf and phoenix finial)
   */
  public buildGoldenPavilion(): THREE.Group {
    const pavilion = new THREE.Group();

    // Stone base island foundation
    const baseGeom = new THREE.BoxGeometry(16, 0.8, 14);
    const base = new THREE.Mesh(baseGeom, this.matGranite);
    base.position.set(0, 0.4, 0);
    base.castShadow = true;
    pavilion.add(base);

    // --- Tier 1: Hōsui-in (Shinden Palace Style, natural wood & shoji) ---
    const t1H = 3.6;
    const t1W = 12;
    const t1D = 10;
    const t1Body = new THREE.Mesh(new THREE.BoxGeometry(t1W - 1, t1H, t1D - 1), this.matShoji);
    t1Body.position.set(0, 0.8 + t1H / 2, 0);
    t1Body.castShadow = true;
    pavilion.add(t1Body);

    // Natural cedar perimeter columns
    for (let x = -t1W / 2 + 0.4; x <= t1W / 2 - 0.4; x += (t1W - 0.8) / 4) {
      [-t1D / 2 + 0.4, t1D / 2 - 0.4].forEach((z) => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, t1H, 12), this.matCypress);
        col.position.set(x, 0.8 + t1H / 2, z);
        col.castShadow = true;
        pavilion.add(col);
      });
    }

    // Tier 1 Overhang Roof
    const t1Roof = new THREE.Mesh(new THREE.BoxGeometry(t1W + 3, 0.4, t1D + 3), this.matRoofTile);
    t1Roof.position.set(0, 0.8 + t1H + 0.2, 0);
    t1Roof.castShadow = true;
    pavilion.add(t1Roof);

    // --- Tier 2: Chōon-dō (Warrior Style, Covered in Pure Gold Leaf) ---
    const t2Y = 0.8 + t1H + 0.4;
    const t2H = 3.2;
    const t2W = 9.5;
    const t2D = 8.0;

    const t2Body = new THREE.Mesh(new THREE.BoxGeometry(t2W, t2H, t2D), this.matGold);
    t2Body.position.set(0, t2Y + t2H / 2, 0);
    t2Body.castShadow = true;
    pavilion.add(t2Body);

    // Gold Balustrade Railing around Tier 2
    const t2Railing = new THREE.Mesh(new THREE.BoxGeometry(t2W + 1.2, 0.7, t2D + 1.2), this.matBlackLacquer);
    t2Railing.position.set(0, t2Y + 0.35, 0);
    pavilion.add(t2Railing);

    // Tier 2 Overhang Roof
    const t2Roof = new THREE.Mesh(new THREE.BoxGeometry(t2W + 3.2, 0.4, t2D + 3.2), this.matRoofTile);
    t2Roof.position.set(0, t2Y + t2H + 0.2, 0);
    t2Roof.castShadow = true;
    pavilion.add(t2Roof);

    // --- Tier 3: Kukkyō-chō (Zen Style, Gilded with arched windows) ---
    const t3Y = t2Y + t2H + 0.4;
    const t3H = 3.0;
    const t3W = 6.8;
    const t3D = 6.0;

    const t3Body = new THREE.Mesh(new THREE.BoxGeometry(t3W, t3H, t3D), this.matGold);
    t3Body.position.set(0, t3Y + t3H / 2, 0);
    t3Body.castShadow = true;
    pavilion.add(t3Body);

    // Arched Bell Windows (Kato-mado) in dark wood
    [-t3W * 0.26, t3W * 0.26].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.1), this.matBlackLacquer);
      win.position.set(wx, t3Y + t3H * 0.5, t3D / 2 + 0.05);
      pavilion.add(win);
    });

    // Tier 3 Pyramidal Shingled Roof (Irimoya / Hōgyō-zukuri)
    const t3RoofH = 2.8;
    const t3RoofGeom = new THREE.ConeGeometry((t3W + 2.5) * 0.65, t3RoofH, 4, 1, false, Math.PI / 4);
    const t3Roof = new THREE.Mesh(t3RoofGeom, this.matRoofTile);
    t3Roof.position.set(0, t3Y + t3H + t3RoofH / 2, 0);
    t3Roof.rotation.y = Math.PI / 4;
    t3Roof.castShadow = true;
    pavilion.add(t3Roof);

    // Golden Phoenix (Hō-ō) finial atop the pinnacle
    const phoenixGroup = new THREE.Group();
    // Body & head
    const pBody = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 8), this.matGold);
    pBody.position.set(0, 0.3, 0);
    phoenixGroup.add(pBody);

    // Outspread golden wings
    [-0.35, 0.35].forEach((wx) => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.15, 0.3), this.matGold);
      wing.position.set(wx, 0.45, 0);
      wing.rotation.z = wx < 0 ? -0.3 : 0.3;
      phoenixGroup.add(wing);
    });

    // Phoenix long crest tail
    const pTail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.9, 6), this.matGold);
    pTail.position.set(0, 0.6, -0.2);
    pTail.rotation.x = -0.5;
    phoenixGroup.add(pTail);

    phoenixGroup.position.set(0, t3Y + t3H + t3RoofH + 0.1, 0);
    pavilion.add(phoenixGroup);

    // Front Offering Saisen Box & Bell
    const saisen = this.buildSaisenBox();
    saisen.position.set(0, 0.8, t1D / 2 + 0.8);
    pavilion.add(saisen);

    return pavilion;
  }

  /**
   * Kiyomizu-dera (Monumental 13m Keyaki Timber Scaffold Stage & Otowa Waterfall)
   */
  public buildKiyomizuStage(): THREE.Group {
    const temple = new THREE.Group();

    const stageW = 18;
    const stageD = 14;
    const stageH = 7.5; // Elevated mountain scaffold height

    // 1. Interlocking Timber Scaffold Framework (Jigoku-gumi)
    const colSpacingX = stageW / 5;
    const colSpacingZ = stageD / 4;

    for (let ix = 0; ix <= 5; ix++) {
      const px = -stageW / 2 + ix * colSpacingX;
      for (let iz = 0; iz <= 4; iz++) {
        const pz = -stageD / 2 + iz * colSpacingZ;

        // Timber Pillar (Keyaki Japanese Zelkova)
        const pilGeom = new THREE.CylinderGeometry(0.28, 0.32, stageH, 12);
        const pil = new THREE.Mesh(pilGeom, this.matDarkWood);
        pil.position.set(px, stageH / 2, pz);
        pil.castShadow = true;
        temple.add(pil);
      }

      // Horizontal interlocking lattice tie-beams (Nuki)
      for (let lvl = 1; lvl <= 3; lvl++) {
        const beamY = lvl * (stageH / 4);
        const beamGeom = new THREE.BoxGeometry(0.2, 0.3, stageD);
        const beam = new THREE.Mesh(beamGeom, this.matDarkWood);
        beam.position.set(px, beamY, 0);
        temple.add(beam);
      }
    }

    // Longitudinal crossbeams
    for (let iz = 0; iz <= 4; iz++) {
      const pz = -stageD / 2 + iz * colSpacingZ;
      for (let lvl = 1; lvl <= 3; lvl++) {
        const beamY = lvl * (stageH / 4);
        const beamGeom = new THREE.BoxGeometry(stageW, 0.3, 0.2);
        const beam = new THREE.Mesh(beamGeom, this.matDarkWood);
        beam.position.set(0, beamY, pz);
        temple.add(beam);
      }
    }

    // 2. The Main Wooden Stage Deck (Kiyomizu-no-butai)
    const deckGeom = new THREE.BoxGeometry(stageW + 1.5, 0.4, stageD + 1.5);
    const deck = new THREE.Mesh(deckGeom, this.matCypress);
    deck.position.set(0, stageH + 0.2, 0);
    deck.castShadow = true;
    deck.receiveShadow = true;
    temple.add(deck);

    // Stage Vermilion / Dark Wood Balustrade (Facing Kyoto view)
    const frontRailGeom = new THREE.BoxGeometry(stageW + 1.4, 0.9, 0.15);
    const frontRail = new THREE.Mesh(frontRailGeom, this.matVermilion);
    frontRail.position.set(0, stageH + 0.75, stageD / 2 + 0.6);
    temple.add(frontRail);

    // 3. Main Temple Hall (Hondō) Sanctuary at the back of the stage
    const hallW = stageW - 2;
    const hallD = 8;
    const hallH = 5.5;

    const hallBody = new THREE.Mesh(new THREE.BoxGeometry(hallW, hallH, hallD), this.matDarkWood);
    hallBody.position.set(0, stageH + 0.4 + hallH / 2, -stageD / 4);
    hallBody.castShadow = true;
    temple.add(hallBody);

    // Shoji screen front
    const hallShoji = new THREE.Mesh(new THREE.PlaneGeometry(hallW - 1, hallH - 1.5), this.matShoji);
    hallShoji.position.set(0, stageH + 0.4 + hallH / 2, -stageD / 4 + hallD / 2 + 0.05);
    temple.add(hallShoji);

    // Massive Curved Cypress Bark Roof (Hiwada-buki)
    const roofGeom = new THREE.ConeGeometry((hallW + 4) * 0.62, 4.5, 4, 1, false, Math.PI / 4);
    const roof = new THREE.Mesh(roofGeom, this.matRoofTile);
    roof.position.set(0, stageH + hallH + 2.5, -stageD / 4);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    temple.add(roof);

    // Saisen offering box on stage
    const saisen = this.buildSaisenBox();
    saisen.position.set(0, stageH + 0.4, 0);
    temple.add(saisen);

    // Temple Gong suspended from beam
    const bell = this.buildSuzuBell();
    bell.position.set(0, stageH + 3.2, 0);
    temple.add(bell);

    // 4. Sacred Otowa Waterfall Pavilion (音羽の滝)
    const otowaGroup = new THREE.Group();
    // Stone pavilion base
    const oBase = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.4, 3.5), this.matGranite);
    oBase.position.set(0, 0.2, 0);
    otowaGroup.add(oBase);

    // Overhanging stone roof with 3 water spouts
    const oRoof = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 2.0), this.matDarkWood);
    oRoof.position.set(0, 3.2, 0);
    otowaGroup.add(oRoof);

    // 3 Streaming waterfalls falling into stone catch basin
    [-1.2, 0, 1.2].forEach((sx) => {
      // Bamboo spout
      const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8), this.matCypress);
      spout.position.set(sx, 3.0, 0.5);
      spout.rotation.x = Math.PI / 2;
      otowaGroup.add(spout);

      // Cascading clear water stream
      const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.8, 8), this.matWater);
      stream.position.set(sx, 1.5, 1.1);
      otowaGroup.add(stream);
    });

    otowaGroup.position.set(13, 0, 0);
    temple.add(otowaGroup);

    return temple;
  }
}
