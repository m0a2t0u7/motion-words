// pile up：留守の机の上に、開けていない郵便物が日ごとに届いて、どんどん高く積み重なる（例文 Unread mail piled up on his desk.）
import { seg, lerp, easeIn, easeOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'からの机'], [1.8, '郵便がたまる'], [3.6, '山積みになった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 300, y: 50, width: 66, height: 62, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 300, y: 50, width: 66, height: 14, rx: 6, fill: pal.red });
  const day = k.text(333, 90, '1', { 'font-size': 26 });
  // 机といす（だれも座っていない）
  el('rect', { x: 130, y: 176, width: 170, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 140, y: 186, width: 8, height: 54, fill: pal.woodDark });
  el('rect', { x: 282, y: 186, width: 8, height: 54, fill: pal.woodDark });
  k.shadow(215, 241, 90, 5);
  el('rect', { x: 92, y: 128, width: 10, height: 74, rx: 5, fill: pal.blue });
  el('rect', { x: 92, y: 196, width: 46, height: 8, rx: 4, fill: pal.blueDark });
  el('rect', { x: 112, y: 204, width: 5, height: 30, fill: '#8C96A8' });
  const N = 14;
  const cols = ['#fff', '#FBF1DD', '#E4EEF7', '#F9E1DA'];
  const mail = Array.from({ length: N }, (_, i) => {
    const n = g({});
    const w = 46 + (i % 3) * 6;
    el('rect', { x: -w / 2, y: -6, width: w, height: 12, rx: 2, fill: cols[i % 4], stroke: '#C9CED8', 'stroke-width': 1.2 }, n);
    el('path', { d: `M ${-w / 2} -6 L 0 2 L ${w / 2} -6`, stroke: '#C9CED8', 'stroke-width': 1.2, fill: 'none' }, n);
    if (i % 4 === 1) el('rect', { x: w / 2 - 9, y: -4, width: 6, height: 5, fill: pal.red }, n);
    return { n, off: ((i * 37) % 13) - 6, r: ((i * 53) % 11) - 5 };
  });
  return {
    update(t) {
      const T0 = 0.4, DT = 0.24;
      mail.forEach((m, i) => {
        const a = T0 + i * DT, u = seg(t, a, a + 0.28);
        const yr = 170 - i * 9;
        const x = 215 + m.off, y = lerp(yr - 60, yr, easeIn(u)) - 2 * Math.abs(wobble(seg(t, a + 0.28, a + 0.6), 1.5, 6));
        tf(m.n, x, y, m.r * (0.4 + 0.6 * u) + (1 - u) * 20);
        m.n.setAttribute('opacity', u > 0 ? clamp(u * 4) : 0);
      });
      day.textContent = String(1 + Math.min(N - 1, Math.max(0, Math.floor((t - T0) / DT))));
    }
  };
}
