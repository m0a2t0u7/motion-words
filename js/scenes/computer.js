// computer：職場の机でコンピューターに向かい、毎日仕事をする（例文 I use a computer at work every day.）
import { seg, lerp, easeOut, backOut, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.0, beats: [[0, '画面が消えている'], [0.9, '打ち込む'], [3.0, '毎日使う']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'office');
  const S = 1.1;
  const b = k.buddy({ x: 190, y: FY, scale: S });
  // モニター
  el('rect', { x: 236, y: 108, width: 112, height: 80, rx: 8, fill: '#3A4456' });
  el('rect', { x: 284, y: 188, width: 16, height: 10, fill: '#B9C2CF' });
  const scr = el('rect', { x: 243, y: 115, width: 98, height: 66, rx: 3, fill: '#2B3342' });
  const lines = [0, 1, 2].map((i) => el('rect', { x: 250, y: 122 + i * 11, width: 60, height: 5, rx: 2.5, fill: [pal.blue, pal.mint, pal.violet, pal.coral][i] }));
  // 5日分のチェック欄
  const boxes = [0, 1, 2, 3, 4].map((i) => {
    el('rect', { x: 246 + i * 19, y: 164, width: 15, height: 12, rx: 3, fill: '#fff', opacity: 0.9 });
    return el('path', { d: `M ${249 + i * 19} 170 L ${252 + i * 19} 173 L ${258 + i * 19} 166`, stroke: pal.green, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1 });
  });
  desk(k, 200, 190, 198);
  el('rect', { x: 226, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  return {
    update(t) {
      const on = seg(t, 0.4, 0.8);
      k.set(scr, { fill: on ? '#F7F9FC' : '#2B3342' });
      lines.forEach((l, i) => k.set(l, { width: 66 * easeOut(seg(t, 0.9 + i * 0.35, 1.5 + i * 0.35)) * (i % 2 ? 0.8 : 1), opacity: on }));
      boxes.forEach((c, i) => k.set(c, { 'stroke-dashoffset': 1 - seg(t, 2.4 + i * 0.25, 2.65 + i * 0.25) }));
      const typing = t > 0.9 && t < 2.5 ? 1 : 0;
      const ph = t * 14;
      pz(b, S, { x: 190, facing: 1, lean: 6 + 2 * typing, look: 1, blink: blinkAt(t), mood: t > 3 ? 'grin' : 'smile' },
        [236, 192 - typing * 4 * Math.abs(Math.sin(ph))], [226, 192 - typing * 4 * Math.abs(Math.cos(ph))]);
    }
  };
}
