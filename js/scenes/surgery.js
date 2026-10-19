// surgery：手術室で、マスクの医師がまめのひざを手術し、包帯を巻いて終わる（例文 He had surgery on his knee last year.）
// 医療系の共有ヘルパーも書き出す（doctor：白衣・マスク・帽子 / lie：寝かせる・起こす / medRoom）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { top } from './shirt.js';
import { reach, hp } from './dig.js';

// 人物を医師・歯科医にする（白衣、mask で口元マスク、cap で帽子）
export function doctor(k, b, { mask = false, cap = false, coat = '#FFFFFF' } = {}) {
  const { el } = k;
  top(k, b, 'coat', coat, '#C3CCD8', { sleeve: '#EEF2F6' });
  const fg = [...b.body.children].find((n) => n.querySelector && n.querySelector('ellipse[rx="3.6"]'));
  if (mask) el('rect', { x: -15, y: -50, width: 30, height: 14, rx: 6, fill: '#BFE3EE', stroke: '#8FC4D6', 'stroke-width': 1.5 }, fg);
  if (cap) el('path', { d: 'M -25 -66 Q -24 -86 0 -86 Q 24 -86 25 -66 Z', fill: '#7FC4D9' }, b.body);
}
// 寝ている人物。pivot（腰）を中心に rot 度回す（-90＝あお向けで頭が左、0＝立つ/座る）
export function lie(k, opt = {}) {
  const o = k.g({}), inner = k.g({}, o);
  const b = k.buddy({ parent: inner, x: 0, y: 12, ...opt });
  b.g.children[0].setAttribute('opacity', 0);
  return { b, g: o, set(x, y, rot) { k.tf(o, x, y, rot); } };
}
// 病院の部屋（薄い緑の壁・腰板）
export function medRoom(k, FY = 236) {
  const { el } = k;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#E6F3EF' });
  el('rect', { x: 0, y: FY - 44, width: 400, height: 44, fill: '#D3E9E2' });
  el('rect', { x: 0, y: FY - 46, width: 400, height: 3, fill: '#fff' });
  return FY;
}

export const meta = { duration: 4.2, beats: [[0, '手術台の上'], [1.0, 'ひざを手術'], [3.0, '手術が終わる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = medRoom(k, 240);
  // 無影灯
  el('line', { x1: 210, y1: 0, x2: 210, y2: 30, stroke: '#9AA4B4', 'stroke-width': 5 });
  const glow = el('path', { d: 'M 176 54 L 120 170 L 300 170 L 244 54 Z', fill: '#FFF7D6', opacity: 0.5 });
  el('path', { d: 'M 170 56 Q 210 22 250 56 Z', fill: '#C9D2DE' });
  el('rect', { x: 170, y: 52, width: 80, height: 6, rx: 3, fill: '#FFF3C4' });
  // 心拍モニター
  el('rect', { x: 18, y: 70, width: 72, height: 52, rx: 6, fill: pal.ink });
  el('rect', { x: 50, y: 122, width: 8, height: FY - 122, fill: '#9AA4B4' });
  const ecg = el('path', { fill: 'none', stroke: pal.green, 'stroke-width': 2 });
  // 医師（台の奥）
  const dr = k.buddy({ x: 330, y: FY, scale: 0.98, facing: -1, color: pal.coral, dark: pal.coralDark });
  doctor(k, dr, { mask: true, cap: true, coat: '#9FD3C7' });
  const tool = el('line', { stroke: '#AEB7C4', 'stroke-width': 3, 'stroke-linecap': 'round' });
  // 手術台と患者
  el('ellipse', { cx: 178, cy: 180, rx: 22, ry: 7, fill: '#fff' });
  const P = lie(k, { scale: 0.96 });
  el('path', { d: 'M 234 142 H 260 V 186 H 234 Z', fill: '#7FB2E0', opacity: 0.95 });
  const band = el('rect', { x: 262, y: 152, width: 13, height: 30, rx: 4, fill: '#fff', stroke: '#D9DFE7', 'stroke-width': 1.5 });
  el('rect', { x: 140, y: 186, width: 148, height: 12, rx: 4, fill: '#C9D2DE' });
  el('rect', { x: 206, y: 198, width: 14, height: FY - 198, fill: '#9AA4B4' });
  el('rect', { x: 180, y: FY - 6, width: 66, height: 6, rx: 3, fill: '#9AA4B4' });
  k.shadow(213, FY + 1, 44, 4);
  return {
    update(t) {
      P.set(264, 168, -90);
      P.b.pose({ blink: 1, mood: 'smile', look: 0 });
      let d = 'M 24 98';
      for (let x = 0; x <= 60; x += 3) { const ph = (x / 60 + t * 0.8) % 1; d += ` L ${24 + x} ${98 - (ph > 0.45 && ph < 0.5 ? 16 : ph > 0.5 && ph < 0.55 ? -8 : 0)}`; }
      k.set(ecg, { d });
      glow.setAttribute('opacity', 0.45 + 0.05 * Math.sin(t * 3));
      const work = easeInOut(seg(t, 0.6, 1.1)) * (1 - easeInOut(seg(t, 3.0, 3.4)));
      const tx = 270 + 4 * Math.sin(seg(t, 1.1, 2.6) * Math.PI * 4), ty = 146;
      dr.pose({ lean: 14 * work, look: 0.8, blink: 0, mood: 'smile', armR: lerp(8, reach(dr, 0.98, 'R', tx, ty), work), armL: 8 });
      const h = hp(dr, 0.98, 'R', 28);
      k.set(tool, { x1: h.x, y1: h.y, x2: h.x + 8, y2: h.y + 10, opacity: work > 0.5 && t < 2.6 ? 1 : 0 });
      const wrap = easeOut(seg(t, 2.6, 3.0));
      k.set(band, { opacity: wrap, height: 30 * Math.max(0.01, wrap), y: 152 + 15 * (1 - wrap) });
      if (t > 3.4) dr.pose({ armR: 150 + 6 * wobble(seg(t, 3.4, 4.2), 2, 3), armL: 8, lean: 0, mood: 'grin' });
    }
  };
}
