import type { Layout } from './types';
import { fushimiInari } from './fushimiInari';
import { itsukushima } from './itsukushima';
import { meijiJingu } from './meijiJingu';
import { sensoji } from './sensoji';
import { kinkakuji } from './kinkakuji';

/** One hand-built layout per shrine, keyed by shrine id */
export const LAYOUTS: Record<string, Layout> = {
  'fushimi-inari': fushimiInari,
  itsukushima,
  'meiji-jingu': meijiJingu,
  'senso-ji': sensoji,
  'kinkaku-ji': kinkakuji,
};
