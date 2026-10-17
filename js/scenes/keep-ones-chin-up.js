// keep one's chin up：雨雲を頭にのせてうつむく友だちのあごを、そっと上げて励ます。顔が上がると雲が去り日が差す（Keep your chin up. Things will get better.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'うつむく'], [1.6, 'あごを上げる'], [3.0, '晴れてくる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  // 日が差す（後ろ）
  const sun = g({});
  tf(sun, 330, 70);
  const rays = g({}, sun);
  for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: -30, x2: 0, y2: -42, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` }, rays);
  el('circle', { r: 22, fill: pal.yellow }, sun);
  const rb = g({});
  ['#F2685B', '#FFCF5C', '#59C27A', '#6AA8F7'].forEach((c, i) => el('path', { d: `M ${60 - i * 7} ${FY} A ${100 - i * 7} ${100 - i * 7} 0 0 1 ${260 + i * 7} ${FY}`.replace(/(\d+) A (\d+) (\d+)/, '$1 A $2 $3'), fill: 'none', stroke: c, 'stroke-width': 6, opacity: 0.7 }, rb));
  // 植え込み
  [[40, 18], [360, 22]].forEach(([x, r]) => { k.shadow(x, FY + 2, r + 8, 4); el('circle', { cx: x, cy: FY - r + 4, r, fill: '#7FD3A0' }); });
  const mint = k.buddy({ x: 150, y: FY });
  const coral = k.buddy({ x: 236, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const cloud = g({});
  [[-26, 4, 18], [0, -6, 24], [26, 4, 18]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#8E9BAD' }, cloud));
  const drops = [0, 1, 2, 3, 4, 5].map(() => el('line', { stroke: pal.blueDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const up = easeInOut(seg(t, 1.7, 2.4)), fin = easeOut(seg(t, 2.9, 3.5));
      const reach = easeOut(seg(t, 0.9, 1.5)) * (1 - seg(t, 2.4, 2.9));
      const lean = lerp(24, -6, up);
      mint.pose({
        lean, squash: lerp(0.95, 1, up), look: lerp(0.2, 0.5, up),
        armL: lerp(10, 10, 0) + 90 * fin, armR: lerp(6, 6, 0) + 100 * fin, mood: t < 2.0 ? 'sad' : 'smile', blink: t < 1.7 ? 0.2 : 0
      });
      coral.pose({ armR: lerp(8, 96, reach) , armL: 8 + 80 * fin, lean: 5 * reach, look: -0.3, mood: 'smile', squash: 1 - 0.02 * hump(seg(t, 1.4, 1.9)) });
      // 雨雲：頭上→右上に去り縮む
      const away = easeInOut(seg(t, 2.3, 3.5));
      const cx = lerp(150 + 6 * lean / 24, 40, away), cy = lerp(FY - 128 + 10 * (lean / 24), 50, away);
      tf(cloud, cx, cy, 0, lerp(1, 0.6, away));
      cloud.setAttribute('opacity', 1 - seg(t, 3.2, 3.7));
      drops.forEach((d, i) => {
        const p = (t * 1.5 + i * 0.17) % 1, x = cx - 28 + i * 11, y = cy + 20 + p * 70 * (1 - seg(t, 2.3, 2.6));
        k.set(d, { x1: x, y1: y, x2: x - 2, y2: y + 9, opacity: (1 - away) * (t < 2.5 ? 1 : 0) });
      });
      const sp = easeOut(seg(t, 2.6, 3.4));
      tf(sun, 330, 70 + 30 * (1 - sp), 0, sp);
      rays.setAttribute('transform', `rotate(${t * 20})`);
      rb.setAttribute('opacity', seg(t, 3.0, 3.8) * 0.9);
    }
  };
}
