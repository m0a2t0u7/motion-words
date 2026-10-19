// tongue：熱いスープをひと口。アチッ！舌を出して手であおぐ（例文 I burned my tongue on the hot soup.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, faceOf, ache } from './body.js';
import { aim, tipOf, sideTable } from './restaurant.js';
import { kitchenBg } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '熱いスープ'], [1.4, 'アチッ！'], [2.2, '舌がヒリヒリ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3, FY = 240;
  kitchenBg(k, FY);
  const b = k.buddy({ x: 150, y: FY - 10, scale: S });
  const tongue = el('path', { d: 'M -5 -42 Q -6 -32 0 -31 Q 6 -32 5 -42 Z', fill: '#F27A86', stroke: '#D95F6C', 'stroke-width': 1 }, faceOf(b));
  sideTable(k, 260, FY - 60, 140, FY, '#F4F6F9');
  el('path', { d: `M 222 ${FY - 76} H 278 Q 276 ${FY - 58} 250 ${FY - 58} Q 224 ${FY - 58} 222 ${FY - 76} Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('ellipse', { cx: 250, cy: FY - 76, rx: 28, ry: 4, fill: '#F2A65A' });
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q -5 -7 0 -14 q 5 -7 0 -14', stroke: '#C8CED6', 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  const spoon = g({}); el('rect', { x: -1.6, y: -4, width: 3.2, height: 20, rx: 1.5, fill: '#AEB8C6' }, spoon); el('ellipse', { cx: 0, cy: 20, rx: 5, ry: 6, fill: '#AEB8C6' }, spoon);
  const hurt = ache(k);
  return {
    update(t) {
      steam.forEach((s, i) => { tf(s, 236 + i * 14, FY - 82 - 4 * Math.sin(t * 3 + i)); s.setAttribute('opacity', (0.5 + 0.4 * Math.sin(t * 4 + i)).toFixed(2)); });
      const dip = easeInOut(seg(t, 0.3, 0.7)), up = easeInOut(seg(t, 0.8, 1.3)), drop = easeInOut(seg(t, 1.5, 1.8));
      const ouch = t > 1.4;
      P(b, { y: FY - 10, lift: ouch ? 14 * hump(seg(t, 1.4, 1.8)) : 0, lean: ouch ? -8 : 4, mood: ouch ? 'open' : 'smile', blink: ouch && t < 2.0 ? 1 : blinkAt(t), look: 0.4 });
      tongue.setAttribute('opacity', t > 1.5 ? 1 : 0);
      tongue.setAttribute('transform', `translate(0 ${(t > 1.5 ? 1.5 * Math.sin(t * 10) : 0).toFixed(2)})`);
      const m = bp(b, S, 14, -42), bowl = { x: 246, y: FY - 78 };
      let tg;
      if (t < 1.4) tg = { x: lerp(lerp(b.state.x + 40, bowl.x, dip), m.x, up), y: lerp(lerp(FY - 50, bowl.y, dip), m.y, up) };
      else tg = { x: lerp(m.x, bowl.x - 10, drop), y: lerp(m.y, bowl.y - 2, drop) };
      b.pose({ armR: reach(b, S, 'R', tg.x, tg.y + 10) });
      const h = hp(b, S, 'R', 26);
      aim(k, spoon, h, tg, S * 0.9);
      // 左手であおぐ
      const fan = t > 2.0 ? 110 + 30 * Math.sin(t * 16) : 10;
      b.pose({ armL: lerp(10, fan, easeOut(seg(t, 1.9, 2.2))) });
      hurt.set(easeOut(seg(t, 1.5, 1.7)), m.x + 22, m.y + 6, t, 80);
    }
  };
}
