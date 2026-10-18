// in no time：「すぐ戻るね」と出かけ、時計の針がほとんど進まないうちに買い物袋を持って帰ってくる（Don't worry, I'll be back in no time.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { roomBg } from './look-over.js';
import { gait, hp } from './dig.js';
import { clock, sofa } from './run-after.js';
import { P, blinkAt, talk, mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, 'すぐ戻るね'], [1.6, '出かける'], [2.6, 'もう戻った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const ck = clock(k, 200, 62, 26);
  const sf = sofa(k, 92, FY, 130);
  const C = k.buddy({ x: 92, y: FY - 18, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  sf.front();
  // 玄関ドア（右）
  el('rect', { x: 318, y: FY - 132, width: 74, height: 132, fill: '#DDEFFA' });
  el('rect', { x: 318, y: FY - 30, width: 74, height: 30, fill: '#CDEBCF' });
  const lay = g({ 'clip-path': k.clip((c) => el('rect', { x: 0, y: 0, width: 392, height: 300 }, c)) });
  const G = k.buddy({ parent: lay, x: 240, y: FY, facing: -1, scale: 0.95 });
  const bag = g({}, lay);
  el('path', { d: 'M -12 0 L 12 0 L 10 24 L -10 24 Z', fill: '#E9D3B0' }, bag);
  el('path', { d: 'M -6 0 Q 0 -10 6 0', stroke: '#C9A577', 'stroke-width': 2.5, fill: 'none' }, bag);
  el('circle', { cx: -4, cy: -2, r: 5, fill: pal.red }, bag); el('rect', { x: 2, y: -10, width: 5, height: 12, rx: 2, fill: pal.green }, bag);
  el('rect', { x: 310, y: FY - 140, width: 8, height: 140, fill: pal.woodDark });
  el('rect', { x: 392, y: FY - 140, width: 8, height: 140, fill: pal.woodDark });
  el('rect', { x: 310, y: FY - 142, width: 90, height: 8, fill: pal.woodDark });
  const dr = g({}); el('rect', { x: 0, y: 0, width: 74, height: 132, rx: 2, fill: pal.blue }, dr); el('circle', { cx: 12, cy: 70, r: 4, fill: pal.yellow }, dr);
  const bub = talk(k, 'Back soon!', 92, 32, 1);
  const bang = mark(k, 'bang');
  const xf = (t) => t < 2.2 ? lerp(240, 420, easeInOut(seg(t, 1.0, 2.0))) : lerp(420, 250, easeInOut(seg(t, 2.4, 3.4)));
  return {
    update(t) {
      const m = 2 * easeInOut(seg(t, 1.2, 3.4));
      ck.set(3, m);
      const open = t < 2.2 ? hump(seg(t, 1.3, 2.1)) : hump(seg(t, 2.3, 3.2));
      tf(dr, 318 + 74 * 0, FY - 132, 0, lerp(1, 0.12, clamp(open * 1.6)), 1);
      dr.setAttribute('transform', dr.getAttribute('transform') + ' translate(0 0)');
      const p = gait(xf, t, 240), back = t > 2.2;
      P(G, { x: p.x, walk: p.walk, facing: back ? -1 : t > 0.9 ? 1 : -1, armL: p.armL, lean: p.lean,
        armR: back ? 20 : t < 0.9 ? 8 + 110 * hump(seg(t, 0.1, 0.9)) : p.armR, mood: 'grin', look: 0.5, blink: blinkAt(t) });
      G.g.setAttribute('opacity', p.x > 405 ? 0 : 1);
      const h = hp(G, 0.95, 'R');
      tf(bag, h.x, h.y - 2); bag.setAttribute('opacity', back && p.x < 405 ? 1 : 0);
      const sur = t > 3.3;
      P(C, { facing: 1, look: t < 1.2 ? 0.6 : t < 3.0 ? 0.2 : 0.7, armR: 8 + 50 * hump(seg(t, 0.4, 1.2)), mood: sur ? 'open' : 'smile', lean: sur ? -5 : 0, blink: blinkAt(t, 1) });
      bub.show(seg(t, 0.2, 0.5) * (t < 1.3 ? 1 : 0), 212, 112);
      tf(bang, 120, 116, 0, Math.max(0.001, backOut(seg(t, 3.3, 3.6))));
    }
  };
}
