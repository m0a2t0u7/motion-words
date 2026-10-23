// fee：返却が遅れた本を返し、少しの料金をカウンターに出す（例文 There is a small fee for late returns.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, '本を返す'], [1.6, '遅れの料金'], [3.2, '料金を払う']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'office');
  const S = 1.1;
  const b = k.buddy({ x: 120, y: FY, scale: S });
  // 壁の日付札（期限切れ）
  el('rect', { x: 262, y: 54, width: 60, height: 50, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 262, y: 54, width: 60, height: 14, rx: 6, fill: pal.red });
  k.text(292, 92, '12', { 'font-size': 24, fill: pal.ink });
  const late = k.g({}); k.tf(late, 292, 118);
  el('rect', { x: -24, y: -10, width: 48, height: 20, rx: 5, fill: '#fff', stroke: pal.red, 'stroke-width': 2.5 }, late);
  k.text(0, 4, 'LATE', { 'font-size': 12, fill: pal.red }, late);
  // カウンター
  el('rect', { x: 196, y: 176, width: 204, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 200, y: 184, width: 196, height: 52, fill: '#F2DDBB' });
  const book = g({});
  el('rect', { x: -14, y: -4, width: 28, height: 8, rx: 2, fill: pal.blue }, book);
  el('rect', { x: -12, y: -2, width: 24, height: 2, fill: '#fff' }, book);
  const coin = g({});
  el('circle', { r: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, coin);
  k.text(0, 3.5, '1', { 'font-size': 9, fill: pal.yellowDark }, coin);
  const tag = k.g({}); k.tf(tag, 350, 150);
  const pt = el('rect', { x: -26, y: -13, width: 52, height: 26, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, tag);
  k.text(0, 6, '+1', { 'font-size': 17, fill: pal.red }, tag);
  return {
    update(t) {
      const down = easeInOut(seg(t, 0.7, 1.4)), pay = easeInOut(seg(t, 3.0, 3.7));
      const lx = 190, ly = 168;
      // 右手：本を持つ→カウンターに置く。左手：コインを出す
      const rx = lerp(176, lx + 20, down), ry = lerp(150, 168, down);
      pz(b, S, { x: 150, facing: 1, lean: 4 + 3 * pay, look: 1, blink: blinkAt(t), mood: t > 3.7 ? 'smile' : t > 1.6 ? 'sad' : 'smile' }, [rx, ry], t > 2.8 ? [lerp(168, 250, pay), lerp(150, 172, pay)] : null);
      const h = hp(b, S, 'R', 22);
      if (down < 1) k.tf(book, h.x + 4, h.y - 4, -8, 1.2, 1.2); else k.tf(book, 232, 172, 0, 1.2, 1.2);
      const q = seg(t, 1.6, 2.1);
      late.setAttribute('opacity', q); tag.setAttribute('opacity', clamp(seg(t, 2.0, 2.5)));
      k.tf(tag, 350, lerp(160, 150, easeOut(seg(t, 2.0, 2.5))));
      if (t < 2.8) coin.setAttribute('opacity', 0);
      else { coin.setAttribute('opacity', 1); const hl = hp(b, S, 'L', 20); if (pay < 1) k.tf(coin, hl.x, hl.y, 0, 1.1, 1.1); else k.tf(coin, 262, 171, 0, 1.1, 1.1); }
    }
  };
}
