// fall apart：まめが両手で持った古い箱が、手の中で底と側面がばらばらに崩れる（例文 The old box fell apart in my hands.）
import { seg, lerp, easeIn, easeOut, easeInOut, wobble } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, '古い箱を持つ'], [1.4, 'ばらばらに'], [2.8, '崩れ落ちた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 270, y: 120, width: 110, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 280, y: 92, width: 30, height: 28, rx: 3, fill: '#D8B98E' });
  el('rect', { x: 318, y: 100, width: 22, height: 20, rx: 3, fill: '#C9A577' });
  const B = k.buddy({ x: 170, y: FY, scale: 0.9 });
  const box = { x: 170, y: FY - 60 };
  // 箱の部品（中心からの相対位置）
  const parts = [
    { d: 'M -30 -18 L -24 -18 L -24 20 L -30 20 Z', dx: -60, r: -70, c: '#C9A577' },
    { d: 'M 24 -18 L 30 -18 L 30 20 L 24 20 Z', dx: 60, r: 80, c: '#C9A577' },
    { d: 'M -26 -18 L 26 -18 L 26 20 L -26 20 Z', dx: -10, r: 6, c: '#D8B98E' },
    { d: 'M -30 20 L 30 20 L 30 26 L -30 26 Z', dx: 18, r: -10, c: '#B48E62' },
    { d: 'M -30 -24 L 0 -24 L 0 -18 L -30 -18 Z', dx: -34, r: -120, c: '#B48E62' },
    { d: 'M 0 -24 L 30 -24 L 30 -18 L 0 -18 Z', dx: 40, r: 140, c: '#B48E62' }
  ].map((p) => ({ ...p, n: el('path', { d: p.d, fill: p.c, stroke: '#9A7650', 'stroke-width': 1.2 }), sh: k.shadow(0, FY + 1, 20, 3) }));
  const tape = el('path', { d: 'M -10 -24 L 10 -24 L 8 -18 L -12 -18 Z', fill: '#E9DFA8', opacity: 0.9 });
  const front = g({}); B.body.appendChild(B.armR.a);
  return {
    update(t) {
      const crack = t > 1.1 && t < 1.5 ? wobble(seg(t, 1.1, 1.5), 4, 2) * 2 : 0;
      const f = seg(t, 1.45, 2.3);
      const drop = easeOut(seg(t, 1.5, 1.9));
      B.pose({ lean: 4 - 6 * drop, mood: t > 1.4 ? 'open' : 'smile', look: 0.2, lift: 0 });
      if (t > 2.3) B.pose({ mood: 'sad' });
      const tx = box.x, ty = box.y + 6;
      const aL = reach(B, 0.9, 'L', tx - 30, ty), aR = reach(B, 0.9, 'R', tx + 30, ty);
      B.pose({ armL: lerp(aL, 30, drop), armR: lerp(aR, 30, drop) });
      parts.forEach((p, i) => {
        const fe = easeIn(f), land = seg(t, 2.3, 2.9);
        const x = tx + crack + p.dx * easeOut(f), y = ty + (FY - 6 - ty) * fe - 6 * Math.abs(wobble(land, 1, 6)) * (f >= 1 ? 1 : 0);
        tf(p.n, x, y, p.r * f);
        p.sh.setAttribute('opacity', f > 0 ? f : 0); tf(p.sh, x, 0, 0, 0.3 + 0.7 * f, 1);
      });
      tf(tape, tx + crack + 30 * easeOut(f), ty + (FY - 30 - ty) * easeIn(f), 90 * f);
      tape.setAttribute('opacity', 1 - seg(t, 2.0, 2.4));
    }
  };
}
