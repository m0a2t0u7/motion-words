// river：夏の川で、2人が水に入り、腕で水をかいて泳ぐ。しぶきが上がる（例文 We swam in the river.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, treeG, sunG, P, blinkAt } from './nature.js';

export const meta = { duration: 4.2, beats: [[0, '川の中'], [1.0, '水をかく'], [3.0, '川で泳いだ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  scene(k, { FY: 140, top: '#A9D6F5', bot: '#EEF8FD', ground: '#9ED69F', edge: '#8CCB8F' });
  const sun = sunG(k, 16); tf(sun.g, 340, 40);
  [[40, 0.9], [120, 1.0], [300, 0.8]].forEach(([x, s]) => tf(treeG(k, s).g, x, 142));
  el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#7CC8EE' });
  el('path', { d: 'M 0 150 Q 200 142 400 150 V 160 H 0 Z', fill: '#9ED69F' });
  const back = g({});
  const WY = 230;
  const a = k.buddy({ x: 140, y: WY + 50, scale: S, parent: back });
  const c = k.buddy({ x: 250, y: WY + 50, scale: S, color: pal.coral, dark: pal.coralDark, parent: back });
  // 水面（手前）：体の下半分を隠す
  const front = el('path', { d: '', fill: '#7CC8EE', opacity: 0.92 });
  const lines = [0, 1, 2].map(() => el('path', { d: '', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.6 }));
  const spl = [0, 1, 2, 3, 4, 5].map(() => el('circle', { r: 3, fill: '#E6F6FD' }));
  return {
    update(t) {
      const sw = easeOut(seg(t, 0.3, 0.9));
      const ph = t * 5;
      [[a, 140, 0], [c, 250, 1.4]].forEach(([b, x0, o]) => {
        const x = x0 + 30 * Math.sin(t * 0.8 + o) * sw;
        P(b, { x, y: WY + 40 + 3 * Math.sin(ph + o), lean: 30 * sw, armR: 90 + 80 * Math.sin(ph + o) * sw, armL: 90 - 80 * Math.sin(ph + o) * sw, look: 0.6, mood: t > 1.2 ? 'grin' : 'smile', blink: blinkAt(t, o) });
      });
      let d = `M 0 ${WY}`;
      for (let x = 0; x <= 400; x += 20) d += ` L ${x} ${(WY + 3 * Math.sin(x * 0.05 + t * 4)).toFixed(1)}`;
      front.setAttribute('d', d + ' L 400 300 L 0 300 Z');
      lines.forEach((l, i) => { const o = (t * 30 + i * 50) % 80; let s = ''; for (let x = -80 + o; x < 400; x += 80) s += `M ${x.toFixed(1)} ${WY + 20 + i * 18} q 10 -4 20 0 `; l.setAttribute('d', s); });
      spl.forEach((s, i) => { const b = i < 3 ? a : c, p = ((t * 1.6 + i * 0.33) % 1); tf(s, b.state.x + (i % 3 - 1) * 16 * p + 20, WY - 18 * hump(p), 0, sw * (1 - p) + 0.001); });
    }
  };
}
