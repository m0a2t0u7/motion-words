// set down：重い荷物を持ったまま、かがんで床にそっと置く（例文 He set down the heavy bag on the floor.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { hp, grip, decor } from './hand-over.js';

export const meta = { duration: 4.0, beats: [[0, '重い荷物を持つ'], [1.3, 'かがむ'], [2.9, '床に置いた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  decor(k, FY);
  const S = 1.05;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const low = { squash: 0.78, lean: 16, armR: 52, armL: 12 };
  b.pose(low);
  const xr = hp(b, S).x;
  const sh = k.shadow(0, FY, 28, 5);
  const bag = g({});
  const body = g({}, bag);
  el('path', { d: 'M -14 -22 Q -14 -34 0 -34 Q 14 -34 14 -22', fill: 'none', stroke: pal.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, body);
  el('rect', { x: -26, y: -24, width: 52, height: 26, rx: 9, fill: pal.violet }, body);
  el('rect', { x: -26, y: -24, width: 52, height: 8, rx: 5, fill: '#fff', opacity: 0.25 }, body);
  el('line', { x1: -22, y1: -12, x2: 22, y2: -12, stroke: '#7B61D6', 'stroke-width': 2 }, body);
  el('rect', { x: -9, y: -17, width: 18, height: 6, rx: 3, fill: pal.yellow }, body);
  const dust = g({});
  [-1, 1].forEach((s) => el('path', { d: `M ${s * 30} -2 l ${s * 12} -3 M ${s * 30} -8 l ${s * 12} -8`, stroke: pal.sub, 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' }, dust));
  const gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const dn = easeInOut(seg(t, 1.0, 1.9)), rel = easeInOut(seg(t, 2.35, 3.0));
      const heavy = (1 - dn) * (1 - rel);
      const squash = lerp(lerp(0.97, low.squash, dn), 1, rel);
      const lean = lerp(lerp(-7, low.lean, dn), -2, rel);
      const armR = lerp(lerp(8, low.armR, dn), 10, seg(t, 2.35, 3.0));
      b.pose({ squash, lean, armR, armL: lerp(26, 12, dn) * (1 - rel) + 8 * rel, look: 0.4,
        mood: t < 1.0 ? 'sad' : t < 2.4 ? 'flat' : 'smile' });
      const h = hp(b, S);
      const held = t < 2.35;
      const bx = held ? h.x : xr;
      const sway = t < 1.0 ? Math.sin(t * 3) * 2.5 : 0;
      const by = Math.min(h.y + 14, FY - 2);
      const land = seg(t, 1.6, 2.4);
      tf(bag, bx + sway, by, sway, 1 + 0.07 * wobble(land, 2.5, 5) * (land > 0 ? 1 : 0), 1 - 0.07 * wobble(land, 2.5, 5) * (land > 0 ? 1 : 0));
      const air = Math.max(0, FY - 2 - by) / 30;
      k.set(sh, { cx: bx + sway * 0.5, rx: 28 * (1 - air * 0.2), opacity: 1 - air * 0.5 });
      tf(dust, bx, FY - 1, 0, 1, 1);
      dust.setAttribute('opacity', hump(seg(t, 1.6, 2.1)) * 0.9);
      if (held) gr(h); else gr({ x: -50, y: -50 });
    }
  };
}
