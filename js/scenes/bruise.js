// bruise：歩いていてテーブルの角に脚をぶつける→脚に大きな青あざができる（拡大の丸窓でも見せる）（例文 I got a big bruise on my leg.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, gait } from './hospital.js';
import { roomBg } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, '歩いている'], [1.2, '脚をぶつけた'], [2.8, '大きなあざ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 低いテーブル（動かない）
  el('rect', { x: 196, y: 204, width: 110, height: 10, rx: 3, fill: pal.woodDark });
  el('rect', { x: 200, y: 214, width: 8, height: FY - 214, fill: pal.woodDark });
  el('rect', { x: 294, y: 214, width: 8, height: FY - 214, fill: pal.woodDark });
  k.shadow(250, FY + 1, 60, 3);
  el('rect', { x: 236, y: 190, width: 26, height: 14, rx: 3, fill: pal.blue });
  const S = 1.15;
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const legF = b.g.children[1].children[1];
  const bz = el('ellipse', { cx: 0, cy: 8, rx: 4.2, ry: 5, fill: '#7E6BC4' }, legF);
  const hit = g({}); el('path', { d: 'M 0 -10 L 3 -3 L 10 -2 L 4 2 L 7 10 L 0 5 L -7 10 L -4 2 L -10 -2 L -3 -3 Z', fill: pal.yellow, stroke: pal.red, 'stroke-width': 2 }, hit);
  // 拡大の丸窓（脚のアップ）
  const zoom = g({});
  el('circle', { r: 46, fill: '#FBFAF7', stroke: pal.ink, 'stroke-width': 3 }, zoom);
  const zc = k.clip((c) => el('circle', { r: 44 }, c));
  const zi = g({ 'clip-path': zc }, zoom);
  el('rect', { x: -20, y: -60, width: 40, height: 120, rx: 18, fill: pal.mintDark }, zi);
  el('rect', { x: -12, y: -60, width: 8, height: 120, fill: '#fff', opacity: 0.15 }, zi);
  const bigB = el('ellipse', { cx: 2, cy: 2, rx: 15, ry: 18, fill: '#6D5BB8' }, zi);
  const bigB2 = el('ellipse', { cx: 0, cy: 0, rx: 8, ry: 10, fill: '#4F3F96' }, zi);
  const link = el('line', { stroke: pal.ink, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
  const xf = (t) => lerp(70, 166, easeInOut(seg(t, 0.1, 1.15)));
  return {
    update(t) {
      const p = gait(xf, t, 70);
      const bump = seg(t, 1.1, 1.25), rec = wobble(seg(t, 1.15, 1.9), 2, 4);
      const hop = t > 1.3 && t < 2.4 ? Math.abs(Math.sin((t - 1.3) * 9)) * 8 * (1 - seg(t, 1.9, 2.4)) : 0;
      const look = easeOut(seg(t, 2.2, 2.7));
      P(b, { x: p.x - 8 * Math.max(0, rec) * (t > 1.15 ? 1 : 0), walk: p.walk, armL: p.armL, armR: p.armR, lean: p.lean + lerp(0, 22, look), lift: hop,
        mood: t > 1.15 ? (t > 2.6 ? 'sad' : 'open') : 'smile', blink: t > 1.15 && t < 1.8 ? 0.8 : 0, look: lerp(0.5, 0.1, look), squash: 1 - 0.06 * hump(seg(t, 1.15, 1.4)) });
      legF.setAttribute('transform', `translate(12 ${(-14 - hop).toFixed(1)}) rotate(${(t > 1.15 && t < 2.3 ? -24 * (1 - seg(t, 2.0, 2.3)) : (-Math.sin(b.state.walk) * 26)).toFixed(1)})`);
      tf(hit, 208, 214, t * 40, Math.max(0.001, hump(seg(t, 1.1, 1.6)) * 1.2));
      const grow = easeOut(seg(t, 2.1, 3.2));
      tf(bz, 0, 0, 0, Math.max(0.001, grow), Math.max(0.001, grow));
      bz.setAttribute('transform', `translate(0 ${(8 - 8 * grow).toFixed(2)}) scale(${Math.max(0.001, grow).toFixed(3)})`);
      // 拡大窓
      const z = easeOut(seg(t, 2.6, 3.1));
      tf(zoom, 300, 104, 0, Math.max(0.001, z));
      bigB.setAttribute('transform', `scale(${(0.6 + 0.4 * grow).toFixed(3)})`);
      bigB2.setAttribute('opacity', 0.8 * grow);
      const lx = b.state.x + 12 * S, ly = FY - 6 * S;
      k.set(link, { x1: lx, y1: ly - 4, x2: 300 - 30, y2: 104 + 34, opacity: z });
    }
  };
}
