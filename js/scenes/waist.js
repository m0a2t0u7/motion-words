// waist：試着したズボンがウエストでぶかぶか。手を放すとずり落ち、あわててウエストをつかむ（例文 These pants are too big at the waist.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, bp, spot } from './body.js';
import { shopBg } from './skirt.js';

export const meta = { duration: 4.4, beats: [[0, 'ズボンをはく'], [1.2, 'ずり落ちる'], [2.4, 'ウエストが大きい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.35, FY = 240;
  shopBg(k, FY, 600);
  // 鏡（動かない）
  el('rect', { x: 290, y: 40, width: 80, height: FY - 50, rx: 8, fill: '#DCEBF3', stroke: pal.woodDark, 'stroke-width': 5 });
  el('path', { d: 'M 300 60 l 20 -14 M 300 80 l 36 -28', stroke: '#fff', 'stroke-width': 4, opacity: 0.6 });
  const b = k.buddy({ x: 200, y: FY, scale: S });
  // ズボン（体の下側に付ける。ウエストが体より広い）
  const pants = g({});
  b.body.insertBefore(pants, b.body.children[4]);
  const pp = el('path', { d: 'M -40 -30 H 40 L 36 4 H -36 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, pants);
  el('rect', { x: -40, y: -32, width: 80, height: 6, rx: 2, fill: pal.blueDark }, pants);
  const legsP = [0, 1].map((i) => el('rect', { x: -6, y: -2, width: 12, height: 18, rx: 3, fill: pal.blue }, b.g.children[1].children[i]));
  const gap = el('path', { d: 'M -36 -29 Q -32 -24 -29 -29 M 36 -29 Q 32 -24 29 -29', stroke: pal.blueDark, 'stroke-width': 2, fill: 'none' }, pants);
  const ring = spot(k, pal.red);
  return {
    update(t) {
      const hold = 1 - easeInOut(seg(t, 0.9, 1.1)), slip = easeIn(seg(t, 1.1, 1.5)), grab = easeOut(seg(t, 1.6, 1.9));
      const dy = 16 * slip * (1 - 0.7 * grab);
      P(b, { mood: t > 1.2 ? 'open' : 'smile', look: t > 2.4 ? 0.8 : 0.3, blink: blinkAt(t), lift: t > 1.2 && t < 1.6 ? 4 : 0 });
      if (t > 2.4) b.pose({ mood: 'sad' });
      tf(pants, 0, dy);
      // 手：ウエストを持つ → はなす → つかむ（引っぱって大きさを見せる）
      const pull = t > 2.4 ? 8 * easeInOut(seg(t, 2.4, 2.9)) : 0;
      const w = Math.max(hold, grab);
      const wR = bp(b, S, 38 + pull, -30 + dy), wL = bp(b, S, -38 - pull, -30 + dy);
      b.pose({ armR: lerp(20, reach(b, S, 'R', wR.x, wR.y), w), armL: lerp(20, reach(b, S, 'L', wL.x, wL.y), w) });
      tf(pants, 0, dy, 0, 1 + pull / 40, 1);
      ring.set(seg(t, 2.5, 2.9), b.state.x, bp(b, S, 0, -30 + dy).y, 64, t);
      void legsP; void gap; void pp;
    }
  };
}
