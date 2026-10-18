// argue：二人がお金のことで言い合い、月が動き時計が進んで一晩中続く（例文 They argued about money all night.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { bubble } from './weigh.js';
const rad = (d) => (d * Math.PI) / 180;

export const meta = { duration: 4.4, beats: [[0, '言い合い始め'], [1.8, '白熱する'], [3.8, '夜通し']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓：空が暗く、月が横切る
  const wc = k.clip((c) => el('rect', { x: 150, y: 40, width: 100, height: 70, rx: 5 }, c));
  const sky = g({}); sky.setAttribute('clip-path', wc);
  el('rect', { x: 150, y: 40, width: 100, height: 70, fill: k.gradient([[0, '#3E4A78'], [1, '#6A79A8']]) }, sky);
  [[165, 55], [190, 70], [232, 58], [215, 95], [172, 98]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.6, fill: '#fff', opacity: 0.8 }, sky));
  const moon = g({}, sky);
  el('circle', { r: 9, fill: '#F4F0DC' }, moon); el('circle', { cx: 4, cy: -2, r: 8, fill: '#5A6894' }, moon);
  el('rect', { x: 150, y: 40, width: 100, height: 70, rx: 5, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 40, x2: 200, y2: 110, stroke: '#fff', 'stroke-width': 3 });
  // 時計
  const clk = g({}); tf(clk, 330, 78);
  el('circle', { r: 22, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, clk);
  for (let i = 0; i < 12; i++) { const a = rad(i * 30); el('line', { x1: Math.sin(a) * 17, y1: -Math.cos(a) * 17, x2: Math.sin(a) * 19.5, y2: -Math.cos(a) * 19.5, stroke: pal.sub, 'stroke-width': 1.6 }, clk); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -11, stroke: pal.ink, 'stroke-width': 3.2, 'stroke-linecap': 'round' }, clk);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -16, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, clk);
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const A = k.buddy({ x: 120, y: FY, facing: 1 });
  const B = k.buddy({ x: 280, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const mkB = (c) => {
    const b = bubble(k, 46, 40);
    el('circle', { r: 12, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, b);
    k.text(0, 1, '$', { 'font-size': 16, fill: pal.yellowDark }, b);
    return b;
  };
  const bub = [mkB(), mkB()];
  const mkMad = () => el('path', { d: 'M -7 -3 Q -3 -3 -3 -7 M 7 -3 Q 3 -3 3 -7 M -7 3 Q -3 3 -3 7 M 7 3 Q 3 3 3 7', stroke: pal.red, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' });
  const mad = [mkMad(), mkMad()];
  return {
    update(t) {
      const tt = t - 0.3, on = tt > 0 && t < 4.0;
      const idx = Math.floor(Math.max(0, tt) / 0.62), p = (Math.max(0, tt) % 0.62) / 0.62, sp = idx % 2;
      const heat = easeOut(seg(t, 0.3, 2.0));
      const sway = (s) => (on && sp === s ? 1 : 0);
      [A, B].forEach((b, i) => {
        const s = sway(i), w = Math.sin(t * 17 + i * 2);
        const dir = i ? -1 : 1;
        P(b, {
          armR: s ? 70 + 35 * w * heat : 25 + 10 * heat * Math.sin(t * 9), armL: s ? -20 - 25 * heat * Math.abs(w) : 8 + 12 * heat * Math.sin(t * 8 + 1),
          lean: s ? 9 * heat : -4 * heat, mood: s ? 'open' : t > 4.0 ? 'sad' : 'flat', look: 0.5 - 0.2 * s,
          squash: 1 - (s ? 0.04 * Math.abs(w) * heat : 0), x: (i ? 280 : 120) - dir * 8 * heat
        });
      });
      bub.forEach((b, i) => {
        const s = sway(i) ? backOut(seg(p, 0, 0.25)) * (1 - seg(p, 0.85, 1)) : 0;
        tf(b, i ? 262 : 138, 112 - 4 * Math.sin(t * 8), (i ? 6 : -6) * Math.sin(t * 10), Math.max(0.001, s));
      });
      mad.forEach((m, i) => tf(m, i ? 292 : 108, 140 + 2 * Math.sin(t * 15), 0, heat * (0.9 + 0.25 * Math.abs(Math.sin(t * 9 + i))) + 0.001));
      // 月と時計：夜通しの時間経過
      const q = easeInOut(seg(t, 0.2, 4.3));
      tf(moon, lerp(162, 240, q), lerp(92, 62, hump(q)) + 0 * q);
      const mn = q * 360 * 7, hr = 300 + q * 140;
      tf(hh, 0, 0, hr); tf(mh, 0, 0, mn);
    }
  };
}
