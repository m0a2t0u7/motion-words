// bite：犬が地面の棒に近づいて口を開け、がぶっとかみついてくわえる（例文 The dog bit the stick.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { makeDog } from './bury.js';

export const meta = { duration: 4.4, beats: [[0, '棒に近づく'], [1.4, '口を開ける'], [2.1, 'かみついた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 200, mood: 'outdoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#CDEBCF' });
  el('rect', { x: 0, y: 200, width: 400, height: 3, fill: '#B5DDB9' });
  for (let i = 0; i < 9; i++) el('rect', { x: 8 + i * 46, y: 150, width: 14, height: 50, rx: 4, fill: '#F6EBDD' });
  el('rect', { x: 0, y: 164, width: 400, height: 7, fill: '#EBDCC8' }); el('rect', { x: 0, y: 184, width: 400, height: 7, fill: '#EBDCC8' });
  const GY = 254;
  // 棒
  const stick0 = g({}); const stick = g({}, stick0); tf(stick, 30, 0);
  k.shadow(0, 8, 40, 4, stick);
  el('rect', { x: -44, y: -3.5, width: 88, height: 7, rx: 3.5, fill: '#9A6B3E' }, stick);
  el('path', { d: 'M 8 -3 L 22 -16 M 20 -3 L 30 -9', stroke: '#9A6B3E', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, stick);
  const marks = g({}, stick);
  [[-4, 0], [4, 0]].forEach(([x]) => el('circle', { cx: x, cy: -1, r: 1.6, fill: '#5A3E28' }, marks));
  const dog = makeDog(k, g({}), 1.3);
  dog.pose({ x: 184, y: GY - 2, bow: 10, headRot: 55, jaw: 0 });
  const M0 = dog.mouth();
  const sp = [0, 1, 2].map(() => k.text(0, 0, '!', { 'font-size': 18, fill: pal.red }));
  return {
    update(t) {
      const walk = easeInOut(seg(t, 0.1, 1.3));
      const X = (tt) => lerp(-30, 184, easeInOut(seg(tt, 0.1, 1.3)));
      const x = X(t), mv = Math.abs(X(t + 0.02) - X(t - 0.02)) / 0.04, wm = Math.min(1, mv / 30), wk = Math.sin(x * 0.1) * 24 * wm;
      const open = easeOut(seg(t, 1.3, 1.7)), snap = easeIn(seg(t, 1.85, 2.0));
      const jaw = 30 * open * (1 - snap);
      const shake = t > 2.1 && t < 3.6 ? Math.sin((t - 2.1) * 20) * (1 - seg(t, 3.0, 3.6)) : 0;
      const lower = easeInOut(seg(t, 1.2, 1.8)) * (1 - easeInOut(seg(t, 2.4, 3.0)));
      dog.pose({ x, y: GY - 2, bow: 10 * lower, headRot: lerp(4, 55, lower) + 7 * shake, jaw, f1: wk, f2: -wk, h1: -wk, h2: wk, tail: 20 * Math.sin(t * 18) * (t > 1.9 ? 1 : 0.2) });
      const m = dog.mouth();
      const held = t >= 1.95;
      const rot = lerp(-4, -28, easeOut(seg(t, 1.95, 2.4)));
      tf(stick0, held ? m.x + 2 : M0.x + 2, held ? m.y + 2 - 4 * shake : M0.y + 2, rot + 7 * shake);
      marks.setAttribute('opacity', held ? 1 : 0);
      sp.forEach((s, i) => { const p = seg(t, 1.95 + i * 0.05, 2.5 + i * 0.05); tf(s, m.x - 26 + i * 22, m.y - 44 - 12 * easeOut(p) + (i % 2) * 8, (i - 1) * 18, p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0); });
    }
  };
}
