import type { WishId } from './wishesData';
import type { OmamoriKind } from './pilgrimData';

/**
 * Each sanctuary's own omamori, designed around its real kami, legends, animals and landmarks.
 * Drawn in SVG by <OmamoriArt>. Blurbs explain the story behind each design.
 */
export type OmamoriShape = 'classic' | 'round' | 'heart' | 'gourd' | 'ema' | 'paddle' | 'mascot';
export type OmamoriPattern = 'plain' | 'stripes' | 'asanoha' | 'seigaiha' | 'dots' | 'ichimatsu' | 'kikko' | 'sakura';
export type Mascot =
  | 'fox' | 'deer' | 'cat' | 'sleepycat' | 'monkey' | 'chick' | 'rabbit' | 'bird' | 'ox'
  | 'squirrel' | 'dog' | 'crow' | 'shisa';

export interface OmamoriDesign {
  id: string;
  shrineId: string;
  /** written on the pouch, 2–4 characters read top to bottom */
  jp: string;
  name: string;
  wish: WishId;
  blurb: string;
  shape: OmamoriShape;
  pattern: OmamoriPattern;
  base: string;
  accent: string;
  /** small emblem on the pouch */
  motif?: string;
  mascot?: Mascot;
  bell?: boolean;
  /** cord colour, also tied to the 3D sacred tree */
  cord: string;
}

type Row = [jp: string, name: string, wish: WishId, shape: OmamoriShape, pattern: OmamoriPattern, base: string, accent: string, motifOrMascot: string, cord: string, blurb: string, bell?: boolean];

const MASCOTS = new Set(['fox', 'deer', 'cat', 'sleepycat', 'monkey', 'chick', 'rabbit', 'bird', 'ox', 'squirrel', 'dog', 'crow', 'shisa']);

const set = (shrineId: string, rows: Row[]): OmamoriDesign[] =>
  rows.map(([jp, name, wish, shape, pattern, base, accent, mm, cord, blurb, bell], i) => ({
    id: `${shrineId}-${i}`,
    shrineId,
    jp,
    name,
    wish,
    shape,
    pattern,
    base,
    accent,
    cord,
    blurb,
    bell,
    ...(shape === 'mascot' && MASCOTS.has(mm) ? { mascot: mm as Mascot } : { motif: mm }),
  }));

export const SHRINE_OMAMORI: Record<string, OmamoriDesign[]> = {
  'fushimi-inari': set('fushimi-inari', [
    ['おきつね', 'White fox', 'family', 'mascot', 'plain', '#fffaf2', '#e0412a', 'fox', '#e0412a', "Inari's messengers are white foxes. Visitors here draw faces on fox-shaped ema."],
    ['商売繁盛', 'Thriving business', 'prosperity', 'classic', 'stripes', '#e0412a', '#f5c64a', '🌾', '#f5c64a', 'Vermilion and gold, the colours of the torii merchants donate when business goes well.', true],
    ['千本鳥居', 'Thousand torii', 'protection', 'ema', 'plain', '#e9553a', '#2c241c', '⛩️', '#e0412a', 'A tiny torii tunnel to walk you safely through the year.'],
    ['金運', 'Golden luck', 'prosperity', 'gourd', 'dots', '#f6c845', '#c2410c', '🪙', '#d4a017', 'A gourd for gathering coins. Inari is the kami of rice, and so of wealth.'],
    ['稲穂', 'Rice ear', 'health', 'round', 'asanoha', '#f3e2b8', '#b7791f', '🍚', '#d4a017', 'Ripe rice ears for a well-fed, healthy year at home.'],
    ['心願成就', 'Wish stone', 'victory', 'round', 'plain', '#cfd4d8', '#5b6670', '🪨', '#8a96a0', "Lift the Omokaru stone. If it feels lighter than you expected, your wish will come true."],
  ]),
  itsukushima: set('itsukushima', [
    ['航海安全', 'Floating torii', 'travel', 'ema', 'seigaiha', '#3b82c4', '#e0412a', '⛩️', '#3b82c4', 'The great torii standing in the sea, for safe voyages over water.', true],
    ['必勝', 'Rice paddle', 'victory', 'paddle', 'plain', '#f0d9a8', '#9a6a2c', '🍙', '#c2410c', 'Miyajima invented the wooden shamoji. Soldiers once carried one to "scoop up" victory.'],
    ['宮島の鹿', 'Miyajima deer', 'family', 'mascot', 'plain', '#d9a066', '#fff6e8', 'deer', '#b7791f', 'The island deer, sacred messengers of the kami, keeping your household safe.'],
    ['弁財天', 'Benzaiten', 'prosperity', 'classic', 'sakura', '#f4a7b9', '#fff1f4', '🎶', '#e0718f', 'For fortune in money and the arts, after the goddess of music linked with the island.'],
    ['龍宮', 'Dragon palace', 'protection', 'round', 'seigaiha', '#1f8a8a', '#bdf0e6', '🐉', '#1f8a8a', 'From the sea-dragon palace said to lie beneath the tide.'],
  ]),
  'meiji-jingu': set('meiji-jingu', [
    ['夫婦楠', 'Twin camphors', 'love', 'heart', 'plain', '#7fb77e', '#f4a7b9', '🌳', '#e0718f', 'Two camphor trees grown together, symbol of a happy marriage.', true],
    ['家内安全', 'Home & family', 'family', 'classic', 'kikko', '#f7f1e3', '#b8913a', '🌼', '#b8913a', 'Plain cypress and the chrysanthemum, for a safe and peaceful home.'],
    ['清正井', 'Kiyomasa well', 'health', 'round', 'seigaiha', '#9fd3e8', '#2f7aa0', '💧', '#2f7aa0', 'For the spring that wells up at 15 °C all year round.'],
    ['杜', 'Eternal forest', 'peace', 'gourd', 'asanoha', '#4f7f4a', '#cfe6b8', '🍃', '#4f7f4a', '100,000 trees planted by hand and grown into a forest. Calm for busy days.'],
    ['開運', 'Sake barrel', 'prosperity', 'ema', 'stripes', '#f3ead7', '#c0392b', '🍶', '#c0392b', 'From the wall of offered sake barrels on the sandō. Cheers to good fortune.'],
  ]),
  'senso-ji': set('senso-ji', [
    ['雷門', 'Thunder Gate', 'protection', 'round', 'plain', '#d63a2f', '#2c241c', '🏮', '#d63a2f', 'The giant red lantern under Kaminarimon, to keep thunder and trouble away.', true],
    ['観音', 'Kannon', 'peace', 'classic', 'kikko', '#e9c46a', '#7a4f1d', '🪷', '#b8913a', 'For the merciful Kannon hidden in the main hall since 628.'],
    ['無病息災', 'Incense smoke', 'health', 'gourd', 'dots', '#c9c3d9', '#5b4f7a', '☁️', '#7a6fa0', 'Waft the smoke over the part that hurts. This little gourd keeps the smoke with you.'],
    ['昇龍', 'Rising dragon', 'victory', 'ema', 'seigaiha', '#2c5f8a', '#9cd1f2', '🐉', '#2c5f8a', 'The dragon carved under the great lantern, rising toward success.'],
    ['招き猫', 'Beckoning cat', 'prosperity', 'mascot', 'plain', '#fffaf2', '#e0412a', 'cat', '#e0412a', "Asakusa's lucky beckoning cat waves good customers and fortune your way.", true],
    ['五重塔', 'Pagoda', 'study', 'classic', 'ichimatsu', '#6a5aa8', '#e9e4f7', '🗼', '#6a5aa8', 'Five storeys climbing, one floor at a time, like your study.'],
  ]),
  koyasan: set('koyasan', [
    ['弘法大師', 'Kōbō Daishi', 'peace', 'classic', 'kikko', '#4b3a78', '#e9c46a', '📿', '#4b3a78', 'For the great teacher said to meditate forever at Okunoin.'],
    ['三鈷の松', 'Three-needle pine', 'prosperity', 'gourd', 'plain', '#5f8f4e', '#e5f2d6', '🌲', '#5f8f4e', 'Rare three-needle pine sprigs are kept in wallets as a charm for fortune.'],
    ['先祖供養', 'Lantern of thanks', 'family', 'round', 'dots', '#f2a65a', '#7a3e10', '🏮', '#d97706', 'The 10,000 lanterns of Tōrōdō, for the people who came before you.'],
    ['護摩', 'Goma fire', 'protection', 'ema', 'plain', '#e0602a', '#ffe1b8', '🔥', '#e0602a', 'Sacred fire rituals that burn away bad luck.'],
    ['学業', "Kūkai's brush", 'study', 'classic', 'asanoha', '#2f5fa8', '#dbe7fb', '🖌️', '#2f5fa8', 'Kūkai was a genius calligrapher. Legend even credits him with inventing kana.'],
  ]),
  'kinkaku-ji': set('kinkaku-ji', [
    ['金運', 'Golden pavilion', 'prosperity', 'classic', 'ichimatsu', '#e8b923', '#fff3c4', '✨', '#d4a017', 'Covered in gold leaf, like the pavilion over Mirror Pond.', true],
    ['鳳凰', 'Phoenix', 'victory', 'ema', 'plain', '#c0392b', '#f5c64a', '🪶', '#d4a017', 'The golden phoenix on the roof, rising again and again.'],
    ['鏡湖池', 'Mirror Pond', 'peace', 'round', 'seigaiha', '#3a8f8f', '#cdeee8', '🪞', '#3a8f8f', 'Still water that reflects a second golden pavilion.'],
    ['開運招福', 'Open fortune', 'protection', 'gourd', 'stripes', '#d63a2f', '#f5c64a', '🍀', '#d63a2f', 'Open up your luck, and invite happiness in.'],
    ['紅葉', 'Autumn maple', 'love', 'heart', 'dots', '#e8743b', '#fff0d9', '🍁', '#e8743b', 'For autumn walks around the gardens with someone dear.'],
  ]),
  'kiyomizu-dera': set('kiyomizu-dera', [
    ['恋占い', 'Love stones', 'love', 'heart', 'sakura', '#f28fb0', '#fff1f6', '💞', '#e0718f', "From Jishu Shrine's love stones. Walk from one to the other with your eyes closed.", true],
    ['白兎', 'White rabbit', 'love', 'mascot', 'plain', '#fffaf6', '#f28fb0', 'rabbit', '#f28fb0', 'Jishu Shrine honours Ōkuninushi, who once rescued a little white hare.'],
    ['音羽の滝', 'Otowa falls', 'health', 'round', 'seigaiha', '#7cc4e8', '#2f6f9a', '💧', '#2f6f9a', 'Three streams: long life, study, and love. Choose only one.'],
    ['学業成就', 'Scholar scroll', 'study', 'classic', 'asanoha', '#2f4f8a', '#dbe7fb', '📜', '#2f4f8a', 'For the second stream of Otowa, traditionally the one for learning.'],
    ['清水の舞台', 'Jump from the stage', 'victory', 'ema', 'plain', '#c49a6c', '#5a3a1a', '🌸', '#a8642a', '"Jumping off the stage at Kiyomizu" means making a brave decision. This one is for courage.'],
    ['桜', 'Sakura', 'peace', 'gourd', 'sakura', '#f9c6d3', '#d9577f', '🌸', '#d9577f', 'Spring evenings on the hillside, when the whole slope turns pink.'],
  ]),
  'nikko-tosho-gu': set('nikko-tosho-gu', [
    ['眠り猫', 'Sleeping cat', 'peace', 'mascot', 'plain', '#fffaf2', '#e9c46a', 'sleepycat', '#e9c46a', 'The famous carved cat that sleeps above the gate, for calm nights and peaceful days.'],
    ['三猿', 'Three monkeys', 'family', 'mascot', 'plain', '#b9875a', '#f6d9b8', 'monkey', '#8a5a2a', "See no evil, hear no evil, speak no evil: a carving about raising children well."],
    ['陽明門', 'Yōmeimon', 'victory', 'ema', 'kikko', '#e9c46a', '#1f6f6a', '🏯', '#1f6f6a', "The dazzling gate of the shrine to Ieyasu, who rose to rule all Japan."],
    ['葵', 'Hollyhock crest', 'protection', 'classic', 'plain', '#1f4d3a', '#e9c46a', '🌿', '#1f4d3a', 'The Tokugawa three-leaf crest, guardian of the shogun\'s line.', true],
    ['想像の象', 'Imagined elephant', 'study', 'round', 'dots', '#b8bec6', '#4a5562', '🐘', '#6b7685', 'Carved by an artist who had never seen an elephant. A charm for imagination.'],
    ['杉並木', 'Cedar avenue', 'travel', 'gourd', 'asanoha', '#3f6b45', '#cfe6b8', '🌲', '#3f6b45', 'The 35 km road lined with 400-year-old cedars, for a safe journey.'],
  ]),
  'ise-jingu': set('ise-jingu', [
    ['天照', 'Sun goddess', 'peace', 'classic', 'plain', '#fbf6ea', '#e0a526', '☀️', '#e0a526', 'Pure white and gold for Amaterasu. At Ise you give thanks more than you ask.'],
    ['五十鈴川', 'Isuzu river', 'protection', 'round', 'seigaiha', '#8fc9e6', '#2c6f95', '💧', '#2c6f95', 'Pilgrims purify their hands in the clear Isuzu river before they pray.'],
    ['豊受', 'Rice & plenty', 'prosperity', 'gourd', 'dots', '#f3e2b8', '#a8742a', '🍚', '#b8913a', 'For Toyouke of the Gekū, kami of food and every kind of industry.'],
    ['神鶏', 'Sacred rooster', 'family', 'mascot', 'plain', '#fffaf0', '#e0412a', 'chick', '#e0412a', "Roosters crowed to call Amaterasu out of her cave. Sacred chickens still walk the grounds.", true],
    ['宇治橋', 'Uji bridge', 'travel', 'ema', 'plain', '#c9a77c', '#5a3a1a', '🌉', '#a8642a', 'The wooden bridge into the sacred grounds, between the everyday world and the kami\'s.'],
  ]),
  'izumo-taisha': set('izumo-taisha', [
    ['縁結び', 'Red thread', 'love', 'classic', 'stripes', '#e0412a', '#fff3f0', '🎀', '#e0412a', 'From the home of en-musubi, where the kami tie bonds between people.', true],
    ['因幡の白兎', 'Hare of Inaba', 'health', 'mascot', 'plain', '#ffffff', '#f2a0b0', 'rabbit', '#f2a0b0', 'Ōkuninushi healed a skinned white hare. Little rabbit statues hide all over the grounds.'],
    ['注連縄', 'Shimenawa', 'protection', 'round', 'stripes', '#e8d29a', '#8a6a2a', '🪢', '#b8913a', 'The great 5-tonne straw rope over the Kaguraden.'],
    ['神在月', 'Gathering moon', 'family', 'ema', 'plain', '#4b3a78', '#e9c46a', '🌙', '#4b3a78', 'Each tenth month, every kami in Japan gathers here.'],
    ['八雲', 'Eight clouds', 'peace', 'gourd', 'seigaiha', '#eef4fb', '#6a8fc0', '☁️', '#6a8fc0', 'Izumo means "clouds rising", from Japan\'s very first poem.'],
    ['ご縁', 'Five-yen coin', 'prosperity', 'heart', 'dots', '#e8b923', '#7a4f1d', '🪙', '#d4a017', 'Go-en (five yen) sounds like go-en (good ties). Many people offer five-yen coins here.'],
  ]),
  'todai-ji': set('todai-ji', [
    ['大仏', 'Great Buddha', 'peace', 'classic', 'kikko', '#9a7b4f', '#f3e2b8', '🪷', '#9a7b4f', 'For the 15 m bronze Buddha raised to bring peace to the land.', true],
    ['鹿', 'Nara deer', 'family', 'mascot', 'plain', '#c98e57', '#fff6e8', 'deer', '#b7791f', 'The deer of Nara bow when you bow. Manners go both ways.'],
    ['柱くぐり', 'Pillar hole', 'health', 'ema', 'plain', '#b98a5a', '#4a2f14', '✨', '#a8642a', 'Squeeze through the hole in the great pillar for good health and enlightenment.'],
    ['仁王', 'Nio guardians', 'victory', 'ema', 'stripes', '#7a2a1d', '#f5c64a', '💪', '#7a2a1d', 'The two 8 m guardian kings of the Great South Gate.'],
    ['鹿せんべい', 'Deer cracker', 'prosperity', 'round', 'dots', '#e9cf9a', '#8a5a2a', '🍪', '#b7791f', 'A round rice cracker. The deer will follow you everywhere.'],
  ]),
  'dazaifu-tenmangu': set('dazaifu-tenmangu', [
    ['学業成就', 'Tenjin of learning', 'study', 'classic', 'kikko', '#2f4f8a', '#f2b8c6', '📚', '#2f4f8a', 'For the scholar Michizane, now Tenjin, the god of learning.', true],
    ['飛梅', 'Flying plum', 'love', 'heart', 'sakura', '#e05a7a', '#fff1f4', '🌸', '#e05a7a', 'His beloved plum tree missed him so much that it flew from Kyoto to be with him.'],
    ['鷽', 'Uso bullfinch', 'protection', 'mascot', 'plain', '#f2a07a', '#4a5562', 'bird', '#e07a5a', "At the Usokae festival people swap wooden bullfinches to turn last year's bad luck into a lie."],
    ['御神牛', 'Sacred ox', 'health', 'mascot', 'plain', '#6b5a4a', '#e9d6c0', 'ox', '#6b5a4a', 'Rub the bronze ox\'s head for wisdom, or the place that aches.'],
    ['梅ヶ枝餅', 'Plum mochi', 'prosperity', 'round', 'dots', '#f3e2c8', '#b85a3a', '🍡', '#b85a3a', 'Grilled rice cakes sold all along the approach.'],
    ['合格', 'Thunder pass', 'victory', 'ema', 'plain', '#4b3a78', '#f5c64a', '⚡', '#4b3a78', 'Tenjin is also the god of thunder. Strike your exams like lightning.'],
  ]),
  'hokkaido-jingu': set('hokkaido-jingu', [
    ['エゾリス', 'Ezo squirrel', 'family', 'mascot', 'plain', '#9a7356', '#f3e2cc', 'squirrel', '#8a5a3a', 'The little squirrels that scamper through the shrine forest in the snow.'],
    ['開拓', 'Pioneer star', 'prosperity', 'classic', 'plain', '#1f3a6b', '#f5c64a', '⭐', '#1f3a6b', "The north star of Hokkaido's pioneers, for bold new ventures.", true],
    ['雪', 'First snow', 'health', 'round', 'dots', '#f4f8fc', '#7ea7cc', '❄️', '#7ea7cc', 'Clean cold air and a fresh start for body and mind.'],
    ['桜', 'Northern sakura', 'love', 'heart', 'sakura', '#f9c6d3', '#d9577f', '🌸', '#d9577f', "Japan's latest cherry blossoms bloom here in May."],
    ['丹頂', 'Red-crowned crane', 'travel', 'gourd', 'plain', '#ffffff', '#d63a2f', '🕊️', '#d63a2f', 'Cranes always find their way home. Fly safely back to yours.'],
  ]),
  'kotohira-gu': set('kotohira-gu', [
    ['幸福', 'Yellow happiness', 'protection', 'classic', 'plain', '#ffd93b', '#a37c00', '💛', '#e8b923', "Konpira-san's bright yellow omamori is one of Japan's best known: happiness in a pouch.", true],
    ['こんぴら狗', 'Pilgrim dog', 'family', 'mascot', 'plain', '#f3d9b0', '#c0392b', 'dog', '#c0392b', 'People who could not travel sent their dog to pray for them, with a pouch round its neck.'],
    ['航海安全', 'Ship charm', 'travel', 'ema', 'seigaiha', '#2c6f95', '#cfe8f5', '⛵', '#2c6f95', 'Konpira-san is the sailors\' kami. Ship crews still pray here.'],
    ['七八五段', '785 steps', 'health', 'gourd', 'stripes', '#7aa860', '#f0f7e8', '⛰️', '#5f8f4e', 'Strong legs and a strong heart, for the long climb to the main hall.'],
    ['金', 'Konpira gold', 'prosperity', 'round', 'ichimatsu', '#e8b923', '#7a4f1d', '🪙', '#d4a017', 'The 金 crest of Konpira, for good harvests and business.'],
    ['桜馬場', 'Sakura lane', 'love', 'heart', 'sakura', '#f7b8c8', '#c94a6a', '🌸', '#c94a6a', 'The cherry-tree avenue halfway up the steps.'],
  ]),
  'kamakura-daibutsu': set('kamakura-daibutsu', [
    ['大仏', 'Bronze Buddha', 'peace', 'classic', 'plain', '#5f8a7a', '#e8d8a8', '🪷', '#5f8a7a', 'Weathered green bronze. Amida has sat in the open air since a tsunami took his hall in 1498.', true],
    ['紫陽花', 'Hydrangea', 'love', 'round', 'dots', '#8a8fd9', '#e9e6fb', '💠', '#7a6fd0', 'Kamakura in June: whole hillsides of blue and violet hydrangeas.'],
    ['大わらじ', 'Giant sandals', 'health', 'ema', 'stripes', '#e3cf98', '#8a6a2a', '👣', '#b8913a', 'Children weave huge straw sandals for the Buddha, for his walks across Japan.'],
    ['湘南の海', 'Shonan sea', 'protection', 'gourd', 'seigaiha', '#5ab0c9', '#e6f6fa', '🌊', '#2f8aa8', 'The beach is a short walk away.'],
    ['江ノ電', 'Enoden tram', 'travel', 'classic', 'stripes', '#2f7a4f', '#f3ead7', '🚃', '#2f7a4f', 'The little green tram that rattles along the coast to the Great Buddha.'],
  ]),
  'zenko-ji': set('zenko-ji', [
    ['牛', 'Leading ox', 'protection', 'mascot', 'plain', '#4a3a2e', '#e9d6c0', 'ox', '#4a3a2e', '"Led by an ox to Zenkō-ji": an old woman chased an ox here and found faith. Good things lead you on.'],
    ['極楽の鍵', 'Key to paradise', 'peace', 'ema', 'plain', '#2c241c', '#e9c46a', '🗝️', '#4a3a2e', 'Feel for the key in the pitch-dark Okaidan tunnel.'],
    ['びんずる', 'Binzuru', 'health', 'round', 'plain', '#d9603a', '#ffe1c8', '🙏', '#d9603a', 'The much-rubbed statue that heals whatever you touch on it.', true],
    ['七味', 'Shichimi spice', 'prosperity', 'gourd', 'dots', '#c0392b', '#f5c64a', '🌶️', '#c0392b', "A gourd like the famous seven-spice shops at the temple gate. A little spice for life."],
    ['蓮', 'Lotus for all', 'love', 'heart', 'plain', '#f6d3df', '#c94a6a', '🪷', '#c94a6a', 'Zenkō-ji has always welcomed everyone, whatever their sect.'],
  ]),
  'chuson-ji': set('chuson-ji', [
    ['金色堂', 'Golden hall', 'peace', 'classic', 'ichimatsu', '#e8b923', '#3a2e1a', '🌟', '#d4a017', 'The small hall of pure gold built in 1124, praying for peace for friend and foe alike.', true],
    ['芭蕉', "Bashō's poem", 'study', 'ema', 'plain', '#f3ead7', '#2c241c', '🖌️', '#4a3a2e', '"The summer grasses: all that remains of warriors\' dreams." A charm for words.'],
    ['中尊寺ハス', 'Ancient lotus', 'health', 'round', 'dots', '#f6c1d0', '#5f8a4e', '🪷', '#d9577f', 'Lotus seeds found with the Fujiwara lords bloomed again after 800 years.'],
    ['月見坂', 'Moon-viewing slope', 'travel', 'gourd', 'plain', '#1f3a6b', '#f3e2b8', '🌙', '#1f3a6b', 'The cedar-lined climb to the temple, which Bashō walked on his journey north.'],
    ['黄金', 'Hiraizumi gold', 'prosperity', 'heart', 'dots', '#f0c94a', '#a37c00', '🪙', '#d4a017', 'Northern gold made the Fujiwara rich enough to rival Kyoto.'],
  ]),
  'atsuta-jingu': set('atsuta-jingu', [
    ['草薙', 'Kusanagi sword', 'protection', 'classic', 'plain', '#4b3a78', '#e9c46a', '🗡️', '#4b3a78', 'The legendary sword that cut the grass and saved Yamato Takeru from a wildfire.', true],
    ['信長塀', "Nobunaga's wall", 'victory', 'ema', 'stripes', '#b8743a', '#f3e2c8', '🏯', '#a8642a', 'Nobunaga prayed here before his famous victory, then built this wall in thanks.'],
    ['大楠', 'Great camphor', 'health', 'gourd', 'asanoha', '#5f8f4e', '#e5f2d6', '🌳', '#5f8f4e', 'A 1,000-year-old camphor, said to be planted by the monk Kōbō Daishi.'],
    ['神鶏', 'Shrine chickens', 'family', 'mascot', 'plain', '#fffaf0', '#e0412a', 'chick', '#e0412a', 'Chickens roam freely under the trees here.'],
    ['宮きしめん', 'Kishimen noodle', 'prosperity', 'round', 'stripes', '#f3e2c8', '#8a5a2a', '🍜', '#b7791f', 'Flat Nagoya noodles, served right in the shrine grounds.'],
  ]),
  'kumano-nachi-taisha': set('kumano-nachi-taisha', [
    ['八咫烏', 'Yatagarasu', 'victory', 'mascot', 'plain', '#2c2c34', '#e0412a', 'crow', '#2c2c34', 'The three-legged crow that guided Emperor Jimmu, and now the emblem of Japan\'s football team.'],
    ['那智の滝', 'Nachi falls', 'health', 'classic', 'seigaiha', '#eaf4fb', '#2f6f9a', '💧', '#2f6f9a', 'Its water is said to grant long life.'],
    ['三重塔', 'Vermilion pagoda', 'peace', 'ema', 'plain', '#e0412a', '#fff3f0', '🛕', '#e0412a', 'The postcard view: pagoda, waterfall and mountains together.'],
    ['梛', 'Nagi leaf', 'love', 'heart', 'plain', '#5f8f4e', '#e5f2d6', '🍃', '#5f8f4e', 'Nagi leaves are very hard to tear, so they stand for ties that never break.'],
    ['熊野古道', 'Kumano Kodō', 'travel', 'gourd', 'asanoha', '#8a6a4a', '#f3e2c8', '🥾', '#8a6a4a', 'For the 1,000-year-old pilgrim trails through the mountains.'],
    ['牛王宝印', 'Crow talisman', 'protection', 'classic', 'ichimatsu', '#2c241c', '#e0412a', '📜', '#2c241c', 'Kumano paper talismans are written in the shape of crows.'],
  ]),
  'naminoue-gu': set('naminoue-gu', [
    ['シーサー', 'Shisa', 'protection', 'mascot', 'plain', '#f2a65a', '#c0392b', 'shisa', '#e07a2a', 'Okinawan lion-dogs guard every gate and rooftop. One mouth open, one closed.'],
    ['航海安全', 'Island waves', 'travel', 'classic', 'seigaiha', '#20a3b8', '#e6fbff', '🌊', '#20a3b8', 'A cliff above the sea, where Ryūkyū ships once prayed for safe voyages.', true],
    ['ハイビスカス', 'Hibiscus', 'love', 'heart', 'plain', '#e8394f', '#ffe1e6', '🌺', '#e8394f', 'Hibiscus is called akabana, "red flower", in Okinawa.'],
    ['紅型', 'Bingata', 'family', 'round', 'dots', '#f5c64a', '#2f6fb0', '🎨', '#2f6fb0', 'Bright Okinawan stencil-dyed cloth in yellow, blue and red.'],
    ['星砂', 'Star sand', 'prosperity', 'gourd', 'dots', '#f3e6c8', '#c9a050', '⭐', '#c9a050', 'Tiny star-shaped shells from the beach. A lucky handful.'],
    ['ゴーヤー', 'Goya', 'health', 'round', 'plain', '#7cc05a', '#e5f7d6', '🥒', '#5f9f3e', 'Bitter melon, a staple of the famously long-lived Okinawan diet.'],
  ]),
};

export const omamoriOf = (shrineId: string) => SHRINE_OMAMORI[shrineId] ?? [];

/** Designs for amulets received before every shrine had its own set */
const LEGACY: Record<OmamoriKind, OmamoriDesign> = {
  enmusubi: { id: 'legacy-enmusubi', shrineId: '', jp: '縁結び', name: 'Good ties', wish: 'love', blurb: '', shape: 'classic', pattern: 'stripes', base: '#d9577f', accent: '#fff1f6', motif: '🎀', cord: '#d9577f' },
  gakugyo: { id: 'legacy-gakugyo', shrineId: '', jp: '学業成就', name: 'Study', wish: 'study', blurb: '', shape: 'classic', pattern: 'kikko', base: '#2f5fa8', accent: '#dbe7fb', motif: '📚', cord: '#2f5fa8' },
  kinun: { id: 'legacy-kinun', shrineId: '', jp: '金運', name: 'Prosperity', wish: 'prosperity', blurb: '', shape: 'classic', pattern: 'dots', base: '#c99212', accent: '#fff3c4', motif: '🪙', cord: '#d4a017' },
  kenko: { id: 'legacy-kenko', shrineId: '', jp: '無病息災', name: 'Health', wish: 'health', blurb: '', shape: 'classic', pattern: 'asanoha', base: '#3f8a4a', accent: '#e5f2d6', motif: '🍃', cord: '#3f8a4a' },
  anmin: { id: 'legacy-anmin', shrineId: '', jp: '安眠', name: 'Rest', wish: 'peace', blurb: '', shape: 'classic', pattern: 'seigaiha', base: '#6a5aa8', accent: '#e9e4f7', motif: '🌙', cord: '#6a5aa8' },
};

const BY_ID = new Map(Object.values(SHRINE_OMAMORI).flat().map((d) => [d.id, d]));

/** Look up a design by id, falling back to the old five kinds */
export const designFor = (o: { designId?: string; kind?: OmamoriKind }): OmamoriDesign =>
  (o.designId && BY_ID.get(o.designId)) || LEGACY[o.kind ?? 'enmusubi'];

export const cordHex = (d: OmamoriDesign) => parseInt(d.cord.slice(1), 16);
