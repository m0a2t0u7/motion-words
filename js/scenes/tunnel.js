// tunnel：山のトンネルに電車が入り、長い山の中を抜けて反対側から出てくる（例文 The train went through a long tunnel.）
import { seg, lerp } from '../ease.js';

export function train(k, cars = 3) {
  const g = k.g({}), { el, pal } = k;
  for (let i = 0; i < cars; i++) {
    const x = -i * 74;
    el('rect', { x: x - 34, y: -40, width: 70, height: 34, rx: i === 0 ? 12 : 5, fill: '#fff', stroke: '#C9D1DC', 'stroke-width': 1.5 }, g);
    el('rect', { x: x - 34, y: -18, width: 70, height: 5, fill: pal.mint }, g);
    for (let j = 0; j < 3; j++) el('rect', { x: x - 28 + j * 20, y: -34, width: 14, height: 12, rx: 2, fill: '#CFE9F7' }, g);
    [x - 22, x + 22].forEach((wx) => el('circle', { cx: wx, cy: -4, r: 4, fill: pal.ink }, g));
  }
  // 先頭車の窓のまめ
  el('circle', { cx: 12, cy: -27, r: 5, fill: pal.mint }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'トンネルへ'], [1.4, '山の中を進む'], [3.4, '出てきた']] };

export function create(k) {
  const { el, tf, pal } = k, TY = 220;
  k.backdrop({ floorY: TY });
  el('rect', { x: 0, y: TY, width: 400, height: 80, fill: '#DCEFD9' });
  el('rect', { x: 0, y: TY - 2, width: 400, height: 4, fill: '#9AA6B6' });
  // トンネルの奥（暗い穴）
  el('path', { d: `M 96 ${TY} V ${TY - 34} Q 96 ${TY - 50} 112 ${TY - 50} L 300 ${TY - 50} Q 316 ${TY - 50} 316 ${TY - 34} V ${TY} Z`, fill: '#3D4A60' });
  const tr = train(k, 3);
  // 山（電車より手前で隠す）。入口と出口のアーチだけ見せる
  el('path', { d: `M 104 ${TY} Q 120 60 210 50 Q 300 60 308 ${TY} Z`, fill: '#8FC79E' });
  el('path', { d: `M 140 120 Q 210 80 270 120`, stroke: '#7FB98F', 'stroke-width': 8, fill: 'none' });
  [[104, 1], [308, -1]].forEach(([x, d]) => el('path', { d: `M ${x} ${TY} V ${TY - 46} Q ${x} ${TY - 60} ${x + d * 2} ${TY - 60}`, stroke: '#B9C3D0', 'stroke-width': 8, fill: 'none' }));
  return {
    update(t) {
      // 左から入り、山の中（見えない）を通って右から出る
      const x = lerp(-40, 560, t / 4.4);
      tf(tr, x, TY - 2 + Math.sin(t * 25) * 0.5);
    }
  };
}
