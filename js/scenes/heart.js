// heart：発表の順番を待っていると、胸の心臓がドキドキと速く打つ（例文 My heart was beating fast.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp } from './body.js';
import { drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '出番を待つ'], [1.2, 'ドキドキ'], [2.6, 'どんどん速く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.4, FY = 246;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#3A2F4A' });
  el('rect', { x: 0, y: 0, width: 70, height: FY, fill: '#C9504A' }); el('rect', { x: 330, y: 0, width: 70, height: FY, fill: '#C9504A' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#B98A5B' });
  el('path', { d: `M 140 0 L 260 0 L 300 ${FY} L 100 ${FY} Z`, fill: '#FFF6D8', opacity: 0.18 });
  // マイクスタンド（動かない）
  el('rect', { x: 268, y: 150, width: 4, height: FY - 150, fill: pal.sub }); el('rect', { x: 254, y: FY - 4, width: 32, height: 4, rx: 2, fill: pal.sub });
  el('rect', { x: 264, y: 136, width: 12, height: 18, rx: 6, fill: pal.ink });
  const b = k.buddy({ x: 190, y: FY, scale: S });
  const hrt = el('path', { d: 'M 0 6 C -12 -4 -8 -12 0 -6 C 8 -12 12 -4 0 6 Z', fill: pal.red });
  const waves = [0, 1].map(() => el('path', { d: 'M -14 -10 Q -20 0 -14 10 M 14 -10 Q 20 0 14 10', stroke: pal.red, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }));
  const sw = drop(k);
  return {
    update(t) {
      // 鼓動：だんだん速くなる位相（t² で加速）
      const ph = 4 * t + 1.6 * t * t, beat = Math.pow(Math.max(0, Math.sin(ph)), 8);
      const press = easeInOut(seg(t, 1.6, 2.1));
      P(b, { squash: 1 + 0.02 * beat, mood: 'flat', blink: blinkAt(t), look: 0.3, lean: -2, armL: 10 });
      const ch = bp(b, S, 10, -26);
      b.pose({ armR: lerp(10, reach(b, S, 'R', ch.x + 16, ch.y + 6), press) });
      tf(hrt, ch.x, ch.y, 0, (1.4 + 0.7 * beat) * S * 0.8);
      waves.forEach((w, i) => { tf(w, ch.x, ch.y, 0, 1 + 0.6 * beat + i * 0.4); w.setAttribute('opacity', (beat * (1 - i * 0.4)).toFixed(2)); });
      const sp = bp(b, S, -26, -72);
      tf(sw, sp.x, sp.y + 22 * ((t * 0.7) % 1), 0, t > 2.2 ? 1 : 0.001);
    }
  };
}
