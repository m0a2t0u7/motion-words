// workplace：作業場に入る前に、まめがヘルメットをかぶる。上から落ちた小さなボルトがヘルメットに当たって跳ね、無事でOKサイン（例文 Safety in the workplace is important.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { P, blinkAt, hp, aim, mark, sym } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, 'ヘルメットをかぶる'], [1.8, '物が落ちても'], [3.2, '安全第一']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#ECEAE4' });
  // 足場と安全の掲示（緑の十字）
  el('rect', { x: 150, y: 40, width: 250, height: 8, fill: pal.yellowDark });
  [170, 380].forEach((x) => el('rect', { x, y: 48, width: 6, height: FY - 48, fill: pal.yellowDark }));
  for (let x = 150; x < 400; x += 24) el('path', { d: `M ${x} 40 l 12 0 l -6 8 Z`, fill: pal.ink, opacity: 0.6 });
  el('rect', { x: 40, y: 60, width: 70, height: 70, rx: 6, fill: pal.green });
  el('path', { d: 'M 66 72 h 18 v 16 h 16 v 18 h -16 v 16 h -18 v -16 h -16 v -18 h 16 Z', fill: '#fff' });
  // 床の黄黒ライン
  for (let x = 0; x < 400; x += 30) el('path', { d: `M ${x} ${FY + 6} l 15 0 l 10 10 l -15 0 Z`, fill: pal.yellow });
  const b = k.buddy({ x: 240, y: FY, scale: S });
  // ヘルメット（手で持ち上げて頭へ）
  const hel = g({});
  el('path', { d: 'M -27 0 Q -26 -28 0 -28 Q 26 -28 27 0 Z', fill: pal.yellow }, hel);
  el('rect', { x: -34, y: -2, width: 68, height: 7, rx: 3, fill: pal.yellowDark }, hel);
  el('rect', { x: -3, y: -28, width: 6, height: 26, rx: 2, fill: pal.yellowDark, opacity: 0.6 }, hel);
  const bolt = g({});
  el('rect', { x: -3, y: -8, width: 6, height: 14, fill: '#9AA4B2' }, bolt);
  el('rect', { x: -6, y: -11, width: 12, height: 5, rx: 1, fill: '#7F8A99' }, bolt);
  const ok = mark(k, 'check', undefined, 2), ding = sym(k, '!', pal.coralDark, 20);
  return {
    update(t) {
      const put = easeInOut(seg(t, 0.4, 1.4));
      const headY = FY - 82;
      const hit = 2.3, fall = seg(t, 1.8, hit), bounce = seg(t, hit, 3.0);
      const sq = hump(seg(t, hit, hit + 0.18));
      P(b, { x: 240, armL: 8, armR: 8, squash: 1 - 0.06 * sq, look: t < 1.8 ? 0.3 : t < hit ? 0 : 0.3, mood: t > 2.9 ? 'grin' : t > hit ? 'open' : 'smile', blink: sq > 0.3 ? 1 : blinkAt(t) });
      // 両手でヘルメットをかぶせる
      const hx = 240, hy = lerp(FY - 40, headY - 2, put) + 6 * sq;
      if (t < 1.6) { aim(b, S, 'R', hx + 30, hy - 4); aim(b, S, 'L', hx - 30, hy - 4); }
      else if (t > 3.0) b.pose({ armR: lerp(8, 150, easeOut(seg(t, 3.0, 3.3))) });
      tf(hel, hx, hy, 0, 1);
      // ボルト：落ちて当たり、跳ねて床へ
      let bx, by, rot;
      if (t < hit) { bx = 246; by = lerp(44, headY - 34, easeIn(fall)); rot = 0; }
      else { const q = bounce; bx = 246 + 70 * q; by = headY - 34 - 60 * hump(q * 0.8) + lerp(0, FY - 8 - (headY - 34), q * q); rot = 540 * q; }
      tf(bolt, bx, Math.min(by, FY - 8), rot, t > 1.75 ? 1 : 0.001);
      ding(seg(t, hit, hit + 0.2) * (1 - seg(t, 2.8, 3.0)), 250, headY - 60);
      tf(ok, 330, FY - 140, 0, t > 3.1 ? 2 * easeOut(seg(t, 3.1, 3.4)) : 0.001);
    }
  };
}
