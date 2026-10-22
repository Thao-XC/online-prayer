import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SHRINES, INITIAL_EMA_SAMPLES } from './data/shrinesData';
import { ShrineData, TimeOfDay, GoshuinEntry, EmaVotive, OmikujiFortune, DailyPilgrimageState, DailyMission } from './types/shrine';
import { JapanMapPicker } from './components/JapanMapPicker';
import { ControlDock } from './components/ControlDock';
import { TemizuHud } from './components/TemizuHud';
import type { TemizuState } from './three/temizu/TemizuRitual';
import { SaisenWorshipModal } from './components/SaisenWorshipModal';
import { OmikujiModal } from './components/OmikujiModal';
import { EmaModal } from './components/EmaModal';
import { GoshuinBookModal } from './components/GoshuinBookModal';
import { MikoDialogueModal } from './components/MikoDialogueModal';
import { DailyPilgrimageModal } from './components/DailyPilgrimageModal';
import { QuestToast } from './components/QuestToast';
import { VirtualJoystick } from './components/VirtualJoystick';
import { ShrineScene } from './three/ShrineScene';
import { soundService } from './services/soundService';
import {
  loadDailyPilgrimageState,
  saveDailyPilgrimageState,
  updatePilgrimageRitual,
} from './services/dailyPilgrimageService';
import { ArrowLeft, Volume2, VolumeX, Sparkles, BookOpen, Flame } from 'lucide-react';
import { useBackLayer } from './services/backStack';
import { luckService } from './services/luckService';
import { LuckChip, LuckToasts, CaptionBar, StoryCardSheet, LuckSheet } from './components/LuckAndLegends';
import { OmamoriModal } from './components/OmamoriModal';
import { pilgrimService } from './services/pilgrimService';
import { MONTHLY_SEAL } from './data/pilgrimData';
import { designFor, cordHex } from './data/omamoriData';
import type { StoryCard } from './three/encounters/types';

export default function App() {
  // Deep link: ?shrine=<id> opens that shrine straight in 3D
  const linkedShrine = (() => {
    try {
      const id = new URLSearchParams(window.location.search).get('shrine');
      return SHRINES.find((s) => s.id === id) ?? null;
    } catch {
      return null;
    }
  })();
  const [viewMode, setViewMode] = useState<'map' | 'explore'>(linkedShrine ? 'explore' : 'map');
  const [currentShrine, setCurrentShrine] = useState<ShrineData>(linkedShrine ?? SHRINES[0]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [isCinematic, setIsCinematic] = useState(false);
  const [isAutoCycle, setIsAutoCycle] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState<
    'temizuya' | 'saisen' | 'omikuji' | 'ema' | 'goshuin' | 'miko' | 'daily' | 'omamori' | null
  >(null);

  // Daily Pilgrimage State
  const [dailyState, setDailyState] = useState<DailyPilgrimageState>(() => loadDailyPilgrimageState());
  const [questToast, setQuestToast] = useState<{ message: string; subMessage?: string } | null>(null);

  // Pilgrimage Collection Data (Stored in localStorage)
  const [goshuinList, setGoshuinList] = useState<GoshuinEntry[]>(() => {
    try {
      const saved = localStorage.getItem('vjinja_goshuin');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [emaList, setEmaList] = useState<EmaVotive[]>(() => {
    try {
      const saved = localStorage.getItem('vjinja_emas');
      return saved ? JSON.parse(saved) : INITIAL_EMA_SAMPLES;
    } catch {
      return INITIAL_EMA_SAMPLES;
    }
  });

  const [, setFortunesList] = useState<OmikujiFortune[]>(() => {
    try {
      const saved = localStorage.getItem('vjinja_fortunes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Luck, captions and legend cards
  const [caption, setCaption] = useState<string | null>(null);
  const captionTimer = useRef<number | null>(null);
  const showCaption = (text: string, seconds = 4) => {
    setCaption(text);
    if (captionTimer.current) window.clearTimeout(captionTimer.current);
    captionTimer.current = window.setTimeout(() => setCaption(null), seconds * 1000);
  };
  const [storyCard, setStoryCard] = useState<{ card: StoryCard; luck: number; firstTime: boolean } | null>(null);
  const [showLuck, setShowLuck] = useState(false);
  const [inLegend, setInLegend] = useState(false);
  const [temizu, setTemizu] = useState<TemizuState | null>(null);
  const [inTemizu, setInTemizu] = useState(false);
  const temizuDone = useRef(false);
  // per-visit manners
  const visit = useRef({ purified: false, worshipped: false, incense: false, cord: false });
  const shrinesStamped = new Set(goshuinList.map((g) => g.shrineId)).size;

  // Nearby spot callback state
  const [nearbySpot, setNearbySpot] = useState<{ id: string; name: string; type: string } | null>(null);

  // Three.js Mount & Scene Instance
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneInstanceRef = useRef<ShrineScene | null>(null);

  // Initialize or re-create Three.js scene when entering exploration mode
  useEffect(() => {
    if (viewMode !== 'explore' || !mountRef.current) return;

    // Dispose old scene if exists
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.dispose();
      sceneInstanceRef.current = null;
    }

    const scene = new ShrineScene(mountRef.current, currentShrine, {
      onNearSpot: (spotId, spotName, spotType) => {
        if (spotId && spotName && spotType) {
          setNearbySpot({ id: spotId, name: spotName, type: spotType });
        } else {
          setNearbySpot(null);
        }
      },
      onCaption: (text, seconds) => showCaption(text, seconds),
      onLuck: (delta, reason) => luckService.change(delta, reason),
      onSecret: (id, card, luck) => {
        const first = luckService.markFound(id);
        if (first) luckService.change(luck, `Secret found: ${card.title}`);
        pilgrimService.saveCard(id, card);
        setStoryCard({ card, luck, firstTime: first });
      },
      onEncounter: (e) => {
        if (e.type === 'start') {
          setInLegend(true);
          setActiveModal(null);
        } else if (e.type === 'caption' && e.text) {
          showCaption(e.text, e.seconds ?? 4);
        } else if (e.type === 'end' && !e.card) {
          // left early with Back / Esc
          setInLegend(false);
          setCaption(null);
        } else if (e.type === 'end' && e.card) {
          setInLegend(false);
          setCaption(null);
          const first = luckService.markFound(e.id);
          if (first) luckService.change(4, `Legend discovered: ${e.card.title}`);
          pilgrimService.saveCard(e.id, e.card);
          setStoryCard({ card: e.card, luck: 4, firstTime: first });
        }
      },
    });
    visit.current = { purified: false, worshipped: false, incense: false, cord: false };
    scene.setCords(pilgrimService.cordsFor(currentShrine.id).map((c) => cordHex(designFor(c))));

    scene.setTimeOfDay(timeOfDay);
    sceneInstanceRef.current = scene;

    // Start ambient audio
    soundService.startAmbient();

    return () => {
      soundService.stopAmbient();
      if (sceneInstanceRef.current) {
        sceneInstanceRef.current.dispose();
        sceneInstanceRef.current = null;
      }
    };
  }, [viewMode, currentShrine]);

  // Handle Time of Day Change
  const handleTimeOfDayChange = (time: TimeOfDay) => {
    setTimeOfDay(time);
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.setTimeOfDay(time);
    }
  };

  // Toggle Cinematic Drone Tour
  const handleToggleCinematic = () => {
    const nextState = !isCinematic;
    setIsCinematic(nextState);
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.isCinematicMode = nextState;
    }
  };

  // Toggle Auto Day/Night Lighting Cycle
  const handleToggleAutoCycle = () => {
    const nextState = !isAutoCycle;
    setIsAutoCycle(nextState);
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.isAutoCycleTime = nextState;
    }
  };

  // Teleport to POI
  const handleTeleport = (spotId: string) => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.teleportToSpot(spotId);
    }
  };

  // Save Goshuin
  const handleAddGoshuin = (entry: GoshuinEntry) => {
    setGoshuinList((prev) => {
      // one seal per shrine per month (monthly seals change design)
      if (prev.some((g) => g.shrineId === entry.shrineId && (g.ym ?? '') === (entry.ym ?? ''))) return prev;
      const updated = [...prev, entry];
      localStorage.setItem('vjinja_goshuin', JSON.stringify(updated));
      return updated;
    });
  };

  // Save Ema
  const handleHangEma = (ema: EmaVotive) => {
    setEmaList((prev) => {
      const updated = [ema, ...prev];
      localStorage.setItem('vjinja_emas', JSON.stringify(updated));
      return updated;
    });
  };

  // Save Fortune
  const handleSaveFortune = (fortune: OmikujiFortune) => {
    setFortunesList((prev) => {
      const updated = [fortune, ...prev];
      localStorage.setItem('vjinja_fortunes', JSON.stringify(updated));
      return updated;
    });
  };

  // Sound toggle
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundService.setMuted(nextMuted);
  };

  // Daily Pilgrimage Ritual Progress handler
  const handleRitualProgress = (ritualType: DailyMission['ritualType'], templeId?: string) => {
    const result = updatePilgrimageRitual(dailyState, ritualType, templeId || currentShrine.id);
    setDailyState(result.updatedState);

    if (result.completedMission) {
      soundService.playBellChime();
      setQuestToast({
        message: `Daily Mission Complete! ${result.completedMission.icon} ${result.completedMission.title}`,
        subMessage: `${result.completedMission.japaneseTitle} • Daily Progress: ${result.updatedState.missions.filter((m) => m.isCompleted).length}/${result.updatedState.missions.length}`,
      });
    } else if (result.allCompletedJustNow) {
      soundService.playTempleGong();
      setQuestToast({
        message: `🎉 All Daily Missions Completed! (+1 Streak Day)`,
        subMessage: `Today's Sacred Talisman of the Day is now ready to claim!`,
      });
    }
  };

  // Select Shrine from Map
  const handleSelectShrineFromMap = (shrine: ShrineData) => {
    setCurrentShrine(shrine);
    setViewMode('explore');
    handleRitualProgress('visit_temples', shrine.id);
  };

  // Return to Map
  const handleReturnToMap = () => {
    setViewMode('map');
    setActiveModal(null);
  };

  // Back / Esc / browser back: leave a hidden world first, then the 3D visit itself
  useBackLayer(viewMode === 'explore', handleReturnToMap);
  useBackLayer(inLegend, () => sceneInstanceRef.current?.leaveLegend());

  // Temizu: done in first person at this shrine's own basin, in the 3D scene
  const startTemizu = () => {
    const s = sceneInstanceRef.current;
    if (!s) return;
    setActiveModal(null);
    temizuDone.current = false;
    const ok = s.startTemizu((st) => {
      setTemizu(st);
      if (st.done && !temizuDone.current) {
        temizuDone.current = true;
        visit.current.purified = true;
        handleRitualProgress('temizuya');
      }
    });
    if (ok) setInTemizu(true);
  };
  const leaveTemizu = () => {
    sceneInstanceRef.current?.endTemizu();
    setInTemizu(false);
    setTemizu(null);
  };
  const holdTemizu = useCallback((on: boolean) => sceneInstanceRef.current?.setTemizuHolding(on), []);

  // Interactive Spot Trigger (e.g. Press 'E' or Tap button)
  const handleInteractWithSpot = () => {
    if (!nearbySpot) return;

    if (nearbySpot.type === 'temizuya') {
      startTemizu();
    } else if (nearbySpot.type === 'haiden') {
      setActiveModal('saisen');
    } else if (nearbySpot.type === 'omikuji') {
      setActiveModal('omikuji');
    } else if (nearbySpot.type === 'ema') {
      setActiveModal('ema');
    } else if (nearbySpot.type === 'torii') {
      sceneInstanceRef.current?.bow();
    } else if (nearbySpot.type === 'jokoro') {
      soundService.playTemizuWater();
      if (!visit.current.incense) {
        visit.current.incense = true;
        luckService.change(1, 'Wafted the healing incense smoke over yourself');
      }
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (viewMode !== 'explore') return;

      if (e.key === 'e' || e.key === 'E') {
        if (!activeModal && nearbySpot) {
          handleInteractWithSpot();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleReturnToMap();
      } else if (e.key === '1') {
        handleTimeOfDayChange('day');
      } else if (e.key === '2') {
        handleTimeOfDayChange('twilight');
      } else if (e.key === '3') {
        handleTimeOfDayChange('night');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [viewMode, activeModal, nearbySpot]);

  // Touch joystick movement handler
  const handleJoystickMove = (vec: { x: number; y: number }) => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.joystickVector = vec;
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#f7f2e7] text-[#2c241c] overflow-hidden font-sans select-none">
      {/* 1. Map Selection View */}
      {viewMode === 'map' && (
        <JapanMapPicker
          onSelectShrine={handleSelectShrineFromMap}
          onOpenGoshuin={() => setActiveModal('goshuin')}
          goshuinCount={shrinesStamped}
          onOpenDailyPilgrimage={() => setActiveModal('daily')}
          onOpenLuck={() => setShowLuck(true)}
          dailyProgress={{
            completed: dailyState.missions.filter((m) => m.isCompleted).length,
            total: dailyState.missions.length,
            streak: dailyState.streakDays,
          }}
        />
      )}

      {/* 2. 3D Exploration View */}
      {viewMode === 'explore' && (
        <>
          {/* Isolated WebGL Canvas Container (Three.js Skill mandate) */}
          <div
            ref={mountRef}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
          />

          {/* Top Left Minimal Header & Map Back Button (Unobtrusive & Beige Theme) */}
          <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-2 pointer-events-auto min-w-0">
            <button
              onClick={() => (inTemizu ? leaveTemizu() : inLegend ? sceneInstanceRef.current?.leaveLegend() : handleReturnToMap())}
              className="flex items-center gap-1.5 pl-2.5 pr-3.5 py-2 rounded-xl bg-[#fbf8f0]/95 hover:bg-[#f3ebd7] text-[#2c241c] border border-[#d8cabb] text-xs font-semibold transition-all shadow-md hover:border-[#b45309] cursor-pointer"
              title={inLegend ? 'Back to the shrine (Esc)' : 'Back to the map (Esc)'}
              aria-label={inLegend ? 'Back to the shrine' : 'Back to the map'}
            >
              <ArrowLeft className="w-4 h-4 text-[#b91c1c]" />
              <span>{inLegend ? 'Shrine' : 'Map'}</span>
              <kbd className="hidden pointer-fine:inline ml-1 px-1 rounded border border-[#d8cabb] text-[10px] text-[#6d5b49] font-sans">Esc</kbd>
            </button>

            <div className="hidden min-[480px]:flex px-3 py-1.5 rounded-xl bg-[#fbf8f0]/95 border border-[#d8cabb] text-xs shadow-md items-center gap-2 min-w-0 max-w-[38vw] sm:max-w-none">
              <span className="font-kanji font-bold text-[#b91c1c] truncate">
                {currentShrine.kanjiName.split('（')[0]}
              </span>
              <span className="text-[#6d5b49] hidden sm:inline">
                ({currentShrine.region} • {currentShrine.prefecture})
              </span>
            </div>
          </div>

          {/* Top Right Quick Stamps, Daily Pilgrimage Missions & Sound */}
          <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <LuckChip onClick={() => setShowLuck(true)} compact />
            {/* Daily Pilgrimage Progress Tracker in 3D HUD */}
            <button
              onClick={() => setActiveModal('daily')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fef9ee]/95 hover:bg-[#fbeed4] border border-[#eab308]/60 hover:border-[#ca8a04] text-[#854d0e] text-xs font-semibold transition-all shadow-md cursor-pointer"
              title="Daily Pilgrimage Missions & Progress"
            >
              <Flame className="w-4 h-4 text-[#ea580c] fill-[#ea580c] animate-pulse" />
              <span className="hidden sm:inline">Daily Missions</span>
              <span className="font-mono text-[10px] bg-[#fef08a] px-1.5 py-0.5 rounded text-[#854d0e] font-bold border border-[#fde047]">
                {dailyState.missions.filter((m) => m.isCompleted).length}/{dailyState.missions.length}
              </span>
              <span className="text-[10px] text-[#ca8a04] hidden md:inline">
                • {dailyState.streakDays}d
              </span>
            </button>

            <button
              onClick={() => setActiveModal('goshuin')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fbf8f0]/95 hover:bg-[#f3ebd7] border border-[#d8cabb] text-[#2c241c] text-xs font-medium transition-all shadow-md cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#b45309]" />
              <span className="hidden sm:inline">Goshuinchō</span>
              <span className="text-[10px] bg-[#ebdcc7] text-[#78350f] px-1.5 py-0.5 rounded font-mono font-bold">
                {shrinesStamped}/{SHRINES.length}
              </span>
            </button>

            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-[#fbf8f0]/95 hover:bg-[#f3ebd7] border border-[#d8cabb] text-[#5c4a38] hover:text-[#2c241c] transition-colors shadow-md cursor-pointer"
              aria-label="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-[#9c8b78]" /> : <Volume2 className="w-4 h-4 text-[#b45309]" />}
            </button>
          </div>

          {/* Consolidated Collapsible Bottom Dock (Zero Viewport Occlusion) */}
          {!inLegend && !inTemizu && (
          <ControlDock
            shrine={currentShrine}
            timeOfDay={timeOfDay}
            onTimeOfDayChange={handleTimeOfDayChange}
            isCinematic={isCinematic}
            onToggleCinematic={handleToggleCinematic}
            onTeleport={handleTeleport}
            onOpenTemizuya={startTemizu}
            onOpenSaisen={() => setActiveModal('saisen')}
            onOpenOmikuji={() => setActiveModal('omikuji')}
            onOpenEma={() => setActiveModal('ema')}
            onOpenGoshuin={() => setActiveModal('goshuin')}
            onOpenOmamori={() => setActiveModal('omamori')}
            onOpenMikoDialogue={() => setActiveModal('miko')}
            onOpenDailyPilgrimage={() => setActiveModal('daily')}
            dailyProgress={{
              completed: dailyState.missions.filter((m) => m.isCompleted).length,
              total: dailyState.missions.length,
              streak: dailyState.streakDays,
            }}
            onReturnToMap={handleReturnToMap}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
            isAutoCycle={isAutoCycle}
            onToggleAutoCycle={handleToggleAutoCycle}
            currentNearbySpot={nearbySpot}
            onBow={() => sceneInstanceRef.current?.bow()}
          >
            {nearbySpot && !activeModal && (
              <button
                onClick={handleInteractWithSpot}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-700 via-amber-700 to-red-600 hover:from-red-600 hover:to-amber-500 text-amber-100 font-cinzel font-semibold text-xs sm:text-sm border border-amber-400/60 shadow-2xl flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  <span className="pointer-coarse:hidden">[E] </span>
                  {nearbySpot.type === 'temizuya'
                    ? 'Purify at Water Basin'
                    : nearbySpot.type === 'haiden'
                    ? 'Offer Coin & Pray'
                    : nearbySpot.type === 'omikuji'
                    ? 'Draw Fortune Slip'
                    : nearbySpot.type === 'ema'
                    ? 'Hang Prayer Tablet'
                    : nearbySpot.type === 'jokoro'
                    ? 'Waft Incense Smoke'
                    : 'Bow in Reverence'}
                </span>
              </button>
            )}
          </ControlDock>
          )}

          {/* Virtual Touch Joystick for Mobile / Tablets */}
          {!inTemizu && <VirtualJoystick onMove={handleJoystickMove} />}
          {inTemizu && <TemizuHud state={temizu} onHold={holdTemizu} onLeave={leaveTemizu} river={currentShrine.id === 'ise-jingu'} />}
        </>
      )}

      {/* 3. Interactive Ritual Modals */}

      {activeModal === 'saisen' && (
        <SaisenWorshipModal
          shrine={currentShrine}
          onClose={() => setActiveModal(null)}
          onDisrespect={(reason) => luckService.change(-2, reason)}
          onWorshipComplete={() => {
            if (!visit.current.worshipped) {
              visit.current.worshipped = true;
              if (visit.current.purified) luckService.change(2, 'Purified at the temizuya before praying, the proper order');
              else luckService.change(-2, 'Prayed without purifying at the temizuya first');
            }
            // Auto add Goshuin if user completes ritual!
            handleAddGoshuin({
              shrineId: currentShrine.id,
              shrineName: currentShrine.name,
              kanjiName: currentShrine.kanjiName,
              date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
              sealColor: MONTHLY_SEAL[new Date().getMonth() + 1].color,
              month: new Date().getMonth() + 1,
              ym: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
            });
            handleRitualProgress('saisen');
          }}
        />
      )}

      {activeModal === 'omikuji' && (
        <OmikujiModal
          shrine={currentShrine}
          luck={luckService.get().value}
          onClose={() => setActiveModal(null)}
          onSaveFortune={(fortune) => {
            handleSaveFortune(fortune);
            handleRitualProgress('omikuji');
          }}
        />
      )}

      {activeModal === 'ema' && (
        <EmaModal
          shrine={currentShrine}
          onClose={() => setActiveModal(null)}
          onHangEma={(ema) => {
            handleHangEma(ema);
            handleRitualProgress('ema');
          }}
          existingEmas={emaList}
        />
      )}

      {activeModal === 'goshuin' && (
        <GoshuinBookModal
          currentShrine={currentShrine}
          goshuinList={goshuinList}
          onAddGoshuin={(entry) => {
            handleAddGoshuin(entry);
            handleRitualProgress('goshuin');
          }}
          onClose={() => setActiveModal(null)}
          onOpenCard={(_id, card) => setStoryCard({ card, luck: 0, firstTime: false })}
        />
      )}

      {activeModal === 'omamori' && (
        <OmamoriModal
          shrine={currentShrine}
          tiedHere={pilgrimService.cordsFor(currentShrine.id).length}
          onClose={() => setActiveModal(null)}
          onReceive={(designId, forWhom) => {
            pilgrimService.receiveOmamori({ designId, forWhom, shrineId: currentShrine.id, shrineName: currentShrine.name, kanjiName: currentShrine.kanjiName });
            sceneInstanceRef.current?.setCords(pilgrimService.cordsFor(currentShrine.id).map((c) => cordHex(designFor(c))));
            if (!visit.current.cord) {
              visit.current.cord = true;
              luckService.change(1, 'Tied a goen-musubi cord to the sacred tree');
            }
          }}
        />
      )}

      {activeModal === 'miko' && (
        <MikoDialogueModal
          shrine={currentShrine}
          onClose={() => setActiveModal(null)}
          onConsulted={() => {
            handleRitualProgress('dialogue');
          }}
        />
      )}

      {activeModal === 'daily' && (
        <DailyPilgrimageModal
          dailyState={dailyState}
          onClose={() => setActiveModal(null)}
          onClaimReward={() => {
            const updated: DailyPilgrimageState = {
              ...dailyState,
              claimedRewardToday: true,
            };
            setDailyState(updated);
            saveDailyPilgrimageState(updated);
            setQuestToast({
              message: `Sacred Talisman Claimed! 守護札拝受`,
              subMessage: `Today's divine protection is recorded in your spiritual archive.`,
            });
          }}
          onQuickAction={(ritualType) => {
            if (ritualType === 'temizuya') startTemizu();
            else if (ritualType === 'saisen') setActiveModal('saisen');
            else if (ritualType === 'omikuji') setActiveModal('omikuji');
            else if (ritualType === 'ema') setActiveModal('ema');
            else if (ritualType === 'dialogue') setActiveModal('miko');
            else if (ritualType === 'visit_temples') setViewMode('map');
            else if (ritualType === 'goshuin') setActiveModal('goshuin');
          }}
        />
      )}

      {/* Luck notes, captions and legend cards */}
      <LuckToasts />
      <CaptionBar text={caption} />
      {storyCard && (
        <StoryCardSheet card={storyCard.card} luck={storyCard.luck} firstTime={storyCard.firstTime} onClose={() => setStoryCard(null)} />
      )}
      {showLuck && <LuckSheet onClose={() => setShowLuck(false)} />}

      {/* Quest & Milestone Completion Toast */}
      {questToast && (
        <QuestToast
          message={questToast.message}
          subMessage={questToast.subMessage}
          onDismiss={() => setQuestToast(null)}
        />
      )}
    </div>
  );
}
