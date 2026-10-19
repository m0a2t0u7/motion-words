// skin：女の人がほおを手でそっとさわると、ふわっとやわらかくへこむ。すべすべの肌（例文 She has very soft skin.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, bp, faceOf, twinkle, pop } from './body.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.2, beats: [[0, 'ほおにふれる'], [1.2, 'ふわふわ'], [2.6, 'やわらかい肌']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.6, FY = 250;
  homeBg(k, { FY, winX: 280, curtain: '#F7D3E0' });
  // 鏡台の上のクリーム
  el('rect', { x: 20, y: FY - 70, width: 100, height: 8, rx: 3, fill: pal.wood }); el('rect', { x: 26, y: FY - 62, width: 88, height: 62, fill: '#EAD3B0' });
  el('rect', { x: 50, y: FY - 92, width: 24, height: 22, rx: 5, fill: '#F7D3E0' }); el('rect', { x: 48, y: FY - 98, width: 28, height: 8, rx: 3, fill: '#E6A2BA' });
  const b = k.buddy({ x: 200, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  // ほっぺ（押すとへこむ）
  const cheek = el('ellipse', { cx: 18, cy: -44, rx: 7, ry: 5.5, fill: '#FFB3A6' }, faceOf(b));
  const sp = [0, 1, 2, 3].map(() => twinkle(k, null, '#fff'));
  return {
    update(t) {
      const reachP = easeInOut(seg(t, 0.4, 1.0));
      const press = t > 1.0 && t < 2.6 ? hump(((t - 1.0) / 0.55) % 1) : 0;
      const away = easeInOut(seg(t, 2.6, 3.0));
      P(b, { look: 0.2, mood: t > 1.2 ? 'grin' : 'smile', blink: t > 1.1 && t < 2.6 ? 0.85 : blinkAt(t), squash: 1 - 0.01 * press });
      const c = bp(b, S, 26, -44);
      const tg = { x: lerp(b.state.x + 50, c.x + 6 - 4 * press, reachP * (1 - away)), y: lerp(FY - 30, c.y, reachP * (1 - away)) };
      b.pose({ armR: reach(b, S, 'R', tg.x, tg.y) });
      cheek.setAttribute('rx', (7 - 2 * press).toFixed(2)); cheek.setAttribute('ry', (5.5 + 1.2 * press).toFixed(2));
      cheek.setAttribute('cx', (18 - 1.5 * press).toFixed(2));
      sp.forEach((s, i) => { const q = seg(t, 2.6 + i * 0.15, 4.2); const p = bp(b, S, [-20, 26, -26, 22][i], [-70, -64, -30, -24][i]); tf(s, p.x, p.y, 45 * q, pop(easeOut(seg(q, 0, 0.3)) * (0.6 + 0.4 * Math.sin(t * 9 + i)))); });
    }
  };
}
