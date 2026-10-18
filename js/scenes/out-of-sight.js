// out of sight：手をふって見送る車が、角のビルの向こうへ曲がって消え、もう見えない（例文 The car turned the corner and was out of sight.）
import { seg, lerp, easeInOut, easeIn, easeOut, hump } from '../ease.js';
import { P, car } from './in-common.js';

export const meta = { duration: 4.2, beats: [[0, '車を見送る'], [1.6, '角を曲がる'], [3.0, '見えなくなった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 214, mood: 'outdoor' });
  // 奥へ曲がる道
  el('rect', { x: 0, y: 200, width: 400, height: 40, fill: '#C9D1DC' });
  el('path', { d: 'M 290 200 L 312 120 L 352 120 L 360 200 Z', fill: '#C9D1DC' });
  [40, 110, 180, 250].forEach((x) => el('rect', { x, y: 219, width: 34, height: 3, rx: 1.5, fill: '#fff' }));
  el('rect', { x: 0, y: 240, width: 400, height: 60, fill: '#EEF1F5' });
  el('rect', { x: 0, y: 240, width: 400, height: 4, fill: '#DDE3EA' });
  el('rect', { x: 196, y: 60, width: 74, height: 140, fill: '#E4EEF7' });
  [[204, 72], [236, 72], [204, 108], [236, 108], [204, 144], [236, 144]].forEach(([x, y]) => el('rect', { x, y, width: 24, height: 22, rx: 3, fill: '#fff', opacity: 0.8 }));
  const cv = car(k, pal.yellow, pal.yellowDark);
  // 角のビル（手前、車を隠す）
  el('rect', { x: 352, y: 36, width: 60, height: 204, fill: '#F3E6DC' });
  [[362, 52], [362, 92], [362, 132], [362, 172]].forEach(([x, y]) => el('rect', { x, y, width: 38, height: 24, rx: 3, fill: '#fff', opacity: 0.8 }));
  el('rect', { x: 352, y: 36, width: 8, height: 204, fill: '#000', opacity: 0.05 });
  const A = k.buddy({ x: 80, y: 262, scale: 0.86 });
  return {
    update(t) {
      // 車：右へ走り、角で奥へ曲がって小さくなりビルの陰へ
      const p1 = easeIn(seg(t, 0.0, 1.5)) * 0.7 + 0.3 * seg(t, 0.0, 1.5);
      const turn = easeInOut(seg(t, 1.5, 2.6));
      const x = turn > 0 ? lerp(318, 392, turn) : lerp(100, 318, p1);
      const y = lerp(232, 150, turn);
      const s = lerp(0.8, 0.42, turn);
      tf(cv.g, x, y, 0, s);
      cv.set(x, (x + turn * 200) * 4, y); tf(cv.g, x, y, -18 * hump(seg(t, 1.5, 2.2)), s);
      cv.g.setAttribute('opacity', t < 2.7 ? 1 : 0);
      // まめ：手をふる→手を下ろして見つめる
      const wave = t < 2.4 ? 150 + 18 * Math.sin(t * 9) : lerp(150, 10, easeOut(seg(t, 2.4, 2.9)));
      P(A, { x: 80, y: 262, armR: lerp(8, wave, easeOut(seg(t, 0.1, 0.4))), look: 0.8, mood: t > 2.8 ? 'flat' : 'grin', lean: t > 2.9 ? 4 : 0, lift: t > 3.0 ? 3 * hump(seg(t, 3.0, 3.4)) : 0 });
    }
  };
}
