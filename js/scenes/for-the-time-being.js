// for the time being：新しい机は来週届く（カレンダーに机の印）。それまでの仮として小さな古い机を示され、荷物を置いて使い始める（Use this desk for the time being.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut, wobble } from '../ease.js';
import { officeBg, monitor } from './get-on-with.js';
import { gait, hp } from './dig.js';
import { P, blinkAt } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '仮の机を示す'], [1.6, '当面これを使う'], [3.2, '新しい机は後日']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  // 週のカレンダー：今日→6日後に机の印
  el('rect', { x: 196, y: 34, width: 168, height: 66, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 196, y: 34, width: 168, height: 14, rx: 6, fill: pal.red });
  for (let i = 0; i < 7; i++) el('rect', { x: 204 + i * 22.5, y: 56, width: 18, height: 36, rx: 3, fill: i === 6 ? '#FFF1D2' : '#F2F4F7' });
  const now = el('rect', { x: 202, y: 54, width: 22, height: 40, rx: 4, fill: 'none', stroke: pal.blueDark, 'stroke-width': 2.5 });
  el('rect', { x: 340, y: 70, width: 14, height: 4, rx: 1, fill: pal.woodDark });
  el('rect', { x: 341, y: 74, width: 2, height: 8, fill: pal.woodDark }); el('rect', { x: 351, y: 74, width: 2, height: 8, fill: pal.woodDark });
  const arrow = el('path', { d: 'M 226 106 Q 290 122 344 106', stroke: pal.sub, 'stroke-width': 2, fill: 'none', 'stroke-dasharray': '4 4' });
  // 仮の小さな机（古い・あて木）
  const DX = 150, DT = FY - 40;
  k.shadow(DX + 30, FY + 1, 36, 4);
  el('rect', { x: DX, y: DT, width: 60, height: 6, rx: 2, fill: '#C9A577' });
  el('rect', { x: DX + 4, y: DT + 6, width: 5, height: 34, fill: pal.woodDark });
  el('rect', { x: DX + 51, y: DT + 6, width: 5, height: 30, fill: pal.woodDark });
  el('rect', { x: DX + 48, y: FY - 4, width: 11, height: 4, fill: '#9B7B50' });
  el('rect', { x: DX + 38, y: DT - 14, width: 14, height: 14, fill: pal.yellow, transform: `rotate(-6 ${DX + 45} ${DT - 7})` });
  const C = k.buddy({ x: 100, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark });
  const G = k.buddy({ x: 400, y: FY, facing: -1 });
  const box = g({}); el('rect', { x: -16, y: -12, width: 32, height: 24, rx: 2, fill: '#E3C49B' }, box); el('rect', { x: -16, y: -12, width: 32, height: 5, fill: '#C9A577' }, box);
  const gx = (t) => t < 2.0 ? lerp(420, 310, easeInOut(seg(t, 0, 1.0))) : lerp(310, 222, easeInOut(seg(t, 2.0, 2.8)));
  const cxf = (t) => lerp(250, 290, easeInOut(seg(t, 1.9, 2.6)));
  return {
    update(t) {
      const a = gait(gx, t, 420), c = gait(cxf, t, 250);
      const show = hump(seg(t, 0.8, 2.2));
      const cal = easeOut(seg(t, 3.0, 3.4));
      P(C, { x: 100, facing: 1, armR: t < 3.0 ? 8 + 62 * clamp(show * 1.5) : lerp(8, 150, cal), armL: 8, look: t > 3.0 ? 0.9 : 0.5,
        lean: 4 * show - 4 * cal, mood: 'smile', blink: blinkAt(t, 1) });
      const put = easeInOut(seg(t, 2.9, 3.3));
      P(G, { x: a.x, walk: a.walk, facing: -1, armR: lerp(64, 80, put), armL: 8, lean: a.lean + 6 * hump(seg(t, 2.9, 3.4)), look: 0.5, mood: t > 3.3 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(G, 1, 'R');
      tf(box, t < 3.3 ? lerp(h.x - 8, DX + 20, put) : DX + 20, t < 3.3 ? lerp(h.y - 6, DT - 12, put) : DT - 12 + 2 * wobble(seg(t, 3.3, 3.8), 2, 6));
      now.setAttribute('opacity', 1);
      arrow.setAttribute('opacity', seg(t, 3.0, 3.4));
      arrow.setAttribute('stroke-dashoffset', -t * 10);
    }
  };
}
