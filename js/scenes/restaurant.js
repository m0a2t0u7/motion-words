// restaurant：新しくできたレストランで、2人がテーブルについてパスタを食べる（例文 We ate at a new restaurant.）
// このファイルは「場所」シーン用の共有ヘルパーも書き出す
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, held, reach, P, blinkAt, bp, twinkle, pop } from './body.js';
export { hp, held, reach, P, blinkAt, bp, twinkle, pop };

// フォーク（原点＝握り、+y が先端）
export function fork(k, parent) {
  const g = k.g({}, parent), c = '#AEB8C6';
  k.el('rect', { x: -1.6, y: -6, width: 3.2, height: 18, rx: 1.5, fill: c }, g);
  k.el('path', { d: 'M -4 12 h 8 v 3 h -8 Z M -4 15 v 7 M -1.3 15 v 7 M 1.3 15 v 7 M 4 15 v 7', stroke: c, 'stroke-width': 1.4, fill: c }, g);
  return g;
}
// 看板（中心 x,y）
export function signBoard(k, x, y, w, h, label, fill, color = '#fff', fs, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 5, fill }, g);
  k.el('rect', { x: x - w / 2, y: y + h / 2 - 4, width: w, height: 4, rx: 2, fill: '#000', opacity: 0.12 }, g);
  k.text(x, y + 1, label, { 'font-size': fs || h * 0.55, fill: color }, g);
  return g;
}
// 店の正面（左上 x, 床 FY）。窓・日よけ・看板・ドア。戻り値 { doorX, doorW, doorTop, win }
export function storefront(k, { x, w, h, FY, wall = '#F7EBDD', trim = '#C98A5A', awn = ['#F2685B', '#fff'], label = '', signFill = '#C98A5A', doorX = null, doorW = 44, winFill = '#DDEFFA' }) {
  const { el } = k;
  const top = FY - h;
  el('rect', { x, y: top, width: w, height: h, fill: wall });
  el('rect', { x: x - 4, y: top - 8, width: w + 8, height: 10, rx: 2, fill: trim });
  if (label) signBoard(k, x + w / 2, top + 18, Math.min(w - 20, label.length * 13 + 26), 24, label, signFill);
  const ay = top + 34, n = Math.round(w / 22);
  for (let i = 0; i < n; i++) el('path', { d: `M ${x + i * w / n} ${ay} h ${w / n} v 14 q ${-w / n / 2} 8 ${-w / n} 0 Z`, fill: awn[i % 2] });
  const dx = doorX == null ? x + w - doorW - 14 : doorX;
  const wins = [];
  const wy = ay + 26, wh = FY - wy - 10;
  [[x + 12, dx - x - 24]].forEach(([wx, ww]) => { if (ww > 20) { wins.push(el('rect', { x: wx, y: wy, width: ww, height: wh * 0.75, rx: 4, fill: winFill, stroke: '#fff', 'stroke-width': 4 })); } });
  el('rect', { x: dx - 3, y: wy - 3, width: doorW + 6, height: FY - wy + 3, rx: 3, fill: trim });
  el('rect', { x: dx, y: wy, width: doorW, height: FY - wy, rx: 2, fill: '#6E5A4C' });
  return { doorX: dx, doorW, doorTop: wy, win: wins[0], wy, wh: wh * 0.75 };
}
// 横から見たテーブル（中心 cx、天板 y=top）。人物より後に作ると脚を隠す
export function sideTable(k, cx, top, w, FY, cloth = '#fff', parent) {
  const g = k.g({}, parent), { el, pal } = k;
  k.shadow(cx, FY + 2, w / 2 + 8, 5, g);
  el('rect', { x: cx - 4, y: top, width: 8, height: FY - top, fill: pal.woodDark }, g);
  el('rect', { x: cx - 22, y: FY - 4, width: 44, height: 5, rx: 2, fill: pal.woodDark }, g);
  el('path', { d: `M ${cx - w / 2} ${top} h ${w} v 16 q -4 4 -8 0 h ${-w + 16} q -4 4 -8 0 Z`, fill: cloth }, g);
  el('rect', { x: cx - w / 2, y: top, width: w, height: 3, fill: '#000', opacity: 0.06 }, g);
  return g;
}
// 料理の山（原点＝皿の中心）。set(残り 0..1)
export function dish(k, parent, color = '#F2C14E', top = '#E8574A') {
  const g = k.g({}, parent);
  k.el('ellipse', { cx: 0, cy: 0, rx: 20, ry: 4.5, fill: '#fff', stroke: k.pal.line, 'stroke-width': 1.5 }, g);
  const m = k.g({}, g);
  k.el('path', { d: 'M -13 -1 Q -10 -12 0 -13 Q 10 -12 13 -1 Z', fill: color }, m);
  k.el('path', { d: 'M -8 -3 Q -4 -8 0 -4 Q 4 -9 8 -3', stroke: '#E0A93A', 'stroke-width': 1.4, fill: 'none' }, m);
  k.el('circle', { cx: 0, cy: -12, r: 3.6, fill: top }, m);
  return { g, set(q) { k.tf(m, 0, 0, 0, Math.max(0.001, 0.25 + 0.75 * q), Math.max(0.001, q)); m.setAttribute('opacity', q > 0.03 ? 1 : 0); } };
}
// ぶら下がり照明
export function lamp(k, x, y, c = '#FFCF5C') {
  k.el('line', { x1: x, y1: 0, x2: x, y2: y, stroke: k.pal.sub, 'stroke-width': 2 });
  k.el('path', { d: `M ${x - 16} ${y + 14} Q ${x} ${y - 6} ${x + 16} ${y + 14} Z`, fill: c });
  k.el('ellipse', { cx: x, cy: y + 15, rx: 5, ry: 3, fill: '#FFF6D8' });
}
// 食べる周期：皿→口。戻り値 { toMouth 0..1, bite 持っているか }
// 持ち物を、手先から目標の方向へ向けて置く（node の +y が目標へ向く）
export function aim(k, node, h, tgt, s = 1) {
  k.tf(node, h.x, h.y, (Math.atan2(-(tgt.x - h.x), tgt.y - h.y) * 180) / Math.PI, s, s);
}
export function tipOf(h, tgt, L) {
  const dx = tgt.x - h.x, dy = tgt.y - h.y, d = Math.hypot(dx, dy) || 1;
  return { x: h.x + (dx / d) * L, y: h.y + (dy / d) * L };
}
export function eatPhase(t, t0, per) {
  if (t < t0) return { m: 0, bite: false, n: 0 };
  const n = Math.floor((t - t0) / per), q = ((t - t0) / per) % 1;
  const m = q < 0.25 ? easeInOut(q / 0.25) * 0 : q < 0.55 ? easeInOut((q - 0.25) / 0.3) : q < 0.8 ? 1 : 1 - easeInOut((q - 0.8) / 0.2);
  return { m, bite: q > 0.2 && q < 0.7, n, q };
}

export const meta = { duration: 4.4, beats: [[0, '新しい店'], [1.0, '食べる'], [3.6, 'ごちそうさま']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F8EBDD' });
  el('rect', { x: 0, y: FY - 60, width: 400, height: 60, fill: '#E9CDAE' });
  el('rect', { x: 0, y: FY - 62, width: 400, height: 4, fill: '#D3AE87' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#D9B58E' });
  for (let x = 0; x < 400; x += 40) el('line', { x1: x, y1: FY, x2: x, y2: 300, stroke: '#C9A177', 'stroke-width': 1.5 });
  // 新装開店の飾り：リボン付きの看板と花
  signBoard(k, 200, 46, 92, 30, 'NEW', pal.red);
  [[-58, pal.yellow], [-46, pal.coral], [46, pal.violet], [58, pal.yellow]].forEach(([dx, c]) => { el('circle', { cx: 200 + dx, cy: 46, r: 8, fill: c }); el('circle', { cx: 200 + dx, cy: 46, r: 3, fill: '#fff' }); });
  el('rect', { x: 26, y: 60, width: 74, height: 90, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 300, y: 60, width: 74, height: 90, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  lamp(k, 200, 82);
  const TOP = FY - 56;
  // いす
  [[118, 1], [282, -1]].forEach(([x, f]) => { el('rect', { x: x - 26, y: FY - 26, width: 52, height: 8, rx: 3, fill: pal.woodDark }); el('rect', { x: x - 22, y: FY - 18, width: 6, height: 18, fill: pal.woodDark }); el('rect', { x: x + 16, y: FY - 18, width: 6, height: 18, fill: pal.woodDark }); el('rect', { x: x - f * 30 - 3, y: FY - 92, width: 7, height: 70, rx: 3, fill: pal.woodDark }); });
  const A = k.buddy({ x: 118, y: FY, scale: S, facing: 1 });
  const B = k.buddy({ x: 282, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  sideTable(k, 200, TOP, 150, FY);
  const dA = dish(k), dB = dish(k);
  tf(dA.g, 168, TOP - 2); tf(dB.g, 232, TOP - 2);
  el('rect', { x: 194, y: TOP - 22, width: 12, height: 20, rx: 3, fill: '#BFE6F5', opacity: 0.9 });
  const fA = fork(k), fB = fork(k);
  const biteA = el('circle', { r: 3.4, fill: '#F2C14E' }), biteB = el('circle', { r: 3.4, fill: '#F2C14E' });
  const hearts = [0, 1].map(() => el('path', { d: 'M 0 6 C -12 -4 -8 -12 0 -6 C 8 -12 12 -4 0 6 Z', fill: pal.red }));
  const one = (b, f, bite, d, ox, t, t0) => {
    const e = eatPhase(t, t0, 0.95), done = t > t0 + 0.95 * 3;
    const ep = done ? { m: 0, bite: false, n: 3, q: 0 } : e;
    P(b, { y: FY - 22, lean: 4 + 6 * (1 - ep.m), look: 0.3, armL: 12, mood: ep.m > 0.8 ? 'open' : done ? 'grin' : 'smile', blink: blinkAt(t, ox / 90) });
    const mouth = bp(b, S, 10, -42), plate = { x: ox, y: TOP - 10 };
    const a0 = reach(b, S, 'R', plate.x, plate.y + 14);
    b.pose({ armR: lerp(a0, 118, ep.m) });
    const tgt = { x: lerp(plate.x, mouth.x, ep.m), y: lerp(plate.y, mouth.y, ep.m) };
    aim(k, f, hp(b, S, 'R', 27), tgt, S);
    const tip = tipOf(hp(b, S, 'R', 27), tgt, 21 * S);
    k.set(bite, { cx: tip.x, cy: tip.y, opacity: ep.bite ? 1 : 0 });
    d.set(clamp(1 - Math.min(3, ep.n + (ep.q > 0.3 ? 1 : 0)) / 3));
  };
  return {
    update(t) {
      one(A, fA, biteA, dA, 168, t, 0.7);
      one(B, fB, biteB, dB, 232, t, 0.95);
      hearts.forEach((h, i) => { const q = seg(t, 3.7 + i * 0.15, 4.4); tf(h, 150 + i * 100, 112 - 14 * easeOut(q), 0, pop(easeOut(seg(q, 0, 0.4)))); });
    }
  };
}
