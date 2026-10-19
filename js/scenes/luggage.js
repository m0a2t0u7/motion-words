// luggage：駅のホーム。アナウンスを聞いて、スーツケースを体のそばに引き寄せ、人が通る間も手を離さない（例文 Please keep your luggage with you at all times in the station.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, walkTo, face, track } from './bag.js';
import { waves } from './look-over.js';

// キャリーケース（原点＝持ち手の握り、+y が車輪側）
export function trolley(k, parent, col = '#6AA8F7', dark = '#4A8BE0') {
  const g = k.g({}, parent), { el, pal } = k;
  el('path', { d: 'M -5 0 H 5 M -3 0 V 26 M 3 0 V 26', stroke: pal.sub, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);
  el('rect', { x: -17, y: 24, width: 34, height: 44, rx: 6, fill: col }, g);
  el('path', { d: 'M -9 28 V 64 M 0 28 V 64 M 9 28 V 64', stroke: dark, 'stroke-width': 1.6, opacity: 0.6 }, g);
  el('circle', { cx: -10, cy: 70, r: 3.6, fill: pal.ink }, g);
  el('circle', { cx: 10, cy: 70, r: 3.6, fill: pal.ink }, g);
  return g;
}
export function stationBg(k, FY = 236) {
  const { el, pal } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 28, fill: '#D8DEE8' });
  el('rect', { x: 0, y: 150, width: 400, height: FY - 150, fill: '#E7EBF1' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.yellow });
  [30, 230].forEach((x) => { el('rect', { x, y: 40, width: 130, height: 34, rx: 5, fill: '#2F4C7A' }); el('rect', { x: x + 10, y: 48, width: 30, height: 18, rx: 4, fill: pal.mint }); el('rect', { x: x + 48, y: 52, width: 70, height: 4, rx: 2, fill: '#fff', opacity: 0.7 }); el('rect', { x: x + 48, y: 60, width: 46, height: 4, rx: 2, fill: '#fff', opacity: 0.5 }); });
  [100, 300].forEach((x) => el('rect', { x: x - 5, y: 74, width: 10, height: FY - 74, fill: '#C9D1DC' }));
}

export const meta = { duration: 4.4, beats: [[0, '駅に着く'], [1.2, '荷物を引き寄せ'], [2.6, 'ずっと手元に']] };

export function create(k) {
  const { tf, pal, el } = k, S = 1.2, FY = 236;
  stationBg(k, FY);
  // スピーカー
  el('path', { d: 'M 186 32 h 10 l 10 -8 v 26 l -10 -8 h -10 Z', fill: pal.sub });
  const wv = waves(k, pal.blueDark);
  const pass = [k.buddy({ x: 460, y: FY - 6, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark }), k.buddy({ x: 520, y: FY - 6, scale: 0.95, facing: -1, color: pal.violet, dark: '#8C70DD' })];
  const bag = trolley(k);
  const b = k.buddy({ x: 60, y: FY, scale: S });
  const xf = (t) => lerp(40, 200, easeInOut(seg(t, 0, 1.2)));
  const pull = track([[1.3, 0, 0], [1.8, 1, 0]]);
  return {
    update(t) {
      const w = walkTo(xf, t, 40);
      const near = pull(t).x;
      P(b, { x: w.x, walk: w.walk, armR: w.armR, lean: w.lean, look: t > 1.3 ? -0.7 : 0.3, blink: blinkAt(t), mood: t > 1.2 && t < 1.8 ? 'open' : 'smile' });
      // 引いている間は後ろの手（ケースは後ろで斜め）、引き寄せた後は手前の手で横に立てて押さえる
      b.pose({ armL: 26 + Math.sin(w.walk) * 3 * w.m });
      const back = hp(b, S, 'L');
      const L = 70, a0 = (Math.acos(clamp((FY - 3.6 - back.y) / L, -1, 1)) * 180) / Math.PI;
      const side = { x: w.x + 44 * S, y: FY - 74 };
      const e = easeInOut(near);
      const gx = lerp(back.x, side.x, e), gy = lerp(back.y, side.y, e) - 10 * hump(near);
      tf(bag, gx, gy + 2 * wobble(seg(t, 1.8, 2.4), 2, 5), lerp(a0, 0, e) + wobble(seg(t, 1.8, 2.4), 2, 5) * 3);
      if (near > 0 && near < 0.5) b.pose({ armL: reach(b, S, 'L', gx, gy) });
      if (near >= 0.5) b.pose({ armL: lerp(26, 8, seg(near, 0.5, 1)), armR: reach(b, S, 'R', gx, gy) });
      face(b, t > 1.3 ? -3 : 4, 0);
      wv(t > 1.0 && t < 2.2 ? 1 : 0, t * 1.4, 208, 37, 1, 0.8);
      // 人が後ろを通り過ぎる
      pass.forEach((p, i) => {
        const pxf = (tt) => lerp(460 + i * 50, -80 + i * 50, seg(tt, 1.8 + i * 0.25, 4.4));
        const pw = walkTo(pxf, t, 460 + i * 50, -1);
        P(p, { x: pw.x, y: FY - 6, walk: pw.walk, armL: pw.armL, armR: pw.armR, facing: -1, blink: blinkAt(t, i) });
      });
      // 通る間、まめはケースを見て手を離さない
      if (t > 2.2) b.pose({ squash: 1 - 0.03 * hump(seg(t, 2.4, 3.2)), lean: 4 });
    }
  };
}
