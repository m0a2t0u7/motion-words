// rude：まめが口いっぱいにほおばったまましゃべり、食べかすが飛ぶ。向かいの人は顔をしかめて手を上げる（例文 It's rude to talk with your mouth full.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, hold, person, homeBg, onFace, mark, sym, talk } from './confused.js';

export const meta = { duration: 4.2, beats: [[0, 'ほおばる'], [1.4, '食べながら話す'], [3.0, '失礼！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = homeBg(k, { winX: 160 });
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const cheeks = onFace(k, b);
  const ch = [-1, 1].map((d) => el('circle', { cx: d * 20, cy: -46, r: 9, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 1.5 }, cheeks));
  const mom = person(k, 'coral', { x: 290, y: FY, scale: 0.98, facing: -1 });
  const brow = onFace(k, mom);
  [-1, 1].forEach((d) => el('line', { x1: d * 16, y1: -68, x2: d * 5, y2: -63, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, brow));
  // テーブル（手前）
  k.shadow(205, FY + 2, 120, 5);
  el('rect', { x: 80, y: FY - 54, width: 250, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 92, y: FY - 44, width: 8, height: 44, fill: pal.woodDark }); el('rect', { x: 310, y: FY - 44, width: 8, height: 44, fill: pal.woodDark });
  [[150, '#FFE4B5'], [260, '#FFE4B5']].forEach(([x, c]) => { el('ellipse', { cx: x, cy: FY - 56, rx: 24, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }); el('ellipse', { cx: x, cy: FY - 60, rx: 13, ry: 5, fill: c }); });
  const bread = g({});
  el('rect', { x: -9, y: -14, width: 18, height: 14, rx: 6, fill: '#E9B66B' }, bread);
  const crumbs = Array.from({ length: 7 }, () => el('circle', { r: 2.4, fill: '#D9A04E' }));
  const x = mark(k, 'x', undefined, 1.6), hey = sym(k, '!', pal.coralDark, 26);
  return {
    update(t) {
      const bite = hump(seg(t, 0.3, 0.9)), full = seg(t, 0.8, 1.0), chat = t > 1.3 && t < 2.9;
      P(b, { x: 120, armR: 20 + 70 * bite, armL: chat ? 40 + 30 * Math.sin(t * 8) : 10, lean: 4, look: 0.7, mood: chat && Math.sin(t * 20) > -0.2 ? 'open' : 'flat', blink: blinkAt(t) });
      hold(k, b, S, bread, 'R', 0); bread.setAttribute('opacity', t < 1.0 ? 1 : 0);
      ch.forEach((c) => c.setAttribute('r', 0.01 + 9 * full * (1 + 0.1 * Math.sin(t * 20))));
      crumbs.forEach((c, i) => { const q = ((t - 1.3) * 1.4 + i / 7) % 1; const on = chat ? 1 : 0;
        k.set(c, { cx: 150 + q * (60 + i * 6), cy: FY - 78 - 20 * Math.sin(q * 3) + q * q * 30 + i, opacity: on * (1 - q) }); });
      const stop = easeOut(seg(t, 2.6, 3.0));
      P(mom, { x: 290, facing: -1, lean: -6 * stop, armR: lerp(10, 120, stop), armL: 8, mood: t > 1.8 ? 'flat' : 'smile', look: 0.6, blink: blinkAt(t, 1) });
      brow.setAttribute('opacity', seg(t, 1.8, 2.2));
      tf(x, 205, FY - 132, 0, t > 3.0 ? 1.6 * easeOut(seg(t, 3.0, 3.3)) : 0.001);
      hey(seg(t, 2.6, 2.9), 300, FY - 118);
    }
  };
}
