// glow：暗い部屋で、まめがマッチでろうそくに火をつけると、やわらかな光が広がる（例文 The candle glowed in the dark room.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, '暗い部屋'], [1.4, '火をつける'], [3.0, 'ろうそくが光る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const NS = 'http://www.w3.org/2000/svg';
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 部屋：窓・本棚・壁の絵
  el('rect', { x: 36, y: 40, width: 78, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 75, y1: 40, x2: 75, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 262, y: 70, width: 100, height: 6, rx: 3, fill: pal.woodDark });
  [[270, pal.coral], [286, pal.blue], [300, pal.yellow], [318, pal.violet], [334, pal.mint]].forEach(([x, c]) => el('rect', { x, y: 44, width: 12, height: 26, rx: 2, fill: c }));
  el('rect', { x: 150, y: 44, width: 54, height: 44, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('path', { d: 'M 154 84 L 170 66 L 180 76 L 190 62 L 200 84 Z', fill: pal.mint });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  const S = 1.0;
  const me = k.buddy({ x: 156, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  // ろうそく
  const CX = 214, CT = 172;
  k.shadow(CX, 202, 14, 3);
  el('rect', { x: CX - 7, y: CT, width: 14, height: 28, rx: 3, fill: '#FFF3E0', stroke: '#F0DDBF', 'stroke-width': 1.2 });
  el('rect', { x: CX - 18, y: 198, width: 36, height: 4, rx: 2, fill: pal.woodDark });
  el('line', { x1: CX, y1: CT, x2: CX, y2: CT - 6, stroke: pal.ink, 'stroke-width': 1.6, 'stroke-linecap': 'round' });
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const match = g({});
  el('rect', { x: -1.5, y: -2, width: 3, height: 22, rx: 1.5, fill: pal.woodDark }, match);
  el('ellipse', { cx: 0, cy: -2, rx: 3, ry: 3.6, fill: pal.red }, match);
  const mflame = g({}, match); tf(mflame, 0, -6);
  el('path', { d: 'M 0 -9 Q 5 -2 0 3 Q -5 -2 0 -9 Z', fill: '#FFB43A' }, mflame);
  // 暗がり：ろうそくの周りだけ穴があくマスク
  const gid = 'gl-rg', mid = 'gl-mask';
  const rg = el('radialGradient', { id: gid, cx: 0.5, cy: 0.5, r: 0.5 }, k.defs);
  [[0, '#000', 1], [0.4, '#000', 1], [1, '#fff', 1]].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': 1 }, rg));
  const mask = el('mask', { id: mid, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: 400, height: 300 }, k.defs);
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#fff' }, mask);
  const hole = el('circle', { cx: CX, cy: CT - 8, r: 1, fill: `url(#${gid})` }, mask);
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#1E1B3A', opacity: 0.86, mask: `url(#${mid})` });
  // 暖かい光
  const hid = 'gl-halo';
  const hg = el('radialGradient', { id: hid, cx: 0.5, cy: 0.5, r: 0.5 }, k.defs);
  [[0, '#FFE9A8', 0.75], [0.5, '#FFC95C', 0.25], [1, '#FFB43A', 0]].forEach(([o, c, a]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': a }, hg));
  const halo = el('circle', { cx: CX, cy: CT - 8, r: 1, fill: `url(#${hid})` });
  const flame = g({});
  el('path', { d: 'M 0 -18 Q 8 -6 0 3 Q -8 -6 0 -18 Z', fill: '#FFB43A' }, flame);
  el('path', { d: 'M 0 -10 Q 4 -4 0 2 Q -4 -4 0 -10 Z', fill: '#FFF3C4' }, flame);
  const mfl = mflame;

  return {
    update(t) {
      const reachP = easeInOut(seg(t, 0.5, 1.5)), away = easeInOut(seg(t, 2.1, 2.9));
      const lit = t >= 1.6;
      me.pose({ x: 156, armL: 8, lean: 3 * reachP, look: 0.6, mood: lit ? 'smile' : 'flat', squash: 1, armR: 30 });
      const a = lerp(30, reach(me, S, 'R', CX - 3, CT - 14), reachP);
      me.pose({ armR: lerp(a, 24, away) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      tf(match, h.x + 3, h.y - 3, -(lerp(-20, 0, reachP)) * 0 + 8, 1);
      const mOn = t > 0.5 && t < 2.2 ? 1 : 0;
      mfl.setAttribute('opacity', mOn);
      tf(mfl, 0, -6, 0, 1 + 0.12 * Math.sin(t * 25));
      match.setAttribute('opacity', t < 3.0 ? 1 : 0);
      const grow = easeOut(seg(t, 1.6, 3.6));
      const R = 14 + 170 * grow;
      k.set(hole, { r: R });
      k.set(halo, { r: 8 + 120 * grow });
      const fl = 1 + 0.08 * Math.sin(t * 17) + 0.05 * Math.sin(t * 29);
      flame.setAttribute('opacity', lit ? 1 : 0);
      tf(flame, CX + 0.8 * Math.sin(t * 11), CT - 6, 3 * Math.sin(t * 13), backOut(seg(t, 1.6, 2.0)) * fl + 0.001, fl * backOut(seg(t, 1.6, 2.0)) + 0.001);
    }
  };
}
