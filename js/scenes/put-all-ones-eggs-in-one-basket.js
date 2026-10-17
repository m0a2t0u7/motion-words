// put all one's eggs in one basket：全部の卵を1つのかごに入れているのを見て「やめて」と止められ、複数のかごに分け直す（Don't put all your eggs in one basket.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '1つのかご'], [1.0, 'ダメと止める'], [3.9, '分けて入れる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  const me = k.buddy({ x: 243, y: 236 });
  // 机
  el('rect', { x: 150, y: 214, width: 236, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 156, y: 222, width: 224, height: 14, fill: pal.woodDark });
  // かご（左・中央・右）
  const basket = (cx) => {
    const b = g({});
    el('path', { d: `M ${cx - 24} 194 L ${cx + 24} 194 L ${cx + 18} 214 L ${cx - 18} 214 Z`, fill: '#D9A860' }, b);
    el('path', { d: `M ${cx - 22} 201 H ${cx + 22} M ${cx - 20} 208 H ${cx + 20}`, stroke: '#B88742', 'stroke-width': 2 }, b);
    el('rect', { x: cx - 26, y: 191, width: 52, height: 5, rx: 2.5, fill: '#B88742' }, b);
  };
  const CX = 190, AX = 270, BX = 350;
  [CX, AX, BX].forEach(basket);
  // 卵（0..5 が中央かごの積み順）
  const slotA = [[256, 186], [270, 186], [284, 186], [263, 178], [277, 178], [270, 170]];
  const dest = { 5: [CX - 8, 186], 4: [BX - 8, 186], 3: [CX + 8, 186], 2: [BX + 8, 186] };
  const order = [5, 4, 3, 2], T0 = 1.5, CY = 0.62;
  const eggs = slotA.map(() => el('ellipse', { rx: 6.5, ry: 8, fill: '#FFF7E8', stroke: '#E0C9A0', 'stroke-width': 1.8 }));
  // 友だち（左から来て「ダメ」の合図）
  const fr = k.buddy({ x: -30, y: 238, color: pal.coral, dark: pal.coralDark });
  const bub = g({});
  el('rect', { x: -22, y: -20, width: 44, height: 38, rx: 11, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 }, bub);
  el('path', { d: 'M -8 18 L -12 26 L 4 18 Z', fill: '#fff' }, bub);
  const xm = el('path', { d: 'M -9 -10 L 9 8 M 9 -10 L -9 8', stroke: pal.red, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, bub);
  const ok = el('path', { d: 'M -10 -1 L -3 7 L 11 -10', fill: 'none', stroke: pal.green, 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, bub);
  const reachA = (px, py, tx, ty) => Math.atan2(tx - px, ty - py) * 180 / Math.PI;

  return {
    update(t) {
      // 友だち：歩いて来て首（手）を振る
      const wx = lerp(-30, 78, easeInOut(seg(t, 0.1, 1.0))), walking = t < 1.0 && t > 0.1;
      const wag = hump(seg(t, 1.0, 1.6)) + hump(seg(t, 1.6, 3.4)) * 0 + (t > 1.0 && t < 3.4 ? 1 : 0) * 0;
      const waving = seg(t, 1.0, 1.3) * (1 - seg(t, 3.2, 3.5));
      const thumbs = easeOut(seg(t, 3.8, 4.2));
      fr.pose({
        x: wx, walk: walking ? t * 10 : 0, facing: 1,
        armR: walking ? 8 + Math.sin(t * 10) * 16 : lerp(lerp(8, 150, waving) + Math.sin(t * 14) * 12 * waving, 170, thumbs),
        armL: walking ? 8 - Math.sin(t * 10) * 16 : 8,
        mood: t < 3.8 ? 'flat' : 'grin', lean: -2 * waving, look: 0.3
      });
      const bp = backOut(seg(t, 1.0, 1.4)) * (1 - seg(t, 3.5, 3.7)) + backOut(seg(t, 3.9, 4.3)) * seg(t, 3.7, 3.9);
      const showOk = t > 3.7;
      xm.setAttribute('opacity', showOk ? 0 : 1); ok.setAttribute('opacity', showOk ? 1 : 0);
      tf(bub, 78 + 8, 112, 0, Math.max(0, bp), Math.max(0, bp));
      // 本人：両手で卵を移し替える
      let hx = AX - 14, hy = 202, carry = -1, bx = hx - 27;
      const idx = Math.floor((t - T0) / CY);
      if (t >= T0 && idx < 4) {
        const p = (t - T0) / CY - idx, e = order[idx], tx = dest[e][0], ty = dest[e][1];
        const ax = slotA[e][0], ay = slotA[e][1];
        if (p < 0.55) { const q = easeInOut(p / 0.55); hx = lerp(ax, tx, q); hy = lerp(ay + 8, ty + 8, q) - 26 * hump(q); carry = e; }
        else { const q = easeInOut((p - 0.55) / 0.45); hx = lerp(tx, AX - 14, q); hy = lerp(ty + 8, 202, q); }
        bx = hx - 27;
      } else if (t >= T0) { bx = AX - 14 - 27 + 40 * easeInOut(seg(t, T0 + 4 * CY, T0 + 4 * CY + 0.4)); hx = bx + 27; hy = 204; }
      const px = bx + 27, py = 180;
      const ang = reachA(px, py, hx, hy);
      const sway = t < T0 ? 0 : 1;
      me.pose({
        x: bx, armR: t < T0 ? lerp(8, 40, easeOut(seg(t, 0.2, 0.6))) * (1 - seg(t, 1.0, 1.4)) + (t >= 1.0 && t < T0 ? lerp(8, 50, seg(t, 1.0, 1.4)) * 0 : 0) : ang,
        armL: t < T0 ? 8 : 8 + 14 * hump(seg(t, T0, T0 + 4 * CY)), lean: 3 * sway, look: t < 1.0 ? 0 : 0.5 * (t < 1.5 ? -1 : 1),
        mood: t < 1.0 ? 'smile' : t < 3.8 ? 'open' : 'grin', squash: 1
      });
      // 卵の位置
      eggs.forEach((eg, i) => {
        let x = slotA[i][0], y = slotA[i][1];
        const mi = order.indexOf(i);
        if (mi >= 0) {
          const pr = (t - T0) / CY - mi;
          if (pr >= 0.55) { x = dest[i][0]; y = dest[i][1]; }
          if (pr >= 0 && pr < 0.55) { x = hx; y = hy - 6; }
        }
        k.set(eg, { cx: x, cy: y });
      });
    }
  };
}
