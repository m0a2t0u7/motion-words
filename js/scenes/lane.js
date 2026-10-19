// lane：2車線の道。後ろから見た車が白線のほうへふらつきかけ、ハンドルを戻して右の車線を走り続ける（例文 Stay in the right lane.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { rearCar } from './road.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '右の車線'], [1.2, 'はみ出しそう'], [2.6, '車線を守る']] };

export function create(k) {
  const { el, tf, pal } = k;
  k.backdrop({ floorY: 300 });
  el('rect', { x: 0, y: 0, width: 400, height: 130, fill: '#EAF4FB' });
  el('path', { d: 'M 0 130 Q 100 100 200 126 T 400 120 V 140 H 0 Z', fill: '#DCEFD9' });
  el('rect', { x: 0, y: 130, width: 400, height: 170, fill: '#DCEFD9' });
  // 遠近の道（中央線＝破線、右車線を強調）
  el('path', { d: 'M 186 130 L 214 130 L 380 300 L 20 300 Z', fill: '#AEB7C4' });
  const hl = el('path', { d: 'M 200 130 L 214 130 L 380 300 L 200 300 Z', fill: pal.green, opacity: 0.18 });
  el('path', { d: 'M 186 130 L 20 300 M 214 130 L 380 300', stroke: '#fff', 'stroke-width': 4 });
  const dashes = [0, 1, 2, 3, 4].map(() => el('path', { d: '', fill: '#fff' }));
  const car = rearCar(k, pal.coral, pal.coralDark);
  const ok = mark(k, 'check', k.root, 1.8);
  return {
    update(t) {
      // 中央の破線が手前へ流れる
      dashes.forEach((d, i) => {
        const u = ((i / 5 + t * 0.5) % 1), u2 = Math.min(1, u + 0.08);
        const y1 = 130 + 170 * u * u, y2 = 130 + 170 * u2 * u2, w1 = 1 + 5 * u * u, w2 = 1 + 5 * u2 * u2;
        k.set(d, { d: `M ${200 - w1} ${y1} L ${200 + w1} ${y1} L ${200 + w2} ${y2} L ${200 - w2} ${y2} Z` });
      });
      // 右車線の中央 x=290 から線のほうへ寄り、戻る
      const drift = hump(seg(t, 0.8, 2.4)) * (t < 1.8 ? 1 : 1);
      const back = easeInOut(seg(t, 1.8, 2.6));
      const x = 290 - 60 * easeInOut(seg(t, 0.8, 1.8)) * (1 - back);
      const rot = -6 * hump(seg(t, 0.8, 1.8)) + 7 * hump(seg(t, 1.8, 2.6));
      tf(car, x, 278 + Math.sin(t * 20) * 0.6, rot, 1.2);
      hl.setAttribute('opacity', 0.12 + 0.15 * hump(seg(t, 1.4, 2.6)));
      tf(ok, 330, 70, 0, Math.max(0.001, seg(t, 2.8, 3.2) * 1.8));
      void drift;
    }
  };
}
