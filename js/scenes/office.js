// office：事務所の机でまめがパソコン仕事を続け、壁の時計が6時になると立ち上がって帰り支度をする（例文 I'll be at the office until six.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, officeBg, desk, monitor, papers, chair } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '事務所で仕事'], [1.6, '時間が進む'], [3.4, '6時まで']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = officeBg(k, 236, 40);
  const sky = el('rect', { x: 44, y: 44, width: 92, height: 66, fill: '#FCD3A8', opacity: 0 });
  // 壁の時計：5時→6時
  el('circle', { cx: 300, cy: 64, r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  for (let i = 0; i < 12; i++) el('line', { x1: 300 + 21 * Math.sin(i * Math.PI / 6), y1: 64 - 21 * Math.cos(i * Math.PI / 6), x2: 300 + 24 * Math.sin(i * Math.PI / 6), y2: 64 - 24 * Math.cos(i * Math.PI / 6), stroke: pal.ink, 'stroke-width': 2 });
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -19, stroke: pal.ink, 'stroke-width': 2.2, 'stroke-linecap': 'round' });
  chair(k, 180, FY, 30, '#7F93AD');
  const b = k.buddy({ x: 180, y: FY - 20, scale: S });
  const top = desk(k, 200, 150, FY);
  const mon = monitor(k, 290, top);
  const pp = papers(k, 3); tf(pp, 236, top - 6, 0, 1);
  return {
    update(t) {
      const tt = lerp(5, 6, easeInOut(seg(t, 0.4, 3.2)));
      tf(hh, 300, 64, tt * 30); tf(mh, 300, 64, (tt % 1) * 360 + (tt >= 6 ? 360 : 0));
      sky.setAttribute('opacity', seg(t, 1.0, 3.2) * 0.9);
      const up = easeInOut(seg(t, 3.3, 3.8)), str = hump(seg(t, 3.7, 4.4));
      const typing = t < 3.3;
      P(b, { x: 180, y: lerp(FY - 20, FY, up), facing: 1, lean: typing ? 8 : -6 * str, armL: 10, armR: 10, look: typing ? 0.9 : 0.2, mood: up > 0.5 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (typing) { aim(b, S, 'R', 262 + 4 * Math.sin(t * 24), top - 4); aim(b, S, 'L', 248 - 4 * Math.sin(t * 24), top - 4); }
      else b.pose({ armL: lerp(10, 165, str), armR: lerp(10, 165, str) });
      mon.screen.setAttribute('fill', typing ? (Math.sin(t * 6) > 0 ? '#9FD0F2' : '#B7DDF6') : '#3E4A5C');
    }
  };
}
