// smile：彼女が口元でにっこり笑い、そのまま手を振ってあいさつする（例文 She smiled and said hello.）
import { seg, lerp, easeOut, backOut, wobble } from '../ease.js';
import { streetBg, heart } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '真顔で立つ'], [1.2, 'ほほ笑む'], [2.6, 'あいさつ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 240);
  const her = k.buddy({ x: 140, y: FY, facing: 1, color: pal.coral, dark: pal.coralDark, scale: 1.05 });
  const fr = k.buddy({ x: 290, y: FY, facing: -1, scale: 0.95 });
  const bub = g({});
  el('rect', { x: -34, y: -16, width: 68, height: 32, rx: 14, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('path', { d: 'M -14 15 L -20 28 L -2 15 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bub);
  el('rect', { x: -30, y: -13, width: 58, height: 28, fill: '#fff' }, bub);
  k.text(0, 0, 'Hello!', { 'font-size': 16 }, bub);
  const sp = [0, 1, 2].map(() => { const h = g({}); heart(k, h, pal.yellow); return h; });
  return {
    update(t) {
      const sm = easeOut(seg(t, 1.1, 1.4)), wave = seg(t, 2.3, 2.6), w = Math.sin(t * 12);
      const pop = wobble(seg(t, 1.1, 1.8), 2, 4);
      her.pose({ mood: t < 1.15 ? 'flat' : 'smile', squash: 1 + 0.03 * pop, lean: 3 * sm, armR: lerp(8, 112 + 22 * w, wave), look: 0.5, blink: seg(t, 1.3, 1.4) * (1 - seg(t, 1.4, 1.6)) });
      fr.pose({ mood: t > 2.6 ? 'grin' : 'smile', armR: lerp(8, 100 + 20 * Math.sin(t * 12 + 1), seg(t, 3.0, 3.3)), look: 0.4 });
      tf(bub, 168, FY - 148, 0, backOut(seg(t, 2.4, 2.8)) + 0.001);
      sp.forEach((s, i) => {
        const q = seg(t, 1.2 + i * 0.1, 2.0);
        tf(s, 118 + i * 22, FY - 118 - 10 * q - (i % 2) * 8, 0, Math.sin(q * Math.PI) * 0.9 + 0.001);
      });
    }
  };
}
