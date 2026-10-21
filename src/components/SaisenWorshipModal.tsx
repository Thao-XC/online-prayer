import React, { useState } from 'react';
import { Sheet } from './ui/Sheet';
import { soundService } from '../services/soundService';
import { ShrineData } from '../types/shrine';
import confetti from 'canvas-confetti';
import { Coins, Bell, Sparkles, HeartHandshake, X } from 'lucide-react';

interface SaisenWorshipModalProps {
  shrine: ShrineData;
  onClose: () => void;
  onWorshipComplete: () => void;
  /** called if the visitor does something improper (e.g. clapping at a temple) */
  onDisrespect?: (reason: string) => void;
}

export const SaisenWorshipModal: React.FC<SaisenWorshipModalProps> = ({
  shrine,
  onClose,
  onWorshipComplete,
  onDisrespect,
}) => {
  const isTemple = shrine.type === 'temple';
  // Izumo Taisha (and a few others) pray with four claps instead of two
  const clapsNeeded = shrine.id === 'izumo-taisha' ? 4 : 2;
  const [templeClapNote, setTempleClapNote] = useState(false);
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
    : bowCount >= 2 && clapCount >= clapsNeeded;

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
    <Sheet onClose={onClose} size="md" label="Worship" className="p-6 sm:p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-[#b45309] font-medium">
            {isTemple ? 'Buddhist Devotion' : 'Shinto Worship Ritual'}
          </span>
          <h2 className="text-xl sm:text-2xl font-cinzel font-semibold text-[#2c241c] mt-1">
            {shrine.name}
          </h2>
          <p className="text-xs text-[#6d5b49] font-kanji mt-0.5">
            {isTemple ? '合掌・礼拝（がっしょう・らいはい）' : clapsNeeded === 4 ? '二礼・四拍手・一礼（にれい・よんはくしゅ・いちれい）' : '二礼・二拍手・一礼（にれい・にはくしゅ・いちれい）'}
          </p>
        </div>

        {/* Step 1: Coin Offering */}
        {step === 'coin' && (
          <div className="space-y-6 text-center">
            <div className="p-5 bg-[#fffcf6] border border-[#e3d6c0] rounded-xl space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fbeedd] border border-[#c9a26a] text-[#b45309] shadow-inner">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-base font-cinzel text-[#7c2d12]">
                1. Saisen Coin Offering (賽銭)
              </h3>
              <p className="text-sm text-[#4a3c2e] leading-relaxed">
                Tossing a coin into the wooden slatted saisen box releases worldly attachment and creates a spiritual bond (<span className="text-[#b45309] italic">Go-en / 御縁</span>) with the sacred.
              </p>

              {/* Coin Options */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCoinType('5yen')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    coinType === '5yen'
                      ? 'border-[#b45309] bg-[#fbeedd] ring-1 ring-[#b45309]/40'
                      : 'border-[#e3d6c0] bg-[#f6efe2] hover:border-[#d8c8ae]'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#9a3412]">5-Yen Coin (五円)</div>
                  <div className="text-xs text-[#6d5b49] mt-0.5">Traditional "Good Fate & Divine Bond"</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCoinType('100yen')}
                  className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                    coinType === '100yen'
                      ? 'border-[#b45309] bg-[#fbeedd] ring-1 ring-[#b45309]/40'
                      : 'border-[#e3d6c0] bg-[#f6efe2] hover:border-[#d8c8ae]'
                  }`}
                >
                  <div className="text-sm font-semibold text-[#9a3412]">100-Yen Coin (百円)</div>
                  <div className="text-xs text-[#6d5b49] mt-0.5">Silver coin of gratitude</div>
                </button>
              </div>
            </div>

            <button
              onClick={handleTossCoin}
              className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-[#a3170f] to-[#c2410c] hover:from-[#b91c1c] hover:to-[#c2410c] text-[#fff7e6] border border-[#d6b98c] transition-all shadow-lg hover:shadow-[#b91c1c]/15 cursor-pointer"
            >
              Toss Coin into Saisen Box
            </button>
          </div>
        )}

        {/* Step 2: Ring Bell */}
        {step === 'bell' && (
          <div className="space-y-6 text-center">
            <div className="p-5 bg-[#fffcf6] border border-[#e3d6c0] rounded-xl space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fbeedd] border border-[#c9a26a] text-[#b45309] shadow-inner">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-base font-cinzel text-[#7c2d12]">
                2. {isTemple ? 'Sound the Sacred Temple Gong' : 'Ring the Suzu Bell (鈴)'}
              </h3>
              <p className="text-sm text-[#4a3c2e] leading-relaxed">
                {isTemple
                  ? 'Strike the resonant bronze temple bell to dispel worldly delusions and awaken compassion.'
                  : 'Pull the braided cord to ring the brass bells. The clear vibration purifies evil spirits and greets the kami.'}
              </p>
            </div>

            <button
              onClick={handleRingBell}
              className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-[#a3170f] to-[#c2410c] hover:from-[#b91c1c] hover:to-[#c2410c] text-[#fff7e6] border border-[#d6b98c] transition-all shadow-lg hover:shadow-[#b91c1c]/15 cursor-pointer flex items-center justify-center gap-2"
            >
              <Bell className="w-5 h-5 animate-pulse" />
              <span>{isTemple ? 'Strike Temple Gong' : 'Pull Suzu Bell Rope'}</span>
            </button>
          </div>
        )}

        {/* Step 3: Bow & Clap Ritual */}
        {step === 'bow_clap' && (
          <div className="space-y-6">
            <div className="p-5 bg-[#fffcf6] border border-[#e3d6c0] rounded-xl space-y-3 text-center">
              <h3 className="text-base font-cinzel text-[#7c2d12]">
                3. {isTemple ? 'Solemn Bow & Gasshō (合掌)' : clapsNeeded === 4 ? 'Two Bows, Four Claps, One Bow' : 'Two Bows, Two Claps, One Bow'}
              </h3>
              <p className="text-xs text-[#b45309] font-kanji">
                {isTemple ? '一礼・合掌（一礼して静かに合掌）' : clapsNeeded === 4 ? '二礼 四拍手 一礼 ・ 出雲大社の作法' : '二礼 二拍手 一礼'}
              </p>
              <p className="text-sm text-[#4a3c2e] leading-relaxed">
                {isTemple
                  ? 'Bow deeply from the waist (90 degrees), then bring your palms together in Gasshō before your chest.'
                  : 'Bowing expresses humble reverence; clapping summons the divine presence and clears the heart.'}
              </p>

              {/* Counter progress */}
              {!isTemple ? (
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-[#f6efe2] p-3 rounded-lg border border-[#e3d6c0]">
                    <div className="text-xs text-[#6d5b49]">Deep Bows (二礼)</div>
                    <div className="text-lg font-bold text-[#9a3412]">{Math.min(bowCount, 2)} / 2</div>
                  </div>
                  <div className="bg-[#f6efe2] p-3 rounded-lg border border-[#e3d6c0]">
                    <div className="text-xs text-[#6d5b49]">Claps ({clapsNeeded === 4 ? '四拍手' : '二拍手'})</div>
                    <div className="text-lg font-bold text-[#9a3412]">{Math.min(clapCount, clapsNeeded)} / {clapsNeeded}</div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#f6efe2] p-3 rounded-lg border border-[#e3d6c0]">
                  <div className="text-xs text-[#6d5b49]">Deep Bow (一礼)</div>
                  <div className="text-lg font-bold text-[#9a3412]">{Math.min(bowCount, 1)} / 1</div>
                </div>
              )}
            </div>

            {/* Interaction Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleBow}
                className="py-3 px-4 rounded-xl border border-[#d8c8ae] bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] font-medium transition-colors cursor-pointer"
              >
                Perform Deep Bow 🙇
              </button>
              {isTemple ? (
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClap(1);
                    if (!templeClapNote) onDisrespect?.('Clapped at a Buddhist temple. Here you join your palms quietly instead.');
                    setTempleClapNote(true);
                  }}
                  className="py-3 px-4 rounded-xl border border-[#d8c8ae] bg-[#fffcf6] hover:bg-[#f6efe2] text-[#4a3c2e] font-medium transition-colors cursor-pointer"
                >
                  Clap 👏
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClap}
                  className="py-3 px-4 rounded-xl border border-[#d6b98c] bg-[#fbeedd] hover:bg-[#fbeedd] text-[#7c2d12] font-medium transition-colors cursor-pointer"
                >
                  Perform Sacred Clap 👏
                </button>
              )}
            </div>
            {templeClapNote && (
              <p className="text-[13px] text-[#9a3412] bg-[#fdecea] border border-[#e8b4a8] rounded-xl px-3 py-2">
                At Buddhist temples you don't clap. Bow, then press your palms together quietly (gasshō).
              </p>
            )}

            {isRitualFinished && (
              <button
                onClick={handleProceedToPrayer}
                className="w-full py-3 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-[#a3170f] to-[#c2410c] hover:from-[#b91c1c] hover:to-[#c2410c] text-[#fff7e6] border border-[#d6b98c] transition-all cursor-pointer"
              >
                Make Silent Heartfelt Prayer →
              </button>
            )}
          </div>
        )}

        {/* Step 4: Silent Prayer */}
        {step === 'prayer' && (
          <form onSubmit={handleSubmitPrayer} className="space-y-4">
            <div className="p-5 bg-[#fffcf6] border border-[#e3d6c0] rounded-xl space-y-3">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#fbeedd] border border-[#c9a26a] text-[#b45309] shadow-inner mx-auto block">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-cinzel text-[#7c2d12] text-center">
                Silent Prayer & Wish (祈願)
              </h3>
              <p className="text-xs text-[#4a3c2e] text-center">
                Enshrined: <span className="text-[#b45309]">{shrine.enshrinedDeityOrBuddha}</span>
              </p>
              <p className="text-xs text-[#6d5b49] text-center">
                Primary Blessing: <span className="text-[#4a3c2e]">{shrine.primaryBlessing}</span>
              </p>

              <textarea
                value={prayerText}
                onChange={(e) => setPrayerText(e.target.value)}
                placeholder="Inscribe your personal prayer, gratitude, or intention for health, peace, family, or dreams..."
                className="w-full h-24 p-3 bg-[#f6efe2] border border-[#d8c8ae] rounded-lg text-sm text-[#2c241c] placeholder-[#a8967f] focus:outline-none focus:border-[#b45309] resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl font-medium tracking-wide bg-gradient-to-r from-[#a3170f] to-[#c2410c] hover:from-[#b91c1c] hover:to-[#c2410c] text-[#fff7e6] border border-[#d6b98c] transition-all shadow-lg hover:shadow-[#b91c1c]/15 cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-[#fde68a]" />
              <span>Offer Prayer & Final Bow (一礼)</span>
            </button>
          </form>
        )}

        {/* Step 5: Completed */}
        {step === 'done' && (
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fbeedd] border border-[#c9a26a] text-[#b45309] mb-1">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-cinzel font-semibold text-[#7c2d12]">
              Prayer Received & Dedicated
            </h3>
            <p className="text-xs font-kanji text-[#b45309]">大願成就・神仏加護</p>
            <p className="text-sm text-[#4a3c2e] max-w-sm mx-auto leading-relaxed">
              Your prayers have been received by the kami and guardians of {shrine.name}. May calm, health, and bright auspices follow you always.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-3 px-6 rounded-xl bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] border border-[#d8c8ae] font-medium transition-colors cursor-pointer"
            >
              Return to Sacred Grounds
            </button>
          </div>
        )}
    </Sheet>
  );
};
