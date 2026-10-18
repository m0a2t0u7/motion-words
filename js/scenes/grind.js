// grind：朝、窓から日が差す台所で、手動ミルのハンドルを回してコーヒー豆を粉にする（例文 I grind coffee beans every morning.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { hp, table } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '豆を入れた'], [1.4, 'ハンドルを回す'], [3.9, '粉になった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const S = 1.2;
  table(k, 60, 'indoor');
  // 朝の窓：日の出
  el('rect', { x: 250, y: 30, width: 110, height: 86, rx: 8, fill: k.gradient([[0, '#FFD9A8'], [1, '#FFF3D6']]), stroke: '#fff', 'stroke-width': 5 });
  const sun = el('circle', { cx: 305, cy: 108, r: 18, fill: pal.yellow });
  el('rect', { x: 245, y: 108, width: 120, height: 14, fill: '#EEF1F5' });
  el('line', { x1: 305, y1: 30, x2: 305, y2: 116, stroke: '#fff', 'stroke-width': 4 });
  const b = k.buddy({ x: 92, y: 236, scale: S });
  b.armR.a.setAttribute('display', 'none');
  const TOP = 180, GX = 172;
  // マグ
  const cup = g({}); tf(cup, 280, TOP);
  el('rect', { x: -13, y: -22, width: 26, height: 22, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cup);
  el('path', { d: 'M 13 -16 q 10 2 0 10', fill: 'none', stroke: pal.line, 'stroke-width': 3 }, cup);
  el('rect', { x: -10, y: -20, width: 20, height: 4, rx: 2, fill: pal.coffee }, cup);
  const steam = [0, 1].map((i) => el('path', { d: 'M 0 0 q 5 -6 0 -12 q -5 -6 0 -12', fill: 'none', stroke: '#CFD6DF', 'stroke-width': 2.5, 'stroke-linecap': 'round', opacity: 0 }, cup));
  // ミル本体
  el('rect', { x: GX - 26, y: TOP - 46, width: 52, height: 46, rx: 6, fill: pal.woodDark });
  el('rect', { x: GX - 26, y: TOP - 46, width: 52, height: 5, rx: 2, fill: pal.wood });
  el('rect', { x: GX - 8, y: TOP - 18, width: 30, height: 14, rx: 3, fill: '#33271E' });
  const dust = el('rect', { x: GX - 6, y: TOP - 6, width: 26, height: 0, rx: 2, fill: pal.coffee });
  // ホッパー（豆）
  el('path', { d: `M ${GX - 20} ${TOP - 46} L ${GX - 24} ${TOP - 70} L ${GX + 24} ${TOP - 70} L ${GX + 20} ${TOP - 46} Z`, fill: '#E6F2F8', opacity: 0.85, stroke: '#fff', 'stroke-width': 2 });
  let lvl;
  const cid = k.clip((c) => { lvl = el('rect', { x: GX - 24, y: TOP - 70, width: 48, height: 24 }, c); });
  const beans = g({}); beans.setAttribute('clip-path', cid);
  for (let i = 0; i < 9; i++) {
    const bx = GX - 12 + (i % 3) * 12 + (Math.floor(i / 3) % 2) * 3, by = TOP - 51 - Math.floor(i / 3) * 6;
    el('ellipse', { cx: bx, cy: by, rx: 5.5, ry: 3.6, fill: pal.coffee, transform: `rotate(${(i * 47) % 70 - 30} ${bx} ${by})` }, beans);
  }
  // ハンドル（正面で回る）
  const PX = GX - 8, PY = TOP - 28;
  const rod = el('line', { x1: PX, y1: PY, x2: PX, y2: PY, stroke: '#9AA6B6', 'stroke-width': 4, 'stroke-linecap': 'round' });
  el('circle', { cx: PX, cy: PY, r: 5, fill: '#9AA6B6' });
  const ra = el('line', { stroke: pal.mintDark, 'stroke-width': 9 * S, 'stroke-linecap': 'round' });
  const knob = el('circle', { r: 6, fill: pal.red });
  const rh = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 * S });
  return {
    update(t) {
      const on = t > 1.2 && t < 3.8 ? 1 : 0, th = Math.min(Math.max(t - 1.2, 0), 2.6) * 9.5;
      const prog = easeInOut(seg(t, 1.2, 3.8));
      b.pose({ armR: 100, armL: 8, lean: 8, look: 0.6, mood: t > 3.9 ? 'grin' : 'smile', squash: 1 });
      const kx = PX + 15 * Math.cos(th), ky = PY + 15 * Math.sin(th);
      k.set(rod, { x2: kx, y2: ky }); k.set(knob, { cx: kx, cy: ky });
      const s2 = hp(b, S, 'R', 0), hx = kx + 2, hy = ky;
      k.set(ra, { x1: s2.x, y1: s2.y, x2: hx, y2: hy }); k.set(rh, { cx: hx, cy: hy });
      rh.parentNode.appendChild(rh);
      k.set(lvl, { y: TOP - 70 + 24 * prog, height: 24 });
      k.set(dust, { y: TOP - 6 - 10 * prog, height: 10 * prog });
      tf(beans, 0, 0);
      k.set(sun, { cy: 108 - 36 * easeInOut(seg(t, 0, 4.4)) });
      steam.forEach((s, i) => { s.setAttribute('opacity', seg(t, 3.8, 4.3) * 0.8); tf(s, -4 + i * 8, -22 - 2 * Math.sin(t * 3 + i)); });
    }
  };
}
