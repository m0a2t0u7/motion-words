// do：夕食の皿を脇へよけ、鉛筆を持ってノートに宿題を書いていく。時計は夜の時刻（例文 I do my homework after dinner.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, held, reach } from './dig.js';
import { P, blinkAt, clock } from './run-after.js';
import { roomBg } from './look-over.js';
import { desk } from './get-on-with.js';
import { notebook, pencil } from './be.js';

// 食べ終わった皿（原点＝皿の底）
export function emptyPlate(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, g);
  k.el('ellipse', { cx: 0, cy: -1, rx: 13, ry: 3, fill: '#F4EEE6' }, g);
  [[-6, -1], [3, 0], [7, -2]].forEach(([x, y]) => k.el('circle', { cx: x, cy: y, r: 1.4, fill: '#D9A86C' }, g));
  k.el('path', { d: 'M -18 -3 L 14 -6', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '夕食のあと'], [1.3, 'ノートを開く'], [2.2, '宿題をする']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240, 'evening');
  const ck = clock(k, 300, 66, 22);
  el('rect', { x: 240, y: 112, width: 120, height: 5, rx: 2, fill: pal.woodDark });
  [[250, pal.blue], [264, pal.coral], [278, pal.yellow]].forEach(([x, c]) => el('rect', { x, y: 88, width: 11, height: 24, rx: 2, fill: c }));
  const S = 1.2;
  const me = k.buddy({ x: 196, y: FY, scale: S });
  const top = desk(k, 110, 270, FY);
  const nb = notebook(k, 238, top - 4); tf(nb.g, 238, top - 4, 0, 0.75);
  const plate = emptyPlate(k);
  const pen = pencil(k);
  return {
    update(t) {
      ck.set(7, lerp(30, 50, seg(t, 0, 4.2)));
      // 右手：皿をつかんで奥へよける（0.3-1.2）→ 鉛筆を取る（1.3-1.8）→ 書く（2.0-）
      const toP = easeInOut(seg(t, 0.3, 0.7)), push = easeInOut(seg(t, 0.75, 1.25)), back = easeInOut(seg(t, 1.3, 1.8));
      const px = lerp(246, 286, push);
      let tx, ty;
      if (t < 1.3) { tx = lerp(220, px - 14, toP); ty = lerp(top + 6, top - 4, toP); }
      else { const w = t > 2.0 ? Math.sin((t - 2.0) * 13) : 0; const row = seg(t, 2.0, 4.0); tx = lerp(px - 14, lerp(214, 258, (row * 3) % 1) + w * 3, back); ty = lerp(top - 4, top - 10 + Math.floor(row * 3 * 0.999) * 3, back); }
      P(me, { lean: 8 + 6 * hump(push), look: 0.5, mood: t > 2.2 ? 'flat' : 'smile', blink: blinkAt(t, 0.6), armL: 14, squash: 1 - 0.015 * Math.sin(t * 6) });
      me.pose({ armR: reach(me, S, 'R', tx, ty) });
      tf(plate, px, top - 6);
      const h = hp(me, S, 'R', 30);
      const hasPen = t > 1.7;
      if (hasPen) tf(pen, h.x + 2, h.y - 4, 18); else tf(pen, 222, top - 8, 75);
      nb.write(seg(t, 2.0, 4.0));
    }
  };
}
