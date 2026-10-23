// assistant：研究室で白衣の助手（まめ）がフラスコを運んで博士に渡し、記録を取る（例文 She works as an assistant in the lab.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, walkTo, path, wear, deskFront } from './member.js';
import { coat } from './hospital.js';
import { paper } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, '研究室'], [1.4, 'フラスコを渡す'], [3.0, '記録して手伝う']] };

export function flask(k, col = '#A58BF3', parent) {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -3 -16 L 3 -16 L 3 -8 L 10 6 Q 11 9 8 9 L -8 9 Q -11 9 -10 6 L -3 -8 Z', fill: '#fff', 'fill-opacity': 0.6, stroke: '#B9CBDD', 'stroke-width': 1.6 }, g);
  k.el('path', { d: 'M -7 1 L 7 1 L 9.6 6 Q 10 8.4 8 8.4 L -8 8.4 Q -10 8.4 -9.6 6 Z', fill: col }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#EEF4F6' });
  // 棚
  [60, 100].forEach((y) => el('rect', { x: 20, y, width: 130, height: 5, fill: pal.woodDark }));
  [[34, '#7CC59A'], [62, pal.blue], [92, pal.yellow], [120, pal.coral]].forEach(([x, c], i) => { const f = flask(k, c); tf(f, x, (i % 2 ? 100 : 60) - 9); });
  // 博士と顕微鏡
  const dr = k.buddy({ x: 330, y: FY, scale: 1, facing: -1, ...CO(k) }); coat(k, dr); wear(k, dr, 'glasses');
  deskFront(k, 200, 100, FY - 46, FY);
  const ms = g({}); tf(ms, 266, FY - 46);
  el('rect', { x: -14, y: -4, width: 28, height: 4, rx: 2, fill: pal.ink }, ms); el('rect', { x: -3, y: -40, width: 6, height: 36, fill: pal.sub }, ms); el('rect', { x: -6, y: -50, width: 10, height: 18, rx: 3, fill: pal.ink, transform: 'rotate(20)' }, ms);
  const b = k.buddy({ x: 60, y: FY, scale: S }); coat(k, b);
  const fl = flask(k, '#A58BF3');
  const clip = paper(k, k.root, 22, 28, 4, '#fff');
  const pen = el('rect', { x: -1.5, y: -10, width: 3, height: 14, rx: 1.5, fill: pal.blueDark });
  const bx = path([[0.2, 60], [1.3, 176]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 60, 1), give = easeInOut(seg(t, 1.3, 1.8)), got = t > 1.9, back = easeInOut(seg(t, 2.0, 2.4));
      P(dr, { look: t > 2.2 ? 0.5 : 0.6, blink: blinkAt(t, 1), mood: t > 2.0 ? 'grin' : 'smile', armL: 10, lean: t > 2.6 ? 10 : 0 });
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(lerp(70, 70, 0), 80, give), lean: w.lean, look: 0.6, blink: blinkAt(t), mood: 'smile' });
      const bh = hp(b, S, 'R', 32);
      if (t > 1.3) dr.pose({ armR: got ? lerp(reach(dr, 1, 'R', bh.x, bh.y), 60, back) : lerp(8, reach(dr, 1, 'R', bh.x, bh.y), give) });
      const dh = hp(dr, 1, 'R', 32);
      if (got) { const h = t > 2.4 ? { x: 248, y: FY - 46 } : dh; tf(fl, h.x, h.y - (t > 2.4 ? 9 : 2)); }
      else tf(fl, bh.x, bh.y - 2);
      // 渡したあと、助手はクリップボードに記録する
      const wr = easeInOut(seg(t, 2.3, 2.7));
      const cx = b.state.x + 14 * S, cy = FY - 44 * S;
      tf(clip, cx, cy, -8, wr < 0.05 ? 0.001 : S);
      if (wr > 0) b.pose({ armR: lerp(b.state.armR, reach(b, S, 'R', cx + 4 * Math.sin(t * 14), cy - 2 + 6 * seg(t, 2.8, 4.2)), wr), look: lerp(0.6, 0.3, wr) });
      const hr = hp(b, S, 'R', 30); tf(pen, hr.x + 2, hr.y - 2, 20, wr < 0.05 ? 0.001 : 1);
    }
  };
}
