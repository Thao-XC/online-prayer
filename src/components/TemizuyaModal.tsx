import React, { useState } from 'react';
import { Sheet } from './ui/Sheet';
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
    <Sheet onClose={onClose} size="md" label="Temizuya purification" className="p-6 sm:p-8">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e3f1f2] border border-[#a9cfd3] text-[#0e7490] mb-3 shadow-inner">
            <Droplets className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-cinzel font-semibold tracking-wide text-[#2c241c]">
            Temizuya Purification
          </h2>
          <p className="text-xs text-[#b45309] font-kanji mt-1 tracking-widest">
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
                        : 'bg-[#ece2cf]'
                    }`}
                  />
                  <span className="text-[10px] text-[#6d5b49] mt-1">Step {idx + 1}</span>
                </div>
              ))}
            </div>

            {/* Instruction Card */}
            <div className="bg-[#fffcf6] border border-[#e3d6c0] rounded-xl p-5 mb-6 text-center">
              <span className="text-xs font-kanji text-[#b45309] px-2.5 py-0.5 rounded-full bg-[#fbeedd] border border-[#e0cfb2] inline-block mb-2">
                {stepInfo.japanese}
              </span>
              <h3 className="text-lg font-medium text-[#2c241c] mb-2 font-cinzel">
                {stepInfo.title}
              </h3>
              <p className="text-sm text-[#4a3c2e] leading-relaxed font-sans">
                {stepInfo.instruction}
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={handleAction}
              disabled={isPouring}
              className={`w-full py-3.5 px-6 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${
                isPouring
                  ? 'bg-[#d4ebee] text-[#0e7490] border border-[#a9cfd3]'
                  : 'bg-gradient-to-r from-[#a3170f] to-[#c2410c] hover:from-[#b91c1c] hover:to-[#c2410c] text-[#fff7e6] border border-[#d6b98c] hover:shadow-[#b91c1c]/15 cursor-pointer active:scale-[0.98]'
              }`}
            >
              <Droplets className={`w-5 h-5 ${isPouring ? 'animate-bounce text-[#0e7490]' : ''}`} />
              <span>{isPouring ? 'Pouring Pure Spring Water...' : stepInfo.buttonLabel}</span>
            </button>
          </div>
        ) : (
          /* Completion State */
          <div className="text-center py-4 space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#e6f3ea] border border-[#9ccbb0] text-[#15803d] mb-1">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-cinzel font-semibold text-[#15803d]">
              Mind & Body Purified
            </h3>
            <p className="text-xs font-kanji text-[#15803d]">心身清浄・身を清め完了</p>
            <p className="text-sm text-[#4a3c2e] max-w-sm mx-auto leading-relaxed">
              You are now purified and prepared to approach the sacred sanctuary. Proceed with a humble and clear heart.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full py-3 px-6 rounded-xl bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] border border-[#d8c8ae] font-medium transition-colors cursor-pointer"
            >
              Proceed to Sanctuary
            </button>
          </div>
        )}
    </Sheet>
  );
};
