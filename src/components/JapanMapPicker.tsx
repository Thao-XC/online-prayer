import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { SHRINES } from '../data/shrinesData';
import { ShrineData, ShrineType } from '../types/shrine';
import { soundService } from '../services/soundService';
import {
  MapPin,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  ArrowRight,
  Compass,
  Flame,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Map as MapIcon,
  ChevronRight,
  CheckCircle2,
  Layers,
  Heart,
  Landmark,
  Maximize2,
  Minimize2,
  Move,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  HelpCircle,
  Eye,
  Sliders,
} from 'lucide-react';

interface JapanMapPickerProps {
  onSelectShrine: (shrine: ShrineData) => void;
  onOpenGoshuin: () => void;
  goshuinCount: number;
  onOpenDailyPilgrimage: () => void;
  dailyProgress: { completed: number; total: number; streak: number };
}

type RegionFilter =
  | 'all'
  | 'Kanto'
  | 'Kansai'
  | 'Chubu'
  | 'Tohoku'
  | 'Chugoku'
  | 'Kyushu'
  | 'Shikoku'
  | 'Hokkaido'
  | 'Okinawa';

interface RegionViewPreset {
  zoom: number;
  panX: number;
  panY: number;
  name: string;
  kanji: string;
}

const REGION_PRESETS: Record<RegionFilter, RegionViewPreset> = {
  all: { zoom: 1.0, panX: 0, panY: 0, name: 'All Japan', kanji: '全国' },
  Kanto: { zoom: 2.4, panX: -180, panY: 30, name: 'Kanto (Tokyo/Nikko)', kanji: '関東' },
  Kansai: { zoom: 2.6, panX: -10, panY: -60, name: 'Kansai (Kyoto/Nara/Mie)', kanji: '関西' },
  Chubu: { zoom: 2.3, panX: -60, panY: 30, name: 'Chubu (Nagano/Nagoya)', kanji: '中部' },
  Tohoku: { zoom: 2.3, panX: -240, panY: 260, name: 'Tohoku (Hiraizumi)', kanji: '東北' },
  Chugoku: { zoom: 2.4, panX: 190, panY: -30, name: 'Chugoku (Hiroshima/Izumo)', kanji: '中国' },
  Shikoku: { zoom: 2.6, panX: 140, panY: -110, name: 'Shikoku (Sanuki)', kanji: '四国' },
  Kyushu: { zoom: 2.4, panX: 360, panY: -90, name: 'Kyushu (Fukuoka)', kanji: '九州' },
  Hokkaido: { zoom: 2.0, panX: -320, panY: 480, name: 'Hokkaido (Sapporo)', kanji: '北海道' },
  Okinawa: { zoom: 2.8, panX: 520, panY: -480, name: 'Okinawa (Naha)', kanji: '沖縄' },
};

export const JapanMapPicker: React.FC<JapanMapPickerProps> = ({
  onSelectShrine,
  onOpenGoshuin,
  goshuinCount,
  onOpenDailyPilgrimage,
  dailyProgress,
}) => {
  const [selectedId, setSelectedId] = useState<string>(SHRINES[0].id);
  const [typeFilter, setTypeFilter] = useState<'all' | ShrineType>('all');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'directory'>('map');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(soundService.getMuted());
  const [hoveredShrine, setHoveredShrine] = useState<ShrineData | null>(null);

  // Fullscreen / Expanded map mode
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Drag-to-pan states
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const touchDistanceRef = useRef<number | null>(null);

  const selectedShrine = useMemo(() => {
    return SHRINES.find((s) => s.id === selectedId) || SHRINES[0];
  }, [selectedId]);

  // Filter shrines by search query, type, and region
  const filteredShrines = useMemo(() => {
    return SHRINES.filter((shrine) => {
      if (typeFilter !== 'all' && shrine.type !== typeFilter) return false;
      if (regionFilter !== 'all') {
        if (regionFilter === 'Okinawa') {
          if (shrine.prefecture.toLowerCase().includes('okinawa') || shrine.id === 'naminoue-gu') {
            return true;
          }
          return false;
        }
        if (shrine.region !== regionFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName =
          shrine.name.toLowerCase().includes(q) ||
          shrine.kanjiName.includes(q) ||
          shrine.romanizedName.toLowerCase().includes(q);
        const matchesLocation =
          shrine.prefecture.toLowerCase().includes(q) ||
          shrine.region.toLowerCase().includes(q);
        const matchesBlessing =
          shrine.primaryBlessing.toLowerCase().includes(q) ||
          shrine.tagline.toLowerCase().includes(q);
        const matchesDeity = shrine.enshrinedDeityOrBuddha.toLowerCase().includes(q);
        if (!matchesName && !matchesLocation && !matchesBlessing && !matchesDeity) {
          return false;
        }
      }
      return true;
    });
  }, [typeFilter, regionFilter, searchQuery]);

  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundService.setMuted(nextMuted);
    if (!nextMuted) {
      soundService.playFuurin();
    }
  };

  const handlePickShrine = (shrine: ShrineData, autoCenter = false) => {
    setSelectedId(shrine.id);
    soundService.playZenTone(Math.floor(Math.random() * 5));

    if (autoCenter) {
      centerOnShrine(shrine);
    }
  };

  const centerOnShrine = (shrine: ShrineData) => {
    const targetZoom = Math.max(zoomLevel, 2.2);
    // Center point of map is at 50%, 50%
    const targetX = (50 - shrine.mapCoords.x) * 9 * (targetZoom / 1.5);
    const targetY = (50 - shrine.mapCoords.y) * 6.5 * (targetZoom / 1.5);

    setZoomLevel(targetZoom);
    setPanOffset({
      x: Math.min(Math.max(targetX, -800), 800),
      y: Math.min(Math.max(targetY, -600), 600),
    });
  };

  const handleEnterWorld = (shrine: ShrineData) => {
    soundService.playTempleGong();
    onSelectShrine(shrine);
  };

  const handleSelectRegionPreset = (region: RegionFilter) => {
    setRegionFilter(region);
    const preset = REGION_PRESETS[region];
    setZoomLevel(preset.zoom);
    setPanOffset({ x: preset.panX, y: preset.panY });
    soundService.playFootstep();
  };

  // Zoom towards a specific point (mouse cursor or center)
  const zoomAroundPoint = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const clampedZoom = Math.min(Math.max(Number(nextZoom.toFixed(2)), 0.9), 3.8);
      if (clampedZoom === zoomLevel) return;

      if (clientX !== undefined && clientY !== undefined && mapViewportRef.current) {
        const rect = mapViewportRef.current.getBoundingClientRect();
        const cursorX = clientX - (rect.left + rect.width / 2);
        const cursorY = clientY - (rect.top + rect.height / 2);

        const factor = clampedZoom / zoomLevel;
        const newPanX = cursorX - (cursorX - panOffset.x) * factor;
        const newPanY = cursorY - (cursorY - panOffset.y) * factor;

        setZoomLevel(clampedZoom);
        setPanOffset({
          x: Math.min(Math.max(newPanX, -700 * clampedZoom), 700 * clampedZoom),
          y: Math.min(Math.max(newPanY, -500 * clampedZoom), 500 * clampedZoom),
        });
      } else {
        setZoomLevel(clampedZoom);
      }
    },
    [zoomLevel, panOffset]
  );

  // Zoom controls
  const handleZoomIn = () => {
    zoomAroundPoint(zoomLevel + 0.35);
    soundService.playFootstep();
  };

  const handleZoomOut = () => {
    zoomAroundPoint(zoomLevel - 0.35);
    soundService.playFootstep();
  };

  const handleSetZoomSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    zoomAroundPoint(val);
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setRegionFilter('all');
    soundService.playFootstep();
  };

  // D-Pad Pan navigation
  const panBy = (dx: number, dy: number) => {
    setPanOffset((prev) => ({
      x: Math.min(Math.max(prev.x + dx, -900), 900),
      y: Math.min(Math.max(prev.y + dy, -700), 700),
    }));
    soundService.playFootstep();
  };

  // Native non-passive mouse wheel zoom listener
  useEffect(() => {
    const el = mapViewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.2 : -0.2;
      const targetZoom = Math.min(Math.max(zoomLevel + zoomDelta, 0.9), 3.8);
      zoomAroundPoint(targetZoom, e.clientX, e.clientY);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [zoomLevel, zoomAroundPoint]);

  // Keyboard navigation (+, -, 0, Arrow Keys, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in search input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      } else if (e.key === 'ArrowUp') {
        panBy(0, 60);
      } else if (e.key === 'ArrowDown') {
        panBy(0, -60);
      } else if (e.key === 'ArrowLeft') {
        panBy(60, 0);
      } else if (e.key === 'ArrowRight') {
        panBy(-60, 0);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsMapExpanded((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomLevel, panOffset]);

  // Double click on map to zoom in
  const handleDoubleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    zoomAroundPoint(zoomLevel + 0.5, e.clientX, e.clientY);
  };

  // Mouse drag handlers for panning (1:1 screen pixel tracking)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    initialPanRef.current = { ...panOffset };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: Math.min(Math.max(initialPanRef.current.x + dx, -900), 900),
      y: Math.min(Math.max(initialPanRef.current.y + dy, -700), 700),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan & pinch zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      initialPanRef.current = { ...panOffset };
      touchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPanOffset({
        x: Math.min(Math.max(initialPanRef.current.x + dx, -900), 900),
        y: Math.min(Math.max(initialPanRef.current.y + dy, -700), 700),
      });
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchDistanceRef.current;
      if (Math.abs(factor - 1) > 0.04) {
        const next = Math.min(Math.max(zoomLevel * factor, 0.9), 3.8);
        setZoomLevel(Number(next.toFixed(2)));
        touchDistanceRef.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Calculate inverse pin scale so markers remain readable, compact, and never bloat or overlap into messy clumps
  const pinCounterScale = useMemo(() => {
    return Math.max(0.48, Math.min(1.0, 1.0 / Math.pow(zoomLevel, 0.65)));
  }, [zoomLevel]);

  return (
    <div className="relative w-full h-screen bg-[#f7f2e7] text-[#2c241c] flex flex-col overflow-hidden select-none font-sans">
      {/* Traditional Washi Rice Paper & Subtle Cloud / Ripple Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#dfd4c0_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_20%_20%,#e8dcbe_0%,transparent_60%)]" />

      {/* Top Header Bar - Warm Beige Aesthetic with Japanese Accents */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 border-b border-[#ded2bd] bg-[#fbf8f1]/95 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b91c1c] via-[#c2410c] to-[#991b1b] border border-[#f59e0b]/50 flex items-center justify-center text-xl shadow-md text-white">
            ⛩️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-cinzel font-bold tracking-wider text-[#241c14]">
                Online Prayer
              </h1>
              <span className="text-xs font-kanji text-[#9a3412] font-semibold border border-[#ea580c]/30 px-2 py-0.5 rounded-full bg-[#ffedd5]/70 hidden sm:inline-block">
                日本名社寺巡礼
              </span>
              <span className="text-[11px] font-mono bg-[#fef2f2] text-[#b91c1c] font-bold border border-[#fca5a5] px-2 py-0.5 rounded-full shadow-xs">
                {SHRINES.length} Sacred Sanctuaries
              </span>
            </div>
            <p className="text-[11px] text-[#715f4d] font-sans hidden sm:block">
              Interactive 3D Virtual Pilgrimage to Historic Japanese Shrines & Temples
            </p>
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* View Mode Toggle: Interactive Map vs Directory */}
          <div className="flex items-center p-1 rounded-xl bg-[#eee4d2] border border-[#d8caba]">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#b91c1c] text-white font-bold shadow-sm'
                  : 'text-[#6b5845] hover:text-[#2c241c]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Map View</span>
            </button>
            <button
              onClick={() => setViewMode('directory')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                viewMode === 'directory'
                  ? 'bg-[#b91c1c] text-white font-bold shadow-sm'
                  : 'text-[#6b5845] hover:text-[#2c241c]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Directory ({SHRINES.length})</span>
            </button>
          </div>

          {/* Daily Pilgrimage Mission Button */}
          <button
            onClick={onOpenDailyPilgrimage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fdf5e8] hover:bg-[#faebd4] border border-[#eab308]/60 hover:border-[#ca8a04] text-[#854d0e] text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            <Flame className="w-4 h-4 text-[#ea580c] fill-[#ea580c] animate-pulse" />
            <span className="hidden sm:inline font-semibold">Daily Missions</span>
            <span className="bg-[#fef9c3] px-1.5 py-0.5 rounded text-[10px] text-[#a16207] font-mono font-bold border border-[#fde047]">
              {dailyProgress.completed}/{dailyProgress.total}
            </span>
            <span className="text-[10px] text-[#ca8a04] font-medium hidden lg:inline">
              • {dailyProgress.streak}d streak
            </span>
          </button>

          {/* Goshuin Book Button */}
          <button
            onClick={onOpenGoshuin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fcf9f2] hover:bg-[#f5ede0] border border-[#d4c3ab] hover:border-[#b89f81] text-[#4a3b2c] text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#b45309]" />
            <span className="hidden sm:inline font-medium">Goshuinchō</span>
            <span className="bg-[#ebdcc7] px-1.5 py-0.5 rounded text-[10px] text-[#78350f] font-mono font-semibold">
              {goshuinCount}/{SHRINES.length}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl bg-[#fcf9f2] hover:bg-[#f3ebd9] border border-[#d8cabb] text-[#5c4a38] hover:text-[#2c241c] transition-colors cursor-pointer shadow-xs"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#9c8b78]" /> : <Volume2 className="w-4 h-4 text-[#b45309]" />}
          </button>
        </div>
      </header>

      {/* Main Content Area: Map / Directory + Details Sidebar */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Interactive Detailed Japan Map OR Sanctuary Directory */}
        <div
          className={`${
            viewMode === 'directory' || !isMapExpanded
              ? 'lg:col-span-7 xl:col-span-8'
              : 'lg:col-span-12'
          } p-3 sm:p-4 flex flex-col justify-between overflow-hidden relative transition-all duration-300`}
        >
          {/* Top Control Bar: Search, Type Filter, Region Jump Pills & Fullscreen Toggle */}
          <div className="space-y-2 mb-2 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c7a67]" />
                <input
                  type="text"
                  placeholder="Search shrines, temples, regions, blessings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#fdfbf7] border border-[#d8cabb] rounded-xl pl-9 pr-7 py-1.5 text-xs text-[#2c241c] placeholder-[#9c8a77] focus:outline-none focus:border-[#b45309] focus:ring-1 focus:ring-[#b45309]/30 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8c7a67] hover:text-[#2c241c]"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Shinto vs Buddhist Filter */}
              <div className="flex items-center gap-1.5">
                {(['all', 'shrine', 'temple'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTypeFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      typeFilter === filter
                        ? 'bg-[#b91c1c] text-white font-bold shadow-sm'
                        : 'bg-[#fcf9f2] border border-[#d8cabb] text-[#63503d] hover:text-[#2c241c] hover:bg-[#f3ead7]'
                    }`}
                  >
                    {filter === 'all'
                      ? `All (${SHRINES.length})`
                      : filter === 'shrine'
                      ? '⛩️ Shrines'
                      : '🏯 Temples'}
                  </button>
                ))}

                {/* Map Fullscreen / Expand Width Button */}
                {viewMode === 'map' && (
                  <button
                    onClick={() => setIsMapExpanded((prev) => !prev)}
                    className={`p-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                      isMapExpanded
                        ? 'bg-[#b45309] border-[#b45309] text-white'
                        : 'bg-[#fcf9f2] border-[#d8cabb] text-[#63503d] hover:text-[#2c241c] hover:bg-[#f3ead7]'
                    }`}
                    title={isMapExpanded ? 'Collapse Map View (F)' : 'Expand Map Fullscreen (F)'}
                  >
                    {isMapExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    <span className="hidden sm:inline text-[11px]">
                      {isMapExpanded ? 'Split' : 'Full Map'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Region Jump Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="text-[11px] font-semibold text-[#6e5b47] flex items-center gap-1 shrink-0">
                <Compass className="w-3.5 h-3.5 text-[#b45309]" /> Region:
              </span>
              {(Object.keys(REGION_PRESETS) as RegionFilter[]).map((reg) => {
                const preset = REGION_PRESETS[reg];
                const count =
                  reg === 'all'
                    ? SHRINES.length
                    : reg === 'Okinawa'
                    ? SHRINES.filter((s) => s.prefecture.includes('Okinawa') || s.id === 'naminoue-gu').length
                    : SHRINES.filter((s) => s.region === reg).length;
                const isSelected = regionFilter === reg;

                return (
                  <button
                    key={reg}
                    onClick={() => handleSelectRegionPreset(reg)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-[#2c241c] border-[#2c241c] text-[#fef3c7] font-bold shadow-xs'
                        : 'bg-[#fcf9f2] border-[#ded2be] text-[#5a4837] hover:text-[#2c241c] hover:border-[#b89f81] hover:bg-[#f5ede0]'
                    }`}
                  >
                    <span>{preset.kanji}</span>
                    <span className="hidden sm:inline font-sans">{preset.name.split(' ')[0]}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* VIEW 1: HIGH-FIDELITY DETAILED JAPAN VECTOR MAP IN BEIGE */}
          {viewMode === 'map' && (
            <div
              ref={mapViewportRef}
              onDoubleClick={handleDoubleClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative flex-1 bg-[#f4ece0] border border-[#d8c8b0] rounded-2xl overflow-hidden min-h-[420px] shadow-inner select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* TOP-RIGHT ULTRA-CONVENIENT ZOOM & NAVIGATION DOCK */}
              <div className="absolute top-3 right-3 z-30 flex flex-col items-center gap-1.5 bg-[#fcf9f3]/95 p-2 rounded-2xl border border-[#d3c2a9] shadow-xl backdrop-blur-md">
                {/* Primary Large Zoom In Button */}
                <button
                  onClick={handleZoomIn}
                  className="w-9 h-9 rounded-xl bg-[#f5ede0] hover:bg-[#ebdcc4] active:scale-95 text-[#2c241c] flex items-center justify-center font-bold transition-all border border-[#decbb0] shadow-xs cursor-pointer"
                  title="Zoom In (Key: + or Scroll Up)"
                >
                  <ZoomIn className="w-4 h-4 text-[#b91c1c]" />
                </button>

                {/* Percentage Readout */}
                <div className="px-2 py-0.5 rounded-lg bg-[#eee3cf] border border-[#d6c4aa] text-[11px] font-mono font-bold text-[#68533e]">
                  {Math.round(zoomLevel * 100)}%
                </div>

                {/* Primary Large Zoom Out Button */}
                <button
                  onClick={handleZoomOut}
                  className="w-9 h-9 rounded-xl bg-[#f5ede0] hover:bg-[#ebdcc4] active:scale-95 text-[#2c241c] flex items-center justify-center font-bold transition-all border border-[#decbb0] shadow-xs cursor-pointer"
                  title="Zoom Out (Key: - or Scroll Down)"
                >
                  <ZoomOut className="w-4 h-4 text-[#b91c1c]" />
                </button>

                <div className="w-full h-px bg-[#ded0ba] my-1" />

                {/* Vertical Slider for Instant Smooth Zooming */}
                <div className="h-20 flex items-center justify-center py-1">
                  <input
                    type="range"
                    min="0.9"
                    max="3.8"
                    step="0.05"
                    value={zoomLevel}
                    onChange={handleSetZoomSlider}
                    className="accent-[#b91c1c] w-18 h-1.5 rotate-270 cursor-pointer"
                    title="Drag to zoom smoothly"
                  />
                </div>

                <div className="w-full h-px bg-[#ded0ba] my-1" />

                {/* Quick 1-Click Zoom Steps */}
                <div className="flex flex-col gap-1 w-full">
                  {[
                    { label: 'Fit', val: 1.0 },
                    { label: '1.5x', val: 1.5 },
                    { label: '2.5x', val: 2.5 },
                  ].map((step) => (
                    <button
                      key={step.label}
                      onClick={() => zoomAroundPoint(step.val)}
                      className={`px-1 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer text-center ${
                        Math.abs(zoomLevel - step.val) < 0.2
                          ? 'bg-[#b91c1c] text-white'
                          : 'bg-[#f5ede0] hover:bg-[#ebdcc4] text-[#554637]'
                      }`}
                    >
                      {step.label}
                    </button>
                  ))}
                </div>

                <div className="w-full h-px bg-[#ded0ba] my-1" />

                {/* Recenter & Fit All Button */}
                <button
                  onClick={handleResetZoom}
                  className="w-9 h-9 rounded-xl bg-[#f5ede0] hover:bg-[#ebdcc4] active:scale-95 text-[#2c241c] flex items-center justify-center transition-all border border-[#decbb0] shadow-xs cursor-pointer"
                  title="Reset View to All Japan (Key: 0)"
                >
                  <RotateCcw className="w-4 h-4 text-[#786653]" />
                </button>

                {/* Center on Selected Shrine Button */}
                <button
                  onClick={() => centerOnShrine(selectedShrine)}
                  className="w-9 h-9 rounded-xl bg-[#fef2f2] hover:bg-[#fee2e2] active:scale-95 text-[#b91c1c] flex items-center justify-center transition-all border border-[#fca5a5] shadow-xs cursor-pointer"
                  title={`Center on ${selectedShrine.kanjiName}`}
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              {/* TOP-LEFT DIRECTIONAL D-PAD FOR EASY PANNING */}
              <div className="absolute top-3 left-3 z-30 hidden sm:flex flex-col items-center bg-[#fcf9f3]/95 p-1.5 rounded-2xl border border-[#d3c2a9] shadow-lg backdrop-blur-md">
                <button
                  onClick={() => panBy(0, 70)}
                  className="p-1.5 rounded-lg hover:bg-[#ebdcc4] active:scale-95 text-[#554637] transition-all cursor-pointer"
                  title="Pan Up (Arrow Up)"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => panBy(70, 0)}
                    className="p-1.5 rounded-lg hover:bg-[#ebdcc4] active:scale-95 text-[#554637] transition-all cursor-pointer"
                    title="Pan Left (Arrow Left)"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="w-5 h-5 rounded-full bg-[#eee3cf] text-[9px] font-bold text-[#68533e] flex items-center justify-center cursor-pointer hover:bg-[#e4d4bd]"
                    title="Recenter"
                  >
                    •
                  </button>
                  <button
                    onClick={() => panBy(-70, 0)}
                    className="p-1.5 rounded-lg hover:bg-[#ebdcc4] active:scale-95 text-[#554637] transition-all cursor-pointer"
                    title="Pan Right (Arrow Right)"
                  >
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => panBy(0, -70)}
                  className="p-1.5 rounded-lg hover:bg-[#ebdcc4] active:scale-95 text-[#554637] transition-all cursor-pointer"
                  title="Pan Down (Arrow Down)"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* BOTTOM-LEFT CONVENIENT LEGEND & MINI-NAVIGATOR */}
              <div className="absolute bottom-3 left-3 z-30 flex flex-col gap-2">
                <div className="bg-[#fdfbf6]/95 border border-[#d8c8b0] rounded-xl px-3 py-2 text-[10px] text-[#5a4836] shadow-lg backdrop-blur-sm max-w-[260px]">
                  <div className="flex items-center justify-between gap-3 font-semibold pb-1 border-b border-[#ebdcc7]">
                    <span className="flex items-center gap-1 text-[#b91c1c]">
                      <span>⛩️</span> Shinto Shrine
                    </span>
                    <span className="flex items-center gap-1 text-[#b45309]">
                      <span>🏯</span> Buddhist Temple
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-[#806c57] mt-1.5 text-[9px]">
                    <span className="flex items-center gap-1 font-mono">
                      <Move className="w-3 h-3 text-[#b45309]" />
                      Scroll or + / - to zoom
                    </span>
                    <button
                      onClick={() => setShowHelpModal(true)}
                      className="text-[#b45309] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                    >
                      <HelpCircle className="w-3 h-3" /> Guide
                    </button>
                  </div>
                </div>
              </div>

              {/* Transform Container with Smooth Pan & Zoom (translate in px, scale centered) */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out relative"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              >
                {/* HIGH-FIDELITY BEIGE VECTOR MAP OF JAPAN */}
                <svg
                  viewBox="0 0 900 650"
                  className="w-full h-full max-h-[640px] drop-shadow-[0_8px_20px_rgba(110,88,60,0.12)]"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    {/* Washi Paper Ocean Background & Gradients */}
                    <linearGradient id="oceanBeige" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f5ede0" />
                      <stop offset="50%" stopColor="#f0e5d1" />
                      <stop offset="100%" stopColor="#eae0ca" />
                    </linearGradient>

                    {/* Regional Land Gradients in Warm Sand & Earthy Tones */}
                    <linearGradient id="honshuBeige" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e2d3bb" />
                      <stop offset="50%" stopColor="#d9c7ac" />
                      <stop offset="100%" stopColor="#cfbc9f" />
                    </linearGradient>

                    <linearGradient id="kantoBeige" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#dfcfb4" />
                      <stop offset="100%" stopColor="#d3c09e" />
                    </linearGradient>

                    <linearGradient id="kansaiBeige" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#dfceb1" />
                      <stop offset="100%" stopColor="#d2bf9f" />
                    </linearGradient>

                    {/* Water Seigaiha / Ripple Pattern */}
                    <pattern id="waterRipple" width="40" height="20" patternUnits="userSpaceOnUse">
                      <path
                        d="M 0 10 Q 10 0 20 10 Q 30 20 40 10"
                        fill="none"
                        stroke="#e2d4bd"
                        strokeWidth="0.8"
                        strokeOpacity="0.45"
                      />
                    </pattern>
                  </defs>

                  {/* Ocean Base Layer */}
                  <rect width="900" height="650" fill="url(#oceanBeige)" />
                  <rect width="900" height="650" fill="url(#waterRipple)" />

                  {/* Concentric Ocean Sounding Rings */}
                  <ellipse cx="460" cy="380" rx="400" ry="250" fill="none" stroke="#e0d0b8" strokeWidth="1" strokeDasharray="3 6" />
                  <ellipse cx="460" cy="380" rx="300" ry="180" fill="none" stroke="#e3d4bd" strokeWidth="0.8" />

                  {/* Latitude / Longitude Graticule Grid */}
                  <g stroke="#dfd1b8" strokeWidth="0.8" strokeDasharray="2 4">
                    <line x1="50" y1="120" x2="850" y2="120" />
                    <line x1="50" y1="240" x2="850" y2="240" />
                    <line x1="50" y1="360" x2="850" y2="360" />
                    <line x1="50" y1="480" x2="850" y2="480" />
                    <line x1="50" y1="600" x2="850" y2="600" />
                    <line x1="160" y1="50" x2="160" y2="620" />
                    <line x1="300" y1="50" x2="300" y2="620" />
                    <line x1="440" y1="50" x2="440" y2="620" />
                    <line x1="580" y1="50" x2="580" y2="620" />
                    <line x1="720" y1="50" x2="720" y2="620" />
                  </g>

                  {/* Degree Labels */}
                  <g fill="#9c876e" fontSize="9" fontFamily="monospace">
                    <text x="60" y="115">44°N</text>
                    <text x="60" y="235">40°N</text>
                    <text x="60" y="355">36°N</text>
                    <text x="60" y="475">34°N</text>
                    <text x="60" y="595">32°N</text>
                    <text x="165" y="615">130°E</text>
                    <text x="305" y="615">134°E</text>
                    <text x="445" y="615">136°E</text>
                    <text x="585" y="615">140°E</text>
                    <text x="725" y="615">144°E</text>
                  </g>

                  {/* TRADITIONAL COMPASS ROSE (Hōgaku 方位盤) in Ocean Corner */}
                  <g transform="translate(115, 120)">
                    <circle cx="0" cy="0" r="32" fill="none" stroke="#cbb89e" strokeWidth="1" />
                    <circle cx="0" cy="0" r="26" fill="none" stroke="#d8c7b0" strokeWidth="0.8" strokeDasharray="2 3" />
                    <polygon points="0,-28 5,-4 0,0 -5,-4" fill="#b91c1c" />
                    <polygon points="0,28 5,4 0,0 -5,4" fill="#786653" />
                    <polygon points="-28,0 -4,5 0,0 -4,-5" fill="#8c7863" />
                    <polygon points="28,0 4,5 0,0 4,-5" fill="#8c7863" />
                    <circle cx="0" cy="0" r="3.5" fill="#b45309" />
                    <text x="0" y="-34" textAnchor="middle" fill="#b91c1c" fontSize="11" fontFamily="Noto Serif JP" fontWeight="bold">北</text>
                    <text x="36" y="4" textAnchor="middle" fill="#786653" fontSize="10" fontFamily="Noto Serif JP">東</text>
                    <text x="0" y="42" textAnchor="middle" fill="#786653" fontSize="10" fontFamily="Noto Serif JP">南</text>
                    <text x="-36" y="4" textAnchor="middle" fill="#786653" fontSize="10" fontFamily="Noto Serif JP">西</text>
                  </g>

                  {/* 1. HOKKAIDO (Detailed Northern Island) */}
                  <path
                    d="M 648,58 
                       C 670,45 710,50 740,65 
                       C 765,78 790,82 825,92 
                       C 840,96 845,108 830,118 
                       C 810,132 795,145 780,165 
                       C 760,190 735,210 705,215 
                       C 680,220 660,195 645,185 
                       C 630,175 625,188 610,210 
                       C 595,232 580,230 575,210 
                       C 570,190 580,172 590,158 
                       C 605,138 615,115 628,95 
                       C 635,82 640,68 648,58 Z"
                    fill="#dbcca8"
                    stroke="#8c785e"
                    strokeWidth="1.6"
                  />
                  {/* Hokkaido Oshima Peninsula */}
                  <path
                    d="M 585,190 
                       C 570,205 560,225 572,245 
                       C 580,255 595,250 600,235 
                       C 605,220 598,200 585,190 Z"
                    fill="#dbcca8"
                    stroke="#8c785e"
                    strokeWidth="1.4"
                  />

                  {/* Tsugaru Strait dotted sea lane */}
                  <path d="M 560,250 Q 610,248 640,255" fill="none" stroke="#d5c4aa" strokeWidth="1" strokeDasharray="3 3" />

                  {/* 2. HONSHU (Main Island - Tohoku & Northern Honshu) */}
                  <path
                    d="M 590,248 
                       C 608,252 618,270 615,295 
                       C 612,320 622,338 618,365 
                       C 615,385 605,405 588,420 
                       C 570,435 550,448 535,455 
                       C 525,440 520,415 510,395 
                       C 502,375 515,350 518,330 
                       C 522,305 515,285 528,265 
                       C 542,245 568,242 590,248 Z"
                    fill="url(#honshuBeige)"
                    stroke="#8c785e"
                    strokeWidth="1.6"
                  />

                  {/* Central Honshu: Kanto Plain, Chubu & Mt. Fuji Peninsula */}
                  <path
                    d="M 588,418 
                       C 610,430 625,445 615,475 
                       C 608,495 585,502 568,490 
                       C 555,480 550,495 540,510 
                       C 530,525 518,520 510,505 
                       C 498,485 505,465 520,455 
                       C 540,440 565,430 588,418 Z"
                    fill="url(#kantoBeige)"
                    stroke="#8c785e"
                    strokeWidth="1.6"
                  />

                  {/* Boso Peninsula (Chiba) & Miura Peninsula */}
                  <path
                    d="M 615,470 C 625,485 628,505 615,518 C 605,515 600,498 605,482 Z"
                    fill="url(#kantoBeige)"
                    stroke="#8c785e"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M 580,495 C 582,510 575,518 570,510 C 572,500 578,495 580,495 Z"
                    fill="url(#kantoBeige)"
                    stroke="#8c785e"
                    strokeWidth="1.0"
                  />

                  {/* Western Honshu: Kansai & Kii Peninsula */}
                  <path
                    d="M 522,460 
                       C 510,480 495,510 490,535 
                       C 485,560 465,565 450,545 
                       C 438,530 442,505 450,490 
                       C 460,470 480,460 522,460 Z"
                    fill="url(#kansaiBeige)"
                    stroke="#8c785e"
                    strokeWidth="1.6"
                  />

                  {/* Lake Biwa (琵琶湖) in Kansai */}
                  <ellipse cx="488" cy="485" rx="8" ry="14" fill="#c4d8ce" stroke="#7a9689" strokeWidth="1" />
                  <text x="498" y="488" fill="#5c7a6c" fontSize="8" fontFamily="Noto Serif JP">琵琶湖</text>

                  {/* Western Honshu: Chugoku Region */}
                  <path
                    d="M 450,480 
                       C 430,475 390,475 360,485 
                       C 335,495 305,508 285,528 
                       C 275,538 282,550 300,542 
                       C 325,530 360,525 395,518 
                       C 425,512 445,500 450,480 Z"
                    fill="url(#honshuBeige)"
                    stroke="#8c785e"
                    strokeWidth="1.6"
                  />

                  {/* Sado Island */}
                  <path
                    d="M 532,328 C 542,322 548,335 540,342 C 532,348 526,335 532,328 Z"
                    fill="#d7c7a7"
                    stroke="#8c785e"
                    strokeWidth="1.2"
                  />

                  {/* Noto Peninsula */}
                  <path
                    d="M 488,405 C 480,380 495,365 505,375 C 510,385 498,412 488,405 Z"
                    fill="#d7c7a7"
                    stroke="#8c785e"
                    strokeWidth="1.2"
                  />

                  {/* 3. SHIKOKU ISLAND */}
                  <path
                    d="M 370,535 
                       C 400,528 435,532 442,555 
                       C 445,572 430,590 405,595 
                       C 375,600 350,580 345,560 
                       C 342,548 355,540 370,535 Z"
                    fill="#d8c8a8"
                    stroke="#8c785e"
                    strokeWidth="1.6"
                  />
                  {/* Awaji Island in Seto Inland Sea */}
                  <path
                    d="M 445,528 C 450,522 455,532 450,540 C 445,542 440,535 445,528 Z"
                    fill="#d8c8a8"
                    stroke="#8c785e"
                    strokeWidth="1.0"
                  />

                  {/* 4. KYUSHU ISLAND */}
                  <path
                    d="M 270,518 
                       C 290,528 298,552 288,580 
                       C 278,608 265,630 240,635 
                       C 215,638 198,615 205,585 
                       C 210,560 225,540 245,525 
                       C 255,518 262,514 270,518 Z"
                    fill="#d7c6a6"
                    stroke="#8c785e"
                    strokeWidth="1.6"
                  />
                  {/* Nagasaki & Shimabara Peninsula */}
                  <path
                    d="M 215,550 C 195,558 192,575 205,582 C 215,578 222,562 215,550 Z"
                    fill="#d7c6a6"
                    stroke="#8c785e"
                    strokeWidth="1.2"
                  />

                  {/* 5. OKINAWA / RYUKYU INSET MINI-MAP */}
                  <g transform="translate(60, 480)">
                    <rect x="0" y="0" width="115" height="85" rx="8" fill="#fcf8f0" stroke="#b45309" strokeWidth="1.2" />
                    <text x="10" y="16" fill="#b45309" fontSize="9" fontFamily="Cinzel" fontWeight="bold">OKINAWA (沖縄)</text>
                    <path
                      d="M 25,68 C 40,54 55,42 75,28 C 85,22 90,28 82,36 C 68,50 52,62 35,76 Z"
                      fill="#d8c8a8"
                      stroke="#8c785e"
                      strokeWidth="1.4"
                    />
                    <circle cx="40" cy="65" r="3" fill="#b91c1c" />
                    <text x="48" y="68" fill="#5a4836" fontSize="8" fontFamily="Noto Serif JP" fontWeight="bold">那覇 (Naha)</text>
                  </g>

                  {/* SACRED MOUNT FUJI MARKER */}
                  <g transform="translate(545, 488)">
                    <polygon points="0,-8 7,4 -7,4" fill="#fef3c7" stroke="#b45309" strokeWidth="1.2" />
                    <polygon points="0,-8 3,-2 -3,-2" fill="#ffffff" />
                    <text x="9" y="0" fill="#b45309" fontSize="9" fontFamily="Noto Serif JP" fontWeight="bold">▲ 富士山</text>
                    <text x="9" y="9" fill="#786653" fontSize="7" fontFamily="monospace">3,776m</text>
                  </g>

                  {/* Regional Calligraphy Labels on Map */}
                  <text x="700" y="135" fill="#7a6952" fontSize="13" fontFamily="Cinzel" letterSpacing="3" fontWeight="bold">HOKKAIDO</text>
                  <text x="548" y="310" fill="#7a6952" fontSize="12" fontFamily="Cinzel" letterSpacing="2">TOHOKU</text>
                  <text x="585" y="445" fill="#8c6c44" fontSize="13" fontFamily="Cinzel" letterSpacing="2" fontWeight="bold">KANTO</text>
                  <text x="440" y="455" fill="#7a6952" fontSize="11" fontFamily="Cinzel" letterSpacing="1">CHUBU</text>
                  <text x="455" y="535" fill="#8c6c44" fontSize="13" fontFamily="Cinzel" letterSpacing="2" fontWeight="bold">KANSAI</text>
                  <text x="330" y="505" fill="#7a6952" fontSize="11" fontFamily="Cinzel" letterSpacing="2">CHUGOKU</text>
                  <text x="375" y="570" fill="#7a6952" fontSize="11" fontFamily="Cinzel" letterSpacing="2">SHIKOKU</text>
                  <text x="225" y="585" fill="#8c6c44" fontSize="12" fontFamily="Cinzel" letterSpacing="2" fontWeight="bold">KYUSHU</text>

                  {/* Detailed City & Prefecture Sub-Labels when Zoomed In */}
                  {zoomLevel >= 1.4 && (
                    <g fill="#6d5843" fontSize="8" fontFamily="Noto Serif JP" opacity="0.85">
                      <text x="618" y="468">● 東京 (Tokyo)</text>
                      <text x="596" y="500">● 鎌倉 (Kamakura)</text>
                      <text x="622" y="420">● 日光 (Nikko)</text>
                      <text x="480" y="515">● 京都 (Kyoto)</text>
                      <text x="495" y="542">● 奈良 (Nara)</text>
                      <text x="522" y="555">● 伊勢 (Ise)</text>
                      <text x="502" y="525">● 名古屋 (Nagoya)</text>
                      <text x="540" y="442">● 長野 (Nagano)</text>
                      <text x="358" y="545">● 広島 (Hiroshima)</text>
                      <text x="375" y="490">● 出雲 (Izumo)</text>
                      <text x="250" y="545">● 福岡 (Fukuoka)</text>
                      <text x="708" y="172">● 札幌 (Sapporo)</text>
                      <text x="645" y="315">● 平泉 (Hiraizumi)</text>
                    </g>
                  )}

                  {/* Surrounding Seas in Classic Calligraphy */}
                  <text x="310" y="380" fill="#b5a48d" fontSize="15" letterSpacing="6" fontFamily="Cinzel" fontStyle="italic">SEA OF JAPAN (日本海)</text>
                  <text x="570" y="580" fill="#b5a48d" fontSize="15" letterSpacing="6" fontFamily="Cinzel" fontStyle="italic">PACIFIC OCEAN (太平洋)</text>
                  <text x="345" y="530" fill="#a8967f" fontSize="9" fontStyle="italic" fontFamily="serif">Seto Inland Sea (瀬戸内海)</text>
                </svg>

                {/* INTERACTIVE MARKERS OVERLAID PRECISELY ON MAP */}
                {/* Note: We apply counter-scaling so pins stay compact and don't clump when zoomed in! */}
                {filteredShrines.map((shrine) => {
                  const isSelected = shrine.id === selectedId;
                  const isHovered = hoveredShrine?.id === shrine.id;

                  return (
                    <div
                      key={shrine.id}
                      style={{
                        left: `${shrine.mapCoords.x}%`,
                        top: `${shrine.mapCoords.y}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePickShrine(shrine);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleEnterWorld(shrine);
                      }}
                      onMouseEnter={() => setHoveredShrine(shrine)}
                      onMouseLeave={() => setHoveredShrine(null)}
                    >
                      {/* Counter-scaling wrapper */}
                      <div
                        style={{
                          transform: `scale(${pinCounterScale})`,
                          transformOrigin: 'bottom center',
                        }}
                        className="relative flex flex-col items-center"
                      >
                        {/* Radiating animated pulse ring if selected */}
                        {isSelected && (
                          <div className="absolute -inset-3 rounded-full bg-[#b91c1c]/30 border-2 border-[#b91c1c] animate-ping pointer-events-none" />
                        )}

                        {/* Floating Name Badge - Compact and High Contrast */}
                        <div
                          className={`mb-1 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none transition-all flex items-center gap-1 border ${
                            isSelected
                              ? 'bg-[#2c241c] border-[#b45309] text-[#fef3c7] text-xs font-bold scale-105 z-30 shadow-lg'
                              : isHovered
                              ? 'bg-[#fdfaf3] border-[#b91c1c] text-[#2c241c] text-[11px] font-bold z-20 shadow-md'
                              : 'bg-[#fdfbf7]/95 border-[#ded2be] text-[#3d3124] text-[10px] opacity-90'
                          }`}
                        >
                          <span className="font-kanji font-bold">{shrine.kanjiName.split('（')[0]}</span>
                          <span className="text-[#806c57] font-sans hidden sm:inline text-[9px]">
                            {shrine.name.split('(')[0]}
                          </span>
                        </div>

                        {/* Marker Pin Button */}
                        <button
                          className={`flex items-center justify-center transition-all duration-200 rounded-2xl cursor-pointer shadow-md ${
                            isSelected
                              ? 'w-10 h-10 bg-gradient-to-br from-[#b91c1c] via-[#ea580c] to-[#b91c1c] text-white ring-3 ring-[#fef08a] shadow-[#991b1b]/50 animate-bounce'
                              : shrine.type === 'shrine'
                              ? 'w-8 h-8 bg-[#fdfaf5] border-2 border-[#b91c1c] text-[#b91c1c] hover:scale-115 hover:bg-[#b91c1c] hover:text-white hover:shadow-lg'
                              : 'w-8 h-8 bg-[#fdfaf5] border-2 border-[#b45309] text-[#b45309] hover:scale-115 hover:bg-[#b45309] hover:text-white hover:shadow-lg'
                          }`}
                        >
                          <span className={isSelected ? 'text-lg' : 'text-sm'}>
                            {shrine.type === 'shrine' ? '⛩️' : '🏯'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: SANCTUARY DIRECTORY CATALOG (All Shrines & Temples Card Grid) */}
          {viewMode === 'directory' && (
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 bg-[#f5eee2] rounded-2xl border border-[#ded0bb] p-3 sm:p-4">
              <div className="flex items-center justify-between text-xs text-[#6e5a47] mb-1 px-1">
                <span>Showing {filteredShrines.length} of {SHRINES.length} Historic Sanctuaries</span>
                <span>Click any card to inspect or enter in 3D</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredShrines.map((shrine) => {
                  const isSelected = shrine.id === selectedId;

                  return (
                    <div
                      key={shrine.id}
                      onClick={() => handlePickShrine(shrine, true)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-[#fcf8f0] border-[#b45309] shadow-md ring-2 ring-[#b45309]/30'
                          : 'bg-[#fbf7ee] border-[#ded2bd] hover:border-[#bda991] hover:bg-[#f6efe1]'
                      }`}
                    >
                      <div>
                        {/* Top Metadata Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
                              shrine.type === 'shrine'
                                ? 'bg-[#fef2f2] border-[#fca5a5] text-[#b91c1c]'
                                : 'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
                            }`}
                          >
                            <span>{shrine.type === 'shrine' ? '⛩️ Shinto Shrine' : '🏯 Buddhist Temple'}</span>
                          </span>

                          <span className="text-[10px] text-[#715f4e] font-mono">
                            {shrine.region} • {shrine.prefecture}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="mt-2">
                          <h3 className="text-sm font-bold text-[#2c241c] flex items-center gap-1.5 font-cinzel">
                            <span>{shrine.name}</span>
                          </h3>
                          <div className="text-xs text-[#b45309] font-kanji font-bold mt-0.5">
                            {shrine.kanjiName}
                          </div>
                        </div>

                        {/* Divine Blessing Tagline */}
                        <p className="text-[11px] text-[#554637] mt-1.5 line-clamp-2">
                          {shrine.tagline}
                        </p>
                      </div>

                      {/* Bottom Footer Actions */}
                      <div className="pt-2 border-t border-[#ded1be] flex items-center justify-between gap-2">
                        <span className="text-[10px] text-[#854d0e] font-mono font-medium truncate">
                          ★ {shrine.primaryBlessing.split(',')[0]}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEnterWorld(shrine);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#b91c1c] to-[#ea580c] hover:from-[#991b1b] hover:to-[#c2410c] text-white font-semibold text-[11px] shadow transition-transform active:scale-95 cursor-pointer shrink-0 flex items-center gap-1"
                        >
                          <span>Visit 3D</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Quick-Select Thumbnail Carousel */}
          <div className="mt-2 pt-2 border-t border-[#ded0ba] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
            <span className="text-[11px] font-semibold text-[#6e5a47] shrink-0 hidden md:inline">
              Sanctuaries ({filteredShrines.length}):
            </span>
            {filteredShrines.map((shrine) => {
              const isSelected = shrine.id === selectedId;

              return (
                <button
                  key={shrine.id}
                  onClick={() => handlePickShrine(shrine, true)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#2c241c] border-[#2c241c] text-[#fef3c7] font-bold shadow-sm'
                      : 'bg-[#fcf8ee] border-[#ded0ba] text-[#554637] hover:text-[#2c241c] hover:border-[#b89f81] hover:bg-[#f6eee0]'
                  }`}
                >
                  <span>{shrine.type === 'shrine' ? '⛩️' : '🏯'}</span>
                  <span className="font-kanji">{shrine.kanjiName.split('（')[0]}</span>
                  <span className="text-[10px] opacity-75 font-mono">({shrine.region})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Rich Shrine Detail & 3D Exploration Launch Drawer in Beige */}
        {/* Can be collapsed when map is expanded, or kept visible */}
        <div
          className={`${
            isMapExpanded && viewMode === 'map' ? 'hidden' : 'lg:col-span-5 xl:col-span-4'
          } bg-[#fbf7f0] border-t lg:border-t-0 lg:border-l border-[#ded2bd] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto transition-all duration-300`}
        >
          <div className="space-y-3.5">
            {/* Visual Header Banner representing shrine atmosphere */}
            <div className="relative rounded-2xl overflow-hidden border border-[#d8c29e] bg-gradient-to-br from-[#854d0e] via-[#991b1b] to-[#7f1d1d] p-5 shadow-lg text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#fef08a]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Shrine Type & Region Pills */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center gap-1">
                  <span>{selectedShrine.type === 'shrine' ? '⛩️ Shinto Shrine (神社)' : '🏯 Buddhist Temple (寺院)'}</span>
                </span>

                <span className="text-xs font-mono font-medium text-[#fef08a] bg-black/30 px-2 py-0.5 rounded-md border border-white/20">
                  Est. {selectedShrine.establishedYear}
                </span>
              </div>

              {/* Main Kanji & English Titles */}
              <h2 className="text-2xl sm:text-3xl font-kanji font-bold text-white tracking-wide mt-1">
                {selectedShrine.kanjiName}
              </h2>
              <div className="text-sm font-cinzel font-semibold text-[#fef08a] mt-0.5">
                {selectedShrine.name}
              </div>
              <p className="text-xs text-[#fed7aa] font-sans mt-0.5">
                {selectedShrine.prefecture} Prefecture • {selectedShrine.region} Region
              </p>

              {/* Tagline */}
              <div className="mt-3 pt-3 border-t border-white/20 text-xs italic text-[#fef3c7] font-serif">
                "{selectedShrine.tagline}"
              </div>
            </div>

            {/* Sacred Deity / Buddha & Blessings in Warm Parchment Cards */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="p-3 rounded-xl bg-[#f5ece0] border border-[#d8cabb]">
                <div className="text-[10px] text-[#9a3412] uppercase tracking-widest font-mono font-bold flex items-center gap-1">
                  <Landmark className="w-3 h-3 text-[#b45309]" />
                  {selectedShrine.type === 'shrine' ? 'Enshrined Kami (御祭神)' : 'Principal Buddha (本尊)'}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#2c241c] mt-1">
                  {selectedShrine.enshrinedDeityOrBuddha}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f5ece0] border border-[#d8cabb]">
                <div className="text-[10px] text-[#b91c1c] uppercase tracking-widest font-mono font-bold flex items-center gap-1">
                  <Heart className="w-3 h-3 text-[#b91c1c]" />
                  Primary Divine Blessing (ご利益)
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#7c2d12] mt-1">
                  {selectedShrine.primaryBlessing}
                </div>
              </div>
            </div>

            {/* Cultural History Lore Description */}
            <div className="p-3.5 rounded-xl bg-[#f7efe3] border border-[#d9ccb9] text-xs text-[#4a3b2b] leading-relaxed font-sans shadow-xs">
              {selectedShrine.description}
            </div>

            {/* Key 3D Sacred Spots to Explore */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-[#3d3124] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#b45309]" />
                <span>Sacred Grounds & Interactive Spots (境内見どころ)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {selectedShrine.spots.map((spot) => (
                  <div
                    key={spot.id}
                    className="p-2 rounded-lg bg-[#f5eee2] border border-[#ded1be] text-[11px] text-[#4a3b2c] flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#b45309] shrink-0" />
                    <span className="truncate">{spot.japaneseName} • {spot.name.split('(')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Goshuin Stamp Book Preview */}
            <div className="p-3 rounded-xl bg-[#f5ece0] border border-[#d8cabb] flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#b91c1c] border border-[#991b1b] flex items-center justify-center text-white font-kanji font-bold text-xs shadow-xs">
                  朱印
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2c241c]">
                    Sacred Goshuin Stamp Seal
                  </div>
                  <div className="text-[10px] text-[#715f4e] font-kanji">
                    {selectedShrine.goshuinStamp.templeSealName}
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenGoshuin}
                className="text-xs text-[#b45309] hover:text-[#92400e] underline font-semibold cursor-pointer"
              >
                View Stamp Book
              </button>
            </div>
          </div>

          {/* Primary Call to Action Button: Enter in 3D */}
          <div className="mt-4 pt-3 border-t border-[#ded1be]">
            <button
              onClick={() => handleEnterWorld(selectedShrine)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#b91c1c] via-[#ea580c] to-[#b91c1c] hover:from-[#991b1b] hover:to-[#c2410c] text-white font-cinzel font-bold text-sm sm:text-base border border-[#fef08a]/80 shadow-lg shadow-[#b91c1c]/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 text-[#fef08a] group-hover:rotate-12 transition-transform" />
              <span>Enter Sacred Grounds in 3D (参拝する)</span>
              <ArrowRight className="w-4 h-4 text-[#fef08a] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Quick Navigation Help Modal */}
      {showHelpModal && (
        <div
          onClick={() => setShowHelpModal(false)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fcf8f0] border-2 border-[#b45309] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#ebdcc7]">
              <h3 className="font-cinzel font-bold text-lg text-[#2c241c] flex items-center gap-2">
                <span>🗺️ Map Navigation & Zoom Controls</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="w-7 h-7 rounded-lg bg-[#ebdcc7] text-[#554637] hover:bg-[#d8c5ab] flex items-center justify-center font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#4a3b2b]">
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-[#eee3cf] font-mono font-bold shrink-0">Scroll Wheel</span>
                <span>Zoom smoothly in and out directly towards your cursor.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-[#eee3cf] font-mono font-bold shrink-0">Click & Drag</span>
                <span>Click and hold anywhere on the map to pan around Japan.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-[#eee3cf] font-mono font-bold shrink-0">Double Click</span>
                <span>Double-click anywhere to zoom in directly onto that region.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-[#eee3cf] font-mono font-bold shrink-0">+ / - / 0</span>
                <span>Keyboard keys to zoom in, zoom out, or reset view.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-[#eee3cf] font-mono font-bold shrink-0">Arrow Keys</span>
                <span>Use keyboard arrows to pan the map without dragging.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="px-2 py-0.5 rounded bg-[#eee3cf] font-mono font-bold shrink-0">F Key / Full Map</span>
                <span>Expand map across full screen width for spacious exploration.</span>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#b91c1c] text-white font-semibold text-xs shadow-md hover:bg-[#991b1b] cursor-pointer"
            >
              Got it, let me explore!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
