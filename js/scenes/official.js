// official：✓マーク付きの公式サイトに詳細の行が並ぶのを、まめが指さして見る（例文 The official website has all the details.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, hp } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '画面を開く'], [1.2, '✓の公式サイト'], [2.4, '詳細が並ぶ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const scr = g({}); tf(scr, 245, 120);
  el('rect', { x: -100, y: -80, width: 200, height: 150, rx: 8, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, scr);
  el('rect', { x: -100, y: -80, width: 200, height: 22, rx: 8, fill: '#E7EEF7' }, scr);
  el('rect', { x: -90, y: -75, width: 120, height: 12, rx: 6, fill: '#fff' }, scr);
  const ok = g({}, scr); tf(ok, 55, -69);
  el('circle', { r: 9, fill: pal.green }, ok);
  el('path', { d: 'M -4 0 l 3 3.5 l 6 -7', fill: 'none', stroke: '#fff', 'stroke-width': 2.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  el('rect', { x: -90, y: -50, width: 90, height: 12, rx: 3, fill: pal.blue }, scr);
  const rows = [0, 1, 2, 3, 4].map((i) => {
    const r = g({}, scr); tf(r, 0, -26 + i * 20);
    el('circle', { cx: -80, cy: 0, r: 4, fill: pal.green }, r);
    el('rect', { x: -68, y: -4, width: 130 - (i % 3) * 22, height: 8, rx: 4, fill: pal.line }, r);
    return r;
  });
  el('rect', { x: 235, y: 192, width: 20, height: 46, fill: pal.woodDark });
  const m = k.buddy({ x: 100, y: FY, scale: S });
  return {
    update(t) {
      const on = backOut(seg(t, 0.2, 0.9)), okp = backOut(seg(t, 1.1, 1.7));
      tf(scr, 245, 120 + (1 - on) * 20, 0, on * 0.001 + (on > 0 ? Math.max(on, 0.001) : 0.001));
      scr.setAttribute('opacity', on > 0 ? 1 : 0);
      tf(ok, 55, -69, 0, Math.max(okp, 0.001));
      rows.forEach((r, i) => { const p = easeOut(seg(t, 2.0 + i * 0.28, 2.4 + i * 0.28)); r.setAttribute('opacity', p); tf(r, (1 - p) * -14, -26 + i * 20); });
      const pt = easeInOut(seg(t, 1.8, 2.6));
      P(m, { x: 100, armR: lerp(8, 95, pt) + hump(seg(t, 2.6, 3.4)) * 8, lean: pt * 6, look: 1, mood: t > 2.6 ? 'open' : 'smile', blink: blinkAt(t) });
    }
  };
}
