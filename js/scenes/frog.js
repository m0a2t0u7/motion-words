// frog：池のふちのカエルがぐっとかがんで、ピョーンと池にとびこむ。水しぶきと波紋が広がる（例文 A frog jumped into the pond.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, hills, treeG, tufts } from './nature.js';

// カエル（右向き、原点＝足元）。set(x, y, かがみ 0..1, のび 0..1, 回転)
export function frogG(k, parent) {
  const { el, g } = k;
  const o = g({}, parent), sh = k.shadow(0, 0, 14, 3, o), f = g({}, o);
  const leg = g({}, f); el('path', { d: 'M -8 -4 Q -18 -8 -14 0 L -4 0 Z', fill: '#4FA562' }, leg);
  el('ellipse', { cx: 0, cy: -9, rx: 13, ry: 9, fill: '#6BBF5F' }, f);
  el('ellipse', { cx: 2, cy: -6, rx: 8, ry: 4, fill: '#C9E8A6' }, f);
  [[2, -18], [10, -16]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 4.5, fill: '#6BBF5F' }, f); el('circle', { cx: x + 1, cy: y, r: 2.2, fill: k.pal.ink }, f); });
  el('path', { d: 'M 6 -8 Q 10 -6 13 -9', stroke: '#2E6B33', 'stroke-width': 1.4, fill: 'none' }, f);
  el('path', { d: 'M 6 -2 L 10 0', stroke: '#4FA562', 'stroke-width': 3, 'stroke-linecap': 'round' }, f);
  return { g: o, sh, set(x, y, crouch = 0, str = 0, rot = 0, lift = 0) {
    k.tf(o, x, y); k.tf(sh, 0, lift, 0, Math.max(0.2, 1 - lift / 80), 1);
    k.tf(f, 0, 0, rot, 1 + 0.12 * crouch - 0.1 * str, 1 - 0.18 * crouch + 0.15 * str);
    k.tf(leg, 0, 0, 0, 1 + 0.8 * str, 1);
  } };
}

export const meta = { duration: 4.0, beats: [[0, '池のふち'], [1.0, 'ピョーン'], [2.0, '池にドボン']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 200, top: '#CDE9FA', bot: '#F2FAFE', ground: '#BFE3C4' });
  hills(k, FY); tf(treeG(k, 0.8).g, 360, FY + 2);
  const PX = 250, PY = 258;
  el('ellipse', { cx: PX, cy: PY + 3, rx: 120, ry: 30, fill: '#A8D6A0' });
  el('ellipse', { cx: PX, cy: PY, rx: 112, ry: 26, fill: '#5DB3E0' });
  el('ellipse', { cx: PX + 60, cy: PY + 8, rx: 16, ry: 5, fill: '#6BC48F' });
  tufts(k, FY, 0, 400, '#A9D6B0', 8);
  // 岸の石
  el('ellipse', { cx: 120, cy: 246, rx: 26, ry: 10, fill: '#A9B2C0' });
  const fr = frogG(k);
  const rings = [0, 1, 2].map(() => el('ellipse', { rx: 1, ry: 1, fill: 'none', stroke: '#fff', 'stroke-width': 2.2 }));
  const drops = Array.from({ length: 8 }, () => el('circle', { r: 3, fill: '#BFE6F7' }));
  const me = k.buddy({ x: 52, y: 250, scale: 0.85 });
  const A = { x: 120, y: 240 }, B = { x: 240, y: PY };
  return {
    update(t) {
      const cr = hump(seg(t, 0.6, 1.1)) * (t < 1.0 ? 1 : 0) + (t > 0.6 && t < 1.0 ? seg(t, 0.6, 1.0) : 0) * 0;
      const jp = seg(t, 1.0, 1.9), q = easeInOut(jp);
      const x = lerp(A.x, B.x, jp), y = lerp(A.y, B.y, q) - 70 * hump(jp);
      const inAir = jp > 0 && jp < 1;
      fr.set(x, t < 1.0 ? A.y : y, t < 1.0 ? easeOut(seg(t, 0.5, 0.95)) : 0, inAir ? hump(jp * 1.3) : 0, inAir ? lerp(-30, 50, jp) : 0, inAir ? (lerp(A.y, B.y, q) - y) : 0);
      fr.g.setAttribute('opacity', jp >= 0.98 ? 0 : 1);
      rings.forEach((r, i) => { const p = seg(t, 1.9 + i * 0.3, 3.4 + i * 0.3); k.set(r, { cx: B.x, cy: B.y, rx: 6 + 50 * easeOut(p), ry: 2 + 12 * easeOut(p), opacity: p > 0 && p < 1 ? 1 - p : 0 }); });
      drops.forEach((d, i) => { const p = seg(t, 1.88, 2.5), a = (i / 8) * Math.PI; k.set(d, { cx: B.x + Math.cos(a) * 30 * p, cy: B.y - Math.sin(a) * 36 * hump(p) - 4, opacity: p > 0 && p < 1 ? 1 : 0 }); });
      P(me, { x: 52, y: 250, squash: 0.94, lean: 8, look: clamp((x - 80) / 100, -1, 1), mood: t > 2.0 ? 'grin' : t > 1.0 ? 'open' : 'smile', blink: blinkAt(t), armR: t > 2.1 ? 140 + Math.sin(t * 10) * 14 : 8, lift: t > 2.1 ? 5 * Math.abs(Math.sin(t * 6)) : 0 });
    }
  };
}
