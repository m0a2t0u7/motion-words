// lay out：工具箱から工具を1本ずつ取り出し、テーブルに見やすく並べる（例文 He laid out his tools on the table.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';
import { tableTop } from './spread-out.js';
import { path, walk } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '工具箱'], [1.6, '1本ずつ並べる'], [3.8, '並べ終えた']] };

function tool(k, kind) {
  const { el, g, pal } = k;
  const n = g({});
  if (kind === 0) { el('rect', { x: -3, y: -16, width: 6, height: 26, rx: 3, fill: pal.red }, n); el('rect', { x: -1.5, y: -30, width: 3, height: 15, fill: '#B9C2CF' }, n); }
  else if (kind === 1) { el('rect', { x: -3, y: -12, width: 6, height: 26, rx: 2, fill: pal.woodDark }, n); el('rect', { x: -10, y: -20, width: 20, height: 9, rx: 2, fill: '#7D8798' }, n); }
  else { el('path', { d: 'M -2.5 14 L -2.5 -10 Q -11 -14 -8 -22 L -4 -18 L 4 -18 L 8 -22 Q 11 -14 2.5 -10 L 2.5 14 Z', fill: '#9AA4B5' }, n); }
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 30, y: 46, width: 120, height: 8, fill: pal.woodDark });
  [[40, 6], [62, 4], [96, 8]].forEach(([x, w]) => el('rect', { x, y: 22, width: 14 + w, height: 24, rx: 2, fill: '#C9D3E0' }));
  const S = 1;
  const b = k.buddy({ x: 250, y: FY, scale: S });
  const T = tableTop(k, 40, 380, 186, 22);
  // 工具箱（動かない）
  el('rect', { x: 300, y: 168, width: 54, height: 30, rx: 4, fill: pal.red }, T.items);
  el('rect', { x: 300, y: 168, width: 54, height: 7, rx: 3, fill: '#D64F43' }, T.items);
  el('path', { d: 'M 316 168 L 316 160 L 338 160 L 338 168', stroke: '#555F75', 'stroke-width': 3, fill: 'none' }, T.items);
  const tools = [0, 1, 2].map((i) => tool(k, i));
  const box = { x: 327, y: 172 };
  const slots = [{ x: 150, y: 196 }, { x: 178, y: 196 }, { x: 206, y: 196 }];
  // 手を伸ばす相手：取る→置く。人は置く位置の左50pxまで歩く
  const C = [0.2, 1.5, 2.8];
  const xf = path([[0, 250], [0.55, 277], [0.95, 277], [1.35, 100], [1.55, 100], [1.9, 277], [2.25, 277], [2.65, 128], [2.85, 128], [3.2, 277], [3.55, 277], [3.95, 156]]);
  return {
    update(t) {
      let target = null, held = -1;
      C.forEach((c, i) => { if (t > c + 0.35 && t < c + 1.3) held = i; });
      const p = walk(b, xf, t, { look: 0.3, mood: t > 4.0 ? 'grin' : 'flat' });
      tools.forEach((n, i) => {
        const c = C[i];
        if (t < c + 0.35) { tf(n, box.x - 12 + i * 12, box.y - 4, -8 + i * 8, 0.9); n.setAttribute('opacity', 1); }
        else if (held === i) { const h = hp(b, S, 'R'); tf(n, h.x + 2, h.y - 6, 70, 0.9); }
        else { tf(n, slots[i].x, slots[i].y, 0, 0.9 - 0.05 * hump(seg(t, c + 1.3, c + 1.45))); n.setAttribute('opacity', 1); }
      });
      // 腕：箱に手を入れる／置く場所へ下ろす
      const near = (x0) => Math.max(0, 1 - Math.abs(p.x - x0) / 30);
      const kBox = near(277) * (p.m < 0.3 ? 1 : 0), kSlot = (p.m < 0.3 && p.x < 200) ? 1 : 0;
      if (kBox) target = { x: box.x, y: box.y };
      if (kSlot) target = { x: p.x + 50, y: 192 };
      if (target) { const a = reach(b, S, 'R', target.x, target.y); b.pose({ armR: lerp(b.state.armR, a, 0.9), lean: 4 }); }
      else b.pose({ armR: held >= 0 ? 60 : b.state.armR });
    }
  };
}
