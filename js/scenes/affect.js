// affect：夜中までスマホを見て寝不足になり、朝ふらふらで体の電池が減る（例文 Lack of sleep affects your health.）
import { seg, lerp, easeInOut, easeOut, hump, smooth } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { held } from './dig.js';
import { phone } from './look-over.js';

const mix = (a, b, p) => {
  const h = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], p)).toString(16).padStart(2, '0')).join('');
};

export const meta = { duration: 4.4, beats: [[0, '夜ふかし'], [1.9, '寝不足の朝'], [3.2, '体調が悪い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const wall = el('rect', { x: 0, y: 0, width: 400, height: 236, fill: '#3D4466' });
  const sky = el('rect', { x: 270, y: 40, width: 96, height: 76, rx: 6, stroke: '#fff', 'stroke-width': 5 });
  const moon = el('circle', { cx: 340, cy: 64, r: 10, fill: '#FFF3C4' });
  const sun = el('circle', { cx: 300, cy: 100, r: 13, fill: pal.yellow });
  el('line', { x1: 318, y1: 40, x2: 318, y2: 116, stroke: '#fff', 'stroke-width': 4 });
  const ck = clock(k, 200, 66, 22);
  // ベッドの端
  el('rect', { x: 0, y: 196, width: 120, height: 40, rx: 8, fill: '#9FB7E8' });
  el('rect', { x: 0, y: 186, width: 40, height: 14, rx: 6, fill: '#fff' });
  const S = 0.95;
  const me = k.buddy({ x: 170, y: FY, scale: S });
  const ph = g({}); const pg = phone(k, ph);
  const glow = el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 22, fill: '#BFE3FF', opacity: 0.35 });
  // 体の電池
  const bat = g({});
  el('rect', { x: -20, y: -10, width: 40, height: 20, rx: 4, fill: '#fff', stroke: pal.ink, 'stroke-width': 2.5 }, bat);
  el('rect', { x: 20, y: -4, width: 4, height: 8, rx: 1, fill: pal.ink }, bat);
  const lvl = el('rect', { x: -16, y: -6, width: 32, height: 12, rx: 2 }, bat);
  const bags = [-10, 10].map((x) => el('path', { d: `M ${x - 5} -47 Q ${x} -43 ${x + 5} -47`, stroke: '#7E7AA8', 'stroke-width': 2, fill: 'none', opacity: 0 }, me.body.children[3]));
  return {
    update(t) {
      const morn = smooth(seg(t, 1.6, 2.2));
      wall.setAttribute('fill', mix('#3D4466', '#F6F3EE', morn));
      sky.setAttribute('fill', mix('#2F3A5C', '#DDEFFA', morn));
      moon.setAttribute('opacity', 1 - morn); sun.setAttribute('opacity', morn);
      // 時計：夜11時 → 3時 → 朝7時
      const h = lerp(11, 19, easeInOut(seg(t, 0.2, 2.0)));
      ck.set(h, (h % 1) * 60);
      const night = t < 1.8;
      const sway = Math.sin(t * 3) * 6 * seg(t, 2.4, 3.0);
      P(me, { x: 170 + sway * 0.5, armR: night ? 70 : 8, armL: 8, lean: night ? 8 : 10 * seg(t, 2.2, 2.8) + sway, squash: night ? 1 : 1 - 0.07 * seg(t, 2.2, 2.8),
        look: night ? 0.6 : 0, blink: night ? 0.15 : 0.55 + 0.4 * hump(seg(t, 3.3, 3.8)), mood: night ? 'flat' : t > 2.6 ? 'sad' : 'flat' });
      bags.forEach((b) => b.setAttribute('opacity', seg(t, 2.0, 2.5)));
      const hp = held(k, me, S, ph, 'R', 80);
      ph.setAttribute('opacity', night ? 1 : 0);
      tf(glow, hp.x + 6, hp.y - 14); glow.setAttribute('opacity', night ? 0.35 : 0);
      const e = seg(t, 2.4, 3.4), L = lerp(1, 0.18, easeInOut(e));
      k.set(lvl, { width: 32 * L, fill: L > 0.5 ? pal.green : L > 0.3 ? pal.yellow : pal.red });
      tf(bat, 178, 112 - 6 * easeOut(seg(t, 2.2, 2.6)), 0, Math.max(0.001, easeOut(seg(t, 2.2, 2.6))));
    }
  };
}
