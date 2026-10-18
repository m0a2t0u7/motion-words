// at the moment：まめは今パソコン作業で手いっぱい。遊びに誘われても手を上げて「今はだめ」（例文 I'm busy at the moment.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, held, officeBg, desk, monitor, papers, cue, say, icon, walk, path, drop } from './in-common.js';

export const meta = { duration: 4.2, beats: [[0, '作業で手一杯'], [1.4, '誘われる'], [2.6, '今は無理']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 150);
  const top = desk(k, 30, 150, FY);
  const mon = monitor(k, 80, top);
  const lines = [0, 1, 2, 3].map((i) => el('rect', { x: 62, y: top - 36 + i * 6, width: 0, height: 3, rx: 1.5, fill: '#fff' }));
  [130, 152].forEach((x, i) => { const p = papers(k, 4 + i); tf(p, x, top - 10 - i * 2); });
  el('rect', { x: 66, y: top - 5, width: 34, height: 5, rx: 2, fill: pal.sub });
  const A = k.buddy({ x: 150, y: FY + 2, scale: 0.9, facing: -1 });
  const C = k.buddy({ x: 440, y: FY, scale: 0.86, facing: -1, color: pal.coral, dark: pal.coralDark });
  const ball = g({}); icon(k, 'ball', ball);
  const ask = say(k, 50, 34, 1); icon(k, 'ball', ask.g); k.text(18, 0, '?', { 'font-size': 16, fill: pal.sub }, ask.g);
  const no = cue(k, 'Busy now', 92, 30, 1, 14);
  const sw = drop(k);
  const xc = path([[0.6, 440], [1.6, 270]]);
  return {
    update(t) {
      // まめ：ずっとタイピング。誘われたら片手を上げて断る
      const tp = Math.sin(t * 26), stop = hump(seg(t, 2.3, 3.6));
      P(A, { facing: -1, look: t > 2.1 && t < 3.7 ? -0.9 : 0.6, mood: t > 2.4 && t < 3.6 ? 'open' : 'flat', armR: 62 + 8 * tp, armL: lerp(56 - 8 * tp, 120, easeOut(seg(t, 2.3, 2.6)) * (1 - easeOut(seg(t, 3.5, 3.8)))), lean: 8, squash: 1 + 0.01 * tp });
      lines.forEach((l, i) => l.setAttribute('width', 30 * ((t * 0.8 + i * 0.27) % 1)));
      // ピンク：ボールを持って誘いに来る→がっかり
      walk(C, xc, t, { look: 0.5, mood: t > 3.2 ? 'sad' : 'smile' });
      C.pose({ armR: t > 1.5 ? lerp(70, 30, seg(t, 3.0, 3.5)) : C.state.armR });
      const h = held(k, C, 0.86, ball, 'R', 0, 34);
      tf(ball, h.x, h.y);
      ask.show(seg(t, 1.6, 1.9) * (1 - seg(t, 2.3, 2.45)), 286, 120);
      no.show(seg(t, 2.4, 2.7) * (1 - seg(t, 3.7, 3.9)), 196, 112);
      sw.setAttribute('opacity', t > 0.3 ? 1 : 0); tf(sw, 128, FY - 92 + 10 * ((t * 0.7) % 1));
    }
  };
}
