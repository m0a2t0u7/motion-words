// box：床のおもちゃを1つずつ拾って、箱に入れて片づける（例文 Put the toys in the box.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, face, homeBg } from './bag.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '床におもちゃ'], [0.6, '箱に入れる'], [3.8, '片づいた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236, X = 196;
  homeBg(k, { FY, winX: 40, winW: 90 });
  const BX = 330, BW = 64, BH = 40;
  k.shadow(BX, FY + 1, 36, 4);
  el('rect', { x: BX - BW / 2, y: FY - BH, width: BW, height: BH, fill: '#C9955E' });
  el('path', { d: `M ${BX - BW / 2} ${FY - BH} l -14 -16 h ${BW} l 14 16 Z`, fill: '#E3B77E' });
  const toys = [];
  const mkBlock = () => { const g = k.g({}); el('rect', { x: -10, y: -10, width: 20, height: 20, rx: 3, fill: pal.blue }, g); k.text(0, 1, 'A', { 'font-size': 12, fill: '#fff' }, g); return g; };
  toys.push(icon(k, 'ball')); toys.push(mkBlock());
  const bear = k.g({}); [[-7, -9], [7, -9]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 4, fill: '#C98D5B' }, bear)); el('circle', { r: 10, fill: '#D9A46C' }, bear); el('circle', { cx: -3, cy: -1, r: 1.3, fill: pal.ink }, bear); el('circle', { cx: 3, cy: -1, r: 1.3, fill: pal.ink }, bear); toys.push(bear);
  const front = el('rect', { x: BX - BW / 2, y: FY - BH + 8, width: BW, height: BH - 8, fill: '#E3B77E' });
  el('rect', { x: BX - 12, y: FY - BH + 16, width: 24, height: 12, rx: 2, fill: '#fff', opacity: 0.6 });
  const b = k.buddy({ x: X, y: FY, scale: S });
  const homes = [[262, FY - 11], [284, FY - 10], [244, FY - 10]];
  return {
    update(t) {
      // 3回：かがんで拾う → 起きて箱の上へ → 落とす
      const i = clamp(Math.floor((t - 0.3) / 1.15), 0, 2), q = seg(t - 0.3 - i * 1.15, 0, 1.15);
      const active = t > 0.3 && t < 0.3 + 3 * 1.15;
      const bend = active ? hump(seg(q, 0, 0.5)) : 0;
      P(b, { x: X, lean: 40 * bend + 8, squash: 1 - 0.1 * bend, look: 0.8, blink: blinkAt(t), mood: t > 3.8 ? 'grin' : 'smile' });
      face(b, 5, 1);
      const [hx, hy] = homes[i];
      const carry = seg(q, 0.25, 0.8);
      const tgt = q < 0.25 ? { x: hx, y: hy - 4 } : { x: lerp(hx, BX - 4, easeInOut(carry)), y: lerp(hy - 4, FY - BH - 26, Math.sin(Math.min(1, carry * 1.4) * Math.PI / 2)) };
      if (active) b.pose({ armR: reach(b, S, 'R', tgt.x, tgt.y) }); else b.pose({ armR: t > 3.8 ? 120 * hump(seg(t, 3.8, 4.4)) + 10 : 20 });
      const h = hp(b, S, 'R');
      toys.forEach((n, j) => {
        let x, y;
        if (j > i || (j === i && q < 0.25) || t < 0.3) { x = homes[j][0]; y = homes[j][1]; }
        else if (j === i && q < 0.8 && active) { x = h.x; y = h.y + 8; }
        else { const f = j === i && active ? easeOut(seg(q, 0.8, 0.95)) : 1; x = BX - 14 + j * 14; y = lerp(FY - BH - 18, FY - BH + 6, f); }
        tf(n, x, y);
      });
      front.parentNode.appendChild(front);
    }
  };
}
