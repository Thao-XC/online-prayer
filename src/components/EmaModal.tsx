import React, { useState } from 'react';
import { soundService } from '../services/soundService';
import { ShrineData, EmaVotive } from '../types/shrine';
import confetti from 'canvas-confetti';
import { PenTool, Check, X } from 'lucide-react';

interface EmaModalProps {
  shrine: ShrineData;
  onClose: () => void;
  onHangEma: (ema: EmaVotive) => void;
  existingEmas: EmaVotive[];
}

const MOTIFS = [
  { id: 'torii', label: 'Sacred Torii (鳥居)', symbol: '⛩️' },
  { id: 'kitsune', label: 'Inari Fox (白狐)', symbol: '🦊' },
  { id: 'cherry_blossom', label: 'Sakura (桜)', symbol: '🌸' },
  { id: 'dragon', label: 'Ryū Dragon (龍)', symbol: '🐉' },
  { id: 'lotus', label: 'Lotus (蓮)', symbol: '🪷' },
  { id: 'sun', label: 'Rising Sun (日の出)', symbol: '🌅' },
] as const;

const CATEGORIES = [
  { id: 'success', label: 'Career & Exams (学業・出世)', color: 'text-amber-400' },
  { id: 'health', label: 'Health & Well-being (無病息災)', color: 'text-emerald-400' },
  { id: 'love', label: 'Love & Matchmaking (良縁成就)', color: 'text-rose-400' },
  { id: 'peace', label: 'Inner Peace (心願成就)', color: 'text-sky-400' },
  { id: 'travel', label: 'Safe Travel (交通安全)', color: 'text-indigo-400' },
  { id: 'family', label: 'Family Harmony (家内安全)', color: 'text-orange-400' },
] as const;

export const EmaModal: React.FC<EmaModalProps> = ({
  shrine,
  onClose,
  onHangEma,
  existingEmas,
}) => {
  const [tab, setTab] = useState<'create' | 'gallery'>('create');
  const [authorName, setAuthorName] = useState('');
  const [wishCategory, setWishCategory] = useState<EmaVotive['wishCategory']>('success');
  const [illustration, setIllustration] = useState<EmaVotive['illustration']>('torii');
  const [wishText, setWishText] = useState('');
  const [isHung, setIsHung] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishText.trim()) return;

    const newEma: EmaVotive = {
      id: `ema-${Date.now()}`,
      shrineId: shrine.id,
      shrineName: shrine.name,
      authorName: authorName.trim() || 'Humble Pilgrim',
      wishCategory,
      wishText: wishText.trim(),
      illustration,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
    };

    soundService.playCoinToss();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#d97706', '#ffffff'],
    });

    onHangEma(newEma);
    setIsHung(true);
  };

  const shrineEmas = existingEmas.filter((e) => e.shrineId === shrine.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-900/40 rounded-2xl shadow-2xl p-6 text-stone-100 overflow-hidden max-h-[92vh] flex flex-col">
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
        <div className="text-center mb-4 shrink-0">
          <span className="text-xs uppercase tracking-widest text-amber-500/90 font-medium">
            Votive Wooden Tablet
          </span>
          <h2 className="text-xl sm:text-2xl font-cinzel font-semibold text-amber-100 mt-0.5">
            Ema Prayer Wall (絵馬掛所)
          </h2>
          <p className="text-xs text-stone-400 font-kanji">
            {shrine.name}・諸願成就
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => { setTab('create'); setIsHung(false); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'create'
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              Write New Ema (奉納)
            </button>
            <button
              onClick={() => setTab('gallery')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'gallery'
                  ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              View Shrine Rack ({shrineEmas.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Inscribe Ema Form */}
        {tab === 'create' && !isHung && (
          <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Visual Ema Wooden Tablet Preview */}
            <div className="relative mx-auto w-72 bg-gradient-to-br from-[#e8be89] to-[#c99a63] text-stone-900 rounded-t-xl rounded-b-md p-4 shadow-lg border border-amber-800/40">
              {/* Red hanging cord ring */}
              <div className="w-4 h-4 rounded-full border-2 border-red-700 mx-auto -mt-6 bg-red-600 shadow-sm" />

              <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{MOTIFS.find((m) => m.id === illustration)?.symbol}</span>
                <span className="text-[10px] font-kanji border border-stone-800/40 px-1 rounded text-stone-800">
                  奉納
                </span>
              </div>

              <div className="min-h-[70px] bg-amber-50/50 border border-amber-900/20 rounded p-2 text-xs font-serif italic text-stone-800 leading-snug break-words">
                {wishText.trim() ? wishText : 'Your heartfelt petition or wish inscribed in wood...'}
              </div>

              <div className="mt-3 flex justify-between items-end text-[10px] text-stone-700 font-sans border-t border-amber-900/20 pt-1">
                <span>{CATEGORIES.find((c) => c.id === wishCategory)?.label.split('(')[0]}</span>
                <span className="font-semibold">{authorName.trim() || 'Pilgrim'}</span>
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Pilgrim Name or Pen Name:
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="e.g. Kenji, Sarah, Anonymous..."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Prayer Intention:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setWishCategory(c.id as EmaVotive['wishCategory'])}
                      className={`p-2 text-left rounded-lg text-xs border transition-all cursor-pointer ${
                        wishCategory === c.id
                          ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                          : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Illustration Motif */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Wood Carving Motif:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {MOTIFS.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setIllustration(m.id as EmaVotive['illustration'])}
                      className={`p-2 text-center rounded-lg text-xs border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                        illustration === m.id
                          ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                          : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <span className="text-lg">{m.symbol}</span>
                      <span className="text-[10px]">{m.label.split('(')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prayer text */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  Your Prayer / Aspiration:
                </label>
                <textarea
                  required
                  maxLength={140}
                  value={wishText}
                  onChange={(e) => setWishText(e.target.value)}
                  placeholder="Express your true wish for your family, happiness, safe travels, or goals..."
                  className="w-full h-20 px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!wishText.trim()}
              className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 disabled:opacity-50 text-amber-100 border border-amber-600/40 transition-all shadow-lg hover:shadow-amber-900/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <PenTool className="w-5 h-5 text-amber-300" />
              <span>Hang Ema on Sacred Shrine Rack (絵馬を奉納)</span>
            </button>
          </form>
        )}

        {/* Hung Confirmation */}
        {tab === 'create' && isHung && (
          <div className="text-center py-6 space-y-4 my-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 mb-1">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-cinzel font-semibold text-amber-200">
              Ema Tablet Hung on Shrine Rack
            </h3>
            <p className="text-xs font-kanji text-amber-400">心願成就・神前にて祈念</p>
            <p className="text-sm text-stone-300 max-w-sm mx-auto leading-relaxed">
              Your prayer is now hung alongside hundreds of pilgrims under the sacred sanctuary eaves, swaying gently in the mountain breeze.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setTab('gallery')}
                className="py-2.5 px-5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer"
              >
                View Community Rack
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-lg bg-amber-700 hover:bg-amber-600 text-amber-100 text-xs font-medium cursor-pointer"
              >
                Return to 3D Shrine
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Gallery of Pilgrims' Emas */}
        {tab === 'gallery' && (
          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            {shrineEmas.length === 0 ? (
              <div className="text-center py-12 text-stone-500 text-sm">
                No prayers hung at this shrine yet. Be the first to hang an Ema tablet!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shrineEmas.map((ema) => (
                  <div
                    key={ema.id}
                    className="p-3 bg-gradient-to-br from-[#ebd2ad] to-[#d6ab77] text-stone-900 rounded-lg border border-amber-900/30 shadow relative"
                  >
                    <div className="flex justify-between items-start mb-1 text-xs">
                      <span className="font-semibold text-stone-800">{ema.authorName}</span>
                      <span className="text-[10px] text-stone-600">{ema.date}</span>
                    </div>
                    <p className="text-xs font-serif italic text-stone-900 line-clamp-3 leading-relaxed mb-2">
                      "{ema.wishText}"
                    </p>
                    <div className="text-[10px] text-amber-900 font-semibold flex justify-between items-center border-t border-amber-900/20 pt-1">
                      <span>{CATEGORIES.find((c) => c.id === ema.wishCategory)?.label.split('(')[0]}</span>
                      <span>{MOTIFS.find((m) => m.id === ema.illustration)?.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
