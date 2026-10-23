// wrist：手首にうで時計をした女の人が、腕を上げて時刻を見る（例文 She wears a watch on her wrist.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, limb, lens, spot } from './body.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, 'うで時計'], [1.0, '手首を上げる'], [2.2, '時刻を見る']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.35, FY = 240;
  streetBg(k, FY);
  const b = k.buddy({ x: 140, y: FY, scale: S, facing: 1 });
  b.armR.a.setAttribute('display', 'none');
  const arm = limb(k, pal.mint, pal.mintDark, S);
  const watch = g({});
  el('rect', { x: -8, y: -4, width: 16, height: 8, rx: 2, fill: pal.ink }, watch);
  el('circle', { r: 6, fill: '#fff', stroke: pal.yellowDark, 'stroke-width': 2 }, watch);
  const ring = spot(k);
  const L = lens(k, 46);
  el('circle', { r: 30, fill: '#fff', stroke: pal.yellowDark, 'stroke-width': 5 }, L.inner);
  el('rect', { x: -12, y: -60, width: 24, height: 30, fill: pal.ink }, L.inner); el('rect', { x: -12, y: 30, width: 24, height: 30, fill: pal.ink }, L.inner);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: 24 * Math.sin(a), y1: -24 * Math.cos(a), x2: 27 * Math.sin(a), y2: -27 * Math.cos(a), stroke: pal.sub, 'stroke-width': 2 }, L.inner); }
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -14, stroke: pal.ink, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, L.inner);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -22, stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, L.inner);
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.8, 1.4));
      P(b, { look: lerp(0.3, 0.8, up), blink: blinkAt(t), mood: t > 2.4 ? 'smile' : 'flat', armL: 10 });
      faceTilt(b, 3 * up, 3 * up);
      const sh = bp(b, S, 27, -46);
      const hd = { x: lerp(sh.x + 2, sh.x + 30, up), y: lerp(sh.y + 34, sh.y - 6, up) };
      const r = arm.set(sh, hd, up > 0.3 ? 1 : 1);
      const w = { x: lerp(r.e.x, r.h.x, 0.72), y: lerp(r.e.y, r.h.y, 0.72) };
      const ang = Math.atan2(r.h.y - r.e.y, r.h.x - r.e.x) * 180 / Math.PI;
      tf(watch, w.x, w.y, ang + 90, S * 0.8);
      ring.set(seg(t, 0.2, 0.6) * (1 - seg(t, 1.6, 1.9)), w.x, w.y, 16, t);
      L.show(easeOut(seg(t, 1.8, 2.3)), 300, 96, w.x, w.y);
      mh.setAttribute('transform', `rotate(${(t * 60).toFixed(1)})`); hh.setAttribute('transform', 'rotate(100)');
    }
  };
}
const faceTilt = (b, dx, dy) => b.body.children[3].setAttribute('transform', `translate(${dx.toFixed(2)} ${(-dy).toFixed(2)})`);
