// newspaper：朝食のトーストを食べ終え、新聞を手に取って読む（例文 My father reads the newspaper after breakfast.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach, faceAt } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '朝食を食べる'], [1.6, '新聞を取る'], [2.8, '新聞を読む']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.25;
  const FY = roomBg(k, 'home', 240);
  desk(k, 175, 225, 200);
  // 皿とトースト、マグ
  el('ellipse', { cx: 232, cy: 198, rx: 24, ry: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const crumb = el('circle', { cx: 238, cy: 198, r: 1.6, fill: '#C9954F', opacity: 0 });
  const cup = g({}); tf(cup, 345, 200);
  el('rect', { x: -9, y: -16, width: 18, height: 16, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, cup);
  el('path', { d: 'M 9 -12 q 8 2 0 9', fill: 'none', stroke: pal.line, 'stroke-width': 2 }, cup);
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const toast = g({});
  el('rect', { x: -9, y: -9, width: 18, height: 14, rx: 4, fill: '#E6B56A', stroke: '#C9954F', 'stroke-width': 1.5 }, toast);
  // 新聞（原点＝下中央）
  const np = g({});
  el('rect', { x: -20, y: -52, width: 40, height: 54, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, np);
  el('rect', { x: -16, y: -48, width: 32, height: 7, fill: pal.ink }, np);
  el('rect', { x: -16, y: -37, width: 14, height: 12, fill: '#C5CEDB' }, np);
  for (let i = 0; i < 6; i++) el('rect', { x: i % 2 ? 1 : -16 + (i < 2 ? 15 : 0), y: -37 + Math.floor(i / 2) * 5 + (i % 2 ? 0 : 0), width: 15, height: 2.4, fill: '#9AA6B8' }, np);
  for (let i = 0; i < 3; i++) el('rect', { x: -16, y: -22 + i * 5, width: 32, height: 2.4, fill: '#9AA6B8' }, np);
  return {
    update(t) {
      const eat = seg(t, 0.2, 1.4), pick = seg(t, 1.6, 2.1), up = easeInOut(seg(t, 2.1, 2.9));
      const o = { lean: 12 * (1 - up) + 4, armL: 10, blink: blinkAt(t), look: 0.5, mood: t < 1.4 ? 'smile' : t < 2.8 ? 'grin' : 'smile' };
      P(b, o);
      // 手の目標：皿→口→新聞（机）→胸の前
      const dish = [224, 190], mouth = [140 + 12 * S, FY - 62 * S], tbl = [222, 192], chest = [140 + 38 * S, FY - 48 * S];
      let tg, a = 1;
      if (t < 0.7) tg = [lerp(200, dish[0], easeOut(seg(t, 0, 0.7))), lerp(165, dish[1], easeOut(seg(t, 0, 0.7)))];
      else if (t < 1.5) { const p = easeInOut(seg(t, 0.7, 1.4)); tg = [lerp(dish[0], mouth[0], p), lerp(dish[1], mouth[1], p)]; }
      else if (t < 2.1) { const p = easeInOut(seg(t, 1.5, 2.0)); tg = [lerp(mouth[0], tbl[0], p), lerp(mouth[1], tbl[1], p)]; }
      else tg = [lerp(tbl[0], chest[0], up), lerp(tbl[1], chest[1], up)];
      P(b, { ...o, armR: reach(b, S, 'R', tg[0], tg[1]) });
      const h = hp(b, S, 'R');
      const hasToast = t > 0.7 && t < 1.35;
      tf(toast, h.x, h.y - 4, 0, hasToast ? 1 : 0);
      toast.setAttribute('opacity', hasToast ? 1 : 0);
      if (t <= 0.7) { tf(toast, 232, 192); toast.setAttribute('opacity', 1); }
      crumb.setAttribute('opacity', t > 1.3 ? 1 : 0);
      const held = pick > 0.5;
      const sy = lerp(0.12, 1, easeOut(seg(t, 2.1, 2.5)));
      if (held) tf(np, h.x + 2, h.y + 2, 0, 1, sy); else tf(np, 222, 198, 0, 1, 0.12);
      faceAt(b, t > 2.8 ? 4 + Math.sin((t - 2.8) * 4) * 2 : 3, t > 2.8 ? 3 : 0);
    }
  };
}
