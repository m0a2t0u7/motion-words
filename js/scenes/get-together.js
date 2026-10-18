// get together：金曜の夕食に、2人が別々の方から来てテーブルで合流し、乾杯する（例文 Let's get together for dinner on Friday.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp } from './dig.js';
import { person, path, walk } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '金曜の夜'], [1.8, '集まる'], [3.8, '一緒に夕食']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  // カレンダー：FRI に丸
  const cal = g({}); tf(cal, 200, 64);
  el('rect', { x: -70, y: -26, width: 140, height: 50, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => k.text(-57 + i * 19, 0, d, { 'font-size': 12, fill: i === 4 ? pal.red : pal.sub }, cal));
  el('circle', { cx: 19, cy: 0, r: 10, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 }, cal);
  // テーブルと料理
  el('rect', { x: 140, y: 190, width: 120, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 150, y: 198, width: 7, height: 38, fill: pal.woodDark }); el('rect', { x: 243, y: 198, width: 7, height: 38, fill: pal.woodDark });
  k.shadow(200, 237, 66, 4);
  el('ellipse', { cx: 200, cy: 188, rx: 24, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('path', { d: 'M 184 186 Q 200 168 216 186 Z', fill: pal.coral });
  el('ellipse', { cx: 196, cy: 176, rx: 4, ry: 2, fill: '#fff', opacity: 0.6 });
  const S = 0.85;
  const me = k.buddy({ x: -40, y: FY + 6, scale: S });
  const fr = person(k, 'coral', { x: 440, y: FY + 6, scale: S, facing: -1 });
  const cupA = g({}), cupB = g({});
  [cupA, cupB].forEach((c) => { el('path', { d: 'M -6 -14 L 6 -14 L 4 2 L -4 2 Z', fill: '#FFE7A8', stroke: pal.sub, 'stroke-width': 1.5 }, c); });
  const ding = g({});
  [-30, 0, 30].forEach((a) => el('line', { x1: 0, y1: -8, x2: 0, y2: -16, stroke: pal.yellowDark, 'stroke-width': 2.4, 'stroke-linecap': 'round', transform: `rotate(${a})` }, ding));
  const mx = path([[0.3, -40], [2.2, 148]]), fx = path([[0.5, 440], [2.3, 252]]);
  return {
    update(t) {
      walk(me, mx, t, { y: FY + 6, look: 0.5, mood: t > 2.2 ? 'grin' : 'smile' });
      walk(fr, fx, t, { y: FY + 6, facing: -1, look: -0.5, mood: t > 2.4 ? 'grin' : 'smile' });
      const grab = easeOut(seg(t, 2.25, 2.55));
      const raise = easeOut(seg(t, 2.7, 3.05)) * (1 - easeInOut(seg(t, 3.8, 4.2)));
      if (t > 2.2) { const ar = lerp(20, 108, grab) + 34 * raise; me.pose({ armR: ar }); fr.pose({ armR: ar }); }
      const a = hp(me, S, 'R'), b = hp(fr, S, 'R');
      const hold = t > 2.55;
      tf(cupA, hold ? a.x : 192, hold ? a.y + 6 : 188); tf(cupB, hold ? b.x : 208, hold ? b.y + 6 : 188);
      const d = seg(t, 3.05, 3.5);
      ding.setAttribute('opacity', d > 0 && d < 1 ? 1 - d : 0); tf(ding, (a.x + b.x) / 2, Math.min(a.y, b.y) - 14, 0, 0.7 + d * 0.5);
      void wobble; void hump;
    }
  };
}
