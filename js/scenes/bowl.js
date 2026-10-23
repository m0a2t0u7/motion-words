// bowl：深いボウルに入ったスープをスプーンで飲み、最後はボウルが空になる（例文 I ate a bowl of soup.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, vessel, steam, spoonP, scoop, eatCycle, P, blinkAt } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, 'ボウルのスープ'], [0.8, 'ひと口ずつ'], [3.6, '空になった']] };

export function create(k) {
  const S = 1.2;
  const kit = kitchen(k, { win: true });
  const b = k.buddy({ x: 176, y: kit.FY, scale: S });
  kit.front('#E9D3B4');
  const BX = 236;
  const bowl = vessel(k, null, { w: 52, h: 26, taper: 0.55, col: '#7FB3E8', stroke: '#5C93CF', liquid: '#F0A63A' });
  k.tf(bowl.g, BX, TOP + 3, 0, 1.4);
  k.el('ellipse', { cx: BX, cy: TOP + 4, rx: 16, ry: 3, fill: '#5C93CF' });
  const st = steam(k, null, 3, 24);
  const sp = spoonP(k, null, 1.15);
  const drip = k.el('ellipse', { rx: 4, ry: 2, fill: '#F0A63A' });
  const A = arms(k, b, S, { back: ['L'] });
  return {
    update(t) {
      const e = eatCycle(t, 0.6, 0.95, 3);
      const full = 1 - clamp((e.i + (e.q > 0.15 ? 1 : 0)) / 3);
      bowl.set(0.85 * (t < 0.6 ? 1 : full) + 0.001);
      P(b, { lean: 6, look: 0.5, blink: e.m > 0.9 ? 1 : blinkAt(t), mood: t > 3.6 ? 'grin' : e.m > 0.9 ? 'flat' : 'smile', squash: 1 + 0.03 * hump(seg(t, 3.6, 4.0)) });
      const s = scoop(b, S, { x: BX - 14, y: TOP - 52 }, e.m);
      const done = easeInOut(seg(t, 3.55, 3.9));
      const hx = lerp(s.x, BX - 30, done), hy = lerp(s.y, TOP - 18, done);
      A.to('R', hx, hy);
      k.tf(sp, hx, hy, lerp(s.rot, 30, done), 1.15);
      // スプーンに乗ったスープ
      const a = (lerp(s.rot, 30, done) * Math.PI) / 180;
      k.tf(drip, hx - Math.sin(a) * 20, hy + Math.cos(a) * 20);
      drip.setAttribute('opacity', e.q > 0.15 && e.q < 0.6 && t < 3.5 ? 1 : 0);
      A.to('L', BX - 30, TOP - 12);
      st.set(BX, TOP - 34, 1 - seg(t, 2.6, 3.4), t);
    }
  };
}
