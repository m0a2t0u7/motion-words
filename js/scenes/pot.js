// pot：大きな深鍋に水を入れて火にかけ、ぐらぐら沸かす（例文 Boil water in a big pot.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, potP, stove, bubbles, steam, P, blinkAt } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, '水を入れる'], [1.8, '火をつける'], [3.0, '沸いた']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const kit = kitchen(k);
  const b = k.buddy({ x: 150, y: kit.FY, scale: S });
  kit.front();
  const PX = 262, PW = 96, PH = 70;
  const sv = stove(k, PX, TOP, 130);
  k.tf(potP(k, undefined, PW, PH), PX, TOP - 5);
  const water = el('ellipse', { cx: PX, rx: PW / 2 - 4, ry: 4, fill: pal.water });
  const bub = bubbles(k, 8);
  const st = steam(k, undefined, 4, 34);
  // やかん（原点＝取っ手の握り、注ぎ口は右）
  const kt = k.g({});
  el('path', { d: 'M -14 26 Q -16 6 0 4 Q 16 6 14 26 Z', fill: '#E86F57' }, kt);
  el('path', { d: 'M -8 4 Q 0 -6 8 4', stroke: '#6D7889', 'stroke-width': 4, fill: 'none' }, kt);
  el('path', { d: 'M 12 16 L 28 6', stroke: '#E86F57', 'stroke-width': 5, 'stroke-linecap': 'round' }, kt);
  const stream = el('path', { stroke: pal.water, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  const knob = el('circle', { cx: PX - 52, cy: TOP + 14, r: 6, fill: '#3A4250' });
  const A = arms(k, b, S, { back: ['L'] });
  return {
    update(t) {
      const tilt = easeInOut(seg(t, 0.5, 0.8)) * (1 - easeInOut(seg(t, 1.5, 1.8)));
      const lvl = easeInOut(seg(t, 0.7, 1.6));
      const on = easeOut(seg(t, 2.0, 2.3));
      const boil = seg(t, 2.6, 3.4);
      P(b, { lean: 6, look: 0.6, blink: blinkAt(t), mood: t > 3.2 ? 'grin' : 'smile' });
      // 右手：やかんを持ち上げて注ぐ → 下ろして、つまみを回す
      const up = easeInOut(seg(t, 0.1, 0.5)) * (1 - easeInOut(seg(t, 1.6, 1.9)));
      const hx = lerp(196, 214, up), hy = lerp(TOP - 34, TOP - 104, up);
      const kn = easeInOut(seg(t, 1.9, 2.1)) * (1 - easeInOut(seg(t, 2.4, 2.7)));
      if (t < 1.9) { A.to('R', hx, hy); k.tf(kt, hx, hy, 40 * tilt); }
      else { A.to('R', lerp(196, PX - 52, kn), lerp(TOP - 34, TOP + 8, kn)); k.tf(kt, 196, TOP - 34); }
      knob.setAttribute('transform', `rotate(${(90 * on).toFixed(1)} ${PX - 52} ${TOP + 14})`);
      const a = (40 * tilt * Math.PI) / 180, sx = hx + 28 * Math.cos(a) - 6 * Math.sin(a), sy = hy + 28 * Math.sin(a) + 6 * Math.cos(a);
      const wy = TOP - 5 - 10 - (PH - 18) * lvl;
      k.set(stream, { d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${sx + 18} ${sy} ${sx + 22} ${wy}`, opacity: tilt > 0.85 ? 1 : 0 });
      k.set(water, { cy: TOP - 5 - PH + 2, opacity: lvl > 0.05 ? 1 : 0, rx: (PW / 2 - 4) * (0.6 + 0.4 * lvl) });
      sv.set(on, t);
      bub(boil, t, PX, TOP - 5 - PH + 2, PW - 20);
      st.set(PX, TOP - 5 - PH - 4, boil, t);
      A.to('L', 120, TOP + 4);
    }
  };
}
