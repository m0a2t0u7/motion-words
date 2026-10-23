// result：検査の結果は1週間後に届く。カレンダーが進み、結果の紙が届く（例文 The test results will come next week.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.2, beats: [[0, '今週'], [1.4, '1週間待つ'], [3.0, '結果が届く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  const cal = g({}); tf(cal, 300, 100);
  el('rect', { x: -44, y: -44, width: 88, height: 84, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, cal);
  el('rect', { x: -44, y: -44, width: 88, height: 20, rx: 8, fill: pal.coral }, cal);
  const pg = g({}, cal), pgt = k.text(0, 16, '今週', { 'font-size': 20, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle' }, pg);
  const nx = k.text(0, 0, '+7', { 'font-size': 22, 'font-weight': 700, fill: pal.blue, 'text-anchor': 'middle' }, pg);
  const paper = g({});
  el('rect', { x: -22, y: -28, width: 44, height: 56, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, paper);
  k.text(0, 6, 'A', { 'font-size': 30, 'font-weight': 700, fill: pal.green, 'text-anchor': 'middle' }, paper);
  const b = k.buddy({ x: 110, y: FY, scale: S });
  const ck = em('⏳', 28);
  return { update(t) {
    const fl = seg(t, 1.0, 2.4), sx = Math.abs(Math.cos(fl * Math.PI));
    tf(pg, 0, -4, 0, 1, fl > 0 && fl < 1 ? Math.max(0.05, sx) : 1);
    pgt.textContent = fl > 0.5 ? '来週' : '今週'; nx.textContent = '';
    const arr = easeOut(seg(t, 3.0, 3.7));
    tf(paper, lerp(420, 190, arr), 150 - 20 * hump(arr), 0, 1, 1);
    P(b, { look: 0.4, armR: 8 + 100 * seg(t, 3.4, 3.9), armL: t < 2.8 ? 130 * hump(seg(t, 0.4, 1.0)) : 8, mood: t > 3.2 ? 'grin' : 'flat', blink: blinkAt(t) });
    tf(ck, 110, 52, 0, seg(t, 0.5, 0.9) * (1 - seg(t, 2.6, 2.9)));
  } };
}
