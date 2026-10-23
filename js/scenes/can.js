// can：豆の缶を片手で押さえ、プルタブを引いてふたを開けると中の豆が見える（例文 I opened a can of beans.）
import { seg, lerp, easeInOut, easeOut, clamp, hump, wobble } from '../ease.js';
import { kitchen, TOP, arms, P, blinkAt } from './jam.js';

export const meta = { duration: 4.0, beats: [[0, '豆の缶'], [1.0, 'プルタブを引く'], [2.6, '開いた']] };

export function create(k) {
  const { el, pal } = k, S = 1.2;
  const kit = kitchen(k);
  const b = k.buddy({ x: 170, y: kit.FY, scale: S });
  kit.front();
  const CX = 240, CW = 46, CH = 58, top = TOP - CH;
  el('rect', { x: CX - CW / 2, y: top, width: CW, height: CH, rx: 4, fill: '#C9D2DD' });
  el('rect', { x: CX - CW / 2, y: top + 10, width: CW, height: CH - 18, fill: '#E86F57' });
  // ラベルの豆の絵
  [[-8, 4], [0, -2], [8, 4], [-3, 9], [5, 10]].forEach(([x, y]) => el('ellipse', { cx: CX + x, cy: top + 28 + y, rx: 4, ry: 2.6, fill: '#F2C094', transform: `rotate(${x * 3} ${CX + x} ${top + 28 + y})` }));
  el('rect', { x: CX - CW / 2 + 5, y: top + 12, width: 5, height: CH - 22, rx: 2, fill: '#fff', opacity: 0.3 });
  // 口：中の豆
  el('ellipse', { cx: CX, cy: top, rx: CW / 2, ry: 6, fill: '#AEB8C6' });
  el('ellipse', { cx: CX, cy: top + 1, rx: CW / 2 - 3, ry: 4.6, fill: '#C9663A' });
  [[-12, 0], [-5, -1.5], [3, 1], [11, 0], [-8, 2], [7, -1.6]].forEach(([x, y]) => el('ellipse', { cx: CX + x, cy: top + 1 + y, rx: 3, ry: 1.8, fill: '#E9A86B' }));
  // ふた（奥の縁を軸に起き上がる）
  const lid = k.g({});
  el('ellipse', { cx: 0, cy: 6, rx: CW / 2 - 1, ry: 6, fill: '#D6DDE6', stroke: '#AEB8C6', 'stroke-width': 1.5 }, lid);
  el('ellipse', { cx: 0, cy: 6, rx: CW / 2 - 7, ry: 3.4, fill: 'none', stroke: '#B9C3CF', 'stroke-width': 1.2 }, lid);
  const tab = el('rect', { x: -4, y: 7, width: 8, height: 12, rx: 3, fill: '#AEB8C6', stroke: '#8E99A8', 'stroke-width': 1 }, lid);
  const A = arms(k, b, S, { back: ['L'] });
  return {
    update(t) {
      const lift = easeInOut(seg(t, 0.8, 1.3));
      const peel = easeInOut(seg(t, 1.4, 2.5));
      const pop = hump(seg(t, 1.4, 1.6));
      P(b, { lean: 6 - 4 * peel, look: 0.6, blink: blinkAt(t), mood: t > 2.6 ? 'grin' : t > 1.4 ? 'flat' : 'smile', squash: 1 - 0.03 * pop });
      // ふた：軸＝奥の縁（top-6）。peel で起こす（縦につぶれて見える→裏返る）
      const sy = Math.cos(peel * Math.PI * 0.85);
      k.tf(lid, CX, top - 6, 0, 1, sy);
      lid.setAttribute('transform', `translate(${CX} ${top - 6}) scale(1 ${sy.toFixed(3)})`);
      tab.setAttribute('transform', `rotate(${(-150 * lift).toFixed(1)} 0 7)`);
      // 右手：プルタブをつまみ、ふたの手前の縁と一緒に起こす → 離す
      const edge = { x: CX, y: top - 6 + 14 * sy };
      const rest = { x: CX - 6, y: top + 22 };
      const reach0 = easeInOut(seg(t, 0.3, 0.8)), away = easeInOut(seg(t, 2.6, 3.1));
      const hx = lerp(lerp(206, edge.x, reach0), rest.x, away), hy = lerp(lerp(214, edge.y, reach0), rest.y, away);
      A.to('R', hx, hy);
      A.to('L', CX - CW / 2 - 2, top + 30);
      void wobble;
    }
  };
}
