// come round：転んで倒れていた人が、しばらくして目を覚まし、起き上がる（例文 He came round a few minutes after the fall.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { person } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '倒れている'], [1.8, '目を覚ます'], [3.8, '起き上がった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 290, y: 46, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  // 倒れた踏み台（転んだ跡）
  const stool = g({}); tf(stool, 286, FY, 90);
  el('rect', { x: -22, y: -36, width: 44, height: 8, rx: 3, fill: pal.wood }, stool);
  el('rect', { x: -18, y: -28, width: 6, height: 28, fill: pal.woodDark }, stool); el('rect', { x: 12, y: -28, width: 6, height: 28, fill: pal.woodDark }, stool);
  k.shadow(270, FY + 1, 24, 3);
  // 時計：数分たつ
  const clock = g({}); tf(clock, 80, 80);
  el('circle', { r: 20, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, clock);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -14, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, clock);
  el('line', { x1: 0, y1: 0, x2: 8, y2: 0, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, clock);
  const S = 0.85;
  const helper = person(k, 'coral', { x: 110, y: FY, scale: S });
  const wrap = g({});
  const me = k.buddy({ parent: wrap, x: 0, y: 0, scale: S });
  me.g.firstChild.setAttribute('opacity', 0);
  const lyShadow = k.shadow(190, FY + 2, 44, 5);
  wrap.parentNode.insertBefore(lyShadow, wrap);
  const stars = g({});
  [0, 1, 2].forEach((i) => el('path', { d: 'M 0 -6 L 2 -2 L 6 0 L 2 2 L 0 6 L -2 2 L -6 0 L -2 -2 Z', fill: pal.yellow, transform: `rotate(${i * 120}) translate(16 0)` }, stars));
  return {
    update(t) {
      tf(mh, 0, 0, t * 70);
      const up = easeInOut(seg(t, 2.4, 3.4));
      const rot = lerp(-90, 0, up) + (t > 3.4 ? 2 * wobble(seg(t, 3.4, 4.0), 2, 5) : 0);
      tf(wrap, 220, lerp(FY - 30 * S, FY, up), rot);
      const eyes = t < 1.6 ? 1 : t < 2.2 ? 0.5 + 0.5 * Math.cos((t - 1.6) * 20) : 0;
      me.pose({ blink: Math.max(0, Math.min(1, eyes)), mood: t < 2.2 ? 'flat' : t < 3.4 ? 'open' : 'smile', armR: lerp(30, 10, up), armL: lerp(30, 10, up) });
      lyShadow.setAttribute('opacity', 1 - up * 0.6);
      tf(lyShadow, lerp(190, 220, up), 0, 0, lerp(1, 0.6, up), 1);
      stars.setAttribute('opacity', 1 - seg(t, 1.6, 2.2));
      tf(stars, 172, FY - 40, t * 140, 1);
      const hk = easeOut(seg(t, 0.1, 0.6));
      helper.pose({ x: 110, squash: 1 - 0.12 * hk, lean: 10 * hk * (1 - up * 0.6), armR: lerp(10, 60, hk) + 10 * Math.sin(t * 5) * (1 - up), look: 0.5, mood: t < 2.2 ? 'sad' : 'grin' });
    }
  };
}
