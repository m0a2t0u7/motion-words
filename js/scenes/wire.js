// wire：箱のひもを切ろうとしたはさみが、うっかり横の電線まで切ってしまい、ランプが消える（例文 The wire was cut by accident.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { reach, hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { homeBg, lampTable } from './furniture.js';
import { scissors } from './drawer.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.2, beats: [[0, 'ひもを切る'], [1.6, 'チョキン'], [2.2, '電線が切れた！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = homeBg(k, { winX: 150, winW: 84 });
  // 壁のコンセント → 床をはう電線 → ランプ
  el('rect', { x: 20, y: FY - 34, width: 18, height: 24, rx: 3, fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 2 });
  const CUT = 196, WY = FY - 4;
  const wL = el('path', { fill: 'none', stroke: '#4A5468', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const wR = el('path', { fill: 'none', stroke: '#4A5468', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
  const coreL = el('circle', { r: 2, fill: '#E9B43A', opacity: 0 }), coreR = el('circle', { r: 2, fill: '#E9B43A', opacity: 0 });
  const lamp = lampTable(k, 352, FY);
  const shade = el('path', { d: `M 336 ${FY - 76} L 342 ${FY - 100} L 362 ${FY - 100} L 368 ${FY - 76} Z`, fill: '#FFE7A8', stroke: pal.yellowDark, 'stroke-width': 1.5 });
  const light = el('path', { d: `M 340 ${FY - 76} L 364 ${FY - 76} L 392 ${FY - 44} L 312 ${FY - 44} Z`, fill: '#FFF3C4', opacity: 0.6 });
  // ひもをかけた箱（電線のすぐ手前）
  const BX = 210;
  k.shadow(BX, FY + 2, 34, 4);
  el('rect', { x: BX - 30, y: FY - 40, width: 60, height: 40, rx: 3, fill: '#E3B77E', stroke: '#C9A577', 'stroke-width': 2 });
  el('rect', { x: BX - 30, y: FY - 40, width: 60, height: 8, fill: '#D4A66C' });
  const str = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 2.5 });
  [wL, wR, coreL, coreR].forEach((n) => k.root.appendChild(n));
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const sc = g({}); const blade = scissors(k, sc);
  const spark = [0, 1].map(() => star(k, k.root, 8, pal.yellow));
  const mark = g({}); el('circle', { r: 11, fill: pal.red }, mark); k.text(0, 1, '!', { 'font-size': 16, fill: '#fff' }, mark);
  return {
    update(t) {
      const cut = t > 1.75, gap = easeOut(seg(t, 1.75, 2.1)) * 15;
      const sag = (x) => WY + 2 * Math.sin(x / 30);
      k.set(wL, { d: `M 38 ${FY - 22} Q 50 ${WY} 80 ${WY} L ${CUT - gap} ${WY + (cut ? 1.5 : 0)}` });
      k.set(wR, { d: `M ${CUT + gap} ${WY + (cut ? 1.5 : 0)} L 330 ${WY} Q 352 ${WY} 352 ${FY - 40}` });
      k.set(coreL, { cx: CUT - gap, cy: WY + 1.5, opacity: cut ? 1 : 0 }); k.set(coreR, { cx: CUT + gap, cy: WY + 1.5, opacity: cut ? 1 : 0 });
      k.set(str, { d: `M ${BX} ${FY - 40} V ${FY}` });
      // 身をかがめて、はさみを箱の下の方へ
      const go = easeInOut(seg(t, 0.4, 1.3));
      const snips = Math.max(0, Math.sin((t - 1.3) * 18)) * (t > 1.3 && t < 1.8 ? 1 : 0);
      const back = easeInOut(seg(t, 2.1, 2.6));
      const pose = { x: 140 - 10 * back, lean: 26 * go * (1 - back) - 6 * back, squash: 1 - 0.08 * go * (1 - back), look: 0.6, blink: blinkAt(t), mood: t < 1.8 ? 'flat' : 'open', lift: 4 * hump(seg(t, 1.8, 2.1)) };
      P(b, pose);
      P(b, { ...pose, armR: lerp(lerp(60, reach(b, S, 'R', CUT - 22, WY - 2), go), 120, back), armL: 8 + 60 * back });
      const h = hp(b, S, 'R', 28);
      tf(sc, h.x + 2, h.y, lerp(-20, 8, go) - 30 * back);
      blade.children[0].setAttribute('transform', `rotate(${-10 * snips})`);
      blade.children[1].setAttribute('transform', `rotate(${10 * snips})`);
      const sp = seg(t, 1.75, 2.2);
      spark.forEach((s, i) => tf(s, CUT + (i ? 10 : -8), WY - 10 - 16 * sp, 90 * sp, hump(sp) * (i ? 0.8 : 1.1) + 0.001));
      const off = t > 1.8;
      shade.setAttribute('fill', off ? '#C9D2DE' : '#FFE7A8');
      light.setAttribute('opacity', off ? 0 : 0.6 + 0.05 * Math.sin(t * 7));
      const m = seg(t, 2.0, 2.4);
      tf(mark, 150, FY - 112 - 4 * m + 2 * wobble(seg(t, 2.4, 3.0), 2, 4), 0, m > 0 ? 0.4 + 0.6 * easeOut(m) : 0.001);
      lamp.setAttribute('opacity', 1);
    }
  };
}
