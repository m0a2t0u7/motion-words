// every cloud has a silver lining：暗い雲と雨でしょんぼり→雲のふちが銀色に光り、笑顔になる（例文 Cheer up. Every cloud has a silver lining.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '雨でしょんぼり'], [1.6, '日が差す'], [2.8, 'ふちが光る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  const sky = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#FFE9A8', opacity: 0 });
  // 太陽（雲の後ろ）
  const sun = g({});
  tf(sun, 250, 82);
  const rays = g({}, sun);
  for (let i = 0; i < 10; i++) el('line', { x1: 0, y1: -36, x2: 0, y2: -50, stroke: pal.yellow, 'stroke-width': 5, 'stroke-linecap': 'round', transform: `rotate(${i * 36})` }, rays);
  el('circle', { r: 28, fill: pal.yellow }, sun);
  // 雲
  const cloud = g({});
  const cd = 'M -70 20 Q -92 20 -90 0 Q -88 -18 -66 -16 Q -62 -42 -30 -40 Q -16 -64 14 -52 Q 36 -64 52 -40 Q 88 -38 86 -8 Q 92 20 66 20 Z';
  const body = el('path', { d: cd, fill: '#8F98A8' }, cloud);
  const lining = el('path', { d: cd, fill: 'none', stroke: '#F2F6FB', 'stroke-width': 0, 'stroke-linejoin': 'round' }, cloud);
  const glint = el('path', { d: 'M 0 -8 L 3 0 L 0 8 L -3 0 Z M -8 0 L 0 3 L 8 0 L 0 -3 Z', fill: '#FFFFFF' });
  const rain = [0, 1, 2, 3, 4, 5].map((i) => el('line', { x1: 0, y1: 0, x2: -3, y2: 12, stroke: pal.blueDark, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const b = k.buddy({ x: 150, y: FY, scale: 1.1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'sad', blink: 0, lift: 0 };

  return {
    update(t) {
      const clear = easeInOut(seg(t, 1.4, 2.4));
      // 雲は右へゆっくり動いて太陽に重なる位置にとどまる
      const cx = lerp(150, 262, easeInOut(seg(t, 0.2, 2.2)));
      tf(cloud, cx, 76);
      body.setAttribute('fill', lerp(0, 1, clear) > 0.5 ? '#A9B2C1' : '#8F98A8');
      tf(rays, 0, 0, t * 20);
      const sunUp = easeOut(seg(t, 1.2, 2.3));
      tf(sun, 250, lerp(110, 82, sunUp), 0, 0.9 + 0.1 * sunUp, 0.9 + 0.1 * sunUp);
      sun.setAttribute('opacity', 0.15 + 0.85 * sunUp);
      // 銀のふち
      const sp = easeOut(seg(t, 2.3, 3.0));
      k.set(lining, { 'stroke-width': 7 * sp, stroke: '#EEF3F9' });
      const gp = hump(seg(t, 2.6, 3.4));
      tf(glint, cx + 52, 76 - 50, 0, 1.6 * gp, 1.6 * gp);
      // 雨は雲の下からふり、日が差すと止む
      rain.forEach((r, i) => {
        const p = ((t * 1.6 + i * 0.17) % 1);
        const on = 1 - seg(t, 1.3, 1.9);
        tf(r, cx - 56 + i * 22 + (i % 2) * 6, 100 + p * 110, 0, 1, 1);
        r.setAttribute('opacity', on * (1 - p * 0.3));
      });
      sky.setAttribute('opacity', 0.45 * clear);
      const up = easeOut(seg(t, 2.2, 3.0));
      b.pose({ ...base, mood: up > 0.4 ? 'grin' : 'sad', lean: lerp(8, -4, up), look: 0.2 + 0.5 * up, armL: lerp(8, 140, up), armR: lerp(8, 140, up), squash: 1 + 0.02 * Math.sin(t * 5) * up });
      b.state.look = lerp(0, 0.8, up);
    }
  };
}
