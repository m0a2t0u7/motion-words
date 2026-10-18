// leave off：しおりをはさんだ本を開き、前にやめたところ（しおりの行）から2人で続きを読む（例文 Let's start again where we left off.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';
import { grip } from './hand-over.js';

export const meta = { duration: 4.2, beats: [[0, 'しおりの所'], [1.4, '本を開く'], [2.8, '続きから読む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 290, y: 56, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 20, y: 160, width: 70, height: 76, rx: 4, fill: pal.wood });
  [0, 1, 2, 3].forEach((i) => el('rect', { x: 26 + i * 15, y: 132, width: 12, height: 28, rx: 2, fill: [pal.coral, pal.blue, pal.yellow, pal.violet][i] }));
  const S = 1;
  const C = k.buddy({ x: 290, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const A = k.buddy({ x: 140, y: FY, scale: S });
  // 本（正面から見る）。中心 (210,150)、背は中央
  const BX = 212, BY = 152;
  const book = g({}); tf(book, BX, BY);
  const pagesL = g({}, book), pagesR = g({}, book);
  el('rect', { x: -52, y: -34, width: 52, height: 68, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, pagesL);
  el('rect', { x: 0, y: -34, width: 52, height: 68, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, pagesR);
  for (let i = 0; i < 6; i++) { el('rect', { x: -46, y: -26 + i * 10, width: 40, height: 3, rx: 1.5, fill: '#C3CBD6' }, pagesL); }
  const rl = [];
  for (let i = 0; i < 6; i++) rl.push(el('rect', { x: 6, y: -26 + i * 10, width: 40, height: 3, rx: 1.5, fill: i < 2 ? '#C3CBD6' : pal.ink }, pagesR));
  const mark = el('path', { d: 'M -3 -40 L 3 -40 L 3 -2 L 0 -6 L -3 -2 Z', fill: pal.red }, book);
  const hl = el('rect', { x: 4, y: -10, width: 44, height: 7, rx: 3, fill: pal.yellow, opacity: 0 }, book);
  const cover = g({}, book);
  el('rect', { x: 0, y: -36, width: 54, height: 72, rx: 3, fill: pal.green }, cover);
  el('rect', { x: 10, y: -18, width: 34, height: 6, rx: 3, fill: '#fff', opacity: 0.7 }, cover);
  const tab = el('path', { d: 'M 22 -36 L 28 -36 L 28 -48 L 25 -45 L 22 -48 Z', fill: pal.red });
  const gl = grip(k, pal.mint, pal.mintDark, S), gr = grip(k, pal.mint, pal.mintDark, S);
  return {
    update(t) {
      const open = easeInOut(seg(t, 1.2, 1.9));
      // 開く前は右半分の表紙だけが見える
      tf(book, BX - 26 * open, BY);
      tf(cover, 0, 0, 0, lerp(1, -1, open), 1);
      pagesL.setAttribute('opacity', open > 0.5 ? 1 : 0);
      [mark].forEach((m) => m.setAttribute('opacity', open > 0.5 ? 1 : 0));
      tab.setAttribute('opacity', open > 0.5 ? 0 : 1); tf(tab, BX - 26 * open, BY);
      // 前回の続き（しおりの行）が光り、読む指が行をなぞる
      const rd = seg(t, 2.4, 4.0);
      hl.setAttribute('opacity', seg(t, 2.1, 2.4) * 0.8);
      A.pose({ lean: 3, look: 0.5, mood: t > 2.4 ? 'grin' : 'smile', armL: 10 });
      const g1 = { x: BX - 26 * open + (open > 0.5 ? -54 : 0), y: BY + 26 };
      A.pose({ armR: reach(A, S, 'R', g1.x, g1.y) }); gl(hp(A, S, 'R'));
      const fx = lerp(BX - 26 + 8, BX - 26 + 46, rd);
      const pt = t < 2.3 ? { x: BX - 26 * open + 52, y: BY + 26 } : { x: fx, y: BY - 6 + 10 * Math.floor(rd * 2.99) };
      C.pose({ lean: 6, look: 0.5, mood: t > 2.4 ? 'grin' : 'smile', armL: 10 });
      C.pose({ armR: reach(C, S, 'R', pt.x, pt.y) }); gr(hp(C, S, 'R'));
      rl.forEach((r, i) => r.setAttribute('fill', i < 2 ? '#C3CBD6' : i === 2 && rd > 0 ? pal.blueDark : pal.ink));
    }
  };
}
