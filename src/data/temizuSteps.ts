/**
 * The steps of temizu (手水), the purification before praying.
 *
 * At a stone basin (chōzubachi) the order is fixed and one scoop of water lasts the whole ritual.
 * At Ise Jingū's Mitarashi you go down the stone steps and purify your hands in the Isuzu River itself.
 */
export interface TemizuStepText {
  id: string;
  jp: string;
  title: string;
  how: string;
  /** label on the hold button */
  verb: string;
  /** seconds of holding needed */
  hold: number;
}

export const BASIN_STEPS: TemizuStepText[] = [
  { id: 'scoop', jp: '柄杓を取る', title: 'Scoop the water', how: 'Take the ladle (hishaku) in your right hand and scoop fresh water from the basin. One scoop lasts the whole ritual, so take it gently.', verb: 'Hold to scoop', hold: 1.2 },
  { id: 'left', jp: '左手を清める', title: 'Rinse your left hand', how: 'Tip a little water over your left hand. Not too much: you will need the rest.', verb: 'Hold to pour', hold: 1.4 },
  { id: 'right', jp: '右手を清める', title: 'Rinse your right hand', how: 'Move the ladle to your left hand, then pour over your right hand.', verb: 'Hold to pour', hold: 1.4 },
  { id: 'palm', jp: '左手に水を受ける', title: 'Water in your left palm', how: 'Back to your right hand. Cup your left palm and pour a little water into it. Never drink straight from the ladle.', verb: 'Hold to pour', hold: 1.2 },
  { id: 'mouth', jp: '口をすすぐ', title: 'Rinse your mouth', how: 'Bring your palm to your lips and rinse your mouth quietly. Cover it with your other hand and let the water fall to the ground, never back into the basin.', verb: 'Hold to rinse', hold: 1.6 },
  { id: 'left2', jp: 'もう一度左手を', title: 'Rinse your left hand again', how: 'Your lips touched that hand, so rinse it once more.', verb: 'Hold to pour', hold: 1.2 },
  { id: 'handle', jp: '柄杓を清める', title: 'Wash the handle', how: 'Stand the ladle upright so the last of the water runs down the handle and cleans it for the next person. Then put it back, face down.', verb: 'Hold to tilt', hold: 1.6 },
];

export const RIVER_STEPS: TemizuStepText[] = [
  { id: 'crouch', jp: '御手洗場', title: 'Kneel at the Isuzu', how: 'At Ise there is no ladle. Go down the Mitarashi stone steps and crouch at the edge of the Isuzu River, which has purified pilgrims for centuries.', verb: 'Hold to kneel', hold: 1.2 },
  { id: 'hands', jp: '手を清める', title: 'Purify your hands in the river', how: 'Dip both hands into the clear, cold water and let the current wash them.', verb: 'Hold to wash', hold: 2.0 },
  { id: 'rise', jp: '心を清める', title: 'Rise with a clear heart', how: 'Shake the water from your fingers, stand, and take a slow breath before you walk on to the sanctuary.', verb: 'Hold to rise', hold: 1.2 },
];
