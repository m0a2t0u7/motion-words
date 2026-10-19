// chair：「この椅子にどうぞ」と手で示され、ひじかけ椅子に腰をおろす（例文 Please sit in this chair.）
// 共通ヘルパー：armChair（正面から見たひじかけ椅子）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { gait } from './weigh.js';
import { P, blinkAt } from './run-after.js';
import { homeBg } from './furniture.js';

// 正面のひじかけ椅子（中心 x、座面 y=SY）。back は人物より奥、arms() は人物の手前に描く
export function armChair(k, x, SY, FY, col = '#9C86E8', dark = '#7C64CF') {
  const { el, pal } = k;
  k.shadow(x, FY + 1, 52, 5);
  el('rect', { x: x - 40, y: SY - 66, width: 80, height: 74, rx: 18, fill: dark });
  el('rect', { x: x - 32, y: SY - 58, width: 64, height: 58, rx: 14, fill: col });
  el('rect', { x: x - 38, y: SY - 4, width: 76, height: 22, rx: 8, fill: col });
  el('rect', { x: x - 38, y: SY + 14, width: 76, height: 6, rx: 3, fill: dark });
  [x - 40, x + 32].forEach((lx) => el('rect', { x: lx, y: SY + 20, width: 8, height: FY - SY - 20, rx: 2, fill: pal.woodDark }));
  return {
    arms() {
      [-1, 1].forEach((d) => {
        el('rect', { x: x + d * 44 - 11, y: SY - 30, width: 22, height: 48, rx: 10, fill: dark });
        el('rect', { x: x + d * 44 - 11, y: SY - 30, width: 22, height: 10, rx: 5, fill: col });
      });
    }
  };
}

export const meta = { duration: 4.2, beats: [[0, 'どうぞ'], [1.4, '椅子へ'], [3.0, '座った']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.82;
  const FY = homeBg(k, { winX: 40, winW: 80 });
  el('rect', { x: 210, y: 50, width: 56, height: 44, rx: 3, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('path', { d: 'M 214 90 L 230 70 L 242 82 L 252 66 L 262 90 Z', fill: '#A9DDB5' });
  const CX = 236, SY = 196;
  const ch = armChair(k, CX, SY, FY);
  const host = k.buddy({ x: 345, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const guest = k.buddy({ x: 60, y: FY, scale: S });
  ch.arms();
  const xf = (t) => lerp(60, 160, easeInOut(seg(t, 0.9, 1.9)));
  return {
    update(t) {
      const w = gait(xf, t, 60, 16, 0.12);
      const s = easeInOut(seg(t, 2.1, 2.8));
      const hop = 16 * hump(seg(t, 2.1, 2.8));
      const land = wobble(seg(t, 2.8, 3.5), 2, 5);
      // 歩いてきて、椅子の前でくるりと前を向き、後ろへ腰をおろす
      const x = t < 2.1 ? w.x : lerp(160, CX, s);
      const y = lerp(FY, SY + 7, s);
      P(guest, { x, y, walk: w.walk * (1 - s), armL: lerp(w.armL, 30, s), armR: lerp(w.armR, 30, s), lean: w.lean * (1 - s), lift: hop, squash: 1 - 0.06 * land - 0.04 * s, look: lerp(0.5, 0.1, s), mood: s > 0.7 ? 'grin' : 'smile', blink: blinkAt(t) });
      const pt = easeOut(seg(t, 0.2, 0.7)) * (1 - easeInOut(seg(t, 3.2, 3.8)));
      P(host, { x: 345, facing: -1, armR: 8 + 80 * pt + 5 * Math.sin(t * 5) * pt, lean: 5 * pt, look: 0.6, mood: t < 1.2 && Math.sin(t * 20) > 0 ? 'open' : 'grin', blink: blinkAt(t, 1.2) });
    }
  };
}
