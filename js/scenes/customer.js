// customer：パン屋のまめの店に、同じお客さんが毎日やってくる。ポイントカードのスタンプがたまる（例文 The shop has many regular customers.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, keys, pops, P, blinkAt, C } from './jam.js';
import { counterBg } from './bag.js';
import { calendar } from './so-far-so-good.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.8, beats: [[0, '1日目'], [1.6, '2日目も'], [3.2, 'いつものお客さん']] };

export function create(k) {
  const { el, pal } = k;
  const cb = counterBg(k, 236, 300, 160);
  const shop = k.buddy({ x: 310, y: 236, scale: 1.1, facing: -1 });
  cb.front();
  // パンの並ぶ台
  [[250, '#D9964F'], [280, '#E9B46A'], [350, '#C98A4E']].forEach(([x, c]) => el('ellipse', { cx: x, cy: cb.TY - 6, rx: 12, ry: 7, fill: c }));
  const cal = calendar(k, 60, 30, 46);
  // スタンプカード（店員の左上）
  el('rect', { x: 140, y: 34, width: 96, height: 44, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const stamps = [0, 1, 2].map((i) => { el('circle', { cx: 162 + i * 26, cy: 56, r: 10, fill: 'none', stroke: '#D9DFE7', 'stroke-width': 2 }); return el('circle', { cx: 162 + i * 26, cy: 56, r: 9, fill: pal.red }); });
  const cus = [k.buddy({ x: -40, y: 236, scale: 1.0, ...C(k, 'coral') }), k.buddy({ x: -40, y: 236, scale: 0.95, ...C(k, 'blue') })];
  const A = arms(k, shop, 1.1);
  const D = 1.6;
  return {
    update(t) {
      const day = Math.min(2, Math.floor(t / D)), q = (t - day * D) / D;
      cal.set(String(day + 1), hump(seg(q, 0, 0.12)) * (day > 0 ? 1 : 0));
      // 毎日：左から来てカウンターでパンを買い、帰る
      const xf = keys([[0, -40], [0.45, 200], [0.8, 200], [1.0, 200]]);
      cus.forEach((c, i) => {
        const off = i * 0.1;
        const g = gait((tt) => xf(tt - off) - i * 60, q * D, -40 - i * 60);
        P(c, { x: g.x, walk: g.walk, armL: g.armL, armR: g.armR, lean: g.lean, look: 0.5, blink: blinkAt(t, i), mood: q > 0.5 ? 'grin' : 'smile' });
        c.g.setAttribute('opacity', 1);
      });
      P(shop, { facing: -1, look: 0.5, blink: blinkAt(t, 0.6), mood: q > 0.3 ? 'grin' : 'smile', lean: 4 });
      const st = hump(seg(q, 0.5, 0.75));
      A.to('R', 270 - 20 * st, cb.TY - 10 - 20 * st); A.to('L', 330, cb.TY - 4);
      stamps.forEach((s, i) => { const p = i < day ? 1 : i === day ? seg(q, 0.6, 0.75) : 0; s.setAttribute('transform', `translate(${162 + i * 26} 56) scale(${pops(p).toFixed(3)}) translate(${-(162 + i * 26)} -56)`); });
    }
  };
}
