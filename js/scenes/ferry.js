// ferry：車や人を乗せたフェリーが港を出て海を渡り、島に着く。甲板のまめが手を振る（例文 We took the ferry to the island.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { blinkAt, tree } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '港を出る'], [1.4, '海を渡る'], [3.6, '島に着く']] };

export function create(k) {
  const { el, g, pal } = k;
  const WY = 200;
  k.backdrop({ floorY: WY });
  el('rect', { x: 0, y: WY, width: 400, height: 100, fill: '#7CC7EC' });
  // 左：港の桟橋 / 右：島
  el('rect', { x: 0, y: WY - 14, width: 40, height: 30, fill: '#B9A58C' });
  el('path', { d: `M 300 ${WY + 4} Q 330 ${WY - 50} 380 ${WY - 46} Q 410 ${WY - 40} 420 ${WY + 4} Z`, fill: '#9ED3A0' });
  el('path', { d: `M 290 ${WY + 6} Q 350 ${WY - 8} 420 ${WY + 6} Z`, fill: '#F3DEB0' });
  tree(k, 360, WY - 40, 0.55); tree(k, 392, WY - 36, 0.45);
  const waves = [0, 1, 2, 3, 4, 5, 6].map(() => el('path', { d: 'M 0 0 q 8 -4 16 0 q 8 4 16 0', stroke: '#fff', 'stroke-width': 2.5, fill: 'none', opacity: 0.7 }));
  const f = g({});
  const me = k.buddy({ parent: f, x: -82, y: -18, scale: 0.42 }); me.g.firstChild.setAttribute('display', 'none');
  el('path', { d: 'M -90 -18 L 96 -18 L 82 10 L -80 10 Z', fill: '#fff', stroke: '#C9D1DC', 'stroke-width': 2 }, f);
  el('rect', { x: -90, y: -6, width: 186, height: 6, fill: pal.blue }, f);
  el('rect', { x: -70, y: -50, width: 80, height: 32, rx: 4, fill: '#F4F7FA', stroke: '#C9D1DC', 'stroke-width': 2 }, f);
  for (let i = 0; i < 5; i++) el('circle', { cx: -60 + i * 16, cy: -36, r: 4, fill: '#9FC4E6' }, f);
  el('rect', { x: -40, y: -70, width: 14, height: 20, fill: pal.red }, f);
  // 甲板の車
  el('rect', { x: 18, y: -32, width: 36, height: 14, rx: 5, fill: pal.yellow }, f); el('rect', { x: 58, y: -30, width: 30, height: 12, rx: 4, fill: pal.violet }, f);
  el('path', { d: 'M 10 -50 h 80', stroke: '#C9D1DC', 'stroke-width': 2 }, f);
  return {
    update(t) {
      const x = lerp(80, 250, easeInOut(seg(t, 0.4, 3.8)));
      k.tf(f, x, WY + 4 + Math.sin(t * 3) * 2, Math.sin(t * 2.4) * 1.5);
      me.pose({ look: 0.8, mood: 'grin', blink: blinkAt(t), armR: 8 + 150 * hump(seg(t, 0, 4.4)) + 16 * Math.sin(t * 12) });
      waves.forEach((w, i) => { const a = (t * 0.25 + i / 7) % 1; k.tf(w, 420 - a * 460, WY + 14 + (i % 3) * 26); });
    }
  };
}
