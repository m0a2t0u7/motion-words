import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';
const D = Math.PI / 180;
// 手(R/L)を点(tx,ty)へ向ける腕の角度
function aim(b, S, tx, ty, side = 'R') {
  const s = b.state, f = s.facing, o = side === 'R' ? 1 : -1;
  return Math.atan2((tx - (s.x + 27 * S * f * o)) * f * o, ty - (s.y - 56 * S - s.lift)) / D;
}
function cursor(k, parent) {
  return k.el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: k.pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, parent);
}
function pen(k, parent, c) {
  const p = k.g({}, parent);
  k.el('line', { x1: 0, y1: 0, x2: -22, y2: -6, stroke: c || k.pal.coralDark, 'stroke-width': 5, 'stroke-linecap': 'round' }, p);
  k.el('path', { d: 'M 0 0 L 6 1.6 L 0 3 Z', fill: '#F4D9B5' }, p);
  k.el('circle', { cx: 5.2, cy: 1.7, r: 1.1, fill: k.pal.ink }, p);
  return p;
}

// check-over：出かける前に、自転車の各部を順に確かめてひと通り点検する（He checked over the bike before the trip.）
export const meta = { duration: 4.2, beats: [[0, '自転車'], [1.3, '各部を確認'], [3.4, '点検済み']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const S = 1.1;
  const bike = g({});
  k.shadow(290, FY + 1, 100, 6, bike);
  const wheel = (cx) => {
    const w = g({ transform: `translate(${cx} ${FY - 26})` }, bike);
    el('circle', { r: 26, fill: 'none', stroke: '#4A5568', 'stroke-width': 5 }, w);
    el('circle', { r: 21, fill: 'none', stroke: '#C7CFDA', 'stroke-width': 1.5 }, w);
    for (let i = 0; i < 6; i++) el('line', { x1: 0, y1: 0, x2: 0, y2: 21, stroke: '#C7CFDA', 'stroke-width': 1.5, transform: `rotate(${i * 30})` }, w);
    el('circle', { r: 4, fill: '#8892A3' }, w);
  };
  wheel(244); wheel(346);
  const P = { rear: [244, FY - 26], front: [346, FY - 26], crank: [286, FY - 24], seat: [270, FY - 76], bar: [330, FY - 80] };
  const fr = { stroke: pal.blue, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  el('path', { d: `M ${P.rear} L ${P.crank} L 262 ${FY - 70} L ${P.rear} M ${P.crank} L 322 ${FY - 70} L 262 ${FY - 70} M 322 ${FY - 70} L ${P.front} M 322 ${FY - 70} L ${P.bar}`, ...fr }, bike);
  el('line', { x1: 262, y1: FY - 70, x2: 270, y2: FY - 76, stroke: '#4A5568', 'stroke-width': 4, 'stroke-linecap': 'round' }, bike);
  el('rect', { x: 260, y: FY - 80, width: 20, height: 6, rx: 3, fill: '#4A5568' }, bike);
  el('line', { x1: 326, y1: FY - 84, x2: 338, y2: FY - 84, stroke: '#4A5568', 'stroke-width': 4, 'stroke-linecap': 'round' }, bike);
  el('circle', { cx: 286, cy: FY - 24, r: 6, fill: '#8892A3' }, bike);
  // 点検する場所（後輪 → サドル → ハンドル → 前輪）
  const spots = [[244, FY - 54], [270, FY - 94], [332, FY - 100], [346, FY - 58]];
  const marks = spots.map(([x, y]) => {
    const m = g({});
    el('circle', { r: 11, fill: pal.green }, m);
    el('path', { d: 'M -5 0 L -1.5 4 L 5.5 -4', stroke: '#fff', 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, m);
    tf(m, x, y);
    return m;
  });
  const sc = el('circle', { r: 17, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 });
  const b = k.buddy({ x: 170, y: FY, scale: S });
  const T = [1.0, 1.7, 2.4, 3.1];
  return {
    update(t) {
      let cur = 0;
      T.forEach((tt, i) => { if (t >= tt - 0.3) cur = i; });
      const prev = Math.max(0, cur - 1);
      const mv = cur === 0 ? 1 : easeInOut(seg(t, T[cur] - 0.3, T[cur] - 0.05));
      const [sx, sy] = [lerp(spots[prev][0], spots[cur][0], mv), lerp(spots[prev][1], spots[cur][1], mv)];
      tf(sc, sx, sy, 0, 1 + 0.08 * Math.sin(t * 9));
      k.set(sc, { opacity: t > 0.6 && t < 3.5 ? 1 : 0 });
      marks.forEach((m, i) => {
        const p = backOut(seg(t, T[i] + 0.05, T[i] + 0.3));
        tf(m, spots[i][0], spots[i][1], 0, p);
      });
      const reach = easeInOut(seg(t, 0.4, 0.9)) * (1 - easeInOut(seg(t, 3.5, 4.0)));
      const look = t < 0.6 ? 1 : 1;
      const wob = Math.sin(t * 8) * 4;
      b.pose({ armR: lerp(8, aim(b, S, sx - 10, sy + 20) + wob * 0.5, reach), lean: 6 * reach, look, mood: t > 3.4 ? 'grin' : 'smile', blink: t > 0.2 && t < 0.3 ? 1 : 0 });
    }
  };
}
