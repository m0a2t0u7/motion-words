// price：ガソリンスタンドで、値段の表示が上がるのを見て驚く（例文 The price of gas went up again.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 3.8, beats: [[0, '値段を見る'], [1.2, '数字が上がる'], [2.8, '上がった']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#DDEFFA' });
  k.backdrop({ floorY: 236, mood: 'outdoor' });
  const S = 1.1;
  const b = k.buddy({ x: 120, y: FY, scale: S });
  // 給油機
  k.shadow(310, FY, 46, 6);
  el('rect', { x: 270, y: 70, width: 80, height: 166, rx: 10, fill: pal.coral });
  el('rect', { x: 270, y: 70, width: 80, height: 14, rx: 7, fill: pal.coralDark });
  el('rect', { x: 280, y: 94, width: 60, height: 34, rx: 5, fill: '#2B3342' });
  const num = k.text(310, 120, '150', { 'font-size': 24, fill: '#7CF0B0', 'font-weight': 700 });
  el('path', { d: 'M 270 160 Q 240 160 240 190 V 214', stroke: pal.ink, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' });
  el('rect', { x: 234, y: 212, width: 12, height: 18, rx: 3, fill: pal.ink });
  el('rect', { x: 284, y: 148, width: 52, height: 40, rx: 5, fill: '#fff', opacity: 0.85 });
  const arrow = el('path', { d: 'M 0 12 L 0 -12 M -9 -3 L 0 -13 L 9 -3', stroke: pal.red, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const q = say(k, 50, 34, 1);
  k.text(0, 6, '!', { 'font-size': 22, fill: pal.red }, q.g);
  return {
    update(t) {
      const up = easeInOut(seg(t, 1.0, 2.4));
      num.textContent = String(Math.round(150 + 15 * up));
      const a = seg(t, 1.0, 1.4);
      arrow.setAttribute('opacity', a); k.tf(arrow, 310, lerp(176, 164, up) - 4 * Math.sin(t * 8) * (a > 0 ? 1 : 0));
      const shock = seg(t, 2.5, 2.8);
      pz(b, S, { x: 120, facing: 1, lean: -3 * shock, squash: 1 - 0.04 * hump(shock), look: 1, blink: blinkAt(t), mood: shock > 0 ? 'open' : 'smile', armR: lerp(8, 60, easeOut(shock)), armL: lerp(8, 50, easeOut(shock)) });
      q.show(seg(t, 2.6, 3.0), 150, 90);
    }
  };
}
