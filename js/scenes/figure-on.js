// figure on：朝9時、机で書類を片づけながら時計を見て「昼の12時には終わる」と見込む（例文 I figure on finishing the work by noon.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach, room } from './dig.js';
import { thought, check } from './work-on.js';

// 共有ヘルパ：壁時計（h 時 m 分）。戻り値 set(h, m) で針を動かす
export function wallClock(k, x, y, r, parent) {
  const c = k.g({}, parent); k.tf(c, x, y);
  k.el('circle', { r: r + 3, fill: k.pal.woodDark }, c);
  k.el('circle', { r, fill: '#fff' }, c);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; k.el('line', { x1: Math.sin(a) * (r - 5), y1: -Math.cos(a) * (r - 5), x2: Math.sin(a) * (r - 2), y2: -Math.cos(a) * (r - 2), stroke: k.pal.sub, 'stroke-width': i % 3 ? 1.4 : 2.6 }, c); }
  const hh = k.el('line', { x1: 0, y1: 0, x2: 0, y2: -r * 0.5, stroke: k.pal.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, c);
  const mm = k.el('line', { x1: 0, y1: 0, x2: 0, y2: -r * 0.78, stroke: k.pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, c);
  k.el('circle', { r: 2.4, fill: k.pal.red }, c);
  const set = (h, m = 0) => { hh.setAttribute('transform', `rotate(${(h % 12) * 30 + m * 0.5})`); mm.setAttribute('transform', `rotate(${m * 6})`); };
  set(9, 0);
  return { g: c, set };
}

export const meta = { duration: 4.4, beats: [[0, '9時に仕事中'], [1.5, '昼までと見込む'], [3.6, '予定を決めた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k);
  const clk = wallClock(k, 92, 80, 26);
  el('rect', { x: 290, y: 56, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const S = 1.2;
  const b = k.buddy({ x: 196, y: 230, scale: S });
  R.front();
  // 書類の山（左：未処理、右：済み）
  const pile = g({});
  for (let i = 0; i < 5; i++) el('rect', { x: 246, y: 190 - i * 5, width: 40, height: 5, rx: 1, fill: '#fff', stroke: pal.line, 'stroke-width': 1.2 }, pile);
  const pen = g({});
  el('rect', { x: -2, y: -2, width: 4, height: 18, rx: 2, fill: pal.ink }, pen);
  const tb = thought(k, 118, 74, -1);
  const mini = wallClock(k, -26, 0, 22, tb.inner); mini.set(12, 0);
  const pages = g({}, tb.inner); tf(pages, 24, 6);
  for (let i = 0; i < 3; i++) el('rect', { x: -12, y: 4 - i * 4, width: 26, height: 4, rx: 1, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }, pages);
  const chk = check(k, 28, -2, 1.1, null, tb.inner);
  return {
    update(t) {
      const write = t < 1.2 || t > 3.9;
      const look = easeInOut(seg(t, 1.1, 1.5)) * (1 - easeInOut(seg(t, 3.5, 3.9)));
      const nod = hump(seg(t, 3.1, 3.4)) + hump(seg(t, 3.4, 3.7));
      const wx = 266 + Math.sin(t * 9) * 8 * (write ? 1 : 0);
      b.pose({ lean: lerp(8, -2, look) + 6 * nod, look: lerp(0.6, -0.9, look), mood: look > 0.5 ? (t > 3 ? 'grin' : 'flat') : 'flat', armL: 10 });
      b.pose({ armR: lerp(reach(b, S, 'R', wx, 168), 20, look) });
      const h = hp(b, S, 'R');
      tf(pen, h.x, h.y, 30);
      clk.set(9, lerp(0, 20, seg(t, 0, 4.4)));
      const p = backOut(seg(t, 1.6, 1.95)) * (1 - seg(t, 3.8, 4.1));
      tb.g.setAttribute('opacity', seg(t, 1.6, 1.7) * (1 - seg(t, 3.8, 4.1)));
      tf(tb.g, 290, 150, 0, Math.max(0.01, p), Math.max(0.01, p));
      k.tf(pages, 24, 6);
      const c = easeOut(seg(t, 2.5, 2.9));
      chk(c);
    }
  };
}
