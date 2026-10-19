// stress：机の上に書類の山がどんどん積まれ、まめの頭の上にもやもやが大きくなる（例文 Too much work causes a lot of stress.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { hp, reach } from './dig.js';
import { drop } from './so-far-so-good.js';

// 書類の束（原点＝底の中央）
export function stack(k, parent) {
  const g = k.g({}, parent || k.root);
  k.el('rect', { x: -20, y: -12, width: 40, height: 12, rx: 2, fill: '#fff', stroke: k.pal.line, 'stroke-width': 1.5 }, g);
  [-9, -5].forEach((y) => k.el('line', { x1: -18, x2: 18, y1: y, y2: y, stroke: k.pal.line, 'stroke-width': 1 }, g));
  k.el('rect', { x: -3, y: -12, width: 6, height: 12, fill: k.pal.blue, opacity: 0.5 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '仕事が来る'], [1.6, '山積み'], [3.0, 'ストレス']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  const S = 1, b = k.buddy({ x: 130, y: FY, scale: S });
  const TY = desk(k, 90, 190, FY);
  monitor(k, 196, TY);
  // 届ける同僚とワゴン
  const co = k.buddy({ x: 330, y: FY, scale: 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 286, y: FY - 44, width: 34, height: 6, rx: 2, fill: '#9AA4B4' });
  el('rect', { x: 290, y: FY - 38, width: 4, height: 30, fill: '#9AA4B4' });
  el('rect', { x: 312, y: FY - 38, width: 4, height: 30, fill: '#9AA4B4' });
  [292, 314].forEach((x) => el('circle', { cx: x, cy: FY - 5, r: 5, fill: pal.ink }));
  const PX = 252, N = 5;
  const piles = Array.from({ length: N }, () => stack(k));
  const cloud = g({});
  [[-18, 0, 14], [0, -8, 17], [18, 0, 14], [0, 6, 14]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#7A8597' }, cloud));
  const scr = el('path', { d: 'M -16 0 q 4 -8 8 0 t 8 0 t 8 0 t 8 0', fill: 'none', stroke: '#fff', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, cloud);
  const drops = [0, 1].map(() => drop(k));
  const wins = [0.2, 0.85, 1.5, 2.15, 2.8];
  return {
    update(t) {
      let tx = 300, ty = FY - 46, w = 0, cur = -1;
      wins.forEach((a, i) => {
        const u = seg(t, a, a + 0.62);
        if (u <= 0 || u >= 1) return;
        cur = i; w = 1;
        const top = TY - 12 * i - 8;
        if (u < 0.35) { tx = 303; ty = FY - 50; } else { tx = PX + 6; ty = top - 10 * Math.sin(seg(u, 0.35, 0.8) * Math.PI); }
      });
      const n = wins.filter((a) => t > a + 0.5).length;
      const sx = cur >= 0 ? (seg(t, wins[cur], wins[cur] + 0.62) < 0.35 ? 316 : 290) : 316;
      co.pose({ x: lerp(330, sx + 14, w), lean: 14 * w, armR: w ? reach(co, 0.92, 'R', tx, ty) : 8, armL: 8, look: 0.4, mood: 'smile' });
      const h = hp(co, 0.92, 'R', 28);
      piles.forEach((p, i) => {
        const a = wins[i], u = seg(t, a, a + 0.62);
        if (u < 0.35) tf(p, 303, FY - 44 - (N - 1 - i) * 0.0, 0, 1);
        else if (u < 0.82) tf(p, h.x - 4, h.y + 8, 0, 1);
        else { const q = wobble(seg(t, a + 0.5, a + 0.9), 2, 6); tf(p, PX, TY - 12 * i, 0, 1 + 0.04 * q, 1 - 0.08 * q); }
        p.setAttribute('opacity', u > 0 || i === 0 ? 1 : 0);
      });
      const st = n / N;
      const shake = st > 0.6 ? Math.sin(t * 50) * 1.2 * st : 0;
      b.pose({ x: 130 + shake, armR: 70 + Math.sin(t * 24) * 4 * (1 - st), armL: 10, squash: 1 - 0.1 * st, lean: 6 * st, mood: st < 0.3 ? 'smile' : st < 0.7 ? 'flat' : 'sad', look: 0.7, blink: st > 0.8 ? 0.4 : 0 });
      const cs = easeOut(seg(t, 1.2, 3.6));
      tf(cloud, 130 + 4 * Math.sin(t * 3), FY - 118 - 6 * cs, 0, Math.max(0.001, 0.4 + 0.9 * cs));
      cloud.setAttribute('opacity', cs > 0.01 ? 1 : 0);
      tf(scr, 0, 0, t * 200 % 360 * 0);
      drops.forEach((d, i) => { const q = ((t - 2.4 - i * 0.5) / 1.0); const f = q - Math.floor(q); tf(d, 108 + i * 46, FY - 92 + 18 * f, 0, 1); d.setAttribute('opacity', t > 2.4 ? Math.sin(f * Math.PI) : 0); });
    }
  };
}
