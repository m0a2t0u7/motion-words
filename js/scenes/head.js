// head：後ろを見ながら歩いていて、閉まったドアに頭をゴツン。たんこぶをさする（例文 He hit his head on the door.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, bp, gait, ache, spot } from './body.js';
import { homeBg } from './furniture.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.2, beats: [[0, '後ろを見て歩く'], [1.4, 'ゴツン！'], [2.4, '頭をさする']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.1, FY = 236;
  homeBg(k, { FY, winX: 30 });
  // 閉まったドア（動かない）
  el('rect', { x: 296, y: 78, width: 74, height: FY - 78, fill: '#C9A577' });
  el('rect', { x: 302, y: 84, width: 62, height: FY - 84, rx: 2, fill: pal.wood });
  el('rect', { x: 312, y: 96, width: 42, height: 50, rx: 3, fill: '#000', opacity: 0.06 });
  el('circle', { cx: 310, cy: 166, r: 4.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 });
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const bump = el('ellipse', { rx: 9, ry: 6, fill: '#FF9C8C' });
  const stars = [0, 1, 2].map(() => star(k, null, 7));
  const hurt = ache(k);
  const xf = (t) => (t < 1.4 ? lerp(120, 262, easeIn(seg(t, 0.1, 1.4)) * 0.5 + seg(t, 0.1, 1.4) * 0.5) : lerp(262, 236, easeOut(seg(t, 1.4, 1.8))));
  return {
    update(t) {
      const gt = gait(xf, t, 120), hit = t > 1.4;
      const sq = hit ? 1 - 0.12 * Math.exp(-(t - 1.4) * 8) * Math.cos((t - 1.4) * 30) : 1;
      const rub = easeInOut(seg(t, 2.2, 2.6));
      P(b, { x: gt.x, walk: hit ? Math.round(gt.walk / Math.PI) * Math.PI : gt.walk, lean: hit ? -10 * Math.exp(-(t - 1.4) * 4) : gt.lean, armL: gt.armL, armR: gt.armR, squash: sq, look: hit ? 0.2 : -1, mood: hit ? (t < 2.2 ? 'open' : 'sad') : 'smile', blink: hit && t < 2.0 ? 1 : blinkAt(t) });
      const top = bp(b, S, 4, -82);
      if (rub > 0) b.pose({ armR: lerp(8, reach(b, S, 'R', top.x + 6, top.y + 2 + 3 * Math.sin(t * 16)), rub) });
      k.set(bump, { cx: top.x, cy: top.y + 2, opacity: t > 1.5 ? 1 : 0, transform: '' });
      bump.setAttribute('ry', (6 * easeOut(seg(t, 1.45, 1.7))).toFixed(2));
      stars.forEach((s, i) => { const a = t * 5 + i * 2.1; tf(s, top.x + 26 * Math.cos(a), top.y - 14 + 7 * Math.sin(a), 0, hit && t < 3.4 ? 1 : 0.001); });
      hurt.set(easeOut(seg(t, 1.4, 1.6)) * (1 - seg(t, 3.6, 4.0)), top.x + 24, top.y - 4, t, 30);
    }
  };
}
