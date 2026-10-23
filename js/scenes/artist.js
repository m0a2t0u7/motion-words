// artist：芸術家のまめがパレットと筆を持ち、玉座の王様の肖像画をキャンバスに描き上げる（例文 The artist painted a portrait of the king.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, held, P, blinkAt, wear, sc } from './member.js';

export const meta = { duration: 4.4, beats: [[0, '王様がすわる'], [0.8, '肖像画を描く'], [3.4, '完成！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F3E9DD' });
  el('path', { d: 'M 250 0 Q 270 80 260 236 L 300 236 L 300 0 Z', fill: '#B8475A', opacity: 0.85 });
  // 玉座と王様
  el('path', { d: `M 290 ${FY} L 290 110 Q 340 86 390 110 L 390 ${FY} Z`, fill: '#C0463B' });
  el('rect', { x: 300, y: 120, width: 80, height: 100, rx: 10, fill: '#E06656' });
  const king = k.buddy({ x: 340, y: FY - 10, scale: 1, facing: -1, ...CO(k) }); wear(k, king, 'crown');
  el('rect', { x: 296, y: FY - 30, width: 88, height: 30, rx: 6, fill: '#B23A30' });
  // イーゼルとキャンバス
  const EX = 190;
  el('line', { x1: EX - 30, y1: FY, x2: EX - 4, y2: 70, stroke: pal.woodDark, 'stroke-width': 5 });
  el('line', { x1: EX + 30, y1: FY, x2: EX + 4, y2: 70, stroke: pal.woodDark, 'stroke-width': 5 });
  el('rect', { x: EX - 44, y: 84, width: 88, height: 100, rx: 3, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('rect', { x: EX - 46, y: 184, width: 92, height: 6, fill: pal.woodDark });
  const por = g({});
  const parts = [
    el('rect', { x: -40, y: -46, width: 80, height: 96, fill: '#F3D9B8' }, por),
    el('rect', { x: -22, y: -12, width: 44, height: 56, rx: 20, fill: pal.coral }, por),
    el('path', { d: 'M -16 -14 L -18 -34 L -8 -24 L 0 -38 L 8 -24 L 18 -34 L 16 -14 Z', fill: pal.yellow }, por),
    el('g', {}, por)
  ];
  el('circle', { cx: -7, cy: 6, r: 2.5, fill: pal.ink }, parts[3]); el('circle', { cx: 7, cy: 6, r: 2.5, fill: pal.ink }, parts[3]); el('path', { d: 'M -5 16 Q 0 21 5 16', stroke: pal.ink, 'stroke-width': 2, fill: 'none' }, parts[3]);
  tf(por, EX, 134);
  const b = k.buddy({ x: 108, y: FY, scale: S, facing: 1 }); wear(k, b, 'beret', '#5B4A55');
  const pal2 = g({}); el('ellipse', { rx: 16, ry: 11, fill: '#E3C49B' }, pal2);
  [[-8, -3, pal.red], [0, -6, pal.blue], [8, -2, pal.yellow], [-3, 4, pal.coral]].forEach(([x, y, c]) => el('circle', { cx: x, cy: y, r: 3, fill: c }, pal2));
  const brush = g({}); el('rect', { x: -1.5, y: -6, width: 3, height: 22, rx: 1.5, fill: pal.woodDark }, brush); el('path', { d: 'M -2.5 16 L 2.5 16 L 0 24 Z', fill: pal.coral }, brush);
  return {
    update(t) {
      const p = seg(t, 0.8, 3.4), n = Math.floor(p * 4);
      parts.forEach((pt, i) => pt.setAttribute('opacity', clamp(p * 4 - i)));
      const q = (p * 4) % 1, st = Math.sin(q * Math.PI * 4);
      const tg = t < 0.8 || t > 3.4 ? { x: EX - 30, y: 200 } : { x: EX - 20 + 30 * q, y: 112 + n * 16 + 8 * st };
      P(b, { lean: 4, look: Math.sin(t * 2.4) > 0.4 ? 0.9 : 0.6, blink: blinkAt(t), mood: t > 3.4 ? 'grin' : 'flat', armL: 70 });
      b.pose({ armR: lerp(b.state.armR, reach(b, S, 'R', tg.x, tg.y), easeInOut(seg(t, 0.3, 0.8)) * (1 - easeInOut(seg(t, 3.4, 3.8)))) });
      held(k, b, S, brush, 'R', 0, 22);
      const hl = hp(b, S, 'L', 28); tf(pal2, hl.x - 4, hl.y, 0, S);
      P(king, { y: FY - 10, look: 0.5, blink: blinkAt(t, 1), mood: t > 3.4 ? 'grin' : 'smile', armR: 30, armL: 30 });
    }
  };
}
