// wound：腕の傷を医者が綿で消毒。汚れた赤い傷がきれいになる（例文 The doctor cleaned the wound on his arm.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, hp, coat, clinicBg, bottle } from './hospital.js';

export const meta = { duration: 4.2, beats: [[0, '腕に傷'], [1.2, '傷をふく'], [3.2, 'きれいになった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = clinicBg(k, 240);
  // 台と消毒びん
  el('rect', { x: 186, y: 192, width: 52, height: 9, rx: 4, fill: '#9CC7F2' });
  el('rect', { x: 207, y: 201, width: 8, height: FY - 201, fill: '#B8C3D2' });
  el('rect', { x: 300, y: 150, width: 92, height: 8, rx: 3, fill: '#D9E1EA' });
  el('rect', { x: 382, y: 158, width: 6, height: FY - 158, fill: '#B8C3D2' });
  bottle(k, null, '#A9D8F0').setAttribute('transform', 'translate(372 150) scale(0.9)');
  const S = 1.0;
  const me = k.buddy({ x: 120, y: FY, scale: S });
  // 腕の傷（腕の中ほど、腕のグループ内）
  const wnd = g({}, me.armR.a);
  const cut = el('path', { d: 'M -4 9 L 4 19', stroke: '#C8402F', 'stroke-width': 3.4, 'stroke-linecap': 'round' }, wnd);
  const halo = el('ellipse', { cx: 0, cy: 14, rx: 6, ry: 8, fill: '#E86F57', opacity: 0.5 }, wnd);
  const dirt = [[-3, 11], [3, 16], [-2, 18], [2, 9]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 1.4, fill: '#7A5A3C' }, wnd));
  wnd.parentNode.appendChild(wnd);
  const doc = k.buddy({ x: 286, y: FY, scale: 0.94, facing: -1, color: pal.coral, dark: pal.coralDark });
  coat(k, doc);
  // ピンセットと綿
  const tw = g({});
  el('path', { d: 'M 0 0 L 26 -2 M 0 0 L 26 3', stroke: '#9AA6B6', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, tw);
  const cotton = el('circle', { cx: 0, cy: 0, r: 5.5, fill: '#fff', stroke: '#DCE3EC', 'stroke-width': 1.5 }, tw);
  const spark = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 L 1.5 -1.5 L 6 0 L 1.5 1.5 L 0 6 L -1.5 1.5 L -6 0 L -1.5 -1.5 Z', fill: pal.yellow }));
  return {
    update(t) {
      P(me, { armR: lerp(8, 84, easeInOut(seg(t, 0.1, 0.6))), look: 0.7, mood: t < 1.1 ? 'sad' : t < 3.0 ? 'flat' : 'grin', blink: t > 1.3 && t < 2.9 ? 0.6 : 0 });
      const site = hp(me, S, 'R', 14);
      const app = easeInOut(seg(t, 0.5, 1.2)), away = easeInOut(seg(t, 3.0, 3.5));
      P(doc, { x: lerp(300, 270, app) + 16 * away, walk: (app - away) * 3, facing: -1, look: 0.5, mood: 'smile', lean: 10 * app * (1 - away) });
      // こする（左右に往復）
      const rub = t > 1.3 && t < 3.0 ? Math.sin((t - 1.3) * 16) * 5 : 0;
      const tip = { x: lerp(site.x + 40, site.x + rub, app * (1 - away)), y: lerp(site.y - 30, site.y - 2, app * (1 - away)) };
      const grip = { x: tip.x + 26, y: tip.y };
      P(doc, { ...doc.state, armR: reach(doc, 0.94, 'R', grip.x, grip.y) });
      const h = hp(doc, 0.94, 'R', 28);
      tf(tw, h.x - 26, h.y, 0, 1);
      const cl = easeInOut(seg(t, 1.4, 2.9));
      k.set(cotton, { fill: `rgb(255,${Math.round(255 - 70 * cl)},${Math.round(255 - 80 * cl)})` });
      dirt.forEach((d, i) => d.setAttribute('opacity', 1 - seg(cl, i * 0.2, i * 0.2 + 0.3)));
      k.set(cut, { stroke: cl > 0.5 ? '#E2897C' : '#C8402F', 'stroke-width': lerp(3.4, 2.2, cl) });
      halo.setAttribute('opacity', 0.5 * (1 - cl));
      spark.forEach((s, i) => { const q = seg(t, 3.0 + i * 0.15, 3.8 + i * 0.12); tf(s, site.x + [-14, 10, 2][i], site.y - 14 - 14 * q + [0, 6, -8][i], q * 90, hump(q) + 0.001); });
    }
  };
}
