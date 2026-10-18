// cut into：上司が追加の書類を机に積み、1日の帯で「仕事」が「自由時間」に食い込んで短くなる（例文 The extra work cut into my free time.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach, room, gait } from './dig.js';
import { papers, grip } from './hand-over.js';

export const meta = { duration: 4.6, beats: [[0, '仕事と自由時間'], [1.8, '追加の仕事'], [3.6, '自由時間が減った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k);
  // 1日の帯（壁）：左＝仕事（青）、右＝自由時間（緑とボールの印）
  const X0 = 60, X1 = 340, Y = 50;
  el('rect', { x: X0 - 4, y: Y - 4, width: X1 - X0 + 8, height: 36, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const free = el('rect', { x: 230, y: Y, width: X1 - 230, height: 28, rx: 5, fill: pal.green });
  const work = el('rect', { x: X0, y: Y, width: 170, height: 28, rx: 5, fill: pal.blue });
  const ball = g({}); el('circle', { r: 9, fill: '#fff' }, ball); el('path', { d: 'M -9 0 Q 0 -5 9 0', stroke: pal.green, 'stroke-width': 2, fill: 'none' }, ball);
  const pen = g({}); el('rect', { x: -3, y: -8, width: 6, height: 16, rx: 2, fill: '#fff' }, pen); el('rect', { x: -5, y: 6, width: 10, height: 3, fill: '#fff' }, pen);
  tf(pen, 100, Y + 14);
  const bite = el('path', { d: '', fill: pal.red, opacity: 0.0 });
  const S = 1.1;
  const me = k.buddy({ x: 120, y: 230, scale: S });
  const boss = k.buddy({ x: 430, y: 230, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  R.front();
  const TY = 196;
  const stack = g({}); for (let i = 0; i < 3; i++) el('rect', { x: 150, y: TY - 5 - i * 5, width: 40, height: 5, rx: 1, fill: '#fff', stroke: pal.line, 'stroke-width': 1.2 }, stack);
  const extra = papers(k, 4);
  const gB = grip(k, pal.coral, pal.coralDark, S);
  const xf = (t) => t < 2.3 ? lerp(430, 270, easeOut(seg(t, 0.4, 1.4))) : lerp(270, 440, easeInOut(seg(t, 2.6, 3.8)));
  return {
    update(t) {
      const p = gait(xf, t, 430);
      const put = easeInOut(seg(t, 1.4, 2.0));
      boss.pose({ x: p.x, walk: p.walk, armL: p.armL, lean: p.lean + 8 * hump(seg(t, 1.4, 2.3)), facing: t > 2.4 ? 1 : -1, look: 0.6, mood: 'smile' });
      const target = { x: 172, y: TY - 26 };
      boss.pose({ armR: t < 2.3 ? lerp(70, reach(boss, S, 'R', target.x, target.y), put) : p.armR });
      const h = hp(boss, S, 'R');
      const onDesk = t > 2.05;
      tf(extra, onDesk ? 172 : h.x, onDesk ? TY - 24 : h.y - 8, onDesk ? 0 : -6);
      gB(t < 2.05 ? h : { x: -60, y: -60 });
      // 帯：仕事がのびて自由時間に食い込む
      const grow = easeInOut(seg(t, 2.4, 3.6));
      const wx = lerp(230, 300, grow);
      k.set(work, { width: wx - X0 });
      k.set(free, { x: wx, width: X1 - wx });
      tf(ball, lerp(285, 320, grow), Y + 14, 0, lerp(1, 0.8, grow));
      const sad = seg(t, 2.8, 3.4);
      me.pose({ lean: 6, look: t > 2.4 ? -0.6 : 0.5, mood: sad > 0.3 ? 'sad' : 'flat', squash: 1 - 0.05 * sad, armL: 10, armR: 60 + 6 * Math.sin(t * 10) * (1 - sad) });
      bite.setAttribute('opacity', 0);
    }
  };
}
