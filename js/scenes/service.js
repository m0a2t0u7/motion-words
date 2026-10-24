// service：料理はおいしいが、接客（ウェイター）がとても遅く、客が待つ（例文 The food was good, but the service was slow.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.4, beats: [[0, '料理は好評'], [1.6, '待たされる'], [3.4, '接客が遅い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  el('rect', { x: 60, y: 180, width: 110, height: 8, rx: 3, fill: pal.wood }); el('rect', { x: 110, y: 188, width: 10, height: FY - 188, fill: pal.woodDark });
  const fd = em('🍜', 36); tf(fd, 115, 162);
  const th = em('⭐', 26), ck = g({});
  el('circle', { r: 22, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, ck); const ha = el('line', { x1: 0, y1: 0, x2: 0, y2: -15, stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, ck);
  const hb = g({}, ck); el('line', { x1: 0, y1: 0, x2: 0, y2: -10, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, hb);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const w = k.buddy({ x: 370, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const tray = g({}); el('rect', { x: -18, y: -3, width: 36, height: 6, rx: 3, fill: '#C9D1D9' }, tray); em('🥤', 22, tray).setAttribute('transform', 'translate(0,-14)');
  return { update(t) {
    const x = lerp(370, 320, easeInOut(seg(t, 0.8, 4.2)));
    w.pose({ x, y: FY, facing: -1, armL: 8, armR: 85, lean: 0, squash: 1, walk: Math.sin(t * 2.2) * 0.5 * seg(t, 0.8, 4.2), look: 0, mood: 'smile', blink: blinkAt(t, 1), lift: 0 });
    const h = hp(w, S, 'R'); tf(tray, h.x - 4, h.y);
    const tap = Math.max(0, Math.sin(t * 9)) * 5;
    P(b, { look: 0.3, armR: t > 1.4 ? 60 : 8, armL: t > 1.4 ? 55 : 8, lean: 2, mood: t > 1.6 ? 'flat' : 'grin', blink: blinkAt(t), lift: t > 1.6 ? tap * 0.3 : 0 });
    tf(th, 115, 120, 0, backOut(seg(t, 0.2, 0.7)) * (1 - seg(t, 1.4, 1.7)));
    tf(ck, 200, 90, 0, backOut(seg(t, 1.4, 1.9)));
    ha.setAttribute('transform', `rotate(${t * 220})`); hb.setAttribute('transform', `rotate(${t * 18})`);
  } };
}
