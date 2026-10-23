// cursor：マウスを動かして、画面のカーソルをページの一番上へ（例文 Move the cursor to the top of the page.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 3.8, beats: [[0, '下にある'], [1.0, 'マウスを動かす'], [2.8, '一番上に着く']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 175, y: FY, scale: S });
  el('rect', { x: 216, y: 66, width: 168, height: 122, rx: 8, fill: '#3A4456' });
  el('rect', { x: 223, y: 73, width: 154, height: 108, rx: 3, fill: '#fff' });
  const top = el('rect', { x: 223, y: 73, width: 154, height: 16, fill: pal.yellow, opacity: 0 });
  el('rect', { x: 223, y: 73, width: 154, height: 3, fill: pal.blue });
  el('rect', { x: 236, y: 82, width: 80, height: 8, rx: 4, fill: pal.ink });
  [100, 114, 128, 142, 156].forEach((y, i) => el('rect', { x: 236, y, width: i % 2 ? 100 : 120, height: 6, rx: 3, fill: '#C9D3DF' }));
  el('rect', { x: 366, y: 76, width: 6, height: 102, rx: 3, fill: '#E3E9F1' });
  const sb = el('rect', { x: 366, y: 120, width: 6, height: 40, rx: 3, fill: '#9AA8BA' });
  desk(k, 196, 200, 198);
  const mouse = k.g({});
  el('rect', { x: -8, y: -11, width: 16, height: 11, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, mouse);
  const cur = el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const mv = easeInOut(seg(t, 1.0, 2.6)), arr = hump(seg(t, 2.6, 3.0));
      k.tf(mouse, 236 + 4 * Math.sin(mv * Math.PI * 2), 198 - 4 * mv);
      k.tf(cur, lerp(300, 262, mv), lerp(158, 84, mv), 0, 1 + 0.15 * arr, 1 + 0.15 * arr);
      k.tf(sb, 0, -42 * mv);
      top.setAttribute('opacity', 0.7 * easeOut(seg(t, 2.5, 2.9)));
      pz(b, S, { x: 175, facing: 1, lean: 5, look: 1, blink: blinkAt(t), mood: t > 2.7 ? 'grin' : 'smile' }, [236 + 4 * Math.sin(mv * Math.PI * 2), 193 - 4 * mv], null);
    }
  };
}
