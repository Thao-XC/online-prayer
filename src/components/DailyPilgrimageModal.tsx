import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-900/40 rounded-2xl shadow-2xl p-5 sm:p-6 text-stone-100 overflow-hidden max-h-[92vh] flex flex-col">
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-1 shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>
              {dailyState.streakDays} Day Pilgrimage Streak (連続修行)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-cinzel font-bold text-amber-100">
            Daily Pilgrimage Missions
          </h2>
          <p className="text-xs text-amber-400/90 font-kanji mt-0.5 tracking-wider">
            日々の巡礼修行 • 今日のお札
          </p>

          {/* Navigation Tabs */}
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setActiveTab('missions')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'missions'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              Today's Rituals ({completedCount}/{totalCount})
            </button>
            <button
              onClick={() => setActiveTab('ofuda')}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ofuda'
                  ? 'bg-amber-600 text-stone-950 font-bold shadow'
                  : 'bg-stone-800/60 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Sacred Talismans ({dailyState.earnedOfudaTitles.length})</span>
            </button>
          </div>
        </div>

        {/* Progress Bar Header */}
        <div className="mb-4 bg-stone-950/80 p-3 rounded-xl border border-stone-800/80 shrink-0">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-stone-300 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{dailyState.dateKey} Daily Progress</span>
            </span>
            <span className="font-mono font-bold text-amber-400">
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-amber-400 rounded-full transition-all duration-500"
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
                      ? 'bg-amber-950/20 border-emerald-500/40'
                      : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Mission Icon Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                        mission.isCompleted
                          ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
                          : 'bg-stone-900 border-stone-700 text-stone-300'
                      }`}
                    >
                      {mission.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-stone-100">
                          {mission.title}
                        </h4>
                        <span className="text-[10px] text-amber-400/90 font-kanji">
                          {mission.japaneseTitle}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">
                        {mission.description}
                      </p>
                    </div>
                  </div>

                  {/* Status / Quick Action */}
                  <div className="shrink-0 flex items-center gap-2">
                    {mission.isCompleted ? (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAction(mission.ritualType)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <span className="font-mono text-[11px]">
                          {mission.currentCount}/{mission.targetCount}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Today's Sacred Reward Banner */}
            <div className="mt-4 p-4 rounded-xl border border-amber-600/40 bg-gradient-to-br from-amber-950/40 to-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono font-semibold">
                  Today's Sacred Talisman of the Day
                </span>
                <h4 className="text-sm font-bold text-amber-100 font-cinzel">
                  {todayOfuda.blessing} • {todayOfuda.title}
                </h4>
                <p className="text-xs text-stone-400 mt-0.5">
                  Complete all 5 daily rituals to receive today's sacred seal.
                </p>
              </div>

              {isAllComplete && !dailyState.claimedRewardToday ? (
                <button
                  onClick={handleClaim}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white font-semibold text-xs border border-amber-300 shadow-lg hover:shadow-amber-900/50 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 animate-pulse"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Claim Daily Ofuda</span>
                </button>
              ) : isAllComplete && dailyState.claimedRewardToday ? (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Claimed for Today</span>
                </div>
              ) : (
                <div className="text-xs text-stone-500 font-mono shrink-0">
                  {totalCount - completedCount} rituals remaining
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Sacred Ofuda Talismans Collection */}
        {activeTab === 'ofuda' && (
          <div className="overflow-y-auto space-y-3 pr-1 flex-1">
            <p className="text-xs text-stone-400 text-center mb-1">
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
                        ? 'bg-gradient-to-br from-[#faf4e6] to-[#f0e3c8] text-stone-900 border-amber-400/80 shadow-md'
                        : 'bg-stone-950/60 text-stone-500 border-stone-800 opacity-60'
                    }`}
                  >
                    {/* Traditional Ofuda Talisman Paper Shape */}
                    <div
                      className={`w-14 h-24 rounded-t-lg rounded-b-sm border-2 flex flex-col items-center justify-between p-1.5 shrink-0 ${
                        isEarned
                          ? 'border-red-700 bg-white/90 shadow-sm'
                          : 'border-stone-700 bg-stone-900'
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
        <div className="pt-3 border-t border-stone-800 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium cursor-pointer"
          >
            Continue Pilgrimage
          </button>
        </div>
      </div>
    </div>
  );
};
