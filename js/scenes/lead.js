// lead：彼が先頭に立ち、腕で行き先を示しながら私たちを駅まで案内する（例文 He led us to the station.）
import { seg, lerp, easeInOut, hump, wobble } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '先頭に立つ'], [1.8, '案内して歩く'], [3.6, '駅に着いた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  // 駅舎（右奥）
  el('rect', { x: 262, y: 82, width: 160, height: 130, rx: 6, fill: '#F3E6DC' });
  el('rect', { x: 254, y: 70, width: 170, height: 16, rx: 6, fill: pal.blueDark });
  el('rect', { x: 296, y: 130, width: 70, height: 82, rx: 6, fill: '#8FA9C2' });
  el('rect', { x: 302, y: 136, width: 58, height: 76, rx: 4, fill: '#DDEFFA' });
  const sg = g({}); tf(sg, 331, 108);
  el('rect', { x: -20, y: -13, width: 40, height: 26, rx: 6, fill: pal.blue }, sg);
  el('rect', { x: -12, y: -8, width: 24, height: 12, rx: 3, fill: '#fff' }, sg);
  el('circle', { cx: -7, cy: 9, r: 2, fill: '#fff' }, sg); el('circle', { cx: 7, cy: 9, r: 2, fill: '#fff' }, sg);
  // 道の標識の矢印
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.floorEdge });
  const f1 = k.buddy({ x: -10, y: FY, facing: 1, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  const f2 = k.buddy({ x: -70, y: FY, facing: 1, scale: 0.9 });
  const ld = k.buddy({ x: 80, y: FY, facing: 1, scale: 1.0, color: pal.blue, dark: pal.blueDark });
  const lx = (t) => lerp(60, 268, easeInOut(seg(t, 0.4, 3.4)));
  const ax = (t) => lx(t - 0.2) - 62, bx = (t) => lx(t - 0.2) - 118;
  return {
    update(t) {
      const a = gait(lx, t, 60, 10), c = gait(ax, t, ax(0), 14), d = gait(bx, t, bx(0), 14);
      const pt = easeInOut(seg(t, 0.2, 0.8)), arrive = seg(t, 3.3, 3.8);
      ld.pose({ x: a.x, walk: a.walk, armL: a.armL, armR: lerp(a.armR, 62 + 4 * Math.sin(t * 6), pt) + 40 * hump(arrive) , lean: a.lean, look: 0.3, mood: 'grin' });
      f1.pose({ x: c.x, walk: c.walk, armL: c.armL, armR: c.armR, lean: c.lean, look: 0.7, mood: 'smile' });
      f2.pose({ x: d.x, walk: d.walk, armL: d.armL, armR: d.armR, lean: d.lean, look: 0.7, mood: 'smile' });
    }
  };
}
