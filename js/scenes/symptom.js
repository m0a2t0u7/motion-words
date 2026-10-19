// symptom：かぜのばい菌が入り、ゴホゴホとせきをする。医者のカルテで「かぜ」のしるしとしてせきにチェックが入る（例文 A cough is a common symptom of a cold.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble, backOut } from '../ease.js';
import { P, reach, hp, coat, clinicBg, germ, thermo } from './hospital.js';

export const meta = { duration: 4.4, beats: [[0, 'かぜをひく'], [1.4, 'せきが出る'], [3.0, 'かぜの症状']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = clinicBg(k, 240);
  const S = 0.95;
  const me = k.buddy({ x: 120, y: FY, scale: S });
  // マフラー
  const scarf = g({}); me.body.insertBefore(scarf, me.armR.a.parentNode);
  el('rect', { x: -30, y: -40, width: 60, height: 9, rx: 4, fill: pal.blue }, scarf);
  el('rect', { x: 8, y: -34, width: 9, height: 20, rx: 3, fill: pal.blueDark }, scarf);
  const doc = k.buddy({ x: 318, y: FY, scale: 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  coat(k, doc);
  // カルテ（医者が持つ）
  const chart = g({});
  el('rect', { x: -34, y: -44, width: 68, height: 88, rx: 5, fill: pal.woodDark }, chart);
  el('rect', { x: -29, y: -36, width: 58, height: 76, rx: 3, fill: '#fff' }, chart);
  el('rect', { x: -10, y: -48, width: 20, height: 8, rx: 2, fill: '#9AA6B6' }, chart);
  const gm = germ(k, chart, pal.violet); tf(gm, 0, -22, 0, 0.9);
  // 行：せき・熱・鼻水のアイコン
  const rowY = [4, 20, 34];
  const coughIc = g({}, chart); tf(coughIc, -14, rowY[0]);
  el('path', { d: 'M -6 -3 Q -1 -8 4 -3 Q 9 -6 9 1 Q 9 6 3 5 Q -1 9 -5 4 Q -10 3 -6 -3 Z', fill: '#DCE3EC' }, coughIc);
  const th = thermo(k, chart); tf(th.g, -14, rowY[1] + 7, 90, 0.32); th.set(0.6);
  const nose = el('path', { d: 'M -3 -5 Q 5 0 -3 5', fill: 'none', stroke: pal.sub, 'stroke-width': 2 }, chart); tf(nose, -14, rowY[2]);
  rowY.forEach((y) => el('rect', { x: 2, y: y - 6, width: 12, height: 12, rx: 2, fill: 'none', stroke: pal.sub, 'stroke-width': 1.6 }, chart));
  const tick = el('path', { d: `M 4 ${rowY[0]} L 8 ${rowY[0] + 4} L 15 ${rowY[0] - 6}`, fill: 'none', stroke: pal.green, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': 20, 'stroke-dashoffset': 20 }, chart);
  const ring = el('ellipse', { cx: -6, cy: rowY[0], rx: 24, ry: 9, fill: 'none', stroke: pal.red, 'stroke-width': 2, 'stroke-dasharray': 110, 'stroke-dashoffset': 110 }, chart);
  // 空気中のばい菌
  const air = [0, 1, 2].map(() => germ(k, null, pal.violet));
  // せきのもくもく
  const puffs = [0, 1, 2, 3, 4, 5].map(() => el('circle', { r: 7, fill: '#DCE3EC' }));
  const lines = [0, 1, 2].map(() => el('line', { x1: 0, y1: 0, x2: 12, y2: 0, stroke: '#B8C3D2', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      // ばい菌が飛んできて体に入る
      air.forEach((a, i) => {
        const q = easeInOut(seg(t, 0.1 + i * 0.15, 1.0 + i * 0.15));
        tf(a, lerp(40 + i * 20, 128, q), lerp(40 + i * 18, FY - 54, q) + Math.sin(t * 6 + i) * 6 * (1 - q), t * 60, lerp(0.8, 0.2, q));
        a.setAttribute('opacity', 1 - seg(q, 0.85, 1));
      });
      // せき（3回）：前かがみ・口をあける・手を口元へ
      const cs = [1.4, 2.0, 2.6].map((a) => hump(seg(t, a, a + 0.4)));
      const c = Math.max(...cs);
      const shiver = t < 1.3 ? 0.6 * Math.sin(t * 40) * seg(t, 0.9, 1.1) : 0;
      P(me, { x: 120 + shiver, look: 0.6, mood: c > 0.35 ? 'open' : 'sad', blink: c > 0.35 ? 0.8 : 0, lean: 14 * c, squash: 1 - 0.07 * c, armL: 8 });
      P(me, { ...me.state, armR: 8 + 52 * c });
      cs.forEach((v, j) => {
        const q = seg(t, [1.4, 2.0, 2.6][j] + 0.1, [1.4, 2.0, 2.6][j] + 0.7);
        puffs.slice(j * 2, j * 2 + 2).forEach((p, i) => { tf(p, 150 + 50 * easeOut(q) + i * 10, FY - 66 + i * 6 - 8 * q, 0, 0.6 + 1.2 * q); p.setAttribute('opacity', q > 0 && q < 1 ? 1 - q : 0); });
        const l = lines[j]; tf(l, 156 + 30 * easeOut(q), FY - 80 + j * 12, -10 + j * 10); l.setAttribute('opacity', q > 0 && q < 1 ? 1 - q : 0);
      });
      // 医者：カルテを見せ、せきにチェック
      const up = easeOut(seg(t, 1.0, 1.5));
      P(doc, { facing: -1, look: 0.5, mood: 'smile', armR: lerp(8, 70, up), armL: 8 });
      const h = hp(doc, 0.92, 'R', 28);
      tf(chart, h.x - 8, h.y - 38, 0, 0.9);
      chart.setAttribute('opacity', seg(t, 0.9, 1.2));
      tick.setAttribute('stroke-dashoffset', (20 * (1 - easeOut(seg(t, 2.9, 3.3)))).toFixed(1));
      ring.setAttribute('stroke-dashoffset', (110 * (1 - easeOut(seg(t, 3.3, 3.9)))).toFixed(1));
    }
  };
}
