// cool down：全力で走って熱くなったまめが、ゆっくり歩き、深呼吸して体を落ち着かせる（例文 Walk slowly to cool down after running.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '走って熱い'], [1.8, 'ゆっくり歩く'], [3.3, '深呼吸で落ち着く']] };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, p) => '#' + hex(a).map((v, i) => Math.round(v + (hex(b)[i] - v) * p).toString(16).padStart(2, '0')).join('');

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 236, width: 400, height: 8, fill: '#CFEBC8' });
  el('rect', { x: 0, y: 244, width: 400, height: 56, fill: '#E9DFD0' });
  [[60, 186], [150, 170], [330, 180]].forEach(([x, y], i) => {
    el('rect', { x: x - 4, y, width: 8, height: 236 - y, fill: pal.woodDark });
    el('circle', { cx: x, cy: y - 12, r: 28 + (i % 2) * 6, fill: pal.green });
    el('circle', { cx: x - 12, cy: y - 2, r: 18, fill: '#4DB56E' });
  });
  el('rect', { x: 0, y: 236, width: 400, height: 3, fill: '#CFEBC8' });
  // 温度計の看板（右端）
  el('rect', { x: 366, y: 166, width: 6, height: 70, fill: pal.woodDark });
  el('rect', { x: 347, y: 54, width: 44, height: 100, rx: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('rect', { x: 364, y: 66, width: 10, height: 62, rx: 5, fill: '#EEF1F5' });
  const fill = el('rect', { x: 365.5, y: 70, width: 7, height: 58, rx: 3.5, fill: pal.red });
  const bulb = el('circle', { cx: 369, cy: 134, r: 10, fill: pal.red });
  el('rect', { x: 364, y: 66, width: 10, height: 62, rx: 5, fill: 'none', stroke: pal.sub, 'stroke-width': 1.5 });

  const lines = g({});
  [0, 1, 2].forEach((i) => el('line', { x1: 0, y1: i * 11, x2: -22 + i * 5, y2: i * 11, stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.6 }, lines));
  const b = k.buddy({ x: 40, y: FY, scale: 1 });
  const drops = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));
  const breath = g({});
  [0, 1, 2].forEach((i) => el('circle', { cx: i * 9, cy: -i * 7, r: 5 + i * 2, fill: '#CFE8FA', opacity: 0.85 }, breath));

  const X = (t) => (t < 1.4 ? 40 + 100 * t : t < 3.0 ? 180 + 100 * ((t - 1.4) - (t - 1.4) * (t - 1.4) / 3.2) : 260);
  const V = (t) => (t < 1.4 ? 100 : t < 3.0 ? 100 * (1 - (t - 1.4) / 1.6) : 0);
  return {
    update(t) {
      const x = X(t), v = V(t) / 100;
      const cool = easeInOut(seg(t, 1.2, 3.8));
      const sw = Math.sin(x * 0.14);
      // 深呼吸：腕を広げて吸い、下ろして吐く
      const br = seg(t, 3.0, 4.0);
      const inh = easeInOut(seg(br, 0, 0.5)) - easeInOut(seg(br, 0.5, 1));
      b.pose({
        x, walk: x * 0.14 + (Math.round((x * 0.14) / Math.PI) * Math.PI - x * 0.14) * seg(t, 2.5, 3.0), lean: 13 * v * v, squash: 1 + 0.05 * inh * (t > 3.0 ? 1 : 0), lift: 0,
        armR: v > 0.02 ? 8 + sw * (14 + 38 * v) : 8 + 150 * inh, armL: v > 0.02 ? 8 - sw * (14 + 38 * v) : 8 + 150 * inh,
        mood: v > 0.6 ? 'open' : v > 0.02 ? 'flat' : br > 0.5 ? 'open' : 'smile', look: 0.5, blink: t > 3.0 && t < 3.1 ? 1 : 0
      });
      tf(lines, x - 34, 160, 0, 1);
      lines.setAttribute('opacity', seg(v, 0.6, 0.9));
      const lv = lerp(58, 14, cool);
      fill.setAttribute('y', 128 - lv); fill.setAttribute('height', lv);
      const col = mix(pal.red, pal.blue, cool);
      fill.setAttribute('fill', col); bulb.setAttribute('fill', col);
      drops.forEach((d, i) => {
        const c = (t * 1.6 + i / 3) % 1;
        tf(d, x - 14 - 26 * c, 146 - 18 * Math.sin(Math.PI * c) + 30 * c * c, 0, 1);
        d.setAttribute('opacity', v > 0.15 ? Math.min(1, v * 1.4) * (1 - seg(c, 0.8, 1)) : 0);
      });
      const bp = seg(br, 0.5, 1);
      tf(breath, x + 22 + 20 * bp, 178 - 22 * bp, 0, 0.5 + 0.7 * bp);
      breath.setAttribute('opacity', bp > 0 ? 0.9 * (1 - bp) : 0);
    }
  };
}
