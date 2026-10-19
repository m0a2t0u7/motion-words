// charger：電池が少ないスマホを見せて「充電器を借りていい？」。友だちが充電器を手渡し、まめが受け取る（例文 Can I borrow your phone charger? Mine is at home.）
// このファイルは「手渡し」系シーンの共有ヘルパー give() も書き出す
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, face, homeBg } from './bag.js';
import { say } from './look-over.js';
import { bigPhone } from './phone.js';

// 2人の手渡し。o: { S, FY, bx, cx, g0, g1, ask(bubble.g), bubbleW, item(node), carry(t, ctx) }
// ctx.after(t) で受け取った後の動きを足す。戻り値は update(t)
export function give(k, o) {
  const { tf, pal } = k, S = o.S || 1.1, FY = o.FY || 236, bx = o.bx || 130, cx = o.cx || 270;
  const g0 = o.g0 || 1.0, g1 = o.g1 || 1.7;
  const c = k.buddy({ x: cx, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  if (o.mid) o.mid();
  const b = k.buddy({ x: bx, y: FY, scale: S });
  const item = o.item;
  const bub = say(k, o.bubbleW || 70, o.bubbleH || 40, -1);
  if (o.ask) o.ask(bub.g);
  const M = o.M || { x: (bx + cx) / 2, y: FY - 72 * S };
  const ctx = { b, c, S, FY, M, item };
  return function update(t) {
    const out = easeInOut(seg(t, g0, g0 + 0.5)) * (1 - easeInOut(seg(t, g1 + 0.1, g1 + 0.6)));
    const take = easeInOut(seg(t, g1 - 0.35, g1)) * (1 - easeInOut(seg(t, g1 + 0.4, g1 + 0.9)));
    P(b, { x: bx, look: 0.6, blink: blinkAt(t), mood: t > g1 ? 'grin' : (!o.rev && t > 0.2 && t < 0.9 && Math.sin(t * 22) > -0.2 ? 'open' : 'smile') });
    face(b, 4, 0);
    P(c, { x: cx, facing: -1, look: 0.5, blink: blinkAt(t, 1), mood: 'smile', squash: 1 - 0.05 * hump(seg(t, 0.8, 1.1)) });
    const [G, R, gs, rs] = o.rev ? [b, c, -4, 4] : [c, b, 4, -4];
    const gRest = o.rev ? (o.bRest0 ?? 40) : (o.cRest ?? 30), rRest = o.rev ? (o.cRest ?? 10) : (o.bRest ?? 40);
    G.pose({ armR: lerp(t > g1 ? 10 : gRest, reach(G, S, 'R', M.x + gs, M.y), out) });
    R.pose({ armR: t < g1 ? lerp(10, reach(R, S, 'R', M.x + rs, M.y), take) : lerp(rRest, reach(R, S, 'R', M.x + rs, M.y), take) });
    if (o.preB) o.preB(t, ctx);
    const h = t < g1 ? hp(G, S, 'R') : hp(R, S, 'R');
    if (item && !(o.carry && o.carry(t, ctx, h))) tf(item, h.x, h.y + (o.dy || 4), 0, S);
    bub.show(seg(t, o.bub0 ?? 0.15, (o.bub0 ?? 0.15) + 0.3) - seg(t, o.bub1 ?? g1 + 0.2, (o.bub1 ?? g1 + 0.2) + 0.2), o.bubX ?? bx + 20, FY - 150);
    if (o.after) o.after(t, ctx);
  };
}
// 充電器（原点＝プラグを持つ所）
export function chargerProp(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -7, y: -8, width: 14, height: 14, rx: 3, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.5 }, g);
  el('path', { d: 'M -3 -8 v -5 M 3 -8 v -5', stroke: pal.sub, 'stroke-width': 2 }, g);
  el('path', { d: 'M 0 6 Q 4 22 -8 26 Q -18 30 -12 40', stroke: '#fff', 'stroke-width': 3.5, fill: 'none' }, g);
  el('path', { d: 'M 0 6 Q 4 22 -8 26 Q -18 30 -12 40', stroke: pal.line, 'stroke-width': 1, fill: 'none' }, g);
  el('rect', { x: -15, y: 39, width: 6, height: 7, rx: 1.5, fill: pal.sub }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '借りていい？'], [1.0, '充電器を渡す'], [2.4, '借りられた']] };

export function create(k) {
  const { tf, el, pal } = k, S = 1.1, FY = 236;
  homeBg(k, { FY, winX: 160, winW: 80 });
  const ch = chargerProp(k);
  const up = give(k, {
    S, FY, item: ch, bubbleW: 76, bubbleH: 44,
    ask: (g) => { const p = bigPhone(k, g); p.set(false, 1); k.tf(p.g, -22, 0, 0, 0.6); k.tf(chargerProp(k, g), 2, -12, 0, 0.55); k.text(26, 0, '?', { 'font-size': 20, fill: pal.blueDark }, g); },
  });
  // 吹き出しの中の充電器を小さく左へ
  return { update(t) { up(t); } };
}
