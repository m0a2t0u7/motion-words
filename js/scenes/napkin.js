// napkin：口にソースが付いた子に「ナプキンをどうぞ」。1枚取って口をふく（例文 Please take a napkin.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, dinner, plateP, iconSay, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, 'どうぞ'], [1.2, '1枚取る'], [2.4, '口をふく']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const FY = homeBg(k, { winX: 40, winW: 80 });
  const b = k.buddy({ x: 160, y: FY, scale: S });
  const w = k.buddy({ x: 320, y: FY, scale: 1.2, facing: -1, ...C(k, 'coral') });
  dinner(k, 60, 280, 198);
  k.tf(plateP(k, undefined, 26), 120, 200);
  el('path', { d: 'M 104 196 q 6 -8 14 -4 q 8 -6 16 2', stroke: '#E8574A', 'stroke-width': 4, fill: 'none' });
  // 口元のソース
  const sauce = el('ellipse', { rx: 4, ry: 2.6, fill: '#E8574A' });
  // ナプキン立て（お店の人が持つ）と1枚のナプキン
  const holder = k.g({});
  el('rect', { x: -16, y: -6, width: 32, height: 8, rx: 2, fill: '#AEB8C6' }, holder);
  [0, 1, 2].forEach((i) => el('rect', { x: -13 + i * 1.5, y: -28 + i * 1.5, width: 24, height: 24, rx: 2, fill: '#fff', stroke: '#D9DFE7', 'stroke-width': 1 }, holder));
  const nap = k.g({});
  el('path', { d: 'M -12 -12 L 12 -12 L 12 12 L -12 12 Z', fill: '#fff', stroke: '#D9DFE7', 'stroke-width': 1.5 }, nap);
  el('path', { d: 'M -12 -12 L 12 12', stroke: '#EEF2F6', 'stroke-width': 1.5 }, nap);
  const A = arms(k, b, S), W = arms(k, w, 1.2, { col: pal.coral, dark: pal.coralDark, back: ['L'] });
  const say1 = iconSay(k, 74, 32, 1, (g) => k.text(0, 1, 'Please!', { 'font-size': 14 }, g));
  return {
    update(t) {
      const off = easeInOut(seg(t, 0.2, 0.8));
      const take = easeInOut(seg(t, 0.9, 1.3)), pull = easeInOut(seg(t, 1.3, 1.7)), lift = easeInOut(seg(t, 1.8, 2.3));
      const wipe = t > 2.3 && t < 3.4 ? Math.sin((t - 2.3) * 14) : 0;
      const clean = seg(t, 2.6, 3.3);
      const down = easeInOut(seg(t, 3.5, 4.0));
      P(b, { look: 0.5, lean: 4, blink: t > 2.3 && t < 3.4 ? 1 : blinkAt(t), mood: t > 3.4 ? 'grin' : 'smile' });
      P(w, { look: 0.5, lean: 6 * off * (1 - seg(t, 1.8, 2.2)), blink: blinkAt(t, 1), facing: -1, mood: 'smile' });
      const ho = { x: lerp(296, 244, off * (1 - easeInOut(seg(t, 1.8, 2.2)))), y: lerp(206, 178, off * (1 - easeInOut(seg(t, 1.8, 2.2)))) };
      k.tf(holder, ho.x, ho.y + 6); W.to('R', ho.x + 12, ho.y + 2); W.to('L', 340, 204);
      // 右手：ナプキンをつまむ → 引き抜く → 口へ → 下ろす
      const m = { x: b.state.x + 6 * S, y: b.state.y - 52 * S };
      const grab = { x: ho.x - 2, y: ho.y - 22 };
      let hx = lerp(186, grab.x, take), hy = lerp(200, grab.y, take);
      if (t > 1.3) { hx = lerp(grab.x, 220, pull); hy = lerp(grab.y, 150, pull); }
      if (t > 1.8) { hx = lerp(220, m.x + 16 + 4 * wipe, lift); hy = lerp(150, m.y + 4, lift); }
      if (t > 3.5) { hx = lerp(m.x + 16, 210, down); hy = lerp(m.y + 4, 196, down); }
      A.to('R', hx, hy); A.to('L', 120, 198);
      if (t < 1.3) k.tf(nap, ho.x - 1, ho.y - 14, 0, 0.001); else k.tf(nap, hx - 10, hy + 2, 10 * wipe, 1);
      k.set(sauce, { cx: m.x + 8, cy: m.y + 6, opacity: 1 - clean });
      say1.show(seg(t, 0.2, 0.5) * (1 - seg(t, 1.4, 1.6)), 310, 102);
    }
  };
}
