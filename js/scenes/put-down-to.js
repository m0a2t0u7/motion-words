// put down to：待ち合わせに相手が遅れて駆け込んでくる。まめは時計を見たあと、頭の中で「渋滞」を思い浮かべ、遅刻の原因はそれだと結びつけてうなずく（例文 I put his lateness down to the heavy traffic.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { gait } from './dig.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '遅れて来た'], [2.0, '渋滞を思う'], [3.6, '渋滞のせい']] };

function car(k, parent, c) {
  const g = k.g({}, parent);
  k.el('rect', { x: -14, y: -12, width: 28, height: 10, rx: 4, fill: c }, g);
  k.el('rect', { x: -8, y: -18, width: 16, height: 8, rx: 3, fill: c }, g);
  k.el('circle', { cx: -8, cy: -2, r: 3.5, fill: k.pal.ink }, g); k.el('circle', { cx: 8, cy: -2, r: 3.5, fill: k.pal.ink }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 街の時計
  el('rect', { x: 66, y: 110, width: 6, height: 126, fill: pal.sub });
  el('circle', { cx: 69, cy: 100, r: 18, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  el('line', { x1: 69, y1: 100, x2: 69, y2: 88, stroke: pal.ink, 'stroke-width': 2.4 });
  const mh = el('line', { x1: 69, y1: 100, x2: 79, y2: 100, stroke: pal.red, 'stroke-width': 2.4 });
  const me = k.buddy({ x: 140, y: FY, scale: 0.9 });
  const him = k.buddy({ x: 460, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const sweat = [0, 1].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));
  // 考えの吹き出し（渋滞）
  const th = g({});
  [[-56, 50, 4], [-46, 38, 6]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th));
  el('rect', { x: -50, y: -28, width: 116, height: 58, rx: 22, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th);
  el('rect', { x: -40, y: 8, width: 96, height: 4, rx: 2, fill: '#C9CED6' }, th);
  [[-28, pal.red], [-4, pal.blue], [20, pal.yellowDark], [44, pal.violet]].forEach(([x, c]) => tf(car(k, th, c), x, 8));
  [[-28, -18], [20, -18]].forEach(([x, y]) => el('path', { d: `M ${x - 6} ${y} l 4 -6 l 4 6 M ${x + 4} ${y} l 4 -6 l 4 6`, stroke: pal.red, 'stroke-width': 2, fill: 'none' }, th));
  const link = el('path', { d: 'M 230 132 Q 236 120 230 108', stroke: pal.mintDark, 'stroke-width': 3, 'stroke-dasharray': '4 4', fill: 'none', opacity: 0 });
  const xf = (t) => lerp(460, 250, easeOut(seg(t, 0.6, 1.8)));
  return {
    update(t) {
      const ang = (seg(t, 0, 1.6) * 60 + 30) * Math.PI / 180;
      k.set(mh, { x2: 69 + Math.sin(ang) * 14, y2: 100 - Math.cos(ang) * 14 });
      // まめ：時計を見て待つ→遅れて来た相手を見る→考える→うなずく
      const wait = t < 1.4, think = easeInOut(seg(t, 2.0, 2.4)), nod = hump(seg(t, 3.4, 3.7)) + hump(seg(t, 3.75, 4.05));
      me.pose({ facing: wait ? -1 : 1, look: wait ? 0.6 : 0.5, armR: wait ? 20 : lerp(10, 140, think) * (1 - easeInOut(seg(t, 3.2, 3.5))) + 10, armL: wait ? 10 + 6 * Math.sin(t * 3) : 10,
        lean: 8 * nod - 4 * think * (1 - seg(t, 3.2, 3.5)), mood: t > 3.4 ? 'smile' : think > 0.5 ? 'flat' : 'flat', blink: 0 });
      // 相手：走って到着→息を切らす
      const p = gait(xf, t, 460, 30, 0.14);
      const pant = t > 1.8 ? Math.abs(Math.sin(t * 9)) : 0;
      him.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: t > 1.8 ? lerp(p.armR, 150, seg(t, 3.5, 3.8)) : p.armR, lean: p.lean * 3 + 8 * pant * (1 - seg(t, 3.2, 3.6)), squash: 1 - 0.04 * pant, mood: t > 1.8 ? (t > 3.6 ? 'smile' : 'open') : 'flat', look: 0.4 });
      sweat.forEach((s, i) => { const q = (t * 1.2 + i * 0.5) % 1; k.set(s, { transform: `translate(${him.state.x + (i ? 30 : -30)} ${150 + q * 16})`, opacity: t > 1.0 && t < 3.6 ? 1 - q : 0 }); });
      const ts = seg(t, 2.2, 2.6);
      tf(th, 222, 70, 0, backOut(ts) || 0.001); th.setAttribute('opacity', ts > 0 ? 1 : 0);
      link.setAttribute('opacity', 0);
    }
  };
}
