// watch for：窓辺から外の道をじっと見て配達トラックを待つ。普通の車が通っても違う→また見張る（例文 He watched for the delivery truck from the window.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, faceAt } from './look-over.js';
import { car } from './look-out.js';

export const meta = { duration: 4.4, beats: [[0, '窓から見張る'], [1.8, '違う車だ'], [3.4, 'まだ待つ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 窓の外（クリップ）
  const W = { x: 170, y: 46, w: 210, h: 120 };
  const cp = k.clip((c) => el('rect', { x: W.x, y: W.y, width: W.w, height: W.h }, c));
  const out = g({ 'clip-path': cp });
  el('rect', { x: W.x, y: W.y, width: W.w, height: W.h, fill: '#DCEEFA' }, out);
  el('rect', { x: W.x + 20, y: 80, width: 50, height: 56, fill: '#F3E6DC' }, out);
  el('circle', { cx: 330, cy: 112, r: 26, fill: '#9FD7A8' }, out);
  el('rect', { x: W.x, y: 136, width: W.w, height: 30, fill: '#BCC4CF' }, out);
  const c1 = car(k, pal.coral, pal.coralDark); out.appendChild(k.root.lastChild);
  el('rect', { x: W.x - 6, y: W.y - 6, width: W.w + 12, height: W.h + 12, rx: 6, fill: 'none', stroke: '#fff', 'stroke-width': 10 });
  el('line', { x1: W.x + W.w / 2, y1: W.y, x2: W.x + W.w / 2, y2: W.y + W.h, stroke: '#fff', 'stroke-width': 6 });
  el('rect', { x: W.x - 14, y: W.y + W.h + 4, width: W.w + 28, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: W.x - 10, y: W.y + W.h + 14, width: W.w + 20, height: FY - W.y - W.h - 20, fill: '#F1EBE2' });
  const b = k.buddy({ x: 162, y: FY, scale: 1.05 });
  return {
    update(t) {
      const cx = lerp(420, 120, seg(t, 1.2, 2.8));
      c1(cx, 160, 0.42);
      const perk = hump(seg(t, 1.3, 2.3)), slump = hump(seg(t, 2.3, 3.4));
      b.pose({ armR: 72 - 6 * slump, armL: 20, lean: 12 + 6 * perk - 4 * slump, lift: 6 * perk, mood: perk > 0.4 ? 'open' : slump > 0.3 ? 'flat' : 'smile', look: 0.9, blink: hump(seg(t, 3.8, 3.95)) });
      const track = t > 1.2 && t < 2.8 ? lerp(8, 1, seg(t, 1.2, 2.8)) : t < 1.2 ? 6 + Math.sin(t * 3) * 2 : 6 + Math.sin(t * 2) * 2;
      faceAt(b, track, 0);
    }
  };
}
