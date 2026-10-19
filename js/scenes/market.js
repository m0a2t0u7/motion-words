// market：市場の屋台で、とれたての魚を買う。お金を渡し、魚を受け取る（例文 We bought fresh fish at the market.）
// 共有：stall（屋台）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, twinkle, pop } from './restaurant.js';
import { food } from './diet.js';
import { coin } from './get-on-with.js';

// 屋台（中心 cx）。front() で台の前面を描く（店の人の腰を隠す）
export function stall(k, cx, FY, w = 200, cols = ['#59C27A', '#fff']) {
  const { el, pal } = k, top = 60;
  [cx - w / 2 + 6, cx + w / 2 - 12].forEach((x) => el('rect', { x, y: top, width: 6, height: FY - top, fill: pal.woodDark }));
  const n = 8;
  for (let i = 0; i < n; i++) el('path', { d: `M ${cx - w / 2 - 10 + i * (w + 20) / n} ${top} h ${(w + 20) / n} v 18 q ${-(w + 20) / n / 2} 10 ${-(w + 20) / n} 0 Z`, fill: cols[i % 2] });
  el('path', { d: `M ${cx - w / 2 - 14} ${top} L ${cx} ${top - 30} L ${cx + w / 2 + 14} ${top} Z`, fill: cols[0] });
  return { front(CT) {
    k.shadow(cx, FY + 2, w / 2 + 6, 5);
    el('rect', { x: cx - w / 2, y: CT, width: w, height: 8, rx: 2, fill: pal.woodDark });
    el('rect', { x: cx - w / 2 + 6, y: CT + 8, width: w - 12, height: FY - CT - 8, fill: pal.wood });
    for (let y = CT + 20; y < FY; y += 14) el('line', { x1: cx - w / 2 + 6, y1: y, x2: cx + w / 2 - 6, y2: y, stroke: pal.woodDark, 'stroke-width': 1.2, opacity: 0.5 });
  } };
}

export const meta = { duration: 4.4, beats: [[0, '新鮮な魚'], [1.2, 'お金を払う'], [2.6, '魚を買った']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 240, CT = 176;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#E7DFD2' });
  el('rect', { x: 0, y: 150, width: 400, height: 90, fill: '#F1E9DE', opacity: 0.6 });
  const st = stall(k, 282, FY, 190, ['#6AA8F7', '#fff']);
  const seller = k.buddy({ x: 230, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('path', { d: 'M -24 -70 Q -22 -86 0 -86 Q 22 -86 24 -70 Z', fill: '#fff' }, seller.body);
  st.front(CT);
  // 氷の上の魚
  el('rect', { x: 200, y: CT - 8, width: 170, height: 9, rx: 4, fill: '#DDF1FA' });
  [[256, 0], [292, 1], [336, 0], [356, 1]].forEach(([x, f]) => k.tf(food(k, 'fish'), x, CT - 4, f ? -6 : 6, 0.9));
  const fish = food(k, 'fish');
  const sp = [0, 1, 2].map(() => twinkle(k, null, '#fff'));
  const me = k.buddy({ x: 146, y: FY, scale: 1, facing: 1 });
  const kid = k.buddy({ x: 84, y: FY, scale: 0.62, facing: 1, color: pal.yellow, dark: pal.yellowDark });
  const cn = coin(k, null, 6);
  const F0 = { x: 218, y: CT - 4 }, HAND = { x: 186, y: 168 };
  return {
    update(t) {
      // 支払い：0.9-1.5 で差し出し、1.6 で受け取ってもらう
      const pay = easeInOut(seg(t, 0.9, 1.4)) * (1 - easeInOut(seg(t, 1.7, 2.1)));
      const sGet = easeInOut(seg(t, 1.2, 1.5)) * (1 - easeInOut(seg(t, 1.7, 2.0)));
      const pick = easeInOut(seg(t, 2.0, 2.4)), give = easeInOut(seg(t, 2.5, 3.0)), take = easeInOut(seg(t, 2.6, 3.0));
      const lift = easeInOut(seg(t, 3.3, 3.8));
      P(me, { lean: 4 * pay + 4 * take, look: 0.5, blink: blinkAt(t), mood: t > 3.2 ? 'grin' : 'smile', armL: 10 });
      // 私の右手：お金→魚を受け取る→持ち上げる
      let mt;
      if (t < 2.3) mt = { x: lerp(me.state.x + 40, HAND.x, pay), y: lerp(FY - 40, HAND.y, pay) };
      else if (t < 3.3) mt = { x: lerp(me.state.x + 40, HAND.x, take), y: lerp(FY - 40, HAND.y, take) };
      else mt = { x: lerp(HAND.x, 170, lift), y: lerp(HAND.y, 120, lift) };
      me.pose({ armR: reach(me, 1, 'R', mt.x, mt.y) });
      const mh = hp(me, 1, 'R', 26);
      // 店の人：お金を受け取る→魚を取って手渡す
      let st2;
      if (t < 2.0) st2 = { x: lerp(250, HAND.x + 6, sGet), y: lerp(FY - 30, HAND.y, sGet) };
      else if (t < 2.5) st2 = { x: lerp(250, F0.x, pick), y: lerp(FY - 30, F0.y - 6, pick) };
      else st2 = { x: lerp(lerp(F0.x, HAND.x + 6, give), 250, easeInOut(seg(t, 3.05, 3.5))), y: lerp(lerp(F0.y - 6, HAND.y, give), FY - 30, easeInOut(seg(t, 3.05, 3.5))) };
      P(seller, { x: 230, lean: 6, look: 0.3, mood: 'grin', blink: blinkAt(t, 1), armL: 10 });
      seller.pose({ armR: reach(seller, 0.95, 'R', st2.x, st2.y) });
      const sh = hp(seller, 0.95, 'R', 26);
      // コイン
      if (t < 1.55) { tf(cn, mh.x + 4, mh.y); cn.setAttribute('opacity', t > 0.8 ? 1 : 0); }
      else { tf(cn, sh.x, sh.y); cn.setAttribute('opacity', t < 2.0 ? 1 : 0); }
      // 魚：台の上 → 店の人の手 → 私の手
      if (t < 2.4) tf(fish, F0.x, F0.y, 0, 0.9, 0.9);
      else if (t < 3.02) tf(fish, sh.x - 2, sh.y + 6, -10, -0.9, 0.9);
      else tf(fish, mh.x + 2, mh.y + 6, -10 - 20 * lift, 0.9, 0.9);
      sp.forEach((s, i) => { const q = seg(t, 3.6 + i * 0.15, 4.4); tf(s, mh.x - 18 + i * 18, mh.y - 14 - (i % 2) * 10, 45 * q, pop(easeOut(seg(q, 0, 0.3)) * (0.7 + 0.3 * Math.sin(t * 10 + i)))); });
      P(kid, { lift: t > 3.5 ? 6 * Math.abs(Math.sin((t - 3.5) * 7)) : 0, armL: t > 3.5 ? 150 : 10, armR: t > 3.5 ? 150 : 10, look: 0.6, mood: t > 3.5 ? 'grin' : 'smile', blink: blinkAt(t, 0.4) });
    }
  };
}
