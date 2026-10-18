// come apart：ロボットのおもちゃを落とすと、頭や腕の部品が外れてばらばらに散らばる（例文 The toy came apart when he dropped it.）
import { seg, lerp, easeIn, easeOut, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 3.8, beats: [[0, 'おもちゃを持つ'], [1.1, '落とす'], [2.6, '部品が外れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('ellipse', { cx: 230, cy: 262, rx: 150, ry: 20, fill: '#E3E7F2' });
  el('rect', { x: 300, y: 60, width: 70, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const B = k.buddy({ x: 140, y: FY, scale: 0.9 });
  const parts = [
    { dx: 0, dy: -24, w: 20, h: 16, c: pal.blue, vx: -40, r: -200 },   // 頭
    { dx: 0, dy: 0, w: 24, h: 26, c: pal.blueDark, vx: 6, r: 10 },       // 胴
    { dx: -16, dy: -2, w: 6, h: 18, c: pal.yellow, vx: -70, r: -300 },   // 左腕
    { dx: 16, dy: -2, w: 6, h: 18, c: pal.yellow, vx: 80, r: 260 },      // 右腕
    { dx: -6, dy: 20, w: 7, h: 12, c: pal.violet, vx: 46, r: 120 },      // 脚
    { dx: 6, dy: 20, w: 7, h: 12, c: pal.violet, vx: 110, r: -140 }
  ].map((p) => {
    const n = g({});
    el('rect', { x: -p.w / 2, y: -p.h / 2, width: p.w, height: p.h, rx: 3, fill: p.c }, n);
    if (p.dy === -24) { el('circle', { cx: -4, cy: -1, r: 2.4, fill: '#fff' }, n); el('circle', { cx: 4, cy: -1, r: 2.4, fill: '#fff' }, n); }
    return { ...p, n, sh: k.shadow(0, FY + 1, p.w * 0.6, 2.5) };
  });
  return {
    update(t) {
      const rel = 1.1, f = seg(t, rel, rel + 0.4);
      const hx = 200, hy = FY - 66;
      B.pose({ armR: t < rel ? reach(B, 0.9, 'R', hx, hy) : lerp(reach(B, 0.9, 'R', hx, hy), 30, easeOut(seg(t, rel, rel + 0.5))), armL: 10, look: lerp(0.4, 0.8, seg(t, rel, rel + 0.3)), mood: t > rel + 0.4 ? 'open' : 'smile', lean: 8 * seg(t, rel + 0.4, rel + 0.8) });
      if (t > 2.8) B.pose({ mood: 'sad' });
      const by = lerp(hy + 10, FY - 26, easeIn(f));
      parts.forEach((p) => {
        const s = seg(t, rel + 0.4, rel + 1.3), land = seg(t, rel + 1.3, rel + 2.0);
        let x = hx + p.dx, y = by + p.dy, r = 0;
        if (s > 0) {
          x += p.vx * easeOut(s);
          const floor = FY - p.h / 2;
          y = lerp(y, floor, s) - 40 * Math.sin(s * Math.PI) * (p.dx || p.dy < 0 ? 1 : 0.2) - 4 * Math.abs(wobble(land, 1, 6));
          r = p.r * easeOut(s);
        }
        tf(p.n, x, y, r);
        p.sh.setAttribute('opacity', f > 0 ? clamp(f) : 0); tf(p.sh, x, 0);
      });
    }
  };
}
