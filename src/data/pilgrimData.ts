/**
 * Data for the pilgrim's book: amulets (omamori), monthly seals and the index of legends.
 */

/* ------------------------------------------------------------------ */
/* Omamori: Goen-musubi style, five kinds                              */
/* (inspired by Torikai Hachimangū's online amulets: one cord for you,   */
/*  one tied to the shrine's sacred tree)                               */
/* ------------------------------------------------------------------ */
export type OmamoriKind = 'enmusubi' | 'gakugyo' | 'kinun' | 'kenko' | 'anmin';

export const OMAMORI: Record<OmamoriKind, { jp: string; en: string; blurb: string; color: string; cord: number }> = {
  enmusubi: { jp: '縁結び', en: 'Good ties', blurb: 'Love, friendship and every meeting that matters.', color: '#d9577f', cord: 0xd9577f },
  gakugyo: { jp: '学業成就', en: 'Study', blurb: 'Exams, learning, and a clear head.', color: '#2f5fa8', cord: 0x2f5fa8 },
  kinun: { jp: '金運', en: 'Prosperity', blurb: 'Fortune in money and business.', color: '#c99212', cord: 0xd4a017 },
  kenko: { jp: '無病息災', en: 'Health', blurb: 'Good health, and protection from illness.', color: '#3f8a4a', cord: 0x3f8a4a },
  anmin: { jp: '安眠', en: 'Rest', blurb: 'Peaceful sleep and a calm heart.', color: '#6a5aa8', cord: 0x6a5aa8 },
};

/* ------------------------------------------------------------------ */
/* Monthly goshuin (月替わり御朱印)                                      */
/* ------------------------------------------------------------------ */
export const MONTHLY_SEAL: Record<number, { kanji: string; motif: string; en: string; color: string; emoji: string }> = {
  1: { kanji: '睦月', motif: '初日', en: 'First sunrise', color: '#d94a2a', emoji: '🌅' },
  2: { kanji: '如月', motif: '梅', en: 'Plum blossom', color: '#c9446f', emoji: '🌸' },
  3: { kanji: '弥生', motif: '桃', en: 'Peach blossom', color: '#e07a8f', emoji: '🍑' },
  4: { kanji: '卯月', motif: '桜', en: 'Cherry blossom', color: '#e38aa6', emoji: '🌸' },
  5: { kanji: '皐月', motif: '藤', en: 'Wisteria', color: '#7f5fb0', emoji: '🪻' },
  6: { kanji: '水無月', motif: '紫陽花', en: 'Hydrangea', color: '#4a6fc0', emoji: '💠' },
  7: { kanji: '文月', motif: '七夕', en: 'Tanabata stars', color: '#2c4a8a', emoji: '🎋' },
  8: { kanji: '葉月', motif: '花火', en: 'Summer fireworks', color: '#2d7f9a', emoji: '🎆' },
  9: { kanji: '長月', motif: '月見', en: 'Moon viewing', color: '#b08a2a', emoji: '🌕' },
  10: { kanji: '神無月', motif: '菊', en: 'Chrysanthemum', color: '#c27a14', emoji: '🌼' },
  11: { kanji: '霜月', motif: '紅葉', en: 'Autumn maples', color: '#c2410c', emoji: '🍁' },
  12: { kanji: '師走', motif: '雪', en: 'First snow', color: '#6b8aa8', emoji: '❄️' },
};

/* ------------------------------------------------------------------ */
/* Book of Legends: every secret and hidden world                      */
/* ------------------------------------------------------------------ */
export interface LegendIndexEntry {
  id: string;
  shrineId: string;
  kind: 'legend' | 'secret';
  title: string;
  /** shown while still locked: nudges, never spoils */
  hint: string;
}

export const LEGEND_INDEX: LegendIndexEntry[] = [
  { id: 'fushimi-omokaru', shrineId: 'fushimi-inari', kind: 'secret', title: 'Omokaru-ishi, the heavy-light stones', hint: 'At the very end of the torii tunnels.' },
  { id: 'itsukushima-ryugu', shrineId: 'itsukushima', kind: 'legend', title: 'Ryūgū-jō, the Dragon Palace', hint: 'What lies beneath the shrine that floats?' },
  { id: 'meiji-kiyomasa', shrineId: 'meiji-jingu', kind: 'secret', title: "Kiyomasa's Well", hint: 'A narrow path leads into the forest.' },
  { id: 'sensoji-dragon', shrineId: 'senso-ji', kind: 'secret', title: 'The dragon under the lantern', hint: 'Look up at the Thunder Gate.' },
  { id: 'kinkaku-mirror', shrineId: 'kinkaku-ji', kind: 'legend', title: 'Under the Mirror Pond', hint: 'The pond reflects more than the pavilion.' },
  { id: 'koyasan-sanko', shrineId: 'koyasan', kind: 'secret', title: 'Sanko-no-matsu, the three-needle pine', hint: 'A fenced pine near the Miedō.' },
  { id: 'kiyomizu-koi', shrineId: 'kiyomizu-dera', kind: 'secret', title: 'The love-fortune stones', hint: 'Two stones, and your eyes closed.' },
  { id: 'kiyomizu-seiryu', shrineId: 'kiyomizu-dera', kind: 'legend', title: 'Seiryū at Otowa', hint: 'Who drinks from the waterfall at night?' },
  { id: 'nikko-nemuri-neko', shrineId: 'nikko-tosho-gu', kind: 'secret', title: 'Nemuri-neko, the Sleeping Cat', hint: 'Above the gate toward the tomb.' },
  { id: 'nikko-monkeys', shrineId: 'nikko-tosho-gu', kind: 'secret', title: 'The three wise monkeys', hint: 'Where the sacred horse lives.' },
  { id: 'ise-sengu', shrineId: 'ise-jingu', kind: 'secret', title: 'Shikinen Sengū', hint: 'An empty plot of white stones.' },
  { id: 'ise-iwato', shrineId: 'ise-jingu', kind: 'legend', title: 'Ama-no-Iwato', hint: 'Step into the Isuzu River.' },
  { id: 'izumo-kamiari', shrineId: 'izumo-taisha', kind: 'secret', title: 'Kamiari-zuki', hint: 'Come back when it is dark.' },
  { id: 'nara-deer-bow', shrineId: 'todai-ji', kind: 'secret', title: 'The bowing deer of Nara', hint: 'Manners go both ways.' },
  { id: 'todaiji-pillar', shrineId: 'todai-ji', kind: 'secret', title: "Through the Buddha's nostril", hint: 'One pillar inside the great hall.' },
  { id: 'todaiji-uneme', shrineId: 'todai-ji', kind: 'legend', title: 'The weeping court lady', hint: 'A still green pond by the gate.' },
  { id: 'dazaifu-ox', shrineId: 'dazaifu-tenmangu', kind: 'secret', title: 'The bronze ox of Tenjin', hint: 'Its head shines from many hands.' },
  { id: 'dazaifu-tenjin', shrineId: 'dazaifu-tenmangu', kind: 'legend', title: 'The thunder of Tenjin', hint: 'Wade into the heart-shaped pond.' },
  { id: 'hokkaido-squirrel', shrineId: 'hokkaido-jingu', kind: 'secret', title: 'Ezo risu', hint: 'Something small in the snow.' },
  { id: 'kotohira-dog', shrineId: 'kotohira-gu', kind: 'secret', title: 'Konpira-inu, the pilgrim dogs', hint: 'A dog with a pouch round its neck.' },
  { id: 'kotohira-summit', shrineId: 'kotohira-gu', kind: 'secret', title: '785 steps', hint: 'Keep climbing.' },
  { id: 'kamakura-inside', shrineId: 'kamakura-daibutsu', kind: 'legend', title: 'Inside the Great Buddha', hint: 'There is a small door somewhere.' },
  { id: 'zenkoji-okaidan', shrineId: 'zenko-ji', kind: 'legend', title: 'Okaidan-meguri', hint: 'A dark doorway beside the hall.' },
  { id: 'chusonji-basho', shrineId: 'chuson-ji', kind: 'secret', title: "Bashō's haiku", hint: 'A stone with a poem on it.' },
  { id: 'atsuta-okusu', shrineId: 'atsuta-jingu', kind: 'secret', title: 'Ōkusu, the great camphor', hint: 'Stand quietly by the oldest tree.' },
  { id: 'atsuta-nobunaga', shrineId: 'atsuta-jingu', kind: 'secret', title: "Nobunaga's wall", hint: 'Along the side path.' },
  { id: 'nachi-yatagarasu', shrineId: 'kumano-nachi-taisha', kind: 'secret', title: 'Yatagarasu, the three-legged crow', hint: 'Count the legs.' },
  { id: 'nachi-fudo', shrineId: 'kumano-nachi-taisha', kind: 'legend', title: 'Under Nachi Falls', hint: 'Follow the trail down to the plunge pool.' },
  { id: 'naminoue-shisa', shrineId: 'naminoue-gu', kind: 'secret', title: 'Shisa, the lion-dogs', hint: 'They guard the way in.' },
  { id: 'naminoue-nirai', shrineId: 'naminoue-gu', kind: 'legend', title: 'Nirai Kanai', hint: 'Swim out past the beach.' },
];
