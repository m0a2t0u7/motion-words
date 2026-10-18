// get around：自転車に乗って、パン屋・図書館・公園と町のあちこちを回る（例文 It is easy to get around the city by bike.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { pop } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '自転車で'], [1.8, 'あちこち回る'], [3.8, '町をひと回り']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const spots = [[80, pal.coral, 'bread'], [200, pal.blue, 'book'], [320, pal.green, 'tree']];
  const pins = spots.map(([x, c, kind]) => {
    el('rect', { x: x - 44, y: FY - 96, width: 88, height: 96, rx: 4, fill: '#F3E6DC' });
    el('rect', { x: x - 48, y: FY - 104, width: 96, height: 12, rx: 3, fill: c });
    el('rect', { x: x - 14, y: FY - 44, width: 28, height: 44, fill: '#fff', opacity: 0.6 });
    const ic = g({}); tf(ic, x, FY - 70);
    if (kind === 'bread') el('path', { d: 'M -12 6 Q -14 -8 0 -8 Q 14 -8 12 6 Z', fill: '#E2B680' }, ic);
    else if (kind === 'book') { el('rect', { x: -12, y: -8, width: 11, height: 16, fill: pal.blue }, ic); el('rect', { x: 1, y: -8, width: 11, height: 16, fill: pal.blueDark }, ic); }
    else { el('circle', { cy: -4, r: 10, fill: pal.green }, ic); el('rect', { x: -2, y: 4, width: 4, height: 6, fill: pal.woodDark }, ic); }
    const pin = g({});
    el('path', { d: 'M 0 0 Q -10 -12 -10 -18 A 10 10 0 1 1 10 -18 Q 10 -12 0 0 Z', fill: pal.red }, pin);
    el('circle', { cy: -18, r: 4, fill: '#fff' }, pin);
    return { pin, x };
  });
  el('rect', { x: 0, y: FY, width: 400, height: 8, fill: '#E3E8EE' });
  const bike = g({});
  const sh = k.shadow(0, FY + 10, 34, 4, bike);
  const wheels = [-22, 22].map((x) => { const w = g({}, bike); tf(w, x, FY - 4); el('circle', { r: 13, fill: 'none', stroke: pal.ink, 'stroke-width': 3 }, w); [0, 60, 120].forEach((a) => el('line', { x1: 0, y1: -12, x2: 0, y2: 12, stroke: pal.sub, 'stroke-width': 1.4, transform: `rotate(${a})` }, w)); return w; });
  el('path', { d: `M -22 ${FY - 4} L -4 ${FY - 26} L 16 ${FY - 26} L 22 ${FY - 4} M -4 ${FY - 26} L 2 ${FY - 4} L 16 ${FY - 26} M 16 ${FY - 26} L 14 ${FY - 34}`, stroke: pal.coralDark, 'stroke-width': 3.5, fill: 'none', 'stroke-linejoin': 'round' }, bike);
  const b = k.buddy({ parent: bike, x: -4, y: FY - 14, scale: 0.6 });
  b.g.firstChild.setAttribute('opacity', 0);
  // 各場所で一度止まる
  const P = [[0, -40], [0.9, 80], [1.3, 80], [2.2, 200], [2.6, 200], [3.5, 320], [4.4, 320]];
  const xf = (t) => { for (let i = 1; i < P.length; i++) if (t <= P[i][0]) return lerp(P[i - 1][1], P[i][1], easeInOut(seg(t, P[i - 1][0], P[i][0]))); return 320; };
  return {
    update(t) {
      const x = xf(t);
      tf(bike, x, 0);
      void sh;
      wheels.forEach((w, i) => tf(w, i ? 22 : -22, FY - 4, (x + 40) * 4.4));
      b.pose({ walk: (x + 40) * 0.12, armR: 70, armL: 70, lean: 8, look: 0.4, mood: 'grin' });
      pins.forEach((p, i) => { const q = pop(seg(t, [0.9, 2.2, 3.5][i], [1.2, 2.5, 3.8][i])); tf(p.pin, p.x + 30, FY - 108 - 4 * hump(seg(t, [0.9, 2.2, 3.5][i], [1.4, 2.7, 4.0][i])), 0, Math.max(0.001, q)); });
    }
  };
}
