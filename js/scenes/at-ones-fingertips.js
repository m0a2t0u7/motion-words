// at one's fingertips：遠い本棚まで行かなくても、ソファでスマホを触るだけで地図・天気・本・音楽がすぐ手元に出てくる（例文 Phones put a lot of information at our fingertips.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, reach, sofa, phone, icon, popIn } from './in-common.js';

export const meta = { duration: 4.2, beats: [[0, '本棚は遠い'], [1.3, 'スマホを開く'], [3.0, 'すぐ手元に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 部屋の奥の大きな本棚（遠い）
  el('rect', { x: 18, y: 50, width: 86, height: FY - 56, rx: 4, fill: pal.woodDark });
  [0, 1, 2, 3].forEach((r) => { el('rect', { x: 24, y: 58 + r * 44, width: 74, height: 36, fill: '#B8925F' }); [0, 1, 2, 3, 4, 5].forEach((i) => el('rect', { x: 27 + i * 12, y: 64 + r * 44 + (i % 2) * 3, width: 9, height: 30 - (i % 2) * 3, rx: 1.5, fill: [pal.blue, pal.coral, pal.yellow, pal.green, pal.violet][(i + r) % 5] })); });
  const dist = el('path', { d: 'M 118 120 L 210 120', stroke: pal.sub, 'stroke-width': 2.5, 'stroke-dasharray': '6 5', 'marker-end': '' });
  const S = sofa(k, 272, FY, 170, '#9CC9EE', '#7FB3E0');
  const A = k.buddy({ x: 262, y: FY - 30, scale: 0.9 });
  S.front();
  const ph = phone(k);
  const glow = el('circle', { r: 0, fill: '#FFF3C4', opacity: 0.5 });
  const cards = ['map', 'sun', 'book', 'note'].map((n) => {
    const c = g({});
    el('rect', { x: -15, y: -15, width: 30, height: 30, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, c);
    if (n === 'map') { el('path', { d: 'M -9 -7 L -3 -9 L 3 -7 L 9 -9 L 9 7 L 3 9 L -3 7 L -9 9 Z', fill: '#CDEBCF' }, c); el('circle', { cx: 2, cy: -2, r: 3, fill: pal.red }, c); }
    else if (n === 'sun') { el('circle', { r: 6, fill: pal.yellow }, c); [0, 1, 2, 3, 4, 5, 6, 7].forEach((i) => { const a = i * Math.PI / 4; el('line', { x1: Math.cos(a) * 8, y1: Math.sin(a) * 8, x2: Math.cos(a) * 11, y2: Math.sin(a) * 11, stroke: pal.yellowDark, 'stroke-width': 2 }, c); }); }
    else { const i = icon(k, n, c); k.tf(i, 0, 0, 0, 0.8); }
    return c;
  });
  const spots = [[226, 128], [258, 108], [294, 108], [326, 128]];
  return {
    update(t) {
      // 最初は本棚の方を見て「遠いな」
      const out = easeInOut(seg(t, 1.0, 1.5));
      P(A, { y: FY - 30, look: t < 1.0 ? -0.9 : 0.4, facing: 1, mood: t < 1.0 ? 'flat' : t > 2.6 ? 'grin' : 'smile', lean: lerp(-4, 4, out) });
      dist.setAttribute('opacity', t < 1.1 ? 0.8 * seg(t, 0.1, 0.4) : 0);
      const hx = 292, hy = lerp(200, 170, out);
      A.pose({ armR: reach(A, 0.9, 'R', hx, hy), armL: lerp(10, 60, out) });
      tf(ph.g, hx, hy - 6, 0, 1.2);
      k.set(ph.scr, { fill: t > 1.5 ? '#CFE9F7' : '#9FB4CC' });
      const tap = t > 1.6 ? hump(seg((t - 1.6) % 0.4, 0, 0.4)) : 0;
      k.set(glow, { cx: hx, cy: hy - 8, r: 12 * easeOut(seg(t, 1.5, 1.9)) + 2 * tap, opacity: t > 1.5 ? 0.6 : 0 });
      cards.forEach((c, i) => {
        const p = seg(t, 1.7 + i * 0.32, 2.2 + i * 0.32);
        const e = easeOut(p);
        const [sx, sy] = spots[i];
        tf(c, lerp(hx, sx, e), lerp(hy - 8, sy, e) - 3 * Math.sin(t * 2.5 + i), 0, popIn(p) * 0.95);
      });
      // 最後：カードにすぐ触れる
      if (t > 3.3) A.pose({ armL: 8, armR: reach(A, 0.9, 'R', lerp(hx, 258, hump(seg(t, 3.3, 4.1))), lerp(hy, 128, hump(seg(t, 3.3, 4.1)))) });
    }
  };
}
