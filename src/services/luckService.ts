/**
 * 運 Luck points.
 * Good manners and discoveries raise luck; ignoring real-world shrine etiquette lowers it.
 * Luck tilts the omikuji draw. Saved in this browser only.
 */

export interface LuckEvent {
  id: number;
  delta: number;
  reason: string;
  at: number;
}

interface LuckState {
  value: number;
  history: LuckEvent[];
  /** secrets found at least once (luck is only awarded the first time) */
  found: string[];
}

const KEY = 'vjinja_luck';
const START = 50;
export const TOTAL_SECRETS = 30;

function load(): LuckState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as LuckState;
      return { value: s.value ?? START, history: s.history ?? [], found: s.found ?? [] };
    }
  } catch {
    /* storage unavailable: start fresh */
  }
  return { value: START, history: [], found: [] };
}

let state: LuckState = load();
let nextId = 1;
const listeners = new Set<() => void>();
const eventListeners = new Set<(e: LuckEvent) => void>();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export const luckService = {
  get: () => state,
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  /** toast-style notifications for each change */
  onEvent(fn: (e: LuckEvent) => void) {
    eventListeners.add(fn);
    return () => {
      eventListeners.delete(fn);
    };
  },
  change(delta: number, reason: string) {
    if (!delta) return;
    const value = Math.max(0, Math.min(100, state.value + delta));
    const e: LuckEvent = { id: nextId++, delta, reason, at: Date.now() };
    state = { ...state, value, history: [e, ...state.history].slice(0, 30) };
    save();
    listeners.forEach((l) => l());
    eventListeners.forEach((l) => l(e));
  },
  /** returns true the first time a secret is found */
  markFound(id: string): boolean {
    if (state.found.includes(id)) return false;
    state = { ...state, found: [...state.found, id] };
    save();
    listeners.forEach((l) => l());
    return true;
  },
};

/** A short label for the current luck level */
export function luckLabel(v: number): { jp: string; en: string } {
  if (v >= 85) return { jp: '大吉運', en: 'Radiant' };
  if (v >= 65) return { jp: '吉運', en: 'Blessed' };
  if (v >= 45) return { jp: '平運', en: 'Steady' };
  if (v >= 25) return { jp: '小運', en: 'Clouded' };
  return { jp: '凶運', en: 'Troubled' };
}
