// fall out：歩いている彼のポケットからコインがこぼれ落ち、床を転がる（例文 A coin fell out of his pocket.）
import { seg, lerp, easeIn, easeOut, wobble, clamp } from '../ease.js';
import { gait, streetBg } from './weigh.js';

export const meta = { duration: 4.0, beats: [[0, 'ポケットにコイン'], [1.2, '落ちる'], [2.6, '床に転がった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  const B = k.buddy({ x: 60, y: FY, scale: 0.9 });
  // 体の横のポケット（体と一緒に動く）
  const pk = g({}, B.body);
  el('path', { d: 'M 6 -28 L 26 -28 L 24 -10 Q 16 -6 8 -10 Z', fill: B.state ? '#4FBCA6' : '', stroke: pal.mintDark, 'stroke-width': 2 }, pk);
  const coinSh = k.shadow(0, FY + 1, 9, 2);
  const coin = g({});
  const disc = el('ellipse', { cx: 0, cy: 0, rx: 8, ry: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5 }, coin);
  el('circle', { r: 3, fill: pal.yellowDark, opacity: 0.6 }, coin);
  const xf = (t) => lerp(60, 330, seg(t, 0.2, 3.8));
  return {
    update(t) {
      const p = gait(xf, t, 60);
      B.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean, look: 0.6, mood: 'smile' });
      // コインは t=1.2 にポケットから出る
      const T0 = 1.2, f = seg(t, T0, T0 + 0.45);
      const px0 = gait(xf, T0, 60).x + 16 * 0.9, py0 = FY - 32 * 0.9;
      let x, y, r = 0, sx = 1;
      if (t < T0) { const q = gait(xf, t, 60); x = q.x + 16 * 0.9; y = py0 - 2; coin.setAttribute('opacity', 0); }
      else {
        coin.setAttribute('opacity', 1);
        const land = seg(t, T0 + 0.45, T0 + 2.2);
        if (f < 1) { x = px0 + 10 * f; y = lerp(py0, FY - 8, easeIn(f)); r = f * 200; }
        else { x = px0 + 10 + 60 * easeOut(land); y = FY - 8 - 10 * Math.abs(wobble(land, 1.2, 7)); r = 200 + 520 * easeOut(land); sx = lerp(1, 0.35, seg(t, T0 + 1.9, T0 + 2.6)); }
      }
      tf(coin, x, y, r, sx, 1);
      coinSh.setAttribute('opacity', t > T0 ? clamp(f) : 0); tf(coinSh, x || 0, 0);
    }
  };
}
