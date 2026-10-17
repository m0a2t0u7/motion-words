// turn in：まめが報告書を相手に手渡し、受け取った先生が提出物の山に置く（例文 Please turn in your report by Friday.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '報告書を持つ'], [1.5, '手渡す'], [3.1, '机に置かれた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁のカレンダー（金曜に赤丸）
  el('rect', { x: 150, y: 34, width: 74, height: 64, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 150, y: 34, width: 74, height: 16, rx: 6, fill: pal.red });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) el('circle', { cx: 162 + c * 12.5, cy: 62 + r * 12, r: 2.2, fill: pal.line });
  el('circle', { cx: 162 + 4 * 12.5, cy: 62 + 12, r: 7, fill: 'none', stroke: pal.red, 'stroke-width': 2.6 });
  k.text(187, 42, 'FRI', { 'font-size': 10, fill: '#fff' });
  el('rect', { x: 36, y: 46, width: 70, height: 60, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 71, y1: 46, x2: 71, y2: 106, stroke: '#fff', 'stroke-width': 4 });

  const te = k.buddy({ x: 300, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 机（提出物の山）
  const DT = 196;
  el('rect', { x: 328, y: DT, width: 70, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 334, y: DT + 8, width: 58, height: 34, fill: pal.woodDark });
  el('rect', { x: 352, y: DT + 16, width: 22, height: 5, rx: 2.5, fill: pal.wood });
  [0, 1, 2].forEach((i) => el('rect', { x: 340 + (i % 2) * 2, y: DT - 3 - i * 3, width: 30, height: 3, fill: i % 2 ? '#F4F6FA' : '#fff', stroke: pal.line, 'stroke-width': 1 }));
  const me = k.buddy({ x: 70, y: FY, scale: 0.9 });
  const paper = g({});
  const pp = el('rect', { x: -11, y: -15, width: 22, height: 30, rx: 2, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.6 }, paper);
  el('rect', { x: -7, y: -10, width: 14, height: 3, rx: 1.5, fill: pal.blue }, paper);
  [-3, 3, 9].forEach((y) => el('rect', { x: -7, y, width: 14, height: 2, rx: 1, fill: pal.line }, paper));

  return {
    update(t) {
      // まめ：歩いて近づき、手渡す
      const wp = easeInOut(seg(t, 0.2, 1.35));
      const walking = t > 0.2 && t < 1.35;
      const mx = lerp(70, 190, wp);
      const give = easeOut(seg(t, 1.15, 1.5));
      const back = easeInOut(seg(t, 1.95, 2.4));
      const ma = lerp(60, 90, give) * (1 - back) + 8 * back;
      me.pose({ x: mx - 6 * back, walk: walking ? t * 10 : 0, armR: walking ? ma + Math.sin(t * 10) * 4 : ma, armL: walking ? 8 - Math.sin(t * 10) * 14 : 8, look: 0.7, lean: walking ? 4 : 0, mood: t > 2.3 ? 'grin' : 'smile', blink: t > 0.9 && t < 1.0 ? 1 : 0 });
      // 先生：手を出して受け取り、体の前を通して机に置く
      const reach = easeOut(seg(t, 1.2, 1.55));
      const drop = easeInOut(seg(t, 2.0, 2.35));
      const lay = easeInOut(seg(t, 2.35, 2.95));
      const stamp = seg(t, 2.85, 3.3);
      te.pose({ armR: lerp(8, 90, reach) * (1 - drop) + 20 * drop, armL: lerp(8, 92, lay) * (1 - seg(t, 3.0, 3.5)) + 8 * seg(t, 3.0, 3.5), look: -0.4, squash: 1 - 0.035 * wobble(stamp, 1.5, 4) - 0.03 * hump(seg(t, 1.6, 1.9)), mood: t > 3.0 ? 'grin' : 'smile', blink: t > 0.5 && t < 0.6 ? 1 : 0 });
      const hm = me.handPos('R'), ht = te.handPos('R'), hl = te.handPos('L');
      let x = hm.x + 7, y = hm.y - 9, sy = 1;
      const xf = easeInOut(seg(t, 1.5, 1.95));
      x = lerp(x, ht.x - 5, xf); y = lerp(y, ht.y - 9, xf);
      if (t > 2.0) {
        const q = easeInOut(seg(t, 2.05, 2.75));
        x = lerp(ht.x - 5, hl.x - 4, q);
        y = lerp(ht.y - 9, hl.y - 12, q) - 14 * Math.sin(Math.PI * q);
      }
      if (t > 2.7) {
        const q = easeOut(seg(t, 2.7, 3.05));
        x = lerp(hl.x - 4, 355, q);
        y = lerp(hl.y - 12, DT - 11, q);
        sy = lerp(1, 0.1, q);
      }
      tf(paper, x, y, 0, 1, sy);
    }
  };
}
