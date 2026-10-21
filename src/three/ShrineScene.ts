import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ShrineData, TimeOfDay } from '../types/shrine';
import { createProceduralTextures, ShrineTextureLibrary } from './proceduralTextures';
import { ShrineBuilder } from './ShrineBuilder';
import { soundService } from '../services/soundService';
import { createKitMaterials } from './kit/materials';
import { Architecture } from './kit/architecture';
import { Nature } from './kit/nature';
import { LAYOUTS } from './layouts';
import type { GroundFn, LayoutCtx, LayoutResult, ParticleKind, SecretDef, Etiquette } from './layouts/types';
import type { EncounterDef, EncounterEvent, EncounterRuntime, StoryCard, EncounterApi } from './encounters/types';
import type { ShrineSpot } from '../types/shrine';

export interface SceneCallbacks {
  onNearSpot?: (spotId: string | null, spotName: string | null, spotType: string | null) => void;
  /** encounter start / captions / end (with the legend card) */
  onEncounter?: (e: EncounterEvent) => void;
  /** luck change with the custom behind it; `key` identifies the rule */
  onLuck?: (delta: number, reason: string, key: string) => void;
  /** a secret was found */
  onSecret?: (id: string, card: StoryCard, luck: number) => void;
  /** short line of on-screen text (hints) */
  onCaption?: (text: string, seconds?: number) => void;
}

const POCKET_Y = -600;

export class ShrineScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private pmremGenerator: THREE.PMREMGenerator;

  private shrineData: ShrineData;
  private timeOfDay: TimeOfDay = 'day';
  private textures: ShrineTextureLibrary;
  private builder: ShrineBuilder;
  private callbacks: SceneCallbacks;

  // Lighting
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientFill: THREE.AmbientLight;

  // Interactive Scene Objects
  private dynamicLights: THREE.PointLight[] = [];
  private waterPlane: THREE.Mesh | null = null;
  private petalParticles: THREE.Points | null = null;
  private smokeParticles: THREE.Points | null = null;
  private animatedBells: THREE.Mesh[] = [];

  // Per-shrine layout state
  private ground: GroundFn = () => 0;
  private walkable: ((x: number, z: number) => boolean) | null = null;
  private bounds = { x0: -28, x1: 28, z0: -24, z1: 38 };
  private spots: ShrineSpot[] = [];
  private orbit = { x: 0, z: -4, r: 28, y: 7 };
  private smokeOrigin = new THREE.Vector3(0, 2.2, 4);
  private fogMul = 1;
  private particleKind: ParticleKind = 'sakura';
  private waterBaseY = 0.4;
  private nature: Nature | null = null;
  private sunOffset = new THREE.Vector3(30, 45, 25);

  // Secret worlds, secrets and manners
  private kitForEncounters: { arch: Architecture; nat: Nature; m: ReturnType<typeof createKitMaterials> } | null = null;
  private encounterDefs: EncounterDef[] = [];
  private enc: {
    def: EncounterDef;
    rt: EncounterRuntime | null;
    root: THREE.Group | null;
    t: number;
    ending: boolean;
    saved: { ground: GroundFn; walkable: ((x: number, z: number) => boolean) | null; bounds: { x0: number; x1: number; z0: number; z1: number } };
  } | null = null;
  private encCooldown = 0;
  private secrets: SecretDef[] = [];
  private secretsFound = new Set<string>();
  private secretHinted = new Set<string>();
  private secretLinger: Record<string, number> = {};
  private blindwalk: { def: SecretDef; t: number } | null = null;
  private etiquette: Etiquette = {};
  private nightObjects: THREE.Object3D[] = [];
  private manners = { centreT: 0, centreCount: 0, centreCool: 0, runT: 0, runCount: 0, runCool: 0, forbidCool: 0, forbidCount: 0, bowedAtGate: false, gateWarned: false, gateHinted: false, lastBow: -99, lookBackT: 0, lookBackDone: false };
  private elapsed = 0;
  private bowAnim = 0;
  private shakeT = 0;
  private shakeAmt = 0;
  private bubbles: THREE.Points | null = null;
  // full-screen fade quad attached to the camera
  private fadeMesh!: THREE.Mesh;
  private fade: { from: number; to: number; dur: number; t: number; then?: () => void } | null = null;

  // Player & Navigation
  public playerPosition = new THREE.Vector3(0, 1.7, 30);
  public playerRotationY = 0; // forward is -Z, i.e. toward the main hall
  public playerPitch = 0; // Look up/down

  // Camera Target
  private cameraTargetPos = new THREE.Vector3();
  private cameraTargetLook = new THREE.Vector3();
  public isCinematicMode = false;
  private cinematicTime = 0;
  public isAutoCycleTime = false;
  private autoCycleTimer = 0;

  // Input states
  public keysPressed: Record<string, boolean> = {};
  public joystickVector = { x: 0, y: 0 };
  public isDragging = false;
  public previousPointerPos = { x: 0, y: 0 };

  private isRunning = false;
  private lastTime = 0;
  private animFrameId: number | null = null;

  // Pre-allocated math objects to avoid GC in render loop (Three.js skill mandate)
  private readonly _vec3 = new THREE.Vector3();
  private readonly _forward = new THREE.Vector3();
  private readonly _right = new THREE.Vector3();

  constructor(container: HTMLElement, shrineData: ShrineData, callbacks: SceneCallbacks = {}) {
    this.container = container;
    this.shrineData = shrineData;
    this.callbacks = callbacks;

    // 1. Create Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xd6e5eb, 0.015);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(58, aspect, 0.1, 1200);
    this.camera.position.set(0, 2.2, 34);
    this.fadeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false })
    );
    this.fadeMesh.position.z = -0.3;
    this.fadeMesh.renderOrder = 9999;
    this.fadeMesh.frustumCulled = false;
    this.camera.add(this.fadeMesh);
    this.scene.add(this.camera);

    // 3. Renderer with Three.js studio color pipeline
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    this.renderer = new THREE.WebGLRenderer({
      antialias: !isHeadless,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Mandatory Studio Environment Reflection (RoomEnvironment)
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    // 5. Lighting Setup
    this.hemiLight = new THREE.HemisphereLight(0xfff6ea, 0x829ca8, 0.7);
    this.scene.add(this.hemiLight);

    this.ambientFill = new THREE.AmbientLight(0xffffff, 0.25);
    this.scene.add(this.ambientFill);

    this.sunLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.sunLight.position.set(30, 45, 25);
    this.sunLight.castShadow = !isHeadless;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 160;
    const d = 45;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // 6. Textures & Builder
    this.textures = createProceduralTextures();
    this.builder = new ShrineBuilder(this.textures);

    // 7. Build Environment & Architecture
    this.buildWorld();
    if (import.meta.env.DEV) (window as unknown as { __scene: ShrineScene }).__scene = this;

    // 8. Event Listeners
    this.bindEvents();

    // Start loop
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animate();
  }

  /**
   * Constructs the authentic 3D environment for the selected shrine
   */
  private buildWorld() {
    const layout = LAYOUTS[this.shrineData.id];
    if (!layout) {
      this.buildLegacyWorld();
      this.spots = this.shrineData.spots;
      return;
    }
    const m = createKitMaterials(this.textures);
    const arch = new Architecture(m);
    const nat = new Nature(m);
    this.nature = nat;
    this.kitForEncounters = { arch, nat, m };
    const self = this;
    const ctx: LayoutCtx = {
      scene: this.scene,
      arch,
      nat,
      m,
      builder: this.builder,
      get ground() {
        return self.ground;
      },
      setGround: (fn) => (this.ground = fn),
      add: (o, x = 0, z = 0, rotY = 0, y = 0) => {
        o.position.set(x, this.ground(x, z) + y, z);
        o.rotation.y = rotY;
        o.traverse((c) => {
          const mesh = c as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });
        this.scene.add(o);
        return o;
      },
      terrain: (color, size = 360, seg = 150) => {
        const geo = new THREE.PlaneGeometry(size, size, seg, seg);
        geo.rotateX(-Math.PI / 2);
        const p = geo.attributes.position;
        const cols = new Float32Array(p.count * 3);
        const base = new THREE.Color(color);
        const tmp = new THREE.Color();
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), z = p.getZ(i);
          p.setY(i, this.ground(x, z) - 0.02);
          const h = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
          const n = (h - Math.floor(h) - 0.5) * 0.07;
          tmp.copy(base).offsetHSL(0, 0, n);
          cols[i * 3] = tmp.r; cols[i * 3 + 1] = tmp.g; cols[i * 3 + 2] = tmp.b;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
      },
      water: (y, w, d, x = 0, z = 0, color) => {
        const mat = m.water.clone();
        if (color !== undefined) mat.color.set(color);
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, y, z);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
      },
      path: (pts, w, kind, lift = 0.05) => {
        const pos: number[] = [];
        const uv: number[] = [];
        const idx: number[] = [];
        let dist = 0;
        const samples: [number, number][] = [];
        for (let i = 0; i < pts.length - 1; i++) {
          const [ax, az] = pts[i], [bx, bz] = pts[i + 1];
          const L = Math.hypot(bx - ax, bz - az);
          const n = Math.max(1, Math.ceil(L / 1.0));
          for (let k = 0; k < n; k++) samples.push([ax + ((bx - ax) * k) / n, az + ((bz - az) * k) / n]);
        }
        samples.push(pts[pts.length - 1]);
        samples.forEach(([x, z], i) => {
          const [px, pz] = samples[Math.max(0, i - 1)], [nx, nz] = samples[Math.min(samples.length - 1, i + 1)];
          let dx = nx - px, dz = nz - pz;
          const l = Math.hypot(dx, dz) || 1;
          dx /= l; dz /= l;
          const ox = -dz * (w / 2), oz = dx * (w / 2);
          if (i > 0) dist += Math.hypot(x - samples[i - 1][0], z - samples[i - 1][1]);
          pos.push(x + ox, this.ground(x + ox, z + oz) + lift, z + oz, x - ox, this.ground(x - ox, z - oz) + lift, z - oz);
          uv.push(0, dist / w, 1, dist / w);
          if (i > 0) {
            const a = (i - 1) * 2;
            idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
          }
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        const mat =
          kind === 'gravel' ? m.gravel : kind === 'paving' ? m.paving : kind === 'wood' ? m.wood.darkWood
          : new THREE.MeshStandardMaterial({ color: 0x8a7558, roughness: 1 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.receiveShadow = true;
        this.scene.add(mesh);
        return mesh;
      },
    };
    const res: LayoutResult = layout(ctx);
    this.applyLayout(res);
  }

  /** Apply what a layout returned: spawn, bounds, spot anchors, ambience */
  private applyLayout(res: LayoutResult) {
    this.encounterDefs = res.encounters ?? [];
    this.secrets = res.secrets ?? [];
    this.etiquette = res.etiquette ?? {};
    this.nightObjects = res.nightObjects ?? [];
    this.walkable = res.walkable ?? null;
    this.bounds = res.bounds;
    this.fogMul = res.fog ?? 1;
    this.particleKind = res.particles ?? 'none';
    if (res.orbit) this.orbit = { y: 9, ...res.orbit };
    if (res.smoke) {
      this.smokeOrigin.set(res.smoke[0], res.smoke[1], res.smoke[2]);
      this.createIncenseSmoke(res.smoke[0], res.smoke[1], res.smoke[2]);
    }
    if (res.bobbingWater) {
      this.waterPlane = res.bobbingWater;
      this.waterBaseY = res.bobbingWater.position.y;
    }
    this.spots = this.shrineData.spots.map((s) => {
      const a = res.anchors[s.id] ?? res.anchors[s.type];
      return a
        ? { ...s, position: [a.at[0], 0, a.at[1]] as [number, number, number], cameraTarget: [a.look[0], 2, a.look[1]] as [number, number, number] }
        : s;
    });
    this.createParticles(this.particleKind);
    this.playerPosition.set(res.spawn.x, 1.7 + this.ground(res.spawn.x, res.spawn.z), res.spawn.z);
    this.playerRotationY = res.spawn.rotY;
    this.setTimeOfDay('day');
  }

  /** Previous one-size-fits-all world, kept only until every shrine has a layout */
  private buildLegacyWorld() {
    const style = this.shrineData.architectureStyle;
    const isFloating = style === 'itsukushima_floating';

    // 1. Terrain Base
    const terrainSize = 220;
    const terrainGeom = new THREE.PlaneGeometry(terrainSize, terrainSize, 32, 32);

    let groundMat: THREE.MeshStandardMaterial;
    if (isFloating) {
      // Shoreline sand
      groundMat = new THREE.MeshStandardMaterial({
        color: 0xd8caa5,
        roughness: 0.9,
      });
    } else {
      // Mossy sacred earth & grass
      groundMat = new THREE.MeshStandardMaterial({
        color: style === 'meiji_sacred_forest' ? 0x2e3d2c : 0x3d4b32,
        roughness: 0.85,
      });
    }

    const terrain = new THREE.Mesh(terrainGeom, groundMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.05;
    terrain.receiveShadow = true;
    this.scene.add(terrain);

    // 2. Water Feature (Itsukushima Floating Sea or Sacred Stream)
    if (isFloating) {
      const waterGeom = new THREE.PlaneGeometry(terrainSize, terrainSize);
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x1f5466,
        roughness: 0.1,
        metalness: 0.25,
        transparent: true,
        opacity: 0.88,
      });
      this.waterPlane = new THREE.Mesh(waterGeom, waterMat);
      this.waterPlane.rotation.x = -Math.PI / 2;
      this.waterPlane.position.y = 0.4;
      this.scene.add(this.waterPlane);

      // Wooden Pier Boardwalks connecting pavilions over water
      const pierGeom = new THREE.BoxGeometry(6, 0.4, 46);
      const pierMat = new THREE.MeshStandardMaterial({
        map: this.textures.vermilion,
        color: 0xcc2814,
        roughness: 0.5,
      });
      const pier = new THREE.Mesh(pierGeom, pierMat);
      pier.position.set(0, 0.55, 6);
      pier.castShadow = true;
      pier.receiveShadow = true;
      this.scene.add(pier);

      // Pier pilings in water
      for (let pz = -14; pz <= 26; pz += 5) {
        [-2.7, 2.7].forEach((px) => {
          const pilingGeom = new THREE.CylinderGeometry(0.18, 0.18, 1.5, 12);
          const pilingMat = new THREE.MeshStandardMaterial({ color: 0x1d1512 });
          const piling = new THREE.Mesh(pilingGeom, pilingMat);
          piling.position.set(px, 0.2, pz);
          this.scene.add(piling);
        });
      }
    } else {
      // Paved Stone Sando (Approach path leading to shrine)
      const sandoGeom = new THREE.BoxGeometry(6.5, 0.08, 54);
      const sandoMat = new THREE.MeshStandardMaterial({
        map: this.textures.graniteStone,
        roughness: 0.8,
        color: 0x9fa4a9,
      });
      const sando = new THREE.Mesh(sandoGeom, sandoMat);
      sando.position.set(0, 0.02, 6);
      sando.receiveShadow = true;
      this.scene.add(sando);
    }

    // 3. Torii Entrance Gate(s)
    if (style === 'fushimi_inari') {
      // Grand First Torii
      const grandTorii = this.builder.buildToriiGate(true, 1.15);
      grandTorii.position.set(0, 0, 26);
      this.scene.add(grandTorii);

      // Senbon Torii Tunnel heading inward
      const tunnel = this.builder.buildToriiTunnel(12, 2.3);
      tunnel.position.set(0, 0, 14);
      this.scene.add(tunnel);

      // Kitsune Fox Statues flanking the gate
      const foxL = this.builder.buildKitsuneStatue(true);
      foxL.position.set(-4.5, 0, 22);
      foxL.rotation.y = 0.5;
      this.scene.add(foxL);

      const foxR = this.builder.buildKitsuneStatue(false);
      foxR.position.set(4.5, 0, 22);
      foxR.rotation.y = -0.5;
      this.scene.add(foxR);
    } else if (isFloating) {
      // Floating Grand O-Torii standing far out in the tidal sea
      const floatingTorii = this.builder.buildToriiGate(true, 1.4);
      floatingTorii.position.set(0, 0, 28);
      this.scene.add(floatingTorii);
    } else if (style === 'meiji_sacred_forest' || style === 'ise_jingu' || style === 'izumo_taisha') {
      // Colossal Cypress Natural Wood O-Torii (Shinmei Torii style)
      const cypressTorii = this.builder.buildToriiGate(false, 1.35);
      cypressTorii.position.set(0, 0, 27);
      this.scene.add(cypressTorii);
    } else if (style === 'sensoji_pagoda' || style === 'todaiji_daibutsu') {
      // Kaminarimon / Nandaimon Temple Gate with giant lantern
      const templeGate = this.builder.buildToriiGate(true, 1.3);
      templeGate.position.set(0, 0, 26);
      this.scene.add(templeGate);

      // Giant Red Chochin Lantern
      const giantLantern = this.builder.buildHangingLantern();
      giantLantern.scale.set(2.2, 2.2, 2.2);
      giantLantern.position.set(0, 6.2, 26);
      this.scene.add(giantLantern);
    } else if (style === 'nikko_tosho' || style === 'dazaifu_tenmangu' || style === 'kotohira_gu' || style === 'hokkaido_jingu') {
      // Grand Vermilion Torii Gate with bronze accents
      const grandGate = this.builder.buildToriiGate(true, 1.25);
      grandGate.position.set(0, 0, 26);
      this.scene.add(grandGate);
    } else {
      // Default Chumon Temple / Shrine Gate
      const gate = this.builder.buildToriiGate(true, 1.15);
      gate.position.set(0, 0, 26);
      this.scene.add(gate);
    }

    // 4. Main Sanctuary (Haiden / Golden Pavilion / Kiyomizu Stage)
    if (style === 'kinkakuji_golden') {
      // Golden Pavilion on Mirror Pond
      const goldenPavilion = this.builder.buildGoldenPavilion();
      goldenPavilion.position.set(0, 0, -12);
      this.scene.add(goldenPavilion);

      // Water plane for Kyoko-chi Mirror Pond
      const pondGeom = new THREE.PlaneGeometry(80, 50);
      const pondMat = new THREE.MeshStandardMaterial({
        color: 0x1a3338,
        roughness: 0.1,
        metalness: 0.35,
        transparent: true,
        opacity: 0.9,
      });
      const pond = new THREE.Mesh(pondGeom, pondMat);
      pond.rotation.x = -Math.PI / 2;
      pond.position.set(0, 0.45, 0);
      this.scene.add(pond);

      // Bonsai rock islets in the pond
      [[-8, 0, -4], [7, 0, 2], [-14, 0, 4]].forEach(([rx, ry, rz]) => {
        const rockGeom = new THREE.DodecahedronGeometry(1.6, 1);
        const rock = new THREE.Mesh(rockGeom, this.builder['matGranite']);
        rock.position.set(rx, ry + 0.6, rz);
        this.scene.add(rock);

        const pine = this.builder.buildTree('pine', 0.6);
        pine.position.set(rx, ry + 1.2, rz);
        this.scene.add(pine);
      });
    } else if (style === 'kiyomizudera_stage') {
      // Kiyomizu-dera monumental wooden scaffold stage & Otowa waterfall
      const kiyomizu = this.builder.buildKiyomizuStage();
      kiyomizu.position.set(0, 0, -12);
      this.scene.add(kiyomizu);
    } else {
      const sanctuary = this.builder.buildSanctuary(style);
      sanctuary.position.set(0, 0, -14);
      this.scene.add(sanctuary);
    }

    // 5. Special Pagodas / Stupas
    if (style === 'sensoji_pagoda' || style === 'nikko_tosho' || style === 'todaiji_daibutsu') {
      const pagoda = this.builder.buildPagoda(false);
      pagoda.position.set(-15, 0, -4);
      this.scene.add(pagoda);

      // Jokoro Incense Urn in courtyard
      const jokoro = this.builder.buildJokoro();
      jokoro.position.set(0, 0, 4);
      this.scene.add(jokoro);
      this.createIncenseSmoke(0, 2.2, 4);
    } else if (style === 'koyasan_mountain') {
      const stupa = this.builder.buildPagoda(true);
      stupa.position.set(0, 0, 3);
      this.scene.add(stupa);
    }

    // 6. Temizuya Water Basin Pavilion
    const temizuya = this.builder.buildTemizuya();
    temizuya.position.set(-9.5, 0, 15);
    temizuya.rotation.y = 0.2;
    this.scene.add(temizuya);

    // 7. Ema Votive Board Rack
    const emaRack = this.builder.buildEmaRack();
    emaRack.position.set(10.5, 0, -11);
    emaRack.rotation.y = -0.3;
    this.scene.add(emaRack);

    // 8. Stone Lanterns (Ishidōrō) along approach path
    const lanternZPoints = [24, 17, 10, 3, -4, -10];
    lanternZPoints.forEach((z) => {
      [-4.6, 4.6].forEach((x) => {
        const ishidoro = this.builder.buildIshidoro(true);
        ishidoro.position.set(x, 0, z);
        this.scene.add(ishidoro);

        const pLight = ishidoro.getObjectByName('lanternPointLight') as THREE.PointLight;
        if (pLight) {
          this.dynamicLights.push(pLight);
        }
      });
    });

    // 9. Trees & Perimeter Forest (Anti-box discipline)
    const treeTypes: ('sakura' | 'pine' | 'cedar')[] = 
      style === 'meiji_sacred_forest' ? ['cedar', 'cedar', 'pine'] :
      style === 'fushimi_inari' ? ['cedar', 'pine', 'sakura'] :
      ['sakura', 'pine', 'cedar'];

    // Place trees bordering the courtyard
    for (let i = 0; i < 34; i++) {
      const angle = (i / 34) * Math.PI * 2;
      const radius = 24 + Math.random() * 16;
      const tx = Math.cos(angle) * radius;
      const tz = Math.sin(angle) * radius;

      // Keep walkway clear
      if (Math.abs(tx) < 7 && tz > -18 && tz < 32) continue;

      const type = treeTypes[i % treeTypes.length];
      const tree = this.builder.buildTree(type, 0.85 + Math.random() * 0.4);
      tree.position.set(tx, 0, tz);
      tree.rotation.y = Math.random() * Math.PI * 2;
      this.scene.add(tree);
    }

    // 10. Sakura Falling Petals Particle System
    this.createFallingPetals();

    // Set initial player position
    this.playerPosition.set(0, 1.7, 31);
    this.playerRotationY = 0; // face the main hall (forward vector is -Z)
    this.setTimeOfDay('day');
  }

  /**
   * Falling Sakura Petals Particle System
   */
  private createFallingPetals() {
    this.createParticles('sakura');
  }

  private createParticles(kind: ParticleKind) {
    if (kind === 'none') return;
    const look: Record<Exclude<ParticleKind, 'none'>, { color: number; size: number; count: number; fall: number }> = {
      sakura: { color: 0xffb3c6, size: 0.28, count: 450, fall: 0.5 },
      plum: { color: 0xfff0f4, size: 0.24, count: 300, fall: 0.45 },
      maple: { color: 0xd2452a, size: 0.36, count: 260, fall: 0.7 },
      ginkgo: { color: 0xf0c84a, size: 0.34, count: 260, fall: 0.65 },
      snow: { color: 0xffffff, size: 0.2, count: 900, fall: 0.9 },
    };
    const cfg = look[kind];
    const petalCount = cfg.count;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(petalCount * 3);
    const velocities = new Float32Array(petalCount * 3);

    for (let i = 0; i < petalCount; i++) {
      positions[i * 3] = this.playerPosition.x + (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = this.playerPosition.y + Math.random() * 18 - 1;
      positions[i * 3 + 2] = this.playerPosition.z + (Math.random() - 0.5) * 60;

      velocities[i * 3] = Math.sin(i) * 0.4 + 0.2; // drift x
      velocities[i * 3 + 1] = -(cfg.fall * (0.8 + Math.random() * 0.8)); // fall y
      velocities[i * 3 + 2] = Math.cos(i) * 0.3; // drift z
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const mat = new THREE.PointsMaterial({
      color: cfg.color,
      size: cfg.size,
      transparent: true,
      opacity: kind === 'snow' ? 0.95 : 0.85,
    });

    this.petalParticles = new THREE.Points(geom, mat);
    this.scene.add(this.petalParticles);
  }

  /**
   * Billowing Incense Smoke Particles for Jokoro
   */
  private createIncenseSmoke(x: number, y: number, z: number) {
    const smokeCount = 120;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(smokeCount * 3);

    for (let i = 0; i < smokeCount; i++) {
      positions[i * 3] = x + (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 1] = y + Math.random() * 2.8;
      positions[i * 3 + 2] = z + (Math.random() - 0.5) * 0.4;
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xdddddf,
      size: 0.35,
      transparent: true,
      opacity: 0.45,
    });

    this.smokeParticles = new THREE.Points(geom, mat);
    this.scene.add(this.smokeParticles);
  }

  /**
   * Time of Day Lighting Transitions
   */
  public setTimeOfDay(time: TimeOfDay) {
    this.timeOfDay = time;
    this.nightObjects.forEach((o) => (o.visible = time === 'night'));
    if (this.enc && this.enc.rt) return; // keep the secret world's own light until you return

    if (time === 'day') {
      this.scene.background = new THREE.Color(0xbfe0f0);
      (this.scene.fog as THREE.FogExp2).color.set(0xbfe0f0);
      (this.scene.fog as THREE.FogExp2).density = 0.012 * this.fogMul;

      this.sunLight.color.set(0xfffaed);
      this.sunLight.intensity = 2.0;
      this.sunOffset.set(30, 45, 25);

      this.hemiLight.color.set(0xfff6ea);
      this.hemiLight.groundColor.set(0x829ca8);
      this.hemiLight.intensity = 0.7;

      this.ambientFill.intensity = 0.25;

      // Dim stone lanterns
      this.dynamicLights.forEach((l) => (l.intensity = 0.3));
    } else if (time === 'twilight') {
      this.scene.background = new THREE.Color(0xf69d62);
      (this.scene.fog as THREE.FogExp2).color.set(0xf69d62);
      (this.scene.fog as THREE.FogExp2).density = 0.016 * this.fogMul;

      this.sunLight.color.set(0xff7733);
      this.sunLight.intensity = 1.4;
      this.sunOffset.set(45, 16, 20);

      this.hemiLight.color.set(0xffaa77);
      this.hemiLight.groundColor.set(0x553344);
      this.hemiLight.intensity = 0.55;

      this.ambientFill.intensity = 0.15;

      // Warm glowing lanterns
      this.dynamicLights.forEach((l) => (l.intensity = 1.5));
    } else {
      // Night (Yozora)
      this.scene.background = new THREE.Color(0x0c1220);
      (this.scene.fog as THREE.FogExp2).color.set(0x0c1220);
      (this.scene.fog as THREE.FogExp2).density = 0.018 * this.fogMul;

      this.sunLight.color.set(0x6688cc); // Moon light
      this.sunLight.intensity = 0.45;
      this.sunOffset.set(-25, 40, -15);

      this.hemiLight.color.set(0x223355);
      this.hemiLight.groundColor.set(0x080c14);
      this.hemiLight.intensity = 0.3;

      this.ambientFill.intensity = 0.08;

      // Brilliant warm glowing lanterns in the dark
      this.dynamicLights.forEach((l) => (l.intensity = 2.4));
    }
  }

  /**
   * Teleport smoothly to one of the key spots (Torii, Temizuya, Haiden, Ema, etc.)
   */
  public teleportToSpot(spotId: string) {
    if (this.enc) this.abortEncounter();
    this.blindwalk = null;
    const spot = this.spots.find((s) => s.id === spotId);
    if (!spot) return;

    this.playerPosition.set(spot.position[0], 1.7 + this.ground(spot.position[0], spot.position[2]), spot.position[2]);
    // Calculate rotation facing spot target
    const dx = spot.cameraTarget[0] - spot.position[0];
    const dz = spot.cameraTarget[2] - spot.position[2];
    this.playerRotationY = Math.atan2(dx, dz) + Math.PI;
    this.playerPitch = 0;
  }

  /**
   * Ring the sacred bell with visual shake animation
   */
  public ringBell() {
    soundService.playSuzuBell();
    // Animate bell rope
    const suzuRope = this.scene.getObjectByName('suzuRope');
    if (suzuRope) {
      let t = 0;
      const shakeInterval = setInterval(() => {
        t += 0.2;
        suzuRope.rotation.z = Math.sin(t * 12) * 0.15;
        if (t >= 1.6) {
          clearInterval(shakeInterval);
          suzuRope.rotation.z = 0;
        }
      }, 30);
    }
  }

  /**
   * Input binding
   */
  private bindEvents() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onWindowResize);

    const dom = this.renderer.domElement;
    dom.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = true;
    if (e.code === 'KeyB' && !e.repeat) this.bow();
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.code] = false;
  };

  private onPointerDown = (e: PointerEvent) => {
    this.isDragging = true;
    this.previousPointerPos = { x: e.clientX, y: e.clientY };
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.isDragging) return;
    const deltaX = e.clientX - this.previousPointerPos.x;
    const deltaY = e.clientY - this.previousPointerPos.y;
    this.previousPointerPos = { x: e.clientX, y: e.clientY };

    const sensitivity = 0.0035;
    this.playerRotationY -= deltaX * sensitivity;
    this.playerPitch -= deltaY * sensitivity;
    this.playerPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.playerPitch));
  };

  private onPointerUp = () => {
    this.isDragging = false;
  };

  private onWindowResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Render tick
   */
  private animate = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.elapsed += delta;
    this.updateFade(delta);
    this.updatePlayerMovement(delta);
    this.updateEncounter(delta);
    this.updateManners(delta);
    this.updateParticles(delta);
    if (this.nature) {
      const t = now / 1000;
      this.nature.animated.forEach((a) => a.update(t));
    }
    // keep the shadow-casting sun centred on the visitor, so big sites still get shadows
    this.sunLight.target.position.copy(this.playerPosition);
    this.sunLight.position.copy(this.playerPosition).add(this.sunOffset);
    this.updateLightingCycle(delta);
    this.checkNearbySpots();

    this.renderer.render(this.scene, this.camera);
    this.animFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Update Player Movement & Camera Position
   */
  private updatePlayerMovement(delta: number) {
    if (this.isCinematicMode && !this.enc) {
      // Cinematic auto-tour orbit
      this.cinematicTime += delta * 0.25;
      const o = this.orbit;
      const cx = o.x + Math.sin(this.cinematicTime) * o.r;
      const cz = o.z + Math.cos(this.cinematicTime) * o.r;
      const gy = this.ground(o.x, o.z);
      const cy = gy + o.y + Math.sin(this.cinematicTime * 2) * 2.5;

      this.camera.position.set(cx, cy, cz);
      this.camera.lookAt(o.x, gy + 3, o.z);
      return;
    }

    const prevX = this.playerPosition.x;
    const prevZ = this.playerPosition.z;

    // Direction vectors
    const running = !!(this.keysPressed['ShiftLeft'] || this.keysPressed['ShiftRight']);
    const frozen = !!this.fade || (this.enc !== null && (this.enc.ending || !this.enc.rt));
    const swim = this.enc?.rt?.underwater ? 0.65 : 1;
    const moveSpeed = frozen ? 0 : (running ? 9.0 : 4.5) * swim * delta;

    this._forward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotationY);
    this._right.set(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotationY);

    let moved = false;

    // Keyboard controls (WASD & Arrows)
    if (this.keysPressed['KeyW'] || this.keysPressed['ArrowUp']) {
      this.playerPosition.addScaledVector(this._forward, moveSpeed);
      moved = true;
    }
    if (this.keysPressed['KeyS'] || this.keysPressed['ArrowDown']) {
      this.playerPosition.addScaledVector(this._forward, -moveSpeed);
      moved = true;
    }
    if (this.keysPressed['KeyA'] || this.keysPressed['ArrowLeft']) {
      this.playerPosition.addScaledVector(this._right, -moveSpeed);
      moved = true;
    }
    if (this.keysPressed['KeyD'] || this.keysPressed['ArrowRight']) {
      this.playerPosition.addScaledVector(this._right, moveSpeed);
      moved = true;
    }

    // Touch joystick
    if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
      this.playerPosition.addScaledVector(this._forward, -this.joystickVector.y * moveSpeed);
      this.playerPosition.addScaledVector(this._right, this.joystickVector.x * moveSpeed);
      moved = true;
    }

    // Play footstep sound periodically
    if (moved && Math.random() < 0.08 && !this.enc?.rt?.underwater) {
      soundService.playFootstep();
    }
    this.manners.runT = moved && running ? this.manners.runT + delta : 0;

    // Stepping somewhere special: a secret world, or somewhere you shouldn't go
    if (moved && !this.enc) {
      const px = this.playerPosition.x, pz = this.playerPosition.z;
      const hit = this.encCooldown <= 0 ? this.encounterDefs.find((e) => e.zone(px, pz)) : undefined;
      if (hit) {
        this.playerPosition.x = prevX;
        this.playerPosition.z = prevZ;
        this.startEncounter(hit);
      } else {
        const bad = this.etiquette.forbidden?.find((f) => f.test(px, pz));
        if (bad) {
          this.playerPosition.x = prevX;
          this.playerPosition.z = prevZ;
          if (this.manners.forbidCool <= 0) {
            this.manners.forbidCool = 6;
            this.callbacks.onCaption?.(bad.reason, 4);
            if (this.manners.forbidCount < 3) {
              this.manners.forbidCount++;
              this.callbacks.onLuck?.(-(bad.penalty ?? 3), bad.reason, 'forbidden');
            }
          }
        }
      }
    }

    // Constrain player within the site, and off water / out of ponds
    const b = this.bounds;
    this.playerPosition.x = Math.max(b.x0, Math.min(b.x1, this.playerPosition.x));
    this.playerPosition.z = Math.max(b.z0, Math.min(b.z1, this.playerPosition.z));
    if (this.walkable && !this.walkable(this.playerPosition.x, this.playerPosition.z)) {
      // try sliding along one axis before giving up
      if (this.walkable(this.playerPosition.x, prevZ)) this.playerPosition.z = prevZ;
      else if (this.walkable(prevX, this.playerPosition.z)) this.playerPosition.x = prevX;
      else {
        this.playerPosition.x = prevX;
        this.playerPosition.z = prevZ;
      }
    }
    // follow the ground (stairs, slopes, bridges) with a little smoothing
    const targetY = 1.7 + this.ground(this.playerPosition.x, this.playerPosition.z);
    this.playerPosition.y += (targetY - this.playerPosition.y) * Math.min(1, delta * 12);

    // Smooth camera update
    this.camera.position.copy(this.playerPosition);
    if (this.enc?.rt?.underwater) this.camera.position.y += Math.sin(this.elapsed * 1.6) * 0.18;
    if (this.shakeT > 0) {
      this.shakeT -= delta;
      this.camera.position.x += (Math.random() - 0.5) * this.shakeAmt;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeAmt;
    }
    let pitch = this.playerPitch;
    if (this.bowAnim > 0) {
      this.bowAnim = Math.max(0, this.bowAnim - delta);
      pitch -= Math.sin(((1.6 - this.bowAnim) / 1.6) * Math.PI) * 0.75;
    }

    // Look target
    this._forward.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
    this._forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.playerRotationY);

    this.cameraTargetLook.copy(this.playerPosition).add(this._forward);
    this.camera.lookAt(this.cameraTargetLook);
  }

  /**
   * Update dynamic particles (petals & smoke)
   */
  private updateParticles(delta: number) {
    // Sakura petals drifting
    if (this.petalParticles) {
      const posAttr = this.petalParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const velAttr = this.petalParticles.geometry.getAttribute('velocity') as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const velocities = velAttr.array as Float32Array;

      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3] += velocities[i * 3] * delta;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * delta;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * delta;

        // Reset if hit ground or out of bounds
        if (positions[i * 3 + 1] < this.playerPosition.y - 2) {
          positions[i * 3 + 1] = this.playerPosition.y + 14 + Math.random() * 4;
          positions[i * 3] = this.playerPosition.x + (Math.random() - 0.5) * 50;
          positions[i * 3 + 2] = this.playerPosition.z + (Math.random() - 0.5) * 50;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Incense smoke rising
    if (this.smokeParticles) {
      const posAttr = this.smokeParticles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;

      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += delta * 0.9;
        positions[i * 3] += Math.sin(positions[i * 3 + 1] * 4 + i) * delta * 0.15;

        if (positions[i * 3 + 1] > this.smokeOrigin.y + 3.3) {
          positions[i * 3 + 1] = this.smokeOrigin.y;
          positions[i * 3] = this.smokeOrigin.x + (Math.random() - 0.5) * 0.4;
          positions[i * 3 + 2] = this.smokeOrigin.z + (Math.random() - 0.5) * 0.4;
        }
      }
      posAttr.needsUpdate = true;
    }

    // Water ripple effect for Itsukushima
    if (this.waterPlane) {
      this.waterPlane.position.y = this.waterBaseY + Math.sin(performance.now() * 0.0018) * 0.04;
    }
  }

  /**
   * Dynamic Day / Sunset / Night Lighting Cycle
   */
  private updateLightingCycle(delta: number) {
    if (!this.isAutoCycleTime || this.enc) return;
    this.autoCycleTimer += delta * 0.07;
    const phase = (Math.sin(this.autoCycleTimer) + 1) / 2; // 0 to 1

    if (phase > 0.65) {
      if (this.timeOfDay !== 'day') this.setTimeOfDay('day');
    } else if (phase > 0.3) {
      if (this.timeOfDay !== 'twilight') this.setTimeOfDay('twilight');
    } else {
      if (this.timeOfDay !== 'night') this.setTimeOfDay('night');
    }
  }

  /**
   * Check proximity to sacred interactive spots
   */
  private checkNearbySpots() {
    if (this.enc) {
      this.callbacks.onNearSpot?.(null, null, null);
      return;
    }
    let nearestSpot: { id: string; name: string; type: string } | null = null;
    let minDist = 4.8; // Interaction trigger radius

    for (const spot of this.spots) {
      const dist = Math.hypot(this.playerPosition.x - spot.position[0], this.playerPosition.z - spot.position[2]);
      if (dist < minDist) {
        minDist = dist;
        nearestSpot = { id: spot.id, name: spot.name, type: spot.type };
      }
    }

    if (this.callbacks.onNearSpot) {
      if (nearestSpot) {
        this.callbacks.onNearSpot(nearestSpot.id, nearestSpot.name, nearestSpot.type);
      } else {
        this.callbacks.onNearSpot(null, null, null);
      }
    }
  }

  /* ================================================================== */
  /* Fades                                                               */
  /* ================================================================== */
  private fadeTo(color: number, to: number, dur: number, then?: () => void) {
    const mat = this.fadeMesh.material as THREE.MeshBasicMaterial;
    mat.color.set(color);
    this.fade = { from: mat.opacity, to, dur: Math.max(0.01, dur), t: 0, then };
  }
  private updateFade(dt: number) {
    if (!this.fade) return;
    const f = this.fade;
    f.t += dt;
    const k = Math.min(1, f.t / f.dur);
    (this.fadeMesh.material as THREE.MeshBasicMaterial).opacity = f.from + (f.to - f.from) * k;
    if (k >= 1) {
      this.fade = null;
      f.then?.();
    }
  }

  /* ================================================================== */
  /* Secret worlds                                                       */
  /* ================================================================== */
  private startEncounter(def: EncounterDef) {
    if (!this.kitForEncounters) return;
    this.isCinematicMode = false;
    this.blindwalk = null;
    this.enc = {
      def,
      rt: null,
      root: null,
      t: 0,
      ending: false,
      saved: { ground: this.ground, walkable: this.walkable, bounds: this.bounds },
    };
    this.callbacks.onEncounter?.({ type: 'start', id: def.id, title: def.title });
    this.fadeTo(def.diveColor, 1, 0.7, () => {
      if (!this.enc) return;
      const root = new THREE.Group();
      root.position.y = POCKET_Y;
      this.scene.add(root);
      const rt = def.build({ root, builder: this.builder, ...this.kitForEncounters! });
      root.traverse((c) => {
        const mesh = c as THREE.Mesh;
        if (mesh.isMesh) mesh.receiveShadow = true;
      });
      this.enc.rt = rt;
      this.enc.root = root;
      this.ground = (x, z) => POCKET_Y + rt.ground(x, z);
      this.walkable = rt.walkable ?? null;
      this.bounds = rt.bounds;
      // the secret world's own light and air
      this.scene.background = new THREE.Color(rt.env.bg);
      const fog = this.scene.fog as THREE.FogExp2;
      fog.color.set(rt.env.fog);
      fog.density = rt.env.density;
      this.sunLight.intensity = rt.env.sun;
      this.sunLight.color.set(rt.env.sunColor ?? 0xffffff);
      this.hemiLight.intensity = rt.env.hemi;
      this.hemiLight.color.set(rt.env.fog);
      this.hemiLight.groundColor.set(rt.env.bg);
      this.ambientFill.intensity = rt.env.ambient;
      if (this.petalParticles) this.petalParticles.visible = false;
      if (rt.underwater) this.createBubbles();
      this.playerPosition.set(rt.enter.x, POCKET_Y + rt.ground(rt.enter.x, rt.enter.z) + 1.7, rt.enter.z);
      this.playerRotationY = rt.enter.rotY;
      this.playerPitch = 0;
      this.fadeTo(def.diveColor, 0, 1.0);
    });
  }

  private encounterApi(): EncounterApi {
    return {
      caption: (text, seconds) => this.callbacks.onEncounter?.({ type: 'caption', id: this.enc?.def.id ?? '', text, seconds }),
      flash: (color, peak = 0.85, seconds = 0.5) => {
        if (this.enc?.ending) return;
        this.fadeTo(color, peak, seconds * 0.3, () => {
          if (!this.enc?.ending) this.fadeTo(color, 0, seconds * 0.7);
        });
      },
      shake: (amount, seconds = 0.6) => {
        this.shakeAmt = amount;
        this.shakeT = seconds;
      },
      setEnv: (env) => {
        if (!this.enc?.rt) return;
        const e = { ...this.enc.rt.env, ...env };
        this.enc.rt.env = e;
        this.scene.background = new THREE.Color(e.bg);
        const fog = this.scene.fog as THREE.FogExp2;
        fog.color.set(e.fog);
        fog.density = e.density;
        this.sunLight.intensity = e.sun;
        this.sunLight.color.set(e.sunColor ?? 0xffffff);
        this.hemiLight.intensity = e.hemi;
        this.ambientFill.intensity = e.ambient;
      },
      end: (color, seconds = 1.4) => {
        if (!this.enc || this.enc.ending) return;
        this.enc.ending = true;
        this.fadeTo(color, 1, seconds, () => this.finishEncounter(color));
      },
    };
  }

  private updateEncounter(dt: number) {
    this.encCooldown = Math.max(0, this.encCooldown - dt);
    if (!this.enc || !this.enc.rt || this.enc.ending) return;
    this.enc.t += dt;
    this.enc.rt.update(
      this.enc.t,
      dt,
      { x: this.playerPosition.x, y: this.playerPosition.y - POCKET_Y, z: this.playerPosition.z, rotY: this.playerRotationY },
      this.encounterApi()
    );
    if (this.bubbles) {
      const pos = this.bubbles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const a = pos.array as Float32Array;
      for (let i = 0; i < a.length; i += 3) {
        a[i + 1] += dt * (0.8 + (i % 7) * 0.12);
        a[i] += Math.sin(this.elapsed * 2 + i) * dt * 0.1;
        if (a[i + 1] > this.playerPosition.y + 6) {
          a[i] = this.playerPosition.x + (Math.random() - 0.5) * 16;
          a[i + 1] = this.playerPosition.y - 2;
          a[i + 2] = this.playerPosition.z + (Math.random() - 0.5) * 16;
        }
      }
      pos.needsUpdate = true;
    }
  }

  private createBubbles() {
    const n = 160;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = this.playerPosition.x + (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = this.playerPosition.y + (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = this.playerPosition.z + (Math.random() - 0.5) * 16;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.bubbles = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xdff6ff, size: 0.12, transparent: true, opacity: 0.7 }));
    this.scene.add(this.bubbles);
  }

  /** leave the secret world and put everything back */
  private restoreFromEncounter() {
    if (!this.enc) return;
    const { saved, root } = this.enc;
    if (root) {
      this.scene.remove(root);
      root.traverse((c) => {
        const mesh = c as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
        }
      });
    }
    if (this.bubbles) {
      this.scene.remove(this.bubbles);
      this.bubbles.geometry.dispose();
      this.bubbles = null;
    }
    this.ground = saved.ground;
    this.walkable = saved.walkable;
    this.bounds = saved.bounds;
    if (this.petalParticles) this.petalParticles.visible = true;
    this.enc = null;
    this.setTimeOfDay(this.timeOfDay);
  }

  private finishEncounter(color: number) {
    if (!this.enc) return;
    const def = this.enc.def;
    this.restoreFromEncounter();
    this.playerPosition.set(def.exit.x, 1.7 + this.ground(def.exit.x, def.exit.z), def.exit.z);
    this.playerRotationY = def.exit.rotY;
    this.playerPitch = 0;
    this.encCooldown = 4;
    this.fadeTo(color, 0, 1.2, () => this.callbacks.onEncounter?.({ type: 'end', id: def.id, card: def.card }));
  }

  /** used when teleporting away mid-encounter */
  private abortEncounter() {
    this.fade = null;
    (this.fadeMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    this.restoreFromEncounter();
    this.encCooldown = 2;
  }

  /* ================================================================== */
  /* Bowing, secrets and manners                                         */
  /* ================================================================== */
  /** Bow (B key / Bow button). Greets the kami at the gate, and some secrets answer a bow. */
  public bow() {
    if (this.bowAnim > 0 || this.enc) return;
    this.bowAnim = 1.6;
    this.manners.lastBow = this.elapsed;
    const px = this.playerPosition.x, pz = this.playerPosition.z;
    const s = this.secrets.find((d) => d.trigger === 'bow' && Math.hypot(px - d.at[0], pz - d.at[1]) < (d.r ?? 3));
    if (s) {
      setTimeout(() => this.foundSecret(s), 900);
      return;
    }
    const gate = this.spots.find((sp) => sp.type === 'torii');
    if (gate && Math.hypot(px - gate.position[0], pz - gate.position[2]) < 7 && !this.manners.bowedAtGate) {
      this.manners.bowedAtGate = true;
      this.callbacks.onLuck?.(1, 'Bowed before entering the sacred grounds', 'bow-gate');
    }
  }

  private foundSecret(d: SecretDef) {
    if (this.secretsFound.has(d.id)) return;
    this.secretsFound.add(d.id);
    d.onFound?.();
    soundService.playBellChime();
    this.callbacks.onSecret?.(d.id, d.card, d.luck);
  }

  private updateManners(dt: number) {
    const M = this.manners;
    M.centreCool = Math.max(0, M.centreCool - dt);
    M.runCool = Math.max(0, M.runCool - dt);
    M.forbidCool = Math.max(0, M.forbidCool - dt);
    if (this.enc || this.isCinematicMode) return;
    const px = this.playerPosition.x, pz = this.playerPosition.z;

    // walking straight down the middle of a shrine approach (seichū is the path of the kami)
    const lines = this.etiquette.centerLines ?? [];
    const onCentre = lines.some(([x0, z0, x1, z1]) => {
      const dx = x1 - x0, dz = z1 - z0;
      const t = Math.max(0, Math.min(1, ((px - x0) * dx + (pz - z0) * dz) / (dx * dx + dz * dz)));
      return t > 0 && t < 1 && Math.hypot(px - (x0 + dx * t), pz - (z0 + dz * t)) < 0.9;
    });
    const moving = this.manners.runT > 0 || Object.values(this.keysPressed).some(Boolean) || this.joystickVector.x !== 0 || this.joystickVector.y !== 0;
    M.centreT = onCentre && moving ? M.centreT + dt : Math.max(0, M.centreT - dt * 0.5);
    if (M.centreT > 3 && M.centreCool <= 0) {
      M.centreT = 0;
      M.centreCool = 25;
      if (M.centreCount < 3) {
        M.centreCount++;
        this.callbacks.onLuck?.(-1, 'The centre of the sandō is the path of the kami — walk to one side', 'centre');
      }
    }

    // looking back where you shouldn't
    for (const rule of this.etiquette.noLookBack ?? []) {
      if (M.lookBackDone || !rule.test(px, pz)) continue;
      const fx = -Math.sin(this.playerRotationY), fz = -Math.cos(this.playerRotationY);
      const l = Math.hypot(rule.facing[0], rule.facing[1]);
      if ((fx * rule.facing[0] + fz * rule.facing[1]) / l > 0.6) {
        M.lookBackT += dt;
        if (M.lookBackT > 0.8) {
          M.lookBackDone = true;
          this.callbacks.onLuck?.(-1, rule.reason, 'lookback');
        }
      } else M.lookBackT = 0;
    }

    // running near the halls
    const hall = this.spots.find((sp) => sp.type === 'haiden');
    if (hall && M.runT > 1.5 && Math.hypot(px - hall.position[0], pz - hall.position[2]) < 30 && M.runCool <= 0) {
      M.runCool = 20;
      if (M.runCount < 2) {
        M.runCount++;
        this.callbacks.onLuck?.(-1, 'Please walk calmly near the halls', 'run');
      }
    }

    // passing the gate without a bow
    const gate = this.spots.find((sp) => sp.type === 'torii');
    if (gate && !M.bowedAtGate && !M.gateWarned) {
      const gx = gate.position[0], gz = gate.position[2];
      const d = Math.hypot(px - gx, pz - gz);
      if (d < 4 && !M.gateHinted) {
        M.gateHinted = true;
        this.callbacks.onCaption?.('A bow before the gate greets the kami — press B or tap Bow', 5);
      }
      const lx = gate.cameraTarget[0], lz = gate.cameraTarget[2];
      const span = Math.hypot(lx - gx, lz - gz);
      if (M.gateHinted && d > 9 && Math.hypot(px - lx, pz - lz) < span) {
        M.gateWarned = true;
        this.callbacks.onLuck?.(-1, 'Walked through the gate without a bow', 'gate');
      }
    }

    // secrets
    for (const d of this.secrets) {
      if (this.secretsFound.has(d.id)) continue;
      const dist = Math.hypot(px - d.at[0], pz - d.at[1]);
      const r = d.r ?? 3;
      if (d.hint && dist < r * 2.2 && !this.secretHinted.has(d.id)) {
        this.secretHinted.add(d.id);
        this.callbacks.onCaption?.(d.hint, 5);
      }
      if (dist > r) {
        this.secretLinger[d.id] = 0;
        continue;
      }
      if (d.trigger === 'enter') this.foundSecret(d);
      else if (d.trigger === 'night' && this.timeOfDay === 'night') this.foundSecret(d);
      else if (d.trigger === 'linger') {
        this.secretLinger[d.id] = (this.secretLinger[d.id] ?? 0) + dt;
        if (this.secretLinger[d.id] > (d.seconds ?? 4)) this.foundSecret(d);
      } else if (d.trigger === 'blindwalk' && !this.blindwalk) {
        this.blindwalk = { def: d, t: 0 };
        this.fadeTo(0x000000, 0.94, 0.8);
        this.callbacks.onCaption?.('Eyes closed… walk to the other stone', 6);
      }
    }
    if (this.blindwalk) {
      const b = this.blindwalk;
      b.t += dt;
      const to = b.def.to!;
      if (Math.hypot(px - to[0], pz - to[1]) < 1.6) {
        this.blindwalk = null;
        this.fadeTo(0x000000, 0, 0.8);
        this.foundSecret(b.def);
      } else if (b.t > 25 || Math.hypot(px - b.def.at[0], pz - b.def.at[1]) > Math.hypot(to[0] - b.def.at[0], to[1] - b.def.at[1]) + 6) {
        this.blindwalk = null;
        this.fadeTo(0x000000, 0, 0.6);
        this.callbacks.onCaption?.('You open your eyes — not quite. Try again from the first stone.', 5);
      }
    }
  }

  /** Show the visitor's goen-musubi cords tied around this shrine's sacred tree */
  public setCords(colors: number[]) {
    const tree = this.scene.getObjectByName('goshinboku');
    if (!tree) return;
    const old = tree.getObjectByName('cords');
    if (old) tree.remove(old);
    const g = new THREE.Group();
    g.name = 'cords';
    colors.forEach((c, i) => {
      const mat = new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 });
      const y = 1.0 + (i % 9) * 0.15 + Math.floor(i / 9) * 0.05;
      const r = 0.92 - 0.44 * Math.min(1, y / 4.95) + 0.03;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.025, 6, 24), mat);
      ring.rotation.x = Math.PI / 2 + Math.sin(i * 2.1) * 0.08;
      ring.position.y = y;
      g.add(ring);
      // the knot and two short tails
      const a = i * 2.4;
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat);
      knot.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      g.add(knot);
      [-0.05, 0.05].forEach((d) => {
        const tail = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.01), mat);
        tail.position.set(Math.cos(a + d) * (r + 0.02), y - 0.14, Math.sin(a + d) * (r + 0.02));
        tail.rotation.y = -a;
        g.add(tail);
      });
    });
    tree.add(g);
  }

  /**
   * Cleanup
   */
  public dispose() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onWindowResize);

    const dom = this.renderer.domElement;
    dom.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);

    this.pmremGenerator.dispose();
    this.renderer.dispose();
    if (dom.parentElement) {
      dom.parentElement.removeChild(dom);
    }
  }
}
