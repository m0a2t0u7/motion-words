// pull over：走っている車が、次の角の手前で道の端へ寄って止まる。助手席の人が角を指さして頼む（例文 Please pull over at the next corner.）
import { seg, lerp, easeOut, easeInOut, wobble, clamp } from '../ease.js';
import { car } from './pull-up.js';

export const meta = { duration: 4.0, beats: [[0, '走っている'], [1.4, '道の端へ寄る'], [3.0, '角で停車']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 150, mood: 'outdoor' });
  // 遠くの家並み
  [[0, 60], [70, 40], [130, 70], [210, 50]].forEach(([x, h], i) => el('rect', { x, y: 150 - h, width: 64, height: h, fill: i % 2 ? '#F3E6DC' : '#E4EEF7' }));
  // 道路（手前ほど下）：奥の車線と手前の路肩
  el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#9AA3B2' });
  el('rect', { x: 0, y: 150, width: 400, height: 10, fill: '#D4DAE2' });
  [10, 90, 170].forEach((x) => el('rect', { x, y: 212, width: 46, height: 4, fill: '#fff', opacity: 0.85 }));
  el('rect', { x: 0, y: 270, width: 300, height: 30, fill: '#D4DAE2' });
  el('rect', { x: 0, y: 268, width: 300, height: 4, fill: '#B9C1CD' });
  // 角：右側に交差する道
  el('rect', { x: 300, y: 150, width: 100, height: 150, fill: '#9AA3B2' });
  el('rect', { x: 384, y: 160, width: 16, height: 140, fill: '#D4DAE2' });
  el('path', { d: 'M 300 268 Q 300 300 300 300 L 300 268 Z', fill: '#B9C1CD' });
  el('rect', { x: 284, y: 230, width: 5, height: 40, fill: '#8C96A8' });
  el('circle', { cx: 286, cy: 228, r: 9, fill: pal.blue });
  const C = car(k, { color: pal.white, dark: '#C9CED8' });
  // 助手席の人（コーラル）：車内の後ろの席
  const pass = g({}, C.body);
  el('circle', { cx: -20, cy: -56, r: 8, fill: pal.coral }, pass);
  const arm = el('line', { x1: -14, y1: -52, x2: 0, y2: -52, stroke: pal.coralDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, pass);
  const hand = el('circle', { r: 3, fill: pal.coral }, pass);
  return {
    update(t) {
      // x は右へ、y は奥の車線（228）→ 路肩（262）へ寄せる
      const p = clamp(t / 3.0);
      const x = lerp(-80, 236, 1 - Math.pow(1 - p, 2.2));
      const side = easeInOut(seg(t, 1.2, 2.8));
      const y = lerp(232, 262, side);
      const s = lerp(0.85, 1, side);
      const stop = seg(t, 2.9, 3.6);
      const pitch = (t > 2.9 ? 2.5 * Math.sin(stop * Math.PI) * (1 - stop) : 0) + Math.sin(seg(t, 1.2, 2.8) * Math.PI * 2) * 1.2;
      C.update(x, y, x + 80, pitch, s);
      // 「次の角で」と前を指す
      const pt = seg(t, 0.3, 0.7) * (1 - seg(t, 2.8, 3.2));
      const ex = lerp(-14, 6, pt), ey = lerp(-48, -60, pt);
      k.set(arm, { x2: ex, y2: ey }); k.set(hand, { cx: ex, cy: ey });
    }
  };
}
