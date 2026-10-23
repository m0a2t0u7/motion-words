// flour：ボウルに入れた小麦粉と砂糖を、まめが泡立て器でぐるぐる混ぜ、ひとつになる（例文 Mix the flour and sugar.）
// このファイルは食べ物シーンの共有ヘルパーも書き出す（kitchen / bowlG / mugG / spoonG / jarG / bagG / plateG / whiskG / at）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { room, hp, reach } from './dig.js';

// 台所（壁の窓と棚＋カウンター）。front() 以降の図形の下にカウンター前面を描く
export function kitchen(k, { win = true, mood = 'indoor' } = {}) {
  const r = room(k, mood), { el, pal } = k;
  if (win) { el('rect', { x: 30, y: 40, width: 90, height: 66, rx: 6, fill: mood === 'evening' ? '#F6C7A8' : '#DDEFFA', stroke: '#fff', 'stroke-width': 5 }); el('line', { x1: 75, y1: 40, x2: 75, y2: 106, stroke: '#fff', 'stroke-width': 4 }); }
  el('rect', { x: 270, y: 76, width: 100, height: 6, rx: 3, fill: pal.woodDark });
  [[280, '#F2C14E'], [304, '#E8574A'], [328, '#7FB3E8'], [350, '#9C86E8']].forEach(([x, c]) => el('rect', { x, y: 56, width: 16, height: 20, rx: 4, fill: c, opacity: 0.8 }));
  return r;
}
// 手先へ物を置く（回転しない。原点＝握り）
export function at(k, b, s, node, side = 'R', rot = 0, dx = 0, dy = 0, sc = 1) {
  const h = hp(b, s, side, 28);
  k.tf(node, h.x + dx * b.state.facing, h.y + dy, rot * b.state.facing, s * sc * b.state.facing, s * sc);
  return h;
}
// ボウル（原点＝底の中央）。中身は fill に入れる（ボウルの縁より奥）
export function bowlG(k, parent, w = 70, col = '#F5F7FA', rim = '#C7D0DC') {
  const g = k.g({}, parent);
  k.shadow(0, 2, w / 2, 4, g);
  const fill = k.g({}, g);
  k.el('path', { d: `M ${-w / 2} ${-w * 0.42} Q ${-w / 2} 0 0 0 Q ${w / 2} 0 ${w / 2} ${-w * 0.42} Z`, fill: col, stroke: rim, 'stroke-width': 2 }, g);
  k.el('path', { d: `M ${-w / 2 + 8} ${-w * 0.3} Q ${-w / 2 + 10} ${-w * 0.1} ${-w / 4} ${-w * 0.06}`, stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.8 }, g);
  return { g, fill, top: -w * 0.42 };
}
// マグ・カップ（原点＝底の中央）。liq の fill を変えて中身の色を変える
export function mugG(k, parent, col = '#fff', liqCol = k.pal.coffee) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M 13 -18 q 9 0 8 8 q -1 7 -9 6', stroke: col === '#fff' ? '#D9DFE7' : col, 'stroke-width': 3.4, fill: 'none' }, g);
  k.el('path', { d: 'M -14 -24 L 14 -24 L 12 -2 Q 12 0 9 0 L -9 0 Q -12 0 -12 -2 Z', fill: col, stroke: '#D9DFE7', 'stroke-width': 1.5 }, g);
  const liq = k.el('ellipse', { cx: 0, cy: -23, rx: 12.5, ry: 3.2, fill: liqCol }, g);
  return { g, liq };
}
// スプーン（原点＝握り、+y がすくう先）
export function spoonG(k, parent, col = '#B7C0CC') {
  const g = k.g({}, parent);
  k.el('rect', { x: -1.6, y: -6, width: 3.2, height: 20, rx: 1.6, fill: col }, g);
  k.el('ellipse', { cx: 0, cy: 17, rx: 4.5, ry: 6, fill: col }, g);
  const load = k.el('ellipse', { cx: 0, cy: 16, rx: 3.4, ry: 4, fill: 'none' }, g);
  return { g, load };
}
// 泡立て器（原点＝握り、+y が先）
export function whiskG(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -2.4, y: -8, width: 4.8, height: 14, rx: 2, fill: '#F2685B' }, g);
  k.el('path', { d: 'M 0 6 Q -9 18 0 28 Q 9 18 0 6 M 0 6 Q -4 18 0 28 Q 4 18 0 6', stroke: '#AEB8C6', 'stroke-width': 1.6, fill: 'none' }, g);
  return g;
}
// びん（原点＝底の中央）
export function jarG(k, parent, body = '#F2C14E', lid = '#E86F57', w = 22, h = 28, label = '') {
  const g = k.g({}, parent);
  k.el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 5, fill: body, stroke: '#fff', 'stroke-width': 1.5 }, g);
  k.el('rect', { x: -w / 2 - 1, y: -h - 6, width: w + 2, height: 7, rx: 2, fill: lid }, g);
  k.el('rect', { x: -w / 2 + 3, y: -h * 0.62, width: w - 6, height: h * 0.34, rx: 2, fill: '#fff', opacity: 0.85 }, g);
  if (label) k.text(0, -h * 0.45, label, { 'font-size': 7, fill: k.pal.ink }, g);
  return g;
}
// 紙ぶくろ（原点＝底の中央）
export function bagG(k, parent, col = '#F3E3C3', label = '', lc = k.pal.ink) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -16 0 L -16 -40 L -12 -46 L 12 -46 L 16 -40 L 16 0 Z', fill: col, stroke: '#D8C39C', 'stroke-width': 1.5 }, g);
  k.el('path', { d: 'M -16 -40 L 16 -40', stroke: '#D8C39C', 'stroke-width': 1.5 }, g);
  if (label) k.text(0, -20, label, { 'font-size': 7, fill: lc }, g);
  return g;
}
// 平皿（原点＝底の中央）
export function plateG(k, parent, w = 70) {
  const g = k.g({}, parent);
  k.shadow(0, 2, w / 2, 3, g);
  k.el('ellipse', { cx: 0, cy: -2, rx: w / 2, ry: w * 0.1, fill: '#fff', stroke: k.pal.line, 'stroke-width': 2 }, g);
  k.el('ellipse', { cx: 0, cy: -3, rx: w * 0.32, ry: w * 0.055, fill: '#F2F5F8' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '小麦粉と砂糖'], [1.2, 'ぐるぐる混ぜる'], [3.4, '混ざった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const R = kitchen(k);
  const TY = R.TY;
  const MY = R.TY + 22, me = k.buddy({ x: 150, y: MY, scale: S });
  R.front();
  const fb = g({}); tf(fb, 300, TY); bagG(k, fb, '#F3E3C3', 'FLOUR');
  const sb = g({}); tf(sb, 344, TY); bagG(k, sb, '#E3F0FB', 'SUGAR', pal.blueDark);
  const B = bowlG(k, undefined, 86); tf(B.g, 228, TY);
  // 中身：小麦粉の山（左）と砂糖の山（右）→ 混ざって1つの山
  const fl = el('path', { d: 'M -32 -34 Q -18 -60 -2 -34 Z', fill: '#F6EBD3', stroke: '#E2CFA6', 'stroke-width': 1.5 }, B.fill);
  const su = el('path', { d: 'M 0 -34 Q 16 -58 32 -34 Z', fill: '#FFFFFF', stroke: '#A9C8E8', 'stroke-width': 1.5 }, B.fill);
  const mix = el('path', { d: 'M -36 -34 Q 0 -64 36 -34 Z', fill: '#F6EBD3', stroke: '#E2CFA6', 'stroke-width': 1.5 }, B.fill);
  const specks = [[-14, -44], [-4, -50], [8, -48], [18, -42], [-22, -40], [2, -42]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 1.3, fill: '#fff', stroke: '#C9DCEF', 'stroke-width': 0.8 }, B.fill));
  const wk = whiskG(k);
  const puff = [0, 1, 2].map(() => el('circle', { r: 5, fill: '#fff', opacity: 0 }));
  return {
    update(t) {
      const go = easeInOut(seg(t, 0.4, 1.0)), stir = seg(t, 1.0, 3.4) > 0 && t < 3.4, a = (t - 1.0) * 9;
      const m = easeInOut(seg(t, 1.2, 3.2));
      fl.setAttribute('opacity', 1 - m); su.setAttribute('opacity', 1 - m); mix.setAttribute('opacity', m);
      specks.forEach((s, i) => s.setAttribute('opacity', m > 0.3 + i * 0.1 ? 1 : 0));
      const tx = 228 + (stir ? Math.cos(a) * 14 : 0), ty = TY - 60 + (stir ? Math.sin(a) * 3 : 0);
      P(me, { x: 150, y: MY, armR: 8, lean: 4 * go, look: 0.7, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      const ra = reach(me, S, 'R', tx, ty);
      me.pose({ armR: lerp(60, ra, go) });
      const h = hp(me, S, 'R', 28);
      // 泡立て器は手からボウルへ向けてまっすぐ下
      tf(wk, h.x, h.y, lerp(-40, (Math.atan2(-(tx - h.x), (TY - 36) - h.y) * 180) / Math.PI, go), S);
      puff.forEach((p, i) => { const q = ((t * 1.6 + i / 3) % 1); k.set(p, { cx: 228 + (i - 1) * 16, cy: TY - 40 - 18 * q, r: 3 + 4 * q, opacity: stir ? 0.7 * (1 - q) : 0 }); });
    }
  };
}
