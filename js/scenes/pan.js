// pan：フライパンの柄を持ち、油を少し注いで火にかけ、油が温まる（例文 Heat some oil in the pan.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, stove, P, blinkAt } from './jam.js';

export const meta = { duration: 4.2, beats: [[0, 'フライパン'], [0.8, '油を入れる'], [2.4, '火で温める']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const kit = kitchen(k);
  const b = k.buddy({ x: 150, y: kit.FY, scale: S });
  kit.front();
  const PX = 270;
  const sv = stove(k, PX, TOP, 120);
  // フライパン（横から：浅い皿形＋柄）
  el('path', { d: `M ${PX - 46} ${TOP - 20} L ${PX - 40} ${TOP - 6} L ${PX + 40} ${TOP - 6} L ${PX + 46} ${TOP - 20} Z`, fill: '#3E4655' });
  el('rect', { x: PX - 96, y: TOP - 20, width: 52, height: 7, rx: 3.5, fill: '#6E5A4C' });
  el('ellipse', { cx: PX, cy: TOP - 20, rx: 46, ry: 5, fill: '#262C36' });
  const oil = el('ellipse', { cx: PX + 4, cy: TOP - 20, rx: 0, ry: 2.6, fill: '#F2C14E', opacity: 0.9 });
  const shim = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -4 -6 0 -12 t 0 -12', stroke: '#F2C14E', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }));
  // 油のボトル（原点＝握り、口は上）
  const bt = k.g({});
  el('path', { d: 'M -8 18 L -8 -6 Q -8 -12 -3 -14 L -3 -22 L 3 -22 L 3 -14 Q 8 -12 8 -6 L 8 18 Z', fill: 'rgba(242,193,78,0.85)', stroke: '#E0A93A', 'stroke-width': 1.4 }, bt);
  el('rect', { x: -8, y: 0, width: 16, height: 8, fill: '#fff', opacity: 0.8 }, bt);
  const drip = el('path', { stroke: '#F2C14E', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  const A = arms(k, b, S, { back: [] });
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.2, 0.7)) * (1 - easeInOut(seg(t, 1.9, 2.2)));
      const tilt = easeInOut(seg(t, 0.7, 1.0)) * (1 - easeInOut(seg(t, 1.6, 1.9)));
      const spread = easeOut(seg(t, 0.9, 1.9));
      const heat = seg(t, 2.6, 3.4);
      P(b, { lean: 6, look: 0.6, blink: blinkAt(t), mood: t > 3.2 ? 'grin' : 'smile' });
      // 左手：フライパンの柄
      A.to('L', PX - 84, TOP - 17);
      const hx = lerp(206, 250, up), hy = lerp(TOP - 24, TOP - 64, up);
      A.to('R', hx, hy);
      k.tf(bt, hx, hy, 110 * tilt);
      const a = (110 * tilt * Math.PI) / 180, sx = hx + 22 * Math.sin(a), sy = hy - 22 * Math.cos(a);
      k.set(drip, { d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${sx.toFixed(1)} ${TOP - 21}`, opacity: tilt > 0.8 ? 1 : 0 });
      k.set(oil, { rx: 30 * spread, cx: lerp(sx, PX + 2, spread) });
      sv.set(easeOut(seg(t, 2.1, 2.4)), t);
      shim.forEach((s, i) => { const u = (t * 0.9 + i / 3) % 1; k.tf(s, PX - 20 + i * 20, TOP - 26 - u * 12); s.setAttribute('opacity', (heat * hump(u) * 0.8).toFixed(2)); });
      oil.setAttribute('fill', heat > 0.5 ? '#F7D774' : '#F2C14E');
    }
  };
}
