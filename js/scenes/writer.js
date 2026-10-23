// writer：作家のまめが最後の原稿を書き上げて束に重ね、1冊の小説になる。ほっと伸びをする（例文 The writer finished her new novel.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { reach, held, hp, P, blinkAt, wear, deskFront, pop, sc } from './member.js';
import { homeBg, lampTable } from './furniture.js';
import { pencil } from './check.js';
import { sparkle } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '最後の1枚'], [1.8, '書き終える'], [3.0, '小説が完成']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  homeBg(k, { FY, winX: 260, winW: 100 });
  el('rect', { x: 30, y: 50, width: 70, height: 6, fill: pal.woodDark });
  [['#7FB3E8', 34], ['#F28CB1', 46], ['#FFCF5C', 58], ['#9ACB84', 70]].forEach(([c, x]) => el('rect', { x, y: 22, width: 10, height: 28, rx: 1, fill: c }));
  const b = k.buddy({ x: 120, y: FY, scale: S, facing: 1 }); wear(k, b, 'glasses');
  const TOP = FY - 44;
  deskFront(k, 100, 180, TOP, FY);
  // 原稿の束（だんだん厚い）
  const stack = g({}); tf(stack, 230, TOP);
  for (let i = 0; i < 8; i++) el('rect', { x: -20, y: -3 - i * 2.4, width: 40, height: 3, fill: i % 2 ? '#fff' : '#F4F0E6', stroke: pal.line, 'stroke-width': 0.6 }, stack);
  const sheet = g({}); el('rect', { x: -20, y: -2, width: 40, height: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1 }, sheet);
  const lines = el('path', { d: 'M -14 -7 h 28', stroke: pal.blueDark, 'stroke-width': 1.5 });
  const book = g({}); el('rect', { x: -22, y: -30, width: 44, height: 30, rx: 3, fill: pal.coral }, book); el('rect', { x: -22, y: -30, width: 6, height: 30, fill: pal.coralDark }, book);
  el('rect', { x: -10, y: -22, width: 26, height: 8, rx: 2, fill: '#fff' }, book); k.text(3, -18, 'NOVEL', { 'font-size': 6 }, book);
  const pen = pencil(k);
  const sp = [0, 1, 2].map(() => sparkle(k));
  return {
    update(t) {
      // 1.書く（ペンが左右）2.紙を束へ 3.束が本になる
      const wr = t < 1.8, mv = easeInOut(seg(t, 1.9, 2.5)), done = easeOut(seg(t, 2.7, 3.1));
      const sx = lerp(170, 230, mv), sy = lerp(TOP, TOP - 22, mv) - 10 * hump(mv);
      tf(sheet, sx, sy, 0, sc(1 - seg(t, 2.5, 2.6)));
      const q = (t * 1.6) % 1;
      const tip = wr ? { x: 156 + 26 * q, y: TOP - 6 + Math.floor(t * 1.6) % 2 * 0 } : { x: sx - 12, y: sy - 2 };
      P(b, { lean: wr ? 10 : 6 - 14 * done, look: wr ? 0.8 : 0.6, blink: t > 3.0 && t < 3.6 ? 1 : blinkAt(t), mood: t > 2.8 ? 'grin' : 'flat', squash: 1 + 0.04 * done });
      b.pose({ armR: lerp(reach(b, S, 'R', tip.x, tip.y), 168, done), armL: lerp(14, 160, done) });
      held(k, b, S, pen, 'R', 0, 20); pen.setAttribute('opacity', t < 2.6 ? 1 : 0);
      k.set(lines, { d: `M 156 ${TOP - 3} h ${26 * clamp(t / 1.8)}`, opacity: t < 2.0 ? 1 : 0 });
      stack.setAttribute('opacity', 1 - done);
      tf(book, 230, TOP, 0, pop(done));
      sp.forEach((s, i) => { const p = seg(t, 3.0 + i * 0.15, 4.0 + i * 0.1); tf(s, 210 + i * 20, TOP - 40 - (i % 2) * 14 - 8 * p, 0, sc(hump(p))); });
    }
  };
}
