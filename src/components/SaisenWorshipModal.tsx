import React, { useState } from 'react';
import { soundService } from '../services/soundService';
import { ShrineData } from '../types/shrine';
import confetti from 'canvas-confetti';
import { Coins, Bell, Sparkles, HeartHandshake, X } from 'lucide-react';

interface SaisenWorshipModalProps {
  shrine: ShrineData;
  onClose: () => void;
  onWorshipComplete: () => void;
}

export const SaisenWorshipModal: React.FC<SaisenWorshipModalProps> = ({
  shrine,
  onClose,
  onWorshipComplete,
}) => {
  const isTemple = shrine.type === 'temple';
  const [step, setStep] = useState<'coin' | 'bell' | 'bow_clap' | 'prayer' | 'done'>('coin');
  const [coinType, setCoinType] = useState<'5yen' | '100yen'>('5yen');
  const [prayerText, setPrayerText] = useState('');
  const [bowCount, setBowCount] = useState(0);
  const [clapCount, setClapCount] = useState(0);

  // 1. Toss Coin
  const handleTossCoin = () => {
    soundService.playCoinToss();
    setTimeout(() => {
      setStep('bell');
    }, 600);
  };

  // 2. Ring Bell / Strike Gong
  const handleRingBell = () => {
    if (isTemple) {
      soundService.playTempleGong();
    } else {
      soundService.playSuzuBell();
    }
    setTimeout(() => {
      setStep('bow_clap');
    }, 1200);
  };

  // 3. Shinto Ritual (2 Bows, 2 Claps, 1 Bow) or Temple Gasshō
  const handleBow = () => {
    soundService.playFootstep();
    setBowCount((prev) => prev + 1);
  };

  const handleClap = () => {
    soundService.playClap(1);
    setClapCount((prev) => prev + 1);
  };

  const isRitualFinished = isTemple
    ? bowCount >= 1
    : bowCount >= 2 && clapCount >= 2;

  const handleProceedToPrayer = () => {
    setStep('prayer');
  };

  // 4. Submit silent prayer
  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playFuurin();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ef4444', '#fbbf24', '#ffffff'],
    });
    setStep('done');
    onWorshipComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900 border border-amber-900/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-100 overflow-hidden">
        {/* Top Vermilion Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-amber-500/90 font-medium">
            {isTemple ? 'Buddhist Devotion' : 'Shinto Worship Ritual'}
          </span>
          <h2 className="text-xl sm:text-2xl font-cinzel font-semibold text-amber-100 mt-1">
            {shrine.name}
          </h2>
          <p className="text-xs text-stone-400 font-kanji mt-0.5">
            {isTemple ? '合掌・礼拝（がっしょう・らいはい）' : '二礼・二拍手・一礼（にれい・にはくしゅ・いちれい）'}
          </p>
        </div>

        {/* Step 1: Coin Offering */}
        {step === 'coin' && (
          <div className="space-y-6 text-center">
            <div className="p-5 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 shadow-inner">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-base font-cinzel text-amber-200">
                1. Saisen Coin Offering (賽銭)
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                Tossing a coin into the wooden slatted saisen box releases worldly attachment and creates a spiritual bond (<span className="text-amber-400 italic">Go-en / 御縁</span>) with the sacred.
              </p>

              {/* Coin Options */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCoinType('5yen')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    coinType === '5yen'
                      ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/50'
                      : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                  }`}
                >
                  <div className="text-sm font-semibold text-amber-300">5-Yen Coin (五円)</div>
                  <div className="text-xs text-stone-400 mt-0.5">Traditional "Good Fate & Divine Bond"</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCoinType('100yen')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    coinType === '100yen'
                      ? 'border-amber-500 bg-amber-950/40 ring-1 ring-amber-500/50'
                      : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                  }`}
                >
                  <div className="text-sm font-semibold text-amber-300">100-Yen Coin (百円)</div>
                  <div className="text-xs text-stone-400 mt-0.5">Silver coin of gratitude</div>
                </button>
              </div>
            </div>

            <button
              onClick={handleTossCoin}
              className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 border border-amber-600/40 transition-all shadow-lg hover:shadow-amber-900/30 cursor-pointer"
            >
              Toss Coin into Saisen Box
            </button>
          </div>
        )}

        {/* Step 2: Ring Bell */}
        {step === 'bell' && (
          <div className="space-y-6 text-center">
            <div className="p-5 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 shadow-inner">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-cinzel text-amber-200">
                2. {isTemple ? 'Sound the Sacred Temple Gong' : 'Ring the Suzu Bell (鈴)'}
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed">
                {isTemple
                  ? 'Strike the resonant bronze temple bell to dispel worldly delusions and awaken compassion.'
                  : 'Pull the braided cord to ring the brass bells. The clear vibration purifies evil spirits and greets the kami.'}
              </p>
            </div>

            <button
              onClick={handleRingBell}
              className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 border border-amber-600/40 transition-all shadow-lg hover:shadow-amber-900/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Bell className="w-5 h-5 animate-pulse" />
              <span>{isTemple ? 'Strike Temple Gong' : 'Pull Suzu Bell Rope'}</span>
            </button>
          </div>
        )}

        {/* Step 3: Bow & Clap Ritual */}
        {step === 'bow_clap' && (
          <div className="space-y-6">
            <div className="p-5 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3 text-center">
              <h3 className="text-base font-cinzel text-amber-200">
                3. {isTemple ? 'Solemn Bow & Gasshō (合掌)' : 'Two Bows, Two Claps, One Bow'}
              </h3>
              <p className="text-xs text-amber-400/90 font-kanji">
                {isTemple ? '一礼・合掌（一礼して静かに合掌）' : '二礼 二拍手 一礼'}
              </p>
              <p className="text-sm text-stone-300 leading-relaxed">
                {isTemple
                  ? 'Bow deeply from the waist (90 degrees), then bring your palms together in Gasshō before your chest.'
                  : 'Bowing expresses humble reverence; clapping summons the divine presence and clears the heart.'}
              </p>

              {/* Counter progress */}
              {!isTemple ? (
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-stone-900/70 p-3 rounded-lg border border-stone-800">
                    <div className="text-xs text-stone-400">Deep Bows (二礼)</div>
                    <div className="text-lg font-bold text-amber-300">{Math.min(bowCount, 2)} / 2</div>
                  </div>
                  <div className="bg-stone-900/70 p-3 rounded-lg border border-stone-800">
                    <div className="text-xs text-stone-400">Claps (二拍手)</div>
                    <div className="text-lg font-bold text-amber-300">{Math.min(clapCount, 2)} / 2</div>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-900/70 p-3 rounded-lg border border-stone-800">
                  <div className="text-xs text-stone-400">Deep Bow (一礼)</div>
                  <div className="text-lg font-bold text-amber-300">{Math.min(bowCount, 1)} / 1</div>
                </div>
              )}
            </div>

            {/* Interaction Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleBow}
                className="py-3 px-4 rounded-xl border border-stone-700 bg-stone-800 hover:bg-stone-750 text-stone-200 font-medium transition-colors cursor-pointer"
              >
                Perform Deep Bow 🙇
              </button>
              {!isTemple && (
                <button
                  type="button"
                  onClick={handleClap}
                  className="py-3 px-4 rounded-xl border border-amber-600/40 bg-amber-950/40 hover:bg-amber-900/40 text-amber-200 font-medium transition-colors cursor-pointer"
                >
                  Perform Sacred Clap 👏
                </button>
              )}
            </div>

            {isRitualFinished && (
              <button
                onClick={handleProceedToPrayer}
                className="w-full py-3 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 border border-amber-600/40 transition-all cursor-pointer"
              >
                Make Silent Heartfelt Prayer →
              </button>
            )}
          </div>
        )}

        {/* Step 4: Silent Prayer */}
        {step === 'prayer' && (
          <form onSubmit={handleSubmitPrayer} className="space-y-4">
            <div className="p-5 bg-stone-950/80 border border-stone-800 rounded-xl space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 shadow-inner mx-auto block">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-cinzel text-amber-200 text-center">
                Silent Prayer & Wish (祈願)
              </h3>
              <p className="text-xs text-stone-300 text-center">
                Enshrined: <span className="text-amber-400">{shrine.enshrinedDeityOrBuddha}</span>
              </p>
              <p className="text-xs text-stone-400 text-center">
                Primary Blessing: <span className="text-stone-300">{shrine.primaryBlessing}</span>
              </p>

              <textarea
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                placeholder="Inscribe your personal prayer, gratitude, or intention for health, peace, family, or dreams..."
                className="w-full h-24 p-3 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 border border-amber-600/40 transition-all shadow-lg hover:shadow-amber-900/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Offer Prayer & Final Bow (一礼)</span>
            </button>
          </form>
        )}

        {/* Step 5: Completed */}
        {step === 'done' && (
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-400 mb-1">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-cinzel font-semibold text-amber-200">
              Prayer Received & Dedicated
            </h3>
            <p className="text-xs font-kanji text-amber-400">大願成就・神仏加護</p>
            <p className="text-sm text-stone-300 max-w-sm mx-auto leading-relaxed">
              Your prayers have been received by the kami and guardians of {shrine.name}. May calm, health, and bright auspices follow you always.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-3 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium transition-colors cursor-pointer"
            >
              Return to Sacred Grounds
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
