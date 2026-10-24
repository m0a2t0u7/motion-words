// standard：検査台にヘルメットを置くと、メーターが基準の線を超えて合格の✓（例文 This product meets safety standards.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, faceAt } from './look-over.js';
import { reach } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, 'ヘルメットを持つ'], [1.3, '検査台に置く'], [3.2, '基準を超え合格']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'office', 240);
  desk(k, 205, 190, 196);
  // 検査台の皿とメーター
  el('rect', { x: 206, y: 192, width: 44, height: 5, rx: 2, fill: pal.sub });
  el('path', { d: 'M 250 195 Q 300 195 322 186', fill: 'none', stroke: pal.sub, 'stroke-width': 3 });
  const MX = 334, MT = 84, MH = 102;
  el('rect', { x: MX - 4, y: MT - 6, width: 36, height: MH + 12, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2.5 });
  const fill = el('rect', { x: MX, y: MT + MH, width: 28, height: 0, rx: 3, fill: pal.blue });
  const LY = MT + MH * 0.42;
  el('line', { x1: MX - 10, y1: LY, x2: MX + 38, y2: LY, stroke: pal.red, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
  el('path', { d: `M ${MX - 10} ${LY - 9} L ${MX - 10} ${LY + 3} L ${MX - 22} ${LY - 3} Z`, fill: pal.red });
  // ヘルメット（原点＝底の中央）
  const hel = g({});
  el('path', { d: 'M -17 0 Q -17 -24 0 -24 Q 17 -24 17 0 Z', fill: pal.yellow }, hel);
  el('rect', { x: -21, y: -3, width: 42, height: 5, rx: 2.5, fill: pal.yellowDark }, hel);
  el('rect', { x: -3, y: -24, width: 6, height: 20, fill: pal.yellowDark, opacity: 0.5 }, hel);
  // 合格スタンプ
  const ok = g({});
  el('circle', { r: 21, fill: pal.green }, ok);
  el('circle', { r: 21, fill: 'none', stroke: '#fff', 'stroke-width': 2.5, opacity: 0.7 }, ok);
  el('path', { d: 'M -10 1 L -3 8 L 11 -8', fill: 'none', stroke: '#fff', 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  const b = k.buddy({ x: 168, y: FY, scale: S });
  const PX = 228, PY = 192;

  return {
    update(t) {
      const go = easeInOut(seg(t, 0.55, 1.3)), back = easeInOut(seg(t, 1.6, 2.2));
      const lv = easeOut(seg(t, 1.9, 3.0)) * 0.78;          // メーター（基準の線は 0.58）
      P(b, { armR: 62, lean: 0 });
      const aim = reach(b, S, 'R', PX, PY - 10);
      const dip = hump(seg(t, 1.2, 1.7));
      const ar = lerp(lerp(62, aim, go), 24, back);
      P(b, { armR: ar, armL: lerp(8, 70, easeOut(seg(t, 3.0, 3.5))), lean: 9 * go * (1 - back), look: 0.5, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t) });
      faceAt(b, 2, 0);
      const h = hp(b, S, 'R');
      const put = easeOut(seg(t, 1.2, 1.55));
      const hx = lerp(h.x + 4, PX, put), hy = lerp(h.y + 6, PY - 1, put);
      tf(hel, hx, hy, 0, 1 + 0.06 * wobble(seg(t, 1.5, 2.3)), 1 - 0.1 * wobble(seg(t, 1.5, 2.3)) * (t > 1.5 ? 1 : 0));
      k.set(fill, { y: MT + MH - MH * lv, height: MH * lv, fill: lv > MH * 0 + 0.58 ? pal.green : pal.blue });
      const p = seg(t, 3.0, 3.5);
      tf(ok, 292, 68, -8 * (1 - p), p <= 0 ? 0.001 : backOut(p), p <= 0 ? 0.001 : backOut(p));
      ok.setAttribute('opacity', p > 0 ? 1 : 0);
    }
  };
}
