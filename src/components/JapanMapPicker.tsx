import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { SHRINES } from '../data/shrinesData';
import { ShrineData, ShrineType } from '../types/shrine';
import { soundService } from '../services/soundService';
import { LuckChip } from './LuckAndLegends';
import { WISHES, WISH_ORDER, wishesOf, hasWish, type WishId } from '../data/wishesData';
import { MAP_W, MAP_H, JAPAN_MAINLAND_PATH, OKINAWA_INSET, GRATICULE, MAP_LABELS } from '../data/japanGeo';
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
  onOpenLuck?: () => void;
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

const REGION_PRESETS: Record<RegionFilter, { name: string; kanji: string }> = {
  all: { name: 'All Japan', kanji: '全国' },
  Kanto: { name: 'Kanto (Tokyo/Nikko)', kanji: '関東' },
  Kansai: { name: 'Kansai (Kyoto/Nara/Mie)', kanji: '関西' },
  Chubu: { name: 'Chubu (Nagano/Nagoya)', kanji: '中部' },
  Tohoku: { name: 'Tohoku (Hiraizumi)', kanji: '東北' },
  Chugoku: { name: 'Chugoku (Hiroshima/Izumo)', kanji: '中国' },
  Shikoku: { name: 'Shikoku (Sanuki)', kanji: '四国' },
  Kyushu: { name: 'Kyushu (Fukuoka)', kanji: '九州' },
  Hokkaido: { name: 'Hokkaido (Sapporo)', kanji: '北海道' },
  Okinawa: { name: 'Okinawa (Naha)', kanji: '沖縄' },
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;
const clampZoom = (z: number) => Math.min(Math.max(Number(z.toFixed(2)), MIN_ZOOM), MAX_ZOOM);

export const JapanMapPicker: React.FC<JapanMapPickerProps> = ({
  onSelectShrine,
  onOpenGoshuin,
  goshuinCount,
  onOpenDailyPilgrimage,
  onOpenLuck,
  dailyProgress,
}) => {
  const [selectedId, setSelectedId] = useState<string>(SHRINES[0].id);
  const [typeFilter, setTypeFilter] = useState<'all' | ShrineType>('all');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('all');
  const [wishFilter, setWishFilter] = useState<'all' | WishId>('all');
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
  const mapBoxRef = useRef<HTMLDivElement>(null);
  const [mapBoxWidth, setMapBoxWidth] = useState(900);

  // Track the rendered (un-zoomed) width of the map box so pin spacing can be computed in screen pixels
  useEffect(() => {
    const el = mapBoxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMapBoxWidth(el.offsetWidth || 900));
    ro.observe(el);
    setMapBoxWidth(el.offsetWidth || 900);
    return () => ro.disconnect();
  }, [viewMode]);
  const touchDistanceRef = useRef<number | null>(null);

  const selectedShrine = useMemo(() => {
    return SHRINES.find((s) => s.id === selectedId) || SHRINES[0];
  }, [selectedId]);

  // Filter shrines by search query, type, and region
  const filteredShrines = useMemo(() => {
    return SHRINES.filter((shrine) => {
      if (typeFilter !== 'all' && shrine.type !== typeFilter) return false;
      if (wishFilter !== 'all' && !hasWish(shrine.id, wishFilter)) return false;
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
        const matchesWish = wishesOf(shrine.id).some((w) => {
          const c = WISHES[w.wish];
          return c.en.toLowerCase().includes(q) || c.short.toLowerCase().includes(q) || c.jp.includes(q) || c.reading.includes(q);
        });
        if (!matchesName && !matchesLocation && !matchesBlessing && !matchesDeity && !matchesWish) {
          return false;
        }
      }
      return true;
    });
  }, [typeFilter, regionFilter, wishFilter, searchQuery]);

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

  // Pan offset (screen px) that puts a point given in map % at the viewport centre for a given zoom
  const panToCenter = (xPct: number, yPct: number, zoom: number) => {
    const box = mapBoxRef.current;
    const bw = box?.offsetWidth ?? 900;
    const bh = box?.offsetHeight ?? 650;
    return {
      x: -zoom * (xPct / 100 - 0.5) * bw,
      y: -zoom * (yPct / 100 - 0.5) * bh,
    };
  };

  const centerOnShrine = (shrine: ShrineData) => {
    const targetZoom = clampZoom(Math.max(zoomLevel, 2.6));
    setZoomLevel(targetZoom);
    setPanOffset(panToCenter(shrine.mapCoords.x, shrine.mapCoords.y, targetZoom));
  };

  // Zoom/pan so every listed shrine fits comfortably in view
  const fitToShrines = (list: ShrineData[]) => {
    if (list.length === 0 || list.length === SHRINES.length) {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      return;
    }
    const xs = list.map((s) => s.mapCoords.x);
    const ys = list.map((s) => s.mapCoords.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const vp = mapViewportRef.current;
    const box = mapBoxRef.current;
    const vw = vp?.clientWidth ?? 900, vh = vp?.clientHeight ?? 650;
    const bw = box?.offsetWidth ?? 900, bh = box?.offsetHeight ?? 650;
    const spanW = Math.max(((maxX - minX) / 100) * bw, 1);
    const spanH = Math.max(((maxY - minY) / 100) * bh, 1);
    const zoom = clampZoom(Math.min((vw * 0.55) / spanW, (vh * 0.55) / spanH, 3.2));
    setZoomLevel(zoom);
    setPanOffset(panToCenter((minX + maxX) / 2, (minY + maxY) / 2, zoom));
  };

  const handleEnterWorld = (shrine: ShrineData) => {
    soundService.playTempleGong();
    onSelectShrine(shrine);
  };

  const handleSelectRegionPreset = (region: RegionFilter) => {
    setRegionFilter(region);
    const inRegion =
      region === 'all'
        ? SHRINES
        : region === 'Okinawa'
        ? SHRINES.filter((s) => s.prefecture.toLowerCase().includes('okinawa'))
        : SHRINES.filter((s) => s.region === region);
    fitToShrines(wishFilter === 'all' ? inRegion : inRegion.filter((s) => hasWish(s.id, wishFilter)));
    soundService.playFootstep();
  };

  const inRegionFilter = (s: ShrineData) =>
    regionFilter === 'all' ? true : regionFilter === 'Okinawa' ? s.prefecture.toLowerCase().includes('okinawa') : s.region === regionFilter;

  const handleSelectWish = (w: 'all' | WishId) => {
    const next = w === wishFilter ? 'all' : w;
    setWishFilter(next);
    const list = SHRINES.filter((s) => inRegionFilter(s) && (next === 'all' || hasWish(s.id, next)));
    fitToShrines(list.length === SHRINES.length ? SHRINES : list);
    // keep the details panel on something that matches
    if (next !== 'all' && list.length && !list.some((s) => s.id === selectedId)) setSelectedId(list[0].id);
    soundService.playZenTone(next === 'all' ? 0 : WISH_ORDER.indexOf(next) % 5);
  };

  // Zoom towards a specific point (mouse cursor or center)
  const zoomAroundPoint = useCallback(
    (nextZoom: number, clientX?: number, clientY?: number) => {
      const clampedZoom = clampZoom(nextZoom);
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
          x: clampedZoom === 1 ? 0 : newPanX,
          y: clampedZoom === 1 ? 0 : newPanY,
        });
      } else {
        setZoomLevel(clampedZoom);
      }
    },
    [zoomLevel, panOffset]
  );

  // Zoom controls
  const handleZoomIn = () => {
    zoomAroundPoint(zoomLevel * 1.35);
    soundService.playFootstep();
  };

  const handleZoomOut = () => {
    zoomAroundPoint(zoomLevel / 1.35);
    soundService.playFootstep();
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setRegionFilter('all');
    setWishFilter('all');
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
      const targetZoom = clampZoom(zoomLevel * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
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
    zoomAroundPoint(zoomLevel * 1.6, e.clientX, e.clientY);
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
        const next = clampZoom(zoomLevel * factor);
        setZoomLevel(Number(next.toFixed(2)));
        touchDistanceRef.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Pins keep a constant on-screen size whatever the zoom (a bit smaller when the map itself is small)
  const pinSize = mapBoxWidth < 600 ? 0.72 : 1;
  const pinCounterScale = pinSize / zoomLevel;

  // Pin layout in viewBox units. Pins that would overlap on screen (e.g. three Kyoto temples)
  // are gently fanned apart; a leader line points back to the true spot. Spacing is in screen px,
  // so as you zoom in the pins settle back onto their exact locations.
  const pinLayout = useMemo(() => {
    const unitsPerPx = MAP_W / (mapBoxWidth * zoomLevel);
    const minDist = 30 * pinSize * unitsPerPx;
    const pts = filteredShrines.map((shrine) => {
      const tx = (shrine.mapCoords.x / 100) * MAP_W;
      const ty = (shrine.mapCoords.y / 100) * MAP_H;
      return { shrine, trueX: tx, trueY: ty, x: tx, y: ty };
    });
    for (let iter = 0; iter < 40; iter++) {
      let moved = false;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          let dx = pts[j].x - pts[i].x;
          let dy = pts[j].y - pts[i].y;
          let d = Math.hypot(dx, dy);
          if (d >= minDist) continue;
          if (d < 1e-6) {
            const ang = (i * 2.399 + j) % (Math.PI * 2);
            dx = Math.cos(ang); dy = Math.sin(ang); d = 1;
          }
          const push = (minDist - d) / 2;
          pts[i].x -= (dx / d) * push; pts[i].y -= (dy / d) * push;
          pts[j].x += (dx / d) * push; pts[j].y += (dy / d) * push;
          moved = true;
        }
      }
      if (!moved) break;
    }
    // Labels: when zoomed in, show as many as fit without overlapping (selected first).
    const pxPerUnit = 1 / unitsPerPx;
    const placed: { l: number; r: number; t: number; b: number; id?: string }[] = pts.map((p) => {
      const r = 14 * pinSize;
      const cx = p.x / unitsPerPx, cy = p.y / unitsPerPx;
      return { l: cx - r, r: cx + r, t: cy - r, b: cy + r, id: p.shrine.id };
    });
    const labelled = new Set<string>();
    if (zoomLevel >= 1.8) {
      const order = [...pts].sort((a, b) =>
        a.shrine.id === selectedId ? -1 : b.shrine.id === selectedId ? 1 : 0
      );
      for (const p of order) {
        const kanji = p.shrine.kanjiName.split('（')[0];
        const latin = p.shrine.name.split('(')[0];
        const w = kanji.length * 12 + (mapBoxWidth < 600 ? 0 : latin.length * 5.6) + 24;
        const cx = p.x * pxPerUnit, top = p.y * pxPerUnit - 16 * pinSize - 6 - 20;
        const box = { l: cx - w / 2, r: cx + w / 2, t: top, b: top + 20 };
        if (placed.some((q) => q.id !== p.shrine.id && box.l < q.r && box.r > q.l && box.t < q.b && box.b > q.t)) continue;
        placed.push(box);
        labelled.add(p.shrine.id);
      }
    }
    return pts.map((p) => ({
      ...p,
      displaced: Math.hypot(p.x - p.trueX, p.y - p.trueY) > 3 * unitsPerPx,
      labelFits: labelled.has(p.shrine.id),
    }));
  }, [filteredShrines, zoomLevel, mapBoxWidth, selectedId, pinSize]);

  return (
    <div className="relative w-full h-screen bg-[#f7f2e7] text-[#2c241c] flex flex-col overflow-hidden select-none font-sans">
      {/* Traditional Washi Rice Paper & Subtle Cloud / Ripple Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#dfd4c0_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_20%_20%,#e8dcbe_0%,transparent_60%)]" />

      {/* Top Header Bar - Warm Beige Aesthetic with Japanese Accents */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 border-b border-[#ded2bd] bg-[#fbf8f1]/95 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#b91c1c] via-[#c2410c] to-[#991b1b] border border-[#f59e0b]/50 flex items-center justify-center text-xl shadow-md text-white">
            ⛩️
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-cinzel font-bold tracking-wider text-[#241c14]">
                Online Prayer
              </h1>
              <span className="text-xs font-kanji text-[#9a3412] font-semibold border border-[#ea580c]/30 px-2 py-0.5 rounded-full bg-[#ffedd5]/70 hidden sm:inline-block">
                日本名社寺巡礼
              </span>
              <span className="text-[11px] font-mono bg-[#fef2f2] text-[#b91c1c] font-bold border border-[#fca5a5] px-2 py-0.5 rounded-full shadow-xs hidden sm:inline">
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

          {onOpenLuck && <LuckChip onClick={onOpenLuck} compact />}

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
      <main
        className={`relative z-10 flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-1 overflow-hidden ${
          (isMapExpanded && viewMode === 'map') || viewMode === 'directory'
            ? 'grid-rows-1'
            : 'grid-rows-[minmax(0,55fr)_minmax(0,45fr)]'
        }`}
      >
        {/* Left Column: Interactive Detailed Japan Map OR Sanctuary Directory */}
        <div
          className={`${
            viewMode === 'directory' || !isMapExpanded
              ? 'lg:col-span-7 xl:col-span-8'
              : 'lg:col-span-12'
          } p-3 sm:p-4 flex flex-col justify-between overflow-hidden relative transition-all duration-300 min-h-0`}
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

            {/* Wish Pills: what each place is famous for */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs" role="group" aria-label="Filter by wish">
              <span className="text-[11px] font-semibold text-[#6e5b47] flex items-center gap-1 shrink-0">
                <Heart className="w-3.5 h-3.5 text-[#b91c1c]" /> Wish:
              </span>
              {(['all', ...WISH_ORDER] as const).map((w) => {
                const isSelected = wishFilter === w;
                const c = w === 'all' ? null : WISHES[w];
                const count = w === 'all' ? SHRINES.length : SHRINES.filter((s) => hasWish(s.id, w)).length;
                return (
                  <button
                    key={w}
                    onClick={() => handleSelectWish(w)}
                    aria-pressed={isSelected}
                    title={c ? `${c.jp} (${c.reading}): ${c.en}` : 'Any wish'}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected ? 'text-white font-bold shadow-xs' : 'bg-[#fcf9f2] border-[#ded2be] text-[#5a4837] hover:text-[#2c241c] hover:border-[#b89f81] hover:bg-[#f5ede0]'
                    }`}
                    style={isSelected ? { background: c?.color ?? '#2c241c', borderColor: c?.color ?? '#2c241c' } : undefined}
                  >
                    {c ? (
                      <>
                        <span aria-hidden>{c.emoji}</span>
                        <span className="font-kanji">{c.jp.split('・')[0]}</span>
                        <span className="hidden sm:inline font-sans">{c.short}</span>
                      </>
                    ) : (
                      <span>Any</span>
                    )}
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
            {wishFilter !== 'all' && (
              <p className="text-[11px] text-[#6d5b49] leading-snug -mt-0.5 truncate sm:whitespace-normal">
                <span className="font-semibold" style={{ color: WISHES[wishFilter].color }}>
                  {WISHES[wishFilter].emoji} {WISHES[wishFilter].en}
                </span>
                 are what these places are famous for.<span className="hidden sm:inline"> You can still pray for anything at any shrine or temple.</span>
              </p>
            )}
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
              className={`relative flex-1 bg-[#f4ece0] border border-[#d8c8b0] rounded-2xl overflow-hidden min-h-[160px] lg:min-h-[420px] shadow-inner select-none touch-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
            >
              {/* Map controls: zoom in / out, fit all, centre on selected */}
              <div className="absolute top-3 right-3 z-30 flex flex-col rounded-xl bg-[#fcf9f3]/95 border border-[#d3c2a9] shadow-md backdrop-blur-md overflow-hidden divide-y divide-[#e6d9c4]">
                <button onClick={handleZoomIn} className="w-9 h-9 flex items-center justify-center text-[#5a4837] hover:bg-[#f0e6d4] active:bg-[#e8dcc6] transition-colors cursor-pointer" title="Zoom in (+)" aria-label="Zoom in">
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button onClick={handleZoomOut} className="w-9 h-9 flex items-center justify-center text-[#5a4837] hover:bg-[#f0e6d4] active:bg-[#e8dcc6] transition-colors cursor-pointer" title="Zoom out (−)" aria-label="Zoom out">
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button onClick={handleResetZoom} className="w-9 h-9 flex items-center justify-center text-[#5a4837] hover:bg-[#f0e6d4] active:bg-[#e8dcc6] transition-colors cursor-pointer" title="Show all of Japan (0)" aria-label="Show all of Japan">
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => centerOnShrine(selectedShrine)}
                  className="w-9 h-9 flex items-center justify-center text-[#5a4837] hover:bg-[#f0e6d4] active:bg-[#e8dcc6] transition-colors cursor-pointer text-[#b91c1c]"
                  title={`Centre on ${selectedShrine.kanjiName}`}
                  aria-label="Centre on selected shrine"
                >
                  <Crosshair className="w-4 h-4" />
                </button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-3 right-3 z-30 flex items-center gap-3 bg-[#fdfbf6]/95 border border-[#d8c8b0] rounded-xl px-3 py-1.5 text-[11px] text-[#5a4836] shadow-md backdrop-blur-sm pointer-events-auto">
                <span className="flex items-center gap-1 text-[#b91c1c] font-semibold">⛩️ Shrine</span>
                <span className="flex items-center gap-1 text-[#b45309] font-semibold">🏯 Temple</span>
                <button
                  onClick={() => setShowHelpModal(true)}
                  className="flex items-center text-[#806c57] hover:text-[#b45309] cursor-pointer"
                  title="Map guide"
                  aria-label="Map guide"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Transform Container with Smooth Pan & Zoom (translate in px, scale centered) */}
              <div
                className={`w-full h-full flex items-center justify-center relative ${
                  isDragging ? '' : 'transition-transform duration-200 ease-out'
                }`}
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                  containerType: 'size',
                }}
              >
                {/* Fixed-aspect map box: the SVG and the pins share exactly the same coordinate space */}
                <div
                  ref={mapBoxRef}
                  className="relative"
                  style={{
                    width: `min(100cqw, calc(100cqh * ${MAP_W} / ${MAP_H}))`,
                    aspectRatio: `${MAP_W} / ${MAP_H}`,
                  }}
                >
                <svg
                  viewBox={`0 0 ${MAP_W} ${MAP_H}`}
                  className="absolute inset-0 w-full h-full drop-shadow-[0_8px_20px_rgba(110,88,60,0.12)]"
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
                  <rect width={MAP_W} height={MAP_H} fill="url(#oceanBeige)" />
                  <rect width={MAP_W} height={MAP_H} fill="url(#waterRipple)" />

                  {/* True latitude / longitude graticule */}
                  <g stroke="#dfd1b8" strokeWidth="0.8" strokeDasharray="2 4">
                    {GRATICULE.lats.map((l) => (
                      <line key={`lat${l.deg}`} x1="0" y1={l.y} x2={MAP_W} y2={l.y} />
                    ))}
                    {GRATICULE.lons.map((l) => (
                      <line key={`lon${l.deg}`} x1={l.x} y1="0" x2={l.x} y2={MAP_H} />
                    ))}
                  </g>
                  <g fill="#a8937a" fontSize="9" fontFamily="monospace">
                    {GRATICULE.lats.map((l) => (
                      <text key={`latl${l.deg}`} x={MAP_W - 8} y={l.y - 3} textAnchor="end">{l.deg}°N</text>
                    ))}
                    {GRATICULE.lons.map((l) => (
                      <text key={`lonl${l.deg}`} x={l.x + 3} y="12">{l.deg}°E</text>
                    ))}
                  </g>

                  {/* Compass rose (方位盤) */}
                  <g transform="translate(90, 90)">
                    <circle r="28" fill="none" stroke="#cbb89e" strokeWidth="1" />
                    <polygon points="0,-24 4,-3 0,0 -4,-3" fill="#b91c1c" />
                    <polygon points="0,24 4,3 0,0 -4,3" fill="#8c7863" />
                    <circle r="2.5" fill="#b45309" />
                    <text y="-32" textAnchor="middle" fill="#b91c1c" fontSize="11" fontFamily="Noto Serif JP" fontWeight="bold">北</text>
                  </g>

                  {/* Japan coastline — Natural Earth 1:10m, same projection as the pins */}
                  <path
                    d={JAPAN_MAINLAND_PATH}
                    fill="url(#honshuBeige)"
                    stroke="#8c785e"
                    strokeWidth={1.1 / zoomLevel}
                    strokeLinejoin="round"
                  />

                  {/* Okinawa inset */}
                  <g>
                    <rect
                      x={OKINAWA_INSET.x}
                      y={OKINAWA_INSET.y}
                      width={OKINAWA_INSET.w}
                      height={OKINAWA_INSET.h}
                      rx="8"
                      fill="#fcf8f0"
                      fillOpacity="0.7"
                      stroke="#c9a77c"
                      strokeWidth="1"
                    />
                    <text x={OKINAWA_INSET.x + 10} y={OKINAWA_INSET.y + 17} fill="#b45309" fontSize="9" fontFamily="Cinzel" fontWeight="bold">
                      OKINAWA 沖縄
                    </text>
                    <path d={OKINAWA_INSET.path} fill="url(#honshuBeige)" stroke="#8c785e" strokeWidth={1.1 / zoomLevel} />
                  </g>

                  {/* Mt. Fuji */}
                  <g transform={`translate(${MAP_LABELS.FUJI[0]}, ${MAP_LABELS.FUJI[1]}) scale(${1 / Math.sqrt(zoomLevel)})`}>
                    <polygon points="0,-6 5,3 -5,3" fill="#fef3c7" stroke="#b45309" strokeWidth="1" />
                    <polygon points="0,-6 2.2,-1.6 -2.2,-1.6" fill="#ffffff" />
                  </g>

                  {/* Region labels (fade out when zoomed in so they don't fight the pins) */}
                  <g
                    fill="#8a7559"
                    fontFamily="Cinzel"
                    letterSpacing="2"
                    fontSize="11"
                    opacity={zoomLevel > 1.8 ? 0 : 0.75}
                    style={{ transition: 'opacity 200ms' }}
                    pointerEvents="none"
                  >
                    {(['HOKKAIDO', 'TOHOKU', 'CHUBU', 'CHUGOKU', 'SHIKOKU', 'KYUSHU'] as const).map((k) => (
                      <text key={k} x={MAP_LABELS[k][0]} y={MAP_LABELS[k][1]} textAnchor="middle">
                        {k}
                      </text>
                    ))}
                  </g>

                  {/* Seas */}
                  <g
                    fill="#b5a48d"
                    fontFamily="Cinzel"
                    fontStyle="italic"
                    letterSpacing="4"
                    fontSize="13"
                    pointerEvents="none"
                    opacity={zoomLevel > 1.8 ? 0 : 1}
                    style={{ transition: 'opacity 200ms' }}
                  >
                    <text x={MAP_LABELS.SEA_JAPAN[0]} y={MAP_LABELS.SEA_JAPAN[1]} textAnchor="middle">SEA OF JAPAN</text>
                    <text x={MAP_LABELS.SEA_JAPAN[0]} y={MAP_LABELS.SEA_JAPAN[1] + 16} textAnchor="middle" fontFamily="Noto Serif JP" fontSize="11" letterSpacing="6">日本海</text>
                    <text x={MAP_LABELS.PACIFIC[0] + 60} y={MAP_LABELS.PACIFIC[1] + 20} textAnchor="middle">PACIFIC OCEAN</text>
                    <text x={MAP_LABELS.PACIFIC[0] + 60} y={MAP_LABELS.PACIFIC[1] + 36} textAnchor="middle" fontFamily="Noto Serif JP" fontSize="11" letterSpacing="6">太平洋</text>
                  </g>
                </svg>

                {/* Leader lines from fanned-out pins back to their true location */}
                <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 w-full h-full pointer-events-none">
                  {pinLayout.map((p) =>
                    p.displaced ? (
                      <g key={`lead-${p.shrine.id}`}>
                        <line
                          x1={p.trueX} y1={p.trueY} x2={p.x} y2={p.y}
                          stroke="#8c785e" strokeWidth={1 / zoomLevel} strokeOpacity="0.7"
                        />
                        <circle cx={p.trueX} cy={p.trueY} r={2 / zoomLevel} fill="#8c785e" />
                      </g>
                    ) : null
                  )}
                </svg>

                {/* INTERACTIVE MARKERS — anchored so the icon's centre is the real location */}
                {pinLayout.map(({ shrine, x, y, labelFits }) => {
                  const isSelected = shrine.id === selectedId;
                  const isHovered = hoveredShrine?.id === shrine.id;
                  const showLabel = isSelected || isHovered || labelFits;

                  return (
                    <div
                      key={shrine.id}
                      style={{
                        left: `${(x / MAP_W) * 100}%`,
                        top: `${(y / MAP_H) * 100}%`,
                        transform: `translate(-50%, -50%) scale(${pinCounterScale})`,
                        zIndex: isSelected ? 30 : isHovered ? 25 : 20,
                      }}
                      className="absolute"
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
                      {/* Name badge floats above the pin; it never shifts the pin itself */}
                      {showLabel && (
                        <div
                          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded-lg whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1 border ${
                            isSelected
                              ? 'bg-[#2c241c] border-[#b45309] text-[#fef3c7] text-xs font-bold'
                              : 'bg-[#fdfbf7] border-[#ded2be] text-[#3d3124] text-[11px]'
                          }`}
                        >
                          <span className="font-kanji font-bold">{shrine.kanjiName.split('（')[0]}</span>
                          <span className={`font-sans hidden sm:inline text-[10px] ${isSelected ? 'text-[#e7d6b8]' : 'text-[#806c57]'}`}>
                            {shrine.name.split('(')[0]}
                          </span>
                        </div>
                      )}

                      <button
                        aria-label={shrine.name}
                        className={`relative flex items-center justify-center rounded-full cursor-pointer shadow-md transition-colors ${
                          isSelected
                            ? 'w-9 h-9 bg-[#b91c1c] text-white ring-4 ring-[#fde68a]/80'
                            : shrine.type === 'shrine'
                            ? 'w-7 h-7 bg-[#fdfaf5] border-2 border-[#b91c1c] hover:bg-[#fee2e2]'
                            : 'w-7 h-7 bg-[#fdfaf5] border-2 border-[#b45309] hover:bg-[#fef3c7]'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 rounded-full border-2 border-[#b91c1c] animate-ping opacity-60 pointer-events-none" />
                        )}
                        <span className={isSelected ? 'text-base' : 'text-xs'}>
                          {shrine.type === 'shrine' ? '⛩️' : '🏯'}
                        </span>
                      </button>
                    </div>
                  );
                })}
                </div>
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
                        <span className="flex items-center gap-1 min-w-0 overflow-hidden">
                          {wishesOf(shrine.id).map(({ wish }) => {
                            const c = WISHES[wish];
                            const on = wishFilter === wish;
                            return (
                              <span
                                key={wish}
                                title={c.en}
                                className="px-1.5 py-0.5 rounded-md text-[10px] font-medium border whitespace-nowrap"
                                style={{ color: on ? '#fff' : c.color, background: on ? c.color : `${c.color}14`, borderColor: `${c.color}55` }}
                              >
                                {c.emoji} {c.short}
                              </span>
                            );
                          })}
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
          <div className={`mt-2 pt-2 border-t border-[#ded0ba] items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] shrink-0 ${viewMode === 'directory' ? 'hidden' : 'flex'}`}>
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
            isMapExpanded && viewMode === 'map'
              ? 'hidden'
              : viewMode === 'directory'
              ? 'hidden lg:flex lg:col-span-5 xl:col-span-4'
              : 'flex lg:col-span-5 xl:col-span-4'
          } bg-[#fbf7f0] border-t lg:border-t-0 lg:border-l border-[#ded2bd] px-4 pt-4 sm:px-5 sm:pt-5 flex-col justify-between overflow-y-auto min-h-0 transition-all duration-300`}
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
                <ul className="mt-2.5 space-y-2">
                  {wishesOf(selectedShrine.id).map(({ wish, why }) => {
                    const c = WISHES[wish];
                    return (
                      <li key={wish} className="flex gap-2 items-start">
                        <span
                          className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-white whitespace-nowrap"
                          style={{ background: c.color }}
                        >
                          {c.emoji} <span className="font-kanji">{c.jp}</span>
                        </span>
                        <span className="text-[11px] text-[#4a3b2b] leading-snug">{why}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-[10px] text-[#8a7762] italic">Known for these, but every kami and Buddha hears every sincere prayer.</p>
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
          <div className="sticky bottom-0 mt-4 pt-3 pb-4 sm:pb-5 border-t border-[#ded1be] bg-[#fbf7f0]">
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
