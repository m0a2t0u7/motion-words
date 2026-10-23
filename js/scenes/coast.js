// coast：壁の地図で、まめが東の海岸を指さす。そこにピンが立ち、海ぞいの家の前で手をふる2人が見える（例文 They live on the east coast.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '地図を見る'], [1.2, '東の海岸'], [2.6, 'そこに住む']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E7DCCD' });
  // 地図（左が陸、右が海）
  const MX = 150, MY = 30, MW = 220, MH = 150;
  el('rect', { x: MX - 6, y: MY - 6, width: MW + 12, height: MH + 12, rx: 6, fill: pal.woodDark });
  el('rect', { x: MX, y: MY, width: MW, height: MH, fill: '#8FD3F4' });
  const coastD = `M ${MX} ${MY} L ${MX + 150} ${MY} Q ${MX + 136} ${MY + 30} ${MX + 160} ${MY + 54} Q ${MX + 176} ${MY + 80} ${MX + 150} ${MY + 104} Q ${MX + 140} ${MY + 128} ${MX + 152} ${MY + MH} L ${MX} ${MY + MH} Z`;
  el('path', { d: coastD, fill: '#9ED39A' });
  const edge = el('path', { d: `M ${MX + 150} ${MY} Q ${MX + 136} ${MY + 30} ${MX + 160} ${MY + 54} Q ${MX + 176} ${MY + 80} ${MX + 150} ${MY + 104} Q ${MX + 140} ${MY + 128} ${MX + 152} ${MY + MH}`, stroke: '#F2C14E', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': 400, 'stroke-dashoffset': 400 });
  el('path', { d: `M ${MX + 40} ${MY + 40} l 14 -20 l 14 20 Z M ${MX + 60} ${MY + 44} l 10 -14 l 10 14 Z`, fill: '#7FB97A' });
  // 方位（N と E）
  const CX = MX + 178, CY = MY + 120;
  el('circle', { cx: CX, cy: CY, r: 16, fill: '#fff', opacity: 0.85 });
  el('path', { d: `M ${CX} ${CY - 12} L ${CX + 3} ${CY} L ${CX - 3} ${CY} Z`, fill: pal.red }); el('path', { d: `M ${CX + 12} ${CY} L ${CX} ${CY + 3} L ${CX} ${CY - 3} Z`, fill: pal.ink });
  k.text(CX, CY - 22, 'N', { 'font-size': 10 }); const eL = k.text(CX + 24, CY + 1, 'E', { 'font-size': 13, fill: pal.coralDark });
  const pin = g({});
  el('path', { d: 'M 0 0 Q -10 -14 -10 -20 A 10 10 0 1 1 10 -20 Q 10 -14 0 0 Z', fill: pal.red }, pin); el('circle', { cx: 0, cy: -20, r: 4, fill: '#fff' }, pin);
  // 拡大の絵（海ぞいの家と2人）
  const ins = g({}), IX = 40, IY = 24;
  el('rect', { x: -2, y: -2, width: 104, height: 84, rx: 10, fill: '#fff' }, ins);
  const inner = g({}, ins); inner.setAttribute('clip-path', k.clip((c) => el('rect', { x: 2, y: 2, width: 96, height: 76, rx: 8 }, c)));
  el('rect', { x: 0, y: 0, width: 100, height: 80, fill: '#CFE8FA' }, inner);
  el('rect', { x: 60, y: 44, width: 40, height: 40, fill: '#5FB6E8' }, inner);
  el('path', { d: 'M 0 62 L 58 62 Q 66 64 70 80 L 0 80 Z', fill: '#F6E3B9' }, inner);
  el('path', { d: 'M 6 62 L 6 34 L 22 22 L 38 34 L 38 62 Z', fill: '#fff', stroke: pal.line }, inner); el('path', { d: 'M 2 36 L 22 18 L 42 36', stroke: pal.coral, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, inner); el('rect', { x: 17, y: 46, width: 10, height: 16, fill: pal.woodDark }, inner);
  const p1 = k.buddy({ x: 50, y: 66, scale: 0.26, color: pal.coral, dark: pal.coralDark, parent: inner });
  const p2 = k.buddy({ x: 64, y: 66, scale: 0.26, color: pal.blue, dark: pal.blueDark, parent: inner });
  el('path', { d: 'M 104 70 L 140 96', stroke: pal.line, 'stroke-width': 2, 'stroke-dasharray': '4 4' }, ins);
  const me = k.buddy({ x: 96, y: FY, scale: S });
  const PX = MX + 150, PY = MY + 100;
  return {
    update(t) {
      const pt = easeInOut(seg(t, 0.8, 1.4)), dr = easeOut(seg(t, 1.2, 2.0));
      edge.setAttribute('stroke-dashoffset', 400 * (1 - dr));
      eL.setAttribute('font-size', 13 + 5 * hump(seg(t, 1.0, 1.8)));
      const pp = seg(t, 1.9, 2.4);
      tf(pin, PX, PY - 30 * (1 - easeOut(pp)), 0, pp <= 0 ? 0.001 : 1); pin.setAttribute('opacity', pp > 0 ? 1 : 0);
      const ip = seg(t, 2.5, 3.0);
      tf(ins, IX + 50 * (1 - backOut(ip)), IY + 40 * (1 - backOut(ip)), 0, ip <= 0 ? 0.001 : backOut(ip)); ins.setAttribute('opacity', clamp(ip * 3));
      const wv = Math.sin(t * 9) * 20;
      P(p1, { x: 50, y: 66, armR: t > 2.8 ? 150 + wv : 8, mood: 'grin' }); P(p2, { x: 64, y: 66, armL: t > 2.8 ? 150 - wv : 8, mood: 'grin' });
      P(me, { x: 96, armR: 8, lean: 0, look: 0.6, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t) });
      me.pose({ armR: lerp(8, reach(me, S, 'R', PX - 4, PY - 10), pt), lean: 4 * pt });
    }
  };
}
