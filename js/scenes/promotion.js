// promotion：まめが上司から昇進を告げられ、名札が一段上がって喜ぶ（例文 She got a promotion to manager last month.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, cloud, say, desk, hp } from './look-over.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const meta = { duration: 4.4, beats: [[0, '平社員'], [1.6, '昇進を告げる'], [3.2, 'マネージャーに']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  const em = (ch, sz, parent) => { const q = g({}, parent); k.text(0, 0, ch, { 'font-size': sz, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, q); return q; };
  const tx = (s, sz = 14, fill) => k.text(0, 0, s, { 'font-size': sz, 'font-weight': 700, fill: fill || pal.ink, 'text-anchor': 'middle', 'dominant-baseline': 'central' });
  desk(k, 130, 160, 200);
  const pl = g({}); tf(pl, 160, 186);
  el('rect', { x: -40, y: -14, width: 80, height: 26, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, pl);
  const pt = k.text(0, 5, 'STAFF', { 'font-size': 16, 'font-weight': 700, fill: pal.ink, 'text-anchor': 'middle' }, pl);
  const b = k.buddy({ x: 210, y: FY, scale: S });
  const bs = k.buddy({ x: 330, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const st = em('⭐', 34), up = em('⬆️', 30), cf = em('🎉', 34);
  return { update(t) {
    const sw = t > 2.8;
    pt.textContent = sw ? 'MANAGER' : 'STAFF'; pt.setAttribute('font-size', sw ? 13 : 16);
    tf(pl, 160, 186, 0, 1 + 0.2 * hump(seg(t, 2.8, 3.4)));
    const jump = Math.abs(Math.sin(seg(t, 3.0, 4.2) * Math.PI * 2)) * 14 * seg(t, 3.0, 3.2) * (1 - seg(t, 4.0, 4.2));
    P(b, { lift: jump, armL: sw ? 150 : 8, armR: sw ? 150 : 8, look: 0.5, mood: sw ? 'grin' : 'smile', blink: blinkAt(t) });
    bs.pose({ x: 330, y: FY, facing: -1, armL: 8, armR: 8 + 90 * easeOut(seg(t, 1.2, 1.8)) * (1 - seg(t, 2.9, 3.3)), lean: 0, squash: 1, walk: 0, look: -0.4, mood: 'smile', blink: blinkAt(t, 1), lift: 0 });
    tf(st, 300, 110 - 20 * hump(seg(t, 1.4, 2.8)), 0, backOut(seg(t, 1.6, 2.1)) * (1 - seg(t, 2.6, 2.9)));
    tf(up, 210, 100 - 12 * seg(t, 3.0, 3.8), 0, backOut(seg(t, 3.0, 3.5)));
    tf(cf, 150, 90, 0, backOut(seg(t, 3.3, 3.8)));
  } };
}
