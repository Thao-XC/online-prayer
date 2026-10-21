import React, { useState } from 'react';
import { soundService } from '../services/soundService';
import { ShrineData, OmikujiFortune, OmikujiRank } from '../types/shrine';
import { SAMPLE_FORTUNES } from '../data/shrinesData';
import confetti from 'canvas-confetti';
import { Scroll, Sparkles, Bookmark, Check, X } from 'lucide-react';

interface OmikujiModalProps {
  shrine: ShrineData;
  onClose: () => void;
  onSaveFortune: (fortune: OmikujiFortune) => void;
}

export const OmikujiModal: React.FC<OmikujiModalProps> = ({
  shrine,
  onClose,
  onSaveFortune,
}) => {
  const [phase, setPhase] = useState<'shake' | 'shaking' | 'revealed'>('shake');
  const [fortune, setFortune] = useState<OmikujiFortune | null>(null);
  const [actionDone, setActionDone] = useState<'tied' | 'kept' | null>(null);
  const [isAiMode, setIsAiMode] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [userName, setUserName] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleShakeCanister = async () => {
    setPhase('shaking');
    soundService.playOmikujiShake();

    if (isAiMode && userQuestion.trim()) {
      setIsAiLoading(true);
      try {
        const res = await fetch('/api/generate-omikuji', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shrineName: shrine.name,
            userName: userName.trim() || 'Pilgrim',
            userQuestion: userQuestion.trim(),
            wishCategory: 'life guidance',
          }),
        });
        const aiData = await res.json();
        const drawnFortune: OmikujiFortune = {
          id: `omi-ai-${Date.now()}`,
          number: Math.floor(Math.random() * 50) + 1,
          rank: (aiData.rank as OmikujiRank) || 'Dai-kichi (大吉 - Great Blessing)',
          poem: aiData.poem || 'Golden light washes across sacred gates, illuminating your chosen path.',
          generalMeaning: aiData.generalMeaning || 'Auspicious winds favor your honest devotion.',
          wishes: aiData.wishes || 'Will bear fruit through steady effort.',
          health: aiData.health || 'Sound and peaceful.',
          relationships: aiData.relationships || 'Harmonious understanding.',
          studiesWork: aiData.studiesWork || 'Remarkable inspiration awaits.',
          travel: aiData.travel || 'Safe journeys with blessed encounters.',
          luckyColor: aiData.luckyColor || 'Vermilion & Gold',
          luckyDirection: aiData.luckyDirection || 'South',
          shrineId: shrine.id,
          shrineName: shrine.name,
          date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
        };

        setFortune(drawnFortune);
        setPhase('revealed');
        soundService.playFuurin();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#ef4444', '#f59e0b', '#ffffff'],
        });
      } catch (err) {
        console.error(err);
        fallbackRandomDraw();
      } finally {
        setIsAiLoading(false);
      }
      return;
    }

    fallbackRandomDraw();
  };

  const fallbackRandomDraw = () => {
    setTimeout(() => {
      // Pick random sample
      const randomBase = SAMPLE_FORTUNES[Math.floor(Math.random() * SAMPLE_FORTUNES.length)];
      const drawnFortune: OmikujiFortune = {
        ...randomBase,
        id: `omi-${Date.now()}`,
        number: Math.floor(Math.random() * 50) + 1,
        shrineId: shrine.id,
        shrineName: shrine.name,
        date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      };

      setFortune(drawnFortune);
      setPhase('revealed');
      soundService.playFuurin();

      if (drawnFortune.rank.startsWith('Dai-kichi')) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#ef4444', '#f59e0b', '#ffffff'],
        });
      }
    }, 1400);
  };

  const handleTieToFence = () => {
    soundService.playFootstep();
    setActionDone('tied');
  };

  const handleKeepFortune = () => {
    if (fortune) {
      onSaveFortune(fortune);
      soundService.playZenTone(3);
      setActionDone('kept');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-900/40 rounded-2xl shadow-2xl p-6 text-stone-100 overflow-hidden max-h-[92vh] flex flex-col">
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

        {/* Title */}
        <div className="text-center mb-4 shrink-0">
          <span className="text-xs uppercase tracking-widest text-amber-500/90 font-medium">
            Sacred Divination
          </span>
          <h2 className="text-xl sm:text-2xl font-cinzel font-semibold text-amber-100 mt-0.5">
            Draw Sacred Omikuji (おみくじ)
          </h2>
          <p className="text-xs text-stone-400 font-kanji">
            {shrine.name}・神託神意
          </p>
        </div>

        {/* Canister Shake View */}
        {(phase === 'shake' || phase === 'shaking') && (
          <div className="py-4 text-center space-y-4 flex-1 flex flex-col justify-center items-center overflow-y-auto">
            {/* Draw Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-950/80 rounded-xl border border-stone-800 text-xs">
              <button
                type="button"
                onClick={() => setIsAiMode(false)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  !isAiMode ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Traditional Draw (伝統)
              </button>
              <button
                type="button"
                onClick={() => setIsAiMode(true)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  isAiMode ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Personalized Oracle (神託)</span>
              </button>
            </div>

            {/* AI Custom Question Form if in AI Mode */}
            {isAiMode && (
              <div className="w-full max-w-sm p-3 bg-stone-950/90 border border-stone-800 rounded-xl space-y-2 text-left">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-1/3 px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Your Question, Hope, or Dilemma..."
                    className="flex-1 px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <p className="text-[10px] text-stone-400">
                  The AI Oracle will compose a custom Waka poem and tailored divine guidance for you.
                </p>
              </div>
            )}

            {/* Wooden Cylindrical Canister Visual */}
            <div
              className={`relative w-24 h-40 bg-gradient-to-b from-amber-800 via-amber-900 to-stone-950 rounded-2xl border-2 border-amber-600/50 shadow-2xl flex flex-col items-center justify-between p-3 transition-transform ${
                phase === 'shaking' ? 'animate-bounce rotate-6' : ''
              }`}
            >
              <div className="w-14 h-2.5 bg-stone-950 rounded-full border border-amber-500/40" />
              <div className="font-kanji font-bold text-amber-200 text-base writing-vertical tracking-widest">
                御神籤
              </div>
              <div className="w-7 h-2 bg-stone-950 rounded-full" />
            </div>

            <p className="text-xs text-stone-300 max-w-xs">
              {isAiMode
                ? 'Enter your intention above, then shake the canister to receive divine personal counsel.'
                : 'Focus your heart upon your question, then shake the wooden cylinder to draw your fortune stick.'}
            </p>

            <button
              onClick={handleShakeCanister}
              disabled={phase === 'shaking' || isAiLoading}
              className="w-full max-w-xs py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 border border-amber-600/40 transition-all shadow-lg hover:shadow-amber-900/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Scroll className="w-5 h-5 text-amber-300" />
              <span>
                {phase === 'shaking' || isAiLoading
                  ? isAiMode
                    ? 'Receiving Divine Oracle...'
                    : 'Rattling Canister...'
                  : isAiMode
                  ? 'Consult AI Oracle & Draw Stick'
                  : 'Shake & Draw Fortune Stick'}
              </span>
            </button>
          </div>
        )}

        {/* Revealed Fortune Scroll */}
        {phase === 'revealed' && fortune && (
          <div className="overflow-y-auto space-y-4 pr-1 flex-1">
            {/* Traditional Paper Scroll Frame */}
            <div className="bg-[#fcfaf2] text-stone-900 p-5 rounded-xl border border-amber-300 shadow-inner relative">
              {/* Paper Watermark stamp */}
              <div className="absolute top-4 right-4 border-2 border-red-600/70 text-red-700 px-2.5 py-1 text-xs font-kanji font-bold rounded">
                第{fortune.number}番
              </div>

              {/* Fortune Rank Header */}
              <div className="text-center pb-3 border-b border-stone-300">
                <div className="text-2xl font-bold font-kanji text-red-700">
                  {fortune.rank.split('(')[0].trim()}
                </div>
                <div className="text-xs font-semibold uppercase text-stone-600 tracking-wider font-cinzel mt-0.5">
                  {fortune.rank}
                </div>
              </div>

              {/* Poetic Inscription */}
              <div className="my-4 p-3 bg-amber-50/70 rounded-lg border-l-4 border-amber-600 text-stone-800 text-sm italic font-serif leading-relaxed">
                "{fortune.poem}"
              </div>

              {/* General Meaning */}
              <div className="text-xs text-stone-700 mb-4 font-sans leading-relaxed">
                <span className="font-semibold text-stone-900">Oracle Insight: </span>
                {fortune.generalMeaning}
              </div>

              {/* Divination Aspects Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-stone-200">
                <div className="p-2 bg-white/70 rounded border border-stone-200">
                  <span className="font-semibold text-amber-800 font-kanji">願望 (Wishes):</span>
                  <p className="text-stone-700 mt-0.5">{fortune.wishes}</p>
                </div>
                <div className="p-2 bg-white/70 rounded border border-stone-200">
                  <span className="font-semibold text-amber-800 font-kanji">健康 (Health):</span>
                  <p className="text-stone-700 mt-0.5">{fortune.health}</p>
                </div>
                <div className="p-2 bg-white/70 rounded border border-stone-200">
                  <span className="font-semibold text-amber-800 font-kanji">縁談 (Love):</span>
                  <p className="text-stone-700 mt-0.5">{fortune.relationships}</p>
                </div>
                <div className="p-2 bg-white/70 rounded border border-stone-200">
                  <span className="font-semibold text-amber-800 font-kanji">学問・事業 (Work):</span>
                  <p className="text-stone-700 mt-0.5">{fortune.studiesWork}</p>
                </div>
              </div>

              {/* Auspicious Color & Direction */}
              <div className="mt-3 text-center text-xs text-stone-600 flex justify-around bg-stone-100/80 p-2 rounded">
                <span>🍀 Lucky Color: <strong className="text-stone-800">{fortune.luckyColor}</strong></span>
                <span>🧭 Auspicious Direction: <strong className="text-stone-800">{fortune.luckyDirection}</strong></span>
              </div>
            </div>

            {/* Actions: Tie or Keep */}
            {!actionDone ? (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTieToFence}
                  className="py-3 px-3 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  <div className="font-semibold">Tie to Shrine Fence</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">結び所に結ぶ (Entrust to Kami)</div>
                </button>
                <button
                  type="button"
                  onClick={handleKeepFortune}
                  className="py-3 px-3 rounded-xl border border-amber-600/40 bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  <div className="font-semibold">Save to Collection</div>
                  <div className="text-[10px] text-amber-400/80 mt-0.5">お守りとして保存 (Keep as Talisman)</div>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 bg-stone-950/70 border border-stone-800 rounded-xl p-3">
                <div className="text-sm font-semibold text-amber-300 flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {actionDone === 'tied'
                    ? 'Fortune tied onto the sacred shrine fence with prayer.'
                    : 'Fortune preserved in your personal pilgrimage collection!'}
                </div>
                <button
                  onClick={onClose}
                  className="mt-3 w-full py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium"
                >
                  Return to Exploration
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
