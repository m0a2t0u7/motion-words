// retire：65歳の祖父が、同僚から花束を受け取り、手を振って職場を去る（例文 My grandfather retired at sixty-five.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '仕事中'], [1.6, '花束をもらう'], [3.2, '職場を去る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁の「65」札、窓、出口
  const sg = g({}); tf(sg, 200, 70);
  el('circle', { r: 28, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 4 }, sg);
  k.text(0, 1, '65', { 'font-size': 26, fill: pal.ink }, sg);
  el('rect', { x: 340, y: 100, width: 60, height: 136, fill: '#D9E3EE' });
  el('rect', { x: 346, y: 106, width: 48, height: 130, rx: 3, fill: '#F1E4C8' });
  el('rect', { x: 352, y: 84, width: 36, height: 14, rx: 3, fill: pal.green });
  // 机（奥）
  el('rect', { x: 70, y: 190, width: 130, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 78, y: 200, width: 8, height: 36, fill: pal.woodDark }); el('rect', { x: 184, y: 200, width: 8, height: 36, fill: pal.woodDark });
  el('rect', { x: 118, y: 176, width: 40, height: 4, fill: '#C8D0DC' });
  el('rect', { x: 122, y: 146, width: 32, height: 30, rx: 3, fill: '#E4E9F1', stroke: '#B5BFCE', 'stroke-width': 2 });
  el('rect', { x: 126, y: 150, width: 24, height: 20, rx: 2, fill: '#fff' });
  el('ellipse', { cx: 200, cy: 262, rx: 170, ry: 12, fill: '#F1D9CF' });
  const gp = k.buddy({ x: 100, y: FY, facing: 1, color: pal.blue, dark: pal.blueDark });
  // 祖父らしさ：白髪、眼鏡、口ひげ
  [[-24, -66], [24, -66]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 7, ry: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, gp.body));
  el('path', { d: 'M -18 -80 Q 0 -90 18 -80 Q 0 -77 -18 -80 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, gp.body);
  const fa = gp.body.children[3];
  [-10, 10].forEach((x) => el('circle', { cx: x, cy: -54, r: 7.5, fill: 'none', stroke: pal.ink, 'stroke-width': 1.8 }, fa));
  el('path', { d: 'M -9 -46 Q 0 -42 9 -46 Q 0 -49 -9 -46 Z', fill: '#fff', stroke: pal.sub, 'stroke-width': 1 }, fa);
  const co = k.buddy({ x: -30, y: FY, facing: 1, scale: 0.92 });
  const bq = g({});
  el('path', { d: 'M -6 14 L 0 0 L 6 14 Z', fill: pal.green }, bq);
  [[-8, -6, pal.coral], [0, -12, pal.yellow], [8, -6, pal.violet], [0, -3, '#fff']].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 6, fill: c, stroke: 'rgba(40,52,70,0.18)', 'stroke-width': 1 }, bq));
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const cx = (t) => lerp(-30, 52, easeInOut(seg(t, 0.8, 1.9)));
  const gx = (t) => lerp(100, 330, easeInOut(seg(t, 2.6, 4.2)));
  return {
    update(t) {
      const type = t < 1.2 ? 1 : 0, ty = Math.sin(t * 20);
      const take = easeInOut(seg(t, 1.9, 2.4)), give = easeOut(seg(t, 1.7, 2.1));
      const pc = gait(cx, t, -30, 14, 0.11), pg = gait(gx, t, 100, 12, 0.1);
      const walking = t > 2.6 ? 1 : 0, wave = t > 3.4 ? Math.sin(t * 10) * 14 : 0;
      P(co, { x: pc.x, walk: pc.walk, armR: lerp(pc.armR, 80, give) * (1 - seg(t, 2.4, 2.9)) + 8 * seg(t, 2.4, 2.9), armL: pc.armL, lean: pc.lean, look: 0.5, mood: 'grin' });
      P(gp, { x: pg.x, walk: pg.walk, armR: type ? 55 + 8 * ty : lerp(55, 85, take) * (1 - walking) + walking * (pg.armR + 20), armL: type ? -35 - 8 * ty : walking && t > 3.3 ? 150 + wave : 8, lean: type ? 6 : pg.lean, look: type ? 0.4 : 0.5, mood: t > 1.9 ? 'grin' : 'smile' });
      const hg = hp(co, 0.92, 'R'), hr = hp(gp, 1, 'R');
      const from = t < 1.9 ? hg : null;
      const pos = t < 2.2 ? { x: lerp(hg.x, hr.x, take), y: lerp(hg.y, hr.y, take) } : hr;
      tf(bq, pos.x + 2, pos.y - 10, 8, t > 1.0 ? 1 : 0.001);
      bq.setAttribute('opacity', t > 1.0 ? 1 : 0);
    }
  };
}
