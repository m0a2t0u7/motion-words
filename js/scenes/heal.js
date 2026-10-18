// heal：腕の切り傷に絆創膏を貼り、日にちが7日進むと傷がふさがって消える（例文 The cut healed in a week.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '切り傷'], [1.5, '日が過ぎる'], [3.8, '傷が治った']] };
const STAR = 'M 0 -9 L 2.6 -2.8 L 9 -2.4 L 4 2 L 5.6 8.4 L 0 5 L -5.6 8.4 L -4 2 L -9 -2.4 L -2.6 -2.8 Z';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('ellipse', { cx: 200, cy: 266, rx: 170, ry: 12, fill: '#F1D9CF' });
  const b = k.buddy({ x: 70, y: FY, facing: 1 });
  const IX = 236, IY = 134, IR = 66;
  const zoom = el('path', { d: '', fill: pal.line, opacity: 0.45 });
  // 虫めがね（拡大図）：動かない円。中の腕・傷・絆創膏が変化する
  const cp = k.clip((c) => el('circle', { cx: IX, cy: IY, r: IR - 2 }, c));
  el('circle', { cx: IX, cy: IY, r: IR, fill: '#FFF7EE', stroke: pal.ink, 'stroke-width': 4 });
  const inn = g({}); inn.setAttribute('clip-path', cp);
  const arm = g({}, inn); tf(arm, IX, IY);
  el('rect', { x: -90, y: -26, width: 180, height: 52, rx: 26, fill: pal.mint }, arm);
  el('rect', { x: -90, y: -26, width: 180, height: 14, rx: 7, fill: '#fff', opacity: 0.2 }, arm);
  const cut = el('path', { d: 'M -20 -14 L -6 -2 L -14 4 L 2 16 L 14 8', fill: 'none', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, arm);
  const scar = el('path', { d: 'M -20 -14 L -6 -2 L -14 4 L 2 16 L 14 8', fill: 'none', stroke: '#8FE0CC', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, arm);
  const bd = g({}, inn);
  el('rect', { x: -46, y: -14, width: 92, height: 28, rx: 14, fill: '#F3D6B5', stroke: '#D9B48B', 'stroke-width': 2 }, bd);
  el('rect', { x: -16, y: -14, width: 32, height: 28, fill: '#fff' }, bd);
  [-30, -24, 24, 30].forEach((x) => [-6, 0, 6].forEach((y) => el('circle', { cx: x, cy: y, r: 1, fill: '#D9B48B' }, bd)));
  // カレンダー
  const cal = g({}); tf(cal, 352, 60);
  el('rect', { x: -26, y: -28, width: 52, height: 58, rx: 7, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, cal);
  el('rect', { x: -26, y: -28, width: 52, height: 16, rx: 7, fill: pal.red }, cal);
  el('rect', { x: -26, y: -20, width: 52, height: 8, fill: pal.red }, cal);
  const num = k.text(0, 8, '1', { 'font-size': 30, fill: pal.ink }, cal);
  const dots = [];
  for (let i = 0; i < 7; i++) dots.push(el('circle', { cx: 300 + i * 12, cy: 112, r: 4, fill: pal.line }));
  const spark = [0, 1, 2].map(() => el('path', { d: STAR, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.2 }));
  // 腕本体の傷印
  const mark = g({});
  const mk = el('rect', { x: -7, y: -3, width: 14, height: 6, rx: 3, fill: '#F3D6B5', stroke: '#D9B48B', 'stroke-width': 1.2 }, mark);
  const P = (o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  return {
    update(t) {
      const up = easeOut(seg(t, 0.2, 0.7)), dayP = seg(t, 1.0, 3.5), day = Math.min(7, 1 + Math.floor(dayP * 7));
      const healed = seg(t, 3.5, 4.0);
      P({ armR: lerp(8, 90, up), lean: 3 * up, mood: t > 3.9 ? 'grin' : t < 1.0 ? 'sad' : 'smile', look: 0.5 });
      const h = hp(b, 1, 'R', 14);
      // 拡大の線
      k.set(zoom, { d: `M ${h.x} ${h.y} L ${IX - 40} ${IY - 56} L ${IX - 50} ${IY + 44} Z`, opacity: 0.4 * up });
      // 絆創膏（貼る→はがす）
      const put = backOut(seg(t, 0.8, 1.2)), peel = easeIn(seg(t, 3.3, 3.8));
      tf(bd, IX - 2 + 90 * peel, IY + 2 - 70 * (1 - put) - 80 * peel, 38 + 50 * peel, put > 0.01 && peel < 1 ? 1 : 0.001);
      bd.setAttribute('opacity', 1 - seg(t, 3.6, 3.9));
      k.set(cut, { opacity: 1 - seg(t, 3.5, 3.7), 'stroke-width': lerp(5, 3, seg(t, 3.3, 3.6)) });
      k.set(scar, { opacity: hump(seg(t, 3.5, 4.3)) * 0.9 });
      tf(mark, h.x, h.y, 0, 1 - seg(t, 3.5, 3.9) + 0.001);
      k.set(mk, { fill: t < 0.8 ? pal.red : '#F3D6B5' });
      // 日付
      num.textContent = String(day);
      const flip = 1 - 0.6 * hump(((dayP * 7) % 1) * 3 > 1 ? 0 : ((dayP * 7) % 1) * 3);
      tf(num, 0, 8, 0, 1, dayP > 0 && dayP < 1 ? flip : 1);
      dots.forEach((d, i) => k.set(d, { fill: i < day && t > 1.0 ? pal.green : pal.line, r: 4 }));
      spark.forEach((s, i) => { const q = seg(t, 3.9 + i * 0.12, 4.6); tf(s, IX - 30 + i * 30, IY - 40 + (i % 2) * 70 - 10 * q, 0, hump(q) * 1.1 + 0.001); });
    }
  };
}
