// set out：朝焼けの中、荷物を背負った2人が山に向かって歩き出す（例文 They set out for the mountain at dawn.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '荷物を背負う'], [1.0, '歩き出す'], [3.2, '山へ向かう']] };


export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'evening' });
  const sun = el('circle', { cx: 330, r: 24, fill: '#FFD27A' });
  const halo = el('circle', { cx: 330, r: 40, fill: '#FFE3A8', opacity: 0.4 });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: pal.floor });
  // 山と道（静止）
  el('path', { d: 'M 180 244 L 290 70 L 400 244 Z', fill: '#C7B8D6' });
  el('path', { d: 'M 266 108 L 290 70 L 314 108 L 300 102 L 290 112 L 279 101 Z', fill: '#fff' });
  el('path', { d: 'M 90 244 L 170 150 L 250 244 Z', fill: '#D2C3C9' });
  el('rect', { x: 0, y: FY, width: 400, height: 10, fill: '#E9DDD3' });
  [[40, 200], [150, 214]].forEach(([x, y]) => { el('rect', { x: x - 3, y, width: 6, height: 30, fill: pal.woodDark }); el('circle', { cx: x, cy: y - 6, r: 17, fill: '#8FCB9B' }); });
  const S = 0.85;
  const a = k.buddy({ x: 110, y: FY + 6, scale: S });
  const c = k.buddy({ x: 38, y: FY + 6, scale: S, color: pal.coral, dark: pal.coralDark });
  const bk = (b, col, dark) => {
    const r = el('rect', { x: -46, y: -68, width: 24, height: 44, rx: 9, fill: col, stroke: dark, 'stroke-width': 2.5 }, b.body);
    const p = el('rect', { x: -43, y: -54, width: 16, height: 9, rx: 3, fill: dark, opacity: 0.35 }, b.body);
    b.body.insertBefore(r, b.body.children[1]); b.body.insertBefore(p, b.body.children[2]);
  };
  bk(a, pal.blue, pal.blueDark); bk(c, pal.yellow, pal.yellowDark);
  return {
    update(t) {
      k.set(sun, { cy: lerp(236, 150, easeOut(seg(t, 0, 3.6))) });
      k.set(halo, { cy: lerp(236, 150, easeOut(seg(t, 0, 3.6))) });
      // 荷物を担いで体を揺らし、歩き出す
      const adj = hump(seg(t, 0.2, 0.9));
      const wp = seg(t, 0.9, 4.2);
      const go = easeInOut(seg(t, 0.9, 1.6)); // 動き出しは加速
      const x = lerp(110, 270, go * 0.12 + wp * 0.88);
      const ph = t > 0.9 ? (t - 0.9) * 9 * (0.4 + 0.6 * go) : 0;
      const moving = t > 0.9;
      a.pose({ x, walk: ph, armR: moving ? 8 + Math.sin(ph) * 22 * go : 8 + 80 * adj, armL: moving ? 8 - Math.sin(ph) * 22 * go : 8 + 80 * adj,
        lean: 2 + 6 * go, squash: 1 - 0.03 * adj, look: 0.6, mood: 'smile' });
      const x2 = lerp(38, 190, go * 0.12 + wp * 0.88);
      c.pose({ x: x2, walk: ph + 1.2, armR: moving ? 8 - Math.sin(ph) * 22 * go : 8, armL: moving ? 8 + Math.sin(ph) * 22 * go : 8, lean: 2 + 6 * go, look: 0.6,
        squash: 1 - 0.03 * adj, mood: 'grin' });
    }
  };
}
