// card：郵便受けに届いたカードを取り出して開くと、誕生日のお祝い（例文 She sent me a birthday card.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach, P, blinkAt, walkTo, face, streetBg } from './bag.js';
import { cake } from './so-far-so-good.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '郵便受けを見る'], [1.4, 'カードが届いた'], [2.6, '誕生日カード']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236;
  streetBg(k, FY);
  // 郵便受け
  k.shadow(300, FY + 1, 16, 3);
  el('rect', { x: 296, y: FY - 90, width: 8, height: 90, fill: pal.woodDark });
  el('rect', { x: 278, y: FY - 122, width: 44, height: 34, rx: 6, fill: pal.red });
  const flap = el('rect', { x: 278, y: FY - 122, width: 6, height: 34, rx: 2, fill: '#C94A3F' });
  // カード（原点＝中心）：表と中
  const cd = k.g({});
  const inside = k.g({}, cd);
  el('rect', { x: -26, y: -18, width: 52, height: 36, rx: 3, fill: '#FFF6E8', stroke: pal.line, 'stroke-width': 1.5 }, inside);
  el('line', { x1: 0, y1: -18, x2: 0, y2: 18, stroke: pal.line, 'stroke-width': 1 }, inside);
  const ck = cake(k, inside); tf(ck, -13, 10, 0, 0.7);
  k.text(13, -6, 'Happy', { 'font-size': 7, fill: pal.coralDark }, inside);
  k.text(13, 3, 'Birthday', { 'font-size': 7, fill: pal.coralDark }, inside);
  const hh = heart(k, inside, pal.coral); tf(hh, 13, 12, 0, 0.5);
  const front = k.g({}, cd);
  el('rect', { x: 0, y: -18, width: 26, height: 36, rx: 3, fill: '#F7B7C4', stroke: pal.coralDark, 'stroke-width': 1.2 }, front);
  const fh = heart(k, front, '#fff'); tf(fh, 13, 0, 0, 0.8);
  const b = k.buddy({ x: 90, y: FY, scale: S });
  const xf = (t) => lerp(90, 222, easeInOut(seg(t, 0, 1.0)));
  return {
    update(t) {
      const w = walkTo(xf, t, 90);
      P(b, { x: w.x, walk: w.walk, armL: w.armL, lean: w.lean, look: 0.6, blink: blinkAt(t), mood: t > 2.8 ? 'grin' : t > 1.6 ? 'open' : 'smile' });
      face(b, 4, 0);
      const reachIn = easeInOut(seg(t, 1.0, 1.4)), pull = easeInOut(seg(t, 1.5, 2.1));
      const tgt = { x: lerp(290, w.x + 40, pull), y: lerp(FY - 104, FY - 92, pull) };
      b.pose({ armR: t < 1.0 ? w.armR : lerp(w.armR, reach(b, S, 'R', tgt.x, tgt.y), Math.min(1, reachIn + pull)) });
      k.set(flap, { transform: `rotate(${(-80 * hump(seg(t, 1.0, 2.0))).toFixed(1)} 278 ${FY - 88})` });
      const h = hp(b, S, 'R');
      tf(cd, h.x + 10, h.y - 10, 0, t > 1.4 ? 1 : 0.001);
      // 表紙が開く（左へめくれる）
      const op = easeInOut(seg(t, 2.3, 2.8));
      tf(front, lerp(-26, -26, op), 0, 0, lerp(1, -1, op), 1);
      k.set(front, { transform: `translate(${(op > 0.5 ? -26 * 0 : 0)} 0) scale(${lerp(1, -1, op).toFixed(3)} 1)` });
      inside.setAttribute('opacity', t > 1.4 ? 1 : 0);
    }
  };
}
