// calculate：相手に頼まれたまめが、電卓のボタンを押して合計を出す（例文 Can you calculate the total cost?）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, '合計は？'], [1.4, '電卓を押す'], [4.0, '答えが出た']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 44, width: 70, height: 60, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 75, y1: 44, x2: 75, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  const S = 1.0;
  const ask = k.buddy({ x: 356, y: FY, scale: 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  // レシート
  const rc = g({}); tf(rc, 262, 176);
  el('path', { d: 'M -26 24 V -30 h 52 V 24 l -6.5 -4 -6.5 4 -6.5 -4 -6.5 4 -6.5 -4 -6.5 4 -6.5 -4 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.6 }, rc);
  [[-20, 36], [-12, 30], [-4, 34]].forEach(([y, w]) => { el('line', { x1: -18, x2: -18 + w * 0.5, y1: y, y2: y, stroke: pal.sub, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, rc); el('text', { x: 17, y: y + 3, 'font-size': 9, 'font-weight': 800, fill: pal.ink, 'text-anchor': 'end', 'font-family': 'Nunito, sans-serif' }, rc).textContent = ['120', '80', '250'][[-20, -12, -4].indexOf(y)]; });
  const me = k.buddy({ x: 120, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  // 電卓
  const CX = 196, CY = 192;
  const calc = g({}); tf(calc, CX, CY);
  el('rect', { x: -18, y: -30, width: 36, height: 44, rx: 6, fill: '#C9D3DF', stroke: '#9AA6B6', 'stroke-width': 1.5 }, calc);
  el('rect', { x: -14, y: -26, width: 28, height: 11, rx: 2.5, fill: '#2A3242' }, calc);
  const disp = k.text(12, -20, '0', { 'font-size': 9, fill: '#7CF0B0', 'text-anchor': 'end' }, calc);
  const btn = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) btn.push(el('rect', { x: -14 + c * 10, y: -10 + r * 8, width: 8, height: 6, rx: 1.6, fill: '#fff' }, calc));
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const q = g({});
  el('rect', { x: -14, y: -14, width: 28, height: 24, rx: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, q);
  k.text(0, -2, '?', { 'font-size': 16, fill: pal.coralDark }, q);
  const seq = [[1.6, '1'], [2.1, '12'], [2.6, '120'], [3.0, '200'], [3.4, '450']];
  const OFFS = [[-10, -10], [0, -2], [10, -10], [0, 6], [-10, 6]];

  return {
    update(t) {
      const qa = seg(t, 0.2, 0.6) * (1 - seg(t, 3.9, 4.2));
      tf(q, 330, 118 - 4 * Math.sin(t * 4), 0, backOut(seg(t, 0.2, 0.7)) * (1 - seg(t, 3.8, 4.1)) + 0.001);
      const tapN = Math.floor((t - 1.6) / 0.45);
      const ph = t >= 1.5 && t < 3.7 ? ((t - 1.5) % 0.45) / 0.45 : 1;
      const idx = Math.max(0, Math.min(OFFS.length - 1, tapN));
      const bt = btn[(Math.max(0, tapN)) % 9];
      const o = OFFS[idx % OFFS.length];
      const tx = CX + o[0], ty = CY + o[1] - 4 - 12 * hump(Math.min(1, ph * 1.0));
      const act = easeInOut(seg(t, 0.8, 1.4)) * (1 - seg(t, 3.8, 4.4));
      me.pose({ x: 120, armL: 8, lean: 3 + 3 * act, look: 0.5, mood: t > 4.0 ? 'grin' : 'smile', squash: 1, armR: 30 });
      const a = lerp(30, reach(me, S, 'R', tx, ty), act);
      me.pose({ armR: a });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      let s = '0';
      seq.forEach(([tt, v]) => { if (t >= tt) s = v; });
      disp.textContent = s;
      btn.forEach((b, i) => b.setAttribute('fill', t >= 1.5 && t < 3.7 && i === (Math.max(0, tapN)) % 9 && ph < 0.4 ? pal.yellow : '#fff'));
      ask.pose({ lean: 5 * seg(t, 0.1, 0.5) - 4 * seg(t, 4.0, 4.4), look: 0.6, armR: 8 + 100 * hump(seg(t, 4.0, 4.9)), mood: t > 4.0 ? 'grin' : 'smile', squash: 1 });
    }
  };
}
