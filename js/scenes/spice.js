// spice：カレーの鍋に、まめが色のちがうスパイスのびんを次々とふり入れ、カレーの色と香りが深まる（例文 Curry has many different spices.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { kitchen, jarG } from './flour.js';
import { stoveTop } from './oil.js';

export const meta = { duration: 4.6, beats: [[0, 'カレーの鍋'], [0.8, 'スパイスを次々'], [3.6, 'いろんな香り']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const R = kitchen(k), TY = R.TY, MY = TY + 22;
  const me = k.buddy({ x: 140, y: MY, scale: S });
  R.front();
  const st = stoveTop(k, 250, TY);
  const pg = g({}); tf(pg, 250, TY - 4);
  el('path', { d: 'M -28 -36 H 28 V -4 Q 28 0 24 0 H -24 Q -28 0 -28 -4 Z', fill: '#E86F57' }, pg);
  el('rect', { x: -37, y: -30, width: 9, height: 5, rx: 2.5, fill: pal.ink }, pg); el('rect', { x: 28, y: -30, width: 9, height: 5, rx: 2.5, fill: pal.ink }, pg);
  el('ellipse', { cx: 0, cy: -36, rx: 28, ry: 5, fill: '#C9533D' }, pg);
  const curry = el('ellipse', { cx: 0, cy: -36, rx: 25, ry: 3.8, fill: '#F2C14E' }, pg);
  const cols = [['#F2C14E', '#E0A12A'], ['#E8574A', '#C9403A'], ['#8A5A3C', '#6B3F2A'], ['#59A85F', '#3E8E4A']];
  const rack = cols.map(([c], i) => { const j = jarG(k, undefined, c, '#5E6778', 16, 20); tf(j, 300 + i * 22, TY); return j; });
  const hand = cols.map(([c]) => jarG(k, undefined, c, '#5E6778', 16, 20));
  const dust = Array.from({ length: 6 }, () => el('circle', { r: 1.8 }));
  const aroma = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -6 -8 0 -16 q 6 -8 0 -16', stroke: pal.coral, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const curryC = ['#F2C14E', '#E9A63A', '#D9862E', '#B9702A', '#A0602A'];
  return {
    update(t) {
      st.fire(1, t);
      const per = 0.7, t0 = 0.8, i = clamp(Math.floor((t - t0) / per), 0, 3), q = clamp((t - t0) / per - i), on = t > t0 && t < t0 + per * 4;
      P(me, { x: 140, y: MY, look: 0.7, mood: t > 3.6 ? 'grin' : 'smile', blink: t > 3.8 ? 0.8 : blinkAt(t), lean: on ? 5 : 0 });
      const shake = on && q > 0.35 && q < 0.85 ? Math.sin(t * 40) * 6 : 0;
      const tg = on ? (q < 0.3 ? { x: lerp(300 + i * 22, 238, easeInOut(q / 0.3)), y: lerp(TY - 10, TY - 70, easeInOut(q / 0.3)) } : q > 0.85 ? { x: lerp(238, 300 + i * 22, easeInOut((q - 0.85) / 0.15)), y: lerp(TY - 70, TY - 10, easeInOut((q - 0.85) / 0.15)) } : { x: 238, y: TY - 70 }) : { x: 200, y: TY - 30 };
      me.pose({ armR: reach(me, S, 'R', tg.x, tg.y) });
      const h = hp(me, S, 'R', 28), tilt = on && q > 0.3 && q < 0.85 ? 150 + shake : 0;
      hand.forEach((j, n) => { j.setAttribute('opacity', on && n === i ? 1 : 0); if (n === i) tf(j, h.x, h.y + 10, tilt, S, S); });
      rack.forEach((j, n) => j.setAttribute('opacity', on && n === i ? 0 : 1));
      dust.forEach((d, n) => { const dq = ((t * 3 + n / 6) % 1); k.set(d, { cx: h.x + 4 + (n % 3 - 1) * 4, cy: h.y + 26 + 30 * dq, fill: cols[i][0], opacity: on && q > 0.35 && q < 0.85 ? 1 - dq : 0 }); });
      const lvl = clamp((t - t0) / per, 0, 4); k.set(curry, { fill: curryC[Math.min(4, Math.round(lvl))] });
      aroma.forEach((a, n) => { const aq = ((t * 0.7 + n / 3) % 1); tf(a, 236 + n * 14, TY - 46 - 30 * aq); a.setAttribute('opacity', clamp(lvl / 4) * 0.8 * hump(aq)); });
    }
  };
}
