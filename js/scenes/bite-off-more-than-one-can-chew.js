// bite off more than one can chew：大きすぎるバーガーをかじり、口いっぱいで噛みきれない（例文 I bit off more than I could chew.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '特大バーガー'], [1.5, '大きくかじる'], [2.8, '噛みきれない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const b = k.buddy({ x: 200, y: FY, scale: 1.1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, facing: 1 };

  // バーガー（原点＝中心）
  const burger = g({});
  el('ellipse', { cx: 0, cy: 22, rx: 44, ry: 9, fill: '#D9A25E' }, burger);
  el('path', { d: 'M -46 -4 Q -46 -34 0 -34 Q 46 -34 46 -4 Z', fill: '#E8B06A' }, burger);
  [[-20, -20], [0, -26], [20, -18]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 3.5, ry: 2, fill: '#FFF1D2' }, burger));
  el('path', { d: 'M -50 -2 Q -40 6 -30 -2 Q -20 6 -10 -2 Q 0 6 10 -2 Q 20 6 30 -2 Q 40 6 50 -2 L 50 2 L -50 2 Z', fill: pal.green }, burger);
  el('rect', { x: -46, y: 2, width: 92, height: 9, rx: 4, fill: '#8A5A3C' }, burger);
  el('rect', { x: -46, y: 10, width: 92, height: 4, fill: pal.yellow }, burger);
  el('path', { d: 'M -46 12 L 46 12 L 46 20 Q 0 30 -46 20 Z', fill: '#E8B06A' }, burger);
  // かみ跡（マスクで欠けさせる）
  const mk = el('mask', { id: 'bm', maskUnits: 'userSpaceOnUse', x: -80, y: -60, width: 160, height: 120 }, k.defs);
  el('rect', { x: -80, y: -60, width: 160, height: 120, fill: '#fff' }, mk);
  const bite = g({}, mk);
  el('circle', { cx: 0, cy: -16, r: 14, fill: '#000' }, bite);
  el('circle', { cx: 6, cy: 4, r: 13, fill: '#000' }, bite);
  el('circle', { cx: 2, cy: 22, r: 12, fill: '#000' }, bite);
  burger.setAttribute('mask', 'url(#bm)');

  // ほお（ふくらみ）と汗
  const cheeks = g({});
  const cl = el('circle', { cx: -26, cy: -42, r: 14, fill: '#FF9C8C', opacity: 0.0 }, cheeks);
  const cr = el('circle', { cx: 26, cy: -42, r: 14, fill: '#FF9C8C', opacity: 0.0 }, cheeks);
  const sweat = el('path', { d: 'M 0 -10 Q 6 0 0 6 Q -6 0 0 -10 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.5 });

  return {
    update(t) {
      const up = easeInOut(seg(t, 0.5, 1.2)) * (1 - easeInOut(seg(t, 1.7, 2.2)));
      const chew = seg(t, 2.0, 3.8);
      const biteP = easeOut(seg(t, 1.3, 1.6));
      const arm = lerp(28, 112, up);
      const back = easeOut(seg(t, 1.9, 2.3));
      const jiggle = t > 2.0 ? Math.sin((t - 2.0) * 10) : 0;
      b.pose({ ...base, armL: arm - 5, armR: arm - 5, look: 0, lean: -4 * back, mood: t < 1.0 ? 'smile' : t < 1.8 ? 'open' : 'flat', squash: 1 - 0.03 * Math.max(0, jiggle) * (t > 2.0 ? 1 : 0), blink: t > 2.6 ? 0.6 : 0 });
      const hL = b.handPos('L'), hR = b.handPos('R');
      const sc = lerp(0.68, 0.8, up);
      tf(burger, (hL.x + hR.x) / 2, (hL.y + hR.y) / 2 + lerp(4, -6, up), 0, sc, sc);
      tf(bite, 30, -6, 0, biteP, biteP);
      // ほお
      const cp = easeOut(seg(t, 1.9, 2.3));
      const cx = b.state.x, cy = FY - 78 * 1.1 / 1.1;
      tf(cheeks, cx, FY - 12, 0, 1.1, 1.1);
      cl.setAttribute('opacity', 0.55 * cp);
      cr.setAttribute('opacity', 0.55 * cp);
      cl.setAttribute('r', 14 * cp);
      cr.setAttribute('r', 14 * cp);
      const sp = seg(t, 2.6, 3.0);
      tf(sweat, 262, lerp(120, 134, (t * 2) % 1), 0, sp, sp);
      sweat.setAttribute('opacity', sp > 0 ? 1 : 0);
    }
  };
}
