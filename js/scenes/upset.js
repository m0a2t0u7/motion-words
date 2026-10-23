// upset：テレビのニュースで遠足が雨で中止と知り、まめはリュックを落として頭を抱え、おろおろする（例文 She was upset when she heard the news.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { hp, P, blinkAt, pop, sc } from './member.js';
import { homeBg, sofaProp } from './furniture.js';
import { drop } from './in-common.js';
import { bagProp } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, 'ニュースを聞く'], [1.4, '遠足が中止'], [2.4, '動揺する']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  homeBg(k, { FY, winX: 30, winW: 80 });
  // テレビ
  const TX = 300;
  el('rect', { x: TX - 6, y: FY - 50, width: 12, height: 50, fill: pal.woodDark });
  el('rect', { x: TX - 40, y: FY - 54, width: 80, height: 8, rx: 2, fill: pal.wood });
  el('rect', { x: TX - 62, y: FY - 140, width: 124, height: 84, rx: 6, fill: pal.ink });
  el('rect', { x: TX - 56, y: FY - 134, width: 112, height: 72, rx: 3, fill: '#DDEFFA' });
  el('rect', { x: TX - 56, y: FY - 74, width: 112, height: 12, fill: pal.red }); k.text(TX, FY - 68, 'NEWS', { 'font-size': 8, fill: '#fff' });
  // 画面：遠足のバス → 雨雲と×
  const sun = g({}); el('circle', { cx: TX - 30, cy: FY - 116, r: 9, fill: pal.yellow }, sun);
  el('rect', { x: TX - 20, y: FY - 108, width: 44, height: 22, rx: 5, fill: pal.yellow }, sun); el('rect', { x: TX - 16, y: FY - 104, width: 30, height: 8, fill: '#fff' }, sun);
  const rain = g({}); el('ellipse', { cx: TX - 10, cy: FY - 120, rx: 22, ry: 10, fill: '#8FA3B8' }, rain);
  [0, 1, 2, 3].forEach((i) => el('line', { x1: TX - 26 + i * 10, y1: FY - 106, x2: TX - 29 + i * 10, y2: FY - 96, stroke: pal.blueDark, 'stroke-width': 2 }, rain));
  el('path', { d: `M ${TX + 18} ${FY - 120} l 24 24 M ${TX + 42} ${FY - 120} l -24 24`, stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round' }, rain);
  const b = k.buddy({ x: 150, y: FY, scale: S, facing: 1 });
  const bag = bagProp(k, k.root, pal.yellow, pal.yellowDark, 28, 26);
  const sw = [0, 1, 2].map(() => drop(k));
  const shock = el('path', { d: 'M -10 0 L -4 -10 L 0 -2 L 6 -12', stroke: pal.ink, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' });
  return {
    update(t) {
      const news = t > 1.2;
      sun.setAttribute('opacity', news ? 0 : 1); rain.setAttribute('opacity', news ? easeOut(seg(t, 1.2, 1.5)) : 0);
      const jolt = seg(t, 1.4, 1.7), head = easeInOut(seg(t, 2.0, 2.4)), sway = t > 2.4 ? Math.sin((t - 2.4) * 7) : 0;
      P(b, { look: t < 1.4 ? 0.8 : 0.8 - 0.6 * head, blink: blinkAt(t), mood: t > 1.4 ? (t > 2.2 ? 'sad' : 'open') : 'smile', lift: 14 * hump(jolt), lean: -8 * hump(jolt) + 6 * head + 5 * sway, squash: 1 - 0.05 * head, x: 150 + 6 * sway });
      b.pose({ armR: lerp(lerp(30, 12, jolt), 160, head), armL: lerp(10, 160, head) });
      // リュック：手から落ちて床へ
      const h = hp(b, S, 'R', 28);
      const f = easeIn(seg(t, 1.5, 1.8));
      if (t < 1.5) tf(bag, h.x, h.y - 2, 0, S); else tf(bag, lerp(h.x, 196, f), lerp(FY - 70, FY - 34, f) - 4 * hump(seg(t, 1.8, 2.0)), 10 * f, S);
      sw.forEach((d, i) => { const q = ((t * 1.4 + i * 0.33) % 1); tf(d, b.state.x + [-34, 34, -26][i], FY - 104 + i * 10 + 12 * q, 0, t > 2.0 ? sc(1 - q) : 0.001); });
      tf(shock, b.state.x + 6, FY - 126 - 6 * jolt, 0, sc(pop(jolt) * (1 - seg(t, 2.2, 2.4))));
    }
  };
}
