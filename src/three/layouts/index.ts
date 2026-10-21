import type { Layout } from './types';
import { fushimiInari } from './fushimiInari';
import { itsukushima } from './itsukushima';
import { meijiJingu } from './meijiJingu';
import { sensoji } from './sensoji';
import { kinkakuji } from './kinkakuji';
import { koyasan } from './koyasan';
import { kiyomizudera } from './kiyomizudera';
import { nikkoToshogu } from './nikkoToshogu';
import { iseJingu } from './iseJingu';
import { izumoTaisha } from './izumoTaisha';
import { todaiji } from './todaiji';
import { dazaifuTenmangu } from './dazaifuTenmangu';
import { hokkaidoJingu } from './hokkaidoJingu';
import { kotohiraGu } from './kotohiraGu';
import { kamakuraDaibutsu } from './kamakuraDaibutsu';
import { zenkoji } from './zenkoji';
import { chusonji } from './chusonji';
import { atsutaJingu } from './atsutaJingu';
import { kumanoNachi } from './kumanoNachi';
import { naminoue } from './naminoue';

/** One hand-built layout per shrine, keyed by shrine id */
export const LAYOUTS: Record<string, Layout> = {
  'fushimi-inari': fushimiInari,
  itsukushima,
  'meiji-jingu': meijiJingu,
  'senso-ji': sensoji,
  'kinkaku-ji': kinkakuji,
  koyasan,
  'kiyomizu-dera': kiyomizudera,
  'nikko-tosho-gu': nikkoToshogu,
  'ise-jingu': iseJingu,
  'izumo-taisha': izumoTaisha,
  'todai-ji': todaiji,
  'dazaifu-tenmangu': dazaifuTenmangu,
  'hokkaido-jingu': hokkaidoJingu,
  'kotohira-gu': kotohiraGu,
  'kamakura-daibutsu': kamakuraDaibutsu,
  'zenko-ji': zenkoji,
  'chuson-ji': chusonji,
  'atsuta-jingu': atsutaJingu,
  'kumano-nachi-taisha': kumanoNachi,
  'naminoue-gu': naminoue,
};
