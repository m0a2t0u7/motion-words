// rule out：医師が聴診したあと、カルテの「重い病気」の行に線を引いて消し、患者がほっとする（例文 The doctor ruled out a serious illness.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach, held } from './dig.js';
import { drawOn } from './work-on.js';

export const meta = { duration: 4.6, beats: [[0, '診察する'], [2.0, '重い病気を消す'], [3.8, 'ほっとする']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 40, fill: '#E6F1F6' });
  // カルテ板（右の壁）
  el('rect', { x: 262, y: 92, width: 120, height: 104, rx: 6, fill: '#fff', stroke: '#B9C3D0', 'stroke-width': 4 });
  const row = (y, icon) => { icon(y); el('rect', { x: 306, y: y - 4, width: 60, height: 8, rx: 4, fill: '#D9DFE7' }); };
  row(124, (y) => { el('circle', { cx: 287, cy: y, r: 11, fill: pal.red }); el('rect', { x: 285, y: y - 7, width: 4, height: 9, rx: 1, fill: '#fff' }); el('circle', { cx: 287, cy: y + 5, r: 2, fill: '#fff' }); });
  row(166, (y) => { el('circle', { cx: 287, cy: y, r: 11, fill: pal.mint }); el('rect', { x: 279, y: y - 2.5, width: 16, height: 5, rx: 2.5, fill: '#fff' }); });
  const strike = el('path', { d: 'M 272 126 L 372 122', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' });
  const sOn = drawOn(strike);
  // 患者（左の丸いす）
  el('rect', { x: 66, y: 204, width: 50, height: 7, rx: 3, fill: pal.blue });
  el('rect', { x: 88, y: 211, width: 6, height: 25, fill: pal.blueDark });
  k.shadow(91, FY, 26, 4);
  const P = k.buddy({ x: 91, y: 214, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  P.g.children[0].setAttribute('opacity', 0);
  const S = 1.15;
  const D = k.buddy({ x: 196, y: FY, scale: S, facing: -1 });
  // 白衣と聴診器
  const coat = el('path', { d: 'M -30 -40 L 30 -40 L 30 -8 Q 30 0 22 0 L -22 0 Q -30 0 -30 -8 Z', fill: '#fff', opacity: 0.85 }, D.body);
  D.body.insertBefore(coat, D.body.children[3]);
  el('rect', { x: -2, y: -40, width: 4, height: 40, fill: '#E3E8EE' }, D.body);
  const tube = el('path', { d: '', stroke: pal.ink, 'stroke-width': 2.4, fill: 'none' });
  const chest = el('circle', { r: 5, fill: '#B9C3D0', stroke: pal.ink, 'stroke-width': 2 });
  const mk = g({});
  el('rect', { x: -3.5, y: -4, width: 7, height: 16, rx: 2, fill: pal.ink }, mk);
  return {
    update(t) {
      const turn = t > 1.95;
      const relief = easeOut(seg(t, 3.5, 3.9));
      P.pose({ armL: 14, armR: 14, look: turn ? 0.9 : 0.5, mood: t > 3.5 ? 'grin' : 'flat', squash: 1 + 0.03 * Math.sin(t * 2.5) - 0.06 * hump(seg(t, 3.5, 3.9)), lift: 6 * hump(seg(t, 3.55, 3.85)) });
      if (!turn) {
        const lis = easeInOut(seg(t, 0.3, 0.8)) * (1 - easeInOut(seg(t, 1.6, 1.95)));
        D.pose({ facing: -1, x: 186, lean: 8 * lis, look: 0.5, mood: 'flat', armL: 10 });
        const tgt = { x: 112 + 3 * Math.sin(t * 3) * lis, y: 190 - 4 * hump(seg(t, 0.9, 1.5)) };
        D.pose({ armR: lerp(12, reach(D, S, 'R', tgt.x, tgt.y), lis) });
        const h = hp(D, S, 'R');
        k.set(chest, { cx: h.x, cy: h.y + 2, opacity: 1 });
        const nx = D.state.x - 12, ny = FY - 70 * S;
        k.set(tube, { d: `M ${nx} ${ny} Q ${(nx + h.x) / 2} ${ny + 40} ${h.x} ${h.y}`, opacity: 1 });
        mk.setAttribute('opacity', 0);
      } else {
        const go = easeInOut(seg(t, 2.0, 2.4)), w = easeInOut(seg(t, 2.5, 3.3)), back = easeInOut(seg(t, 3.5, 4.1));
        const tx = lerp(274, 372, w), ty = lerp(126, 122, w) + (w <= 0 ? 6 * (1 - go) : 0);
        const L = 64, dy = ty - (FY - 56 * S), dx = Math.sqrt(Math.max(0, L * L - dy * dy));
        const bx = lerp(lerp(186, tx - 38 - dx, go), 196, back);
        D.pose({ facing: 1, x: bx, lean: 4, look: 0.6, mood: t > 3.4 ? 'smile' : 'flat', armL: 10 });
        D.pose({ armR: lerp(reach(D, S, 'R', tx, ty), 14, back) });
        held(k, D, S, mk, 'R', 0, 26);
        mk.setAttribute('opacity', 1);
        k.set(chest, { opacity: 0 }); k.set(tube, { opacity: 0 });
        sOn(w);
      }
      if (!turn) sOn(0);
    }
  };
}
