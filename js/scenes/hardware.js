// hardware：ソフトは正常で、パソコン本体の部品（ハード）が壊れている（例文 The problem is with the hardware, not the software.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, 'ソフトは正常'], [1.4, '本体を指す'], [2.8, '部品が故障']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'office');
  const S = 1.1;
  const b = k.buddy({ x: 235, y: FY, scale: S });
  // モニター（ソフト＝正常）
  desk(k, 100, 150, 198);
  el('rect', { x: 50, y: 98, width: 100, height: 72, rx: 6, fill: '#3A4456' });
  el('rect', { x: 56, y: 104, width: 88, height: 56, rx: 3, fill: '#fff' });
  el('rect', { x: 56, y: 104, width: 88, height: 10, fill: pal.blue });
  el('rect', { x: 66, y: 122, width: 50, height: 5, rx: 2.5, fill: '#C9D3DF' });
  el('path', { d: 'M 82 142 L 92 151 L 114 130', stroke: pal.green, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  el('rect', { x: 94, y: 170, width: 12, height: 28, fill: '#B9C2CF' });
  // 本体（ハード）：中の部品が見える
  k.shadow(332, FY, 34, 6);
  el('rect', { x: 300, y: 100, width: 64, height: 138, rx: 8, fill: '#E3E9F1', stroke: '#B9C2CF', 'stroke-width': 3 });
  el('rect', { x: 306, y: 118, width: 52, height: 104, rx: 4, fill: '#2B3342' });
  el('circle', { cx: 332, cy: 142, r: 15, fill: '#4A5568', stroke: '#8793A5', 'stroke-width': 2 });
  const fan = k.g({}); el('path', { d: 'M0 0 L-3 -12 L3 -12 Z M0 0 L12 3 L12 -3 Z M0 0 L3 12 L-3 12 Z M0 0 L-12 -3 L-12 3 Z', fill: '#8793A5' }, fan);
  [0, 1, 2].forEach((i) => el('rect', { x: 312 + i * 14, y: 176, width: 9, height: 22, rx: 2, fill: pal.mint }));
  const chip = el('rect', { x: 322, y: 204, width: 20, height: 12, rx: 2, fill: pal.yellowDark });
  el('rect', { x: 306, y: 104, width: 52, height: 8, rx: 4, fill: '#B9C2CF' });
  const bad = k.g({}); el('path', { d: 'M-8 -8 L8 8 M8 -8 L-8 8', stroke: pal.red, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, bad);
  return {
    update(t) {
      const turn = t > 1.2, pt = easeOut(seg(t, 1.3, 2.0)), br = seg(t, 2.1, 2.5);
      k.tf(fan, 332, 142, t * 40 * (1 - br));
      k.set(chip, { fill: br > 0.5 ? pal.red : pal.yellowDark });
      k.tf(bad, 332, 210, 0, br > 0 ? backOut(br) : 0.001, br > 0 ? backOut(br) : 0.001);
      const o = { x: 235, facing: turn ? 1 : -1, lean: 3, look: 1, blink: blinkAt(t), mood: br > 0.5 ? 'sad' : 'smile' };
      if (turn) pz(b, S, o, [lerp(255, 304, pt), lerp(200, 206, pt)], null);
      else P(b, o);
    }
  };
}
