// enjoy：風船と飾りのパーティー会場で、まめと友だちが音楽に合わせて跳ねたり手を上げたりして、とても楽しむ。紙吹雪が舞う（例文 We enjoyed the party very much.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P } from './run-after.js';
import { roomBg } from './look-over.js';
import { cake } from './so-far-so-good.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'パーティー'], [1.0, '一緒に踊る'], [2.8, 'とても楽しい']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('path', { d: 'M 0 26 Q 100 56 200 26 T 400 26', stroke: pal.sub, 'stroke-width': 1.5, fill: 'none' });
  for (let i = 0; i < 15; i++) { const x = 12 + i * 27, y = 26 + Math.abs(Math.sin((x / 200) * Math.PI)) * 26; el('path', { d: `M ${x - 9} ${y} L ${x + 9} ${y} L ${x} ${y + 16} Z`, fill: [pal.coral, pal.yellow, pal.blue, pal.mint][i % 4] }); }
  // 風船（ひもで結ばれ、少し揺れる）
  const bl = [[40, pal.red], [66, pal.yellow], [352, pal.blue], [376, pal.violet]].map(([x, c]) => {
    const b = g({});
    el('path', { d: 'M 0 0 Q 4 40 0 90', stroke: pal.sub, 'stroke-width': 1.2, fill: 'none' }, b);
    el('ellipse', { cx: 0, cy: -16, rx: 14, ry: 17, fill: c }, b);
    el('ellipse', { cx: -5, cy: -22, rx: 3, ry: 5, fill: '#fff', opacity: 0.4 }, b);
    return [b, x];
  });
  // テーブルとケーキ（動かない）
  el('rect', { x: 166, y: FY - 50, width: 70, height: 6, rx: 3, fill: pal.wood });
  el('rect', { x: 196, y: FY - 44, width: 8, height: 44, fill: pal.woodDark });
  k.shadow(200, FY + 1, 26, 4);
  const ck = cake(k); tf(ck, 200, FY - 51, 0, 1.3);
  const note = icon(k, 'note'), note2 = icon(k, 'note');
  const me = k.buddy({ x: 120, y: FY, scale: 0.9 });
  const fr = k.buddy({ x: 282, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const conf = Array.from({ length: 22 }, (_, i) => el('rect', { x: -3, y: -2, width: 6, height: 4, rx: 1, fill: [pal.coral, pal.yellow, pal.blue, pal.mint, pal.violet][i % 5] }));
  return {
    update(t) {
      bl.forEach(([b, x], i) => tf(b, x, 120 + 3 * Math.sin(t * 2 + i), 3 * Math.sin(t * 1.6 + i)));
      const on = easeOut(seg(t, 0.3, 0.8));
      // 拍に合わせてはねる（交互に）
      const beat = (ph) => Math.max(0, Math.sin(t * 7 + ph));
      const jumpA = on * beat(0), jumpB = on * beat(Math.PI);
      P(me, { lift: 12 * jumpA, squash: 1 - 0.06 * on * Math.max(0, -Math.sin(t * 7)), armR: 8 + on * (110 + 40 * Math.sin(t * 7)), armL: 8 + on * (110 - 40 * Math.sin(t * 7)), lean: 4 * Math.sin(t * 3.5) * on, look: 0.5, mood: on > 0.2 ? 'grin' : 'smile', blink: t > 2.8 ? 1 : 0 });
      P(fr, { lift: 12 * jumpB, squash: 1 - 0.06 * on * Math.max(0, Math.sin(t * 7)), armR: 8 + on * (120 + 30 * Math.sin(t * 7 + 1)), armL: 8 + on * (100 + 30 * Math.sin(t * 7)), lean: -4 * Math.sin(t * 3.5) * on, look: 0.5, mood: on > 0.2 ? 'grin' : 'smile', blink: t > 3.0 ? 1 : 0 });
      [note, note2].forEach((n, i) => { const q = (t * 0.6 + i * 0.5) % 1; tf(n, 170 + i * 60 + 10 * Math.sin(q * 6), 120 - 30 * q, 0, 0.9); n.setAttribute('opacity', hump(q) * on); });
      conf.forEach((c, i) => { const sp = 50 + (i * 13) % 30, y = ((t * sp + i * 37) % 260) - 20, x = (i * 53) % 400 + 10 * Math.sin(t * 2 + i); tf(c, x, y, t * 200 + i * 40); c.setAttribute('opacity', on); });
    }
  };
}
