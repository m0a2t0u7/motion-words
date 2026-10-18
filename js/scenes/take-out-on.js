// take out on（否定の命令）：積み木が崩れて怒ったまめが、関係ない相手に向かってどなりかける。相手が両手で「やめて」と止め、まめは我に返る（例文 Don't take it out on me.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, backOut, wobble } from '../ease.js';
import { gait } from './dig.js';
import { say } from './get-on-with.js';

export const meta = { duration: 4.6, beats: [[0, '崩れてイライラ'], [1.8, '相手にぶつけかける'], [3.6, '止められた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 170, y: 48, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 積み木（崩れる）
  const cols = [pal.red, pal.blue, pal.yellow, pal.green, pal.violet];
  const blocks = cols.map((c) => { const n = g({}); el('rect', { x: -11, y: -11, width: 22, height: 22, rx: 3, fill: c }, n); return n; });
  const me = k.buddy({ x: 100, y: FY, scale: 0.95 });
  const you = k.buddy({ x: 320, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const fume = g({});
  [[-14, 0], [0, -6], [14, 0]].forEach(([x, y]) => el('path', { d: `M ${x} ${y} q -4 -6 0 -12 q 4 -6 0 -12`, stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, fume));
  const yell = say(k, 58, 36);
  el('path', { d: 'M -18 4 L -10 -8 L -2 6 L 6 -8 L 14 6 L 20 -4', stroke: pal.red, 'stroke-width': 3, fill: 'none', 'stroke-linejoin': 'round' }, yell.inner);
  const stop = say(k, 48, 40);
  el('circle', { r: 13, fill: 'none', stroke: pal.red, 'stroke-width': 3.5 }, stop.inner);
  el('line', { x1: -9, y1: -9, x2: 9, y2: 9, stroke: pal.red, 'stroke-width': 3.5 }, stop.inner);
  const xf = (t) => lerp(100, 200, easeInOut(seg(t, 1.5, 2.2)));
  return {
    update(t) {
      // 積み木：0.5秒で崩れる
      const fall = seg(t, 0.4, 1.0);
      blocks.forEach((n, i) => {
        const sx = 40, sy = FY - 11 - i * 22;
        const ex = 40 + (i - 2) * 18 + i * 6, ey = FY - 11;
        const q = easeIn(seg(fall, i * 0.05, 0.6 + i * 0.08));
        const land = seg(fall, 0.6 + i * 0.08, 1);
        tf(n, lerp(sx, ex, q), lerp(sy, ey, q) - wobble(land, 2, 6) * 4 * (land > 0 ? 1 : 0), q * (i % 2 ? 80 : -60));
      });
      const p = gait(xf, t, 100, 16);
      const angry = easeOut(seg(t, 1.0, 1.3));
      const yelling = t > 2.2 && t < 2.9;
      const halt = easeOut(seg(t, 2.7, 3.0)), calm = easeInOut(seg(t, 3.2, 3.8));
      me.pose({ x: p.x, walk: p.walk, facing: t < 1.2 ? -1 : 1, lean: p.lean + (yelling ? 10 : 0) - 8 * halt * (1 - calm), squash: 1 - 0.1 * hump(seg(t, 1.0, 1.3)) - 0.06 * calm,
        armR: yelling ? 150 + Math.sin(t * 18) * 15 : lerp(angry * 20 + 10, 10, calm), armL: yelling ? 150 + Math.sin(t * 18 + 1) * 15 : lerp(angry * 20 + 10, 10, calm),
        look: 0.6, mood: calm > 0.5 ? 'sad' : t > 1.0 ? (yelling ? 'open' : 'flat') : 'smile' });
      tf(fume, me.state.x, FY - 100, 0, 1 + 0.1 * Math.sin(t * 12));
      fume.setAttribute('opacity', angry * (1 - calm));
      yell.show(me.state.x + 40, 110, yelling ? seg(t, 2.2, 2.35) : t > 2.9 ? 1 - seg(t, 2.9, 3.0) : 0);
      // 相手：両手のひらを前に出して止める
      const block = easeOut(seg(t, 2.5, 2.8));
      you.pose({ armR: lerp(10, 100, block), armL: lerp(10, 100, block), lean: -8 * block * (1 - calm * 0.6), mood: block > 0.3 ? 'flat' : t > 2.2 ? 'open' : 'smile', look: 0.6 });
      stop.show(330, 112, backOut(seg(t, 2.6, 2.95)) * (1 - seg(t, 4.0, 4.3)));
    }
  };
}
