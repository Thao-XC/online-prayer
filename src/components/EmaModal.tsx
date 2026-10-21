import React, { useState } from 'react';
import { Sheet } from './ui/Sheet';
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
  { id: 'success', label: 'Career & Exams (学業・出世)', color: 'text-[#b45309]' },
  { id: 'health', label: 'Health & Well-being (無病息災)', color: 'text-[#15803d]' },
  { id: 'love', label: 'Love & Matchmaking (良縁成就)', color: 'text-rose-700' },
  { id: 'peace', label: 'Inner Peace (心願成就)', color: 'text-sky-700' },
  { id: 'travel', label: 'Safe Travel (交通安全)', color: 'text-indigo-700' },
  { id: 'family', label: 'Family Harmony (家内安全)', color: 'text-orange-700' },
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
    <Sheet onClose={onClose} size="xl" label="Ema prayer tablet" className="p-6 flex flex-col">

        {/* Header */}
        <div className="text-center mb-4 shrink-0">
          <span className="text-xs uppercase tracking-widest text-[#b45309] font-medium">
            Votive Wooden Tablet
          </span>
          <h2 className="text-xl sm:text-2xl font-cinzel font-semibold text-[#2c241c] mt-0.5">
            Ema Prayer Wall (絵馬掛所)
          </h2>
          <p className="text-xs text-[#6d5b49] font-kanji">
            {shrine.name}・諸願成就
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => { setTab('create'); setIsHung(false); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'create'
                  ? 'bg-[#f6dfc0] text-[#7c2d12] border border-[#c9a26a]'
                  : 'bg-[#ece2cf] text-[#6d5b49] hover:text-[#2c241c]'
              }`}
            >
              Write New Ema (奉納)
            </button>
            <button
              onClick={() => setTab('gallery')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === 'gallery'
                  ? 'bg-[#f6dfc0] text-[#7c2d12] border border-[#c9a26a]'
                  : 'bg-[#ece2cf] text-[#6d5b49] hover:text-[#2c241c]'
              }`}
            >
              View Shrine Rack ({shrineEmas.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Inscribe Ema Form */}
        {tab === 'create' && !isHung && (
          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
            <div className="grid sm:grid-cols-[minmax(0,280px)_minmax(0,1fr)] gap-5 sm:gap-7 items-start">
              {/* Left (PC) / top (phone): live preview of the wooden tablet */}
              <div className="sm:sticky sm:top-0 space-y-2 pt-3">
                {/* Visual Ema Wooden Tablet Preview */}
                <div className="relative mx-auto w-64 sm:w-full sm:max-w-[280px] bg-gradient-to-br from-[#e8be89] to-[#c99a63] text-stone-900 rounded-t-xl rounded-b-md p-4 shadow-lg border border-[#e0cfb2]">
                  {/* Red hanging cord ring */}
                  <div className="w-4 h-4 rounded-full border-2 border-red-700 mx-auto -mt-6 bg-red-600 shadow-sm" />

                  <div className="flex justify-between items-start mb-2">
                    <span className="text-2xl">{MOTIFS.find((m) => m.id === illustration)?.symbol}</span>
                    <span className="text-[10px] font-kanji border border-[#e3d6c0] px-1 rounded text-stone-800">
                      奉納
                    </span>
                  </div>

                  <div className="min-h-[70px] bg-amber-50/50 border border-[#e0cfb2] rounded p-2 text-xs font-serif italic text-stone-800 leading-snug break-words">
                    {wishText.trim() ? wishText : 'Your heartfelt petition or wish inscribed in wood...'}
                  </div>

                  <div className="mt-3 flex justify-between items-end text-[10px] text-stone-700 font-sans border-t border-[#e0cfb2] pt-1">
                    <span>{CATEGORIES.find((c) => c.id === wishCategory)?.label.split('(')[0]}</span>
                    <span className="font-semibold">{authorName.trim() || 'Pilgrim'}</span>
                  </div>
                </div>
                <p className="hidden sm:block text-[11px] text-center text-[#8a7762]">
                  Your tablet updates as you write.
                </p>
              </div>

              {/* Right (PC) / below (phone): the form — the wish itself comes first */}
              <div className="space-y-4">
                {/* Prayer text */}
                <div>
                  <label className="block text-xs font-medium text-[#4a3c2e] mb-1">
                    Your wish
                  </label>
                  <textarea
                    required
                    maxLength={140}
                    value={wishText}
                    onChange={(e) => setWishText(e.target.value)}
                    placeholder="Express your true wish for your family, happiness, safe travels, or goals..."
                    className="w-full h-24 sm:h-28 px-3 py-2 bg-[#fffcf6] border border-[#e3d6c0] rounded-lg text-sm text-[#2c241c] placeholder-[#a8967f] focus:outline-none focus:border-[#b45309] resize-none font-sans"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-[#4a3c2e] mb-1">
                    Intention
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setWishCategory(c.id as EmaVotive['wishCategory'])}
                        className={`p-2 text-left rounded-lg text-xs border transition-all cursor-pointer ${
                          wishCategory === c.id
                            ? 'border-[#b45309] bg-[#fbeedd] text-[#7c2d12]'
                            : 'border-[#e3d6c0] bg-[#fffcf6] text-[#6d5b49] hover:border-[#d8c8ae]'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Illustration Motif */}
                <div>
                  <label className="block text-xs font-medium text-[#4a3c2e] mb-1">
                    Carving
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {MOTIFS.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setIllustration(m.id as EmaVotive['illustration'])}
                        className={`p-2 text-center rounded-lg text-xs border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                          illustration === m.id
                            ? 'border-[#b45309] bg-[#fbeedd] text-[#7c2d12]'
                            : 'border-[#e3d6c0] bg-[#fffcf6] text-[#6d5b49] hover:border-[#d8c8ae]'
                        }`}
                      >
                        <span className="text-lg">{m.symbol}</span>
                        <span className="text-[10px]">{m.label.split('(')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

              <div>
                  <label className="block text-xs font-medium text-[#4a3c2e] mb-1">
                    Name on the tablet <span className="font-normal text-[#8a7762]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Kenji, Sarah, Anonymous..."
                    className="w-full px-3 py-2 bg-[#fffcf6] border border-[#e3d6c0] rounded-lg text-sm text-[#2c241c] placeholder-[#a8967f] focus:outline-none focus:border-[#b45309]"
                  />
                </div>
              </div>
            </div>

            {/* Submit stays reachable while scrolling */}
            <div className="sticky bottom-0 -mx-1 px-1 pt-3 pb-1 mt-4 bg-gradient-to-t from-[#fbf7ef] via-[#fbf7ef] to-[#fbf7ef]/0">
              <button
                type="submit"
                disabled={!wishText.trim()}
                className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-[#a3170f] to-[#c2410c] hover:from-[#b91c1c] hover:to-[#c2410c] disabled:opacity-100 disabled:bg-none disabled:bg-[#e4d7bf] disabled:text-[#8a7762] disabled:border-[#d8c8ae] disabled:shadow-none disabled:cursor-not-allowed text-[#fff7e6] border border-[#d6b98c] transition-all shadow-lg hover:shadow-[#b91c1c]/15 cursor-pointer flex items-center justify-center gap-2"
              >
                <PenTool className="w-5 h-5 text-[#fde68a]" />
                <span>Hang your ema (絵馬を奉納)</span>
              </button>
            </div>
          </form>
        )}

        {/* Hung Confirmation */}
        {tab === 'create' && isHung && (
          <div className="text-center py-6 space-y-4 my-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fbeedd] border border-[#c9a26a] text-[#b45309] mb-1">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-cinzel font-semibold text-[#7c2d12]">
              Ema Tablet Hung on Shrine Rack
            </h3>
            <p className="text-xs font-kanji text-[#b45309]">心願成就・神前にて祈念</p>
            <p className="text-sm text-[#4a3c2e] max-w-sm mx-auto leading-relaxed">
              Your prayer is now hung alongside hundreds of pilgrims under the sacred sanctuary eaves, swaying gently in the mountain breeze.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setTab('gallery')}
                className="py-2.5 px-5 rounded-lg bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] text-xs font-medium cursor-pointer"
              >
                View Community Rack
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-lg bg-amber-700 hover:bg-[#b91c1c] text-[#fff7e6] text-xs font-medium cursor-pointer"
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
              <div className="text-center py-12 text-[#8a7762] text-sm">
                No prayers hung at this shrine yet. Be the first to hang an Ema tablet!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shrineEmas.map((ema) => (
                  <div
                    key={ema.id}
                    className="p-3 bg-gradient-to-br from-[#ebd2ad] to-[#d6ab77] text-stone-900 rounded-lg border border-[#e0cfb2] shadow relative"
                  >
                    <div className="flex justify-between items-start mb-1 text-xs">
                      <span className="font-semibold text-stone-800">{ema.authorName}</span>
                      <span className="text-[10px] text-stone-600">{ema.date}</span>
                    </div>
                    <p className="text-xs font-serif italic text-stone-900 line-clamp-3 leading-relaxed mb-2">
                      "{ema.wishText}"
                    </p>
                    <div className="text-[10px] text-amber-900 font-semibold flex justify-between items-center border-t border-[#e0cfb2] pt-1">
                      <span>{CATEGORIES.find((c) => c.id === ema.wishCategory)?.label.split('(')[0]}</span>
                      <span>{MOTIFS.find((m) => m.id === ema.illustration)?.symbol}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
    </Sheet>
  );
};
