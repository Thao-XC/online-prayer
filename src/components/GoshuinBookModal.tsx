import React from 'react';
import { Sheet } from './ui/Sheet';
import { SHRINES } from '../data/shrinesData';
import { GoshuinEntry, ShrineData } from '../types/shrine';
import { soundService } from '../services/soundService';
import confetti from 'canvas-confetti';
import { Stamp, Check, X, Award } from 'lucide-react';

interface GoshuinBookModalProps {
  currentShrine: ShrineData;
  goshuinList: GoshuinEntry[];
  onAddGoshuin: (entry: GoshuinEntry) => void;
  onClose: () => void;
}

export const GoshuinBookModal: React.FC<GoshuinBookModalProps> = ({
  currentShrine,
  goshuinList,
  onAddGoshuin,
  onClose,
}) => {
  const isCurrentStamped = goshuinList.some((g) => g.shrineId === currentShrine.id);

  const handleStampCurrent = () => {
    soundService.playTempleGong();
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#dc2626', '#b91c1c', '#f59e0b'],
    });

    const newEntry: GoshuinEntry = {
      shrineId: currentShrine.id,
      shrineName: currentShrine.name,
      kanjiName: currentShrine.kanjiName,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      sealColor: '#c52210',
    };

    onAddGoshuin(newEntry);
  };

  const collected = SHRINES.flatMap((shrine) => {
    const entry = goshuinList.find((g) => g.shrineId === shrine.id);
    return entry ? [{ shrine, entry }] : [];
  });
  const remaining = SHRINES.filter((shrine) => !goshuinList.some((g) => g.shrineId === shrine.id));

  return (
    <Sheet onClose={onClose} size="lg" label="Goshuincho stamp book" className="px-5 pt-3 sm:p-6 flex flex-col">

        {/* Header */}
        <div className="text-center mb-5 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fdecea] border border-[#e8b4a8] text-[#b91c1c] text-xs font-medium mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Pilgrim's Sacred Stamp Album</span>
          </div>
          <h2 className="text-2xl font-cinzel font-semibold text-[#2c241c]">
            Goshuinchō (御朱印帳)
          </h2>
          <div className="mt-2 mx-auto max-w-xs">
            <div className="flex justify-between text-[11px] text-[#6d5b49] mb-1">
              <span>Seals collected</span>
              <span className="font-mono font-semibold text-[#b91c1c]">
                {goshuinList.length} / {SHRINES.length}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[#ece2cf] overflow-hidden">
              <div
                className="h-full bg-[#b91c1c] rounded-full transition-all duration-500"
                style={{ width: `${(goshuinList.length / SHRINES.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Prompt to stamp current shrine if not yet done */}
          {!isCurrentStamped ? (
            <div className="mt-3 p-3 bg-[#fdecea] border border-[#e8b4a8] rounded-xl flex items-center justify-between gap-3 text-left">
              <div>
                <div className="text-xs font-semibold text-[#7c2d12] font-cinzel">
                  You are at {currentShrine.name}!
                </div>
                <div className="text-[11px] text-[#4a3c2e] font-sans">
                  Receive the official vermilion seal and calligraphy stamp for this visit.
                </div>
              </div>
              <button
                onClick={handleStampCurrent}
                className="py-2 px-4 rounded-lg bg-red-700 hover:bg-red-600 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 shadow cursor-pointer"
              >
                <Stamp className="w-4 h-4" />
                <span>Stamp Book (御朱印拝受)</span>
              </button>
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#15803d] flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{currentShrine.name} Goshuin officially sealed in your book.</span>
            </div>
          )}
        </div>

        {/* Collected seals */}
        <div className="flex-1 space-y-5">
          {collected.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8a7762] mb-2">Your seals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {collected.map(({ shrine, entry }) => (
                  <div
                    key={shrine.id}
                    className="relative p-4 rounded-xl border bg-[#fffcf6] text-stone-900 border-[#d9a85c] shadow-sm"
                  >
                    <div>
                      {/* Stamp Header */}
                      <div className="flex justify-between items-start border-b border-stone-300 pb-2 mb-3">
                        <div>
                          <span className="text-[10px] text-[#8a7762] uppercase tracking-widest font-mono">
                            {shrine.region} • {shrine.prefecture}
                          </span>
                          <h4 className="text-base font-bold font-kanji text-stone-900">
                            {shrine.kanjiName}
                          </h4>
                          <span className="text-xs text-stone-700 font-cinzel">
                            {shrine.name}
                          </span>
                        </div>
                        <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono font-medium">
                          {entry.date}
                        </span>
                      </div>

                      {/* Official Vermilion Seal Stamp Graphic */}
                      <div className="flex items-center justify-between gap-3 py-2">
                        {/* Seal */}
                        <div
                          className={`w-20 h-20 border-2 border-red-700 p-1 flex items-center justify-center text-center rotate-[-3deg] ${
                            shrine.goshuinStamp.vermilionSealShape === 'circle'
                              ? 'rounded-full'
                              : shrine.goshuinStamp.vermilionSealShape === 'diamond'
                              ? 'rotate-45'
                              : 'rounded-md'
                          }`}
                        >
                          <span className="text-[11px] font-kanji font-bold text-red-700 leading-tight">
                            {shrine.goshuinStamp.templeSealName}
                          </span>
                        </div>

                        {/* Deity Calligraphy */}
                        <div className="flex-1 text-right">
                          <div className="text-base font-kanji font-bold text-stone-900 tracking-wider">
                            {shrine.goshuinStamp.deityInscription}
                          </div>
                          <div className="text-[10px] text-stone-600 mt-1 font-serif italic">
                            "{shrine.goshuinStamp.quote}"
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Not yet visited: compact stamp circles */}
          {remaining.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8a7762] mb-2">
                Still to visit
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {remaining.map((shrine) => (
                  <div
                    key={shrine.id}
                    className={`flex flex-col items-center text-center gap-1.5 p-2 rounded-xl ${
                      shrine.id === currentShrine.id ? 'bg-[#fdecea] ring-1 ring-[#e8b4a8]' : ''
                    }`}
                    title={`${shrine.name} — visit and worship to earn this seal`}
                  >
                    <div className="w-12 h-12 rounded-full border border-dashed border-[#cdb999] flex items-center justify-center text-[#c4ae8c]">
                      <span className="font-kanji text-sm font-bold">{shrine.kanjiName.charAt(0)}</span>
                    </div>
                    <span className="text-[11px] leading-tight font-kanji text-[#6d5b49] line-clamp-2">
                      {shrine.kanjiName.split('（')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
    </Sheet>
  );
};
