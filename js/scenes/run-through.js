// run through：本番前に、発表のスライドを1枚目から最後まで通して練習する（例文 Let's run through the presentation once more.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '最初から'], [1.6, '通して進む'], [4.0, '最後まで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // スクリーン
  el('rect', { x: 150, y: 34, width: 220, height: 134, rx: 4, fill: '#fff', stroke: '#B9C3D0', 'stroke-width': 4 });
  const clip = k.clip((cp) => el('rect', { x: 154, y: 38, width: 212, height: 126 }, cp));
  const deck = g({ 'clip-path': clip });
  const slides = [0, 1, 2, 3].map((i) => {
    const s = g({}, deck);
    el('rect', { x: 0, y: 0, width: 212, height: 126, fill: '#fff' }, s);
    el('rect', { x: 16, y: 14, width: 90, height: 10, rx: 5, fill: pal.ink }, s);
    if (i === 0) el('circle', { cx: 106, cy: 74, r: 30, fill: pal.blue }, s);
    if (i === 1) [0, 1, 2].forEach((j) => el('rect', { x: 40 + j * 46, y: 104 - (j + 1) * 22, width: 30, height: (j + 1) * 22, rx: 3, fill: pal.green }, s));
    if (i === 2) [0, 1, 2].forEach((j) => { el('circle', { cx: 30, cy: 50 + j * 22, r: 5, fill: pal.coral }, s); el('rect', { x: 44, y: 46 + j * 22, width: 110, height: 7, rx: 3.5, fill: '#D9DFE7' }, s); });
    if (i === 3) el('path', { d: 'M 106 46 L 114 66 L 136 67 L 119 80 L 125 101 L 106 89 L 87 101 L 93 80 L 76 67 L 98 66 Z', fill: pal.yellow }, s);
    return s;
  });
  const dots = [0, 1, 2, 3].map((i) => el('circle', { cx: 236 + i * 16, cy: 182, r: 5, fill: pal.line }));
  const S = 1.05;
  const b = k.buddy({ x: 96, y: FY, scale: S });
  // 聞き役（練習を見る）
  const C = k.buddy({ x: 330, y: FY + 30, scale: 0.8, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const clicker = g({}); el('rect', { x: -4, y: -6, width: 8, height: 14, rx: 3, fill: pal.ink }, clicker); el('circle', { cx: 0, cy: -2, r: 1.8, fill: pal.red }, clicker);
  const T = [1.1, 2.1, 3.1];
  return {
    update(t) {
      let cur = 0;
      T.forEach((s) => { if (t > s) cur++; });
      slides.forEach((s, i) => {
        let x = 999;
        if (i === cur) x = 154 - (cur < 3 ? 0 : 0);
        T.forEach((s0, j) => { const q = easeInOut(seg(t, s0, s0 + 0.3)); if (q > 0 && q < 1) { if (i === j) x = 154 - 212 * q; if (i === j + 1) x = 154 + 212 * (1 - q); } });
        tf(s, x, 38);
      });
      dots.forEach((d, i) => k.set(d, { fill: i <= cur ? pal.blue : pal.line }));
      const click = T.reduce((a, s) => a + hump(seg(t, s - 0.15, s + 0.05)), 0);
      const end = seg(t, 3.9, 4.3);
      b.pose({ armR: lerp(60 + 10 * click, 30, end), armL: 50 + 40 * Math.sin(t * 3) * (1 - end), lean: 3 * Math.sin(t * 2), look: 0.6, mood: end > 0.5 ? 'grin' : 'smile' });
      const h = hp(b, S, 'R');
      tf(clicker, h.x, h.y - 4, -20);
      C.pose({ armR: 10 + 60 * hump(seg(t, 4.0, 4.5)), armL: 10, look: 0.5, mood: 'smile' });
    }
  };
}
