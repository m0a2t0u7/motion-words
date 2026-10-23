// cake：オーブンから焼きたてのケーキを出した友だち（彼女）が、ろうそくを立ててまめの誕生日に運んでくる（例文 She baked a cake for my birthday.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { hp } from './dig.js';
import { cloth } from './spinach.js';
import { heartG } from './animal.js';

// 丸いケーキ（原点＝皿の底の中央）。candles(炎の明るさ)
export function cakeG(k, parent, n = 3) {
  const g = k.g({}, parent), { el, pal } = k;
  el('ellipse', { cx: 0, cy: 0, rx: 32, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  el('rect', { x: -26, y: -30, width: 52, height: 28, rx: 6, fill: '#FFF1D6' }, g);
  el('rect', { x: -26, y: -18, width: 52, height: 5, fill: '#F7B7C4' }, g);
  el('path', { d: 'M -26 -26 Q -20 -20 -14 -26 Q -8 -20 -2 -26 Q 4 -20 10 -26 Q 16 -20 22 -26 Q 25 -22 26 -26 V -30 H -26 Z', fill: '#fff' }, g);
  [-16, 0, 16].forEach((x) => el('circle', { cx: x, cy: -31, r: 3.5, fill: pal.red }, g));
  const fl = [];
  for (let i = 0; i < n; i++) { const x = -10 + i * 10; el('rect', { x: x - 1.5, y: -44, width: 3, height: 12, fill: [pal.blue, pal.yellow, pal.mint][i % 3] }, g); fl.push(el('path', { d: `M ${x} -54 Q ${x + 3} -48 ${x} -45 Q ${x - 3} -48 ${x} -54 Z`, fill: '#FFB547' }, g)); }
  return { g, fl };
}

export const meta = { duration: 4.6, beats: [[0, 'ケーキが焼けた'], [1.2, '運んでくる'], [3.2, 'お誕生日に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 旗と飾り
  el('path', { d: 'M 120 30 Q 260 60 400 30', fill: 'none', stroke: pal.sub, 'stroke-width': 1.2 });
  for (let i = 0; i < 8; i++) { const x = 136 + i * 34, y = 34 + 22 * Math.sin((i + 0.5) / 8 * Math.PI) * 0.9; el('path', { d: `M ${x - 9} ${y} L ${x + 9} ${y} L ${x} ${y + 15} Z`, fill: [pal.coral, pal.yellow, pal.blue, pal.mint][i % 4] }); }
  // オーブン（左）
  el('rect', { x: 10, y: FY - 110, width: 90, height: 110, rx: 6, fill: '#D9DFE7' });
  el('rect', { x: 18, y: FY - 100, width: 74, height: 12, rx: 3, fill: '#B7C0CC' });
  const ovenIn = el('rect', { x: 20, y: FY - 80, width: 70, height: 58, rx: 4, fill: '#FFB86B' });
  const door = g({}); el('rect', { x: 20, y: -6, width: 70, height: 58, rx: 4, fill: '#5E6778' }, door); el('rect', { x: 28, y: 2, width: 54, height: 30, rx: 3, fill: '#FFB86B', opacity: 0.6 }, door); el('rect', { x: 34, y: 40, width: 42, height: 5, rx: 2.5, fill: '#B7C0CC' }, door);
  const me = k.buddy({ x: 318, y: FY - 2, scale: 0.9, facing: -1 });
  const hat = g({}, me.body); el('path', { d: 'M -14 -78 L 0 -112 L 14 -78 Z', fill: pal.violet }, hat); el('circle', { cx: 0, cy: -112, r: 5, fill: pal.yellow }, hat);
  const she = k.buddy({ x: 60, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark });
  const TY = 212; const cl = cloth(k, 200, 380, TY, FY, '#FFFFFF', '#A58BF3');
  const C = cakeG(k);
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -4 -6 0 -12 q 4 -6 0 -12', stroke: '#fff', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const hs = [0, 1].map(() => heartG(k));
  const xf = (t) => lerp(60, 170, easeInOut(seg(t, 1.2, 2.6)));
  return {
    update(t) {
      const od = easeInOut(seg(t, 0.1, 0.6)) * (1 - easeInOut(seg(t, 1.1, 1.4)));
      // オーブンの扉が手前に倒れて開く（下辺を軸に縦につぶれる）
      door.setAttribute('transform', `translate(0 ${FY - 22}) scale(1 ${Math.max(0.05, 1 - 1.9 * od).toFixed(3)}) translate(0 ${-52})`);
      ovenIn.setAttribute('opacity', od > 0.1 ? 1 : 0.4);
      const w = walkTo(xf, t, 60), take = easeOut(seg(t, 0.5, 0.9));
      P(she, { x: w.x, walk: w.walk, lean: w.lean + 6 * hump(seg(t, 0.4, 1.0)), armR: lerp(8, 72, take), armL: -lerp(-8, 50, take), look: 0.7, mood: 'grin', blink: blinkAt(t, 1) });
      const h = hp(she, 0.95, 'R', 28), put = easeInOut(seg(t, 2.6, 3.1));
      const cx = lerp(h.x - 6, 248, put), cy = lerp(h.y + 6, TY, put);
      tf(C.g, t < 0.5 ? 50 : cx, t < 0.5 ? FY - 30 : cy, 0, 0.9);
      C.g.setAttribute('opacity', t < 0.35 ? 0 : 1);
      if (put > 0) she.pose({ armR: lerp(72, 40, put) });
      C.fl.forEach((f, i) => { tf(f, 0, 0, 0, 1, 1 + 0.2 * Math.sin(t * 15 + i)); f.setAttribute('opacity', t > 2.2 ? 1 : 0); });
      steam.forEach((s, i) => { const q = ((t * 0.8 + i / 3) % 1); tf(s, cx - 12 + i * 12, cy - 40 - 14 * q); s.setAttribute('opacity', t < 2.2 && t > 0.4 ? 0.8 * (1 - q) : 0); });
      P(me, { x: 318, y: FY - 2, facing: -1, armL: t > 3.1 ? 150 : 8, armR: t > 3.1 ? 150 : 8, lift: t > 3.1 ? 8 * Math.abs(Math.sin(t * 6)) : 0, look: 0.6, mood: t > 1.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      hs.forEach((n, i) => { const q = seg(t, 3.3 + i * 0.3, 4.5); tf(n, 280 + i * 30, FY - 130 - 20 * q, 0, Math.max(0.001, hump(q) * 1.4)); });
    }
  };
}
