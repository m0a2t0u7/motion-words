// recover：熱でベッドに寝ていた彼女が、2日後には元気に起き上がって伸びをする（例文 She recovered quickly from the flu.）
import { seg, lerp, easeInOut, easeOut, wobble, hump, smooth } from '../ease.js';
import { lie } from './surgery.js';
import { blinkAt } from './run-after.js';
import { drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'インフルエンザ'], [1.2, '休んで2日'], [3.0, 'もう元気！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 40, width: 80, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // カレンダー（めくれる）
  el('rect', { x: 330, y: 40, width: 48, height: 56, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 330, y: 40, width: 48, height: 13, rx: 3, fill: pal.red });
  const days = [3, 4, 5].map((d) => { const n = k.text(354, 76, String(d), { 'font-size': 22 }); return n; });
  const flap = el('rect', { x: 332, y: 54, width: 44, height: 40, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  // ベッド
  el('rect', { x: 110, y: 150, width: 12, height: 86, rx: 4, fill: pal.woodDark });
  el('rect', { x: 290, y: 180, width: 10, height: 56, rx: 4, fill: pal.woodDark });
  el('rect', { x: 116, y: 186, width: 182, height: 34, rx: 6, fill: pal.wood });
  el('rect', { x: 120, y: 170, width: 176, height: 18, rx: 7, fill: '#fff' });
  el('rect', { x: 124, y: 156, width: 44, height: 18, rx: 8, fill: '#F4F6F9', stroke: pal.line, 'stroke-width': 1.5 });
  k.shadow(205, 238, 100, 4);
  // 体温計（ベッド横の台）
  el('rect', { x: 58, y: 196, width: 44, height: 40, rx: 4, fill: pal.wood });
  el('rect', { x: 74, y: 140, width: 12, height: 56, rx: 6, fill: '#fff', stroke: pal.sub, 'stroke-width': 2 });
  el('circle', { cx: 80, cy: 196, r: 8, fill: pal.red });
  const merc = el('rect', { x: 77, y: 150, width: 6, height: 46, rx: 3, fill: pal.red });
  el('line', { x1: 74, y1: 166, x2: 86, y2: 166, stroke: pal.green, 'stroke-width': 2 });
  const S = 0.9;
  const her = lie(k, { scale: S, color: pal.coral, dark: pal.coralDark });
  const flush = el('ellipse', { cx: 0, cy: -46, rx: 22, ry: 8, fill: pal.red, opacity: 0.4 }, her.b.body.children[3]);
  const sweat = drop(k);
  const blanket = g({});
  el('path', { d: 'M 0 0 L 120 0 Q 128 0 128 10 L 128 30 L 0 30 Q -6 15 0 0 Z', fill: pal.blue }, blanket);
  el('path', { d: 'M 6 8 L 120 8', stroke: '#fff', 'stroke-width': 2, opacity: 0.4 }, blanket);
  const fwX = 210, groundX = 330;
  return {
    update(t) {
      // カレンダー：2回めくれる
      const f1 = seg(t, 1.0, 1.3), f2 = seg(t, 1.7, 2.0);
      days.forEach((n, i) => n.setAttribute('opacity', (i === 0 && t < 1.15) || (i === 1 && t >= 1.15 && t < 1.85) || (i === 2 && t >= 1.85) ? 1 : 0));
      const fl = Math.max(hump(f1), hump(f2));
      tf(flap, 0, 0); flap.setAttribute('transform', `translate(0 ${54}) scale(1 ${(1 - fl).toFixed(3)}) translate(0 -54)`); flap.setAttribute('opacity', fl > 0.02 ? 0.95 : 0);
      // 熱が下がる
      const cool = easeInOut(seg(t, 1.0, 2.2));
      k.set(merc, { y: lerp(146, 168, cool), height: lerp(50, 28, cool) });
      flush.setAttribute('opacity', 0.4 * (1 - cool));
      // 寝る → 起き上がる → ベッドから下りて伸び
      const sit = easeInOut(seg(t, 2.2, 2.7)), hop = easeInOut(seg(t, 2.8, 3.3));
      const rot = lerp(-90, 0, sit);
      const x = lerp(lerp(fwX, 278, sit), groundX, hop), y = lerp(lerp(170 - 30 * S, 176, sit), FY - 12 * S, hop) - 24 * hump(seg(t, 2.8, 3.3));
      her.set(x, y, rot);
      const sick = t < 2.2;
      const st = easeOut(seg(t, 3.4, 3.8));
      her.b.pose({ armL: sick ? -4 : lerp(8, 160, st), armR: sick ? -4 : lerp(8, 160, st), mood: sick ? 'sad' : t > 3.3 ? 'grin' : 'smile', blink: sick ? 0.75 : blinkAt(t), look: 0,
        squash: 1 + 0.05 * wobble(seg(t, 3.3, 3.7), 2, 5), lift: 0 });
      [her.b.armL.a, her.b.armR.a].forEach((a) => a.setAttribute('opacity', t < 2.3 ? 0 : 1));
      sweat.setAttribute('opacity', sick ? 1 - cool : 0);
      tf(sweat, fwX - 74 * S, 128 + 6 * ((t * 0.8) % 1));
      // 毛布：起きるとき足もとへ寄せる
      tf(blanket, lerp(160, 250, sit), lerp(140, 156, sit), 0, lerp(1, 0.35, sit), lerp(1.4, 1, sit));
    }
  };
}
