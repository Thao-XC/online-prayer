import React, { useId } from 'react';
import type { OmamoriDesign, OmamoriPattern, Mascot } from '../data/omamoriData';

/** Darken / lighten a #rrggbb colour */
const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
};
const isDark = (hex: string) => lum(hex) < 110;

const PatternDef: React.FC<{ id: string; kind: OmamoriPattern; color: string }> = ({ id, kind, color }) => {
  switch (kind) {
    case 'stripes':
      return (
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3" height="8" fill={color} opacity="0.35" />
        </pattern>
      );
    case 'dots':
      return (
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="2.5" cy="2.5" r="1.3" fill={color} opacity="0.55" />
          <circle cx="7.5" cy="7.5" r="1.3" fill={color} opacity="0.55" />
        </pattern>
      );
    case 'asanoha':
      return (
        <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 0L12 12M12 0L0 12M6 0V12M0 6H12" stroke={color} strokeWidth="0.7" opacity="0.4" />
        </pattern>
      );
    case 'seigaiha':
      return (
        <pattern id={id} width="14" height="7" patternUnits="userSpaceOnUse">
          {[6.5, 4.5, 2.5].map((r) => (
            <g key={r} fill="none" stroke={color} strokeWidth="0.8" opacity="0.5">
              <circle cx="7" cy="7" r={r} />
              <circle cx="0" cy="3.5" r={r} />
              <circle cx="14" cy="3.5" r={r} />
            </g>
          ))}
        </pattern>
      );
    case 'ichimatsu':
      return (
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill={color} opacity="0.3" />
          <rect x="5" y="5" width="5" height="5" fill={color} opacity="0.3" />
        </pattern>
      );
    case 'kikko':
      return (
        <pattern id={id} width="12" height="10.4" patternUnits="userSpaceOnUse">
          <path d="M3 0H9L12 5.2L9 10.4H3L0 5.2Z" fill="none" stroke={color} strokeWidth="0.7" opacity="0.45" />
        </pattern>
      );
    case 'sakura':
      return (
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={7 + 1.9 * Math.sin((a * Math.PI) / 180)} cy={7 - 1.9 * Math.cos((a * Math.PI) / 180)} r="1.3" fill={color} opacity="0.75" />
          ))}
          <circle cx="7" cy="7" r="0.7" fill="#f5c64a" />
        </pattern>
      );
    default:
      return null;
  }
};

/** Body silhouettes. Each is a list of SVG elements drawn in the same fill. */
const bodyFor = (d: OmamoriDesign) => {
  switch (d.shape) {
    case 'round':
      return [<path key="b" d="M15 28Q30 21 45 28Q57 46 51 66Q45 82 30 82Q15 82 9 66Q3 46 15 28Z" />];
    case 'heart':
      return [<path key="b" d="M30 80C7 63 4 42 13 31C21 22 30 26 30 35C30 26 39 22 47 31C56 42 53 63 30 80Z" />];
    case 'gourd':
      return [<circle key="t" cx="30" cy="30" r="11" />, <circle key="b" cx="30" cy="61" r="20" />];
    case 'ema':
      return [<path key="b" d="M9 32L30 15L51 32V78Q51 82 47 82H13Q9 82 9 78Z" />];
    case 'paddle':
      return [<rect key="h" x="25.5" y="14" width="9" height="32" rx="4" />, <ellipse key="b" cx="30" cy="60" rx="18" ry="22" />];
    case 'mascot':
      return [<ellipse key="b" cx="30" cy="56" rx="21" ry="24" />];
    default:
      return [<path key="b" d="M10 18Q30 8 50 18V76Q50 82 44 82H16Q10 82 10 76Z" />];
  }
};

/* ---------------------------------------------------------------- */
/* Mascots: little faces and ears                                     */
/* ---------------------------------------------------------------- */
const Eyes: React.FC<{ dark: boolean; sleepy?: boolean; y?: number }> = ({ dark, sleepy, y = 53 }) =>
  sleepy ? (
    <g stroke="#2c241c" strokeWidth="1.3" fill="none" strokeLinecap="round">
      <path d={`M20 ${y}Q23 ${y + 2.5} 26 ${y}`} />
      <path d={`M34 ${y}Q37 ${y + 2.5} 40 ${y}`} />
    </g>
  ) : (
    <g>
      {dark && <circle cx="23" cy={y} r="3" fill="#fff" />}
      {dark && <circle cx="37" cy={y} r="3" fill="#fff" />}
      <circle cx="23" cy={y} r="1.9" fill="#2c241c" />
      <circle cx="37" cy={y} r="1.9" fill="#2c241c" />
      <circle cx="23.7" cy={y - 0.7} r="0.6" fill="#fff" />
      <circle cx="37.7" cy={y - 0.7} r="0.6" fill="#fff" />
    </g>
  );
const Blush = () => (
  <g fill="#f28fb0" opacity="0.65">
    <ellipse cx="18.5" cy="59" rx="3.2" ry="1.9" />
    <ellipse cx="41.5" cy="59" rx="3.2" ry="1.9" />
  </g>
);
const Mouth = ({ y = 59 }: { y?: number }) => (
  <path d={`M27.5 ${y}Q28.8 ${y + 1.6} 30 ${y}Q31.2 ${y + 1.6} 32.5 ${y}`} stroke="#2c241c" strokeWidth="1" fill="none" strokeLinecap="round" />
);

const mascotParts = ({ m, base, accent, line }: { m: Mascot; base: string; accent: string; line: string }): { back: React.ReactNode; front: React.ReactNode } | null => {
  const dark = isDark(base);
  const ear = (pts: string, inner: string) => (
    <>
      <path d={pts} fill={base} stroke={line} strokeWidth="1.2" strokeLinejoin="round" />
      <path d={inner} fill={accent} opacity="0.85" />
    </>
  );
  const pointyEars = ear('M12 42L14 22L27 34Z', 'M15 37L16 27L23 34Z');
  const pointyEarsR = ear('M48 42L46 22L33 34Z', 'M45 37L44 27L37 34Z');
  switch (m) {
    case 'fox':
      return {
        back: <>{pointyEars}{pointyEarsR}</>,
        front: (
          <>
            <path d="M24 44Q30 40 36 44" stroke={accent} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            <path d="M15 52L20 55M45 52L40 55" stroke={accent} strokeWidth="1.4" strokeLinecap="round" />
            <Eyes dark={dark} /><Blush /><Mouth />
          </>
        ),
      };
    case 'cat':
    case 'sleepycat':
      return {
        back: (
          <>
            {ear('M14 40L16 26L26 34Z', 'M16.5 36L17.5 29L23 34Z')}
            {ear('M46 40L44 26L34 34Z', 'M43.5 36L42.5 29L37 34Z')}
          </>
        ),
        front: (
          <>
            <Eyes dark={dark} sleepy={m === 'sleepycat'} /><Blush /><Mouth />
            <path d="M12 56H19M12 59.5L19 58.5M48 56H41M48 59.5L41 58.5" stroke="#8a7762" strokeWidth="0.6" />
            {m === 'cat' ? (
              <>
                <ellipse cx="47" cy="40" rx="4.5" ry="5.5" fill={base} stroke={line} strokeWidth="1.1" />
                <path d="M15 66Q30 72 45 66" stroke={accent} strokeWidth="2.5" fill="none" />
              </>
            ) : (
              <text x="44" y="38" fontSize="7" fill="#8a7762" fontFamily="sans-serif">z</text>
            )}
          </>
        ),
      };
    case 'shisa':
      return {
        back: (
          <g fill={accent}>
            {[[12, 44], [14, 36], [20, 30], [27, 27], [33, 27], [40, 30], [46, 36], [48, 44]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="5.5" />
            ))}
          </g>
        ),
        front: (
          <>
            <Eyes dark={dark} y={51} /><Blush />
            <path d="M24 59Q30 66 36 59Z" fill="#7a2a1d" />
            <path d="M25.5 59.5L27 61.5L28.5 59.8M31.5 59.8L33 61.5L34.5 59.5" fill="#fff" />
          </>
        ),
      };
    case 'deer':
      return {
        back: (
          <>
            <path d="M22 34L18 24M18 24L14 22M18 24L17 18M38 34L42 24M42 24L46 22M42 24L43 18" stroke="#8a5a2a" strokeWidth="2" strokeLinecap="round" fill="none" />
            <ellipse cx="11" cy="44" rx="6" ry="3" fill={base} stroke={line} strokeWidth="1.1" transform="rotate(-20 11 44)" />
            <ellipse cx="49" cy="44" rx="6" ry="3" fill={base} stroke={line} strokeWidth="1.1" transform="rotate(20 49 44)" />
          </>
        ),
        front: (
          <>
            <g fill={accent} opacity="0.9">
              <circle cx="20" cy="70" r="1.6" /><circle cx="27" cy="74" r="1.4" /><circle cx="36" cy="72" r="1.6" /><circle cx="42" cy="67" r="1.3" />
            </g>
            <Eyes dark={dark} /><Blush /><ellipse cx="30" cy="58" rx="1.8" ry="1.3" fill="#2c241c" />
          </>
        ),
      };
    case 'monkey':
      return {
        back: (
          <>
            <circle cx="9.5" cy="52" r="5.5" fill={base} stroke={line} strokeWidth="1.1" />
            <circle cx="50.5" cy="52" r="5.5" fill={base} stroke={line} strokeWidth="1.1" />
          </>
        ),
        front: (
          <>
            <path d="M30 46Q20 42 17 50Q15 62 30 64Q45 62 43 50Q40 42 30 46Z" fill={accent} />
            <Eyes dark={false} /><Blush /><Mouth y={58.5} />
          </>
        ),
      };
    case 'rabbit':
      return {
        back: (
          <>
            <ellipse cx="22" cy="24" rx="5" ry="14" fill={base} stroke={line} strokeWidth="1.2" transform="rotate(-10 22 24)" />
            <ellipse cx="22" cy="25" rx="2.4" ry="10" fill={accent} transform="rotate(-10 22 25)" />
            <ellipse cx="38" cy="24" rx="5" ry="14" fill={base} stroke={line} strokeWidth="1.2" transform="rotate(10 38 24)" />
            <ellipse cx="38" cy="25" rx="2.4" ry="10" fill={accent} transform="rotate(10 38 25)" />
          </>
        ),
        front: <><Eyes dark={dark} /><Blush /><Mouth /></>,
      };
    case 'squirrel':
      return {
        back: (
          <>
            <path d="M44 74Q62 66 56 44Q52 30 42 36Q52 44 46 58Z" fill={shade(base, -0.15)} stroke={line} strokeWidth="1.1" />
            {ear('M15 40L16 26L25 34Z', 'M17 36L17.5 29.5L22 34Z')}
            {ear('M45 40L44 26L35 34Z', 'M43 36L42.5 29.5L38 34Z')}
          </>
        ),
        front: (
          <>
            <ellipse cx="30" cy="68" rx="11" ry="9" fill={accent} />
            <Eyes dark={dark} /><Blush /><Mouth />
          </>
        ),
      };
    case 'dog':
      return {
        back: null,
        front: (
          <>
            <ellipse cx="12" cy="48" rx="5" ry="10" fill={shade(base, -0.2)} transform="rotate(15 12 48)" />
            <ellipse cx="48" cy="48" rx="5" ry="10" fill={shade(base, -0.2)} transform="rotate(-15 48 48)" />
            <Eyes dark={dark} /><Blush />
            <ellipse cx="30" cy="57.5" rx="2" ry="1.4" fill="#2c241c" />
            <rect x="23" y="66" width="14" height="10" rx="2" fill={accent} />
            <text x="30" y="73.5" fontSize="6" textAnchor="middle" fill="#fff" fontFamily="serif">金</text>
          </>
        ),
      };
    case 'ox':
      return {
        back: (
          <>
            <path d="M17 36Q10 30 13 24M43 36Q50 30 47 24" stroke="#f3ead7" strokeWidth="3.4" strokeLinecap="round" fill="none" />
            <ellipse cx="10" cy="45" rx="5.5" ry="3" fill={base} stroke={line} strokeWidth="1.1" />
            <ellipse cx="50" cy="45" rx="5.5" ry="3" fill={base} stroke={line} strokeWidth="1.1" />
          </>
        ),
        front: (
          <>
            <Eyes dark={dark} y={50} />
            <ellipse cx="30" cy="62" rx="10" ry="6.5" fill={accent} />
            <circle cx="26.5" cy="62" r="1.2" fill="#6b5a4a" /><circle cx="33.5" cy="62" r="1.2" fill="#6b5a4a" />
          </>
        ),
      };
    case 'chick':
      return {
        back: (
          <g fill={accent}>
            <circle cx="25" cy="33" r="3.5" /><circle cx="30" cy="31" r="4" /><circle cx="35" cy="33" r="3.5" />
          </g>
        ),
        front: (
          <>
            <Eyes dark={dark} /><Blush />
            <path d="M27 57L33 57L30 61.5Z" fill="#f5a623" />
            <path d="M29 61.5Q30 66 31 61.5" fill={accent} />
            <path d="M11 60Q6 66 13 70M49 60Q54 66 47 70" stroke={shade(base, -0.2)} strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        ),
      };
    case 'bird':
      return {
        back: null,
        front: (
          <>
            <path d="M9.5 52Q12 32 30 32Q48 32 50.5 52Q40 44 30 44Q20 44 9.5 52Z" fill={accent} />
            <Eyes dark={false} y={53} />
            <ellipse cx="17" cy="60" rx="4" ry="2.5" fill="#f28fb0" />
            <ellipse cx="43" cy="60" rx="4" ry="2.5" fill="#f28fb0" />
            <path d="M28 57.5L32 57.5L30 60.5Z" fill="#2c241c" />
          </>
        ),
      };
    case 'crow':
      return {
        back: null,
        front: (
          <>
            <Eyes dark y={52} />
            <path d="M26.5 57L33.5 57L30 63Z" fill="#6b6b78" />
            <path d="M23 79V85M30 80V86M37 79V85" stroke={accent} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M11 58Q5 64 11 72M49 58Q55 64 49 72" stroke="#4a4a56" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ),
      };
  }
};

interface ArtProps {
  design: OmamoriDesign;
  /** width in px; height follows */
  size?: number;
  className?: string;
  title?: string;
}

/**
 * A cute, hand-drawn-looking omamori in SVG. Each design picks a silhouette, a woven pattern,
 * colours, an emblem or a little mascot face, and sometimes a bell.
 */
export const OmamoriArt: React.FC<ArtProps> = ({ design: d, size = 60, className = '', title }) => {
  const uid = useId().replace(/:/g, '');
  const pid = `p${uid}`, cid = `c${uid}`, gid = `g${uid}`;
  const line = shade(d.base, -0.35);
  const body = bodyFor(d);
  const mascot = d.shape === 'mascot' && d.mascot ? mascotParts({ m: d.mascot, base: d.base, accent: d.accent, line }) : null;
  const chars = [...d.jp];

  // where the name and emblem sit on each silhouette
  const layout = (() => {
    switch (d.shape) {
      case 'classic':
        return { label: { x: 23.5, y: 22, w: 13, h: 40, vertical: true }, motif: { x: 30, y: 72, r: 6.5 } };
      case 'ema':
        return { label: { x: 23.5, y: 33, w: 13, h: 31, vertical: true }, motif: { x: 30, y: 73, r: 5.5 }, hole: true };
      case 'gourd':
        return { label: { x: 23.5, y: 46, w: 13, h: 30, vertical: true }, motif: { x: 30, y: 30, r: 7 } };
      case 'round':
        return { label: { x: 14, y: 66, w: 32, h: 9, vertical: false }, motif: { x: 30, y: 49, r: 11 } };
      case 'heart':
        return { label: { x: 16, y: 58, w: 28, h: 8, vertical: false }, motif: { x: 30, y: 44, r: 9.5 } };
      case 'paddle':
        return { label: { x: 16, y: 66, w: 28, h: 8, vertical: false }, motif: { x: 30, y: 52, r: 9.5 } };
      default:
        return null;
    }
  })();

  const H = 92;
  return (
    <svg
      viewBox={`0 0 60 ${H}`}
      width={size}
      height={(size * H) / 60}
      className={`shrink-0 overflow-visible ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <PatternDef id={pid} kind={d.pattern} color={d.accent} />
        <clipPath id={cid}>{body}</clipPath>
        <radialGradient id={gid} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {/* cord loop and knot */}
      <path d="M24.5 17Q30 -1 35.5 17" stroke={d.cord} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {d.bell && (
        <g>
          <path d="M30 80V86" stroke={d.cord} strokeWidth="1.4" />
          <circle cx="30" cy="88" r="3.6" fill="#e9b923" stroke="#a37c00" strokeWidth="0.8" />
          <path d="M28 89H32" stroke="#7a5a00" strokeWidth="0.8" />
        </g>
      )}

      {mascot?.back}

      {/* outline, then fill, so overlapping parts merge into one silhouette */}
      <g fill={line} stroke={line} strokeWidth="3" strokeLinejoin="round">{body}</g>
      <g fill={d.base}>{body}</g>
      <g clipPath={`url(#${cid})`}>
        <rect width="60" height={H} fill={`url(#${pid})`} />
        <rect width="60" height={H} fill={`url(#${gid})`} />
      </g>

      {/* gold edge stitching */}
      {d.shape !== 'mascot' && (
        <g fill="none" stroke="#f3d27a" strokeWidth="0.8" strokeDasharray="1.6 1.4" opacity="0.9" transform="translate(30 50) scale(0.88) translate(-30 -50)">
          {body}
        </g>
      )}

      <circle cx="30" cy="16.5" r="3" fill={d.cord} stroke={shade(d.cord, -0.3)} strokeWidth="0.6" />

      {layout?.hole && <circle cx="30" cy="26" r="1.8" fill={line} />}

      {/* name panel */}
      {layout && (
        layout.label.vertical ? (
          <g>
            <rect x={layout.label.x} y={layout.label.y} width={layout.label.w} height={layout.label.h} rx="2" fill="#fffaf0" opacity="0.92" stroke={shade(d.accent, -0.1)} strokeWidth="0.6" />
            {chars.map((ch, i) => {
              const fs = Math.min(9, (layout.label.h - 3) / chars.length);
              return (
                <text
                  key={i}
                  x="30"
                  y={layout.label.y + 2 + fs * (i + 0.85)}
                  fontSize={fs}
                  textAnchor="middle"
                  fill={lum(d.base) > 215 ? shade(d.accent, -0.35) : shade(d.base, -0.5)}
                  fontFamily="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
                  fontWeight="700"
                >
                  {ch}
                </text>
              );
            })}
          </g>
        ) : (
          (() => {
            const fs = Math.min(7, (layout.label.w + 2) / chars.length);
            const w = Math.min(layout.label.w + 6, chars.length * fs + 6);
            const cy = layout.label.y + layout.label.h / 2;
            return (
              <g>
                <rect x={30 - w / 2} y={cy - fs / 2 - 2} width={w} height={fs + 4} rx="2" fill="#fffaf0" opacity="0.93" stroke={shade(d.accent, -0.1)} strokeWidth="0.6" />
                <text
                  x="30"
                  y={cy + fs * 0.36}
                  fontSize={fs}
                  textAnchor="middle"
                  fill={lum(d.base) > 215 ? shade(d.accent, -0.35) : shade(d.base, -0.5)}
                  fontFamily="'Noto Serif JP', 'Hiragino Mincho ProN', serif"
                  fontWeight="700"
                >
                  {d.jp}
                </text>
              </g>
            );
          })()
        )
      )}

      {/* emblem */}
      {layout && d.motif && (
        <g>
          <circle cx={layout.motif.x} cy={layout.motif.y} r={layout.motif.r} fill="#fffaf0" opacity="0.88" stroke={d.accent} strokeWidth="0.8" />
          <text x={layout.motif.x} y={layout.motif.y + layout.motif.r * 0.38} fontSize={layout.motif.r * 1.15} textAnchor="middle">
            {d.motif}
          </text>
        </g>
      )}

      {mascot?.front}
    </svg>
  );
};
