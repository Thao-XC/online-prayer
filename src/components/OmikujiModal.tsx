import React, { useState } from 'react';
import { Sheet } from './ui/Sheet';
import { soundService } from '../services/soundService';
import { ShrineData, OmikujiFortune, OmikujiRank } from '../types/shrine';
import { SAMPLE_FORTUNES } from '../data/shrinesData';
import confetti from 'canvas-confetti';
import { Scroll, Sparkles, Bookmark, Check, X } from 'lucide-react';

interface OmikujiModalProps {
  shrine: ShrineData;
  onClose: () => void;
  onSaveFortune: (fortune: OmikujiFortune) => void;
  /** 0–100: higher luck tilts the draw toward better fortunes */
  luck?: number;
}

export const OmikujiModal: React.FC<OmikujiModalProps> = ({
  shrine,
  onClose,
  onSaveFortune,
  luck = 50,
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
      // Luck tilts the odds: rank 0 (大吉) gains weight as luck rises, 凶 loses it
      const order = ['Dai-kichi', 'Chū-kichi', 'Shō-kichi', 'Kichi', 'Sue-kichi', 'Kyō'];
      const tilt = (luck - 50) / 50;
      const weights = SAMPLE_FORTUNES.map((f) => {
        const r = Math.max(0, order.findIndex((o) => f.rank.startsWith(o)));
        return Math.exp(tilt * (2.5 - r) * 0.6);
      });
      let pick = Math.random() * weights.reduce((a, b) => a + b, 0);
      let idx = 0;
      while (idx < weights.length - 1 && pick > weights[idx]) pick -= weights[idx++];
      const randomBase = SAMPLE_FORTUNES[idx];
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
    <Sheet onClose={onClose} size="md" label="Omikuji" className="p-6 flex flex-col">

        {/* Title */}
        <div className="text-center mb-4 shrink-0">
          <span className="text-xs uppercase tracking-widest text-[#b45309] font-medium">
            Sacred Divination
          </span>
          <h2 className="text-xl sm:text-2xl font-cinzel font-semibold text-[#2c241c] mt-0.5">
            Draw Sacred Omikuji (おみくじ)
          </h2>
          <p className="text-xs text-[#6d5b49] font-kanji">
            {shrine.name}・神託神意
          </p>
        </div>

        {/* Canister Shake View */}
        {(phase === 'shake' || phase === 'shaking') && (
          <div className="py-4 text-center space-y-4 flex-1 flex flex-col justify-center items-center overflow-y-auto">
            {/* Draw Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-[#fffcf6] rounded-xl border border-[#e3d6c0] text-xs">
              <button
                type="button"
                onClick={() => setIsAiMode(false)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  !isAiMode ? 'bg-[#b91c1c] text-white font-bold' : 'text-[#6d5b49] hover:text-[#2c241c]'
                }`}
              >
                <span className="sm:hidden">Traditional</span>
                <span className="hidden sm:inline">Traditional Draw (伝統)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAiMode(true)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  isAiMode ? 'bg-gradient-to-r from-[#b91c1c] to-[#c2410c] text-white font-bold' : 'text-[#6d5b49] hover:text-[#2c241c]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#9a3412]" />
                <span className="sm:hidden">AI Oracle</span>
                <span className="hidden sm:inline">AI Personalized Oracle (神託)</span>
              </button>
            </div>

            {/* AI Custom Question Form if in AI Mode */}
            {isAiMode && (
              <div className="w-full max-w-sm p-3 bg-[#fffcf6] border border-[#e3d6c0] rounded-xl space-y-2 text-left">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your Name (Optional)"
                    className="w-1/3 px-2.5 py-1.5 bg-[#f6efe2] border border-[#d8c8ae] rounded-lg text-xs text-[#2c241c] placeholder-[#a8967f] focus:outline-none focus:border-[#b45309]"
                  />
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder="Your Question, Hope, or Dilemma..."
                    className="flex-1 px-2.5 py-1.5 bg-[#f6efe2] border border-[#d8c8ae] rounded-lg text-xs text-[#2c241c] placeholder-[#a8967f] focus:outline-none focus:border-[#b45309]"
                  />
                </div>
                <p className="text-[10px] text-[#6d5b49]">
                  The AI Oracle will compose a custom Waka poem and tailored divine guidance for you.
                </p>
              </div>
            )}

            {/* Wooden Cylindrical Canister Visual */}
            <div
              className={`relative w-24 h-40 bg-gradient-to-b from-[#a83a1a] via-[#7c2410] to-[#4a160a] rounded-2xl border-2 border-[#c9a26a] shadow-2xl flex flex-col items-center justify-between p-3 transition-transform ${
                phase === 'shaking' ? 'animate-bounce rotate-6' : ''
              }`}
            >
              <div className="w-14 h-2.5 bg-[#2c1208] rounded-full border border-[#c9a26a]" />
              <div className="font-kanji font-bold text-[#fde68a] text-base writing-vertical [writing-mode:vertical-rl] tracking-widest">
                御神籤
              </div>
              <div className="w-7 h-2 bg-[#fffcf6] rounded-full" />
            </div>

            <p className="text-xs text-[#4a3c2e] max-w-xs">
              {isAiMode
                ? 'Enter your intention above, then shake the canister to receive divine personal counsel.'
                : 'Focus your heart upon your question, then shake the wooden cylinder to draw your fortune stick.'}
            </p>

            <button
              onClick={handleShakeCanister}
              disabled={phase === 'shaking' || isAiLoading}
              className="w-full max-w-xs py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-[#a3170f] to-[#c2410c] hover:from-[#b91c1c] hover:to-[#c2410c] text-[#fff7e6] border border-[#d6b98c] transition-all shadow-lg hover:shadow-[#b91c1c]/15 cursor-pointer flex items-center justify-center gap-2"
            >
              <Scroll className="w-5 h-5 text-[#fde68a]" />
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
            <div className="bg-[#fcfaf2] text-stone-900 p-5 rounded-xl border border-[#d9a85c] shadow-inner relative">
              {/* Paper Watermark stamp */}
              <div className="absolute top-4 right-4 border-2 border-[#d98f80] text-red-700 px-2.5 py-1 text-xs font-kanji font-bold rounded">
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
              <div className="my-4 p-3 bg-amber-50/70 rounded-lg border-l-4 border-[#b45309] text-stone-800 text-sm italic font-serif leading-relaxed">
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
                  className="py-3 px-3 rounded-xl border border-[#d8c8ae] bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  <div className="font-semibold">Tie to Shrine Fence</div>
                  <div className="text-[10px] text-[#6d5b49] mt-0.5">結び所に結ぶ (Entrust to Kami)</div>
                </button>
                <button
                  type="button"
                  onClick={handleKeepFortune}
                  className="py-3 px-3 rounded-xl border border-[#d6b98c] bg-[#fbeedd] hover:bg-[#fbeedd] text-[#7c2d12] text-xs font-medium transition-colors cursor-pointer text-center"
                >
                  <div className="font-semibold">Save to Collection</div>
                  <div className="text-[10px] text-[#b45309] mt-0.5">お守りとして保存 (Keep as Talisman)</div>
                </button>
              </div>
            ) : (
              <div className="text-center py-2 bg-[#fffcf6] border border-[#e3d6c0] rounded-xl p-3">
                <div className="text-sm font-semibold text-[#9a3412] flex items-center justify-center gap-1.5">
                  <Check className="w-4 h-4 text-[#15803d]" />
                  {actionDone === 'tied'
                    ? 'Fortune tied onto the sacred shrine fence with prayer.'
                    : 'Fortune preserved in your personal pilgrimage collection!'}
                </div>
                <button
                  onClick={onClose}
                  className="mt-3 w-full py-2.5 rounded-lg bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] text-xs font-medium"
                >
                  Return to Exploration
                </button>
              </div>
            )}
          </div>
        )}
    </Sheet>
  );
};
