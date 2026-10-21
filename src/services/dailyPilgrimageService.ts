import { DailyMission, DailyPilgrimageState } from '../types/shrine';

const STORAGE_KEY = 'vjinja_daily_pilgrimage';

export interface DailyOfuda {
  title: string;
  kanji: string;
  blessing: string;
  meaning: string;
  color: string;
}

export const DAILY_OFUDA_COLLECTION: DailyOfuda[] = [
  {
    title: 'Family Harmony & Home Peace',
    kanji: '家内安全',
    blessing: 'Kanai Anzen',
    meaning: 'Shields your dwelling with serenity, fostering warm understanding and protection among loved ones.',
    color: '#d97706',
  },
  {
    title: 'Flourishing Endeavors & Prosperity',
    kanji: '商売繁盛',
    blessing: 'Shōbai Hanjō',
    meaning: 'Attracts bountiful opportunities, creative growth, and thriving fortune in work and crafts.',
    color: '#dc2626',
  },
  {
    title: 'Vibrant Health & Vitality',
    kanji: '無病息災',
    blessing: 'Mubyō Sokusai',
    meaning: 'Repels ailments and exhaustion, infusing spirit and body with fresh clear energy.',
    color: '#059669',
  },
  {
    title: 'Fulfillment of Heart’s True Wish',
    kanji: '心願成就',
    blessing: 'Shingan Jōju',
    meaning: 'Aligns circumstance and inner diligence so your most sincere hopes manifest in reality.',
    color: '#7c3aed',
  },
  {
    title: 'Auspicious Bonds & Kind Encounters',
    kanji: '良縁成就',
    blessing: 'En-musubi',
    meaning: 'Draws warmhearted friendships, mutual affection, and beneficial partnerships into your journey.',
    color: '#e11d48',
  },
  {
    title: 'Safe Passage & Clear Horizons',
    kanji: '交通安全',
    blessing: 'Kōtsū Anzen',
    meaning: 'Grants calm paths across land, air, and sea, protecting every stride and departure.',
    color: '#0284c7',
  },
  {
    title: 'Mental Clarity & Mastery',
    kanji: '学業成就',
    blessing: 'Gakugyō Jōju',
    meaning: 'Sharpened insight, patient focus, and breakthrough revelation in learning and examination.',
    color: '#ea580c',
  },
];

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateDailyMissions(): DailyMission[] {
  return [
    {
      id: 'm-temizuya',
      title: 'Morning Purification',
      japaneseTitle: '朝の手水清浄',
      description: 'Cleanse hands and mouth with pure spring water at any Temizuya basin.',
      icon: '💧',
      targetCount: 1,
      currentCount: 0,
      isCompleted: false,
      ritualType: 'temizuya',
    },
    {
      id: 'm-visit',
      title: 'Dual Sanctuary Pilgrimage',
      japaneseTitle: '二社寺巡拝',
      description: 'Travel between and explore at least 2 distinct shrines or temples on the map.',
      icon: '⛩️',
      targetCount: 2,
      currentCount: 0,
      isCompleted: false,
      ritualType: 'visit_temples',
    },
    {
      id: 'm-saisen',
      title: 'Sacred Dedication & Prayer',
      japaneseTitle: '神仏への祈願',
      description: 'Offer a 5-yen coin, sound the bell/gong, and perform deep reverence at the sanctuary.',
      icon: '🪙',
      targetCount: 1,
      currentCount: 0,
      isCompleted: false,
      ritualType: 'saisen',
    },
    {
      id: 'm-omikuji',
      title: 'Receive Divine Counsel',
      japaneseTitle: '神託おみくじ拝受',
      description: 'Shake the wooden cylinder or consult the AI Oracle for today’s guidance.',
      icon: '📜',
      targetCount: 1,
      currentCount: 0,
      isCompleted: false,
      ritualType: 'omikuji',
    },
    {
      id: 'm-dialogue',
      title: 'Spiritual Contemplation',
      japaneseTitle: '神子・僧侶との対話',
      description: 'Seek wisdom or teachings from Miko Sakura or Zen Master Renkai.',
      icon: '🧘',
      targetCount: 1,
      currentCount: 0,
      isCompleted: false,
      ritualType: 'dialogue',
    },
  ];
}

export function getTodayOfuda(streakDays: number): DailyOfuda {
  const index = (streakDays - 1) % DAILY_OFUDA_COLLECTION.length;
  return DAILY_OFUDA_COLLECTION[Math.max(0, index)];
}

export function loadDailyPilgrimageState(): DailyPilgrimageState {
  const todayKey = getTodayKey();
  const yesterdayKey = getYesterdayKey();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: DailyPilgrimageState = JSON.parse(raw);

      if (parsed.dateKey === todayKey) {
        return parsed;
      }

      // It's a new day! Calculate streak
      let newStreak = 1;
      if (parsed.lastActiveDate === yesterdayKey) {
        newStreak = (parsed.streakDays || 0) + 1;
      }

      const newState: DailyPilgrimageState = {
        dateKey: todayKey,
        streakDays: newStreak,
        lastActiveDate: todayKey,
        visitedTempleIdsToday: [],
        missions: generateDailyMissions(),
        claimedRewardToday: false,
        earnedOfudaTitles: parsed.earnedOfudaTitles || [],
      };

      saveDailyPilgrimageState(newState);
      return newState;
    }
  } catch (e) {
    console.error('Error loading daily pilgrimage state:', e);
  }

  // First time initial state
  const initialState: DailyPilgrimageState = {
    dateKey: todayKey,
    streakDays: 1,
    lastActiveDate: todayKey,
    visitedTempleIdsToday: [],
    missions: generateDailyMissions(),
    claimedRewardToday: false,
    earnedOfudaTitles: [],
  };

  saveDailyPilgrimageState(initialState);
  return initialState;
}

export function saveDailyPilgrimageState(state: DailyPilgrimageState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving daily pilgrimage state:', e);
  }
}

export interface RitualUpdateResult {
  updatedState: DailyPilgrimageState;
  completedMission: DailyMission | null;
  allCompletedJustNow: boolean;
}

export function updatePilgrimageRitual(
  currentState: DailyPilgrimageState,
  ritualType: DailyMission['ritualType'],
  templeId?: string
): RitualUpdateResult {
  const state: DailyPilgrimageState = JSON.parse(JSON.stringify(currentState));
  state.lastActiveDate = getTodayKey();

  let completedMission: DailyMission | null = null;
  const wasAllCompletedBefore = state.missions.every((m) => m.isCompleted);

  // 1. If visiting a temple, track unique temple visits
  if (templeId && !state.visitedTempleIdsToday.includes(templeId)) {
    state.visitedTempleIdsToday.push(templeId);

    const visitMission = state.missions.find((m) => m.ritualType === 'visit_temples');
    if (visitMission && !visitMission.isCompleted) {
      visitMission.currentCount = state.visitedTempleIdsToday.length;
      if (visitMission.currentCount >= visitMission.targetCount) {
        visitMission.isCompleted = true;
        completedMission = visitMission;
      }
    }
  }

  // 2. Update specific ritual task
  const targetMission = state.missions.find((m) => m.ritualType === ritualType);
  if (targetMission && !targetMission.isCompleted) {
    targetMission.currentCount = Math.min(targetMission.targetCount, targetMission.currentCount + 1);
    if (targetMission.currentCount >= targetMission.targetCount) {
      targetMission.isCompleted = true;
      completedMission = targetMission;
    }
  }

  const isAllCompletedNow = state.missions.every((m) => m.isCompleted);
  const allCompletedJustNow = !wasAllCompletedBefore && isAllCompletedNow;

  if (allCompletedJustNow) {
    const todayOfuda = getTodayOfuda(state.streakDays);
    if (!state.earnedOfudaTitles.includes(todayOfuda.kanji)) {
      state.earnedOfudaTitles.push(todayOfuda.kanji);
    }
  }

  saveDailyPilgrimageState(state);

  return {
    updatedState: state,
    completedMission,
    allCompletedJustNow,
  };
}
