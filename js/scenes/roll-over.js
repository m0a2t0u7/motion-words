// roll over：ベッドで仰向けのまめが、ごろんと体の向きをひっくり返す（例文 The baby rolled over in bed.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '顔が上'], [1.2, 'ごろん'], [2.4, '背中が上']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 250, mood: 'indoor' });
  el('rect', { x: 50, y: 206, width: 300, height: 26, rx: 6, fill: pal.wood });
  el('rect', { x: 60, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 330, y: 232, width: 10, height: 18, fill: pal.woodDark });
  el('rect', { x: 56, y: 190, width: 288, height: 20, rx: 8, fill: '#EAF2FA' });
  el('ellipse', { cx: 96, cy: 176, rx: 34, ry: 14, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 2 });
  const pos = g({});
  const grp = g({}, pos);
  const b = k.buddy({ parent: grp, x: 0, y: 0, scale: 1 });
  b.g.firstChild.setAttribute('display', 'none');
  // 背中側のカバー（体の向きが反対になったとき顔を隠す）
  const back = el('rect', { x: -30, y: -80, width: 60, height: 80, rx: 28, fill: pal.mintDark }, b.body);
  const bk = el('rect', { x: -4, y: -70, width: 8, height: 44, rx: 4, fill: pal.mint, opacity: 0.6 }, b.body);
  // 回転方向の矢印
  const ar = g({});
  el('path', { d: 'M -30 0 A 30 14 0 0 1 30 0', fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round' }, ar);
  el('path', { d: 'M 22 -8 L 32 2 L 18 4', fill: 'none', stroke: pal.coral, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ar);
  const bl = el('rect', { x: 200, y: 160, width: 150, height: 46, rx: 14, fill: pal.coral });
  bl.setAttribute('opacity', 0);

  return {
    update(t) {
      const p = easeInOut(seg(t, 1.1, 2.3));
      const cs = Math.cos(p * Math.PI); // 1 → -1
      const width = Math.max(0.12, Math.abs(cs));
      const settle = wobble(seg(t, 2.3, 3.2), 2, 5) * 0.05;
      tf(pos, 150, 160 - 14 * hump(p), 0);
      // grp: 体を横に寝かせ、体の厚みを cos で変える
      grp.setAttribute('transform', `rotate(90) scale(1 ${(width + settle).toFixed(3)})`);
      const showBack = cs < 0;
      back.setAttribute('opacity', showBack ? 1 : 0);
      bk.setAttribute('opacity', showBack ? 1 : 0);
      b.pose({
        blink: 0.9,
        mood: 'smile',
        armL: 40 + 30 * hump(p) + (showBack ? 0 : 0),
        armR: 40 + 30 * hump(p),
        squash: 1
      });
      tf(ar, 150, 128, 0, 1.1, 1);
      ar.setAttribute('opacity', p > 0.02 && p < 0.98 ? 1 : 0);
    }
  };
}
