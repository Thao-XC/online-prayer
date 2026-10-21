import React, { useState } from 'react';
import { soundService } from '../services/soundService';
import { Droplets, CheckCircle2, X } from 'lucide-react';

interface TemizuyaModalProps {
  onClose: () => void;
  onPurified: () => void;
}

const STEPS = [
  {
    title: 'Cleanse Left Hand',
    japanese: '左手を清める',
    instruction: 'Hold the wooden ladle (hishaku) with your right hand. Scoop fresh mountain water and gently pour over your left hand to cleanse worldly actions.',
    buttonLabel: 'Pour over Left Hand',
  },
  {
    title: 'Cleanse Right Hand',
    japanese: '右手を清める',
    instruction: 'Switch the ladle to your left hand. Gently pour water over your right hand to purify deeds and intention.',
    buttonLabel: 'Pour over Right Hand',
  },
  {
    title: 'Rinse Mouth',
    japanese: '口をすすぐ',
    instruction: 'Switch the ladle back to your right hand. Pour water into your cupped left palm (never drink directly from the ladle) and rinse your mouth to purify speech.',
    buttonLabel: 'Rinse Mouth & Mind',
  },
  {
    title: 'Cleanse the Ladle Handle',
    japanese: '柄杓を清める',
    instruction: 'Tilt the ladle vertically so the remaining fresh water cascades down the handle, washing it clean for the next pilgrim.',
    buttonLabel: 'Tilt Ladle & Complete',
  },
];

export const TemizuyaModal: React.FC<TemizuyaModalProps> = ({ onClose, onPurified }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPouring, setIsPouring] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleAction = () => {
    setIsPouring(true);
    soundService.playTemizuWater();

    setTimeout(() => {
      setIsPouring(false);
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsCompleted(true);
        soundService.playFuurin();
        onPurified();
      }
    }, 1100);
  };

  const stepInfo = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-stone-900/95 border border-amber-900/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-stone-100 overflow-hidden">
        {/* Subtle decorative vermilion header strip */}
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 mb-3 shadow-inner">
            <Droplets className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-cinzel font-semibold tracking-wide text-amber-100">
            Temizuya Purification
          </h2>
          <p className="text-xs text-amber-500/80 font-kanji mt-1 tracking-widest">
            手水舎（てみずや）の作法
          </p>
        </div>

        {!isCompleted ? (
          <div>
            {/* Step Progress Indicators */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {STEPS.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                      idx < currentStep
                        ? 'bg-cyan-500'
                        : idx === currentStep
                        ? 'bg-amber-400'
                        : 'bg-stone-800'
                    }`}
                  />
                  <span className="text-[10px] text-stone-400 mt-1">Step {idx + 1}</span>
                </div>
              ))}
            </div>

            {/* Instruction Card */}
            <div className="bg-stone-950/80 border border-stone-800 rounded-xl p-5 mb-6 text-center">
              <span className="text-xs font-kanji text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-800/40 inline-block mb-2">
                {stepInfo.japanese}
              </span>
              <h3 className="text-lg font-medium text-stone-100 mb-2 font-cinzel">
                {stepInfo.title}
              </h3>
              <p className="text-sm text-stone-300 leading-relaxed font-sans">
                {stepInfo.instruction}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAction}
              disabled={isPouring}
              className={`w-full py-3.5 px-6 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${
                isPouring
                  ? 'bg-cyan-900/60 text-cyan-200 border border-cyan-500/30'
                  : 'bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-600 hover:to-amber-600 text-amber-100 border border-amber-600/40 hover:shadow-amber-900/30 cursor-pointer active:scale-[0.98]'
              }`}
            >
              <Droplets className={`w-5 h-5 ${isPouring ? 'animate-bounce text-cyan-300' : ''}`} />
              <span>{isPouring ? 'Pouring Pure Spring Water...' : stepInfo.buttonLabel}</span>
            </button>
          </div>
        ) : (
          /* Completion State */
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 mb-1">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-cinzel font-semibold text-emerald-200">
              Mind & Body Purified
            </h3>
            <p className="text-xs font-kanji text-emerald-400">心身清浄・身を清め完了</p>
            <p className="text-sm text-stone-300 max-w-sm mx-auto leading-relaxed">
              You are now purified and prepared to approach the sacred sanctuary. Proceed with a humble and clear heart.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-3 px-6 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium transition-colors cursor-pointer"
            >
              Proceed to Sanctuary
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
