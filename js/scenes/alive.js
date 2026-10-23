// alive：釣り上げた魚がぴちぴち跳ねて、まだ生きている。まめは驚いて水そうに入れ、魚は元気に泳ぎ出す（例文 The fish is still alive.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, hp, scene, sym } from './confused.js';
const rad = (d) => (d * Math.PI) / 180;

export const meta = { duration: 4.4, beats: [[0, '魚が釣れた'], [1.0, 'ぴちぴち跳ねる'], [3.0, '元気に泳ぐ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const { FY } = scene(k, { FY: 226 });
  el('path', { d: `M 0 ${FY + 20} Q 120 ${FY + 6} 400 ${FY + 24} L 400 300 L 0 300 Z`, fill: '#8FD3F4' });
  // 水そう（ガラス、地面に置いてある）
  const TX = 300, TW = 80, TH = 58;
  k.shadow(TX, FY + 1, 46, 4);
  el('rect', { x: TX - TW / 2, y: FY - TH, width: TW, height: TH, rx: 5, fill: '#DFF3FC', stroke: '#9CC9E2', 'stroke-width': 3 });
  el('rect', { x: TX - TW / 2 + 3, y: FY - TH + 14, width: TW - 6, height: TH - 17, rx: 3, fill: '#8FD3F4', opacity: 0.8 });
  const b = k.buddy({ x: 160, y: FY, scale: S });
  const rod = el('line', { stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const line = el('line', { stroke: pal.sub, 'stroke-width': 1.3 });
  const fish = g({}), body = g({}, fish);
  el('path', { d: 'M -16 0 Q 0 -12 14 0 Q 0 12 -16 0 Z', fill: '#FF9F5A' }, body);
  el('path', { d: 'M 12 0 L 22 -8 L 22 8 Z', fill: '#F07F3A' }, body);
  el('circle', { cx: -9, cy: -2, r: 2, fill: pal.ink }, body);
  const fr = el('rect', { x: TX - TW / 2 + 3, y: FY - TH, width: TW - 6, height: TH }, k.defs);
  const drops = [0, 1, 2, 3].map(() => el('circle', { r: 2.6, fill: pal.water }));
  const bubbles = [0, 1, 2].map(() => el('circle', { r: 2.5, fill: 'none', stroke: '#fff', 'stroke-width': 1.4 }));
  const wow = sym(k, '!', pal.coralDark, 24);
  return {
    update(t) {
      const swing = easeInOut(seg(t, 1.8, 2.8)), inT = t > 2.8;
      const ang = lerp(40, 70, swing);
      P(b, { x: 160, armR: lerp(100, 120, swing), armL: lerp(-20, 30, seg(t, 2.8, 3.2)), lean: lerp(-4, 4, swing), mood: t > 0.9 && t < 2.8 ? 'open' : 'grin', look: 0.7, blink: blinkAt(t) });
      const h = hp(b, S, 'R'), L = 92;
      const tip = { x: h.x + L * Math.sin(rad(ang)), y: h.y - L * Math.cos(rad(ang)) };
      k.set(rod, { x1: h.x - 8 * Math.sin(rad(ang)), y1: h.y + 8 * Math.cos(rad(ang)), x2: tip.x, y2: tip.y });
      const flap = Math.sin(t * 26) * 40 * (t > 0.6 && !inT ? 1 : 0);
      const hop = Math.abs(Math.sin(t * 13)) * 8 * seg(t, 0.6, 0.9) * (inT ? 0 : 1);
      if (!inT) {
        const fy = tip.y + 46 - hop;
        k.set(line, { x1: tip.x, y1: tip.y, x2: tip.x, y2: fy - 8, opacity: 1 });
        tf(fish, tip.x, fy + 8, 0, 1); tf(body, 0, 0, 90 + flap, 1);
        fish.removeAttribute('clip-path');
      } else {
        // 水そうの中を左右に泳ぐ
        const q = t - 2.8, sx = Math.cos(q * 2.4);
        k.set(line, { opacity: 0 });
        const fx = TX + Math.sin(q * 2.4) * 24, fy = FY - 26 + Math.sin(q * 5) * 4 - 30 * (1 - easeOut(seg(t, 2.8, 3.1)));
        tf(fish, fx, fy, 0, 0.8); tf(body, 0, 0, Math.sin(q * 12) * 8, sx > 0 ? -1 : 1, 1);
      }
      drops.forEach((d, i) => { const q = ((t * 1.6) + i * 0.25) % 1, on = t > 0.6 && t < 2.8; const f = { x: tip.x, y: tip.y + 54 };
        k.set(d, { cx: f.x + (i - 1.5) * 14 * q, cy: f.y - 18 * hump(q) + 10 * q, opacity: on ? 1 - q : 0 }); });
      bubbles.forEach((c, i) => { const q = ((t * 0.8) + i / 3) % 1; k.set(c, { cx: TX - 14 + i * 14, cy: FY - 8 - 34 * q, opacity: inT ? 1 - q : 0 }); });
      wow(seg(t, 0.8, 1.1) * (1 - seg(t, 2.6, 2.8)), 140, FY - 120);
      void fr;
    }
  };
}
