import React from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-amber-900/40 rounded-2xl shadow-2xl p-6 text-stone-100 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Vermilion Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Pilgrim's Sacred Stamp Album</span>
          </div>
          <h2 className="text-2xl font-cinzel font-semibold text-amber-100">
            Goshuinchō (御朱印帳)
          </h2>
          <p className="text-xs text-stone-400 font-kanji mt-0.5">
            Collected: {goshuinList.length} of {SHRINES.length} Sacred Sanctuaries
          </p>

          {/* Prompt to stamp current shrine if not yet done */}
          {!isCurrentStamped ? (
            <div className="mt-3 p-3 bg-red-950/40 border border-red-700/40 rounded-xl flex items-center justify-between gap-3 text-left">
              <div>
                <div className="text-xs font-semibold text-amber-200 font-cinzel">
                  You are at {currentShrine.name}!
                </div>
                <div className="text-[11px] text-stone-300 font-sans">
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
            <div className="mt-2 text-xs text-emerald-400 flex items-center justify-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>{currentShrine.name} Goshuin officially sealed in your book.</span>
            </div>
          )}
        </div>

        {/* Grid of Shrine Stamps */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SHRINES.map((shrine) => {
              const entry = goshuinList.find((g) => g.shrineId === shrine.id);
              const stamped = !!entry;

              return (
                <div
                  key={shrine.id}
                  className={`relative p-5 rounded-xl border transition-all ${
                    stamped
                      ? 'bg-[#fbf7ea] text-stone-900 border-amber-300 shadow-md'
                      : 'bg-stone-950/60 text-stone-500 border-stone-800'
                  }`}
                >
                  {stamped ? (
                    <div>
                      {/* Stamp Header */}
                      <div className="flex justify-between items-start border-b border-stone-300 pb-2 mb-3">
                        <div>
                          <span className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">
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
                  ) : (
                    /* Locked / Unvisited placeholder */
                    <div className="h-44 flex flex-col items-center justify-center text-center p-3">
                      <div className="w-14 h-14 rounded-full border border-dashed border-stone-700 flex items-center justify-center mb-2 text-stone-600">
                        <Stamp className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-kanji text-stone-400">
                        {shrine.kanjiName} ({shrine.name})
                      </h4>
                      <p className="text-[11px] text-stone-600 mt-1">
                        Visit this sacred site and perform worship to earn the seal.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-stone-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer"
          >
            Close Goshuinchō
          </button>
        </div>
      </div>
    </div>
  );
};
