// frost：寒い朝、車の窓も屋根も真っ白な霜。まめが白い息を吐きながらスクレーパーで窓の霜をけずる（例文 There was frost on the car this morning.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { scene, hills, sunG, held, reach, P, blinkAt } from './nature.js';
import { car } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '霜の朝'], [1.2, '霜をけずる'], [3.4, '窓が見えた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 240, top: '#CFE0F2', bot: '#FFF1E2', ground: '#E6EEF3', edge: '#D3DEE6' });
  const sun = sunG(k, 16); tf(sun.g, 60, 120); sun.g.setAttribute('opacity', 0.8);
  hills(k, FY, '#E1EBF0', '#D6E3EA');
  const CX = 160;
  const cr = car(k, '#7FA6D9', '#5C86BE'); cr.set(CX, 0, FY);
  // 霜：窓・ボンネット・屋根を白く
  const fg = g({}); tf(fg, CX, FY);
  const front = g({}, fg);
  front.setAttribute('clip-path', k.clip((c) => el('path', { d: 'M 12 -60 L 22 -60 Q 34 -58 42 -44 L 12 -44 Z' }, c)));
  const frostR = el('rect', { x: 12, y: -62, width: 32, height: 20, fill: '#F4F9FD', opacity: 0.95 }, front);
  const crys = g({}, front);
  [[18, -54], [26, -50], [34, -48], [22, -47]].forEach(([x, y]) => el('path', { d: `M ${x - 3} ${y} h 6 M ${x} ${y - 3} v 6 M ${x - 2} ${y - 2} l 4 4 M ${x + 2} ${y - 2} l -4 4`, stroke: '#C7DCEC', 'stroke-width': 1 }, crys));
  el('path', { d: 'M -24 -44 Q -14 -60 2 -60 L 6 -60 L 6 -44 Z', fill: '#F4F9FD', opacity: 0.92 }, fg);
  el('path', { d: 'M -30 -43 Q -18 -67 6 -67 L 24 -67 Q 40 -65 50 -43 L 46 -41 Q 38 -62 24 -63 L 6 -63 Q -16 -63 -26 -41 Z', fill: '#fff', opacity: 0.95 }, fg);
  el('path', { d: 'M 50 -42 Q 66 -40 66 -26 L 52 -30 Z M -64 -26 Q -66 -38 -48 -40 L -40 -36 Z', fill: '#fff', opacity: 0.9 }, fg);
  const b = k.buddy({ x: 262, y: FY, scale: S, facing: -1 });
  // マフラー
  const sc = g({}, b.body);
  el('rect', { x: -28, y: -34, width: 56, height: 9, rx: 4.5, fill: pal.red }, sc);
  el('rect', { x: 8, y: -28, width: 9, height: 20, rx: 4, fill: pal.red }, sc);
  // スクレーパー（原点＝握り、+y＝刃の方向）
  const scr = g({});
  el('rect', { x: -3, y: -4, width: 6, height: 14, rx: 2, fill: pal.blueDark }, scr);
  el('rect', { x: -8, y: 10, width: 16, height: 5, rx: 1.5, fill: pal.yellow }, scr);
  const breath = [0, 1, 2].map(() => el('circle', { r: 6, fill: '#fff' }));
  return {
    update(t) {
      // 刃先が窓の右端から左端へ、こすりながら進む
      const clr = easeInOut(seg(t, 1.1, 3.3)), act = clr > 0 && clr < 1 ? 1 : 0;
      const strokeP = Math.sin(seg(t, 1.1, 3.3) * Math.PI * 6);
      const sx = CX + 40 - 26 * clr + 4 * strokeP * act, sy = FY - 50 + 3 * Math.cos(t * 12) * act;
      const lift = easeOut(seg(t, 0.4, 1.1)) * (1 - easeInOut(seg(t, 3.4, 3.9)));
      const tx = lerp(250, sx, lift), ty = lerp(FY - 30, sy, lift);
      P(b, { facing: -1, lean: 8 * lift, look: -0.5, mood: t > 3.5 ? 'grin' : 'flat', blink: blinkAt(t), armL: 20 });
      b.pose({ armR: reach(b, S, 'R', tx, ty) });
      held(k, b, S, scr, 'R', 0, 18);
      frostR.setAttribute('width', 32 * (1 - clr) + 0.01);
      crys.setAttribute('opacity', 1 - clr);
      breath.forEach((n, i) => {
        const p = ((t * 0.6 + i / 3) % 1);
        tf(n, 228 - 24 * p, FY - 62 - 10 * p, 0, 0.5 + p);
        n.setAttribute('opacity', (0.7 * hump(p)).toFixed(2));
      });
    }
  };
}
