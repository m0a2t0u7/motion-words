// hire：会社の人が見守るなか、新しい従業員10人が一列に入ってきて名札をもらう（例文 The company hired ten new workers.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { gait } from './dig.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '会社の入口'], [1.5, '一人ずつ入る'], [3.6, '10人そろった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 壁：会社の看板とドア
  el('rect', { x: 110, y: 40, width: 180, height: 34, rx: 8, fill: pal.blue });
  el('rect', { x: 118, y: 46, width: 164, height: 22, rx: 5, fill: '#fff', opacity: 0.25 });
  [0, 1, 2].forEach((i) => el('rect', { x: 140 + i * 40, y: 52, width: 24, height: 10, rx: 3, fill: '#fff' }));
  el('rect', { x: 352, y: 104, width: 48, height: 132, fill: '#D9E3EE' });
  el('rect', { x: 358, y: 110, width: 36, height: 126, rx: 3, fill: '#8EA4C0' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const boss = k.buddy({ x: 52, y: FY, facing: 1, scale: 0.95 });
  const colors = [[pal.mint, pal.mintDark], [pal.coral, pal.coralDark], [pal.blue, pal.blueDark], [pal.yellow, pal.yellowDark], [pal.violet, '#7E63DB']];
  const SC = 0.44, N = 10;
  const slot = (i) => 112 + i * 27, start = (i) => 0.15 + i * 0.27;
  const dur = (i) => (440 - slot(i)) / 78;
  const W = [];
  for (let i = 0; i < N; i++) {
    const [c, d] = colors[i % 5];
    const w = k.buddy({ x: 440, y: FY, facing: -1, scale: SC, color: c, dark: d });
    W.push(w);
  }
  const tags = W.map(() => el('rect', { width: 9, height: 7, rx: 1.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1 }));
  const cnt = bubble(k, 56, 36); k.text(0, 0, '×10', { 'font-size': 22, fill: pal.blueDark }, cnt);
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  return {
    update(t) {
      const pt = seg(t, 3.4, 3.9);
      P(boss, { armR: lerp(8, 90, easeOut(seg(t, 0.3, 0.8))) + 6 * Math.sin(t * 6) * (t < 3.4 ? 1 : 0) , look: 0.6, mood: t > 3.4 ? 'grin' : 'smile', lean: 3 + 4 * pt, squash: 1 + 0.012 * Math.sin(t * 4) });
      W.forEach((w, i) => {
        const xf = (tt) => lerp(440, slot(i), easeInOut(seg(tt, start(i), start(i) + dur(i))));
        const p = gait(xf, t, 440, 12, 0.24);
        const arrived = t >= start(i) + dur(i);
        P(w, { x: p.x, walk: p.walk, armL: p.armL, armR: p.armR, lean: -p.lean, look: -0.6 * (1 - 0), mood: arrived && t > 3.4 ? 'grin' : 'smile', squash: arrived && t > 3.4 ? 1 - 0.06 * hump(seg(t, 3.5 + (i % 5) * 0.05, 3.8 + (i % 5) * 0.05)) : 1 });
        w.pose({ facing: -1 });
        const q = backOut(seg(t, 3.3 + i * 0.03, 3.6 + i * 0.03));
        tf(tags[i], slot(i) - 4.5 * 1 + 0, FY - 28, 0, q > 0 ? q + 0.001 : 0.001);
      });
      tf(cnt, 160, 124 - 3 * Math.sin(t * 5), 0, Math.max(0.001, backOut(seg(t, 3.5, 3.9))));
    }
  };
}
