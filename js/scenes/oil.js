// oil：まめがフライパンに油を注ぎ、コンロの火をつけると、油がゆらゆらと熱くなる（例文 Heat the oil in a pan.）
// このファイルはコンロのヘルパーも書き出す（stoveTop / panG / pourFrom）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { kitchen } from './flour.js';

// コンロ（カウンター上、原点＝五徳の中央）。fire(強さ 0..1, t)
export function stoveTop(k, x, TY) {
  const g = k.g({}), { el, pal } = k;
  k.tf(g, x, TY);
  el('rect', { x: -52, y: -6, width: 104, height: 8, rx: 3, fill: '#3E4554' }, g);
  el('rect', { x: -52, y: 2, width: 104, height: 12, rx: 2, fill: '#5E6778' }, g);
  const knob = k.g({}, g); k.tf(knob, 38, 8); el('circle', { r: 4.5, fill: '#D9DFE7' }, knob); el('rect', { x: -1, y: -4.5, width: 2, height: 5, fill: pal.ink }, knob);
  const fl = [-14, -5, 5, 14].map((dx) => el('path', { d: `M ${dx - 4} -6 Q ${dx} -18 ${dx + 4} -6 Z`, fill: '#5AA9F7' }, g));
  return { g, knob, fire(p, t) { fl.forEach((f, i) => { k.tf(f, 0, 0, 0, 1, Math.max(0.001, p * (0.8 + 0.25 * Math.sin(t * 20 + i * 2)))); f.setAttribute('opacity', p > 0.02 ? 0.9 : 0); }); } };
}
// フライパン（原点＝底の中央、取っ手は左）。oil に油を入れる
export function panG(k, parent, w = 80) {
  const g = k.g({}, parent), { el } = k;
  el('rect', { x: -w / 2 - 42, y: -12, width: 44, height: 7, rx: 3.5, fill: '#2A3242', transform: `rotate(-8 ${-w / 2} -9)` }, g);
  el('path', { d: `M ${-w / 2} -14 L ${w / 2} -14 L ${w / 2 - 6} 0 L ${-w / 2 + 6} 0 Z`, fill: '#4A5160' }, g);
  const inner = k.g({}, g);
  el('ellipse', { cx: 0, cy: -14, rx: w / 2, ry: 5, fill: '#353B48' }, g);
  const oil = el('ellipse', { cx: 0, cy: -14, rx: 1, ry: 1, fill: '#F2C14E', opacity: 0.85 }, g);
  return { g, oil, inner };
}
// 傾けた容器の口のワールド座標（node を手先に置いた前提、mouth＝口のローカル座標）
export function pourFrom(h, rot, mouth, s = 1) {
  const a = (rot * Math.PI) / 180;
  return { x: h.x + (mouth.x * Math.cos(a) - mouth.y * Math.sin(a)) * s, y: h.y + (mouth.x * Math.sin(a) + mouth.y * Math.cos(a)) * s };
}

export const meta = { duration: 4.4, beats: [[0, '油を注ぐ'], [1.8, '火をつける'], [2.6, '油が熱くなる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const R = kitchen(k), TY = R.TY, MY = TY + 22;
  const me = k.buddy({ x: 130, y: MY, scale: S });
  R.front();
  const st = stoveTop(k, 250, TY);
  const pan = panG(k); tf(pan.g, 250, TY - 6);
  // 油のびん（原点＝握り、口は上）
  const bot = g({});
  el('path', { d: 'M -9 -20 L 9 -20 L 9 18 Q 9 22 5 22 L -5 22 Q -9 22 -9 18 Z', fill: '#FFE08A', stroke: '#E9B43A', 'stroke-width': 1.5 }, bot);
  el('path', { d: 'M -4 -32 L 4 -32 L 6 -20 L -6 -20 Z', fill: '#FFE08A', stroke: '#E9B43A', 'stroke-width': 1.5 }, bot);
  el('rect', { x: -5, y: -37, width: 10, height: 6, rx: 1.5, fill: '#59C27A' }, bot);
  el('rect', { x: -7, y: -6, width: 14, height: 12, rx: 2, fill: '#fff', opacity: 0.8 }, bot);
  const stream = el('path', { stroke: '#F2C14E', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -4 -6 0 -12 q 4 -6 0 -12', stroke: '#E9B43A', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }));
  const glints = [0, 1, 2, 3].map(() => el('circle', { r: 1.6, fill: '#fff' }));
  return {
    update(t) {
      const lift = easeInOut(seg(t, 0.2, 0.7)) * (1 - easeInOut(seg(t, 1.6, 1.9)));
      const tilt = easeInOut(seg(t, 0.6, 0.9)) * (1 - easeInOut(seg(t, 1.4, 1.6)));
      const knobP = easeInOut(seg(t, 1.9, 2.3)) * (1 - easeInOut(seg(t, 2.4, 2.7)));
      P(me, { x: 130, y: MY, look: 0.7, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t), lean: 6 * Math.max(lift, knobP) });
      me.pose({ armR: lerp(lerp(30, reach(me, S, 'R', 222, TY - 52), lift), reach(me, S, 'R', 288, TY + 6), knobP) });
      const h = hp(me, S, 'R', 28), rot = 110 * tilt;
      tf(bot, h.x, h.y - 4, rot, S * 0.95); bot.setAttribute('opacity', t < 1.95 ? 1 : 0);
      const m = pourFrom({ x: h.x, y: h.y - 4 }, rot, { x: 0, y: -36 }, S * 0.95);
      const pouring = tilt > 0.85;
      k.set(stream, { d: `M ${m.x} ${m.y} Q ${m.x + 4} ${(m.y + TY - 20) / 2} ${m.x + 2} ${TY - 20}`, opacity: pouring ? 1 : 0 });
      const amt = easeOut(seg(t, 0.95, 1.5));
      k.set(pan.oil, { rx: Math.max(1, 30 * amt), ry: Math.max(1, 3.6 * amt), opacity: amt > 0.02 ? 0.9 : 0 });
      const on = t > 2.2, heat = easeInOut(seg(t, 2.3, 3.6));
      tf(st.knob, 38, 8, on ? 90 : 0); st.fire(on ? easeOut(seg(t, 2.2, 2.5)) : 0, t);
      k.set(pan.oil, { fill: heat > 0.5 ? '#F5B83A' : '#F2C14E' });
      waves.forEach((w, i) => { const q = ((t * 0.9 + i / 3) % 1); tf(w, 236 + i * 14, TY - 24 - 18 * q); w.setAttribute('opacity', heat * 0.8 * hump(q)); });
      glints.forEach((n, i) => { const q = ((t * 2.2 + i * 0.27) % 1); k.set(n, { cx: 232 + i * 12, cy: TY - 20 + Math.sin(i) * 1.5, r: 1 + 1.4 * hump(q), opacity: heat > 0.3 ? hump(q) : 0 }); });
    }
  };
}
