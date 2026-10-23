// exam：机で勉強していたまめが、明日に丸がついたカレンダーを指さして緊張する（例文 I have a big exam tomorrow.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach, faceAt } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '勉強中'], [1.4, '明日に気づく'], [2.6, '大事な試験']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // カレンダー
  const cal = g({}); tf(cal, 250, 40);
  el('rect', { x: 0, y: 0, width: 110, height: 90, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: 0, y: 0, width: 110, height: 18, rx: 6, fill: pal.coral }, cal);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) el('rect', { x: 8 + c * 19, y: 26 + r * 20, width: 14, height: 14, rx: 2, fill: '#EEF1F6' }, cal);
  [0, 1, 2, 3, 4].forEach((c) => c < 2 && el('path', { d: `M ${9 + c * 19} 27 l 12 12 M ${21 + c * 19} 27 l -12 12`, stroke: pal.sub, 'stroke-width': 1.6 }, cal));
  const ring = el('circle', { cx: 8 + 2 * 19 + 7, cy: 26 + 7, r: 11, fill: 'none', stroke: pal.red, 'stroke-width': 3, pathLength: 100 }, cal);
  const pulse = g({}, cal); tf(pulse, 8 + 2 * 19 + 7, 33);
  el('circle', { r: 14, fill: pal.red, opacity: 0.18 }, pulse);
  desk(k, 185, 215, 200);
  el('path', { d: 'M 210 200 L 280 200 L 273 184 L 217 184 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('text', { x: 232, y: 196, 'font-size': 9, fill: pal.sub, 'font-weight': 'bold' }).textContent = 'TEST';
  [0, 1].forEach((i) => el('rect', { x: 320, y: 188 - i * 7, width: 44, height: 7, rx: 1.5, fill: [pal.blue, pal.mint][i] }));
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const pen = g({});
  el('line', { x1: 0, y1: 0, x2: -6, y2: -20, stroke: pal.blueDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pen);
  const sw = g({});
  el('path', { d: 'M 0 -8 Q 6 0 0 5 Q -6 0 0 -8 Z', fill: '#8FD3F4' }, sw);
  return {
    update(t) {
      const study = t < 1.4, pt = easeInOut(seg(t, 1.4, 2.0)), panic = seg(t, 2.4, 2.9);
      const o = { lean: lerp(14, 2, pt), armL: lerp(10, 150, seg(t, 2.6, 3.1)), look: 0.6, blink: blinkAt(t), mood: t < 1.4 ? 'flat' : t < 2.4 ? 'open' : 'sad', squash: 1 - 0.03 * hump(seg(t, 2.4, 3.0)) };
      P(b, o);
      const wr = [lerp(222, 258, seg(t, 0, 1.3)), 192 - Math.abs(Math.sin(t * 14)) * 1.5];
      const aw = reach(b, S, 'R', wr[0], wr[1]);
      P(b, { ...o, armR: lerp(aw, 125, pt) });
      const h = hp(b, S, 'R');
      if (t < 2.2) tf(pen, h.x, h.y, 22); else tf(pen, 262, 190, 70);
      faceAt(b, lerp(4, 6, pt), lerp(7, -4, pt));
      k.set(ring, { 'stroke-dasharray': `${seg(t, 0, 0.01) * 100} 100` });
      const pu = 1 + 0.25 * hump(seg(t, 1.7, 2.5));
      tf(pulse, 8 + 2 * 19 + 7, 33, 0, pu, pu);
      tf(sw, 140 + 22 * S, FY - 80 * S + 14 * panic, 0, panic, panic);
    }
  };
}
