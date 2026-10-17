// expedite：まめが早送りボタンを押すとコンベアが速くなり、荷物が早くトラックへ。到着日が FRI から WED に（例文 Could you expedite the shipment?）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.3, beats: [[0, 'ふつうの速さ'], [1.4, '急がせる'], [3.2, '早く届く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 倉庫の壁の柱
  el('rect', { x: 0, y: 150, width: 30, height: 86, fill: '#E4E9F0' });
  el('rect', { x: 4, y: 160, width: 22, height: 58, rx: 3, fill: '#CBD3DE' });

  // カレンダー（到着日）
  const cal = g({});
  tf(cal, 56, 30);
  el('rect', { x: 3, y: 4, width: 102, height: 84, rx: 9, fill: pal.shadow }, cal);
  el('rect', { width: 102, height: 84, rx: 9, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 }, cal);
  el('path', { d: 'M 0 24 L 0 9 Q 0 0 9 0 L 93 0 Q 102 0 102 9 L 102 24 Z', fill: pal.blue }, cal);
  k.text(51, 12.5, 'ARRIVAL', { 'font-size': 12, fill: '#FFFFFF' }, cal);
  const dayA = g({ transform: 'translate(51 56)' }, cal);
  const dayB = g({ transform: 'translate(51 56)' }, cal);
  const ta = k.text(0, 0, 'FRI', { 'font-size': 34, fill: pal.red }, dayA);
  const tb = k.text(0, 0, 'WED', { 'font-size': 34, fill: pal.green }, dayB);

  // ベルト
  const BT = 200, BX0 = 20, BX1 = 292;
  [50, 150, 250].forEach((x) => el('rect', { x, y: BT + 14, width: 8, height: 22, fill: '#B9C4D4' }));
  el('rect', { x: BX0, y: BT, width: BX1 - BX0, height: 14, rx: 7, fill: '#6C7A91' });
  el('rect', { x: BX0 + 4, y: BT + 1, width: BX1 - BX0 - 8, height: 4, rx: 2, fill: '#8795AB' });
  const marks = [];
  for (let i = 0; i < 11; i++) marks.push(el('rect', { y: BT + 6, width: 10, height: 3.5, rx: 1.7, fill: '#A9B5C7' }));
  [BX0 + 7, BX1 - 7].forEach((x) => el('circle', { cx: x, cy: BT + 7, r: 6, fill: '#4F5B70' }));

  // トラック（荷台は横から見た断面）
  const truck = g({});
  const TFY = 202;
  el('rect', { x: 298, y: 128, width: 70, height: TFY - 128, rx: 4, fill: '#EDF1F7' }, truck);
  el('rect', { x: 298, y: 124, width: 76, height: 7, rx: 3, fill: '#CBD3DE' }, truck);
  el('rect', { x: 366, y: 124, width: 9, height: TFY - 120, rx: 3, fill: '#CBD3DE' }, truck);
  el('rect', { x: 296, y: TFY, width: 80, height: 10, rx: 3, fill: '#8795AB' }, truck);
  el('path', { d: 'M 376 142 L 396 142 Q 404 142 408 152 L 414 172 L 414 TFY L 376 TFY Z'.replace('TFY', TFY).replace('TFY', TFY), fill: pal.blue }, truck);
  el('path', { d: 'M 382 150 L 396 150 Q 400 150 402 155 L 406 168 L 382 168 Z', fill: '#E4F1FF' }, truck);
  [322, 392].forEach((x) => { el('circle', { cx: x, cy: 220, r: 13, fill: '#3A4356' }, truck); el('circle', { cx: x, cy: 220, r: 5.5, fill: '#C9D0DA' }, truck); });
  k.shadow(350, 234, 70, 5);

  // 荷物
  const BW = 26;
  const slots = [[314, 189], [343, 189], [328, 163]];
  const x0 = [196, 140, 84];
  const box = (c) => {
    const b = g({});
    el('rect', { x: -BW / 2, y: -BW / 2, width: BW, height: BW, rx: 4, fill: c, stroke: 'rgba(40,52,70,0.25)', 'stroke-width': 2 }, b);
    el('rect', { x: -3.5, y: -BW / 2, width: 7, height: BW, fill: 'rgba(255,255,255,0.55)' }, b);
    return b;
  };
  const boxes = [box('#E7B97E'), box('#F2C98F'), box('#E0AC6E')];

  // 速度線
  const lines = [0, 1, 2, 3].map((i) => el('line', { x1: 0, x2: 28, y1: 0, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));

  // 操作盤
  const panel = g({});
  el('rect', { x: 100, y: 206, width: 36, height: 44, rx: 8, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, panel);
  el('rect', { x: 104, y: 210, width: 28, height: 8, rx: 3, fill: '#E4E9F0' }, panel);
  const btn = g({}, panel);
  el('circle', { cx: 112, cy: 229, r: 9, fill: pal.coralDark }, btn);
  el('circle', { cx: 112, cy: 227, r: 9, fill: pal.coral }, btn);
  el('path', { d: 'M 108 223 L 114 227 L 108 231 Z M 113 223 L 119 227 L 113 231 Z', fill: '#FFFFFF' }, btn);
  el('rect', { x: 117, y: 248, width: 8, height: 8, fill: pal.woodDark, opacity: 0 }, panel);

  // まめ（ボタンの左に立つ）
  const b = k.buddy({ x: 62, y: 262, scale: 0.85 });
  const spark = g({});
  el('path', { d: 'M 0 -9 Q 1.5 -1.5 9 0 Q 1.5 1.5 0 9 Q -1.5 1.5 -9 0 Q -1.5 -1.5 0 -9 Z', fill: pal.yellow }, spark);
  const ck = g({});
  el('circle', { r: 15, fill: pal.green, stroke: '#FFFFFF', 'stroke-width': 3.5 }, ck);
  el('path', { d: 'M -7 1 L -2 6 L 8 -6', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ck);

  const V0 = 34, V1 = 230, T0 = 2.0, TR = 0.5;
  const phaseAt = (t) => {
    if (t < T0) return V0 * t;
    const u = Math.min(t - T0, TR);
    return V0 * T0 + V0 * u + (V1 - V0) * u * u / (2 * TR) + (t - T0 > TR ? V1 * (t - T0 - TR) : 0);
  };

  return {
    update(t) {
      const ph = phaseAt(t);
      const fast = seg(t, T0, T0 + TR);
      // ベルトの目印
      marks.forEach((m, i) => k.set(m, { x: BX0 + 12 + ((i * 24 + ph) % 264) * 0.98 }));
      // 荷物
      boxes.forEach((bx, i) => {
        const X = x0[i] + ph;
        if (X <= 292) { tf(bx, X, BT - BW / 2); return; }
        const u = Math.min(1, (X - 292) / 34);
        const [sx, sy] = slots[i];
        const e = u;
        const x = lerp(292, sx, e);
        const y = lerp(BT - BW / 2, sy, e * e) - 16 * 4 * u * (1 - u);
        tf(bx, x, y);
      });
      // 速度線
      lines.forEach((l, i) => {
        const f = ((t * 3.4 + i * 0.27) % 1);
        k.set(l, { opacity: fast > 0.3 && t < 3.55 ? 0.7 * hump(f) : 0 });
        tf(l, lerp(250, 60, f) + i * 5, 150 + i * 13 + (i % 2) * 6);
      });
      // まめ：ボタンを押す
      const reach = easeInOut(seg(t, 1.0, 1.7));
      const press = seg(t, 1.7, 1.85) * (1 - seg(t, 2.05, 2.25));
      const back = easeInOut(seg(t, 2.4, 3.0));
      const a = lerp(8, 75, reach) + 9 * press;
      const armR = lerp(a, 8, back);
      const happy = t > 3.3;
      b.pose({ armR, armL: happy ? 50 + 10 * Math.sin((t - 3.3) * 9) : 8, look: 0.9, lean: 5 * reach * (1 - back), mood: happy ? 'grin' : 'smile', lift: happy ? 6 * Math.abs(Math.sin((t - 3.3) * 7)) * (1 - seg(t, 3.3, 4.3)) : 0 });
      tf(btn, 0, 2.5 * press);
      // トラック：荷物が入るたびに揺れる
      tf(truck, 0, 1.2 * Math.abs(wobble(seg(t, 2.45, 3.4), 3, 3)));
      // カレンダー：FRI → WED
      const fl = seg(t, 3.1, 3.5);
      const sa = fl < 0.5 ? Math.cos(fl * Math.PI) : 0, sb = fl >= 0.5 ? Math.sin((fl - 0.5) * Math.PI) : 0;
      tf(dayA, 51, 56, 0, 1, Math.max(0.001, sa));
      tf(dayB, 51, 56, 0, 1, Math.max(0.001, sb));
      dayA.setAttribute('opacity', fl < 0.5 ? 1 : 0);
      dayB.setAttribute('opacity', fl >= 0.5 ? 1 : 0);
      const cs = t < 3.55 ? 0 : backOut(seg(t, 3.55, 3.85), 2.2);
      tf(ck, 150, 40, 0, cs, cs);
      const ss = hump(seg(t, 3.4, 3.9));
      tf(spark, 160 + 20 * seg(t, 3.4, 3.9), 70 - 10 * seg(t, 3.4, 3.9), t * 60, ss, ss);
    }
  };
}
