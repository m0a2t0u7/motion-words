// laptop：ノートパソコンを持って歩き、カフェのテラス席に置いて開く（例文 I take my laptop to the cafe.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, tree } from './run-after.js';
import { hp, reach } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'PCを持って歩く'], [2.4, '席に置く'], [3.4, '開いて使う']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.15;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // カフェの店先
  el('rect', { x: 270, y: 80, width: 130, height: FY - 80, fill: '#F2DDBB' });
  el('rect', { x: 340, y: 128, width: 44, height: 108, rx: 4, fill: pal.woodDark });
  el('rect', { x: 284, y: 120, width: 46, height: 46, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  for (let i = 0; i < 7; i++) el('path', { d: `M ${266 + i * 20} 90 L ${286 + i * 20} 90 L ${290 + i * 20} 114 L ${262 + i * 20} 114 Z`, fill: i % 2 ? '#fff' : pal.coral });
  el('rect', { x: 296, y: 56, width: 38, height: 24, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('path', { d: 'M 307 62 h 14 v 8 q 0 5 -7 5 q -7 0 -7 -5 Z', fill: pal.coffee });
  tree(k, 40, FY, 0.9);
  // テーブル
  k.shadow(238, FY, 30, 4);
  el('line', { x1: 238, y1: 196, x2: 238, y2: FY, stroke: pal.woodDark, 'stroke-width': 5 });
  el('ellipse', { cx: 238, cy: 196, rx: 40, ry: 7, fill: pal.wood });
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const lap = g({});
  el('rect', { x: -17, y: -4, width: 34, height: 4, rx: 1.5, fill: '#C5CEDB' }, lap);
  const lid = g({}, lap);
  el('rect', { x: -15, y: -22, width: 30, height: 22, rx: 2, fill: '#E7ECF3', stroke: '#C5CEDB', 'stroke-width': 1.5 }, lid);
  const scr = el('rect', { x: -12, y: -19, width: 24, height: 16, rx: 1, fill: '#BFE3F5' }, lid);
  const xf = (t) => lerp(40, 172, easeInOut(seg(t, 0.1, 2.4)));
  return {
    update(t) {
      const w = walkTo(xf, t, 40), put = easeInOut(seg(t, 2.4, 3.0)), op = easeInOut(seg(t, 3.4, 4.1)), still = 1 - seg(t, 2.4, 2.6) * 0;
      const o = { x: w.x, walk: w.walk, armL: w.armL, lean: w.lean, facing: 1, look: 0.4, blink: blinkAt(t), mood: t < 3.4 ? 'smile' : 'grin' };
      P(b, { ...o, armR: 55 });
      let ar = 55;
      if (t >= 2.4) {
        const ty = t < 3.2 ? lerp(180, 192, put) : 192 - 24 * op;
        const a = reach(b, S, 'R', 236, ty);
        ar = t < 3.2 ? lerp(55, a, put) : a;
        if (t > 3.8) ar = lerp(a, 55, seg(t, 3.8, 4.4));
      }
      P(b, { ...o, armR: ar });
      const h = hp(b, S, 'R');
      if (t < 3.2) tf(lap, h.x, h.y + 3); else tf(lap, 238, 192);
      tf(lid, 0, -4, 0, 1, Math.max(0.05, op));
      k.set(scr, { fill: op > 0.5 ? '#BFE3F5' : '#9AA6B8' });
    }
  };
}
