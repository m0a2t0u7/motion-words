// run into：駅の構内で左右から歩いてきた2人が、すれ違う前にばったり気づいて再会を喜ぶ（例文 I ran into an old friend at the station.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '歩いている'], [1.3, 'ばったり'], [2.2, '再会']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 床のタイル線
  for (let i = 0; i < 7; i++) el('line', { x1: i * 70 - 20, y1: FY + 2, x2: i * 70 - 60, y2: 300, stroke: '#E3E8EE', 'stroke-width': 2 });
  // 駅の看板・時刻表
  el('rect', { x: 120, y: 22, width: 160, height: 32, rx: 8, fill: pal.green });
  k.text(200, 38, 'STATION', { 'font-size': 20, fill: '#FFFFFF' });
  el('rect', { x: 24, y: 66, width: 112, height: 80, rx: 6, fill: '#2A3242' });
  [0, 1, 2, 3].forEach((i) => {
    el('rect', { x: 34, y: 76 + i * 17, width: 20, height: 6, rx: 2, fill: pal.yellow });
    el('rect', { x: 60, y: 76 + i * 17, width: 40 + (i % 2) * 14, height: 6, rx: 2, fill: '#FFFFFF', opacity: 0.8 });
    el('rect', { x: 110, y: 76 + i * 17, width: 14, height: 6, rx: 2, fill: pal.mint });
  });
  // 改札（奥）
  [[262, 0], [330, 1]].forEach(([x]) => {
    el('rect', { x, y: 156, width: 36, height: 56, rx: 7, fill: '#B7C3D6' });
    el('rect', { x: x + 6, y: 162, width: 24, height: 14, rx: 4, fill: '#EAF4FB' });
    el('circle', { cx: x + 18, cy: 190, r: 5, fill: pal.green });
    el('rect', { x: x + 8, y: 212, width: 20, height: 6, rx: 3, fill: '#8F9BB0' });
  });
  el('rect', { x: 290, y: 188, width: 40, height: 5, rx: 2.5, fill: pal.red, opacity: 0.0 });

  const S = 0.95;
  const A = k.buddy({ x: -30, y: FY, scale: S });
  const B = k.buddy({ x: 430, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const mkBang = () => {
    const m = g({});
    el('circle', { cx: 0, cy: 0, r: 14, fill: pal.red }, m);
    k.text(0, 1.5, '!', { 'font-size': 22, fill: '#FFFFFF' }, m);
    el('path', { d: 'M -5 12 L 0 20 L 5 12 Z', fill: pal.red }, m);
    return m;
  };
  const bangA = mkBang(), bangB = mkBang();
  const hearts = [0, 1, 2].map(() => {
    const h = g({});
    el('path', { d: 'M 0 -9 L 2.6 -2.8 L 9 -2.8 L 3.8 1.2 L 5.8 7.6 L 0 3.8 L -5.8 7.6 L -3.8 1.2 L -9 -2.8 L -2.6 -2.8 Z', fill: pal.yellow }, h);
    return h;
  });

  const AX1 = 150, BX1 = 250;
  return {
    update(t) {
      // 歩いてくる（1.2s まで）→ 気づいて止まる
      const w = easeInOut(seg(t, 0.0, 1.3)) * 0.35 + seg(t, 0.0, 1.3) * 0.65;
      const stop = easeOut(seg(t, 1.3, 1.5));
      const ax = lerp(-30, AX1, w), bx = lerp(430, BX1, w);
      const walking = t < 1.35;
      const sw = Math.sin(t * 10);
      const surprise = hump(seg(t, 1.3, 1.9));
      const wave = t > 1.9 ? Math.sin((t - 1.9) * 10) : 0;
      const wv = easeOut(seg(t, 1.9, 2.3));
      A.pose({
        x: ax, walk: walking ? t * 10 : 0, armR: lerp(8 + sw * 14, 150, wv) + wave * 22 * wv * 0 + wave * 12 * wv, armL: lerp(8 - sw * 14, 8, stop),
        lean: walking ? 4 : -5 * surprise, squash: 1 + 0.04 * surprise, look: 0.8,
        mood: t < 1.3 ? 'smile' : t < 1.9 ? 'open' : 'grin'
      });
      B.pose({
        x: bx, walk: walking ? t * 10 + 1.5 : 0, armR: lerp(8 - sw * 14, 150, wv) - wave * 12 * wv, armL: lerp(8 + sw * 14, 8, stop),
        lean: walking ? 4 : -5 * surprise, squash: 1 + 0.04 * surprise, look: 0.8,
        mood: t < 1.3 ? 'smile' : t < 1.9 ? 'open' : 'grin'
      });
      // 「!」：気づいた瞬間
      const bp = Math.max(0.001, backOut(seg(t, 1.25, 1.55), 2)) * (1 - easeOut(seg(t, 2.2, 2.45)));
      tf(bangA, ax - 6, FY - 116, 0, bp, bp); tf(bangB, bx + 6, FY - 116, 0, bp, bp);
      // 再会のきらめき
      hearts.forEach((h, i) => {
        const p = seg(t, 2.3 + i * 0.2, 3.3 + i * 0.2);
        tf(h, 200 + (i - 1) * 16, FY - 128 - p * 24, 0, 0.7 + 0.5 * hump(p), 0.7 + 0.5 * hump(p));
        h.setAttribute('opacity', p > 0 && p < 1 ? 1 - p * p : 0);
      });
      // 最後の1枚はそのまま残る
      const last = seg(t, 3.4, 3.8);
      tf(hearts[1], 200, FY - 136, 0, 0.9 + 0.1 * Math.sin(t * 6), 0.9 + 0.1 * Math.sin(t * 6));
      hearts[1].setAttribute('opacity', last > 0 ? last : hearts[1].getAttribute('opacity'));
    }
  };
}
