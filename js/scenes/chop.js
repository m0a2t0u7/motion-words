// chop：彼女が左手で玉ねぎを押さえ、包丁でトントンと細かく刻んでいく（例文 She chopped the onions into small pieces.）
import { seg, lerp, easeInOut } from '../ease.js';
import { hp, frontL, table } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '玉ねぎ'], [1.4, 'トントン刻む'], [3.8, '細かくなった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const S = 1.2;
  table(k, 60, 'indoor');
  const b = k.buddy({ x: 84, y: 236, scale: S, color: pal.coral, dark: pal.coralDark });
  const L = frontL(b, S);
  b.armL.a.setAttribute('display', 'none'); b.armR.a.setAttribute('display', 'none');
  const TOP = 180, KX = 172, OW = 46;
  // まな板
  el('rect', { x: 130, y: TOP - 2, width: 170, height: 14, rx: 5, fill: '#E9C58F' });
  el('rect', { x: 130, y: TOP - 2, width: 170, height: 3, rx: 2, fill: '#fff', opacity: 0.5 });
  // 玉ねぎ：残りの部分だけ見せる（刻まれた分だけ左手で押されて左へ詰める）
  let rect;
  const clipId = k.clip((c) => { rect = el('rect', { x: KX, y: TOP - 50, width: OW, height: 50 }, c); });
  const on = g({}); on.setAttribute('clip-path', clipId);
  const cx = KX + OW / 2;
  el('ellipse', { cx, cy: TOP - 20, rx: OW / 2, ry: 21, fill: '#F0D9E6' }, on);
  el('ellipse', { cx, cy: TOP - 20, rx: 16, ry: 14, fill: 'none', stroke: '#fff', 'stroke-width': 2.5 }, on);
  el('ellipse', { cx, cy: TOP - 20, rx: 8, ry: 7, fill: 'none', stroke: '#fff', 'stroke-width': 2.5 }, on);
  el('path', { d: `M ${cx - 2} ${TOP - 41} q 2 -8 6 -10`, stroke: '#C9A577', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, on);
  const N = 18;
  const bits = Array.from({ length: N }, (_, i) => el('rect', { width: 6, height: 5, rx: 1.4, fill: i % 2 ? '#F0D9E6' : '#E3C2D6' }));
  const la = el('line', { stroke: pal.coralDark, 'stroke-width': 9 * S, 'stroke-linecap': 'round' });
  const lh = el('circle', { r: 6.5 * S, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2.5 * S });
  const ra = el('line', { stroke: pal.coralDark, 'stroke-width': 9 * S, 'stroke-linecap': 'round' });
  const kn = g({});
  el('rect', { x: -3, y: -15, width: 6, height: 15, rx: 2.5, fill: pal.woodDark }, kn);
  el('path', { d: 'M -3 0 L 5 0 L 5 24 Q 0 26 -3 24 Z', fill: '#DCE3EC', stroke: '#9AA6B6', 'stroke-width': 1 }, kn);
  const rh = el('circle', { r: 6.5 * S, fill: pal.coral, stroke: pal.coralDark, 'stroke-width': 2.5 * S });
  return {
    update(t) {
      const p = easeInOut(seg(t, 1.2, 3.5)), run = t > 1.1 && t < 3.6 ? 1 : 0;
      const ch = run ? (Math.sin((t - 1.1) * 12) + 1) / 2 : 1;   // 1=振り上げ 0=切る
      b.pose({ armR: 100, armL: 8, lean: 6 + 5 * (1 - ch), look: 0.6, mood: t > 3.6 ? 'grin' : 'smile' });
      L.set(88);
      const w = OW * (1 - p);
      k.set(rect, { x: KX + OW - w, width: Math.max(0.01, w) });
      tf(on, -(OW - w), 0);
      const sh = L.pos(0), tx = KX + w * 0.55 + 6, ty = TOP - 38;
      k.set(la, { x1: sh.x, y1: sh.y, x2: tx, y2: ty }); k.set(lh, { cx: tx, cy: ty });
      const s2 = hp(b, S, 'R', 0), kx = KX - 2, ky = lerp(150, 132, ch);
      k.set(ra, { x1: s2.x, y1: s2.y, x2: kx, y2: ky }); k.set(rh, { cx: kx, cy: ky });
      tf(kn, kx, ky, 0, 1.15);
      kn.parentNode.appendChild(rh);
      bits.forEach((e, i) => {
        const col = i % 9, row = Math.floor(i / 9);
        k.set(e, { x: KX - 56 + col * 6.2 + (i % 3), y: TOP - 5 - row * 5 + (col % 2), opacity: p * N > i ? 1 : 0 });
      });
    }
  };
}
