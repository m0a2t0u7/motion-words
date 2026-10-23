// fork：サラダのレタスやトマトをフォークで刺して口へ運ぶ（例文 I eat salad with a fork.）
import { seg, lerp, easeInOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, vessel, fork, scoop, eatCycle, P, blinkAt } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, 'サラダ'], [0.7, 'フォークで刺す'], [3.6, 'おいしい']] };

export function create(k) {
  const { el, pal } = k, S = 1.2;
  const kit = kitchen(k);
  const b = k.buddy({ x: 172, y: kit.FY, scale: S });
  kit.front();
  const BX = 240;
  const bowl = vessel(k, undefined, { w: 60, h: 20, taper: 0.6, col: '#fff', stroke: '#C9D2DD', liquid: '#E3E8EE' }); k.tf(bowl.g, BX, TOP + 3, 0, 1.2); bowl.set(0);
  // サラダの山（減っていく）
  const heap = k.g({});
  [[-20, -4, '#7FCB92'], [-8, -10, '#59C27A'], [6, -8, '#9ADBA8'], [18, -3, '#7FCB92'], [-4, -2, '#9ADBA8']].forEach(([x, y, c]) => el('ellipse', { cx: x, cy: y, rx: 10, ry: 6, fill: c }, heap));
  const toms = [[-12, -10], [10, -12], [0, -16]].map(([x, y]) => el('circle', { cx: x, cy: y, r: 4.5, fill: pal.red }, heap));
  k.tf(heap, BX, TOP - 22);
  const fk = fork(k);
  const bite = el('circle', { r: 4.5, fill: pal.red });
  const leaf = el('ellipse', { rx: 6, ry: 3.5, fill: '#59C27A' });
  const A = arms(k, b, S, { back: ['L'] });
  return {
    update(t) {
      const e = eatCycle(t, 0.5, 1.0, 3);
      P(b, { lean: 6, look: 0.5, blink: blinkAt(t), mood: e.m > 0.9 ? 'open' : t > 3.6 ? 'grin' : 'smile', squash: 1 - 0.02 * (e.m > 0.95) });
      const s = scoop(b, S, { x: BX - 10 + (e.i % 2) * 14, y: TOP - 58 }, e.m);
      A.to('R', s.x, s.y);
      k.tf(fk, s.x, s.y, s.rot, 1.25);
      A.to('L', BX - 40, TOP - 6);
      toms.forEach((c, i) => c.setAttribute('opacity', e.i > i || (e.i === i && e.q > 0.15) ? 0 : 1));
      heap.setAttribute('transform', `translate(${BX} ${TOP - 22}) scale(1 ${(1 - 0.25 * clamp((e.i + (e.q > 0.15)) / 3)).toFixed(3)})`);
      const a = (s.rot * Math.PI) / 180, tip = { x: s.x - Math.sin(a) * 26, y: s.y + Math.cos(a) * 26 };
      const on = e.q > 0.15 && e.q < 0.62 && e.i >= 0 && e.i < 3;
      k.set(bite, { cx: tip.x, cy: tip.y, opacity: on && e.i !== 1 ? 1 : 0 });
      k.set(leaf, { cx: tip.x, cy: tip.y, opacity: on && e.i === 1 ? 1 : 0 });
    }
  };
}
