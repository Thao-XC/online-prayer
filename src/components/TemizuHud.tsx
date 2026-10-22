import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { TemizuState } from '../three/temizu/TemizuRitual';
import { useBackLayer } from '../services/backStack';

/**
 * The instructions and hold control for temizu, laid over the 3D view
 * (the hands, ladle and water are in the scene itself).
 * Phone: a compact card at the bottom. PC: a panel on the right.
 */
export const TemizuHud: React.FC<{
  state: TemizuState | null;
  onHold: (on: boolean) => void;
  onLeave: () => void;
  river?: boolean;
}> = ({ state, onHold, onLeave, river }) => {
  useBackLayer(true, onLeave);

  // hold Space (or Enter) on PC
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) {
        e.preventDefault();
        onHold(true);
      }
    };
    const up = (e: KeyboardEvent) => (e.code === 'Space' || e.code === 'Enter') && onHold(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      onHold(false);
    };
  }, [onHold]);

  if (!state) return null;
  const st = state.steps[Math.min(state.step, state.steps.length - 1)];
  const ring = 2 * Math.PI * 22;
  const hold = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      onHold(true);
    },
    onPointerUp: () => onHold(false),
    onPointerCancel: () => onHold(false),
    onLostPointerCapture: () => onHold(false),
  };

  return (
    <>
      {/* holding anywhere on the view also works */}
      {!state.done && <div className="fixed inset-0 z-20 touch-none" {...hold} aria-hidden />}
      <div
        className="fixed z-30 left-3 right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] md:left-auto md:right-5 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:w-[340px] rounded-2xl bg-[#fbf7ef]/95 backdrop-blur-md border border-[#e0d2bb] shadow-[0_10px_40px_rgba(44,36,28,0.35)] p-4 md:p-5"
        role="region"
        aria-label="Temizu purification"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-kanji tracking-widest text-[#b45309]">{river ? '御手洗場 · 五十鈴川' : '手水の作法'}</span>
          <button onClick={onLeave} className="text-xs font-semibold text-[#6d5b49] hover:text-[#2c241c] px-2 py-1 rounded-lg hover:bg-[#efe5d3] cursor-pointer">
            Leave <kbd className="hidden pointer-fine:inline ml-1 px-1 rounded border border-[#d8cabb] text-[10px] font-sans">Esc</kbd>
          </button>
        </div>
        <div className="mt-2 flex gap-1" aria-hidden>
          {state.steps.map((s, i) => (
            <span key={s.id} className={`h-1.5 flex-1 rounded-full transition-colors ${i < state.step || state.done ? 'bg-[#0e7490]' : i === state.step ? 'bg-[#e0a526]' : 'bg-[#ece2cf]'}`} />
          ))}
        </div>

        {!state.done ? (
          <>
            <div className="mt-3">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xs text-[#6d5b49] tabular-nums">
                  Step {state.step + 1} of {state.steps.length}
                </span>
                <span className="text-xs font-kanji text-[#b45309]">{st.jp}</span>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-[#2c241c] leading-snug">{st.title}</h3>
              <p className="mt-1 text-[13px] md:text-sm text-[#3d3124] leading-relaxed">{st.how}</p>
            </div>
            <button
              {...hold}
              disabled={!state.ready}
              className="relative z-10 mt-3 w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-left font-semibold touch-none select-none cursor-pointer disabled:opacity-60 bg-gradient-to-r from-[#a3170f] to-[#c2410c] text-[#fff7e6] active:from-[#0e7490] active:to-[#0e7490]"
            >
              <svg width="48" height="48" viewBox="0 0 52 52" className="shrink-0" aria-hidden>
                <circle cx="26" cy="26" r="22" fill="none" stroke="#ffffff33" strokeWidth="5" />
                <circle cx="26" cy="26" r="22" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - state.progress)} transform="rotate(-90 26 26)" />
                <text x="26" y="31" textAnchor="middle" fontSize="15" fill="#fff">
                  💧
                </text>
              </svg>
              <span>
                <span className="block">{state.ready ? st.verb : 'Getting ready…'}</span>
                <span className="block text-xs font-normal opacity-85">
                  Press and hold here or on the view<span className="pointer-coarse:hidden"> · or hold Space</span>
                </span>
              </span>
            </button>
          </>
        ) : (
          <div className="mt-3 text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e6f3ea] border border-[#9ccbb0] text-[#15803d]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-cinzel font-semibold text-[#15803d]">Mind and body are clean</h3>
            <p className="text-[13px] text-[#3d3124] leading-relaxed">
              {river
                ? 'The Isuzu has purified pilgrims for two thousand years. Now you may walk on to the sanctuary.'
                : 'One scoop, the proper order, and a clean ladle left for the next person. Now you may approach the kami.'}
            </p>
            <button onClick={onLeave} className="w-full py-3 rounded-xl bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] text-sm font-semibold cursor-pointer">
              Walk on
            </button>
          </div>
        )}
      </div>
    </>
  );
};
