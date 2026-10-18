// remove：玄関で腰をかがめて靴を脱ぎ、揃えて置いてから上がり框を上がる（例文 Please remove your shoes here.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, '靴をはいている'], [1.2, '靴を脱ぐ'], [3.6, '上がった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const S = 1.1, FY = 238, UP = 16, STEP = 232;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // 玄関ドア
  el('rect', { x: 24, y: 70, width: 70, height: FY - 70, rx: 5, fill: '#B98A5E' });
  el('rect', { x: 32, y: 78, width: 54, height: 70, rx: 3, fill: '#CFA27A' });
  el('circle', { cx: 82, cy: 160, r: 4, fill: pal.yellowDark });
  // 土間と上がり框
  el('rect', { x: 0, y: FY - 2, width: STEP, height: 64, fill: '#D3DAE3' });
  el('rect', { x: STEP, y: FY - UP, width: 400 - STEP, height: 70, fill: '#EBD2A6' });
  el('rect', { x: STEP, y: FY - UP, width: 400 - STEP, height: 3, fill: '#fff', opacity: 0.6 });
  el('rect', { x: STEP - 6, y: FY - UP, width: 6, height: UP + 2, fill: pal.woodDark });
  // 奥の棚の花
  el('rect', { x: 300, y: FY - UP - 52, width: 44, height: 5, rx: 2, fill: pal.woodDark });
  el('rect', { x: 312, y: FY - UP - 74, width: 18, height: 22, rx: 4, fill: pal.violet });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const shoe = () => {
    const n = g({});
    el('ellipse', { cx: 2, cy: -1, rx: 15, ry: 3, fill: '#fff' }, n);
    el('path', { d: 'M -12 -2 Q -12 -11 -2 -12 L 3 -12 Q 14 -9 15 -3 L 15 -2 Z', fill: pal.red }, n);
    el('path', { d: 'M 2 -9 L 9 -6', stroke: '#fff', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, n);
    return n;
  };
  const SH = [shoe(), shoe()];   // 0=奥の足 1=手前の足
  const arm = { a: el('line', { stroke: pal.mintDark, 'stroke-width': 9 * S, 'stroke-linecap': 'round' }), h: el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 * S }) };
  b.armR.a.setAttribute('display', 'none');
  const bx = (t) => lerp(150, 300, easeInOut(seg(t, 3.2, 4.6)));
  const REST = [[188, FY - 2], [204, FY - 2]];
  return {
    update(t) {
      const bend = easeInOut(seg(t, 0.8, 1.3)) * (1 - easeInOut(seg(t, 3.0, 3.3)));
      const a = gait(bx, t, 150, 14);
      const rise = easeInOut(seg(t, 3.9, 4.3));
      const arc = a.m > 0.1 ? 10 * Math.abs(Math.sin(a.walk)) * 0 + 12 * hump(seg(t, 3.6, 4.4)) : 0;
      b.pose({ x: a.x, y: FY - UP * rise, walk: a.walk, armL: lerp(8, 30, bend) + a.armL - 8, armR: 40, lean: 36 * bend + a.lean, squash: 1 - 0.1 * bend, look: 0.5 * (1 - bend), mood: t > 4.3 ? 'grin' : 'smile', lift: arc });
      const feet = [[a.x - 12 * S + 4, FY - 2], [a.x + 12 * S + 4, FY - 2]];
      const sx = hp(b, S, 'R', 0);
      // 靴を1足ずつ脱ぐ：足元→手→揃えて置く
      let hand = null;
      [[1, 0.9], [0, 2.0]].forEach(([i, t0]) => {
        const grab = seg(t, t0, t0 + 0.35), lift = seg(t, t0 + 0.35, t0 + 0.8), put = seg(t, t0 + 0.8, t0 + 1.3);
        const [fx, fy] = feet[i], [rx, ry] = REST[i];
        let x = fx, y = fy, rot = 0;
        if (t >= t0 + 0.35 && t < t0 + 0.8) { x = lerp(fx, fx + 16, easeOut(lift)); y = fy - 26 * hump(lift); rot = -30 * hump(lift); }
        if (t >= t0 + 0.8) { x = lerp(fx + 16, rx, easeInOut(put)); y = lerp(fy, ry, put) - 18 * hump(put); rot = 0; }
        if (i === 0 && t < t0) { x = a.x - 12 * S + 4; }
        const gone = t < t0 ? 0 : 1;
        tf(SH[i], gone ? x : feet[i][0], gone ? y : feet[i][1], rot, 1);
        if (t >= t0 && t < t0 + 1.3) hand = { x: x - 6 * Math.cos(rot * Math.PI / 180), y: y - 8 };
      });
      const idle = { x: sx.x + 12, y: sx.y + 26 };
      const hh = hand || idle;
      k.set(arm.a, { x1: sx.x, y1: sx.y, x2: hh.x, y2: hh.y }); k.set(arm.h, { cx: hh.x, cy: hh.y });
      arm.h.setAttribute('opacity', 1);
    }
  };
}
