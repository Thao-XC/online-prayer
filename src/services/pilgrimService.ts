import type { OmamoriKind } from '../data/pilgrimData';
import type { StoryCard } from '../three/encounters/types';

/**
 * The pilgrim's belongings, kept in this browser:
 * omamori in the pouch, cords tied to each shrine's sacred tree, and legend cards found.
 */
export interface Omamori {
  id: string;
  kind: OmamoriKind;
  shrineId: string;
  shrineName: string;
  kanjiName: string;
  /** who or what it is for, optional */
  forWhom?: string;
  date: string;
  at: number;
}

export interface TiedCord {
  kind: OmamoriKind;
  forWhom?: string;
  at: number;
}

interface PilgrimState {
  pouch: Omamori[];
  cords: Record<string, TiedCord[]>;
  cards: Record<string, StoryCard>;
}

const KEY = 'vjinja_pilgrim';

function load(): PilgrimState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<PilgrimState>;
      return { pouch: s.pouch ?? [], cords: s.cords ?? {}, cards: s.cards ?? {} };
    }
  } catch {
    /* storage unavailable */
  }
  return { pouch: [], cords: {}, cards: {} };
}

let state = load();
const listeners = new Set<() => void>();
const emit = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
};

export const pilgrimService = {
  get: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  /** Receive an omamori and tie its twin cord to this shrine's sacred tree */
  receiveOmamori(o: Omit<Omamori, 'id' | 'at' | 'date'>) {
    const at = Date.now();
    const item: Omamori = {
      ...o,
      id: `om-${at}`,
      at,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    const tied = state.cords[o.shrineId] ?? [];
    state = {
      ...state,
      pouch: [item, ...state.pouch],
      cords: { ...state.cords, [o.shrineId]: [...tied, { kind: o.kind, forWhom: o.forWhom, at }].slice(-40) },
    };
    emit();
    return item;
  },
  cordsFor: (shrineId: string) => state.cords[shrineId] ?? [],
  saveCard(id: string, card: StoryCard) {
    if (state.cards[id]) return;
    state = { ...state, cards: { ...state.cards, [id]: card } };
    emit();
  },
};
