// turn into：夜、かさに当たっていた雨がしだいに雪に変わり、地面が白くなる（例文 The rain turned into snow at night.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '夜の雨'], [1.8, '雪に変わる'], [3.8, '雪になった']] };
const N = 22;

export function create(k) {
  const { el, g, tf, pal } = k;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#2E3A5C'], [1, '#55628A']]) });
  el('circle', { cx: 340, cy: 48, r: 14, fill: '#FFF3C4', opacity: 0.85 });
  // 家と街灯
  el('rect', { x: 20, y: 140, width: 110, height: 96, fill: '#6A7598' }); el('path', { d: 'M 10 144 L 75 98 L 140 144 Z', fill: '#4E587A' });
  el('rect', { x: 40, y: 166, width: 26, height: 22, rx: 3, fill: '#FFD98A' }); el('rect', { x: 84, y: 166, width: 26, height: 22, rx: 3, fill: '#FFD98A' });
  el('rect', { x: 330, y: 120, width: 6, height: 116, fill: '#3B4566' }); el('circle', { cx: 333, cy: 118, r: 9, fill: '#FFE9A8' });
  const FY = 236;
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#7C86A6' });
  const snowG = el('rect', { x: 0, y: FY, width: 400, height: 0, fill: '#F4F7FB' });
  const roofS = el('path', { d: 'M 10 144 L 75 98 L 140 144 L 140 144 L 75 98 Z', fill: '#F4F7FB', opacity: 0 });
  const S = 0.85;
  const b = k.buddy({ x: 210, y: FY, scale: S });
  const umb = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: -62, stroke: pal.ink, 'stroke-width': 3 }, umb);
  el('path', { d: 'M -52 -60 Q 0 -110 52 -60 Q 39 -66 26 -60 Q 13 -66 0 -60 Q -13 -66 -26 -60 Q -39 -66 -52 -60 Z', fill: pal.yellow }, umb);
  const umbSnow = el('path', { d: 'M -40 -76 Q 0 -104 40 -76', stroke: '#fff', 'stroke-width': 0, fill: 'none', 'stroke-linecap': 'round' }, umb);
  const ps = Array.from({ length: N }, () => { const p = g({}); const r = el('line', { x1: 0, y1: -6, x2: -2, y2: 6, stroke: '#9FDCF8', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, p); const s = el('circle', { r: 3.4, fill: '#fff' }, p); return { p, r, s }; });
  // 雪っぽさ s(t)、落下距離は速度の積分（t だけから計算）
  const sn = (t) => easeInOut(seg(t, 1.6, 2.8));
  const dist = (t) => { let d = 0; const n = 60, h = t / n; for (let i = 0; i < n; i++) d += lerp(320, 70, sn((i + 0.5) * h)) * h; return d; };
  return {
    update(t) {
      const s = sn(t), D = dist(t);
      ps.forEach((q, i) => {
        const x0 = (i * 71) % 400 + 10, off = (i * 137) % 300;
        const y = ((D + off) % 300) - 10;
        const x = x0 + Math.sin(t * 2 + i) * 10 * s - y * 0.08 * (1 - s);
        const hide = x > 152 && x < 268 && y > FY - 140 && y < FY;
        tf(q.p, x, y);
        q.p.setAttribute('opacity', hide ? 0 : 1);
        q.r.setAttribute('opacity', 1 - s); q.s.setAttribute('opacity', s);
      });
      const acc = seg(t, 2.4, 4.6);
      k.set(snowG, { y: FY - 6 * acc, height: 64 + 6 * acc });
      umbSnow.setAttribute('stroke-width', 7 * acc);
      roofS.setAttribute('opacity', acc);
      const catchA = easeInOut(seg(t, 3.4, 3.9));
      P(b, { x: 210, armR: 150, armL: lerp(10, 80, catchA), look: lerp(0.2, -0.2, catchA), lean: 0, mood: t > 2.4 ? 'open' : 'smile', squash: 1 - 0.02 * Math.sin(t * 2), blink: blinkAt(t) });
      const h = hp(b, S, 'R');
      tf(umb, h.x, h.y + 4);
    }
  };
}
