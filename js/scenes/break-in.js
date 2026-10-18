// break in：夜、何者かが家の窓を割って中へ入り、テレビを持ち出して逃げる（例文 Someone broke in and stole the TV last night.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble } from '../ease.js';
import { gait } from './weigh.js';
import { held } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '夜の家'], [1.2, '窓を割って侵入'], [3.2, 'テレビを盗んだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 240;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#2E3A5C'], [1, '#55628A']]) });
  el('circle', { cx: 340, cy: 50, r: 16, fill: '#FFF3C4' });
  el('circle', { cx: 334, cy: 46, r: 14, fill: '#3A4770' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#6F7B99' });
  // 家
  el('rect', { x: 120, y: 110, width: 200, height: FY - 110, fill: '#C9B7A8' });
  el('path', { d: 'M 108 114 L 220 50 L 332 114 Z', fill: '#8A5A4C' });
  el('rect', { x: 268, y: 160, width: 40, height: 80, rx: 2, fill: '#7A5A44' });
  // 窓（中のテレビが見える）
  const W = { x: 150, y: 140, w: 84, h: 60 };
  el('rect', { x: W.x, y: W.y, width: W.w, height: W.h, fill: '#3B4566' });
  const tv = g({});
  el('rect', { x: -22, y: -16, width: 44, height: 30, rx: 3, fill: '#2A3242' }, tv);
  el('rect', { x: -18, y: -12, width: 36, height: 22, rx: 2, fill: '#5C7BAA' }, tv);
  el('rect', { x: -4, y: 14, width: 8, height: 6, fill: '#2A3242' }, tv);
  const tvIn = g({}); tvIn.appendChild(tv.cloneNode(true)); tf(tvIn, 192, 178);
  tv.remove();
  const glass = el('rect', { x: W.x, y: W.y, width: W.w, height: W.h, fill: '#9FC3E6', opacity: 0.45 });
  const frame = el('rect', { x: W.x, y: W.y, width: W.w, height: W.h, fill: 'none', stroke: '#F4ECE2', 'stroke-width': 5 });
  el('rect', { x: W.x - 6, y: W.y + W.h, width: W.w + 12, height: 6, fill: '#F4ECE2' });
  const shards = [[-30, -12], [-14, 10], [6, -18], [22, 8], [-4, 2], [30, -4]].map(([dx, dy]) => ({ dx, dy, n: el('path', { d: 'M 0 -6 L 6 4 L -5 3 Z', fill: '#BFD9F2' }) }));
  const P = k.g({});
  const B = k.buddy({ parent: P, x: 60, y: FY, scale: 0.8, color: '#6C7488', dark: '#4E5568' });
  const tvC = g({}); tvC.appendChild(tvIn.firstChild.cloneNode(true));
  const xf = (t) => t < 2.6 ? lerp(40, 168, easeInOut(seg(t, 0.1, 1.0))) : lerp(168, 420, easeIn(seg(t, 2.7, 4.2)));
  return {
    update(t) {
      const p = gait(xf, t, 40, 22, 0.16);
      const hit = seg(t, 1.0, 1.3);
      const climb = seg(t, 1.5, 1.9);
      const inside = t > 1.9 && t < 2.6;
      const out = seg(t, 2.6, 2.8);
      B.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: t > 2.6 ? 150 : t < 1.5 ? lerp(p.armR, 150, easeOut(seg(t, 0.95, 1.12))) - 40 * easeIn(hit) : 150, lean: p.lean + 8 * hump(hit), lift: climb * 40 * (1 - out) , mood: 'flat', look: -0.6 });
      if (t > 2.6) B.pose({ armL: 150, lift: 0 });
      // 家の中にいる間は表示しない
      P.setAttribute('opacity', inside ? 0 : t > 1.5 && t < 1.9 ? 1 - seg(t, 1.75, 1.9) : 1);
      const br = t > 1.2;
      glass.setAttribute('opacity', br ? 0 : 0.45);
      shards.forEach((s, i) => {
        const f = seg(t, 1.2, 1.9);
        tf(s.n, 192 + s.dx * (1 + f * 0.6), 170 + s.dy + easeIn(f) * (FY - 172 - s.dy), f * 300 * (i % 2 ? 1 : -1));
        s.n.setAttribute('opacity', br ? 1 : 0);
      });
      tvIn.setAttribute('opacity', t > 2.3 ? 0 : 1);
      tvC.setAttribute('opacity', t > 2.6 ? 1 : 0);
      if (t > 2.6) tf(tvC, p.x + 4, FY - 112 * 0.8 - 10, 0, 0.9);
    }
  };
}
function hump(p) { return Math.sin(Math.min(1, Math.max(0, p)) * Math.PI); }
