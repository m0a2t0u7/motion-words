// letter：おばあちゃんが机で便せんに手書きで手紙を書く（例文 My grandmother still writes letters by hand.）
import { seg, lerp, easeInOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach, faceAt } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '便せんを前に'], [1.0, '手で書く'], [3.4, '書き終えた']] };
const wave = (x, y, w) => { let d = `M ${x} ${y}`; for (let i = 0; i < w / 8; i++) d += ' q 2 -5 4 0 t 4 0'; return d; };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  desk(k, 185, 215, 200);
  // 机の上の便せん（遠近つき）と封筒
  el('path', { d: 'M 205 200 L 275 200 L 268 184 L 212 184 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const rows = [196, 192, 188].map((y, i) => el('path', { d: wave(214 + i * 0.6, y, 46 - i * 2), fill: 'none', stroke: pal.blueDark, 'stroke-width': 1.4, pathLength: 100, 'stroke-dasharray': '0 100' }));
  el('rect', { x: 330, y: 192, width: 40, height: 8, rx: 2, fill: '#F4E4C1', stroke: '#E2CC9C' });
  // 拡大カード
  const cd = g({}); tf(cd, 235, 28);
  el('rect', { x: 0, y: 0, width: 150, height: 96, rx: 10, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 }, cd);
  const big = [24, 46, 68].map((y) => el('path', { d: wave(14, y, 118), fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': '0 100' }, cd));
  const heart = el('path', { d: 'M 0 -4 C -8 -12 -14 -2 0 8 C 14 -2 8 -12 0 -4 Z', fill: pal.coral, transform: 'translate(124 80) scale(0)' }, cd);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const bun = g({}, b.body);
  el('circle', { cx: 0, cy: -96, r: 10, fill: '#C9CED8' }, bun);
  el('path', { d: 'M -22 -76 Q 0 -100 22 -76 Q 0 -88 -22 -76 Z', fill: '#C9CED8' }, bun);
  const pen = g({});
  el('line', { x1: 0, y1: 0, x2: -7, y2: -22, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pen);
  el('path', { d: 'M 0 0 L -2.5 -6 L 2.5 -5 Z', fill: pal.ink }, pen);
  return {
    update(t) {
      const w = seg(t, 1.0, 3.3), r = Math.min(2, Math.floor(w * 3)), f = w * 3 - r;
      rows.forEach((p, i) => p.setAttribute('stroke-dasharray', `${w * 3 > i + 1 ? 100 : w * 3 > i ? f * 100 : 0} 100`));
      big.forEach((p, i) => p.setAttribute('stroke-dasharray', `${w * 3 > i + 1 ? 100 : w * 3 > i ? f * 100 : 0} 100`));
      const writing = t > 1.0 && t < 3.3;
      const tx = lerp(214, 258, w >= 1 ? 1 : f), ty = [196, 192, 188][r];
      const lift = hump(seg(t, 0, 1.0)) * 0 + (writing ? Math.abs(Math.sin(t * 14)) * 1.5 : 0);
      const o = { lean: 14, armL: 10, look: 0.5, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'smile' };
      P(b, o);
      const rest = t < 1.0 ? lerp(180, ty - 6, easeInOut(seg(t, 0.2, 1.0))) : t > 3.3 ? ty - 10 * easeInOut(seg(t, 3.3, 3.9)) - 6 : ty - lift;
      P(b, { ...o, armR: reach(b, S, 'R', t < 1.0 ? lerp(190, 214, seg(t, 0.2, 1.0)) : tx, rest) });
      const h = hp(b, S, 'R');
      tf(pen, h.x, h.y, 22);
      faceAt(b, 4, 7);
      tf(heart, 0, 0); heart.setAttribute('transform', `translate(124 78) scale(${seg(t, 3.3, 3.7) * (1 + 0.15 * hump(seg(t, 3.3, 4.0)))})`);
    }
  };
}
