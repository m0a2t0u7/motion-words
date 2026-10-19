// toaster：レバーを下げてパンを焼くと、トースターが焼けたパンをポンと跳ね上げる（例文 The toaster popped up the bread.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump } from '../ease.js';
import { reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { kitchenWall } from './cabinet.js';

export const meta = { duration: 4.2, beats: [[0, 'レバーを下げる'], [1.0, '焼いている'], [2.6, 'ポン！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const kw = kitchenWall(k, { x0: 120, x1: 400 });
  const FY = kw.FY, CT = kw.CT;
  kw.counter();
  const TX = 262, TT = CT - 44;
  // パン2枚（トースターの後ろの口から出る）
  const breads = [0, 1].map((i) => {
    const n = g({});
    el('path', { d: 'M -14 0 V -26 Q -18 -38 -6 -40 Q 0 -44 6 -40 Q 18 -38 14 -26 V 0 Z', fill: '#F2D49B', stroke: '#C98F4A', 'stroke-width': 3 }, n);
    const c = el('path', { d: 'M -10 -4 V -26 Q -12 -34 -4 -35 Q 0 -38 4 -35 Q 12 -34 10 -26 V -4 Z', fill: '#FBEBC8' }, n);
    return { n, c };
  });
  // 本体（パンの手前）
  k.shadow(TX, CT, 52, 3);
  el('rect', { x: TX - 48, y: TT, width: 96, height: 44, rx: 14, fill: '#9CC3F0' });
  el('rect', { x: TX - 42, y: TT - 3, width: 84, height: 8, rx: 4, fill: '#7FAEE6' });
  [TX - 20, TX + 20].forEach((x) => el('rect', { x: x - 15, y: TT - 2, width: 30, height: 4, rx: 2, fill: '#2F3747' }));
  el('ellipse', { cx: TX - 22, cy: TT + 14, rx: 10, ry: 6, fill: '#fff', opacity: 0.35 });
  const glow = el('rect', { x: TX - 34, y: TT + 30, width: 68, height: 4, rx: 2, fill: '#FF9F4A', opacity: 0 });
  el('rect', { x: TX - 58, y: TT + 6, width: 10, height: 30, rx: 3, fill: '#7FAEE6' });
  const lever = el('rect', { x: TX - 66, y: 0, width: 16, height: 6, rx: 3, fill: pal.ink });
  const b = k.buddy({ x: 172, y: FY, scale: S });
  const lines = [0, 1, 2].map(() => el('line', { stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const press = easeInOut(seg(t, 0.25, 0.7)), rel = easeInOut(seg(t, 0.8, 1.1));
      const pop = seg(t, 2.6, 3.4);
      // レバー：上 → 下（焼く間）→ ポンで上
      const ly = t < 2.6 ? lerp(TT + 8, TT + 28, press) : lerp(TT + 28, TT + 8, easeOut(seg(t, 2.6, 2.7)));
      k.set(lever, { y: ly });
      const pose = { x: 172, lean: 8 * press * (1 - rel), look: 0.6, blink: t > 2.6 && t < 2.7 ? 1 : blinkAt(t), mood: t < 2.6 ? 'smile' : t < 3.1 ? 'open' : 'grin', lift: 6 * hump(seg(t, 2.65, 3.0)) };
      P(b, pose);
      P(b, { ...pose, armR: lerp(lerp(8, reach(b, S, 'R', TX - 58, ly + 2), press), 10, rel), armL: 8 + 50 * hump(seg(t, 2.7, 3.3)) });
      // パンが沈み、焼け色がつき、跳ね上がって少し落ちる
      const down = t < 2.6 ? press * 22 : 0;
      const yUp = t < 2.6 ? 0 : -58 * Math.sin(Math.min(pop, 1) * Math.PI) * (1 - pop) - 18 * easeOut(Math.min(1, pop * 2)) + 0;
      const settle = t > 2.6 ? -18 + 3 * wobble(seg(t, 3.2, 3.8), 2, 6) : 0;
      breads.forEach((br, i) => {
        const y = TT + 4 + down + (t < 2.6 ? 0 : Math.min(yUp, 0) * (pop < 0.6 ? 1 : 0) + (pop >= 0.6 ? settle : 0));
        const yy = t < 2.6 ? TT + 4 + down : pop < 0.6 ? TT + 4 - 60 * Math.sin((pop / 0.6) * Math.PI * 0.75) : TT + 4 + settle;
        tf(br.n, TX + (i ? 20 : -20), yy, (i ? 6 : -6) * hump(pop / 0.6) * (pop < 0.6 ? 1 : 0));
        const done = seg(t, 1.2, 2.5);
        k.set(br.c, { fill: done > 0.5 ? '#D9A55A' : '#FBEBC8', opacity: 1 });
        br.c.setAttribute('fill', `rgb(${Math.round(lerp(251, 214, done))},${Math.round(lerp(235, 160, done))},${Math.round(lerp(200, 90, done))})`);
      });
      glow.setAttribute('opacity', t > 0.7 && t < 2.6 ? 0.6 + 0.3 * Math.sin(t * 9) : 0);
      const lp = seg(t, 2.6, 3.0);
      lines.forEach((l, i) => {
        const a = (-130 + i * 40) * Math.PI / 180, r1 = 56 + 8 * lp, r2 = r1 + 10;
        k.set(l, { x1: TX + Math.cos(a) * r1, y1: TT + 10 + Math.sin(a) * r1, x2: TX + Math.cos(a) * r2, y2: TT + 10 + Math.sin(a) * r2, opacity: hump(lp) });
      });
    }
  };
}
