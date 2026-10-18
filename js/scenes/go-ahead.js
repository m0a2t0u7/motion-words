// go ahead：「始めていい？」と聞くまめに、相手が「どうぞ」と手で前を示し、まめがスタートボタンを押して作業を始める（例文 "Can I start now?" "Sure, go ahead."）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { reach, bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '始めていい？'], [1.4, 'どうぞ'], [2.8, '始める']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 機械（ベルトコンベア付きの装置）
  el('rect', { x: 180, y: 120, width: 120, height: 116, rx: 10, fill: '#C9D3E0' });
  el('rect', { x: 192, y: 132, width: 96, height: 46, rx: 6, fill: '#2F3A4D' });
  const lamp = el('circle', { cx: 284, cy: 112, r: 9, fill: pal.red });
  el('rect', { x: 280, y: 112, width: 8, height: 10, fill: '#8F9BB0' });
  const btnBase = el('rect', { x: 198, y: 190, width: 30, height: 14, rx: 4, fill: '#8F9BB0' });
  const btn = el('rect', { x: 202, y: 184, width: 22, height: 10, rx: 4, fill: pal.green });
  const gear = g({}); tf(gear, 240, 155);
  for (let i = 0; i < 8; i++) el('rect', { x: -3, y: -16, width: 6, height: 8, fill: pal.yellow, transform: `rotate(${i * 45})` }, gear);
  el('circle', { r: 11, fill: pal.yellow }, gear); el('circle', { r: 4, fill: '#2F3A4D' }, gear);
  k.shadow(240, 237, 64, 5);
  const S = 0.85;
  const a = k.buddy({ x: 130, y: FY, scale: S });
  const c = k.buddy({ x: 344, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const q = bubble(k, 40, 34); k.text(0, 1, '?', { 'font-size': 22, fill: pal.blueDark }, q);
  const okb = bubble(k, 40, 34); el('path', { d: 'M -9 0 l 6 6 l 12 -12', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, okb);
  return {
    update(t) {
      const ask = seg(t, 0.2, 0.6) * (1 - seg(t, 1.6, 1.9));
      tf(q, 112, 100 - 6 * easeOut(seg(t, 0.2, 0.6)), 0, ask); q.setAttribute('opacity', ask > 0 ? 1 : 0);
      // 相手：うなずき＋手のひらで「どうぞ」と前へ流す
      const nod = hump(seg(t, 1.3, 1.6)) + hump(seg(t, 1.6, 1.9)) * 0.6;
      const sweep = easeInOut(seg(t, 1.5, 2.1)) * (1 - easeInOut(seg(t, 2.8, 3.3)));
      P(c, { x: 344, facing: -1, lean: 8 * nod + 6 * sweep, armR: lerp(8, 70, sweep) + 20 * Math.sin(seg(t, 1.5, 2.1) * Math.PI), look: 0.6, mood: t > 1.3 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      const okq = seg(t, 1.4, 1.7) * (1 - seg(t, 2.6, 2.9));
      tf(okb, 362, 96, 0, -okq, okq); okb.setAttribute('opacity', okq > 0 ? 1 : 0);
      // まめ：手を挙げて聞く→ボタンを押す
      const raise = easeOut(seg(t, 0.1, 0.5)) * (1 - easeInOut(seg(t, 1.4, 1.8)));
      P(a, { x: 130, look: 0.6, armL: lerp(8, 160, raise), armR: 8, lean: 0, mood: 'smile', blink: blinkAt(t) });
      const pr = easeInOut(seg(t, 2.2, 2.6)), back = easeInOut(seg(t, 2.9, 3.3));
      const press = 2 * hump(seg(t, 2.55, 2.85));
      const tgt = reach(a, S, 'R', 213, 186 + press);
      P(a, { x: 130, look: 0.6, armL: lerp(8, 160, raise), armR: lerp(8, lerp(tgt, 20, back), pr), lean: 8 * pr * (1 - back), mood: t > 2.7 ? 'grin' : 'smile', blink: blinkAt(t) });
      const on = t > 2.65;
      tf(btn, 0, on ? 3 * (1 - seg(t, 2.8, 3.0)) : 0);
      lamp.setAttribute('fill', on ? pal.green : pal.red);
      gear.setAttribute('transform', `translate(240 155) rotate(${on ? ((t - 2.65) ** 2 * 40 + (t - 2.65) * 60).toFixed(1) : 0})`);
    }
  };
}
