// ankle：階段を下りていて足首をひねる。手すりにつかまり、足首をおさえる（例文 I twisted my ankle on the stairs.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, legs, feet, legG, ache, spot } from './body.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '階段を下りる'], [1.4, 'グキッ'], [2.4, '足首が痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.1, FY = 246;
  homeBg(k, { FY, winX: 300 });
  // 階段（左上から右下へ。動かない）
  const steps = [];
  for (let i = 0; i < 5; i++) { const x = 20 + i * 44, y = 136 + i * 22; el('rect', { x, y, width: 44, height: FY - y, fill: i % 2 ? '#D9B58E' : '#E3C49B' }); el('rect', { x, y, width: 44, height: 4, fill: pal.woodDark }); steps.push({ x: x + 22, y }); }
  el('path', { d: 'M 30 96 L 250 206', stroke: pal.woodDark, 'stroke-width': 5, 'stroke-linecap': 'round' });
  const b = k.buddy({ x: 42, y: 136, scale: S });
  const ft = feet(k, b, '#6D7889');
  const hurt = ache(k), ring = spot(k, pal.red);
  return {
    update(t) {
      // 1段ずつ下りる（3段）→ 4段目でひねる
      const n = clamp(Math.floor(t / 0.42), 0, 3), q = seg(t - n * 0.42, 0, 0.42);
      const tw = t > 1.3;
      let x, y;
      if (!tw) { const a = steps[n], c = steps[Math.min(4, n + 1)]; x = lerp(a.x, c.x, easeInOut(q)); y = lerp(a.y, c.y, easeIn(q)) - 6 * hump(q); }
      else { x = steps[3].x + 6; y = steps[3].y; }
      const wince = easeOut(seg(t, 1.3, 1.5)), hold = easeInOut(seg(t, 2.0, 2.5));
      P(b, { x, y, lean: tw ? lerp(-8, 30, hold) : 4, squash: tw ? 0.9 : 1, mood: tw ? 'open' : 'smile', blink: tw && t < 2.0 ? 1 : blinkAt(t), look: 0.6, armL: tw ? 100 : 20 });
      if (tw) { legs(b, 0, 0); legG(b, 1).setAttribute('transform', `translate(12 -14) rotate(${(-25 * wince).toFixed(1)})`); ft[1].setAttribute('transform', `rotate(${(40 * wince).toFixed(1)} 4 16)`); }
      else ft[1].setAttribute('transform', '');
      const an = { x: x + 14 * S, y: y - 2 };
      if (hold > 0) b.pose({ armR: lerp(20, reach(b, S, 'R', an.x, an.y), hold) });
      if (tw) { legs(b, 0, 0); legG(b, 1).setAttribute('transform', `translate(12 -14) rotate(${(-25 * wince).toFixed(1)})`); }
      hurt.set(wince * (t < 4.4 ? 1 : 1), an.x + 16, an.y - 12, t, 60);
      ring.set(seg(t, 1.4, 1.7), an.x, an.y, 14, t);
    }
  };
}
