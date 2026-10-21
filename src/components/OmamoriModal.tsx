import React, { useState } from 'react';
import { Sheet } from './ui/Sheet';
import { OmamoriArt } from './OmamoriArt';
import { omamoriOf, designFor, type OmamoriDesign } from '../data/omamoriData';
import { WISHES } from '../data/wishesData';
import type { OmamoriKind } from '../data/pilgrimData';
import type { ShrineData } from '../types/shrine';
import { soundService } from '../services/soundService';

/** Kept for older callers: draws an amulet from a design id or one of the original five kinds */
export const OmamoriPouch: React.FC<{ kind?: OmamoriKind; designId?: string; size?: 'sm' | 'md' | 'lg' }> = ({ kind, designId, size = 'md' }) => (
  <OmamoriArt design={designFor({ kind, designId })} size={size === 'sm' ? 34 : size === 'lg' ? 96 : 56} />
);

const WishTag: React.FC<{ d: OmamoriDesign; small?: boolean }> = ({ d, small }) => {
  const w = WISHES[d.wish];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${small ? 'px-1.5 py-px text-[10px]' : 'px-2 py-0.5 text-xs'}`}
      style={{ color: w.color, background: `${w.color}18` }}
    >
      {w.emoji} {w.short}
    </span>
  );
};

interface Props {
  shrine: ShrineData;
  tiedHere: number;
  onReceive: (designId: string, forWhom?: string) => void;
  onClose: () => void;
}

/**
 * The amulet stall. Every shrine and temple has its own 5–6 designs, drawn from its kami,
 * legends, animals and landmarks. One cord stays with you; its twin is tied to the sacred tree.
 */
export const OmamoriModal: React.FC<Props> = ({ shrine, tiedHere, onReceive, onClose }) => {
  const designs = omamoriOf(shrine.id);
  const [sel, setSel] = useState<OmamoriDesign>(designs[0]);
  const [hop, setHop] = useState(0);
  const [forWhom, setForWhom] = useState('');
  const [done, setDone] = useState(false);
  const name = shrine.kanjiName.split('（')[0];

  if (!sel) return null;

  return (
    <Sheet onClose={onClose} size="lg" label="Omamori" className="px-5 sm:px-7 pt-3 sm:pt-6">
      <div className="text-center pr-6 sm:pr-0">
        <span className="text-xs uppercase tracking-widest text-[#b45309] font-medium">{name} amulet stall</span>
        <h2 className="text-xl sm:text-2xl font-cinzel font-semibold text-[#2c241c] mt-0.5">Omamori (御守)</h2>
        <p className="text-xs text-[#5a4837] mt-1">
          {designs.length} designs you'll only find here. One cord stays with you, its twin is tied to the sacred tree.
        </p>
      </div>

      {!done ? (
        <div className="mt-4 grid sm:grid-cols-[minmax(0,210px)_minmax(0,1fr)] gap-5 sm:gap-6 items-start">
          {/* preview */}
          <div className="flex sm:flex-col items-center gap-4 sm:gap-3 sm:sticky sm:top-0 sm:pt-2 p-3 sm:p-0 rounded-2xl bg-[#f6eedf] sm:bg-transparent">
            <div className="omamori-swing px-2 pt-1">
              <div key={hop} className="omamori-hop">
                <OmamoriArt design={sel} size={92} title={`${sel.jp} omamori`} />
              </div>
            </div>
            <div className="sm:text-center min-w-0">
              <div className="font-kanji font-bold text-lg text-[#2c241c] leading-tight">{sel.jp}</div>
              <div className="text-sm font-semibold text-[#4a3b2c]">{sel.name}</div>
              <div className="mt-1">
                <WishTag d={sel} />
              </div>
              <p className="text-xs text-[#4a3b2c] leading-relaxed mt-1.5">{sel.blurb}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-[#4a3c2e] mb-2">Choose your amulet</div>
              <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Omamori designs">
                {designs.map((d, i) => {
                  const on = sel.id === d.id;
                  return (
                    <button
                      key={d.id}
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        setSel(d);
                        setHop((h) => h + 1);
                        soundService.playZenTone(i % 5);
                      }}
                      className={`flex flex-col items-center gap-1 pt-3 pb-2 px-1 rounded-2xl border transition-all cursor-pointer ${
                        on ? 'bg-[#fbeedd] border-[#b45309] shadow-sm' : 'bg-[#fffcf6] border-[#e3d6c0] hover:border-[#c9b394] hover:-translate-y-0.5'
                      }`}
                    >
                      <OmamoriArt design={d} size={40} />
                      <span className="font-kanji font-semibold text-[12px] text-[#2c241c] leading-tight text-center">{d.jp}</span>
                      <WishTag d={d} small />
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-[#4a3c2e]">
                Who is it for? <span className="font-normal text-[#6d5b49]">(optional)</span>
              </span>
              <input
                value={forWhom}
                onChange={(e) => setForWhom(e.target.value.slice(0, 24))}
                placeholder="Me, Mum, my team…"
                className="mt-1 w-full px-3 py-2.5 bg-[#fffcf6] border border-[#e3d6c0] rounded-xl text-sm text-[#2c241c] placeholder-[#8c7a67] focus:outline-none focus:border-[#b45309]"
              />
            </label>
            <button
              onClick={() => {
                soundService.playBellChime();
                onReceive(sel.id, forWhom.trim() || undefined);
                setDone(true);
              }}
              className="w-full py-3 rounded-xl bg-[#b91c1c] hover:bg-[#a3170f] text-white font-semibold text-sm cursor-pointer"
            >
              Receive {sel.jp} and tie the cord
            </button>
            {tiedHere > 0 && <p className="text-xs text-center text-[#6d5b49]">You've tied {tiedHere} cord{tiedHere > 1 ? 's' : ''} to this tree before.</p>}
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center text-center gap-4 pb-2">
          <div className="omamori-swing">
            <OmamoriArt design={sel} size={110} />
          </div>
          <div>
            <div className="font-cinzel text-lg font-semibold text-[#2c241c]">Your cord is tied</div>
            <p className="text-sm text-[#4a3c2e] mt-1 max-w-sm">
              {sel.jp} ({sel.name}) is in your pouch{forWhom.trim() ? `, for ${forWhom.trim()}` : ''}. Its twin cord now hangs on the sacred tree beside the omikuji stand. Go and look.
            </p>
            <p className="text-xs text-[#6d5b49] mt-3 max-w-sm">
              Tradition: an omamori protects you for about a year. Then you return it to a shrine, where it is respectfully burned, and receive a new one.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setDone(false)} className="px-5 py-2.5 rounded-xl border border-[#d8cabb] text-[#2c241c] text-sm font-semibold cursor-pointer">
              Another one
            </button>
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] text-sm font-semibold cursor-pointer">
              Done
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
};
