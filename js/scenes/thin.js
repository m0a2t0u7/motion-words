import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
// 手先が(tx,ty)を向く腕の角度（シーン内だけで使う）
const aim = (x, y, f, s, tx, ty) => (Math.atan2((tx - (x + 27 * f * s)) * f, ty - (y - 56 * s)) * 180) / Math.PI;
// thin：壁が薄くて隣の声が聞こえる（例文 The wall is so thin that I can hear the neighbors.）
export const meta = { duration: 4.0, beats: [[0, '薄い壁'], [1.2, '隣が話す'], [2.6, '声が聞こえる']] };
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 196, y: 0, width: 8, height: FY, fill: '#C9BFB0' });
  el('rect', { x: 204, y: 0, width: 196, height: FY, fill: '#F4EDE2' });
  el('path', { d: 'M 180 40 H 220 M 180 40 l6 -5 M 180 40 l6 5 M 220 40 l-6 -5 M 220 40 l-6 5', stroke: pal.coralDark, 'stroke-width': 2, fill: 'none' });
  el('line', { x1: 200, y1: 50, x2: 200, y2: 80, stroke: pal.coralDark, 'stroke-width': 2, 'stroke-dasharray': '3 3' });
  const me = k.buddy({ x: 120, y: FY, scale: 1, facing: 1 });
  const nb = k.buddy({ x: 300, y: FY, scale: 1, facing: -1, color: pal.coral, dark: pal.coralDark });
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 -14 Q 8 0 0 14', stroke: pal.blueDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const talk = seg(t, 1.0, 3.4), hear = easeOut(seg(t, 1.6, 2.4));
      P(nb, { x: 300, armL: 8 + 20 * Math.max(0, Math.sin(t * 7)) * talk, mood: talk > 0 && talk < 1 ? (Math.sin(t * 12) > 0 ? 'open' : 'smile') : 'smile', blink: blinkAt(t, 1), look: -0.4 });
      P(me, { x: 120 + 22 * hear, armR: lerp(8, 150, hear), lean: 10 * hear, look: 0.6, mood: hear > 0.5 ? 'open' : 'smile', blink: blinkAt(t) });
      waves.forEach((w, i) => {
        const p = ((t * 0.9 - i * 0.28) % 1 + 1) % 1, on = talk > 0 && talk < 1;
        tf(w, lerp(268, 150, p), 178, 180, 0.8 + p * 0.6, 0.8 + p * 0.6); w.setAttribute('opacity', on ? Math.sin(p * Math.PI) * 0.9 : 0);
      });
    }
  };
}
