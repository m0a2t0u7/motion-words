// homework：机でノートに書き終え、ペンを置いて「終わった！」と両腕を上げる（例文 Did you finish your homework?）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { desk, hp, reach, faceAt } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '宿題をする'], [2.0, '書き終える'], [3.0, '終わった！']] };
const wave = (x, y, w) => { let d = `M ${x} ${y}`; for (let i = 0; i < w / 8; i++) d += ' q 2 -5 4 0 t 4 0'; return d; };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  desk(k, 185, 215, 200);
  [0, 1, 2].forEach((i) => el('rect', { x: 340 - i * 2, y: 186 - i * 6, width: 40, height: 6, rx: 1.5, fill: [pal.blue, pal.coral, pal.yellow][i] }));
  // ノート（机に平置き）
  el('path', { d: 'M 205 200 L 285 200 L 278 182 L 212 182 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const rows = [195, 190, 185].map((y, i) => el('path', { d: wave(214 + i, y, 54 - i * 4), fill: 'none', stroke: pal.sub, 'stroke-width': 1.3, pathLength: 100, 'stroke-dasharray': '0 100' }));
  const pen = g({});
  el('line', { x1: 0, y1: 0, x2: -6, y2: -22, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pen);
  el('path', { d: 'M 0 0 L -2.5 -6 L 2.5 -5 Z', fill: pal.ink }, pen);
  const ok = g({}); tf(ok, 245, 150, 0, 0);
  el('circle', { r: 20, fill: pal.green }, ok);
  el('path', { d: 'M -9 0 L -3 7 L 10 -8', fill: 'none', stroke: '#fff', 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  return {
    update(t) {
      const w = seg(t, 0.4, 2.0), r = Math.min(2, Math.floor(w * 3)), f = w * 3 - r;
      rows.forEach((p, i) => p.setAttribute('stroke-dasharray', `${w * 3 > i + 1 ? 100 : w * 3 > i ? f * 100 : 0} 100`));
      const writing = t < 2.0, cheer = easeOut(seg(t, 2.7, 3.2));
      const tx = lerp(216, 262, w >= 1 ? 1 : f), ty = [195, 190, 185][r];
      const o = { lean: 14 * (1 - cheer), armL: lerp(10, 165, cheer), look: 0.5, blink: blinkAt(t), mood: t < 2.7 ? 'flat' : 'grin', squash: 1 - 0.04 * hump(seg(t, 2.6, 3.0)), lift: 5 * hump(seg(t, 3.0, 3.6)) };
      P(b, o);
      const tg = t < 2.0 ? [tx, ty - (Math.abs(Math.sin(t * 14)) * 1.5)] : [262, 185];
      const a = reach(b, S, 'R', tg[0], tg[1]);
      P(b, { ...o, armR: lerp(a, 165, cheer) });
      const h = hp(b, S, 'R');
      if (t < 2.7) tf(pen, h.x, h.y, 22); else tf(pen, 266, 186, 70);
      faceAt(b, t < 2.7 ? 4 : 1, t < 2.7 ? 7 : 0);
      tf(ok, 245, 150, 0, backOut(seg(t, 3.0, 3.5)) + 0.0001);
    }
  };
}
