// brother：私（小さいまめ）には兄がいる。背の高い兄と並ぶと、頭をなでてくれる（例文 I have an older brother.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, heartP, pops, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '私'], [1.2, '兄が来る'], [2.6, '背が高い兄']] };

export function create(k) {
  const { el, pal } = k;
  const FY = homeBg(k, { winX: 40, winW: 80 });
  // 身長を測る柱の目盛り
  el('rect', { x: 196, y: 70, width: 14, height: FY - 70, fill: '#EAD2B0' });
  for (let y = 80; y < FY; y += 14) el('line', { x1: 196, y1: y, x2: y % 28 ? 203 : 208, y2: y, stroke: pal.woodDark, 'stroke-width': 2 });
  const me = k.buddy({ x: 170, y: FY, scale: 0.75 });
  const bro = k.buddy({ x: 460, y: FY, scale: 1.3, facing: -1, ...C(k, 'blue') });
  const mk1 = el('rect', { x: 186, width: 32, height: 4, rx: 2, fill: pal.mintDark });
  const mk2 = el('rect', { x: 186, width: 32, height: 4, rx: 2, fill: pal.blueDark });
  const B = arms(k, bro, 1.3, { col: pal.blue, dark: pal.blueDark, back: ['L'] });
  const A = arms(k, me, 0.75, { back: ['L'] });
  const h = heartP(k);
  const xf = keys([[0, 460], [1.0, 460], [2.2, 250]]);
  return {
    update(t) {
      const g = gait(xf, t, 460);
      const pat = easeInOut(seg(t, 2.4, 2.8)), rub = t > 2.8 && t < 3.8 ? Math.sin((t - 2.8) * 14) * 5 : 0;
      P(me, { look: t > 1.2 ? 0.8 : 0, blink: t > 2.8 && t < 3.8 ? 1 : blinkAt(t), mood: t > 2.6 ? 'grin' : 'smile', lean: -6 * seg(t, 1.6, 2.2) });
      P(bro, { x: g.x, walk: g.walk, lean: g.lean + 6 * pat, look: 0.5, blink: blinkAt(t, 1), facing: -1, mood: 'smile' });
      const top = { x: 170 + 4, y: FY - 92 * 0.75 };
      B.to('L', lerp(g.x - 30, top.x + rub, pat), lerp(FY - 40, top.y - 4, pat));
      B.to('R', g.x - 20, FY - 40);
      A.to('R', 192, FY - 28); A.to('L', 152, FY - 28);
      const hb = FY - 92 * 0.75, hB = FY - 92 * 1.3;
      k.set(mk1, { y: hb - 2, opacity: seg(t, 0.3, 0.6) });
      k.set(mk2, { y: hB - 2, opacity: seg(t, 2.6, 3.0) });
      const q = seg(t, 3.2, 3.8); k.tf(h, 210, 100 - 14 * q, 0, pops(q));
    }
  };
}
