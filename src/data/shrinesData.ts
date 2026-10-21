import { ShrineData, OmikujiFortune, EmaVotive } from '../types/shrine';

export const SHRINES: ShrineData[] = [
  {
    id: 'fushimi-inari',
    name: 'Fushimi Inari Taisha',
    kanjiName: '伏見稲荷大社',
    romanizedName: 'Fushimi Inari-taisha',
    type: 'shrine',
    region: 'Kansai',
    prefecture: 'Kyoto',
    mapCoords: { x: 49.8, y: 52.0 },
    establishedYear: '711 CE',
    enshrinedDeityOrBuddha: 'Inari Okami (Goddess of Rice, Harvest & Prosperity)',
    primaryBlessing: 'Business Prosperity, Good Harvest & Family Safety',
    tagline: 'The Sacred Mountain Path of Ten Thousand Vermilion Torii',
    description: 'Head shrine of over 30,000 Inari shrines throughout Japan. Perched at the base of sacred Mount Inari, famous for endless tunnels of vivid scarlet torii gates and kitsune fox messengers clutching sacred keys and jewels.',
    features: [
      'Senbon Torii (Thousand Torii Corridor)',
      'Sacred Stone Fox Guardians (Kitsune)',
      'Honden (Main Worship Sanctuary)',
      'Mountain Pine & Cedar Slopes',
      'Ishidoro Stone Lantern Avenue'
    ],
    architectureStyle: 'fushimi_inari',
    spots: [
      {
        id: 'spot-torii',
        name: 'First Grand Torii (Ichino-Torii)',
        japaneseName: '一の鳥居',
        position: [0, 0, 26],
        cameraTarget: [0, 2, 20],
        description: 'Stand before the towering vermilion entry gate. Bow once to purify mind and spirit before stepping onto sacred ground.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Purification Water Basin (Temizuya)',
        japaneseName: '手水舎',
        position: [-9, 0, 16],
        cameraTarget: [-9, 1.2, 16],
        description: 'Wash hands and rinse mouth with fresh spring water using the wooden hishaku ladle to cleanse worldly impurities.',
        type: 'temizuya'
      },
      {
        id: 'spot-senbon',
        name: 'Senbon Torii Tunnel Entrance',
        japaneseName: '千本鳥居',
        position: [0, 0, 12],
        cameraTarget: [0, 2.5, 0],
        description: 'Walk through the breathtaking twin tunnels of vivid vermilion torii gates donated by grateful worshippers over centuries.',
        type: 'scenic'
      },
      {
        id: 'spot-haiden',
        name: 'Main Worship Hall (Haiden)',
        japaneseName: '本殿・拝殿',
        position: [0, 0, -14],
        cameraTarget: [0, 2.5, -20],
        description: 'Offer a 5-yen coin into the wooden saisen box, pull the sacred suzu bell rope, and perform the traditional 2 bows, 2 claps, 1 bow.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Kitsune Ema Votive Rack',
        japaneseName: '絵馬掛所',
        position: [10, 0, -12],
        cameraTarget: [10, 1.8, -12],
        description: 'Write your heartfelt prayer or aspiration onto a wooden votive tablet and hang it among hundreds of fluttering wishes.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Sacred Fortune Draw (Omikuji)',
        japaneseName: 'おみくじ所',
        position: [-10, 0, -12],
        cameraTarget: [-10, 1.8, -12],
        description: 'Shake the wooden cylinder to draw your divine fortune slip for love, career, health, and spiritual clarity.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '伏見稲荷大社',
      deityInscription: '稲荷大神社 御璽',
      vermilionSealShape: 'diamond',
      quote: '千本鳥居の朱の祈り、五穀豊穣と諸願成就を祈念す。'
    },
    audioTrackTitle: 'Whispering Torii of Kyoto'
  },
  {
    id: 'itsukushima',
    name: 'Itsukushima Shrine',
    kanjiName: '厳島神社',
    romanizedName: 'Itsukushima-jinja',
    type: 'shrine',
    region: 'Chugoku',
    prefecture: 'Hiroshima (Miyajima)',
    mapCoords: { x: 36.8, y: 54.8 },
    establishedYear: '593 CE',
    enshrinedDeityOrBuddha: 'Three Munakata Goddesses (Protectors of Seas & Safe Travel)',
    primaryBlessing: 'Maritime Safety, Protection from Harm & Safe Voyages',
    tagline: 'The Floating Shrine & Grand Torii of the Seto Inland Sea',
    description: 'A UNESCO World Heritage sanctuary rising elegantly out of the tranquil waters of Miyajima island. Connected by red boardwalks, the 16-meter Grand O-Torii gate appears to float miraculously on the sea during high tide.',
    features: [
      'Floating O-Torii Gate in the Bay',
      'Wooden Pierced Boardwalk Corridors (Kairō)',
      'Water Reflection & Tidal Basin',
      'Sacred Mount Misen Backdrop',
      'Vermilion Seaside Lanterns'
    ],
    architectureStyle: 'itsukushima_floating',
    spots: [
      {
        id: 'spot-torii',
        name: 'Floating Grand O-Torii Viewpoint',
        japaneseName: '大鳥居（海中）',
        position: [0, 0, 32],
        cameraTarget: [0, 4, 18],
        description: 'Admire the monumental 16-meter vermilion torii gate standing proudly in the Seto Inland Sea against the ocean horizon.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Seaside Purification Pavilion',
        japaneseName: '祓殿・手水舎',
        position: [-11, 0, 14],
        cameraTarget: [-11, 1.2, 14],
        description: 'Purify body and soul with spring mountain water flowing down from Mount Misen before crossing the wooden sea boardwalks.',
        type: 'temizuya'
      },
      {
        id: 'spot-kairo',
        name: 'Vermilion Sea Corridor (Kairō)',
        japaneseName: '廻廊',
        position: [0, 0, 10],
        cameraTarget: [0, 2, -5],
        description: 'Stroll along the historic slatted red wooden pier elevated above the crystal water with gentle wave reflections.',
        type: 'scenic'
      },
      {
        id: 'spot-haiden',
        name: 'Main Sea Sanctuary (Honden & Haiden)',
        japaneseName: '本社本殿',
        position: [0, 0, -14],
        cameraTarget: [0, 2.5, -20],
        description: 'Face the open ocean sanctuary of the three sea goddesses. Toss your coin, ring the ceremonial bell, and bow in reverence.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Seafarer Ema Tablet Pavilion',
        japaneseName: '絵馬所',
        position: [11, 0, -10],
        cameraTarget: [11, 1.8, -10],
        description: 'Hang your painted wooden prayer for peaceful journeys, family safety, and calm waters across life’s seas.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Miyajima Omikuji Corner',
        japaneseName: 'おみくじ授与所',
        position: [-11, 0, -10],
        cameraTarget: [-11, 1.8, -10],
        description: 'Draw a fortune inscribed with ancient sea poetry and blessings of good omen from the deities of the waves.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '厳島神社',
      deityInscription: '安芸国一宮 厳島社',
      vermilionSealShape: 'flower',
      quote: '潮満ちて海上に浮かぶ社殿、航海安全と道中平穏を祈願す。'
    },
    audioTrackTitle: 'Tides of Sacred Miyajima'
  },
  {
    id: 'meiji-jingu',
    name: 'Meiji Jingu',
    kanjiName: '明治神宮',
    romanizedName: 'Meiji Jingū',
    type: 'shrine',
    region: 'Kanto',
    prefecture: 'Tokyo (Shibuya)',
    mapCoords: { x: 62.4, y: 49.6 },
    establishedYear: '1920 CE',
    enshrinedDeityOrBuddha: 'Emperor Meiji & Empress Shoken',
    primaryBlessing: 'Peace of Mind, Harmonious Marriage & Good Fortune',
    tagline: 'Majestic Eternal Evergreen Forest & Colossal Cypress Torii',
    description: 'An oasis of profound serenity in the heart of Tokyo. Surrounded by 170 acres of sacred evergreen forest with over 120,000 trees donated from across Japan, entered via towering natural Taiwanese cypress O-Torii gates.',
    features: [
      'Natural Cypress Grand O-Torii (12m)',
      'Chinjyu-no-Mori Sacred Evergreen Canopy',
      'Grand Stone Sando Gravel Promenade',
      'Monumental Wooden Worship Courtyard',
      'Sacred Camphor Trees (Meoto-Kusu)'
    ],
    architectureStyle: 'meiji_sacred_forest',
    spots: [
      {
        id: 'spot-torii',
        name: 'Grand Wooden O-Torii Gate',
        japaneseName: '大鳥居（木造）',
        position: [0, 0, 28],
        cameraTarget: [0, 4, 18],
        description: 'One of Japan’s largest wooden torii, sculpted from ancient cypress. Step under its majestic timber frame and bow into quiet tranquility.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Great Forest Temizuya',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Purify with cool forest water flowing from a solid granite basin beneath towering cedar and camphor trees.',
        type: 'temizuya'
      },
      {
        id: 'spot-sando',
        name: 'Sacred Gravel Promenade (Sando)',
        japaneseName: '参道',
        position: [0, 0, 8],
        cameraTarget: [0, 2, -4],
        description: 'Hear the meditative crunch of gravel pebbles underfoot as sunlight filters through ancient evergreen branches.',
        type: 'scenic'
      },
      {
        id: 'spot-haiden',
        name: 'Outer Worship Sanctuary (Gehaiden)',
        japaneseName: '外拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3, -22],
        description: 'Worship at the vast copper-roofed sanctuary framed by twin sacred camphor trees bound by sacred shimenawa rope.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Sacred Camphor Ema Courtyard',
        japaneseName: '夫婦楠・絵馬掛所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Tie your wooden prayer tablet inscribed with wishes for marital harmony, health, and peaceful spirits.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Imperial Waka Poetry Fortunes',
        japaneseName: '大御心（おみくじ）',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw an Omikuji featuring philosophical Waka poetry composed by Emperor Meiji and Empress Shoken for life guidance.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '明治神宮',
      deityInscription: '明治神宮 皇璽',
      vermilionSealShape: 'square',
      quote: '永遠の杜に抱かれ、心澄みゆく平和と調和を祈る。'
    },
    audioTrackTitle: 'Silent Canopy of Meiji'
  },
  {
    id: 'senso-ji',
    name: 'Sensō-ji Temple',
    kanjiName: '浅草寺',
    romanizedName: 'Sensō-ji',
    type: 'temple',
    region: 'Kanto',
    prefecture: 'Tokyo (Asakusa)',
    mapCoords: { x: 63.8, y: 48.2 },
    establishedYear: '628 CE',
    enshrinedDeityOrBuddha: 'Bodhisattva Kannon (Goddess of Infinite Mercy)',
    primaryBlessing: 'Spiritual Mercy, Wish Fulfillment & Healing',
    tagline: 'Tokyo’s Oldest Temple, Kaminarimon & Towering Pagoda',
    description: 'Founded in 628 CE after two fishermen pulled a golden Kannon statue from the Sumida River. Famous worldwide for the colossal red Thunder Gate (Kaminarimon) lantern, soaring 5-story pagoda, and healing incense smoke burner.',
    features: [
      'Kaminarimon (Thunder Gate & Giant Red Lantern)',
      'Gojū-no-tō (Majestic 5-Story Buddhist Pagoda)',
      'Jōkōro (Giant Bronze Incense Urn with Sacred Smoke)',
      'Kannondō (Grand Main Temple Hall)',
      'Ancient Cedar Wood Pillars & Gold Altar'
    ],
    architectureStyle: 'sensoji_pagoda',
    spots: [
      {
        id: 'spot-torii',
        name: 'Kaminarimon (Thunder Gate)',
        japaneseName: '雷門（風雷神門）',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Behold the iconic 4-meter tall red chochin paper lantern inscribed with "Kaminarimon" flanked by the gods of wind and thunder.',
        type: 'torii'
      },
      {
        id: 'spot-jokoro',
        name: 'Sacred Incense Burner (Jōkōro)',
        japaneseName: '常香炉',
        position: [0, 0, 4],
        cameraTarget: [0, 1.6, 4],
        description: 'Waft the billowing, fragrant cedar and sandalwood incense smoke over your body and head to receive health and wisdom.',
        type: 'jokoro'
      },
      {
        id: 'spot-pagoda',
        name: 'Five-Story Pagoda (Gojū-no-tō)',
        japaneseName: '五重塔',
        position: [-14, 0, -4],
        cameraTarget: [-14, 8, -4],
        description: 'Gaze up at the magnificent 53-meter five-tiered Buddhist pagoda holding sacred relic stones and bronze eaves.',
        type: 'pagoda'
      },
      {
        id: 'spot-haiden',
        name: 'Main Temple Hall (Kannondō)',
        japaneseName: '本堂（観音堂）',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Bow deeply to Bodhisattva Kannon, toss an offering coin, and listen to the rich bronze temple gong echo through the courtyard.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Lotus Blossom Ema Stand',
        japaneseName: '絵馬掛け',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Inscribe your heartfelt petition for compassion, healing, family happiness, and success onto wooden tablets.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Traditional Asakusa Omikuji',
        japaneseName: 'おみくじ本所',
        position: [-10, 0, -15],
        cameraTarget: [-10, 1.8, -15],
        description: 'Experience Senso-ji’s legendary 100-number Chinese divination system. Receive deep prophetic guidance for your path.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '金龍山 浅草寺',
      deityInscription: '大悲閣 聖観世音菩薩',
      vermilionSealShape: 'circle',
      quote: '浅草観音の慈悲の光、万民の苦悩を除き福徳を授く。'
    },
    audioTrackTitle: 'Evening Incense of Asakusa'
  },
  {
    id: 'koyasan',
    name: 'Kōyasan Danjo Garan',
    kanjiName: '高野山 壇上伽藍',
    romanizedName: 'Kōyasan Danjō Garan',
    type: 'temple',
    region: 'Kansai',
    prefecture: 'Wakayama',
    mapCoords: { x: 48.6, y: 56.8 },
    establishedYear: '816 CE',
    enshrinedDeityOrBuddha: 'Dainichi Nyorai (Cosmic Cosmic Buddha)',
    primaryBlessing: 'Spiritual Awakening, Inner Peace & Transcendence',
    tagline: 'Sacred Mountain Cloud Sanctuary of Shingon Esoteric Buddhism',
    description: 'High in the sacred mountains of Wakayama shrouded in mystic mist, founded by Buddhist saint Kobo Daishi (Kukai) in 816 CE. Danjo Garan is the central temple precinct featuring the colossal 48.5m vermilion Konpon Daito pagoda representing a 3D cosmic mandala.',
    features: [
      'Konpon Daitō (Great Stupa of the Cosmic Buddha)',
      'Ancient Mountain Cedar Sando with Mossy Lanterns',
      'Kondō (Main Golden Hall of Rituals)',
      'Deep Resonance Bronze Bonshō Bell Tower',
      'Mountain Mist & Pine Breeze'
    ],
    architectureStyle: 'koyasan_mountain',
    spots: [
      {
        id: 'spot-torii',
        name: 'Chumon Entrance Gate',
        japaneseName: '中門',
        position: [0, 0, 26],
        cameraTarget: [0, 3, 16],
        description: 'Enter the mystical mountain precinct through the grand reconstructed Chumon gate guarded by the Four Heavenly Kings.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Sacred Mountain Spring Temizuya',
        japaneseName: '手水舎',
        position: [-10, 0, 14],
        cameraTarget: [-10, 1.2, 14],
        description: 'Cleanse with pristine mountain spring water sourced from the sacred eight peaks of Mount Koya.',
        type: 'temizuya'
      },
      {
        id: 'spot-pagoda',
        name: 'Konpon Daitō (Great Stupa)',
        japaneseName: '根本大塔',
        position: [0, 0, 4],
        cameraTarget: [0, 5, -2],
        description: 'Marvel at the monumental 48.5-meter vermilion stupa enshrining the Cosmic Buddha Dainichi Nyorai surrounded by bodhisattvas.',
        type: 'pagoda'
      },
      {
        id: 'spot-haiden',
        name: 'Kondō Golden Hall',
        japaneseName: '金堂',
        position: [0, 0, -15],
        cameraTarget: [0, 3, -22],
        description: 'The ceremonial sanctuary of Koyasan where solemn esoteric Buddhist chants, incense, and prayers resonate across centuries.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Kobo Daishi Ema Shrine',
        japaneseName: '弘法大師絵馬所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Offer your aspirations for wisdom, clarity of life purpose, and safe journeys protected by Kobo Daishi.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Esoteric Wisdom Fortunes',
        japaneseName: '密教おみくじ',
        position: [-11, 0, -12],
        cameraTarget: [-11, 1.8, -12],
        description: 'Seek contemplation from ancient Shingon sutras, discerning how to overcome obstacles through calm mindfulness.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '高野山 壇上伽藍',
      deityInscription: '大日如来 南無大師遍照金剛',
      vermilionSealShape: 'flower',
      quote: '八葉の霊峰に響く梵鐘、密教の法灯は悠久に輝く。'
    },
    audioTrackTitle: 'Mountain Cloud Chants of Koya'
  },
  {
    id: 'kinkaku-ji',
    name: 'Kinkaku-ji (Golden Pavilion)',
    kanjiName: '金閣寺（鹿苑寺）',
    romanizedName: 'Rokuon-ji (Kinkaku-ji)',
    type: 'temple',
    region: 'Kansai',
    prefecture: 'Kyoto (Kita)',
    mapCoords: { x: 48.8, y: 50.8 },
    establishedYear: '1397 CE',
    enshrinedDeityOrBuddha: 'Relics of the Buddha & Bodhisattva Kannon',
    primaryBlessing: 'Spiritual Purification, Inner Radiance & Prosperity',
    tagline: 'The Gilded Golden Reliquary Shimmering on the Mirror Pond',
    description: 'A masterpiece of Muromachi Zen culture. The top two stories of this 3-story pavilion are entirely covered in brilliant pure gold leaf, standing in harmony at the edge of the Mirror Pond (Kyoko-chi), crowned by a radiant golden bronze Phoenix (Hō-ō).',
    features: [
      'Shariden (3-Tier Golden Pavilion with Pure Gold Leaf)',
      'Kyōko-chi (Mirror Pond with Bonsai Pine Islets)',
      'Hō-ō (Golden Phoenix Roof Finial)',
      'Sekkatei (Historic Teahouse with Stepping Stones)',
      'Zen Rock Garden & Sacred Mountain Backdrop'
    ],
    architectureStyle: 'kinkakuji_golden',
    spots: [
      {
        id: 'spot-torii',
        name: 'Somon Entrance & Cedar Path',
        japaneseName: '総門・参道',
        position: [0, 0, 28],
        cameraTarget: [0, 2.5, 18],
        description: 'Enter through the quiet cedar approach lined with bamboo fences and stone lanterns into the golden realm.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Mirror Pond Temizuya',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse hands and mouth with cool water flowing from the northern Kyoto mountains before gazing upon the gold pavilion.',
        type: 'temizuya'
      },
      {
        id: 'spot-pavilion',
        name: 'Kyoko-chi Mirror Pond Vista',
        japaneseName: '鏡湖池・金閣展望',
        position: [0, 0, 10],
        cameraTarget: [0, 5, -8],
        description: 'The iconic vista where the pure gold pavilion casts its golden reflection across the tranquil pond waters.',
        type: 'scenic'
      },
      {
        id: 'spot-haiden',
        name: 'Golden Pavilion Sanctuary (Shariden)',
        japaneseName: '舎利殿（金閣）',
        position: [0, 0, -12],
        cameraTarget: [0, 4.5, -18],
        description: 'Bow in quiet contemplation before the gold sanctuary housing sacred Buddhist relics and the golden phoenix.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Golden Phoenix Ema Stand',
        japaneseName: '鳳凰絵馬掛所',
        position: [11, 0, -10],
        cameraTarget: [11, 1.8, -10],
        description: 'Hang your painted wooden votive tablet inscribed with wishes for shining personal success and peace.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Zen Golden Omikuji',
        japaneseName: '金閣おみくじ',
        position: [-11, 0, -10],
        cameraTarget: [-11, 1.8, -10],
        description: 'Draw a gold-stamped fortune containing Zen proverbs for mindfulness, prosperity, and spiritual awakening.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '鹿苑寺 金閣',
      deityInscription: '舎利殿 聖観世音菩薩',
      vermilionSealShape: 'diamond',
      quote: '金泥の光雲、鏡湖の波に揺らぎて菩提の心を生ず。'
    },
    audioTrackTitle: 'Reflections on the Mirror Pond'
  },
  {
    id: 'kiyomizu-dera',
    name: 'Kiyomizu-dera',
    kanjiName: '清水寺',
    romanizedName: 'Kiyomizu-dera',
    type: 'temple',
    region: 'Kansai',
    prefecture: 'Kyoto (Higashiyama)',
    mapCoords: { x: 50.5, y: 51.5 },
    establishedYear: '778 CE',
    enshrinedDeityOrBuddha: 'Eleven-Headed Thousand-Armed Kannon',
    primaryBlessing: 'Health & Longevity, Academic Success & Good Relationships',
    tagline: 'The Monumental Wooden Stage & Sacred Three Springs of Otowa',
    description: 'Perched dramatically on the wooded slopes of Mount Otowa overlooking Kyoto. Renowned for its monumental 13-meter high wooden stage constructed without a single nail using 139 giant Keyaki wood pillars, and the sacred Otowa Waterfall with 3 blessed streams.',
    features: [
      'Kiyomizu-no-butai (Monumental 13m Wooden Scaffold Stage)',
      'Otowa-no-taki (Three Sacred Spring Waterfalls)',
      'Niomon (Grand Scarlet Two-Story Deva Gate)',
      'Hondo (Grand Main Sanctuary Hall of Kannon)',
      'Panoramic Mountain Gorge & Maple Valley'
    ],
    architectureStyle: 'kiyomizudera_stage',
    spots: [
      {
        id: 'spot-torii',
        name: 'Niomon Grand Entrance Gate',
        japaneseName: '仁王門',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Stand before the vibrant scarlet two-story Niomon gate guarding the steep mountain approach to Kiyomizu.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Todoroki Dragon Head Fountain',
        japaneseName: '轟の滝・手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Purify with cold mountain water flowing from the carved dragon mouth before ascending the wooden steps.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Kiyomizu Wooden Stage (Kiyomizu-no-butai)',
        japaneseName: '清水の舞台・本堂',
        position: [0, 0, -14],
        cameraTarget: [0, 3.5, -20],
        description: 'Step onto the legendary wooden cantilevered stage suspended high above the cherry blossom and maple valley. Ring the bell and offer prayer.',
        type: 'haiden'
      },
      {
        id: 'spot-otowa',
        name: 'Otowa Waterfall (Otowa-no-taki)',
        japaneseName: '音羽の滝',
        position: [12, 0, 0],
        cameraTarget: [12, 2, 0],
        description: 'Catch crystal water with long-handled cups from three sacred channels: health/longevity, academic success, or love.',
        type: 'scenic'
      },
      {
        id: 'spot-ema',
        name: 'Otowa Thousand-Armed Kannon Ema Stand',
        japaneseName: '千手観音絵馬所',
        position: [11, 0, -12],
        cameraTarget: [11, 1.8, -12],
        description: 'Inscribe your heartfelt wish on an Otowa wooden tablet and hang it beneath the ancient cypress eaves.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Kiyomizu Kannon Omikuji',
        japaneseName: '清水寺おみくじ',
        position: [-11, 0, -12],
        cameraTarget: [-11, 1.8, -12],
        description: 'Draw an ancient divine slip blessed by the Eleven-Headed Thousand-Armed Kannon for life direction.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '音羽山 清水寺',
      deityInscription: '大悲閣 千手観世音菩薩',
      vermilionSealShape: 'flower',
      quote: '音羽の清き流れに身を濯ぎ、千手観音の慈悲に心安らぐ。'
    },
    audioTrackTitle: 'Springs of Mount Otowa'
  },
  {
    id: 'nikko-tosho-gu',
    name: 'Nikkō Tōshō-gū',
    kanjiName: '日光東照宮',
    romanizedName: 'Nikkō Tōshō-gū',
    type: 'shrine',
    region: 'Kanto',
    prefecture: 'Tochigi (Nikko)',
    mapCoords: { x: 60.5, y: 43.5 },
    establishedYear: '1617 CE',
    enshrinedDeityOrBuddha: 'Tōshō Daigongen (Deified Tokugawa Ieyasu)',
    primaryBlessing: 'Triumph over Adversity, Resilience & Unshakable Fortitude',
    tagline: 'The Gilded Yōmeimon Gate of the Sun & Three Wise Monkeys',
    description: 'A designated UNESCO World Heritage masterpiece nestled in mystical cedar mountains. Famed for the dazzling gold-leaf Yomeimon (Gate of the Setting Sun), the sacred woodcarvings of the Three Wise Monkeys ("See no evil, speak no evil, hear no evil"), and the tranquil Sleeping Cat (Nemuri-neko).',
    features: [
      'Yōmeimon Gate (Gate of the Setting Sun with 500+ Carvings)',
      'Three Wise Monkeys Woodcarving (Sanzaru)',
      'Towering Sacred Nikko Cedar Avenues',
      'Sleeping Cat (Nemuri-neko) of Lasting Peace',
      'Gilded Bronze & Lacquer Haiden Sanctuary'
    ],
    architectureStyle: 'nikko_tosho',
    spots: [
      {
        id: 'spot-torii',
        name: 'Ishidorii Grand Stone Torii & Cedar Sando',
        japaneseName: '石鳥居・表参道',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Cross beneath the colossal Edo-period granite Ishidorii gate, greeted by crisp mountain mist and centuries-old cedar scent.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Ochōzuya Holy Water Pavilion',
        japaneseName: '御水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse with mountain spring water poured from gilded bronze spouts beneath ornate carved dragon eaves.',
        type: 'temizuya'
      },
      {
        id: 'spot-yomeimon',
        name: 'Gilded Yōmeimon Gate',
        japaneseName: '陽明門',
        position: [0, 0, 6],
        cameraTarget: [0, 4.5, -4],
        description: 'The "Sunset Gate" so intricately sculpted with mythical dragons, lions, and sages that observers can gaze upon it until sundown without tiring.',
        type: 'scenic'
      },
      {
        id: 'spot-haiden',
        name: 'Main Worship Hall (Gohonsha)',
        japaneseName: '御本社・拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Bow before the lavishly gilded, lacquer-embellished sanctuary of Tokugawa Ieyasu, offering prayers for fortitude and guidance.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Three Wise Monkeys Ema Gallery',
        japaneseName: '三猿絵馬所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Inscribe your wish upon a wooden tablet carved with the Three Wise Monkeys, praying for wisdom and protection in daily conduct.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Golden Tōshō Fortunes',
        japaneseName: '東照宮おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw a gold-inscribed fortune scroll carrying teachings of perseverance and patient strategy from Tokugawa Ieyasu.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '日光東照宮',
      deityInscription: '東照大権現 御璽',
      vermilionSealShape: 'square',
      quote: '杉木立に陽光射し、徳川の威徳と不屈の精神を祈念す。'
    },
    audioTrackTitle: 'Cedars of Nikko'
  },
  {
    id: 'ise-jingu',
    name: 'Ise Jingu (Grand Shrine of Ise)',
    kanjiName: '伊勢神宮（内宮）',
    romanizedName: 'Ise Jingū (Naikū)',
    type: 'shrine',
    region: 'Kansai',
    prefecture: 'Mie (Ise)',
    mapCoords: { x: 53.0, y: 55.5 },
    establishedYear: '4 BCE',
    enshrinedDeityOrBuddha: 'Amaterasu Ōmikami (Supreme Sun Goddess)',
    primaryBlessing: 'Supreme Harmony, Universal Light, Gratitude & Pure Life',
    tagline: 'The Soul of Japan & Sacred Hinoki Uji Bridge',
    description: 'The supreme spiritual sanctuary of Shinto in Japan, revered for over 2,000 years. Enshrining Sun Goddess Amaterasu Omikami, built purely from unpainted Japanese Hinoki cypress in ancient Shinmei-zukuri style, rebuilt every 20 years in the sacred Shikinen Sengu ritual.',
    features: [
      'Uji Bridge over the Pure Isuzugawa River',
      'Ancient Hinoki Cypress Shinmei-zukuri Architecture',
      'Kogi-no-Mori Sacred Primeval Cypress Forest',
      'Mitarashi River Stone Basin Purification',
      'Sacred Goshintai Mirror of Amaterasu'
    ],
    architectureStyle: 'ise_jingu',
    spots: [
      {
        id: 'spot-torii',
        name: 'Uji Bridge O-Torii & Hinoki Span',
        japaneseName: '宇治橋・大鳥居',
        position: [0, 0, 28],
        cameraTarget: [0, 4, 18],
        description: 'Cross the sacred 100-meter Hinoki bridge spanning the crystal Isuzugawa river, transitioning from worldly life into divine realm.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Isuzugawa River Stone Bank (Mitarashi)',
        japaneseName: '五十鈴川御手洗場',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Kneel on natural river stones to cup and cleanse with the crystalline flowing waters of the sacred Isuzugawa.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Kōtai Jingū Main Sanctuary (Naikū)',
        japaneseName: '皇大神宮・正宮',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Stand before the sacred white linen curtain (Misu) of the pristine Hinoki sanctuary, expressing heartfelt gratitude to the Sun Goddess.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Kaguraden Sacred Ema Pavilion',
        japaneseName: '神楽殿絵馬所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Hang your white Hinoki votive tablet with prayers for family harmony, light in times of darkness, and peaceful minds.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Auspicious Kami Blessing Slip',
        japaneseName: '神札・御神籤授与',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Receive divine words of clarity and inner radiance from ancient shrine oracles.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '伊勢神宮 皇大神宮',
      deityInscription: '天照皇大神 御璽',
      vermilionSealShape: 'circle',
      quote: '五十鈴川の清流、日本人の心のふるさとに感謝を捧ぐ。'
    },
    audioTrackTitle: 'Sunlight of Isuzugawa'
  },
  {
    id: 'izumo-taisha',
    name: 'Izumo Taisha (Grand Shrine of Izumo)',
    kanjiName: '出雲大社',
    romanizedName: 'Izumo Taisha',
    type: 'shrine',
    region: 'Chugoku',
    prefecture: 'Shimane (Izumo)',
    mapCoords: { x: 39.5, y: 49.0 },
    establishedYear: 'Mythological Era',
    enshrinedDeityOrBuddha: 'Ōkuninushi no Ōkami (Deity of En-musubi & Fate)',
    primaryBlessing: 'En-musubi (Bonds of Love, Friendship & Destined Encounters)',
    tagline: 'Sanctuary of Divine Fate & Japan’s Greatest 5.2-Ton Straw Shimenawa',
    description: 'One of Japan’s most ancient and revered shrines. In the 10th lunar month (Kamiarizuki), all eight million Shinto deities across Japan gather at Izumo to deliberate on human destinies and fateful encounters. Famed for its colossal 5.2-ton straw Shimenawa rope.',
    features: [
      'Kaguraden Grand Shimenawa (13.6m long, 5.2-ton Sacred Straw Rope)',
      'Ancient Taisha-zukuri Grand Timber Hall',
      'Pine Tree Avenue of Sando (Matsuno Sando)',
      'Bronze Sacred Horse & Ox Statues',
      'Traditional 4-Clap Reverence (Ni-rei, Yon-hai, Ichi-rei)'
    ],
    architectureStyle: 'izumo_taisha',
    spots: [
      {
        id: 'spot-torii',
        name: 'Seidamari Wooden Torii Gate',
        japaneseName: '勢溜の大鳥居',
        position: [0, 0, 28],
        cameraTarget: [0, 4, 18],
        description: 'Stand at the beginning of the gentle downhill approach, gazing down the majestic ancient pine corridor into Izumo.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Izumo Sacred Water Pavilion',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse hands and mouth with refreshing Izumo mountain spring water before approaching the hall of divine bonds.',
        type: 'temizuya'
      },
      {
        id: 'spot-shimenawa',
        name: 'Grand Shimenawa Sacred Rope at Kaguraden',
        japaneseName: '神楽殿・大注連縄',
        position: [0, 0, 6],
        cameraTarget: [0, 4.5, -4],
        description: 'Gaze up in awe at the colossal 5.2-ton rice straw rope twisted by master craftsmen to ward off all negative energies.',
        type: 'scenic'
      },
      {
        id: 'spot-haiden',
        name: 'Main Worship Hall (Haiden)',
        japaneseName: '御本殿・拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Practice Izumo’s unique worship ritual: Two bows, FOUR claps, and one bow (二礼四拍手一礼), sealing bonds of true destiny.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'En-musubi Red String Ema Stand',
        japaneseName: '縁結び絵馬所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Inscribe your hopes for meaningful relationships, finding true soulmates, or fruitful business partnerships.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'En-musubi Divine Fortune Slip',
        japaneseName: '出雲縁結びおみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw an Omikuji providing detailed auspices on upcoming fateful encounters, timing of partnerships, and lucky directions.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '出雲大社',
      deityInscription: '大国主大神 幽冥神璽',
      vermilionSealShape: 'diamond',
      quote: '八百万の神が集う神在月、良縁を結び幸魂奇魂を仰ぐ。'
    },
    audioTrackTitle: 'Bonds of Izumo Mist'
  },
  {
    id: 'todai-ji',
    name: 'Tōdai-ji Temple',
    kanjiName: '東大寺',
    romanizedName: 'Tōdai-ji',
    type: 'temple',
    region: 'Kansai',
    prefecture: 'Nara',
    mapCoords: { x: 50.5, y: 54.2 },
    establishedYear: '752 CE',
    enshrinedDeityOrBuddha: 'Rushana Buddha (Great Buddha of Nara, Daibutsu)',
    primaryBlessing: 'Universal Compassion, Peace & Boundless Enlightenment',
    tagline: 'The Colossal Bronze Daibutsu & World’s Greatest Wooden Hall',
    description: 'A monument of epic Buddhist civilization in the ancient capital of Nara. The Daibutsuden (Great Buddha Hall) is one of the world’s largest wooden buildings, sheltering the monumental 15-meter tall bronze Great Buddha (Daibutsu) seated on a lotus throne.',
    features: [
      'Daibutsuden (Monumental Great Buddha Hall)',
      'Nara Daibutsu (15-meter, 500-ton Bronze Rushana Buddha)',
      'Nandaimon Gate with Fierce Niō Guardian Statues',
      'Sacred Sika Deer Grazing in Temple Grounds',
      'Giant Bronze Octagonal Lantern (Hakkaku Tōrō)'
    ],
    architectureStyle: 'todaiji_daibutsu',
    spots: [
      {
        id: 'spot-torii',
        name: 'Nandaimon Great South Gate',
        japaneseName: '南大門・金剛力士像',
        position: [0, 0, 28],
        cameraTarget: [0, 4, 18],
        description: 'Pass beneath the monumental two-tiered wooden Nandaimon gate, flanked by 8-meter tall muscular Niō guardian kings sculpted by Unkei.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Great Lotus Water Basin',
        japaneseName: '大仏殿手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Purify hands with cold spring water before entering the grand courtyard of the Great Buddha.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Great Buddha Hall (Daibutsuden)',
        japaneseName: '大仏殿・盧舎那仏',
        position: [0, 0, -15],
        cameraTarget: [0, 3.5, -22],
        description: 'Stand before the colossal bronze Rushana Buddha whose raised right palm offers fearlessness and whose left hand grants wishes.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Sacred Deer & Lotus Ema Rack',
        japaneseName: '奈良絵馬所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Hang your prayer tablet illustrated with sacred Nara deer and lotus blossoms, wishing for peace and good health.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Lotus Wisdom Fortunes',
        japaneseName: '大仏おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw an Omikuji steeped in Buddhist compassion and profound wisdom for tranquil living.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '奈良 東大寺',
      deityInscription: '盧舎那仏 大佛殿',
      vermilionSealShape: 'flower',
      quote: '大仏殿の慈光遍照、大悲無辺にして生きとし生ける者を救う。'
    },
    audioTrackTitle: 'Bells of Great Nara'
  },
  {
    id: 'dazaifu-tenmangu',
    name: 'Dazaifu Tenmangu',
    kanjiName: '太宰府天満宮',
    romanizedName: 'Dazaifu Tenmangū',
    type: 'shrine',
    region: 'Kyushu',
    prefecture: 'Fukuoka (Dazaifu)',
    mapCoords: { x: 27.5, y: 54.5 },
    establishedYear: '919 CE',
    enshrinedDeityOrBuddha: 'Sugawara no Michizane (Tenjin-sama, God of Learning)',
    primaryBlessing: 'Academic Success, Passing Exams, Wisdom & Calligraphy',
    tagline: 'The Revered Sanctuary of Scholars, Arched Taiko Bridges & Sacred Plum',
    description: 'The supreme shrine across Japan dedicated to Sugawara no Michizane, the revered 9th-century scholar and poet known as Tenjin. Students flock from all corners of Japan to pray for passing exams. Famous for the sacred Flying Plum Tree (Tobiume) with 6,000 plum blossoms and curved Taiko bridges.',
    features: [
      'Taiko-bashi (Three Arched Vermilion Bridges across Shinji Pond)',
      'Tobiume (Legendary Flying Plum Tree with 6,000 Blossom Trees)',
      'Sacred Bronze Ox Statues (Shin’gyū)',
      'Momoyama-period Masterpiece Honden Sanctuary',
      'Shinji-ike Pond shaped in the Chinese character for "Heart" (心)'
    ],
    architectureStyle: 'dazaifu_tenmangu',
    spots: [
      {
        id: 'spot-torii',
        name: 'Grand Stone Torii & Taiko Arched Bridges',
        japaneseName: '石鳥居・太鼓橋',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Cross the three arched vermilion bridges representing past, present, and future, purifying your spirit above the heart-shaped pond.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Carved Monolithic Basin (Temizuya)',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse with cool mountain water flowing from a massive carved natural granite boulder.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Main Worship Hall (Honden)',
        japaneseName: '本殿・拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Bow before the magnificent Momoyama-style sanctuary flanked by the historic Tobiume plum tree, praying for academic brilliance.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Scholar’s Sacred Ox Ema Pavilion',
        japaneseName: '学業成就・絵馬所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Tie your wish tablet inscribed with school, college, or licensure exams, seeking the inspiration of Tenjin-sama.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Plum Blossom Omikuji',
        japaneseName: '梅みくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw a pastel pink plum blossom fortune slip with poetic predictions for study, exams, and future aspirations.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '太宰府天満宮',
      deityInscription: '天満宮 天神御璽',
      vermilionSealShape: 'square',
      quote: '飛梅の香気漂う学問の杜、至誠通天の道を歩む。'
    },
    audioTrackTitle: 'Plum Petals of Dazaifu'
  },
  {
    id: 'hokkaido-jingu',
    name: 'Hokkaido Jingu',
    kanjiName: '北海道神宮',
    romanizedName: 'Hokkaidō Jingū',
    type: 'shrine',
    region: 'Hokkaido',
    prefecture: 'Hokkaido (Sapporo)',
    mapCoords: { x: 69.5, y: 17.5 },
    establishedYear: '1869 CE',
    enshrinedDeityOrBuddha: 'Three Pioneering Deities & Emperor Meiji',
    primaryBlessing: 'Pioneering Spirit, Safe Travel, New Beginnings & Resilience',
    tagline: 'The Guardian Sanctuary of the Northern Wilderness & Snow Cedars',
    description: 'Enshrined in 1869 by order of Emperor Meiji to guard and protect the frontier people of Hokkaido. Nestled within Maruyama Park in Sapporo, famous for its majestic northern larch, fir trees, snowy winter landscapes, and simultaneous blooming of cherry blossoms and plum blossoms in spring.',
    features: [
      'Maruyama Primeval Forest & Northern Conifer Canopy',
      'Grand Timber Shinmei-style Main Hall',
      'Snow-capped Copper Eaves & White Stone Paths',
      'Spring Cherry & Plum Synchronous Bloom',
      'Northern Guardian Lion Statues (Komainu)'
    ],
    architectureStyle: 'hokkaido_jingu',
    spots: [
      {
        id: 'spot-torii',
        name: 'Dai-ichi Torii First Timber Gate',
        japaneseName: '第一鳥居・円山参道',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Pass beneath the monumental northern timber torii, stepping onto the tranquil forest approach flanked by towering fir trees.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Northern Spring Water Temizuya',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse with cold pristine mountain spring water sourced from Mount Maruyama.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Main Worship Hall (Haiden)',
        japaneseName: '本殿・拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Offer prayer at the grand northern sanctuary, seeking courage for new beginnings, migrations, and thriving endeavors.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Ezo Snow & Sakura Ema Stand',
        japaneseName: '開拓絵馬掛所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Inscribe your hopes for fresh chapters, adventures, and endurance through life’s cold seasons.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Northern Pioneer Omikuji',
        japaneseName: '蝦夷みくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw a colorful northern fortune offering guidance on upcoming ventures and fortitude.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '北海道神宮',
      deityInscription: '北海道鎮守 皇璽',
      vermilionSealShape: 'square',
      quote: '円山の原生林に鎮まる北の守り、開拓の精神ここに息づく。'
    },
    audioTrackTitle: 'Northern Winds of Maruyama'
  },
  {
    id: 'kotohira-gu',
    name: 'Kotohira-gu (Konpira-san)',
    kanjiName: '金刀比羅宮',
    romanizedName: 'Kotohira-gū (Konpira-san)',
    type: 'shrine',
    region: 'Shikoku',
    prefecture: 'Kagawa (Kotohira)',
    mapCoords: { x: 40.5, y: 57.2 },
    establishedYear: 'Ancient Period',
    enshrinedDeityOrBuddha: 'Ōmononushi no Kami (Protector of Seafarers & Oceans)',
    primaryBlessing: 'Maritime Safety, Successful Voyages, Agriculture & Good Luck',
    tagline: 'The Famed Pilgrimage of 1,368 Mountain Stone Steps Above Sanuki',
    description: 'Affectionately known across Japan as "Konpira-san". Perched on the steep slopes of Mount Zozu in Shikoku, this legendary pilgrimage features 785 stone steps to the main shrine and 1,368 steps to the inner sanctuary, offering breathtaking panoramic vistas across the Sanuki Plain.',
    features: [
      '1,368 Stone Mountain Pilgrimage Steps (Ishidan)',
      'Panoramic Observation Deck over the Sanuki Plain & Mount Iino',
      'O-Torii & Historic Wooden Chōchin Post Lanterns',
      'Maritime Ship Votive Gallery (Ema-den with real ship propellers)',
      'Grand Cypress Shoin & Sacred Golden Crest "金"'
    ],
    architectureStyle: 'kotohira_gu',
    spots: [
      {
        id: 'spot-torii',
        name: 'Daimon Grand Mountain Gate & Stone Steps',
        japaneseName: '大門・石段',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Gaze up at the legendary stone staircase winding upward through cedar and cherry trees into the clouds of Mount Zozu.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Mountain Spring Water Basin',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Refresh and cleanse with sweet mountain spring water after ascending the pilgrimage stairs.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Main Worship Hall (Hongan)',
        japaneseName: '本宮・拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Stand at the 785th step before the majestic golden-crested sanctuary of Konpira-san, praying for safe travels and good fortune.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Maritime Seafarer Ema-den',
        japaneseName: '絵馬殿（船・航海）',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Hang your votive tablet alongside historic ship paintings, praying for calm waters in voyages and personal ventures.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Golden Konpira Fortune Slip',
        japaneseName: '金刀比羅おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw an auspicious gold-stamped fortune slip with blessings for safe voyages and abundant prosperity.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '讃岐国 金刀比羅宮',
      deityInscription: '金刀比羅大神 御璽',
      vermilionSealShape: 'circle',
      quote: '象頭山の千段を登り、讃岐の平野を遥かに望みて海路の無事を祈る。'
    },
    audioTrackTitle: 'Mountain Ascent of Konpira'
  },
  {
    id: 'kamakura-daibutsu',
    name: 'Kamakura Daibutsu (Kōtoku-in)',
    kanjiName: '鎌倉大仏（高徳院）',
    romanizedName: 'Kamakura Daibutsu (Kōtoku-in)',
    type: 'temple',
    region: 'Kanto',
    prefecture: 'Kanagawa (Kamakura)',
    mapCoords: { x: 61.2, y: 49.8 },
    establishedYear: '1252 CE',
    enshrinedDeityOrBuddha: 'Amida Nyorai (Amitābha - Buddha of Infinite Light)',
    primaryBlessing: 'Spiritual Peace, Compassion, Longevity & Safe Passages',
    tagline: 'The Monumental 13-Meter Open-Air Bronze Buddha of Kamakura',
    description: 'A national treasure monumental bronze statue of Amida Buddha standing 13.35 meters high. Cast in 1252, it originally sat inside a colossal wooden temple hall that was washed away by massive ocean storms and a 1498 tsunami, leaving the serene Buddha seated under the open sky for over five centuries.',
    features: [
      'Colossal 121-ton Cast Bronze Buddha (13.35m)',
      'Open-Air Coastal Sanctuary & Pine Groves',
      'Giant Straw Waraji Sandals of the Buddha',
      'Incense Burner Courtyard with Oceanic Mist',
      'Niomon Mountain Gate Guardians'
    ],
    architectureStyle: 'todaiji_daibutsu',
    spots: [
      {
        id: 'spot-torii',
        name: 'Niomon Grand Entrance Gate',
        japaneseName: '仁王門・参道',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Pass beneath the weathered wooden Niomon gate guarded by fierce Nio statues protecting the tranquil sacred grounds.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Stone Lotus Water Basin',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Purify hands with cold fresh water flowing from a stone dragon spout into a lotus-carved granite basin.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Grand Bronze Buddha Altar',
        japaneseName: '大仏前礼拝壇',
        position: [0, 0, -15],
        cameraTarget: [0, 5.0, -22],
        description: 'Stand directly before the awe-inspiring 13.35m bronze Buddha, bowing in reverence to the peaceful face of eternal compassion.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Lotus & Daibutsu Ema Rack',
        japaneseName: '大仏絵馬掛所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Inscribe your prayer for inner tranquility and protection on an ema tablet stamped with the golden silhouette of the Great Buddha.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Lotus Wisdom Fortunes',
        japaneseName: '大仏おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Receive mindful words of Buddhist wisdom and personal direction for overcoming obstacles with grace.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '相州 鎌倉大仏 高徳院',
      deityInscription: '本尊 阿弥陀如来 御璽',
      vermilionSealShape: 'flower',
      quote: '波風を越えて青空の下、無限の慈悲光あまねく照らす。'
    },
    audioTrackTitle: 'Pacific Breeze of Kamakura'
  },
  {
    id: 'zenko-ji',
    name: 'Zenkō-ji Temple',
    kanjiName: '善光寺',
    romanizedName: 'Zenkō-ji',
    type: 'temple',
    region: 'Chubu',
    prefecture: 'Nagano (Shinshu)',
    mapCoords: { x: 55.0, y: 44.5 },
    establishedYear: '642 CE',
    enshrinedDeityOrBuddha: 'Ikko Sanzon Amida Nyorai (First Buddha Statue to Enter Japan)',
    primaryBlessing: 'Universal Salvation Regardless of Creed, Peace & Good Health',
    tagline: 'The Legendary Non-Sectarian Temple & Sacred Pitch-Black Tunnel',
    description: 'One of Japan’s most important and sacred Buddhist pilgrimage sites, welcoming all pilgrims for over 1,400 years without discrimination of sect or gender. The colossal wooden Main Hall is a National Treasure, housing the legendary O-Kaidan Meguri—a pitch-black underground passageway where pilgrims feel along the wall in search of the "Key to Paradise".',
    features: [
      'National Treasure Wooden Hondo (Rebuilt 1707)',
      'O-Kaidan Meguri (Pitch-Black Tunnel to Key of Paradise)',
      'Historic Sanmon Two-Story Gate',
      'Roku-Jizo Six Bodhisattva Statues of Mercy',
      'Stone Paved Nakamise Temple Street'
    ],
    architectureStyle: 'sensoji_pagoda',
    spots: [
      {
        id: 'spot-torii',
        name: 'Sanmon Main Temple Gate',
        japaneseName: '山門（三門）',
        position: [0, 0, 28],
        cameraTarget: [0, 4.0, 18],
        description: 'Approach through the majestic two-story wooden Sanmon gate, framing the vast flagstone courtyard and incense smoke.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Dragon Spring Temizuya',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse with cold mountain water sourced from the Nagano Alps.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'National Treasure Main Hall (Hondō)',
        japaneseName: '本堂・内陣',
        position: [0, 0, -15],
        cameraTarget: [0, 3.5, -22],
        description: 'Bow before the golden sanctuary of the triad Buddha and smell the fragrant sandalwood incense drifting through the ancient timber rafters.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Zenkō-ji Cow & Buddha Ema Stand',
        japaneseName: '善光寺絵馬掛所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Write your hopes on a votive tablet depicting the sacred cow that led the legendary pilgrim to enlightenment.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Shinshu Golden Fortunes',
        japaneseName: '善光寺おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw a fortune offering words of spiritual compassion and light for your life journey.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '信州 善光寺',
      deityInscription: '本尊 善光寺如来 御璽',
      vermilionSealShape: 'square',
      quote: '牛に引かれて善光寺参り、普く衆生を極楽へと導かん。'
    },
    audioTrackTitle: 'Mountain Bells of Shinshu'
  },
  {
    id: 'chuson-ji',
    name: 'Chūson-ji Temple (Konjikidō)',
    kanjiName: '中尊寺（金色堂）',
    romanizedName: 'Chūson-ji (Konjikidō)',
    type: 'temple',
    region: 'Tohoku',
    prefecture: 'Iwate (Hiraizumi)',
    mapCoords: { x: 65.5, y: 31.8 },
    establishedYear: '850 CE',
    enshrinedDeityOrBuddha: 'Amida Nyorai & Northern Fujiwara Pure Land Sanctuary',
    primaryBlessing: 'Peace on Earth, Ancestral Harmony, Prosperity & Serenity',
    tagline: 'The Gilded Pure Land Pavilion of the Northern Cedars',
    description: 'A UNESCO World Heritage sanctuary founded in 850 CE by monk Ennin and gilded in 1124 by the Northern Fujiwara clan. The legendary Konjikidō (Golden Hall) is completely covered in gold leaf inside and out, inlaid with shimmering mother-of-pearl and ivory, embodying the Buddhist Pure Land of Peace.',
    features: [
      'Konjikidō Gilded Pure Land Pavilion (Built 1124)',
      'Tsukimizaka Cedar Avenue Approach',
      'Historic Scripture Repository (Kyōzō)',
      'Ancient Lotus Ponds from 800-Year-Old Seeds',
      'Hiraizumi Mountain Forest Canopy'
    ],
    architectureStyle: 'kinkakuji_golden',
    spots: [
      {
        id: 'spot-torii',
        name: 'Tsukimizaka Ancient Cedar Avenue',
        japaneseName: '月見坂・参道',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Ascend the gentle slope shaded by towering 400-year-old cryptomeria cedars leading into the mountain sanctuary.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Hiraizumi Spring Temizuya',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse hands with pure water gathered from mountain springs.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Konjikidō Golden Pavilion Altar',
        japaneseName: '金色堂・覆堂',
        position: [0, 0, -15],
        cameraTarget: [0, 3.5, -22],
        description: 'Stand in awe before the glistening hall of gold leaf and radiant lacquer, offering a prayer for universal peace.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Pure Land Golden Ema Stand',
        japaneseName: '金色堂絵馬所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Inscribe your heartfelt wish on an ema depicting the Golden Hall and sacred white lotus blossom.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Hiraizumi Pure Land Omikuji',
        japaneseName: '中尊寺おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw a fortune slip offering inspiration for peace, harmony, and resilience in challenging times.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '奥州 平泉 中尊寺',
      deityInscription: '金色堂 阿弥陀如来 御璽',
      vermilionSealShape: 'diamond',
      quote: 'みちのくの黄金の光、争いなき平和の理想郷を照らす。'
    },
    audioTrackTitle: 'Golden Mist of Hiraizumi'
  },
  {
    id: 'atsuta-jingu',
    name: 'Atsuta Jingu',
    kanjiName: '熱田神宮',
    romanizedName: 'Atsuta Jingū',
    type: 'shrine',
    region: 'Chubu',
    prefecture: 'Aichi (Nagoya)',
    mapCoords: { x: 51.2, y: 52.8 },
    establishedYear: '113 CE',
    enshrinedDeityOrBuddha: 'Atsuta no Ōkami (Enshrining Sacred Sword Kusanagi-no-Tsurugi)',
    primaryBlessing: 'Triumph in Endeavors, Protection from Danger, Health & Fortitude',
    tagline: 'The Ancient Forest Enshrining the Imperial Sword of Legend',
    description: 'One of the most sacred and ancient Shinto shrines in Japan, revered for over 1,900 years as the resting home of Kusanagi-no-Tsurugi (the sacred grass-cutting sword), one of the Three Sacred Imperial Regalia of Japan. Set amidst an ancient 200,000-square-meter forested park with giant thousand-year-old camphor trees.',
    features: [
      'Sanctuary of the Sacred Imperial Sword Kusanagi-no-Tsurugi',
      'Giant Sacred Camphor Tree (Okusu) planted by Kobo Daishi',
      'Nobunaga Wall (Nobunaga-bei) built in gratitude for Okehazama victory',
      'Ancient Hinoki Timber Shinmei-style Honden',
      'Tranquil Sacred Forest Trails (Kokoro no Komichi)'
    ],
    architectureStyle: 'ise_jingu',
    spots: [
      {
        id: 'spot-torii',
        name: 'First Forest Torii Gate',
        japaneseName: '第一鳥居・南参道',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Step past the grand wooden Shinmei torii into the deep cedar and camphor canopy of the sacred Atsuta forest.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Ancient Hinoki Basin Temizuya',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse with fresh spring water pouring into a polished granite water basin.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Main Worship Sanctuary (Hongū Haiden)',
        japaneseName: '本宮・拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Perform the two bows, two claps, and one bow before the majestic unpainted cypress sanctuary of the Imperial Sword.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Sword & Falcon Ema Rack',
        japaneseName: '熱田絵馬掛所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Hang a wooden prayer tablet inscribed with wishes for courage, safety, and victory in life tests.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Atsuta Forest Fortunes',
        japaneseName: '熱田神宮おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw an auspicious oracle offering divine guidance and courage for bold initiatives.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '尾張国 熱田神宮',
      deityInscription: '熱田神宮 皇璽',
      vermilionSealShape: 'square',
      quote: '草薙の剣宿る古き杜、熱田の神風に勇気と加護を授かる。'
    },
    audioTrackTitle: 'Imperial Pines of Atsuta'
  },
  {
    id: 'kumano-nachi-taisha',
    name: 'Kumano Nachi Taisha & Seiganto-ji',
    kanjiName: '熊野那智大社（那智の滝）',
    romanizedName: 'Kumano Nachi Taisha & Seiganto-ji',
    type: 'shrine',
    region: 'Kansai',
    prefecture: 'Wakayama (Kii Mountain Range)',
    mapCoords: { x: 50.2, y: 62.0 },
    establishedYear: 'Ancient Era (317 CE)',
    enshrinedDeityOrBuddha: 'Fusumi no Okami (Goddess of Origin) & Sacred Waterfall Deity',
    primaryBlessing: 'Spiritual Rebirth, Wish Fulfillment, Good Relations & Renewal',
    tagline: 'The 133-Meter Sacred Waterfall & Vermilion Three-Story Pagoda',
    description: 'A designated UNESCO World Heritage jewel and key sanctuary of the Kumano Kodo pilgrimage routes. Renowned worldwide for the dramatic vista of the scarlet three-story pagoda standing before the thunderous 133-meter Nachi Falls (Japan’s tallest unbroken waterfall), worshipped as a living kami.',
    features: [
      'Nachi Falls (133-meter Sacred Living Waterfall Deity)',
      'Vermilion Three-Story Sanjūnotō Pagoda',
      'Giant Sacred Camphor Tree (850 Years Old)',
      'Ancient Kumano Kodo Moss-covered Stone Steps',
      'Crow Messenger Yatagarasu of Divine Guidance'
    ],
    architectureStyle: 'sensoji_pagoda',
    spots: [
      {
        id: 'spot-torii',
        name: 'Grand Torii & Waterfall Viewpoint',
        japaneseName: '一の鳥居・那智滝遥拝所',
        position: [0, 0, 28],
        cameraTarget: [0, 4.0, 18],
        description: 'Stand at the overlook gazing across the verdant valley toward the towering 133-meter waterfall cascading in thunderous grace.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Waterfall Spring Temizuya',
        japaneseName: '那智延命水手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse with pristine spray and spring water drawn directly from the sacred falls.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Main Worship Hall (Haiden)',
        japaneseName: '熊野那智大社・拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Offer prayer at the ancient red lacquer mountain sanctuary, experiencing the rejuvenating energy of spiritual rebirth.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Three-Legged Yatagarasu Ema Rack',
        japaneseName: '八咫烏絵馬掛所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Write your wish on an ema carved with the sacred three-legged crow Yatagarasu, praying for correct guidance on life’s path.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Nachi Waterfall Fortunes',
        japaneseName: '那智滝おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw a fortune washed by the spirit of the waterfall, bringing clarity, renewal, and fresh opportunities.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '紀伊国 熊野那智大社',
      deityInscription: '熊野那智大社 印',
      vermilionSealShape: 'circle',
      quote: '那智の霊滝天より注ぎ、熊野の神風に魂蘇る。'
    },
    audioTrackTitle: 'Roaring Waters of Nachi'
  },
  {
    id: 'naminoue-gu',
    name: 'Naminoue-gū',
    kanjiName: '波上宮',
    romanizedName: 'Naminoue-gū',
    type: 'shrine',
    region: 'Kyushu',
    prefecture: 'Okinawa (Naha)',
    mapCoords: { x: 13.8, y: 83.5 },
    establishedYear: 'Ryukyu Kingdom Era (Ancient)',
    enshrinedDeityOrBuddha: 'Izanami no Mikoto & Nirai Kanai Oceanic Kami',
    primaryBlessing: 'Maritime Safety, Safe Flights, Healthy Families & Good Fortune',
    tagline: 'The Sacred Cliff Sanctuary Overlooking the Turquoise Coral Sea',
    description: 'The highest-ranking "First Shrine" (Ichinomiya) of the Ryukyu Kingdom, perched majestically atop a coral limestone cliff overlooking the East China Sea in Naha, Okinawa. Celebrated for its unique Ryukyuan red clay tile roofs (Arakawarabuki) and stunning turquoise ocean vistas where islanders prayed to the mythical paradise over the horizon, Nirai Kanai.',
    features: [
      'Coral Cliff-top Sanctuary Overlooking Turquoise Sea',
      'Traditional Okinawan Red Tile Eaves (Ryukyu Kawara)',
      'Okinawan Shisa Lion Guardian Statues',
      'Panoramic Ocean Breeze & Coral Beach View',
      'Sacred Nirai Kanai Worship Platform'
    ],
    architectureStyle: 'itsukushima_floating',
    spots: [
      {
        id: 'spot-torii',
        name: 'Torii of the Rising Waves',
        japaneseName: '一の鳥居・崖上参道',
        position: [0, 0, 28],
        cameraTarget: [0, 3.5, 18],
        description: 'Walk past the torii standing proudly on the ocean bluff with warm sea breezes and turquoise waves sparkling below.',
        type: 'torii'
      },
      {
        id: 'spot-temizuya',
        name: 'Shisa Dragon Fountain Temizuya',
        japaneseName: '手水舎',
        position: [-10, 0, 15],
        cameraTarget: [-10, 1.2, 15],
        description: 'Cleanse hands with pure spring water poured from a stone dragon spout flanked by protective Ryukyu Shisa statues.',
        type: 'temizuya'
      },
      {
        id: 'spot-haiden',
        name: 'Red-Tiled Haiden Sanctuary',
        japaneseName: '本殿・拝殿',
        position: [0, 0, -15],
        cameraTarget: [0, 3.2, -22],
        description: 'Offer prayers at the red-tiled haiden sanctuary, seeking protection for maritime voyages, air travels, and household peace.',
        type: 'haiden'
      },
      {
        id: 'spot-ema',
        name: 'Tropical Bingata & Shisa Ema Rack',
        japaneseName: '波上宮絵馬掛所',
        position: [12, 0, -12],
        cameraTarget: [12, 1.8, -12],
        description: 'Write your hopes on a colorful ema adorned with Ryukyuan motifs and guardian Shisa lions.',
        type: 'ema'
      },
      {
        id: 'spot-omikuji',
        name: 'Coral Sea Breeze Fortunes',
        japaneseName: '波上宮おみくじ',
        position: [-12, 0, -12],
        cameraTarget: [-12, 1.8, -12],
        description: 'Draw an oracle bearing blessings of health, warm relationships, and clear horizons.',
        type: 'omikuji'
      }
    ],
    goshuinStamp: {
      templeSealName: '琉球国 官幣小社 波上宮',
      deityInscription: '波上宮 神璽',
      vermilionSealShape: 'square',
      quote: '珊瑚の海を臨む断崖に鎮まり、ニライカナイの恵み島々に満ちる。'
    },
    audioTrackTitle: 'Coral Waves of Ryukyu'
  }
];

export const SAMPLE_FORTUNES: OmikujiFortune[] = [
  {
    id: 'f-1',
    number: 1,
    rank: 'Dai-kichi (大吉 - Great Blessing)',
    poem: 'As cherry blossoms greet the morning sun, long-held endeavors bloom in radiant harmony.',
    generalMeaning: 'Supreme fortune shines upon you. Sincerity and humble diligence will open pathways previously unseen.',
    wishes: 'Will come true smoothly and beyond expectations.',
    health: 'Vibrant vitality; maintain balanced rest and fresh air.',
    relationships: 'Warm affections deepen; a fateful encounter brings lasting joy.',
    studiesWork: 'Exceptional breakthroughs; examinations and creative works will prosper.',
    travel: 'A wonderful journey awaits; traveling east or south brings inspiration.',
    luckyColor: 'Vermilion Red & Gold',
    luckyDirection: 'East-Southeast',
    shrineId: 'fushimi-inari',
    shrineName: 'Fushimi Inari Taisha',
    date: '2026-10-20'
  },
  {
    id: 'f-2',
    number: 7,
    rank: 'Chū-kichi (中吉 - Middle Blessing)',
    poem: 'The mountain stream flows quietly through rocks, finding its way to the ocean without hurry.',
    generalMeaning: 'Steady progress brings the greatest rewards. Trust in gradual cultivation rather than impulsive rush.',
    wishes: 'Attainable with persistent effort and patience.',
    health: 'Guard against fatigue; nourish body with warm tea and mindfulness.',
    relationships: 'Cherish mutual trust and honest conversation.',
    studiesWork: 'Consistent daily revision yields profound mastery.',
    travel: 'Pleasant and safe; mountain trails bring serene peace.',
    luckyColor: 'Forest Green & Bamboo Yellow',
    luckyDirection: 'North',
    shrineId: 'meiji-jingu',
    shrineName: 'Meiji Jingu',
    date: '2026-10-20'
  },
  {
    id: 'f-3',
    number: 14,
    rank: 'Shō-kichi (小吉 - Modest Blessing)',
    poem: 'Gentle breeze carries the scent of incense through ancient cedar halls, clearing lingering mist.',
    generalMeaning: 'A tranquil period of renewal. Small acts of kindness illuminate your surrounding path.',
    wishes: 'Will be granted in modest ways; be grateful for small victories.',
    health: 'Good recovery; stretch and hydrate frequently.',
    relationships: 'Harmony with old friends; mutual support provides strength.',
    studiesWork: 'Focus on fundamentals; clarity will emerge through focus.',
    travel: 'Short day trips to historic or water sites will refresh spirit.',
    luckyColor: 'Indigo Blue & Pure White',
    luckyDirection: 'West',
    shrineId: 'senso-ji',
    shrineName: 'Sensō-ji Temple',
    date: '2026-10-20'
  },
  {
    id: 'f-4',
    number: 22,
    rank: 'Kichi (吉 - Blessing)',
    poem: 'The tidal waters rise faithfully with the moon, lifting the floating gate above the sparkling waves.',
    generalMeaning: 'Circumstances are shifting in your favor. Ride the rising tide with clear purpose and confidence.',
    wishes: 'Patience will be rewarded as favorable timing aligns.',
    health: 'Sound constitution; ocean air or walking near water brings rejuvenation.',
    relationships: 'Open communication softens past misunderstandings.',
    studiesWork: 'New opportunities to showcase talents; take bold initiatives.',
    travel: 'Favorable; seaside voyages bring good fortune.',
    luckyColor: 'Turquoise & Sunset Amber',
    luckyDirection: 'Southwest',
    shrineId: 'itsukushima',
    shrineName: 'Itsukushima Shrine',
    date: '2026-10-20'
  },
  {
    id: 'f-5',
    number: 33,
    rank: 'Sue-kichi (末吉 - Future Blessing)',
    poem: 'Seeds buried deep in fertile mountain soil rest quietly beneath winter snow, awaiting spring light.',
    generalMeaning: 'Now is the time for planting foundations and reflection. Your future harvest will be bountiful.',
    wishes: 'Requires gestation; do not abandon hope too soon.',
    health: 'Get ample sleep and avoid overexertion.',
    relationships: 'Listen attentively to companions; silent empathy builds deep bonds.',
    studiesWork: 'Lay the groundwork; quiet research will bear fruit in upcoming seasons.',
    travel: 'Postpone distant journeys; focus on your home sanctuary.',
    luckyColor: 'Earthy Ochre & Slate Grey',
    luckyDirection: 'Northeast',
    shrineId: 'koyasan',
    shrineName: 'Kōyasan Danjo Garan',
    date: '2026-10-20'
  }
];

export const INITIAL_EMA_SAMPLES: EmaVotive[] = [
  {
    id: 'ema-1',
    shrineId: 'fushimi-inari',
    shrineName: 'Fushimi Inari Taisha',
    authorName: 'Kenji & Aoi',
    wishCategory: 'success',
    wishText: 'May our new bakery in Kyoto bring smiles, warm bread, and happiness to all our neighborhood neighbors!',
    illustration: 'kitsune',
    date: 'Autumn 2026',
    positionIndex: 0
  },
  {
    id: 'ema-2',
    shrineId: 'itsukushima',
    shrineName: 'Itsukushima Shrine',
    authorName: 'Elena V.',
    wishCategory: 'travel',
    wishText: 'For safe journeys across oceans and that my family stays healthy and close in heart always.',
    illustration: 'torii',
    date: 'Autumn 2026',
    positionIndex: 1
  },
  {
    id: 'ema-3',
    shrineId: 'meiji-jingu',
    shrineName: 'Meiji Jingu',
    authorName: 'Ren & Yuko',
    wishCategory: 'love',
    wishText: 'May our marriage be as enduring and peaceful as the sacred twin camphor trees of Meiji Jingu.',
    illustration: 'cherry_blossom',
    date: 'Autumn 2026',
    positionIndex: 2
  },
  {
    id: 'ema-4',
    shrineId: 'senso-ji',
    shrineName: 'Sensō-ji Temple',
    authorName: 'Grandmother Haru',
    wishCategory: 'health',
    wishText: 'Praying for my granddaughter Saki’s university entrance examinations and good health for everyone.',
    illustration: 'lotus',
    date: 'Autumn 2026',
    positionIndex: 3
  },
  {
    id: 'ema-5',
    shrineId: 'koyasan',
    shrineName: 'Kōyasan Danjo Garan',
    authorName: 'Marcus T.',
    wishCategory: 'peace',
    wishText: 'May all beings find stillness of heart, freedom from anxiety, and compassion for one another.',
    illustration: 'dragon',
    date: 'Autumn 2026',
    positionIndex: 4
  }
];
