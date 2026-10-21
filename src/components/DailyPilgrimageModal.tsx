import React, { useState } from 'react';
import { Sheet } from './ui/Sheet';
import { DailyPilgrimageState, DailyMission } from '../types/shrine';
import {
  getTodayOfuda,
  DAILY_OFUDA_COLLECTION,
  DailyOfuda,
} from '../services/dailyPilgrimageService';
import { soundService } from '../services/soundService';
import confetti from 'canvas-confetti';
import {
  Flame,
  CheckCircle2,
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  X,
  Calendar,
} from 'lucide-react';

interface DailyPilgrimageModalProps {
  dailyState: DailyPilgrimageState;
  onClose: () => void;
  onClaimReward: () => void;
  onQuickAction?: (ritualType: DailyMission['ritualType']) => void;
}

export const DailyPilgrimageModal: React.FC<DailyPilgrimageModalProps> = ({
  dailyState,
  onClose,
  onClaimReward,
  onQuickAction,
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'ofuda'>('missions');

  const completedCount = dailyState.missions.filter((m) => m.isCompleted).length;
  const totalCount = dailyState.missions.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isAllComplete = completedCount === totalCount;
  const todayOfuda = getTodayOfuda(dailyState.streakDays);

  const handleClaim = () => {
    soundService.playTempleGong();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#dc2626', '#fbbf24', '#ffffff'],
    });
    onClaimReward();
  };

  const handleAction = (ritualType: DailyMission['ritualType']) => {
    onClose();
    if (onQuickAction) {
      onQuickAction(ritualType);
    }
  };

  return (
    <Sheet onClose={onClose} size="md" label="Daily missions" className="p-5 sm:p-6 flex flex-col">

        {/* Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbeedd] border border-[#c9a26a] text-[#9a3412] text-xs font-semibold mb-1 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-[#b45309] fill-[#ea580c]" />
            <span>
              {dailyState.streakDays} Day Pilgrimage Streak (連続修行)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-[#2c241c]">
            Daily Pilgrimage Missions
          </h2>
          <p className="text-xs text-[#b45309] font-kanji mt-0.5 tracking-wider">
            日々の巡礼修行 • 今日のお札
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'missions'
                  ? 'bg-[#b91c1c] text-white font-bold shadow'
                  : 'bg-[#ece2cf] text-[#6d5b49] hover:text-[#2c241c]'
              }`}
            >
              Today's Rituals ({completedCount}/{totalCount})
            </button>
            <button
              onClick={() => setActiveTab('ofuda')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ofuda'
                  ? 'bg-[#b91c1c] text-white font-bold shadow'
                  : 'bg-[#ece2cf] text-[#6d5b49] hover:text-[#2c241c]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Sacred Talismans ({dailyState.earnedOfudaTitles.length})</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="mb-4 bg-[#fffcf6] p-3 rounded-xl border border-[#e3d6c0] shrink-0">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#4a3c2e] font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#b45309]" />
              <span>{dailyState.dateKey} Daily Progress</span>
            </span>
            <span className="font-mono font-bold text-[#b45309]">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#ece2cf] overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-[#b91c1c] via-[#b91c1c] to-amber-400 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* TAB 1: Today's Ritual Missions List */}
        {activeTab === 'missions' && (
          <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
            {dailyState.missions.map((mission) => {
              return (
                <div
                  key={mission.id}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    mission.isCompleted
                      ? 'bg-[#fbeedd] border-[#9ccbb0]'
                      : 'bg-[#fffcf6] border-[#e3d6c0] hover:border-[#d8c8ae]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Mission Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                        mission.isCompleted
                          ? 'bg-[#e6f3ea] border-[#9ccbb0] text-[#15803d]'
                          : 'bg-[#f6efe2] border-[#d8c8ae] text-[#4a3c2e]'
                      }`}
                    >
                      {mission.icon}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-[#2c241c] leading-snug">
                        {mission.title}
                      </h4>
                      <div className="text-[11px] text-[#b45309] font-kanji leading-snug">
                        {mission.japaneseTitle}
                      </div>
                      <p className="text-[11px] text-[#6d5b49] mt-0.5 line-clamp-1">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Status / Quick Action */}
                  <div className="shrink-0 flex items-center gap-2">
                    {mission.isCompleted ? (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#e6f3ea] border border-[#9ccbb0] text-[#15803d] text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAction(mission.ritualType)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#ece2cf] hover:bg-[#e4d7bf] border border-[#d8c8ae] text-[#7c2d12] text-xs font-medium transition-colors cursor-pointer"
                      >
                        <span className="font-mono text-[11px]">
                          {mission.currentCount}/{mission.targetCount}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#b45309]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Today's Sacred Reward Banner */}
            <div className="mt-4 p-4 rounded-xl border border-[#d6b98c] bg-gradient-to-br from-[#fbeedd] to-[#f1e8d7] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-[#b45309] uppercase tracking-widest font-mono font-semibold">
                  Today's Sacred Talisman of the Day
                </span>
                <h4 className="text-sm font-bold text-[#2c241c] font-cinzel">
                  {todayOfuda.blessing} • {todayOfuda.title}
                </h4>
                <p className="text-xs text-[#6d5b49] mt-0.5">
                  Complete all 5 daily rituals to receive today's sacred seal.
                </p>
              </div>

              {isAllComplete && !dailyState.claimedRewardToday ? (
                <button
                  onClick={handleClaim}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#b91c1c] via-[#c2410c] to-amber-500 text-white font-semibold text-xs border border-[#d9a85c] shadow-lg hover:shadow-[#b91c1c]/15 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-[#fde68a]" />
                  <span>Claim Daily Ofuda</span>
                </button>
              ) : isAllComplete && dailyState.claimedRewardToday ? (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#e6f3ea] border border-[#9ccbb0] text-[#15803d] text-xs font-medium shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#15803d]" />
                  <span>Claimed for Today</span>
                </div>
              ) : (
                <div className="text-xs text-[#8a7762] font-mono shrink-0">
                  {totalCount - completedCount} rituals remaining
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Sacred Ofuda Talismans Collection */}
        {activeTab === 'ofuda' && (
          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            <p className="text-xs text-[#6d5b49] text-center mb-1">
              Consecutive daily pilgrimages bestow sacred Japanese Ofuda talismans inscribed with ancient protective blessings.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DAILY_OFUDA_COLLECTION.map((ofuda, idx) => {
                const isEarned = dailyState.earnedOfudaTitles.includes(ofuda.kanji);

                return (
                  <div
                    key={idx}
                    className={`relative p-4 rounded-xl border flex gap-3.5 transition-all ${
                      isEarned
                        ? 'bg-gradient-to-br from-[#faf4e6] to-[#f0e3c8] text-stone-900 border-[#d9a85c] shadow-md'
                        : 'bg-[#fffcf6] text-[#8a7762] border-[#e3d6c0] opacity-60'
                    }`}
                  >
                    {/* Traditional Ofuda Talisman Paper Shape */}
                    <div
                      className={`w-14 h-24 rounded-t-lg rounded-b-sm border-2 flex flex-col items-center justify-between p-1.5 shrink-0 ${
                        isEarned
                          ? 'border-red-700 bg-white/90 shadow-sm'
                          : 'border-[#d8c8ae] bg-[#f6efe2]'
                      }`}
                    >
                      <div className="w-6 h-1.5 bg-red-700 rounded-full" />
                      <div className="font-kanji font-bold text-red-700 text-sm writing-vertical tracking-widest leading-none">
                        {ofuda.kanji}
                      </div>
                      <div className="text-[8px] font-mono font-bold text-red-700">
                        守護
                      </div>
                    </div>

                    {/* Lore & Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-kanji text-stone-900">
                          {ofuda.kanji}
                        </span>
                        {isEarned && (
                          <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-stone-800 font-cinzel mt-0.5">
                        {ofuda.title}
                      </h4>
                      <p className="text-[11px] text-stone-600 mt-1 leading-snug font-sans">
                        {ofuda.meaning}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#e3d6c0] text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-8 rounded-xl bg-[#ece2cf] hover:bg-[#e4d7bf] text-[#2c241c] text-xs font-medium cursor-pointer"
          >
            Continue Pilgrimage
          </button>
        </div>
    </Sheet>
  );
};
