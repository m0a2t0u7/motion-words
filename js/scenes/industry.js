// industry：車の組み立てライン。車体が次々に流れ、ロボットアームとヘルメットのまめがタイヤを付ける。奥にも車がずらり（例文 He works in the car industry.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, aim, helmet } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '車が流れる'], [1.4, 'タイヤを付ける'], [3.2, '車をつくる業界']] };

function carShape(k, parent, color) {
  const { el, g } = k, c = g({}, parent);
  el('path', { d: 'M -46 -12 L -40 -26 L -18 -28 L -8 -44 L 22 -44 L 34 -28 L 46 -24 L 48 -12 Z', fill: color }, c);
  el('path', { d: 'M -4 -40 L 18 -40 L 26 -29 L -12 -29 Z', fill: '#DDEFFA' }, c);
  return c;
}
export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#E9EDF2' });
  // 奥の完成車の列（業界の広がり）
  for (let i = 0; i < 6; i++) { const c = carShape(k, undefined, ['#F2685B', '#6AA8F7', '#FFCF5C', '#A58BF3', '#59C27A', '#F2685B'][i]); tf(c, 34 + i * 68, 110, 0, 0.55); el('circle', { cx: 34 + i * 68 - 16, cy: 110, r: 5, fill: pal.ink }); el('circle', { cx: 34 + i * 68 + 18, cy: 110, r: 5, fill: pal.ink }); }
  el('rect', { x: 0, y: 114, width: 400, height: 6, fill: '#C9D2DD' });
  // ベルトコンベア
  const BY = FY - 40;
  el('rect', { x: 0, y: BY, width: 400, height: 12, rx: 6, fill: '#4B5566' });
  const rollers = [];
  for (let i = 0; i < 12; i++) rollers.push(el('circle', { r: 4, fill: '#8C96A6' }));
  for (let i = 0; i < 8; i++) el('rect', { x: 20 + i * 52, y: BY + 12, width: 6, height: FY - BY - 12, fill: '#8C96A6' });
  // ロボットアーム（右上から）
  const arm = g({});
  el('rect', { x: 330, y: 0, width: 20, height: 40, fill: pal.yellowDark });
  const a1 = el('line', { stroke: pal.yellow, 'stroke-width': 10, 'stroke-linecap': 'round' });
  const a2 = el('circle', { r: 7, fill: pal.yellowDark });
  // 流れる車体（2台）
  const cars = [0, 1].map((i) => { const c = g({}); carShape(k, c, i ? pal.blue : pal.red); const w1 = el('circle', { cx: -26, cy: -10, r: 9, fill: pal.ink }, c); const w2 = el('circle', { cx: 28, cy: -10, r: 9, fill: pal.ink }, c); return { c, w1, w2 }; });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  helmet(k, b);
  const tire = el('circle', { r: 9, fill: pal.ink, stroke: '#8C96A6', 'stroke-width': 3 });
  const per = 2.2;
  return {
    update(t) {
      const off = (t / per) % 1;
      rollers.forEach((r, i) => k.set(r, { cx: ((i * 36 + t * 60) % 432) - 16, cy: BY + 6 }));
      // 車体：止まる→作業→流れる をくり返す（各台は per 秒ずれ）
      let tireX = 0, tireY = 0, attach = 0;
      cars.forEach(({ c, w1, w2 }, i) => {
        const u = (t + i * per) / (per * 2), cyc = u % 1, ph = cyc * 2; // 0..2
        const x = ph < 1 ? lerp(-60, 200, easeOut(seg(ph, 0, 0.6))) : lerp(200, 460, easeInOut(seg(ph, 1.2, 2)));
        tf(c, x, BY, 0, 1);
        const att = ph < 1 ? seg(ph, 0.6, 0.95) : 1;
        w1.setAttribute('opacity', ph < 1 && att < 1 ? 0 : 1);
        w2.setAttribute('opacity', ph < 1 && seg(ph, 0.2, 0.5) < 1 ? 0 : 1);
        if (ph < 1 && att < 1 && ph > 0.4) { tireX = lerp(140, x - 26, easeInOut(att)); tireY = lerp(FY - 30, BY - 10, easeInOut(att)); attach = 1; }
      });
      P(b, { x: 104, facing: 1, lean: 10 * attach, look: 0.8, mood: 'smile', blink: blinkAt(t), armL: 20 });
      if (attach) aim(b, S, 'R', tireX, tireY); else b.pose({ armR: 30 });
      k.set(tire, { cx: tireX, cy: tireY, opacity: attach });
      // ロボットアームは前輪をはめる
      const swing = Math.sin(t * Math.PI / per * 2) * 0.5 + 0.5;
      const ex = lerp(300, 210, swing), ey = lerp(BY - 80, BY - 22, swing);
      k.set(a1, { x1: 340, y1: 40, x2: ex, y2: ey }); k.set(a2, { cx: ex, cy: ey });
      void off; void arm;
    }
  };
}
