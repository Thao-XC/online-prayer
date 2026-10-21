export type ShrineType = 'shrine' | 'temple';
export type TimeOfDay = 'day' | 'twilight' | 'night';
export type SeasonAtmosphere = 'sakura' | 'autumn' | 'summer_mist';

export interface ShrineSpot {
  id: string;
  name: string;
  japaneseName: string;
  position: [number, number, number]; // [x, y, z] in 3D world
  cameraTarget: [number, number, number];
  description: string;
  type: 'torii' | 'temizuya' | 'haiden' | 'ema' | 'omikuji' | 'jokoro' | 'pagoda' | 'scenic';
}

export interface ShrineData {
  id: string;
  name: string;
  kanjiName: string;
  romanizedName: string;
  type: ShrineType;
  region: string;
  prefecture: string;
  mapCoords: { x: number; y: number }; // percentage on Japan map (0-100)
  establishedYear: string;
  enshrinedDeityOrBuddha: string;
  primaryBlessing: string;
  tagline: string;
  description: string;
  features: string[];
  spots: ShrineSpot[];
  architectureStyle:
    | 'fushimi_inari'
    | 'itsukushima_floating'
    | 'meiji_sacred_forest'
    | 'sensoji_pagoda'
    | 'koyasan_mountain'
    | 'kinkakuji_golden'
    | 'kiyomizudera_stage'
    | 'nikko_tosho'
    | 'ise_jingu'
    | 'izumo_taisha'
    | 'todaiji_daibutsu'
    | 'dazaifu_tenmangu'
    | 'hokkaido_jingu'
    | 'kotohira_gu'
    | string;
  goshuinStamp: {
    templeSealName: string;
    deityInscription: string;
    vermilionSealShape: 'circle' | 'square' | 'diamond' | 'flower';
    quote: string;
  };
  audioTrackTitle: string;
}

export type OmikujiRank = 
  | 'Dai-kichi (大吉 - Great Blessing)'
  | 'Chū-kichi (中吉 - Middle Blessing)'
  | 'Shō-kichi (小吉 - Modest Blessing)'
  | 'Kichi (吉 - Blessing)'
  | 'Sue-kichi (末吉 - Future Blessing)'
  | 'Kyō (凶 - Caution / Trial)';

export interface OmikujiFortune {
  id: string;
  number: number;
  rank: OmikujiRank;
  poem: string;
  generalMeaning: string;
  wishes: string;
  health: string;
  relationships: string;
  studiesWork: string;
  travel: string;
  luckyColor: string;
  luckyDirection: string;
  shrineId: string;
  shrineName: string;
  date: string;
}

export interface EmaVotive {
  id: string;
  shrineId: string;
  shrineName: string;
  authorName: string;
  wishCategory: 'health' | 'love' | 'success' | 'peace' | 'family' | 'travel';
  wishText: string;
  illustration: 'torii' | 'kitsune' | 'dragon' | 'cherry_blossom' | 'lotus' | 'sun';
  date: string;
  positionIndex?: number;
}

export interface GoshuinEntry {
  shrineId: string;
  shrineName: string;
  kanjiName: string;
  date: string;
  sealColor: string;
  /** month (1–12) of a monthly seal (月替わり御朱印) */
  month?: number;
  /** 'YYYY-MM' — one seal per shrine per month */
  ym?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  japaneseTitle: string;
  description: string;
  icon: string;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  ritualType: 'temizuya' | 'saisen' | 'omikuji' | 'ema' | 'dialogue' | 'visit_temples' | 'goshuin';
}

export interface DailyPilgrimageState {
  dateKey: string;
  streakDays: number;
  lastActiveDate: string;
  visitedTempleIdsToday: string[];
  missions: DailyMission[];
  claimedRewardToday: boolean;
  earnedOfudaTitles: string[];
}
