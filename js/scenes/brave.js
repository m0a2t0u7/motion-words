// brave：消防士のまめが、火の出ている家から子どもを抱えて出てきて、安全な所へ下ろす（例文 The brave firefighter saved the child.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt, hp, walkTo, path, helmet, person, cloudG, star, sym } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '火事の家'], [1.0, '子どもを抱えて'], [3.0, '救い出した']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, CS = 0.55;
  const FY = k.backdrop({ floorY: 236 });
  // 家（窓から炎）
  el('rect', { x: 10, y: FY - 130, width: 130, height: 130, fill: '#F3E6DC' });
  el('path', { d: `M 0 ${FY - 128} L 75 ${FY - 180} L 150 ${FY - 128} Z`, fill: '#C98A5A' });
  el('rect', { x: 92, y: FY - 70, width: 36, height: 70, fill: '#5E4A3A' });
  const flames = [[46, FY - 92], [108, FY - 116]].map(([x, y]) => {
    el('rect', { x: x - 20, y: y - 16, width: 40, height: 34, rx: 3, fill: '#5E4A3A' });
    const f = g({}); tf(f, x, y + 16);
    el('path', { d: 'M -16 0 Q -20 -22 -6 -34 Q -4 -20 4 -26 Q 2 -38 12 -46 Q 22 -24 16 0 Z', fill: '#FF8A3D' }, f);
    el('path', { d: 'M -8 0 Q -10 -14 0 -22 Q 4 -12 8 -16 Q 12 -8 8 0 Z', fill: pal.yellow }, f);
    return f;
  });
  const smoke = [0, 1, 2].map((i) => cloudG(k, 50, 24, '#C9CED6', undefined, false));
  // 消防車の赤いホース（地面）
  const b = k.buddy({ x: 110, y: FY, scale: S });
  helmet(k, b, pal.red, '#C94B40');
  const kid = person(k, 'coral', { x: 140, y: FY, scale: CS });
  const xf = path([[0.3, 110], [2.6, 270]]);
  const thx = sym(k, '♥', pal.red, 20), st = star(k, undefined, 10);
  return {
    update(t) {
      flames.forEach((f, i) => { const x = i ? 108 : 46, y = (i ? FY - 116 : FY - 92) + 16; tf(f, x, y, 0, 1 + 0.08 * Math.sin(t * 13 + i), 1 + 0.14 * Math.sin(t * 9 + i * 2)); });
      smoke.forEach((s, i) => { const q = ((t * 0.35) + i / 3) % 1; tf(s, 70 + i * 26 + q * 30, FY - 150 - q * 90, 0, 0.6 + q * 0.8); s.setAttribute('opacity', (1 - q) * 0.9); });
      const w = walkTo(xf, t, 110, 1), down = easeInOut(seg(t, 2.6, 3.2));
      P(b, { x: w.x, walk: w.walk, lean: w.lean + 10 * hump(seg(t, 2.6, 3.2)), armR: lerp(70, 40, down), armL: lerp(-40, 8, down) + 150 * easeOut(seg(t, 3.4, 3.8)),
        mood: t > 3.3 ? 'grin' : 'flat', look: 0.4, blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      // 抱えている間は腕に乗せ、下ろしたら地面に立つ
      const cx = lerp(h.x - 2, h.x + 14, down), cy = lerp(h.y + 6, FY, down);
      const cheer = seg(t, 3.3, 3.7);
      kid.pose({ x: cx, y: Math.min(FY, cy) - 6 * hump(seg(t, 3.5, 3.9)), facing: -1, armL: 150 * cheer + 20, armR: 150 * cheer + 20, mood: t > 3.2 ? 'grin' : 'sad', look: 0.3, lean: lerp(-10, 0, down) });
      thx(seg(t, 3.6, 4.0), cx - 4, FY - 70);
      tf(st, w.x - 20, FY - 120, t * 60, Math.max(0.001, easeOut(seg(t, 3.6, 4.0))));
    }
  };
}
