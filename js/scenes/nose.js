// nose：鼻水がたれてきて、くしゃみ。ティッシュを取って鼻をかむ（例文 My nose is running.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, nose, spot } from './body.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.2, beats: [[0, '鼻水がたれる'], [1.4, 'くしゃみ'], [2.4, '鼻をかむ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.3, FY = 240;
  homeBg(k, { FY, winX: 40 });
  // テーブルとティッシュ箱（動かない）
  el('rect', { x: 270, y: FY - 70, width: 110, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 280, y: FY - 62, width: 7, height: 62, fill: pal.woodDark }); el('rect', { x: 362, y: FY - 62, width: 7, height: 62, fill: pal.woodDark });
  el('rect', { x: 296, y: FY - 92, width: 44, height: 22, rx: 3, fill: '#9ED3B2' });
  const tis0 = el('path', { d: 'M 312 -92 q 6 -16 14 -4 q -4 2 -6 4 Z', fill: '#fff', transform: `translate(0 ${FY})` });
  const b = k.buddy({ x: 190, y: FY, scale: S });
  const ns = nose(k, b, '#E9877A');
  const drip = el('path', { d: 'M 0 0 Q 3 6 0 9 Q -3 6 0 0 Z', fill: pal.water, stroke: '#7DBFE0', 'stroke-width': 1 });
  const tis = g({}); el('path', { d: 'M -10 -12 Q 0 -18 10 -12 L 12 10 Q 0 14 -12 10 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, tis);
  const ring = spot(k);
  return {
    update(t) {
      const sneeze = t > 1.3 && t < 1.8, pre = hump(seg(t, 1.0, 1.4));
      const grab = easeInOut(seg(t, 2.0, 2.4)), wipe = easeInOut(seg(t, 2.5, 2.9));
      P(b, { lean: -10 * pre + (sneeze ? 14 * hump(seg(t, 1.35, 1.8)) : 0), mood: sneeze ? 'open' : t > 3.4 ? 'smile' : 'flat', blink: pre > 0.3 || sneeze ? 1 : blinkAt(t), squash: sneeze ? 0.94 : 1, look: t > 1.9 && t < 2.5 ? 0.8 : 0.2 });
      const n = bp(b, S, 0 + b.state.look * 6, -48.5);
      const tg = t < 2.5 ? { x: lerp(b.state.x + 34, 318, grab), y: lerp(FY - 50, FY - 102, grab) } : { x: lerp(318, n.x + 10, wipe), y: lerp(FY - 102, n.y + 4, wipe) };
      b.pose({ armR: t > 1.95 ? reach(b, S, 'R', tg.x, tg.y + 4 * Math.sin(t * 20) * seg(t, 3.0, 3.1) * (1 - seg(t, 3.6, 3.7))) : 8 });
      const h = hp(b, S, 'R', 26);
      tis0.setAttribute('opacity', t < 2.4 ? 1 : 0);
      tf(tis, h.x - 6, h.y - 2, 0, t > 2.4 ? 1 : 0.001);
      // 鼻水：のびる → くしゃみで消えず → 拭いたら消える
      const L = t < 2.9 ? easeIn(seg(t, 0.2, 1.0)) * 0.6 + 0.4 * seg(t, 1.8, 2.6) : 0;
      tf(drip, n.x, n.y + 2, 0, Math.max(0.001, 0.4 + L), Math.max(0.001, 0.4 + L * 1.6));
      drip.setAttribute('opacity', t < 2.9 ? 1 : 0);
      ring.set(seg(t, 0.2, 0.6) * (1 - seg(t, 1.2, 1.4)), n.x, n.y + 4, 20, t);
    }
  };
}
