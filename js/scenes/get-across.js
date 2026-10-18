// get across（否定）：考えを図で伝えようとするが、相手に届く前に崩れ、相手は「？」のまま（例文 I couldn't get my point across to him.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { person, officeBg, pop } from './queue-up.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '説明する'], [1.8, '届かない'], [3.6, '伝わらない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236);
  const S = 0.9;
  const me = k.buddy({ x: 100, y: FY + 4, scale: S });
  const him = person(k, 'coral', { x: 300, y: FY + 4, scale: S, facing: -1 });
  const bb = bubble(k, 70, 44);
  const idea = g({});
  const parts = [
    el('circle', { cx: -16, cy: 0, r: 7, fill: pal.blue }, idea),
    el('path', { d: 'M -6 0 h 12 m -4 -4 l 4 4 l -4 4', stroke: pal.ink, 'stroke-width': 2.5, fill: 'none' }, idea),
    el('rect', { x: 10, y: -7, width: 14, height: 14, rx: 2, fill: pal.yellow }, idea)
  ];
  const q = bubble(k, 40, 34);
  k.text(0, 1, '?', { 'font-size': 20, fill: pal.coralDark }, q);
  return {
    update(t) {
      const talk = t < 2.6 ? Math.sin(t * 8) : 0;
      me.pose({ armR: 60 + 30 * talk, armL: 40 - 20 * talk, look: 0.6, mood: t < 1.6 ? 'open' : t < 2.8 ? 'flat' : 'sad', lean: t > 2.8 ? -4 * easeOut(seg(t, 2.8, 3.3)) : 3 });
      const s = pop(seg(t, 0.2, 0.6));
      tf(bb, 120, FY - 116, 0, Math.max(0.001, s * (1 - seg(t, 1.0, 1.2))));
      // 図が相手へ飛ぶが、途中でばらばらになって消える
      const fly = easeInOut(seg(t, 1.1, 2.2));
      parts.forEach((pt, i) => {
        const br = seg(t, 1.7, 2.3);
        pt.setAttribute('transform', `translate(${(br * (i - 1) * 14).toFixed(1)} ${(br * br * 40 + br * (i - 1) * -8).toFixed(1)}) rotate(${(br * (i - 1) * 60).toFixed(1)})`);
        pt.setAttribute('opacity', 1 - br);
      });
      tf(idea, lerp(120, 230, fly), FY - 116 + 10 * hump(fly));
      const qs = pop(seg(t, 2.3, 2.7));
      tf(q, 300, FY - 112, 0, Math.max(0.001, qs));
      him.pose({ look: -0.5, mood: 'flat', lean: -6 * hump(seg(t, 2.3, 3.2)), armR: 10 + 120 * easeOut(seg(t, 2.6, 3.0)) });
    }
  };
}
