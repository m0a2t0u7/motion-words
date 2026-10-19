// fitness：プールでまめがクロールで泳ぎ続け、体力メーターが上がり、泳ぎ切って腕を上げる（例文 Swimming is a great way to improve your fitness.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { lie } from './surgery.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '泳ぐ'], [1.5, '体力がつく'], [3.3, '体力アップ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 140, fill: '#EAF2F7' });
  for (let x = 0; x < 400; x += 40) el('rect', { x, y: 128, width: 38, height: 10, fill: '#D6E4EE' });
  const WY = 168;
  el('rect', { x: 0, y: WY, width: 400, height: 132, fill: '#6EC3E8' });
  el('rect', { x: 372, y: 140, width: 28, height: 160, fill: '#D6E4EE' });
  const P = lie(k, { scale: 0.9 });
  const water = el('rect', { x: 0, y: WY + 4, width: 400, height: 128, fill: '#8FD3F4', opacity: 0.72 });
  const waves = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: 0.8 });
  for (let x = 10; x < 370; x += 30) el('circle', { cx: x, cy: WY + 44, r: 3.5, fill: (x / 30) % 2 ? pal.red : '#fff' });
  const splash = [0, 1, 2].map(() => el('circle', { r: 3, fill: '#fff' }));
  // 体力メーター
  const mg = g({}); tf(mg, 56, 40);
  heart(k, mg, pal.red).setAttribute('transform', 'translate(-30 0) scale(1.6)');
  el('rect', { x: -12, y: -9, width: 80, height: 18, rx: 9, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, mg);
  const bar = el('rect', { x: -9, y: -6, width: 10, height: 12, rx: 6, fill: pal.green }, mg);
  const xf = (t) => lerp(40, 330, easeInOut(seg(t, 0, 3.2)));
  return {
    update(t) {
      const x = xf(t), up = easeInOut(seg(t, 3.2, 3.7));
      P.set(x, WY + 6 - 20 * up, lerp(90, 0, up));
      const ph = t * 7;
      P.b.pose({ armR: up ? lerp((ph * 57.3) % 360, 160, up) : (ph * 57.3) % 360, armL: up ? 10 : (ph * 57.3 + 180) % 360, mood: up > 0.5 ? 'grin' : 'flat', blink: up > 0.5 ? 0 : 1, look: 0, walk: up ? 0 : Math.sin(t * 14) * 0.5 });
      let d = `M 0 ${WY + 4}`;
      for (let i = 0; i <= 40; i++) d += ` L ${i * 10} ${WY + 4 + 2 * Math.sin(i * 0.9 + t * 4)}`;
      k.set(waves, { d });
      splash.forEach((s, i) => { const q = (t * 3 + i / 3) % 1; k.set(s, { cx: x - 70 + i * 10, cy: WY - 10 * hump(q), opacity: up ? 0 : 1 - q }); });
      k.set(bar, { width: 10 + 64 * easeOut(seg(t, 0.4, 3.6)) });
    }
  };
}
