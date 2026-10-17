// the best of both worlds：仕事の世界（ノートPC）と家の世界（おうち）を、まめが両手にひとつずつ持って満足（例文 Working from home gives me the best of both worlds.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '二つの世界'], [1.4, '両方つかむ'], [2.8, '両方いただき']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 242, mood: 'indoor' });
  const mkWorld = (col, dark) => {
    const w = g({});
    el('circle', { r: 36, fill: col }, w);
    el('ellipse', { cx: -12, cy: -14, rx: 8, ry: 12, fill: '#fff', opacity: 0.25, transform: 'rotate(30 -12 -14)' }, w);
    return w;
  };
  const work = mkWorld(pal.blue), home = mkWorld(pal.coral);
  // ノートPC
  const pc = g({}, work);
  el('rect', { x: -17, y: -16, width: 34, height: 22, rx: 3, fill: '#fff' }, pc);
  el('rect', { x: -13, y: -12, width: 26, height: 14, rx: 1.5, fill: '#BFE0F8' }, pc);
  el('path', { d: 'M -22 10 L 22 10 L 18 6 L -18 6 Z', fill: '#E4E9F0' }, pc);
  // おうち
  const hs = g({}, home);
  el('path', { d: 'M -20 -2 L 0 -20 L 20 -2 Z', fill: '#fff' }, hs);
  el('rect', { x: -15, y: -2, width: 30, height: 20, fill: '#fff' }, hs);
  el('rect', { x: -4, y: 6, width: 8, height: 12, rx: 2, fill: pal.coralDark }, hs);
  const heart = g({});
  el('path', { d: 'M 0 6 C -14 -6 -8 -16 0 -9 C 8 -16 14 -6 0 6 Z', fill: pal.red }, heart);
  const spark = g({});
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow, transform: `translate(${sx * 30} ${sy * 14})` }, spark));
  const b = k.buddy({ x: 200, y: FY, scale: 1.1 });
  return {
    update(t) {
      const grab = easeOut(seg(t, 1.0, 1.7));
      const cheer = t > 2.7 ? Math.abs(Math.sin((t - 2.7) * 6)) : 0;
      const up = easeInOut(seg(t, 1.7, 2.6));
      b.pose({
        armR: lerp(8, 100, grab) + 40 * up, armL: lerp(8, 100, grab) + 40 * up,
        mood: t < 1.0 ? 'smile' : t < 2.7 ? 'open' : 'grin', look: 0,
        squash: 1 - 0.02 * hump(seg(t, 1.5, 1.9)), lift: 8 * cheer, lean: 0
      });
      const hl = b.handPos('L'), hr = b.handPos('R');
      const fl = (a, b2, p) => lerp(a, b2, p);
      // 世界：最初は左右の宙、手に収まる
      const wx = fl(78, hr.x + 24, grab), wy = fl(112 + 8 * Math.sin(t * 2), hr.y - 28, grab) - 14 * up;
      const hx = fl(322, hl.x - 24, grab), hy = fl(112 + 8 * Math.sin(t * 2 + 2), hl.y - 28, grab) - 14 * up;
      tf(home, hx - 0, hy, 0, 1, 1);
      tf(work, wx, wy, 0, 1, 1);
      // facing=1: R手はまめの右(画面右)側、L手は左側
      tf(work, hr.x + (grab < 1 ? 0 : 0) > 0 ? wx : wx, wy, 0, 1, 1);
      const sp = backOut(seg(t, 2.6, 3.1), 2);
      tf(spark, 200, 40, 0, sp * 1.0, sp * 1.0);
      spark.setAttribute('opacity', t < 2.6 ? 0 : 0.6 + 0.4 * Math.sin(t * 9));
      tf(heart, 200, 34, 0, sp, sp);
      heart.setAttribute('opacity', t < 2.6 ? 0 : 1);
    }
  };
}
