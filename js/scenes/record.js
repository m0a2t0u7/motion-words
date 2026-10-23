// record：机でノートに、使ったお金を1行ずつ書きとめる（例文 Keep a record of what you spend.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, 'ノートを前に'], [1.2, '1行ずつ書く'], [3.4, '記録がそろう']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 130, y: FY, scale: S });
  desk(k, 150, 240, 200);
  k.shadow(210, 200, 36, 3);
  // ノート（机に立てかけた帳面）
  el('rect', { x: 176, y: 138, width: 70, height: 62, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 176, y: 138, width: 70, height: 9, rx: 3, fill: pal.blue });
  const ys = [160, 174, 188];
  const rows = ys.map((y, i) => {
    const r = g({});
    el('circle', { cx: 190, cy: y - 4, r: 5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, r);
    el('line', { x1: 200, y1: y - 3, x2: 200 + [30, 24, 34][i], y2: y - 3, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, r);
    return r;
  });
  const cp = k.g({});
  [[290, 200], [290, 196], [290, 192]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y - 2, rx: 14, ry: 4, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, cp));
  const pen = g({});
  el('line', { x1: 0, y1: 0, x2: 12, y2: -16, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pen);
  return {
    update(t) {
      const wr = seg(t, 1.2, 3.4), n = Math.min(3, Math.floor(wr * 3)), lp = (wr * 3) % 1;
      const o = { x: 130, lean: 5, armL: 8, look: 0.8, mood: t > 3.5 ? 'grin' : 'smile', blink: blinkAt(t) };
      P(b, { ...o, armR: 8 });
      const s = hp(b, S, 'R', 0);
      const wy = wr > 0 && wr < 1 ? ys[n] - 2 + Math.sin(lp * 40) * 0.8 : 170;
      const a = reach(b, S, 'R', s.x + 30, lerp(190, wy, easeOut(seg(t, 0.3, 1.0))));
      P(b, { ...o, armR: lerp(8, a, easeOut(seg(t, 0.2, 1.0))) + (wr > 0 && wr < 1 ? Math.sin(lp * 40) * 2 : 0) });
      const h = hp(b, S, 'R');
      tf(pen, h.x - 4, h.y + 4);
      rows.forEach((r, i) => { const p = wr * 3 - i; r.setAttribute('opacity', p > 0.15 ? 1 : 0); });
    }
  };
}
