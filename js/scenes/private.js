// private：手紙を読もうとする相手に、まめが「PRIVATE」の札を見せて隠す（例文 This is a private matter.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, hp, say } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '手紙に手を伸ばす'], [1.5, '札で隠す'], [3.0, '相手は引く']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  desk(k, 200, 100, 198);
  const let_ = g({}); tf(let_, 250, 192);
  el('rect', { x: -20, y: -9, width: 40, height: 9, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.6 }, let_);
  el('path', { d: 'M -20 -9 L 0 -2 L 20 -9', fill: 'none', stroke: pal.line, 'stroke-width': 1.6 }, let_);
  const m = k.buddy({ x: 150, y: FY, scale: S });
  const c = k.buddy({ x: 360, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sign = g({});
  el('rect', { x: -27, y: -34, width: 54, height: 36, rx: 4, fill: pal.red, stroke: '#fff', 'stroke-width': 3 }, sign);
  k.text(0, -11, 'PRIVATE', { 'font-size': 10, fill: '#fff', 'font-weight': 700 }, sign);
  const hand = el('circle', { r: 6, fill: pal.mint });
  const q = say(k, 34, 30, 1);
  k.text(0, 5, '?', { 'font-size': 18, fill: pal.coralDark }, q.g);
  return {
    update(t) {
      const cx = (tt) => lerp(360, 300, easeOut(seg(tt, 0.1, 1.0))) + easeInOut(seg(tt, 2.6, 3.6)) * 38;
      const w = walkTo(cx, t, 360, -1);
      const grab = easeInOut(seg(t, 0.9, 1.4)) * (1 - seg(t, 2.4, 2.8));
      P(c, { x: w.x, walk: w.walk, facing: -1, armL: w.armL, armR: lerp(w.armR, 78, grab) + hump(seg(t, 2.8, 3.6)) * 40, lean: w.lean + grab * 6,
        mood: t > 1.9 ? 'sad' : 'flat', look: -1, blink: blinkAt(t) });
      const up = easeInOut(seg(t, 1.2, 1.9)), down = easeInOut(seg(t, 3.5, 3.8));
      const mx = lerp(150, 196, easeInOut(seg(t, 0.8, 1.7)));
      P(m, { x: mx, armR: lerp(8, 70, up) * (1 - down * 0.5), lean: up * 6, mood: up > 0.5 ? 'flat' : 'smile', blink: blinkAt(t, 1) });
      const h = hp(m, S, 'R');
      tf(sign, h.x + 24, h.y + 8, 0, up * 0.95 + 0.001);
      sign.setAttribute('opacity', up > 0 ? 1 : 0);
      k.set(hand, { cx: h.x, cy: h.y, opacity: up > 0 ? 1 : 0 });
      q.show(seg(t, 2.1, 2.5), c.state.x - 4, 100, 1);
    }
  };
}
