import React, { useState } from 'react';
import { Sheet } from './ui/Sheet';
import { OMAMORI, type OmamoriKind } from '../data/pilgrimData';
import type { ShrineData } from '../types/shrine';
import { soundService } from '../services/soundService';

/** A little brocade amulet bag, drawn in CSS */
export const OmamoriPouch: React.FC<{ kind: OmamoriKind; size?: 'sm' | 'md' | 'lg'; shrineKanji?: string }> = ({ kind, size = 'md', shrineKanji }) => {
  const o = OMAMORI[kind];
  const dims = size === 'sm' ? 'w-10 h-14' : size === 'lg' ? 'w-24 h-32' : 'w-16 h-22';
  const text = size === 'sm' ? 'text-[8px]' : size === 'lg' ? 'text-sm' : 'text-[11px]';
  return (
    <div className={`relative ${dims} shrink-0`} aria-hidden>
      {/* cord loop and knot */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-1/3 h-3 rounded-t-full border-2 border-b-0" style={{ borderColor: o.color }} />
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-2.5 h-2.5 rounded-full" style={{ background: o.color, boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.25)' }} />
      <div
        className="absolute inset-x-0 top-1.5 bottom-0 rounded-t-[40%] rounded-b-md flex flex-col items-center justify-center gap-0.5 overflow-hidden"
        style={{
          background: `repeating-linear-gradient(45deg, ${o.color}, ${o.color} 6px, color-mix(in srgb, ${o.color} 82%, white) 6px, color-mix(in srgb, ${o.color} 82%, white) 9px)`,
          boxShadow: 'inset 0 0 0 2px rgba(255,236,170,.65), 0 3px 8px rgba(44,36,28,.25)',
        }}
      >
        <span className={`flex flex-col items-center font-kanji font-bold text-[#fff4d6] ${text} leading-[1.05] drop-shadow`}>
          {[...o.jp].map((ch, i) => (
            <span key={i}>{ch}</span>
          ))}
        </span>
        {shrineKanji && size === 'lg' && (
          <span className="flex flex-col items-center font-kanji text-[#fff4d6]/80 text-[8px] leading-none mt-0.5">
            {[...shrineKanji.slice(0, 4)].map((ch, i) => (
              <span key={i}>{ch}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
};

interface Props {
  shrine: ShrineData;
  tiedHere: number;
  onReceive: (kind: OmamoriKind, forWhom?: string) => void;
  onClose: () => void;
}

/**
 * Goen-musubi omamori: choose one of five, receive it into your pouch,
 * and its twin cord is tied onto this shrine's sacred tree.
 */
export const OmamoriModal: React.FC<Props> = ({ shrine, tiedHere, onReceive, onClose }) => {
  const [kind, setKind] = useState<OmamoriKind>('enmusubi');
  const [forWhom, setForWhom] = useState('');
  const [done, setDone] = useState(false);
  const o = OMAMORI[kind];
  const name = shrine.kanjiName.split('（')[0];

  return (
    <Sheet onClose={onClose} size="lg" label="Omamori" className="px-5 sm:px-7 pt-3 sm:pt-6">
      <div className="text-center pr-6 sm:pr-0">
        <span className="text-xs uppercase tracking-widest text-[#b45309] font-medium">Goen-musubi amulet</span>
        <h2 className="text-xl sm:text-2xl font-cinzel font-semibold text-[#2c241c] mt-0.5">Omamori (御守)</h2>
        <p className="text-xs text-[#6d5b49] mt-1">
          Two cords: one stays with you, the other is tied to {name}'s sacred tree.
        </p>
      </div>

      {!done ? (
        <div className="mt-5 grid sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)] gap-6 items-start">
          {/* preview */}
          <div className="flex flex-col items-center gap-3 sm:sticky sm:top-0 pt-2">
            <OmamoriPouch kind={kind} size="lg" shrineKanji={name} />
            <div className="text-center">
              <div className="font-kanji font-bold" style={{ color: o.color }}>
                {o.jp}
              </div>
              <div className="text-xs text-[#6d5b49]">{o.blurb}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-medium text-[#4a3c2e] mb-1.5">Choose your amulet</div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-2">
                {(Object.keys(OMAMORI) as OmamoriKind[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setKind(k);
                      soundService.playZenTone(Object.keys(OMAMORI).indexOf(k));
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      kind === k ? 'bg-[#fbeedd] border-[#b45309]' : 'bg-[#fffcf6] border-[#e3d6c0] hover:border-[#d8c8ae]'
                    }`}
                  >
                    <OmamoriPouch kind={k} size="sm" />
                    <span>
                      <span className="block font-kanji font-semibold text-sm" style={{ color: OMAMORI[k].color }}>
                        {OMAMORI[k].jp}
                      </span>
                      <span className="block text-[11px] text-[#6d5b49]">{OMAMORI[k].en}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-[#4a3c2e]">
                Who is it for? <span className="font-normal text-[#8a7762]">(optional)</span>
              </span>
              <input
                value={forWhom}
                onChange={(e) => setForWhom(e.target.value.slice(0, 24))}
                placeholder="Me, Mum, my team…"
                className="mt-1 w-full px-3 py-2 bg-[#fffcf6] border border-[#e3d6c0] rounded-lg text-sm text-[#2c241c] placeholder-[#a8967f] focus:outline-none focus:border-[#b45309]"
              />
            </label>
            <button
              onClick={() => {
                soundService.playBellChime();
                onReceive(kind, forWhom.trim() || undefined);
                setDone(true);
              }}
              className="w-full py-3 rounded-xl bg-[#b91c1c] hover:bg-[#a3170f] text-white font-semibold text-sm cursor-pointer"
            >
              Receive it and tie the cord
            </button>
            {tiedHere > 0 && <p className="text-[11px] text-center text-[#8a7762]">You've tied {tiedHere} cord{tiedHere > 1 ? 's' : ''} to this tree before.</p>}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center text-center gap-4 pb-2">
          <OmamoriPouch kind={kind} size="lg" shrineKanji={name} />
          <div>
            <div className="font-cinzel text-lg font-semibold text-[#2c241c]">Your cord is tied</div>
            <p className="text-sm text-[#4a3c2e] mt-1 max-w-sm">
              The {o.jp} omamori is in your pouch{forWhom.trim() ? `, for ${forWhom.trim()}` : ''}. Its twin cord now hangs on the sacred tree, next to the omikuji stand. Go and look.
            </p>
            <p className="text-[12px] text-[#8a7762] mt-3 max-w-sm">
              Tradition: an omamori's protection lasts about a year. Then you return it to a shrine, where it is respectfully burned, and receive a new one.
            </p>
          </div>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] text-sm font-semibold cursor-pointer">
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
};
