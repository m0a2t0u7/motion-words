// lazy：目覚ましが鳴っても、まめはふとんを引き上げて動かない。時計は昼になり、日も高くなる（例文 I felt lazy and stayed in bed all morning.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, homeBg, sym } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '目覚ましが鳴る'], [1.4, '起きない'], [3.0, '昼までベッド']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = homeBg(k, { winX: 250, winW: 120, winH: 90, winY: 30, sky: '#CDE8FA' });
  const sun = el('circle', { r: 13, fill: pal.yellow });
  el('rect', { x: 250, y: 30, width: 120, height: 90, rx: 5, fill: 'none', stroke: '#fff', 'stroke-width': 5 });
  // ベッド（頭が左）
  const MT = FY - 40;
  k.shadow(150, FY + 2, 120, 6);
  el('rect', { x: 26, y: FY - 104, width: 14, height: 104, rx: 5, fill: pal.woodDark });
  el('rect', { x: 262, y: FY - 64, width: 12, height: 64, rx: 5, fill: pal.woodDark });
  el('rect', { x: 36, y: MT, width: 230, height: 22, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 36, y: MT + 18, width: 230, height: 10, fill: pal.wood });
  el('ellipse', { cx: 72, cy: MT - 6, rx: 30, ry: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  // 寝ているまめ（体ごと 90° 寝かせる）
  const lay = g({}); tf(lay, 172, MT - 26, -90);
  const b = k.buddy({ x: 0, y: 0, scale: S, parent: lay });
  [b.armL.a, b.armR.a, b.g.children[0]].forEach((n) => n.setAttribute('display', 'none'));
  const quilt = el('path', { d: '' , fill: '#F7B9A6', stroke: '#E89A84', 'stroke-width': 3 });
  // 枕元の台と目覚まし時計
  el('rect', { x: 300, y: FY - 50, width: 60, height: 50, rx: 4, fill: pal.wood });
  const clk = g({});
  el('circle', { r: 16, fill: '#fff', stroke: pal.red, 'stroke-width': 4 }, clk);
  [-1, 1].forEach((d) => el('circle', { cx: d * 11, cy: -16, r: 5, fill: pal.red }, clk));
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -8, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, clk);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -12, stroke: pal.ink, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, clk);
  const ring = [0, 1].map(() => el('path', { d: 'M 0 -8 Q 5 0 0 8', stroke: pal.red, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const yawn = sym(k, '~', pal.sub, 28);
  return {
    update(t) {
      const rr = seg(t, 0.3, 1.5) > 0 && t < 1.5;
      const shake = rr ? Math.sin(t * 60) * 6 : 0;
      tf(clk, 330, FY - 68 + (rr ? -2 * Math.abs(Math.sin(t * 60)) : 0), shake);
      ring.forEach((r, i) => { tf(r, 330 + (i ? 26 : -26), FY - 70, 0, i ? 1 : -1, 1); r.setAttribute('opacity', rr ? 1 : 0); });
      // 時計の針：7時→12時
      const hrs = lerp(7, 12, easeInOut(seg(t, 1.6, 4.0)));
      tf(hh, 0, 0, hrs * 30); tf(mh, 0, 0, (hrs % 1) * 360);
      const sp = seg(t, 1.6, 4.0);
      k.set(sun, { cx: lerp(270, 340, sp), cy: lerp(110, 52, easeOut(sp)) });
      const pull = easeInOut(seg(t, 1.4, 1.9)), yw = hump(seg(t, 2.4, 3.2));
      P(b, { x: 0, y: 0, armL: 8, armR: 8, look: t < 1.4 ? 0.8 * seg(t, 0.6, 0.9) : 0, mood: yw > 0.2 ? 'open' : 'flat', blink: t > 1.4 ? 0.65 + 0.35 * hump(seg(t, 3.4, 3.7)) : 0.3 * (1 - seg(t, 0.4, 0.7)) });
      yawn(seg(t, 2.6, 2.9) * (1 - seg(t, 3.4, 3.6)), 70, MT - 60);
      // ふとん：首元まで → 引き上げて鼻の下まで
      const top = lerp(124, 112, pull);
      k.set(quilt, { d: `M ${top - 4} ${MT + 6} Q ${top - 8} ${MT - 40} ${top + 30} ${MT - 40} L 250 ${MT - 34} Q 266 ${MT - 30} 264 ${MT + 6} Z` });
    }
  };
}
