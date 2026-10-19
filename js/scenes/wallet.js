// wallet：お昼のレジで払おうとしてポケットを探るが、財布は家のテーブルの上。払えない（例文 I left my wallet at home, so I couldn't pay for lunch.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, face, counterBg, register, drop } from './bag.js';
import { cloud } from './look-over.js';
import { wallet as walletProp } from './so-far-so-good.js';
import { cue } from './in-common.js';

export function tray(k, parent) {
  const g = k.g({}, parent), { el, pal } = k;
  el('rect', { x: -26, y: -4, width: 52, height: 5, rx: 2, fill: '#B9C3D0' }, g);
  el('ellipse', { cx: -8, cy: -6, rx: 13, ry: 4, fill: '#fff', stroke: pal.line }, g);
  el('path', { d: 'M -18 -8 Q -8 -20 2 -8 Z', fill: '#F2A65A' }, g);
  el('rect', { x: 9, y: -18, width: 10, height: 14, rx: 2, fill: pal.coffee }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'お昼のお会計'], [1.0, '財布がない！'], [2.4, '家に忘れた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236;
  const room = counterBg(k, FY, 300, 170);
  const clerk = k.buddy({ x: 330, y: FY, scale: 1.05, facing: -1, color: pal.coral, dark: pal.coralDark });
  room.front();
  register(k, 368, room.TY);
  const tr = tray(k); tf(tr, 255, room.TY);
  const price = cue(k, '$8', 52, 30, 1, 15);
  const b = k.buddy({ x: 170, y: FY, scale: S });
  const sw = drop(k);
  const th = cloud(k, 100, 70, 1);
  // 雲の中：家のテーブルに置きっぱなしの財布
  el('path', { d: 'M -30 4 L -30 -14 L -12 -28 L 6 -14 L 6 4 Z', fill: '#F4E1C1', stroke: pal.woodDark, 'stroke-width': 2 }, th.g);
  el('rect', { x: 10, y: -2, width: 34, height: 4, rx: 2, fill: pal.wood }, th.g);
  el('rect', { x: 14, y: 2, width: 3, height: 12, fill: pal.woodDark }, th.g);
  el('rect', { x: 37, y: 2, width: 3, height: 12, fill: pal.woodDark }, th.g);
  const wl = walletProp(k, th.g); tf(wl, 27, -10, 0, 0.9);
  return {
    update(t) {
      const pat = seg(t, 0.9, 2.2), patting = t > 0.9 && t < 2.2;
      const ph = Math.sin(pat * Math.PI * 6);
      const sad = easeOut(seg(t, 2.4, 2.9)), shrug = easeOut(seg(t, 3.2, 3.6));
      P(b, {
        x: 170, look: patting ? -0.2 : 0.6, blink: blinkAt(t),
        armR: patting ? 18 + 6 * ph : t < 0.9 ? lerp(8, 20, seg(t, 0.6, 0.9)) : lerp(18, 70, shrug),
        armL: patting ? 18 - 6 * ph : lerp(18, 70, shrug),
        lean: patting ? -3 : 0, squash: 1 - 0.04 * sad,
        mood: t < 0.9 ? 'smile' : t < 2.4 ? 'open' : 'sad'
      });
      face(b, patting ? 0 : 3, patting ? 2 : 0);
      P(clerk, { x: 330, look: 0.4, blink: blinkAt(t, 1), armR: 8 + 12 * hump(seg(t, 0.1, 0.8)), mood: t > 3.0 ? 'flat' : 'smile' });
      price.show(seg(t, 0.15, 0.5) - seg(t, 2.2, 2.4), 300, 112);
      th.show(seg(t, 2.3, 2.75), 110, 66);
      tf(sw, 140, FY - 100 + 10 * seg(t, 1.2, 2.2));
      sw.setAttribute('opacity', t > 1.2 && t < 2.2 ? 0.9 : 0);
    }
  };
}
