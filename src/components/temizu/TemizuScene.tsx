import React, { useEffect, useRef, useState } from 'react';

/**
 * First-person temizu (手水): you look down into the stone basin and do the purification
 * with your own two hands, one step at a time, following the real order:
 *   1 scoop with the right hand → 2 pour over the left hand → 3 switch, pour over the right hand →
 *   4 switch back, pour into the cupped left palm → 5 rinse the mouth from the palm →
 *   6 rinse the left hand again → 7 tilt the ladle upright to wash the handle, put it back.
 * One scoop of water lasts the whole ritual, just like at a real shrine.
 *
 * Each step: the hands move into place, then the visitor presses and holds to do the action.
 */

type Hand = { x: number; y: number; r: number; cup: number };
export interface Pose {
  /** ladle cup position (viewBox units) and tilt in degrees (0 = upright, negative tips the mouth left) */
  lx: number;
  ly: number;
  lr: number;
  /** direction of the handle from the cup to the hand, in degrees (40 = toward lower right) */
  ha: number;
  /** which hand holds the ladle */
  holder: 'R' | 'L' | 'none';
  L: Hand;
  R: Hand;
  /** water in the ladle 0..1 */
  fill: number;
  /** the palm rises to the mouth (screen dims a little) */
  mouth: number;
}

export interface TemizuStep {
  id: string;
  jp: string;
  title: string;
  how: string;
  /** what the hold button says */
  verb: string;
  /** pose the hands move to before you act */
  ready: Pose;
  /** pose at the end of the action */
  done: Pose;
  /** water pours while holding */
  pour?: boolean;
  /** where poured water lands */
  target?: 'L' | 'R' | 'palm' | 'handle' | 'basin';
  /** seconds of holding needed */
  hold: number;
}

/* ------------------------------------------------------------------ */
/* poses                                                               */
/* ------------------------------------------------------------------ */
const restL: Hand = { x: 108, y: 452, r: 18, cup: 0 };
const restR: Hand = { x: 292, y: 452, r: -18, cup: 0 };
const base: Pose = { lx: 300, ly: 146, lr: 0, ha: 0, holder: 'none', L: restL, R: restR, fill: 0, mouth: 0 };
const P = (o: Omit<Partial<Pose>, 'L' | 'R'> & { L?: Partial<Hand>; R?: Partial<Hand> }, from: Pose): Pose => ({
  ...from,
  ...o,
  L: { ...from.L, ...(o.L ?? {}) },
  R: { ...from.R, ...(o.R ?? {}) },
});

// 1. take the ladle in the right hand and scoop from the basin
const s1r = P({ lx: 250, ly: 200, lr: 0, ha: 40, holder: 'R' }, base);
const s1d = P({ lx: 236, ly: 232, fill: 1 }, s1r);
// 2. pour over the left hand
const s2r = P({ lx: 176, ly: 282, lr: 0, ha: 40, L: { x: 150, y: 372, r: 6 } }, s1d);
const s2d = P({ lr: -76, fill: 0.72, L: { x: 150, y: 372, r: -4 } }, s2r);
// 3. switch the ladle to the left hand, pour over the right hand
const s3r = P({ lx: 226, ly: 282, lr: 0, ha: 140, holder: 'L', R: { x: 250, y: 374, r: -6 } }, s2d);
const s3d = P({ lr: 76, fill: 0.46, R: { x: 250, y: 374, r: 4 } }, s3r);
// 4. switch back to the right hand, pour into the cupped left palm
const s4r = P({ lx: 180, ly: 288, lr: 0, ha: 40, holder: 'R', L: { x: 152, y: 382, r: 0, cup: 1 }, R: restR }, s3d);
const s4d = P({ lr: -60, fill: 0.3 }, s4r);
// 5. rinse the mouth from the palm (the ladle waits, low in the right hand)
const s5r = P({ lx: 296, ly: 330, lr: 0, ha: 70 }, s4d);
const s5d = P({ mouth: 1, L: { x: 200, y: 540, r: 0, cup: 1 } }, s5r);
// 6. rinse the left hand again
const s6r = P({ lx: 176, ly: 282, lr: 0, ha: 40, mouth: 0, L: { x: 150, y: 372, r: 6, cup: 0 } }, s5d);
const s6d = P({ lr: -76, fill: 0.14, L: { x: 150, y: 372, r: -4 } }, s6r);
// 7. stand the ladle upright so the last water runs down the handle, then put it back
const s7r = P({ lx: 292, ly: 270, lr: 0, ha: 60, L: restL }, s6d);
const s7d = P({ lx: 300, ly: 228, ha: 90, fill: 0 }, s7r);

export const TEMIZU_STEPS: TemizuStep[] = [
  { id: 'scoop', jp: '柄杓を取る', title: 'Scoop the water', how: 'Take the ladle (hishaku) in your right hand and scoop up fresh water. One scoop lasts the whole ritual, so take it gently.', verb: 'Hold to scoop', ready: s1r, done: s1d, target: 'basin', hold: 1.2 },
  { id: 'left', jp: '左手を清める', title: 'Rinse your left hand', how: 'Pour a little water over your left hand. Not too much: you will need the rest.', verb: 'Hold to pour', ready: s2r, done: s2d, pour: true, target: 'L', hold: 1.4 },
  { id: 'right', jp: '右手を清める', title: 'Rinse your right hand', how: 'Move the ladle to your left hand, then pour over your right hand.', verb: 'Hold to pour', ready: s3r, done: s3d, pour: true, target: 'R', hold: 1.4 },
  { id: 'palm', jp: '左手に水を受ける', title: 'Water in your left palm', how: 'Back to your right hand. Cup your left palm and pour a little water into it. Never drink straight from the ladle.', verb: 'Hold to pour', ready: s4r, done: s4d, pour: true, target: 'palm', hold: 1.2 },
  { id: 'mouth', jp: '口をすすぐ', title: 'Rinse your mouth', how: 'Bring your palm to your lips and rinse your mouth quietly. Cover it with your hand and let the water fall to the ground, not back into the basin.', verb: 'Hold to rinse', ready: s5r, done: s5d, hold: 1.6 },
  { id: 'left2', jp: 'もう一度左手を', title: 'Rinse your left hand again', how: 'Your lips touched that hand, so rinse it once more.', verb: 'Hold to pour', ready: s6r, done: s6d, pour: true, target: 'L', hold: 1.2 },
  { id: 'handle', jp: '柄杓を清める', title: 'Wash the handle', how: 'Tilt the ladle upright so the last of the water runs down the handle and cleans it for the next person. Then put it back, face down.', verb: 'Hold to tilt', ready: s7r, done: s7d, pour: true, target: 'handle', hold: 1.6 },
];

/* ------------------------------------------------------------------ */
/* drawing                                                             */
/* ------------------------------------------------------------------ */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const mixHand = (a: Hand, b: Hand, t: number): Hand => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), r: lerp(a.r, b.r, t), cup: lerp(a.cup, b.cup, t) });
export const mixPose = (a: Pose, b: Pose, t: number): Pose => ({
  lx: lerp(a.lx, b.lx, t),
  ly: lerp(a.ly, b.ly, t),
  lr: lerp(a.lr, b.lr, t),
  ha: lerp(a.ha, b.ha, t),
  holder: t < 0.5 ? a.holder : b.holder,
  L: mixHand(a.L, b.L, t),
  R: mixHand(a.R, b.R, t),
  fill: lerp(a.fill, b.fill, t),
  mouth: lerp(a.mouth, b.mouth, t),
});

const SKIN = '#f1cfae';
const SKIN_D = '#d9a985';
const SLEEVE = '#f4efe4';
const SLEEVE_D = '#d8cfbd';

/** One hand from the first-person view, with its forearm reaching in from the bottom edge */
const HandArt: React.FC<{ h: Hand; side: 'L' | 'R'; grip: boolean; wet: number }> = ({ h, side, grip, wet }) => {
  const s = side === 'L' ? 1 : -1;
  const baseX = side === 'L' ? 70 : 330;
  // forearm from off-screen to the wrist
  const wx = h.x - s * 6, wy = h.y + 34;
  return (
    <g>
      <path d={`M${baseX - 46} 560 L${wx - 22} ${wy} L${wx + 22} ${wy} L${baseX + 46} 560 Z`} fill={SKIN} stroke={SKIN_D} strokeWidth="1.5" />
      {/* sleeve */}
      <path d={`M${baseX - 62} 560 L${lerp(baseX - 62, wx - 30, 0.55)} ${lerp(560, wy, 0.55)} L${lerp(baseX + 62, wx + 30, 0.55)} ${lerp(560, wy, 0.55)} L${baseX + 62} 560 Z`} fill={SLEEVE} stroke={SLEEVE_D} strokeWidth="1.5" />
      <path d={`M${lerp(baseX - 62, wx - 30, 0.55)} ${lerp(560, wy, 0.55)} L${lerp(baseX + 62, wx + 30, 0.55)} ${lerp(560, wy, 0.55)}`} stroke="#b91c1c" strokeWidth="3" />
      <g transform={`translate(${h.x} ${h.y}) rotate(${h.r}) scale(${s} 1)`}>
        {grip ? (
          // a fist closed around the ladle handle
          <g>
            <rect x="-26" y="-20" width="52" height="46" rx="20" fill={SKIN} stroke={SKIN_D} strokeWidth="1.5" />
            {[-16, -5, 6, 17].map((x) => (
              <path key={x} d={`M${x} -20 Q${x + 3} -30 ${x + 8} -20`} fill={SKIN} stroke={SKIN_D} strokeWidth="1.3" />
            ))}
            <path d="M22 4 Q34 -2 30 -16" fill="none" stroke={SKIN_D} strokeWidth="9" strokeLinecap="round" />
            <path d="M22 4 Q34 -2 30 -16" fill="none" stroke={SKIN} strokeWidth="6.5" strokeLinecap="round" />
          </g>
        ) : (
          // open hand, palm up; cup closes the fingers
          <g>
            <path
              d={`M-26 28 Q-30 -4 -24 -22 L24 -22 Q30 -4 26 28 Z`}
              fill={SKIN}
              stroke={SKIN_D}
              strokeWidth="1.5"
              transform={`scale(${1 - h.cup * 0.12} 1)`}
            />
            {[-18, -6, 6, 18].map((x, i) => (
              <rect key={x} x={x - 5.5 + h.cup * -x * 0.12} y={-56 + h.cup * 14 + Math.abs(i - 1.5) * 4} width="11" height={40 - h.cup * 12} rx="5.5" fill={SKIN} stroke={SKIN_D} strokeWidth="1.3" />
            ))}
            <path d={`M26 18 Q${46 - h.cup * 14} 4 ${44 - h.cup * 16} -14`} fill="none" stroke={SKIN_D} strokeWidth="12" strokeLinecap="round" />
            <path d={`M26 18 Q${46 - h.cup * 14} 4 ${44 - h.cup * 16} -14`} fill="none" stroke={SKIN} strokeWidth="9.5" strokeLinecap="round" />
            <path d="M-16 6 Q0 14 16 6" stroke={SKIN_D} strokeWidth="1" fill="none" opacity="0.6" />
            {h.cup > 0.5 && <ellipse cx="0" cy="4" rx={14 * h.cup} ry={6 * h.cup} fill="#8fd3e0" opacity={0.75 * Math.min(1, wet)} />}
          </g>
        )}
        {wet > 0 && (
          <g opacity={Math.min(1, wet)}>
            <path d="M-14 -8 Q-8 -14 -2 -10" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
            <circle cx="10" cy="-30" r="2" fill="#dff6ff" />
            <circle cx="-12" cy="16" r="1.6" fill="#dff6ff" />
          </g>
        )}
      </g>
    </g>
  );
};

const HANDLE = 112;
/** The wooden ladle: the handle runs from the cup to the hand; the cup tilts on its own. */
const LadleArt: React.FC<{ x: number; y: number; ha: number; tilt: number; fill: number }> = ({ x, y, ha, tilt, fill }) => {
  const a = (ha * Math.PI) / 180;
  const gx = x + Math.cos(a) * HANDLE, gy = y + Math.sin(a) * HANDLE;
  return (
    <g>
      <path d={`M${x + Math.cos(a) * 14} ${y + 14 + Math.sin(a) * 14} L${gx} ${gy}`} stroke="#8a6a3a" strokeWidth="9" strokeLinecap="round" />
      <path d={`M${x + Math.cos(a) * 14} ${y + 14 + Math.sin(a) * 14} L${gx} ${gy}`} stroke="#c9a46a" strokeWidth="6" strokeLinecap="round" />
      <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
        <path d="M-22 0 L-20 34 Q0 42 20 34 L22 0 Z" fill="#c9a46a" stroke="#8a6a3a" strokeWidth="1.6" />
        <path d="M-21 12 Q0 18 21 12" stroke="#8a6a3a" strokeWidth="1" fill="none" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="22" ry="7" fill="#7a5a2a" stroke="#8a6a3a" strokeWidth="1.4" />
        {fill > 0.02 && <ellipse cx="0" cy={1 + (1 - fill) * 2} rx={20 * Math.min(1, 0.6 + fill * 0.4)} ry={6 * Math.min(1, 0.6 + fill * 0.4)} fill="#7cc8d8" />}
        {fill > 0.02 && <ellipse cx="-6" cy="-1" rx="6" ry="1.6" fill="#ffffff" opacity="0.6" />}
      </g>
    </g>
  );
};

type Drop = { x: number; y: number; vx: number; vy: number; life: number };

export const TemizuScene: React.FC<{
  step: number;
  /** 0..1 how far the current action is held */
  progress: number;
  /** 0..1 how far the hands have moved into the ready pose */
  approach: number;
  holding: boolean;
  wet: { L: number; R: number };
}> = ({ step, progress, approach, holding, wet }) => {
  const st = TEMIZU_STEPS[Math.min(step, TEMIZU_STEPS.length - 1)];
  const prevDone = step === 0 ? base : TEMIZU_STEPS[step - 1].done;
  const after = step >= TEMIZU_STEPS.length;
  const pose = after
    ? mixPose(TEMIZU_STEPS[TEMIZU_STEPS.length - 1].done, { ...base, holder: 'none' }, 1)
    : progress > 0
    ? mixPose(st.ready, st.done, ease(progress))
    : mixPose(prevDone, st.ready, ease(approach));

  // the lip of the ladle in screen space (where water leaves it)
  const rad = (pose.lr * Math.PI) / 180;
  const lipLocalX = pose.lr < 0 ? -22 : 22;
  const lipX = pose.lx + Math.cos(rad) * lipLocalX;
  const lipY = pose.ly + Math.sin(rad) * lipLocalX;
  const ha = (pose.ha * Math.PI) / 180;
  const handleLow = { x: pose.lx + Math.cos(ha) * HANDLE, y: pose.ly + Math.sin(ha) * HANDLE };
  const pouring = !after && !!st.pour && holding && progress > 0.08 && progress < 1 && pose.fill > 0.01;

  // water particles
  const [drops, setDrops] = useState<Drop[]>([]);
  const raf = useRef<number | null>(null);
  const last = useRef(performance.now());
  const emit = useRef({ pouring, lipX, lipY, hx: handleLow.x, hy: handleLow.y, target: st.target });
  emit.current = { pouring, lipX, lipY, hx: handleLow.x, hy: handleLow.y, target: st.target };
  useEffect(() => {
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last.current) / 1000);
      last.current = now;
      setDrops((ds) => {
        const out: Drop[] = [];
        for (const d of ds) {
          const n = { ...d, vy: d.vy + 900 * dt, x: d.x + d.vx * dt, y: d.y + d.vy * dt, life: d.life - dt };
          if (n.life > 0 && n.y < 560) out.push(n);
        }
        const e = emit.current;
        if (e.pouring) {
          for (let i = 0; i < 4; i++) {
            const fromHandle = e.target === 'handle';
            out.push({
              x: (fromHandle ? e.hx : e.lipX) + (Math.random() - 0.5) * 6,
              y: (fromHandle ? e.hy : e.lipY) + 2,
              vx: (Math.random() - 0.5) * 30,
              vy: 40 + Math.random() * 40,
              life: 1.2,
            });
          }
        }
        return out.slice(-240);
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const [t, setT] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setT((x) => x + 1), 80);
    return () => clearInterval(id);
  }, []);

  return (
    <svg viewBox="0 0 400 520" className="w-full h-full block select-none touch-none" role="img" aria-label={`First-person view at the water basin: ${after ? 'finished' : st.title}`}>
      <defs>
        <linearGradient id="tz-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2c4a3a" />
          <stop offset="1" stopColor="#5e7a5a" />
        </linearGradient>
        <linearGradient id="tz-stone" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#9aa09a" />
          <stop offset="1" stopColor="#6e746f" />
        </linearGradient>
        <radialGradient id="tz-water" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#7ccad6" />
          <stop offset="1" stopColor="#2f7f8c" />
        </radialGradient>
        <pattern id="tz-gravel" width="14" height="10" patternUnits="userSpaceOnUse">
          <rect width="14" height="10" fill="#c9c2b2" />
          <circle cx="3" cy="3" r="2" fill="#b7af9d" />
          <circle cx="10" cy="7" r="2.2" fill="#ddd6c6" />
        </pattern>
      </defs>
      {/* the pavilion around you: dark wood posts, roof edge, greenery beyond */}
      <rect width="400" height="520" fill="url(#tz-sky)" />
      <path d="M0 0H400V34L360 46H40L0 34Z" fill="#3a2a1e" />
      <rect x="18" y="30" width="22" height="300" fill="#5a3f2a" />
      <rect x="360" y="30" width="22" height="300" fill="#5a3f2a" />
      <rect x="0" y="300" width="400" height="220" fill="url(#tz-gravel)" />
      {/* the stone basin, seen from just above */}
      <path d="M48 196 Q200 150 352 196 L340 300 Q200 330 60 300 Z" fill="url(#tz-stone)" stroke="#5c615c" strokeWidth="2" />
      <ellipse cx="200" cy="200" rx="152" ry="44" fill="#a7ada6" stroke="#5c615c" strokeWidth="2" />
      <ellipse cx="200" cy="204" rx="134" ry="34" fill="url(#tz-water)" />
      {/* ripples */}
      {[0, 1, 2].map((i) => {
        const k = ((t / 20 + i / 3) % 1);
        return <ellipse key={i} cx="120" cy="206" rx={10 + k * 60} ry={3 + k * 14} fill="none" stroke="#e6fbff" strokeWidth="1.2" opacity={0.6 * (1 - k)} />;
      })}
      {/* kanji carved on the basin */}
      <text x="200" y="290" textAnchor="middle" fontSize="20" fill="#565b56" fontFamily="'Noto Serif JP', serif" fontWeight="700" letterSpacing="10">
        洗心
      </text>
      {/* bamboo spout and its little waterfall */}
      <path d="M-10 110 L110 168" stroke="#7f9f4a" strokeWidth="14" strokeLinecap="round" />
      <path d="M-10 110 L110 168" stroke="#a5c46a" strokeWidth="5" strokeLinecap="round" opacity="0.6" />
      <path d={`M112 172 Q${116 + Math.sin(t / 3) * 1.5} 188 118 206`} stroke="#c9f1fb" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" />
      {/* the rack with the other ladles, face down */}
      <path d="M190 150 L372 150" stroke="#6b4a2a" strokeWidth="6" />
      {[232, 270].map((x) => (
        <g key={x}>
          <path d={`M${x} 150 L${x + 70} 150`} stroke="#c9a46a" strokeWidth="5" strokeLinecap="round" />
          <path d={`M${x - 20} 150 L${x - 18} 128 Q${x} 122 ${x + 18} 128 L${x + 20} 150 Z`} fill="#c9a46a" stroke="#8a6a3a" strokeWidth="1.4" />
        </g>
      ))}
      {/* scoop splash */}
      {!after && st.id === 'scoop' && progress > 0.3 && progress < 0.9 && <ellipse cx={pose.lx} cy={pose.ly + 10} rx="34" ry="9" fill="none" stroke="#e6fbff" strokeWidth="2" opacity="0.8" />}

      {/* hands and ladle (the hand holding the ladle is drawn after it, so it wraps the handle) */}
      {(() => {
        const ladle = (
          <LadleArt key="ladle" x={pose.lx} y={pose.ly} ha={pose.ha} tilt={pose.lr} fill={pose.fill} />
        );
        const grip = { x: handleLow.x, y: handleLow.y + 4, r: pose.holder === 'L' ? 20 : -20, cup: 0 };
        const L = <HandArt key="L" h={pose.holder === 'L' ? grip : pose.L} side="L" grip={pose.holder === 'L'} wet={wet.L} />;
        const R = <HandArt key="R" h={pose.holder === 'R' ? grip : pose.R} side="R" grip={pose.holder === 'R'} wet={wet.R} />;
        return pose.holder === 'L' ? [R, ladle, L] : pose.holder === 'R' ? [L, ladle, R] : [ladle, L, R];
      })()}

      {/* falling water */}
      {pouring && st.target !== 'handle' && <path d={`M${lipX} ${lipY} Q${lipX - 4} ${lipY + 40} ${lipX - 2} ${lipY + 90}`} stroke="#bfefff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />}
      {drops.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={2.4} fill="#cdf3ff" opacity={Math.min(1, d.life * 1.4)} />
      ))}
      {/* rinsing the mouth: the view dims and the palm covers it */}
      {pose.mouth > 0 && <rect width="400" height="520" fill="#0b1a14" opacity={pose.mouth * 0.35} />}
    </svg>
  );
};
