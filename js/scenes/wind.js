// wind：強い風の中、帽子を手で押さえ、前かがみで踏んばって進む。木もしなる（例文 The wind is strong today.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, treeG, gait, P, blinkAt } from './nature.js';
import { hat } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '風が吹く'], [1.0, '帽子を押さえる'], [2.6, '強い風']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 238, top: '#BFD9EE', bot: '#EEF5FA' });
  hills(k, FY);
  const tr = treeG(k, 1.15); tf(tr.g, 90, FY + 2);
  const b = k.buddy({ x: 250, y: FY, scale: S, facing: -1 });
  hat(k, b, pal.yellow, pal.yellowDark);
  const lines = [0, 1, 2, 3, 4, 5, 6].map((i) => el('path', { d: 'M 0 0 h 46 q 12 0 12 -8 q 0 -7 -7 -7', stroke: '#fff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }));
  const leaves = [0, 1, 2, 3].map(() => el('path', { d: 'M -6 0 Q 0 -6 6 0 Q 0 6 -6 0 Z', fill: '#6BBF84' }));
  const xf = (t) => lerp(250, 205, easeInOut(seg(t, 0.8, 4.0)));
  return {
    update(t) {
      const gust = 0.7 + 0.3 * Math.sin(t * 3.1) * Math.sin(t * 1.7 + 1), on = easeOut(seg(t, 0, 0.8));
      const W = on * gust;
      const w = gait(xf, t, 250, 6, 0.25);
      const hold = easeOut(seg(t, 0.6, 1.1));
      P(b, { x: w.x, facing: -1, walk: w.walk, lean: 18 * W + 4, armR: lerp(8, 172, hold), armL: lerp(8, -20, on) + 6 * Math.sin(t * 9), squash: 0.97, mood: 'flat', blink: Math.max(blinkAt(t), 0.6 * W), look: -0.4 });
      // 木：幹ごと風下（右）へしなる
      tf(tr.trunk, 0, 0, 16 * W + 3 * Math.sin(t * 9));
      tf(tr.crown, 0, -69, 4 * W);
      lines.forEach((l, i) => {
        const sp = 240 + (i * 53) % 90, x = ((t * sp + i * 97) % 520) - 80, y = 50 + ((i * 41) % 170);
        tf(l, x, y); l.setAttribute('opacity', (0.85 * on * hump(clamp((x + 80) / 520))).toFixed(2));
      });
      leaves.forEach((l, i) => {
        const p = ((t * 0.5 + i * 0.27) % 1), x = lerp(100, 440, p), y = 120 + 60 * Math.sin(p * 6 + i) - 30 * p + i * 12;
        tf(l, x, y, p * 900 + i * 40); l.setAttribute('opacity', on);
      });
    }
  };
}
