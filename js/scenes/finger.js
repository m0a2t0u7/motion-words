// finger：にんじんを切っていて、包丁で指を少し切った。痛い！ばんそうこうをはる（例文 I cut my finger with a knife.）
// 共有：bigHand（拡大した手）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, ache, lens } from './body.js';
import { kitchenBg } from './weigh.js';
import { food } from './diet.js';

// 拡大した手（指を上に向けた手のひら）。fingers[0..3]＝人さし指〜小指、thumb
export function bigHand(k, parent, c = '#5FCDB8', d = '#3BAE98') {
  const g = k.g({}, parent);
  const fingers = [[-15, -46], [-5, -52], [5, -50], [15, -42]].map(([x, len]) => k.el('rect', { x: x - 4.5, y: len, width: 9, height: -len, rx: 4.5, fill: c, stroke: d, 'stroke-width': 2 }, g));
  const thumb = k.el('rect', { x: -40, y: -20, width: 9, height: 26, rx: 4.5, fill: c, stroke: d, 'stroke-width': 2, transform: 'rotate(-40 -36 6)' }, g);
  k.el('rect', { x: -22, y: -12, width: 44, height: 46, rx: 14, fill: c, stroke: d, 'stroke-width': 2 }, g);
  return { g, fingers, thumb };
}
export function bandage(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 3, fill: '#F2D2AE', stroke: '#D9B48A', 'stroke-width': 1 }, g);
  k.el('rect', { x: -4, y: -4, width: 8, height: 8, rx: 1, fill: '#fff', opacity: 0.7 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'にんじんを切る'], [1.4, '指を切った'], [2.8, 'ばんそうこう']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.2, FY = 240;
  kitchenBg(k, FY);
  el('rect', { x: 170, y: FY - 72, width: 230, height: 10, rx: 2, fill: pal.wood });
  el('rect', { x: 176, y: FY - 62, width: 218, height: 62, fill: '#EAD3B0' });
  el('rect', { x: 196, y: FY - 80, width: 100, height: 8, rx: 2, fill: '#F2DDBB' });
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const car = food(k, 'carrot'); tf(car, 248, FY - 80, 0, 1.3);
  const slices = [0, 1, 2].map(() => el('ellipse', { rx: 3, ry: 4, fill: '#F28C28' }));
  const knife = g({}); el('rect', { x: -2.5, y: -6, width: 5, height: 12, rx: 2, fill: pal.ink }, knife); el('path', { d: 'M -3 6 H 3 L 4 28 L -3 22 Z', fill: '#D5DCE5', stroke: '#AEB8C6', 'stroke-width': 1 }, knife);
  const hurt = ache(k);
  const L = lens(k, 46);
  const bh = bigHand(k, L.inner); tf(bh.g, 0, 18);
  const band = bandage(k, L.inner); tf(band, -15, -32);
  return {
    update(t) {
      const chop = t < 1.4 ? Math.abs(Math.sin(t * 7)) : 0, ouch = t > 1.4;
      P(b, { lean: ouch ? -6 : 10, lift: ouch ? 8 * hump(seg(t, 1.4, 1.8)) : 0, mood: ouch ? (t > 3.4 ? 'smile' : 'open') : 'flat', blink: ouch && t < 2.2 ? 1 : blinkAt(t), look: 0.5 });
      const kt = ouch ? { x: lerp(232, b.state.x + 36, easeOut(seg(t, 1.4, 1.7))), y: lerp(FY - 86, FY - 40, easeOut(seg(t, 1.4, 1.7))) } : { x: 232 - 6 * seg(t, 0, 1.4) * 3, y: FY - 104 + 18 * chop };
      b.pose({ armR: reach(b, S, 'R', kt.x, kt.y) });
      const h = hp(b, S, 'R', 26);
      tf(knife, h.x, h.y - 4, 0, S * 0.9);
      // 左手（にんじんをおさえる → 指を見る）
      b.pose({ armL: ouch ? lerp(60, 130, easeOut(seg(t, 1.5, 1.9))) : 60 });
      slices.forEach((s, i) => k.set(s, { cx: 216 - i * 8, cy: FY - 82, opacity: t > 0.3 + i * 0.4 ? 1 : 0 }));
      const hl = hp(b, S, 'L', 26);
      hurt.set(easeOut(seg(t, 1.5, 1.7)) * (1 - seg(t, 2.8, 3.0)), hl.x - 20, hl.y - 10, t, -40);
      L.show(easeOut(seg(t, 1.8, 2.3)), 300, 90, hl.x, hl.y);
      const bp2 = easeOut(seg(t, 2.8, 3.2));
      tf(band, -15, -32, 0, Math.max(0.001, bp2), Math.max(0.001, bp2));
      bh.fingers[0].setAttribute('fill', t > 1.5 && bp2 < 0.5 ? '#F7A9A0' : pal.mint);
    }
  };
}
