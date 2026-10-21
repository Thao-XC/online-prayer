import * as THREE from 'three';
import type { LayoutCtx } from './types';

type Place = [number, number, number?];

/** Temizuya pavilion, ema rack and omikuji stand at the given places */
export function ritualSet(ctx: LayoutCtx, o: { temizuya?: Place; ema?: Place; omikuji?: Place }) {
  if (o.temizuya) ctx.add(ctx.builder.buildTemizuya(), o.temizuya[0], o.temizuya[1], o.temizuya[2] ?? 0);
  if (o.ema) ctx.add(ctx.builder.buildEmaRack(), o.ema[0], o.ema[1], o.ema[2] ?? 0);
  if (o.omikuji) {
    const g = new THREE.Group();
    g.add(ctx.arch.omikujiStand());
    const tree = sacredTree(ctx);
    // on the outer side of the stand, away from the halls in the middle of the precinct
    tree.position.set(3.8 * (Math.sign(o.omikuji[0]) || -1), 0, -1.4);
    g.add(tree);
    ctx.add(g, o.omikuji[0], o.omikuji[1], o.omikuji[2] ?? 0);
  }
}

/** Trunk radius of the sacred tree at height y (for wrapping ropes and cords) */
export const SACRED_TRUNK = (y: number) => 0.92 - 0.44 * Math.min(1, y / 4.95);

/**
 * Goshinboku: a sacred tree girded with shimenawa and paper streamers.
 * Visitors' goen-musubi cords are tied around its trunk (see ShrineScene.setCords).
 */
export function sacredTree(ctx: LayoutCtx): THREE.Group {
  const g = new THREE.Group();
  g.name = 'goshinboku';
  g.add(ctx.nat.forest('camphor', [[0, 0, 0.55]], [0.55, 0.55], () => 0));
  const y = 2.5;
  const rope = new THREE.Mesh(new THREE.TorusGeometry(SACRED_TRUNK(y) + 0.06, 0.09, 8, 28), ctx.m.rope);
  rope.rotation.x = Math.PI / 2;
  rope.position.y = y;
  g.add(rope);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const r = SACRED_TRUNK(y) + 0.12;
    const shide = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.42), ctx.m.paper);
    shide.position.set(Math.cos(a) * r, y - 0.28, Math.sin(a) * r);
    shide.rotation.y = -a + Math.PI / 2;
    g.add(shide);
  }
  return g;
}

/**
 * Offering box at the front of a hall. Shrines also get the suzu bell and its rope
 * (the scene shakes the object named 'suzuRope' when you pray). Temples get a big lantern instead.
 */
export function offering(ctx: LayoutCtx, x: number, z: number, floorY: number, kind: 'shrine' | 'temple', lanternText?: string, rotY = 0) {
  const g = new THREE.Group();
  const box = ctx.builder.buildSaisenBox();
  box.scale.setScalar(kind === 'temple' ? 1.15 : 0.95);
  g.add(box);
  if (kind === 'shrine') {
    const bell = ctx.builder.buildSuzuBell();
    bell.position.set(0, 4.3, -0.6);
    g.add(bell);
  } else if (lanternText) {
    g.add(ctx.arch.chochin(lanternText, '#c8261b', 3.2, 0, 5.4, -1.6));
  }
  ctx.add(g, x, z, rotY, floorY);
  return g;
}

/** Pairs of stone lanterns along an approach */
export function lanternRow(ctx: LayoutCtx, z0: number, z1: number, xOff: number, step: number, h = 2.6, xc = 0) {
  for (let z = z0; z > z1; z -= step) {
    [-xOff, xOff].forEach((x) => ctx.add(ctx.arch.stoneLantern(h), xc + x, z));
  }
}

/** Ring of trees around the site, keeping a clear corridor */
export function ringPoints(n: number, r0: number, r1: number, cx = 0, cz = 0, seed = 7): [number, number][] {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rnd() * 0.3;
    const r = r0 + rnd() * (r1 - r0);
    return [cx + Math.cos(a) * r, cz + Math.sin(a) * r] as [number, number];
  });
}
