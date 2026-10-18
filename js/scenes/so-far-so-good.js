// so far so good：新しい職場で作業中、同僚に「新しい仕事はどう？」と聞かれ、親指を立てて「今のところ順調」（チェック表は途中まで）
// このファイルは ph0 系シーンの共有ヘルパーも書き出す（talk / mark / calendar / drop / wallet / umbrella / cake / ticket / blinkAt）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp, wobble } from '../ease.js';
import { say } from './look-over.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { P, blinkAt } from './run-after.js';
import { gait } from './dig.js';
export { P, blinkAt, gait };

// 吹き出し（短い英語の合図）。show(p, x, y)
export function talk(k, label, w = 70, h = 32, tail = -1, fs = 13) {
  const s = say(k, w, h, tail);
  if (label) k.text(0, 1, label, { 'font-size': fs }, s.g);
  return s;
}
// 記号：'check' | 'x' | 'q' | 'box' | 'bang'
export function mark(k, kind, parent, s = 1, color) {
  const g = k.g({}, parent || k.root), pal = k.pal;
  const st = (c, w) => ({ stroke: c, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  if (kind === 'check') k.el('path', { d: 'M -7 0 L -2 6 L 8 -6', ...st(color || pal.green, 4) }, g);
  if (kind === 'x') k.el('path', { d: 'M -7 -7 L 7 7 M 7 -7 L -7 7', ...st(color || pal.red, 4.5) }, g);
  if (kind === 'box') k.el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 3, ...st(color || pal.sub, 2.4) }, g);
  if (kind === 'q') k.text(0, 1, '?', { 'font-size': 20, fill: color || pal.blueDark }, g);
  if (kind === 'bang') k.text(0, 1, '!', { 'font-size': 22, fill: color || pal.coralDark }, g);
  k.tf(g, 0, 0, 0, s);
  return g;
}
// 卓上カレンダー（めくれる数字）。set(str, flipP)
export function calendar(k, x, y, w = 44, parent) {
  const g = k.g({}, parent), pal = k.pal; k.tf(g, x, y);
  k.el('rect', { x: -w / 2, y: 0, width: w, height: w * 0.95, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, g);
  k.el('rect', { x: -w / 2, y: 0, width: w, height: w * 0.26, rx: 4, fill: pal.red }, g);
  const num = k.text(0, w * 0.62, '1', { 'font-size': w * 0.42 }, g);
  const leaf = k.el('rect', { x: -w / 2, y: w * 0.24, width: w, height: w * 0.7, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  return { g, set(str, fp = 0) { num.textContent = str; k.set(leaf, { transform: `translate(0 ${w * 0.24}) scale(1 ${Math.max(0.001, 1 - fp)}) translate(0 ${-w * 0.24})`, opacity: fp > 0.02 && fp < 0.98 ? 1 : 0 }); } };
}
// 汗のしずく
export function drop(k, parent) { return k.el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: k.pal.water }, parent); }
export function wallet(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -11, y: -8, width: 22, height: 16, rx: 3, fill: k.pal.coffee }, g);
  k.el('rect', { x: 2, y: -4, width: 9, height: 8, rx: 2, fill: '#A87452' }, g);
  return g;
}
// 傘（原点＝持ち手、たたんだ形）。tag の色で持ち主を示す
export function umbrella(k, color, tag, parent) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M 0 0 Q -7 0 -7 -6', stroke: k.pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
  k.el('line', { x1: 0, y1: 0, x2: 0, y2: -62, stroke: k.pal.sub, 'stroke-width': 2.5 }, g);
  k.el('path', { d: 'M 0 -8 L 7 -50 L 0 -62 L -7 -50 Z', fill: color }, g);
  if (tag) k.el('rect', { x: -5, y: -42, width: 10, height: 9, rx: 2, fill: tag, stroke: '#fff', 'stroke-width': 1.5 }, g);
  return g;
}
export function cake(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  k.el('path', { d: 'M -12 -1 L -12 -16 L 12 -20 L 12 -1 Z', fill: '#FFF1D6' }, g);
  k.el('path', { d: 'M -12 -9 L 12 -11', stroke: '#F7B7C4', 'stroke-width': 3 }, g);
  k.el('path', { d: 'M -12 -16 L 12 -20', stroke: '#fff', 'stroke-width': 3 }, g);
  k.el('circle', { cx: 4, cy: -23, r: 4, fill: pal.red }, g);
  return g;
}
export function ticket(k, parent, c) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -14 -8 H 14 V -3 A 3 3 0 0 0 14 3 V 8 H -14 V 3 A 3 3 0 0 0 -14 -3 Z', fill: c || k.pal.yellow, stroke: k.pal.yellowDark, 'stroke-width': 1.5 }, g);
  k.el('line', { x1: 6, y1: -7, x2: 6, y2: 7, stroke: k.pal.yellowDark, 'stroke-width': 1.5, 'stroke-dasharray': '2 2' }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '新しい仕事中'], [1.4, 'どう？'], [2.6, '今のところ順調']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 250);
  // 壁のチェック表（4項目中2つ済み）
  el('rect', { x: 40, y: 34, width: 76, height: 92, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const rows = [0, 1, 2, 3].map((i) => { const y = 52 + i * 20; tf(mark(k, 'box', null, 0.8), 52, y, 0, 0.8); el('rect', { x: 64, y: y - 3, width: 42, height: 6, rx: 3, fill: pal.line }); return y; });
  const ck = rows.slice(0, 2).map((y) => { const c = mark(k, 'check'); tf(c, 53, y - 2, 0, 0.9); return c; });
  const top = desk(k, 70, 120, FY);
  monitor(k, 120, top);
  const G = k.buddy({ x: 212, y: FY, facing: -1 });
  const C = k.buddy({ x: 440, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const q = talk(k, 'New job?', 78, 32, 1);
  const a = say(k, 104, 36, -1);
  el('path', { transform: 'translate(-26 0)', d: 'M -9 -8 L -9 8 L 9 8 L 9 -2 L 1 -2 L -1 -10 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, a.g);
  [[0, 'check'], [18, 'check'], [36, 'box']].forEach(([x, kd]) => tf(mark(k, kd, a.g, 0.9), x, 0));
  const xf = (t) => lerp(440, 318, easeInOut(seg(t, 0.4, 1.7)));
  return {
    update(t) {
      const typing = t < 1.9;
      const ty = typing ? Math.max(0, Math.sin(t * 22)) : 0;
      const turn = t > 1.95;
      const up = easeOut(seg(t, 2.6, 3.0));
      P(G, { facing: turn ? 1 : -1, armR: typing ? 70 + 10 * ty : lerp(20, 150, up), armL: typing ? 62 + 8 * (1 - ty) : 8, lean: typing ? 6 : 0,
        squash: 1 - 0.05 * hump(seg(t, 1.95, 2.25)), look: turn ? 0.6 : 0.3, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      ck[1].setAttribute('opacity', t > 0.9 ? 1 : 0);
      tf(ck[1], 53, rows[1] - 2, 0, 0.9 * Math.max(0.001, backOut(seg(t, 0.9, 1.2))));
      const p = gait(xf, t, 440);
      P(C, { x: p.x, walk: p.walk, armL: p.armL, armR: t > 1.6 && t < 2.6 ? 8 + 50 * hump(seg(t, 1.6, 2.6)) : p.armR, facing: -1, lean: p.lean,
        mood: t > 1.6 && t < 2.4 && Math.sin(t * 20) > 0 ? 'open' : t > 3 ? 'grin' : 'smile', look: 0.5, blink: blinkAt(t, 1) });
      q.show(seg(t, 1.6, 1.9) * (t < 2.7 ? 1 : 0), 300, 108);
      a.show(seg(t, 2.7, 3.0), 248, 106);
    }
  };
}
