// run around：子どもたちが午後じゅう、遊具のある広場をぐるぐる走り回る（例文 The children ran around the playground all afternoon.）
import { seg, lerp, easeInOut, easeIn, clamp } from '../ease.js';
import { P, blinkAt, tree, parkBg } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '昼すぎ'], [1.5, '走り回る'], [3.8, '夕方まで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = parkBg(k, 222);
  const sky = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#FFD9A8', opacity: 0 });
  const sun = el('circle', { r: 16, fill: pal.yellow });
  el('path', { d: `M 0 ${FY - 30} Q 100 ${FY - 70} 200 ${FY - 34} T 400 ${FY - 40} V ${FY} H 0 Z`, fill: '#E3F2E0' });
  // すべり台（右）
  el('rect', { x: 318, y: FY - 70, width: 6, height: 74, fill: pal.blueDark });
  el('rect', { x: 352, y: FY - 70, width: 6, height: 74, fill: pal.blueDark });
  el('rect', { x: 314, y: FY - 76, width: 48, height: 8, rx: 3, fill: pal.blue });
  el('path', { d: `M 318 ${FY - 70} Q 290 ${FY - 30} 268 ${FY + 2}`, stroke: pal.yellow, 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round' });
  for (let i = 0; i < 4; i++) el('rect', { x: 322, y: FY - 58 + i * 15, width: 32, height: 3, fill: pal.blueDark });
  k.shadow(330, FY + 4, 46, 4);
  const back = g({});
  const tr = tree(k, 200, FY + 22, 1.05);
  const front = g({});
  const kids = [k.buddy({ scale: 0.6, parent: back }), k.buddy({ scale: 0.56, parent: back, color: pal.coral, dark: pal.coralDark })];
  return {
    update(t) {
      const sp = seg(t, 0, 4.4);
      tf(sun, lerp(60, 340, sp), 60 - Math.sin(sp * Math.PI) * 26 + sp * 30);
      sun.setAttribute('fill', sp > 0.7 ? '#FFB45C' : pal.yellow);
      sky.setAttribute('opacity', seg(t, 2.6, 4.4) * 0.7);
      kids.forEach((b, i) => {
        // 一定の速さで楕円をまわる（走り出しだけ加速）
        const u = t < 0.6 ? 0.6 * easeIn(seg(t, 0, 0.6)) * 0.33 : t - 0.4;
        const th = u * 2.1 + i * Math.PI;
        const x = 200 + 130 * Math.cos(th), y = FY + 16 + 26 * Math.sin(th);
        const vx = -Math.sin(th);
        const behind = Math.sin(th) < 0;
        (behind ? back : front).appendChild(b.g);
        const w = u * 2.1 * 13 + i;
        const m = clamp(t / 0.6);
        P(b, { x, y, facing: vx > 0 ? 1 : -1, walk: w, armL: 8 + Math.sin(w) * 50 * m, armR: 8 - Math.sin(w) * 50 * m, lean: 10 * m,
          lift: Math.abs(Math.sin(w)) * 5 * m, mood: i ? 'grin' : 'open', look: vx > 0 ? 0.6 : -0.6, blink: blinkAt(t, i) });
        b.g.setAttribute('transform', b.g.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${(0.6 - i * 0.04) * (1 + 0.1 * Math.sin(th))})`));
      });
    }
  };
}
