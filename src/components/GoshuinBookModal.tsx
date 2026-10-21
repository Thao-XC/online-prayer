import React, { useState, useSyncExternalStore } from 'react';
import { Sheet } from './ui/Sheet';
import { SHRINES } from '../data/shrinesData';
import { GoshuinEntry, ShrineData } from '../types/shrine';
import { soundService } from '../services/soundService';
import { pilgrimService } from '../services/pilgrimService';
import { MONTHLY_SEAL, LEGEND_INDEX, OMAMORI } from '../data/pilgrimData';
import { OmamoriPouch } from './OmamoriModal';
import { useLuck } from './LuckAndLegends';
import type { StoryCard } from '../three/encounters/types';
import confetti from 'canvas-confetti';
import { Stamp, Check, Award, Lock, ScrollText } from 'lucide-react';

interface GoshuinBookModalProps {
  currentShrine: ShrineData;
  goshuinList: GoshuinEntry[];
  onAddGoshuin: (entry: GoshuinEntry) => void;
  onClose: () => void;
  onOpenCard?: (id: string, card: StoryCard) => void;
  initialTab?: Tab;
}

type Tab = 'seals' | 'omamori' | 'legends';

const ym = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** The pilgrim's book: monthly goshuin seals, omamori pouch, and the Book of Legends */
export const GoshuinBookModal: React.FC<GoshuinBookModalProps> = ({ currentShrine, goshuinList, onAddGoshuin, onClose, onOpenCard, initialTab = 'seals' }) => {
  const [tab, setTab] = useState<Tab>(initialTab);
  const pilgrim = useSyncExternalStore(pilgrimService.subscribe, pilgrimService.get, pilgrimService.get);
  const { found } = useLuck();
  const month = new Date().getMonth() + 1;
  const season = MONTHLY_SEAL[month];
  const stampedThisMonth = goshuinList.some((g) => g.shrineId === currentShrine.id && g.ym === ym());
  const stampedEver = goshuinList.some((g) => g.shrineId === currentShrine.id);
  const shrinesStamped = new Set(goshuinList.map((g) => g.shrineId)).size;

  const handleStampCurrent = () => {
    soundService.playTempleGong();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 }, colors: ['#dc2626', '#b91c1c', '#f59e0b'] });
    onAddGoshuin({
      shrineId: currentShrine.id,
      shrineName: currentShrine.name,
      kanjiName: currentShrine.kanjiName,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      sealColor: season.color,
      month,
      ym: ym(),
    });
  };

  const collected = SHRINES.flatMap((shrine) => {
    const entries = goshuinList.filter((g) => g.shrineId === shrine.id);
    return entries.length ? [{ shrine, entries, latest: entries[entries.length - 1] }] : [];
  });
  const remaining = SHRINES.filter((shrine) => !goshuinList.some((g) => g.shrineId === shrine.id));

  const tabs: { id: Tab; label: string; jp: string; count: string }[] = [
    { id: 'seals', label: 'Seals', jp: '御朱印', count: `${shrinesStamped}/${SHRINES.length}` },
    { id: 'omamori', label: 'Omamori', jp: '御守', count: String(pilgrim.pouch.length) },
    { id: 'legends', label: 'Legends', jp: '伝説', count: `${found.length}/${LEGEND_INDEX.length}` },
  ];

  return (
    <Sheet onClose={onClose} size="lg" label="Pilgrim's book" className="px-5 pt-3 sm:p-6 flex flex-col">
      <div className="text-center mb-4 shrink-0 pr-6 sm:pr-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdecea] border border-[#e8b4a8] text-[#b91c1c] text-xs font-medium mb-1">
          <Award className="w-3.5 h-3.5" />
          <span>Pilgrim's book</span>
        </div>
        <h2 className="text-2xl font-cinzel font-semibold text-[#2c241c]">Goshuinchō (御朱印帳)</h2>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-[#f1e8d7] border border-[#e3d6c0] mb-4 shrink-0" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              tab === t.id ? 'bg-[#fffcf6] text-[#7c2d12] shadow-sm' : 'text-[#6d5b49] hover:text-[#2c241c]'
            }`}
          >
            <span className="font-kanji">{t.jp}</span> <span className="hidden min-[420px]:inline">{t.label}</span>
            <span className="ml-1 font-mono text-[10px] text-[#8a7762]">{t.count}</span>
          </button>
        ))}
      </div>

      {/* ---------------- Seals ---------------- */}
      {tab === 'seals' && (
        <div className="flex-1 space-y-5">
          {!stampedThisMonth ? (
            <div className="p-3 bg-[#fdecea] border border-[#e8b4a8] rounded-xl flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0" style={{ background: `${season.color}22`, border: `1.5px solid ${season.color}` }}>
                  {season.emoji}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#7c2d12]">
                    {stampedEver ? `This month's seal at ${currentShrine.name}` : `You are at ${currentShrine.name}`}
                  </div>
                  <div className="text-[11px] text-[#4a3c2e]">
                    {season.kanji} · {season.motif} ({season.en}): the seal changes every month.
                  </div>
                </div>
              </div>
              <button onClick={handleStampCurrent} className="py-2 px-4 rounded-lg bg-[#b91c1c] hover:bg-[#a3170f] text-white font-medium text-xs flex items-center justify-center gap-1.5 shrink-0 shadow cursor-pointer">
                <Stamp className="w-4 h-4" />
                <span>Receive seal (御朱印拝受)</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-[#15803d] flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>
                {season.kanji} seal from {currentShrine.name} is in your book. Next month brings a new design.
              </span>
            </div>
          )}

          {collected.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8a7762] mb-2">Your seals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {collected.map(({ shrine, entries, latest }) => {
                  const s = latest.month ? MONTHLY_SEAL[latest.month] : null;
                  const sealColor = s?.color ?? '#b91c1c';
                  return (
                    <div key={shrine.id} className="relative p-4 rounded-xl border bg-[#fffcf6] border-[#d9a85c] shadow-sm overflow-hidden">
                      {s && <span className="absolute -right-2 -bottom-3 text-6xl opacity-15 pointer-events-none select-none">{s.emoji}</span>}
                      <div className="flex justify-between items-start border-b border-[#e3d6c0] pb-2 mb-3">
                        <div>
                          <span className="text-[10px] text-[#8a7762] uppercase tracking-widest font-mono">{shrine.region}</span>
                          <h4 className="text-base font-bold font-kanji text-[#2c241c]">{shrine.kanjiName}</h4>
                          <span className="text-xs text-[#4a3c2e] font-cinzel">{shrine.name}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium" style={{ background: `${sealColor}18`, color: sealColor }}>
                          {latest.date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-1">
                        <div
                          className={`w-20 h-20 border-2 p-1 flex flex-col items-center justify-center text-center rotate-[-3deg] ${
                            shrine.goshuinStamp.vermilionSealShape === 'circle' ? 'rounded-full' : 'rounded-md'
                          }`}
                          style={{ borderColor: sealColor }}
                        >
                          <span className="text-[11px] font-kanji font-bold leading-tight" style={{ color: sealColor }}>
                            {shrine.goshuinStamp.templeSealName}
                          </span>
                          {s && <span className="text-[9px] font-kanji mt-0.5" style={{ color: sealColor }}>{s.kanji}·{s.motif}</span>}
                        </div>
                        <div className="flex-1 text-right">
                          <div className="text-base font-kanji font-bold text-[#2c241c] tracking-wider">{shrine.goshuinStamp.deityInscription}</div>
                          <div className="text-[10px] text-[#6d5b49] mt-1 italic">"{shrine.goshuinStamp.quote}"</div>
                        </div>
                      </div>
                      {entries.some((e) => e.month) && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entries
                            .filter((e) => e.month)
                            .map((e) => (
                              <span key={e.ym} title={MONTHLY_SEAL[e.month!].en} className="text-[10px] px-1.5 py-0.5 rounded-full border font-kanji" style={{ borderColor: MONTHLY_SEAL[e.month!].color, color: MONTHLY_SEAL[e.month!].color }}>
                                {MONTHLY_SEAL[e.month!].emoji} {MONTHLY_SEAL[e.month!].kanji}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {remaining.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8a7762] mb-2">Still to visit</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {remaining.map((shrine) => (
                  <div key={shrine.id} className={`flex flex-col items-center text-center gap-1.5 p-2 rounded-xl ${shrine.id === currentShrine.id ? 'bg-[#fdecea] ring-1 ring-[#e8b4a8]' : ''}`} title={`${shrine.name}: visit and worship to earn this seal`}>
                    <div className="w-12 h-12 rounded-full border border-dashed border-[#cdb999] flex items-center justify-center text-[#c4ae8c]">
                      <span className="font-kanji text-sm font-bold">{shrine.kanjiName.charAt(0)}</span>
                    </div>
                    <span className="text-[11px] leading-tight font-kanji text-[#6d5b49] line-clamp-2">{shrine.kanjiName.split('（')[0]}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ---------------- Omamori ---------------- */}
      {tab === 'omamori' && (
        <div className="flex-1">
          {pilgrim.pouch.length === 0 ? (
            <div className="text-center py-10 text-sm text-[#6d5b49]">
              <div className="flex justify-center gap-2 mb-4 opacity-60">
                {(Object.keys(OMAMORI) as (keyof typeof OMAMORI)[]).map((k) => (
                  <OmamoriPouch key={k} kind={k} size="sm" />
                ))}
              </div>
              Your pouch is empty. Receive an omamori at any shrine's amulet stall (the Omamori button), and tie its twin cord to the sacred tree.
            </div>
          ) : (
            <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 gap-3">
              {pilgrim.pouch.map((o) => {
                const ageDays = (Date.now() - o.at) / 86400000;
                return (
                  <div key={o.id} className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-[#fffcf6] border border-[#e3d6c0]">
                    <div className="pt-2">
                      <OmamoriPouch kind={o.kind} shrineKanji={o.kanjiName.split('（')[0]} />
                    </div>
                    <div className="font-kanji text-sm font-semibold" style={{ color: OMAMORI[o.kind].color }}>
                      {OMAMORI[o.kind].jp}
                    </div>
                    <div className="text-[11px] text-[#4a3c2e] font-kanji leading-tight">{o.kanjiName.split('（')[0]}</div>
                    {o.forWhom && <div className="text-[11px] text-[#6d5b49]">for {o.forWhom}</div>}
                    <div className="text-[10px] text-[#8a7762] font-mono">{o.date}</div>
                    {ageDays > 365 && <div className="text-[10px] text-[#b45309]">A year has passed: time to return it</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Legends ---------------- */}
      {tab === 'legends' && (
        <div className="flex-1 space-y-4">
          <p className="text-xs text-[#6d5b49]">
            Secrets and hidden worlds wait at every shrine. Some answer a bow, some only appear at night, some lie under the water.
          </p>
          {SHRINES.map((shrine) => {
            const items = LEGEND_INDEX.filter((l) => l.shrineId === shrine.id);
            if (!items.length) return null;
            return (
              <section key={shrine.id}>
                <h3 className="text-xs font-semibold text-[#8a7762] mb-1.5">
                  <span className="font-kanji text-[#7c2d12] text-sm">{shrine.kanjiName.split('（')[0]}</span> · {shrine.name.split('(')[0]}
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {items.map((l) => {
                    const isFound = found.includes(l.id);
                    const card = pilgrim.cards[l.id];
                    return (
                      <button
                        key={l.id}
                        disabled={!isFound || !card}
                        onClick={() => card && onOpenCard?.(l.id, card)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-colors ${
                          isFound ? 'bg-[#fffcf6] border-[#d9a85c] hover:bg-[#fbeedd] cursor-pointer' : 'bg-[#f6efe2] border-dashed border-[#d8c8ae] cursor-default'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isFound ? 'bg-[#fbeedd] text-[#b45309]' : 'bg-[#ece2cf] text-[#a8967f]'}`}>
                          {isFound ? <ScrollText className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`block text-[13px] font-semibold leading-snug ${isFound ? 'text-[#2c241c]' : 'text-[#8a7762]'}`}>
                            {isFound ? l.title : l.kind === 'legend' ? 'A hidden world' : 'A secret'}
                          </span>
                          <span className="block text-[11px] text-[#6d5b49] leading-snug">{isFound ? (card ? 'Tap to read again' : 'Found') : l.hint}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </Sheet>
  );
};
