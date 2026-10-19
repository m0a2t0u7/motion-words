// arrival：花束を持って迎えに来たまめが、到着案内板の行を指でたどり、到着時刻 14:30 を確かめる（例文 Check the arrival time on the board.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hall, board, reach, held, mark, popIn } from './vehicle.js';

export const meta = { duration: 4.2, beats: [[0, '到着案内板'], [1.2, '指でたどる'], [2.8, '14:30着だ']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  hall(k, FY);
  const bd = board(k, 150, 30, 230, [['NH 21', '13:50', 'LANDED'], ['JL 05', '14:30', 'ON TIME'], ['UA 33', '15:10', 'ON TIME']], 'ARRIVALS');
  const hl = el('rect', { x: 154, y: bd.rowY(1) - 9, width: 222, height: 18, rx: 3, fill: '#fff', opacity: 0 });
  bd.g.parentNode.insertBefore(hl, bd.g.nextSibling);
  // 着陸する飛行機のマーク
  el('path', { d: 'M 168 38 l 14 6 l -3 3 z', fill: '#fff' });
  const me = k.buddy({ x: 90, y: FY + 6, scale: 0.95 });
  const fl = g({}); el('path', { d: 'M -2 0 L 0 18', stroke: pal.green, 'stroke-width': 3 }, fl); [[-6, 18], [5, 20], [0, 26]].forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: 6, fill: [pal.coral, pal.yellow, pal.violet][i] }, fl));
  const ok = mark(k, 'check');
  return {
    update(t) {
      // 指先：上の行 → 2行目へ下り → 時刻の位置で止まる
      const p1 = easeInOut(seg(t, 0.6, 1.4)), p2 = easeInOut(seg(t, 1.4, 2.4));
      const tx = lerp(165, 260, p2), ty = lerp(bd.rowY(0), bd.rowY(1), p1);
      const on = easeOut(seg(t, 0.3, 0.7)) * (1 - easeInOut(seg(t, 3.2, 3.6)));
      P(me, { x: 90 + 40 * on, look: 0.6, lean: -8, mood: t > 2.6 ? 'grin' : 'smile', blink: blinkAt(t), armL: 30 });
      me.body.children[3].setAttribute('transform', 'translate(3 -8)');
      me.pose({ armR: lerp(10, reach(me, 0.95, 'R', tx, ty), on) });
      held(k, me, 0.95, fl, 'L', 180);
      hl.setAttribute('opacity', 0.25 * seg(t, 2.4, 2.7));
      k.tf(ok, 300, 90, 0, popIn(seg(t, 2.6, 3.0)) * 1.4 + 0.001);
      void hump;
    }
  };
}
