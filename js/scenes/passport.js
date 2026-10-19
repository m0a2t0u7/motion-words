// passport：スーツケースを持って出かけるまめに、家の人がパスポートを差し出す。まめは受け取ってほっとする（例文 Don't forget your passport.）
import { seg, lerp, easeInOut } from '../ease.js';
import { hp, reach, homeBg } from './bag.js';
import { give } from './charger.js';
import { trolley } from './luggage.js';

export function passportProp(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -10, y: 0, width: 20, height: 27, rx: 2, fill: '#2F4C7A' }, g);
  el('circle', { cx: 0, cy: 11, r: 5, fill: 'none', stroke: pal.yellow, 'stroke-width': 1.6 }, g);
  el('line', { x1: -5, y1: 21, x2: 5, y2: 21, stroke: pal.yellow, 'stroke-width': 1.4 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '旅行に出発'], [0.8, '忘れてるよ！'], [2.4, 'パスポートを持った']] };

export function create(k) {
  const { tf, pal } = k, S = 1.1, FY = 236;
  homeBg(k, { FY, winX: 280, winW: 80 });
  const tr = trolley(k); 
  const pp = passportProp(k);
  const up = give(k, {
    S, FY, bx: 150, cx: 280, item: pp, g0: 1.0, g1: 1.8, cRest: 70, bRest: 70, bubX: 280, bubbleW: 64,
    ask: (g) => { k.tf(passportProp(k, g), -12, -13); k.text(13, 0, '!', { 'font-size': 22, fill: pal.coralDark }, g); },
    bub0: 0.5,
    preB: (t, c) => { c.b.pose({ armL: reach(c.b, S, 'L', 104, FY - 74), mood: t > 0.6 && t < 1.8 ? 'open' : c.b.state.mood }); tf(tr, 104, FY - 74); },
    dy: -2
  });
  return { update: up };
}
