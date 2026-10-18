// design：デザイナーが机の上でお店のロゴを描き上げ、完成した紙を掲げる（例文 She designed a new logo for the shop.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { hp, reach, table } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '白い紙'], [1.2, 'ロゴを描く'], [3.6, '完成を見せる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 150);
  // 壁のお店の絵（ロゴを付ける店）
  el('rect', { x: 28, y: 40, width: 96, height: 76, rx: 5, fill: '#FFF1D2' });
  for (let i = 0; i < 6; i++) el('path', { d: `M ${28 + i * 16} 40 h 16 v 14 q -8 8 -16 0 Z`, fill: i % 2 ? '#fff' : pal.coral });
  el('rect', { x: 44, y: 66, width: 64, height: 40, rx: 3, fill: '#CFE9F7' });
  el('rect', { x: 52, y: 58, width: 48, height: 10, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5, 'stroke-dasharray': '3 3' });
  const me = k.buddy({ x: 100, y: 236, color: pal.coral, dark: pal.coralDark });
  // 机の上の紙（ロゴを描く）
  const paper = g({}); tf(paper, 236, 190);
  el('rect', { x: -38, y: -4, width: 76, height: 14, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, paper);
  const sheet = g({}); // 掲げた紙
  el('rect', { x: -34, y: -42, width: 68, height: 84, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 3 }, sheet);
  const logo = g({}, sheet);
  const ring = el('circle', { r: 22, cx: 0, cy: 0, fill: 'none', stroke: pal.coralDark, 'stroke-width': 5, pathLength: 1, 'stroke-dasharray': '0 1', transform: 'rotate(-90)' }, logo);
  const leaf = el('path', { d: 'M -10 10 Q -12 -12 10 -12 Q 12 10 -10 10 Z', fill: pal.green, opacity: 0, transform: 'rotate(20)' }, logo);
  const vein = el('line', { x1: -8, y1: 9, x2: 7, y2: -9, stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '0 1' }, logo);
  const pencil = g({});
  el('rect', { x: -2.5, y: -22, width: 5, height: 22, rx: 1.5, fill: pal.yellow }, pencil);
  el('path', { d: 'M -2.5 0 L 2.5 0 L 0 6 Z', fill: '#E9BE7C' }, pencil);
  el('rect', { x: -2.5, y: -26, width: 5, height: 4, rx: 1.5, fill: pal.red }, pencil);
  const spark = [0, 1, 2].map(() => el('path', { d: 'M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z', fill: pal.yellow }));
  const logoSmall = g({});
  return {
    update(t) {
      const dr = seg(t, 1.0, 2.6), dl = seg(t, 2.6, 3.4), up = easeInOut(seg(t, 3.5, 4.2));
      ring.setAttribute('stroke-dasharray', `${easeInOut(dr)} 1`);
      leaf.setAttribute('opacity', seg(t, 2.6, 3.0)); vein.setAttribute('stroke-dasharray', `${seg(t, 3.0, 3.5)} 1`);
      // 手元の紙は描いている間だけ机の上、描き上げたら持ち上げて見せる
      const onDesk = 1 - up;
      paper.setAttribute('opacity', 0);
      // 机上の紙にロゴを写して見せる：sheet は掲げた紙。描画中は机の上に縮小して置く
      const sc = lerp(0.55, 1.0, up);
      const sx = lerp(236, 190, up), sy = lerp(172, 112, up);
      tf(sheet, sx, sy, lerp(-4, 0, up), sc, sc * lerp(0.6, 1, up));
      // 鉛筆の先：円を描いて、葉を描く
      const a = easeInOut(dr) * Math.PI * 2 - Math.PI / 2, rr = 22 * sc, vy = lerp(1, 1, up);
      let px = sx + Math.cos(a) * rr, py = sy + Math.sin(a) * rr * lerp(0.55, 1, up);
      if (t >= 2.6) { const q = seg(t, 2.6, 3.4); px = sx + lerp(0, 4, q) * sc; py = sy + (10 - 20 * q) * sc * lerp(0.55, 1, up); }
      const draw = t > 0.8 && t < 3.5 ? 1 : 0;
      const wr = Math.sin(t * 20) * draw; const hold = reach(me, 1, 'R', sx + 4, sy + 40 * sc);
      me.pose({ armR: lerp(lerp(8, reach(me, 1, 'R', px, py), easeOut(seg(t, 0.6, 1.1))) + wr * 1.5, hold, up), armL: 8, lean: 5 * (1 - up) * seg(t, 0.6, 1.1), mood: up > 0.6 ? 'grin' : 'smile', look: 0.6, squash: 1 });
      const h = hp(me, 1, 'R');
      tf(pencil, h.x + 3, h.y + 2, 32 + wr * 2); pencil.setAttribute('opacity', up > 0.3 ? 0 : 1);
      if (up > 0) { const hl = hp(me, 1, 'L'); }
      spark.forEach((s, i) => { const q = seg(t, 4.0 + i * 0.1, 4.5); tf(s, 168 + i * 46, 78 + (i % 2) * 36 - 10 * q, 0, Math.sin(q * Math.PI) * 1.1 + 0.001); });
    }
  };
}
