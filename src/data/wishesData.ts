/**
 * What each sanctuary is famous for (ご利益).
 *
 * Any kami or Buddha will hear any sincere prayer. These lists only record the wishes each place is
 * traditionally best known for, with the history or legend behind the reputation.
 */

export type WishId = 'love' | 'study' | 'prosperity' | 'health' | 'victory' | 'protection' | 'travel' | 'family' | 'peace';

export interface WishCategory {
  jp: string;
  reading: string;
  en: string;
  short: string;
  emoji: string;
  color: string;
}

export const WISHES: Record<WishId, WishCategory> = {
  love: { jp: '縁結び', reading: 'en-musubi', en: 'Love & good ties', short: 'Love', emoji: '💞', color: '#d9577f' },
  study: { jp: '学業成就', reading: 'gakugyō jōju', en: 'Study & exams', short: 'Study', emoji: '📚', color: '#2f5fa8' },
  prosperity: { jp: '商売繁盛・金運', reading: 'shōbai hanjō', en: 'Business & money', short: 'Money', emoji: '💰', color: '#b8860b' },
  health: { jp: '健康長寿', reading: 'kenkō chōju', en: 'Health & long life', short: 'Health', emoji: '🍃', color: '#3f8a4a' },
  victory: { jp: '必勝・出世', reading: 'hisshō', en: 'Victory & success', short: 'Victory', emoji: '🏆', color: '#c2410c' },
  protection: { jp: '厄除け・開運', reading: 'yakuyoke', en: 'Ward off bad luck', short: 'Luck', emoji: '🍀', color: '#7c3aed' },
  travel: { jp: '交通・航海安全', reading: 'kōtsū anzen', en: 'Safe travel & sea', short: 'Travel', emoji: '⛵', color: '#0e7490' },
  family: { jp: '家内安全・安産', reading: 'kanai anzen', en: 'Family & children', short: 'Family', emoji: '🏠', color: '#b45309' },
  peace: { jp: '心の平安・供養', reading: 'kuyō', en: 'Peace & ancestors', short: 'Peace', emoji: '🪷', color: '#6a5aa8' },
};

export const WISH_ORDER = Object.keys(WISHES) as WishId[];

export interface ShrineWish {
  wish: WishId;
  /** the real reason the place is known for this */
  why: string;
}

export const SHRINE_WISHES: Record<string, ShrineWish[]> = {
  'fushimi-inari': [
    { wish: 'prosperity', why: 'Inari is the kami of rice, and so of wealth. Since the Edo period merchants have donated the ~10,000 vermilion torii to thank her for good business.' },
    { wish: 'family', why: 'As head shrine of some 30,000 Inari shrines, it is also visited for household safety and good harvests.' },
  ],
  itsukushima: [
    { wish: 'travel', why: 'Its three Munakata goddesses guard the sea. Seafarers on the Inland Sea have prayed here for safe voyages for centuries.' },
    { wish: 'prosperity', why: 'Taira no Kiyomori rebuilt the shrine in 1168 and his clan rose to rule Japan. Goddess Ichikishima-hime is also linked with Benzaiten, of fortune and the arts.' },
  ],
  'meiji-jingu': [
    { wish: 'love', why: 'The Meoto Kusu, two camphor trees planted in 1920, grew into a symbol of a happy marriage. It is one of Tokyo\'s most popular wedding shrines.' },
    { wish: 'family', why: 'Emperor Meiji and Empress Shōken are enshrined together, and families come for household safety. It draws more New Year visitors than anywhere in Japan.' },
  ],
  'senso-ji': [
    { wish: 'protection', why: 'Tokyo\'s oldest temple (628) houses a hidden Kannon. Edo townspeople prayed to her for protection from fire, disaster and misfortune.' },
    { wish: 'health', why: 'Visitors waft smoke from the great incense burner over their bodies, a custom believed to heal and protect the part it touches.' },
  ],
  koyasan: [
    { wish: 'peace', why: 'Kōbō Daishi is believed to rest in eternal meditation at Okunoin. Over 200,000 graves and memorials surround him, so people come to pray for their ancestors.' },
    { wish: 'protection', why: 'As the head temple of Shingon Buddhism, it is known for esoteric goma fire rituals that burn away misfortune.' },
  ],
  'kinkaku-ji': [
    { wish: 'prosperity', why: 'Its gold-leaf pavilion has made it a favourite stop for money luck (金運).' },
    { wish: 'protection', why: 'The temple\'s gold talismans are for 開運招福: opening good fortune and inviting happiness.' },
  ],
  'kiyomizu-dera': [
    { wish: 'love', why: 'Jishu Jinja on the temple grounds is Kyoto\'s famous love shrine. Walk between its two love-fortune stones with your eyes closed.' },
    { wish: 'health', why: 'The three streams of the Otowa waterfall are said to grant long life, success in study, and love.' },
    { wish: 'study', why: 'The second Otowa stream is traditionally the one for learning, and students queue to drink from it.' },
  ],
  'nikko-tosho-gu': [
    { wish: 'victory', why: 'It enshrines Tokugawa Ieyasu, who unified Japan and founded 260 years of peace. People pray here for success and rising in the world.' },
    { wish: 'protection', why: 'It was built to the north-east of Edo, the "demon gate" direction, to protect the shogun\'s capital.' },
  ],
  'ise-jingu': [
    { wish: 'peace', why: 'The shrine of Amaterasu is a place for gratitude more than requests. Tradition says you thank the kami and pray for the peace of the whole country.' },
    { wish: 'prosperity', why: 'The Gekū enshrines Toyouke, kami of food, clothing, shelter and every kind of industry.' },
  ],
  'izumo-taisha': [
    { wish: 'love', why: 'Each tenth month all the kami gather here to decide the year\'s bonds between people. That makes Ōkuninushi Japan\'s god of en-musubi.' },
    { wish: 'health', why: 'In the Kojiki, Ōkuninushi heals the skinned Hare of Inaba, so he is also honoured as a kami of medicine.' },
  ],
  'todai-ji': [
    { wish: 'peace', why: 'Emperor Shōmu ordered the Great Buddha in 743 to bring peace to a land struck by smallpox, famine and revolt.' },
    { wish: 'health', why: 'Rub the wooden Binzuru statue outside the Great Buddha Hall on the place that hurts, and it is said to heal you.' },
  ],
  'dazaifu-tenmangu': [
    { wish: 'study', why: 'It stands over the grave of Sugawara no Michizane, the brilliant scholar who became Tenjin, the god of learning. Over a million students visit each exam season.' },
  ],
  'hokkaido-jingu': [
    { wish: 'family', why: 'It is the main shrine of Hokkaido. Sapporo families come here for household safety and their children\'s shrine visits.' },
    { wish: 'prosperity', why: 'Founded in 1869 for the three "pioneer kami" of Hokkaido\'s settlement, it is visited for success in new ventures.' },
  ],
  'kotohira-gu': [
    { wish: 'travel', why: '"Konpira-san" is the guardian of sailors. Ships\' crews still pray here, and the shrine holds hundreds of votive pictures of ships.' },
    { wish: 'prosperity', why: 'Edo pilgrims also climbed the 785 steps for good harvests and business. Those who could not go sent a dog in their place.' },
  ],
  'kamakura-daibutsu': [
    { wish: 'peace', why: 'The bronze Amida Buddha (1252) promises rebirth in his Pure Land to anyone who calls his name.' },
  ],
  'zenko-ji': [
    { wish: 'peace', why: 'Zenkō-ji welcomes everyone, of any sect and in the past either sex. Touching the "key to paradise" in the dark Okaidan is said to promise rebirth in the Pure Land.' },
    { wish: 'health', why: 'Its much-rubbed Binzuru statue, worn smooth by centuries of hands, is believed to heal whatever ails you.' },
  ],
  'chuson-ji': [
    { wish: 'peace', why: 'Fujiwara no Kiyohira founded it around 1105 to console the souls of everyone killed in the northern wars, friend and foe, and to pray for a peaceful land.' },
  ],
  'atsuta-jingu': [
    { wish: 'victory', why: 'Oda Nobunaga prayed here in 1560 before his surprise victory at Okehazama, then gave the shrine its "Nobunaga wall" in thanks.' },
    { wish: 'protection', why: 'It keeps the Kusanagi sword, one of the three imperial regalia, which protected the hero Yamato Takeru.' },
  ],
  'kumano-nachi-taisha': [
    { wish: 'health', why: 'Nachi Falls is worshipped as a kami, and its water is said to bring long life (延命長寿).' },
    { wish: 'victory', why: 'Yatagarasu, the three-legged crow, guided Emperor Jimmu to victory. Today it is the emblem of Japan\'s national football team.' },
  ],
  'naminoue-gu': [
    { wish: 'travel', why: 'It stands on a cliff above the sea and is Okinawa\'s chief shrine. Ryūkyū ships prayed here for safe voyages.' },
    { wish: 'prosperity', why: 'Fishermen have long prayed here for good catches, and local merchants for trade.' },
    { wish: 'family', why: 'Okinawan families come to Naminoue for household safety and for blessings on their children.' },
  ],
};

export const wishesOf = (shrineId: string) => SHRINE_WISHES[shrineId] ?? [];
export const hasWish = (shrineId: string, w: WishId) => wishesOf(shrineId).some((x) => x.wish === w);
