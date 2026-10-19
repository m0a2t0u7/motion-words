// fan：暑がる人に頼まれて、扇風機のスイッチを押すと羽根が回り、風が届いて涼しくなる（例文 Turn on the fan, please. It is hot.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '暑い…つけて'], [1.4, 'スイッチを押す'], [2.4, '風で涼しい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = homeBg(k, { winX: 160, winW: 90, sky: '#BFE4FA', curtain: '#F7D27A' });
  el('circle', { cx: 230, cy: 62, r: 14, fill: pal.yellow });
  // 扇風機（正面）
  const FX = 200, HY = 132;
  k.shadow(FX, FY + 1, 34, 5);
  el('ellipse', { cx: FX, cy: FY - 4, rx: 30, ry: 8, fill: '#C9D2DE' });
  el('rect', { x: FX - 4, y: HY, width: 8, height: FY - HY - 6, fill: '#AEB7C4' });
  const btn = el('rect', { x: FX + 12, y: FY - 10, width: 10, height: 5, rx: 2, fill: pal.green });
  el('circle', { cx: FX, cy: HY, r: 40, fill: '#EAF4FB', stroke: '#C9D2DE', 'stroke-width': 3 });
  const blades = g({}); tf(blades, FX, HY);
  [0, 120, 240].forEach((a) => el('path', { d: 'M 0 0 Q 10 -12 6 -34 Q -8 -30 -6 -10 Z', fill: '#9CC3F0', opacity: 0.9, transform: `rotate(${a})` }, blades));
  const blur = el('circle', { cx: FX, cy: HY, r: 34, fill: '#9CC3F0', opacity: 0 });
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; el('line', { x1: FX, y1: HY, x2: FX + Math.cos(a) * 40, y2: HY + Math.sin(a) * 40, stroke: '#C9D2DE', 'stroke-width': 1.2 }); }
  el('circle', { cx: FX, cy: HY, r: 7, fill: '#7FAEE6' });
  const winds = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 14 -6 28 0 t 28 0', fill: 'none', stroke: '#8FD3F4', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const her = k.buddy({ x: 320, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 120, y: FY, scale: 0.86 });
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water }));
  const ask = cue(k, 'Fan?', 58, 28, 1, 13);
  return {
    update(t) {
      const on = t > 1.7, spin = easeIn(seg(t, 1.7, 2.4));
      const ang = 900 * Math.pow(seg(t, 1.7, 4.4), 1.4) * 1.4;
      tf(blades, FX, HY, ang);
      blur.setAttribute('opacity', 0.35 * spin);
      const cool = easeOut(seg(t, 2.4, 3.2));
      const fanP = (Math.sin(t * 3) + 1) / 2;
      P(her, { x: 320, facing: -1, armR: lerp(110 + 30 * Math.sin(t * 14), 8, cool), armL: 8, look: -0.6, squash: lerp(0.95, 1, cool), mood: talk(t, 0.3, 1.3) || (cool > 0.5 ? 'grin' : 'flat'), blink: cool > 0.5 && t > 3.6 ? 1 : blinkAt(t), lean: -4 * cool });
      sweat.forEach((s, i) => { const q = ((t * 0.9 + i * 0.5) % 1); tf(s, 300 + i * 34, FY - 80 + 22 * q, 0, 1); s.setAttribute('opacity', (1 - cool) * Math.sin(q * Math.PI)); });
      ask.show(seg(t, 0.3, 0.6) * (1 - seg(t, 1.6, 1.9)), 300, FY - 110);
      const press = easeInOut(seg(t, 1.1, 1.5)) * (1 - easeInOut(seg(t, 1.8, 2.2)));
      const mp = { x: lerp(120, 146, easeInOut(seg(t, 0.6, 1.1))), look: 0.6, blink: blinkAt(t, 1), mood: 'smile', lean: 16 * press, squash: 1 - 0.06 * press };
      P(me, mp);
      P(me, { ...mp, armR: lerp(8, reach(me, 0.86, 'R', FX + 17, FY - 9), press) });
      k.set(btn, { y: FY - 10 + 2 * hump(seg(t, 1.45, 1.75)), fill: on ? pal.green : '#AEB7C4' });
      winds.forEach((w, i) => { const q = ((t - 2.0) * 0.9 + i * 0.33) % 1; tf(w, FX + 30 + q * 50, HY - 20 + i * 20); w.setAttribute('opacity', t > 2.0 ? Math.sin(q * Math.PI) * 0.9 : 0); });
    }
  };
}
