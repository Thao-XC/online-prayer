import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { Sheet } from './ui/Sheet';
import { soundService } from '../services/soundService';
import { TemizuScene, TEMIZU_STEPS } from './temizu/TemizuScene';

interface TemizuyaModalProps {
  onClose: () => void;
  onPurified: () => void;
}

/**
 * Temizu, the purification at the water pavilion, done in first person.
 * Each step the hands move into place; then you press and hold (or hold Space) to do it.
 */
export const TemizuyaModal: React.FC<TemizuyaModalProps> = ({ onClose, onPurified }) => {
  const [step, setStep] = useState(0);
  const [approach, setApproach] = useState(0);
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [wet, setWet] = useState({ L: 0, R: 0 });
  const done = step >= TEMIZU_STEPS.length;
  const st = TEMIZU_STEPS[Math.min(step, TEMIZU_STEPS.length - 1)];
  const held = useRef(false);
  const finishing = useRef(false);
  const lastSplash = useRef(0);

  // hands move into the ready pose at the start of each step
  useEffect(() => {
    if (done) return;
    setApproach(0);
    setProgress(0);
    finishing.current = false;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / 700);
      setApproach(k);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, done]);

  // holding advances the action
  useEffect(() => {
    if (done) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (held.current && approach >= 1 && !finishing.current) {
        setProgress((p) => {
          const np = Math.min(1, p + dt / st.hold);
          if (st.pour && now - lastSplash.current > 700) {
            lastSplash.current = now;
            soundService.playTemizuWater();
          }
          if (np >= 1 && !finishing.current) {
            finishing.current = true;
            if (st.target === 'L' || st.target === 'R') setWet((w) => ({ ...w, [st.target as 'L' | 'R']: 1 }));
            if (st.id === 'scoop') soundService.playTemizuWater();
            if (st.id === 'mouth') soundService.playZenTone(2);
            setTimeout(() => {
              held.current = false;
              setHolding(false);
              if (step + 1 >= TEMIZU_STEPS.length) {
                soundService.playFuurin();
                onPurified();
              }
              setStep((s) => s + 1);
            }, 450);
          }
          return np;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step, approach, done, st, onPurified]);

  const press = useCallback((on: boolean) => {
    held.current = on;
    setHolding(on);
  }, []);

  // Space to hold on PC
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        press(true);
      }
    };
    const up = (e: KeyboardEvent) => e.code === 'Space' && press(false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [press]);

  const restart = () => {
    setWet({ L: 0, R: 0 });
    setStep(0);
  };

  const ring = 2 * Math.PI * 22;
  return (
    <Sheet onClose={onClose} size="xl" label="Temizu purification" className="px-4 sm:px-6 pt-2 sm:pt-5">
      <div className="text-center pr-8 sm:pr-0">
        <span className="text-xs font-kanji tracking-widest text-[#b45309]">手水舎の作法</span>
        <h2 className="text-lg sm:text-2xl font-cinzel font-semibold text-[#2c241c]">Purify at the water basin</h2>
      </div>

      <div className="mt-3 grid md:grid-cols-[minmax(0,1fr)_minmax(0,320px)] gap-4 md:gap-6 items-start">
        {/* first-person view */}
        <div
          className="relative mx-auto w-full max-w-[420px] md:max-w-none aspect-[400/520] max-h-[52dvh] md:max-h-[62vh] rounded-2xl overflow-hidden border border-[#d8c8ae] bg-[#2c4a3a] shadow-inner touch-none"
          onPointerDown={(e) => {
            if (done) return;
            (e.target as Element).setPointerCapture?.(e.pointerId);
            press(true);
          }}
          onPointerUp={() => press(false)}
          onPointerCancel={() => press(false)}
          onPointerLeave={() => press(false)}
          style={{ aspectRatio: '400 / 520' }}
        >
          <TemizuScene step={step} progress={progress} approach={approach} holding={holding} wet={wet} />
          {!done && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/45 text-white text-[11px] font-semibold tabular-nums">
              Step {step + 1} of {TEMIZU_STEPS.length}
            </div>
          )}
        </div>

        {/* instructions and the hold control */}
        <div className="space-y-3 pb-1">
          <div className="flex gap-1" aria-hidden>
            {TEMIZU_STEPS.map((s, i) => (
              <span key={s.id} className={`h-1.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-[#0e7490]' : i === step ? 'bg-[#e0a526]' : 'bg-[#ece2cf]'}`} />
            ))}
          </div>
          {!done ? (
            <>
              <div>
                <span className="inline-block text-xs font-kanji text-[#b45309] px-2 py-0.5 rounded-full bg-[#fbeedd] border border-[#e0cfb2]">{st.jp}</span>
                <h3 className="mt-1.5 text-lg font-semibold text-[#2c241c]">{st.title}</h3>
                <p className="mt-1 text-sm text-[#3d3124] leading-relaxed">{st.how}</p>
              </div>
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  press(true);
                }}
                onPointerUp={() => press(false)}
                onPointerLeave={() => press(false)}
                onPointerCancel={() => press(false)}
                onKeyDown={(e) => (e.key === 'Enter' ? press(true) : undefined)}
                onKeyUp={(e) => (e.key === 'Enter' ? press(false) : undefined)}
                disabled={approach < 1}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-semibold transition-all touch-none select-none cursor-pointer disabled:opacity-60 ${
                  holding ? 'bg-[#0e7490] text-white scale-[0.99]' : 'bg-gradient-to-r from-[#a3170f] to-[#c2410c] text-[#fff7e6]'
                }`}
              >
                <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0" aria-hidden>
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#ffffff33" strokeWidth="5" />
                  <circle cx="26" cy="26" r="22" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring * (1 - progress)} transform="rotate(-90 26 26)" />
                  <text x="26" y="31" textAnchor="middle" fontSize="15" fill="#fff">
                    💧
                  </text>
                </svg>
                <span>
                  <span className="block">{approach < 1 ? '…' : st.verb}</span>
                  <span className="block text-xs font-normal opacity-85">Press and hold here or on the picture<span className="pointer-coarse:hidden"> · or hold Space</span></span>
                </span>
              </button>
            </>
          ) : (
            <div className="text-center py-3 space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#e6f3ea] border border-[#9ccbb0] text-[#15803d]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-cinzel font-semibold text-[#15803d]">Mind and body are clean</h3>
              <p className="text-xs font-kanji text-[#15803d]">心身清浄</p>
              <p className="text-sm text-[#3d3124] leading-relaxed">You used a single scoop, as is the custom, and left the ladle clean for the next person. Now you may approach the kami.</p>
              <div className="flex gap-2">
                <button onClick={restart} className="flex-1 py-3 rounded-xl border border-[#d8c8ae] text-[#2c241c] text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5">
                  <RotateCcw className="w-4 h-4" /> Again
                </button>
                <button onClick={onClose} className="flex-[2] py-3 rounded-xl bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] text-sm font-semibold cursor-pointer">
                  Go to the hall
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Sheet>
  );
};
