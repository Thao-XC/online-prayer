import React, { useState, useEffect } from 'react';
import { ShrineData, ShrineSpot, TimeOfDay } from '../types/shrine';
import {
  Droplets,
  Coins,
  Scroll,
  PenTool,
  BookOpen,
  Sun,
  Sunset,
  Moon,
  Video,
  ChevronDown,
  ChevronUp,
  Compass,
  Sparkles,
} from 'lucide-react';

interface ControlDockProps {
  shrine: ShrineData;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (time: TimeOfDay) => void;
  isCinematic: boolean;
  onToggleCinematic: () => void;
  onTeleport: (spotId: string) => void;
  onOpenTemizuya: () => void;
  onOpenSaisen: () => void;
  onOpenOmikuji: () => void;
  onOpenEma: () => void;
  onOpenGoshuin: () => void;
  onOpenMikoDialogue: () => void;
  onOpenDailyPilgrimage: () => void;
  dailyProgress: { completed: number; total: number; streak: number };
  onReturnToMap: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  isAutoCycle: boolean;
  onToggleAutoCycle: () => void;
  currentNearbySpot: { id: string; name: string; type: string } | null;
  children?: React.ReactNode;
  onBow?: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  shrine,
  timeOfDay,
  onTimeOfDayChange,
  isCinematic,
  onToggleCinematic,
  onTeleport,
  onOpenTemizuya,
  onOpenSaisen,
  onOpenOmikuji,
  onOpenEma,
  onOpenGoshuin,
  onOpenMikoDialogue,
  onOpenDailyPilgrimage,
  dailyProgress,
  onReturnToMap,
  isMuted,
  onToggleSound,
  isAutoCycle,
  onToggleAutoCycle,
  currentNearbySpot,
  children,
  onBow,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'rituals' | 'teleport' | 'environment'>('rituals');

  // Toggle with 'H' key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div
      className="fixed bottom-2 sm:bottom-4 left-1/2 z-40 transition-transform duration-300 pointer-events-auto"
      style={{
        width: 'max-content',
        maxWidth: 'min(980px, calc(100vw - 16px))',
        transform: isCollapsed
          ? 'translateX(-50%) translateY(calc(100% - 36px))'
          : 'translateX(-50%) translateY(0)',
      }}
    >
      {/* Proximity prompt rides just above the dock, so it never covers it */}
      {children && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap">{children}</div>
      )}

      {/* Collapse/Expand Toggle Tab */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1 rounded-t-xl bg-[#fbf7ef]/95 border-t border-x border-[#d8c8ae] text-xs font-medium text-[#4a3c2e] hover:text-[#2c241c] transition-colors shadow-lg cursor-pointer"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-[#b45309]" />
              <span>Show controls<span className="pointer-coarse:hidden"> (H)</span></span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-[#b45309]" />
              <span>Hide controls<span className="pointer-coarse:hidden"> (H)</span></span>
            </>
          )}
        </button>
      </div>

      {/* Main Consolidated Glassmorphic Dock Container */}
      <div className="bg-[#fbf7ef]/95 border border-[#d8c8ae] rounded-2xl shadow-2xl p-3 sm:p-4 text-[#2c241c] backdrop-blur-md shadow-[0_8px_30px_rgba(44,36,28,0.18)]">
        {/* Tabs + where you are */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#e3d6c0]">
          <div className="flex items-center gap-1 bg-[#f1e8d7] p-1 rounded-xl border border-[#e3d6c0]">
            <button
              onClick={() => setActiveTab('rituals')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'rituals'
                  ? 'bg-[#b91c1c] text-white font-semibold'
                  : 'text-[#6d5b49] hover:text-[#2c241c]'
              }`}
            >
              <span className="sm:hidden">Rituals</span>
              <span className="hidden sm:inline">Rituals & Guide</span>
            </button>
            <button
              onClick={() => setActiveTab('teleport')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'teleport'
                  ? 'bg-[#b91c1c] text-white font-semibold'
                  : 'text-[#6d5b49] hover:text-[#2c241c]'
              }`}
            >
              <span className="sm:hidden">Teleport</span>
              <span className="hidden sm:inline">Teleport</span>
            </button>
            <button
              onClick={() => setActiveTab('environment')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'environment'
                  ? 'bg-[#b91c1c] text-white font-semibold'
                  : 'text-[#6d5b49] hover:text-[#2c241c]'
              }`}
            >
              <span className="sm:hidden">Time</span>
              <span className="hidden sm:inline">Time & Camera</span>
            </button>
          </div>

          {onBow && (
            <button
              onClick={onBow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fbeedd] hover:bg-[#f6dfc0] border border-[#d6b98c] text-[#7c2d12] text-xs font-semibold cursor-pointer shrink-0"
              title="Bow (B)"
            >
              <span aria-hidden>🙇</span>
              <span>Bow</span>
              <span className="hidden sm:inline pointer-coarse:hidden text-[10px] text-[#b45309] font-mono">B</span>
            </button>
          )}
          {currentNearbySpot && (
            <span className="hidden sm:flex text-[11px] bg-[#fdecea] border border-[#e8b4a8] text-[#b91c1c] px-2 py-0.5 rounded-full font-medium items-center gap-1 truncate max-w-[220px]">
              <Compass className="w-3 h-3 text-[#b91c1c] shrink-0" />
              <span className="truncate">Near: {currentNearbySpot.name.split('(')[0]}</span>
            </span>
          )}
        </div>

        {/* Tab 1: Interactive Shrine Rituals & AI Guide */}
        {activeTab === 'rituals' && (
          <div className="pt-2.5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&>button]:shrink-0 pr-6 sm:pr-0 [mask-image:linear-gradient(to_right,black_82%,transparent)] sm:[mask-image:none]">
            {/* AI Guide Dialogue Button */}
            <button
              onClick={onOpenMikoDialogue}
              className="p-2 sm:p-2.5 rounded-xl border border-[#e3d6c0] hover:border-amber-500/70 bg-gradient-to-br from-[#fbeedd] to-[#fffcf6] text-left transition-all cursor-pointer flex items-center gap-2 group shadow-sm ring-1 ring-amber-500/20"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-800 to-amber-700 border border-amber-400/40 text-[#7c2d12] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform text-sm shadow">
                {shrine.type === 'temple' ? '🧘' : '⛩️'}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#7c2d12] group-hover:text-[#7c2d12] flex items-center gap-1">
                  <span>{shrine.type === 'temple' ? 'Zen Monk' : 'Miko Sakura'}</span>
                </div>
                <div className="text-[10px] text-[#b45309]/80 font-kanji">神託・対話</div>
              </div>
            </button>

            <button
              onClick={onOpenTemizuya}
              className="p-2 sm:p-2.5 rounded-xl border border-[#e3d6c0] hover:border-cyan-500/50 bg-[#fffcf6] hover:bg-[#eef7f8] text-left transition-all cursor-pointer flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#e3f1f2] border border-cyan-500/30 text-[#0e7490] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Droplets className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#2c241c] group-hover:text-[#0e7490]">
                  Temizuya
                </div>
                <div className="text-[10px] text-[#6d5b49] font-kanji">手水舎で清める</div>
              </div>
            </button>

            <button
              onClick={onOpenSaisen}
              className="p-2 sm:p-2.5 rounded-xl border border-[#e3d6c0] hover:border-amber-500/50 bg-[#fffcf6] hover:bg-[#fdf4e7] text-left transition-all cursor-pointer flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#fbeedd] border border-amber-500/30 text-[#b45309] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Coins className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#2c241c] group-hover:text-[#9a3412]">
                  Worship & Pray
                </div>
                <div className="text-[10px] text-[#6d5b49] font-kanji">二礼二拍手一礼</div>
              </div>
            </button>

            <button
              onClick={onOpenOmikuji}
              className="p-2 sm:p-2.5 rounded-xl border border-[#e3d6c0] hover:border-red-500/50 bg-[#fffcf6] hover:bg-[#fdf1ef] text-left transition-all cursor-pointer flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#fdecea] border border-red-500/30 text-[#b91c1c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Scroll className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#2c241c] group-hover:text-[#b91c1c]">
                  Draw Omikuji
                </div>
                <div className="text-[10px] text-[#6d5b49] font-kanji">神託おみくじ</div>
              </div>
            </button>

            <button
              onClick={onOpenEma}
              className="p-2 sm:p-2.5 rounded-xl border border-[#e3d6c0] hover:border-amber-600/50 bg-[#fffcf6] hover:bg-[#fdf4e7] text-left transition-all cursor-pointer flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[#fbeedd] border border-amber-600/30 text-[#b45309] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <PenTool className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#2c241c] group-hover:text-[#9a3412]">
                  Hang Ema
                </div>
                <div className="text-[10px] text-[#6d5b49] font-kanji">絵馬を奉納する</div>
              </div>
            </button>

            <button
              onClick={onOpenGoshuin}
              className="p-2 sm:p-2.5 rounded-xl border border-[#e3d6c0] hover:border-rose-500/50 bg-[#fffcf6] hover:bg-rose-50 text-left transition-all cursor-pointer flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-500/30 text-rose-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#2c241c] group-hover:text-rose-700">
                  Goshuinchō
                </div>
                <div className="text-[10px] text-[#6d5b49] font-kanji">御朱印帳を開く</div>
              </div>
            </button>
          </div>
        )}

        {/* Tab 2: Fast Teleport to Spots */}
        {activeTab === 'teleport' && (
          <div className="pt-2.5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&>button]:shrink-0 max-w-[900px] pr-6 sm:pr-0 [mask-image:linear-gradient(to_right,black_82%,transparent)] sm:[mask-image:none]">
            {shrine.spots.map((spot) => (
              <button
                key={spot.id}
                onClick={() => onTeleport(spot.id)}
                className="px-3 py-2 rounded-xl bg-[#fffcf6] border border-[#e3d6c0] hover:border-amber-500/60 hover:bg-[#fdf4e7] text-xs text-[#2c241c] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span className="text-[#b45309]">📍</span>
                <span>{spot.name.split('(')[0]}</span>
                <span className="text-[10px] text-[#6d5b49] font-kanji">
                  {spot.japaneseName}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Environment Lighting & Auto-Tour */}
        {activeTab === 'environment' && (
          <div className="pt-2.5 flex flex-wrap items-center justify-between gap-3">
            {/* Time of Day Swatches */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6d5b49] font-medium">Lighting / Sky:</span>
              <div className="flex items-center gap-1.5 bg-[#f1e8d7] p-1 rounded-xl border border-[#e3d6c0]">
                <button
                  onClick={() => onTimeOfDayChange('day')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    timeOfDay === 'day'
                      ? 'bg-[#b45309] text-white font-bold'
                      : 'text-[#6d5b49] hover:text-[#2c241c]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Daylight</span>
                </button>
                <button
                  onClick={() => onTimeOfDayChange('twilight')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    timeOfDay === 'twilight'
                      ? 'bg-[#b91c1c] text-white font-bold'
                      : 'text-[#6d5b49] hover:text-[#2c241c]'
                  }`}
                >
                  <Sunset className="w-3.5 h-3.5" />
                  <span>Twilight</span>
                </button>
                <button
                  onClick={() => onTimeOfDayChange('night')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    timeOfDay === 'night'
                      ? 'bg-indigo-600 text-[#2c241c] font-bold'
                      : 'text-[#6d5b49] hover:text-[#2c241c]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Night & Lanterns</span>
                </button>
              </div>
            </div>

            {/* Right Buttons: Auto Cycle & Drone Tour */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleAutoCycle}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isAutoCycle
                    ? 'bg-[#b91c1c] text-white border-amber-400 font-bold shadow'
                    : 'bg-[#fffcf6] border-[#e3d6c0] text-[#4a3c2e] hover:border-[#d8c8ae]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#9a3412]" />
                <span>{isAutoCycle ? 'Auto Day/Night: ON' : 'Auto Day/Night Cycle'}</span>
              </button>

              {/* Cinematic Drone Mode */}
              <button
                onClick={onToggleCinematic}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  isCinematic
                    ? 'bg-[#b91c1c] text-white border-[#b91c1c] shadow-lg'
                    : 'bg-[#fffcf6] border-[#e3d6c0] text-[#4a3c2e] hover:border-[#d8c8ae]'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>{isCinematic ? 'Exit Tour' : 'Drone Tour'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
