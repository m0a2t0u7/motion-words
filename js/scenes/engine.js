// engine：ボンネットを開けたエンジンがガタガタ揺れて変な音を出し、まめが驚いて耳をすます（例文 The engine made a strange noise.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { auto, P, blinkAt, mark, popIn, reach } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'エンジンを見る'], [1.2, 'ガタガタ！'], [2.8, '変な音…？']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 232;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // ガレージの壁と工具
  el('rect', { x: 0, y: 30, width: 400, height: FY - 30, fill: '#ECE6DD' });
  el('rect', { x: 250, y: 60, width: 120, height: 70, rx: 4, fill: '#D9CDBD' });
  [[266, 70, 10, 44], [290, 72, 8, 40], [312, 68, 12, 30], [340, 72, 6, 46]].forEach(([x, y, w, h]) => el('rect', { x, y, width: w, height: h, rx: 3, fill: pal.sub }));
  const S = 1.6, CX = 120;
  const car = auto(k, { color: pal.blue, dark: pal.blueDark });
  // エンジンルーム（ボンネットの下）
  const bay = g({}, car.body);
  el('path', { d: 'M 34 -44 L 68 -44 L 68 -30 L 34 -30 Z', fill: '#3C4558' }, bay);
  const eng = g({}, bay);
  el('rect', { x: 38, y: -56, width: 26, height: 18, rx: 3, fill: '#9AA5B4' }, eng);
  [42, 49, 56].forEach((x) => el('rect', { x, y: -60, width: 5, height: 5, rx: 1, fill: '#6E7A8C' }, eng));
  el('path', { d: 'M 36 -48 q -6 4 -2 10', stroke: pal.ink, 'stroke-width': 2.4, fill: 'none' }, eng);
  // 開いたボンネット（フロントガラスの付け根で回転）
  const hood = g({}, car.body);
  el('path', { d: 'M 0 -4 L 32 -4 Q 37 -1 33 5 L 0 5 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 1.5 }, hood); el('rect', { x: 4, y: 2, width: 26, height: 3, fill: '#C9D1DC' }, hood);
  const me = k.buddy({ x: 300, y: FY + 4, scale: 0.95, facing: -1 });
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 0 l 5 -6 l 5 6 l 5 -6 l 5 6', stroke: pal.coralDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  const q = mark(k, 'q'), bang = mark(k, 'bang');
  return {
    update(t) {
      const on = seg(t, 1.0, 1.2) * (1 - seg(t, 3.6, 3.8));
      const knock = on * (Math.sin(t * 48) > 0.3 ? 1 : 0) * (0.6 + 0.4 * Math.sin(t * 7));
      car.set(CX, FY + 8, 0, knock * 0.8, 0, S);
      k.tf(eng, knock * 1.4, -Math.abs(knock) * 1.2, knock * 2);
      k.tf(hood, 36, -44, -62);
      waves.forEach((w, i) => { const p = ((t * 1.6 + i / 3) % 1); const ok = on > 0.5; k.tf(w, CX + 88 * S - 10 + 30 * p, FY - 92 - i * 18 - 6 * p, -18 + i * 18, 1); w.setAttribute('opacity', ok ? 1 - p : 0); });
      // 驚いて身を引き → 近づいて耳をすます
      const jump = hump(seg(t, 1.1, 1.6)), lean = easeInOut(seg(t, 2.0, 2.8));
      P(me, { x: 300 + 14 * easeOut(seg(t, 1.1, 1.4)) - 20 * lean, lift: 10 * jump, lean: -10 * jump + 14 * lean, mood: t > 1.1 && t < 2.2 ? 'open' : 'flat', look: -0.6, blink: blinkAt(t), armR: 8 + 40 * jump, armL: 8 + 40 * jump + lerp(0, 140, lean) });
      const bp = seg(t, 1.15, 1.4) * (1 - seg(t, 2.0, 2.2)); k.tf(bang, 296, FY - 120, 0, popIn(bp) * 1.6 + 0.001);
      const qp = seg(t, 2.8, 3.1); k.tf(q, 300, FY - 128, 0, popIn(qp) * 1.6 + 0.001);
      void clamp; void reach;
    }
  };
}
