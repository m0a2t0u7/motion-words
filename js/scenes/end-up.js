// end up：出かける計画を立てたのに雨。結局ふたりは週末ずっとソファで家にいることになる（例文 We ended up staying home all weekend.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, sofa, win } from './run-after.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.6, beats: [[0, '出かける予定'], [1.4, '雨が降る'], [3.4, '結局家で週末']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 30, 40, 100, 80, '#CFE9F7');
  const drops = Array.from({ length: 10 }, () => el('line', { x1: 0, y1: 0, x2: -3, y2: 10, stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round' }, w.inner));
  w.frame();
  // カレンダー（SAT / SUN）
  el('rect', { x: 300, y: 44, width: 70, height: 50, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const days = ['SAT', 'SUN'].map((d, i) => { const r = el('rect', { x: 306 + i * 30, y: 56, width: 28, height: 30, rx: 3, fill: '#EEF1F5' }); k.text(320 + i * 30, 71, d, { 'font-size': 9, fill: pal.sub }); return r; });
  // テレビ
  el('rect', { x: 330, y: 150, width: 56, height: 6, fill: pal.woodDark }); el('rect', { x: 340, y: 156, width: 36, height: 80, fill: pal.wood });
  el('rect', { x: 326, y: 106, width: 64, height: 44, rx: 4, fill: pal.ink });
  const screen = el('rect', { x: 330, y: 110, width: 56, height: 36, rx: 2, fill: '#6A7598' });
  k.shadow(358, 237, 26, 3);
  const so = sofa(k, 200, 236, 160);
  const S = 0.72;
  const behind = g({});
  const a = k.buddy({ x: 160, y: FY, scale: S, parent: behind });
  const c = k.buddy({ x: 240, y: FY, scale: S * 0.95, color: pal.coral, dark: pal.coralDark, facing: -1, parent: behind });
  so.front();
  const ahead = g({});
  // 計画の吹き出し（山と旗）→ ×
  const plan = bubble(k, 70, 46);
  el('path', { d: 'M -26 14 L -8 -10 L 4 4 L 12 -4 L 28 14 Z', fill: pal.green }, plan);
  el('line', { x1: -8, y1: -10, x2: -8, y2: -20, stroke: pal.ink, 'stroke-width': 1.5 }, plan); el('path', { d: 'M -8 -20 L 2 -17 L -8 -14 Z', fill: pal.red }, plan);
  const no = el('path', { d: 'M -16 -14 L 16 14 M 16 -14 L -16 14', stroke: pal.red, 'stroke-width': 5, 'stroke-linecap': 'round' }, plan);
  return {
    update(t) {
      const rain = seg(t, 1.2, 1.6);
      w.sky.setAttribute('fill', rain > 0.5 ? '#9AA7BA' : '#CFE9F7');
      drops.forEach((d, i) => { const p = (t * 1.7 + i / 10) % 1; tf(d, 38 + (i * 29) % 96, 36 + p * 90); d.setAttribute('opacity', rain); });
      const pq = easeOut(seg(t, 0.2, 0.6)) * (1 - seg(t, 2.6, 2.9));
      tf(plan, 200, 100, 0, pq); plan.setAttribute('opacity', pq > 0 ? 1 : 0);
      no.setAttribute('opacity', seg(t, 1.8, 2.0));
      // 立っている→がっかり→ソファに座る（足元はソファの前に隠れる）
      const sit = easeInOut(seg(t, 2.4, 3.0));
      const dis = hump(seg(t, 1.7, 2.5));
      [a, c].forEach((b, i) => {
        (sit < 0.4 ? ahead : behind).appendChild(b.g);
        P(b, { x: i ? 240 : 160, y: lerp(FY + 30, FY - 24, sit) - 6 * hump(sit), facing: i ? -1 : 1, armL: lerp(i ? 8 : 150, 8, easeInOut(seg(t, 0.8, 1.3))), armR: 8, lean: -6 * hump(sit) + 6 * dis, squash: 1 - 0.06 * dis,
          look: t > 3.0 ? (i ? -0.9 : 0.9) : 0.5, mood: t > 3.4 ? 'smile' : t > 1.7 ? 'sad' : 'grin', blink: blinkAt(t, i) });
      });
      screen.setAttribute('fill', t > 3.0 ? `hsl(${(t * 80) % 360},55%,72%)` : '#6A7598');
      days.forEach((d, i) => d.setAttribute('fill', seg(t, 3.2 + i * 0.5, 3.4 + i * 0.5) > 0.5 ? '#FFD3CC' : '#EEF1F5'));
    }
  };
}
