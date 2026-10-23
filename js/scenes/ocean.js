// ocean：桟橋の先まで歩いたまめが、水平線まで広がる静かで青い大海原をながめて深呼吸する（例文 The ocean was calm and blue.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { sunG, cloudG, birdG } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '桟橋を歩く'], [1.8, '海をながめる'], [3.0, '静かで青い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#BFE4FA'], [1, '#F1FAFE']]) });
  tf(sunG(k, 16).g, 300, 40); tf(cloudG(k, 70, 26), 80, 46);
  const HZ = 112;
  el('rect', { x: 0, y: HZ, width: 400, height: 190, fill: k.gradient([[0, '#3A8FD6'], [0.5, '#2E7CC4'], [1, '#2569B0']]) });
  el('rect', { x: 0, y: HZ, width: 400, height: 3, fill: '#7FBCEB' });
  const glints = Array.from({ length: 14 }, (_, i) => el('rect', { x: (i * 71) % 380 + 10, y: HZ + 14 + ((i * 37) % 90), width: 10 + (i % 3) * 6, height: 2, rx: 1, fill: '#fff' }));
  // 遠くの帆船
  const boat = g({});
  el('path', { d: 'M -14 0 L 14 0 L 10 6 L -10 6 Z', fill: '#fff' }, boat); el('path', { d: 'M 0 -2 L 0 -26 L 12 -4 Z', fill: '#fff' }, boat); el('path', { d: 'M -2 -4 L -2 -20 L -11 -4 Z', fill: '#FFE0D6' }, boat);
  const bird = birdG(k, '#fff');
  // 桟橋（手前左）
  const DY = 236;
  el('path', { d: `M 0 ${DY} L 230 ${DY} L 230 ${DY + 12} L 0 ${DY + 12} Z`, fill: '#C9A577' });
  el('rect', { x: 0, y: DY - 4, width: 230, height: 6, fill: pal.wood });
  [20, 90, 160, 220].forEach((x) => el('rect', { x, y: DY + 12, width: 10, height: 60, fill: '#A88457' }));
  const me = k.buddy({ x: 30, y: DY, scale: S });
  const xf = (t) => lerp(30, 190, easeInOut(seg(t, 0.2, 1.8)));
  return {
    update(t) {
      glints.forEach((n, i) => n.setAttribute('opacity', 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.6 + i))));
      tf(boat, 300 + t * 6, HZ + 8 + Math.sin(t * 1.2) * 0.8);
      bird.set(60 + t * 30, 76 + Math.sin(t * 3) * 4, Math.sin(t * 14) > 0 ? 1 : 0, 1);
      const w = walkTo(xf, t, 30), br = hump(seg(t, 2.2, 3.4)), rel = easeOut(seg(t, 3.0, 3.6));
      P(me, { x: w.x, y: DY, walk: w.walk, armL: w.armL + 120 * br, armR: w.armR + 120 * br, lean: w.lean - 6 * br, squash: 1 + 0.04 * br, look: 0.7, mood: t > 3.0 ? 'smile' : br > 0.2 ? 'open' : 'smile', blink: t > 3.1 ? 1 : blinkAt(t) });
    }
  };
}
