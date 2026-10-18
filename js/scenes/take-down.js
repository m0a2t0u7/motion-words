// take down：まめが壁のポスターの画びょうを外し、ポスターを下へおろす（例文 She took down the poster from the wall.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '壁のポスター'], [1.4, 'ピンを外す'], [3.0, 'おろした']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 300, y: 60, width: 80, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const PX = 196, PY = 66, PW = 76, PH = 100;
  const mark = el('rect', { x: PX, y: PY, width: PW, height: PH, fill: '#EDE7DD', opacity: 0 });
  // ポスター（原点＝上辺中央）
  const P = g({});
  el('rect', { x: -PW / 2, y: 0, width: PW, height: PH, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, P);
  el('rect', { x: -PW / 2 + 6, y: 6, width: PW - 12, height: 60, fill: '#BFE3F5' }, P);
  el('circle', { cx: 14, cy: 26, r: 10, fill: pal.yellow }, P);
  el('path', { d: `M ${-PW / 2 + 6} 66 L -10 34 L 6 52 L 16 42 L ${PW / 2 - 6} 66 Z`, fill: pal.green }, P);
  el('rect', { x: -24, y: 74, width: 48, height: 6, rx: 3, fill: pal.coral }, P);
  el('rect', { x: -18, y: 86, width: 36, height: 4, rx: 2, fill: pal.sub }, P);
  const pins = [-PW / 2 + 5, PW / 2 - 5].map((dx) => el('circle', { r: 3.4, fill: pal.red }));
  const B = k.buddy({ x: 150, y: FY, scale: 0.95 });
  return {
    update(t) {
      // ピンを左→右と外し、ポスターの上辺をつまんで下へ
      const pin = [seg(t, 0.6, 1.0), seg(t, 1.2, 1.6)];
      const low = easeInOut(seg(t, 1.8, 3.0));
      const tipL = pin[0] > 0.6 && t < 1.8 ? 6 * easeOut(seg(t, 0.9, 1.3)) : 0; // 左上がたれる
      const x = lerp(PX + PW / 2, 205, low), y = lerp(PY, 150, low);
      tf(P, x, y, low > 0 ? -6 * low + 2 * wobble(seg(t, 3.0, 3.6), 2, 5) : tipL, 1, lerp(1, 0.9, low));
      mark.setAttribute('opacity', low > 0.1 ? 0.8 : 0);
      pins.forEach((p, i) => {
        const dx = [-PW / 2 + 5, PW / 2 - 5][i];
        const out = pin[i];
        k.set(p, { cx: PX + PW / 2 + dx, cy: PY + 4, opacity: out < 0.5 ? 1 : 0 });
      });
      const look = t < 1.8 ? -0.2 : 0.4;
      const tgt = t < 1.0 ? { x: PX + 5, y: PY + 4 } : t < 1.7 ? { x: PX + PW - 5, y: PY + 4 } : { x: x + 30, y: y + 4 };
      const tL = t < 1.7 ? { x: PX + 8, y: PY + 10 } : { x: x - 30, y: y + 4 };
      const ra = reach(B, 0.95, 'R', tgt.x, tgt.y), la = reach(B, 0.95, 'L', tL.x, tL.y);
      B.pose({ armR: t < 0.3 ? lerp(10, ra, seg(t, 0, 0.3)) : ra, armL: t > 1.0 ? la : 10, lift: 10 * Math.sin(seg(t, 0.4, 1.8) * Math.PI), look, mood: t > 3.0 ? 'grin' : 'flat', lean: -4 * (1 - low) });
    }
  };
}
