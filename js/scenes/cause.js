// cause：大雨が降り続き、町の道に水があふれて洪水になる（例文 Heavy rain caused a flood in the town.）
import { seg, lerp, easeInOut, easeOut, smooth, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { rain } from './work-on.js';
import { held, reach } from './dig.js';

export function umbrellaProp(k, col, dark, parent) {
  const g = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: 0, y2: -62, stroke: k.pal.ink, 'stroke-width': 3 }, g);
  k.el('path', { d: 'M -40 -58 Q 0 -98 40 -58 Q 30 -64 20 -58 Q 10 -64 0 -58 Q -10 -64 -20 -58 Q -30 -64 -40 -58 Z', fill: col, stroke: dark, 'stroke-width': 2 }, g);
  k.el('path', { d: 'M 0 0 Q 0 8 -6 8', stroke: k.pal.ink, 'stroke-width': 3, fill: 'none' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '大雨'], [1.6, '水が増える'], [3.3, '町が洪水に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#8C97A8', opacity: 0 });
  // 町並み
  [[150, 120, 70, '#F3E6DC', pal.coral], [230, 100, 64, '#E4EEF7', pal.blueDark], [305, 130, 80, '#E6F1E8', pal.green]].forEach(([x, h, w, c, roof]) => {
    el('path', { d: `M ${x - 6} ${FY - h} L ${x + w / 2} ${FY - h - 30} L ${x + w + 6} ${FY - h} Z`, fill: roof });
    el('rect', { x, y: FY - h, width: w, height: h, fill: c });
    el('rect', { x: x + 10, y: FY - h + 16, width: 20, height: 18, rx: 2, fill: '#DDEFFA' });
    el('rect', { x: x + w - 30, y: FY - h + 16, width: 20, height: 18, rx: 2, fill: '#DDEFFA' });
    el('rect', { x: x + w / 2 - 10, y: FY - 36, width: 20, height: 36, rx: 2, fill: pal.woodDark });
  });
  // 雲
  const clouds = g({});
  [[60, 40, 44], [140, 30, 54], [240, 38, 60], [340, 30, 50]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.5, fill: '#7D8798' }, clouds));
  // 高台の家の玄関（まめが立つ）
  el('rect', { x: 0, y: FY - 54, width: 120, height: 54 + 64, fill: '#C9CFD8' });
  el('rect', { x: 0, y: FY - 58, width: 124, height: 6, rx: 2, fill: '#AEB6C2' });
  el('rect', { x: 0, y: 40, width: 30, height: FY - 98, fill: '#F3E6DC' });
  const S = 0.85;
  const me = k.buddy({ x: 70, y: FY - 54, scale: S });
  const um = umbrellaProp(k, pal.yellow, pal.yellowDark);
  const drops = rain(k, 46, FY + 30, 0, 420);
  // 水
  const water = g({});
  const wv = el('path', { fill: '#7FB7DE', opacity: 0.88 }, water);
  const ripple = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 2, opacity: 0.6 }, water);
  return {
    update(t) {
      const heavy = smooth(seg(t, 0, 1.2));
      sky.setAttribute('opacity', 0.25 + 0.35 * heavy);
      tf(clouds, 0, -40 * (1 - easeOut(seg(t, 0, 0.8))));
      drops(t, 0.4 + 0.6 * heavy);
      // 水位：道 → 家の戸口まで
      const lv = lerp(FY + 70, FY - 36, easeInOut(seg(t, 0.9, 3.6)));
      let d = `M 120 ${lv}`, r = `M 124 ${lv + 6}`;
      for (let x = 120; x <= 400; x += 10) { const y = lv + Math.sin(x * 0.08 + t * 4) * 2.2; d += ` L ${x} ${y.toFixed(1)}`; if (x % 40 === 0) r += ` M ${x} ${(y + 8).toFixed(1)} q 8 -3 16 0`; }
      wv.setAttribute('d', d + ' L 400 300 L 120 300 Z');
      ripple.setAttribute('d', r);
      const scare = seg(t, 2.6, 3.0);
      P(me, { x: 70 - 8 * easeOut(scare), y: FY - 54, armR: 150, armL: 8 + 30 * scare, lean: -6 * scare, look: 0.8, mood: scare > 0 ? 'open' : 'flat', blink: blinkAt(t) });
      const h = held(k, me, S, um, 'R', 180); tf(um, h.x, h.y + 4, 0, 1.15);
    }
  };
}
