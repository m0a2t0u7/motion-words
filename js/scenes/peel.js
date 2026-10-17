// peel：りんごを手に持ち、ナイフで皮を長くむいていく（例文 He peeled an apple with a knife.）
import { seg, lerp, easeInOut, easeOut, smooth } from '../ease.js';
import { hp, frontL, table } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '赤いりんご'], [1.6, '皮をむく'], [3.6, 'むき終わり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 60);
  const b = k.buddy({ x: 150, y: 236, color: pal.blue, dark: pal.blueDark });
  const L = frontL(b, 1);
  const ribbon = el('path', { d: '', fill: 'none', stroke: '#E8554A', 'stroke-width': 4.5, 'stroke-linecap': 'round' });
  const ap = g({});
  let rectNode;
  const rc = k.clip((c) => { rectNode = el('rect', { x: -14, y: -14, width: 28, height: 0 }, c); });
  el('circle', { r: 13, fill: '#E8554A' }, ap);
  el('circle', { cx: -4, cy: -4, r: 4, fill: '#fff', opacity: 0.25 }, ap);
  const pale = g({}, ap);
  el('circle', { r: 13, fill: '#F6E7A6' }, pale);
  el('circle', { cx: -4, cy: -4, r: 4, fill: '#fff', opacity: 0.4 }, pale);
  pale.setAttribute('clip-path', rc);
  el('path', { d: 'M 0 -13 q 1 -6 4 -8', stroke: pal.woodDark, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, ap);
  const kn = g({});
  el('rect', { x: -2.5, y: -12, width: 5, height: 13, rx: 2, fill: pal.woodDark }, kn);
  el('path', { d: 'M -2.5 1 L 2.5 1 L 2.5 18 Q 0 22 -2.5 18 Z', fill: '#DCE3EC', stroke: '#9AA6B6', 'stroke-width': 1 }, kn);
  return {
    update(t) {
      const p = easeInOut(seg(t, 1.0, 3.4)), c = Math.sin(t * 8) * (t > 1.0 && t < 3.5 ? 1 : 0);
      b.pose({ armR: 70 + 5 * c * (p > 0 && p < 1 ? 1 : 0), armL: 8, lean: 3, look: 0.6, mood: t > 3.4 ? 'grin' : 'smile', squash: 1 });
      L.set(lerp(78, 82, p) + 4 * Math.sin(p * 10));
      const hl = L.pos(28), hr = hp(b, 1, 'R', 24);
      tf(ap, hl.x + 4, hl.y - 10, -p * 300);
      rectNode.setAttribute('height', 28 * p);
      pale.setAttribute('clip-path', rc);
      // ナイフ：手の位置で、刃をりんごの手前側に当てる
      tf(kn, hr.x, hr.y + 2, 28 - 6 * c);
      // 皮のリボン：ナイフの先から垂れ下がって伸びる
      const sx = hl.x + 14, sy = hl.y - 4, len = 8 + 62 * p, sw = Math.sin(t * 3) * 3;
      k.set(ribbon, { d: `M ${sx} ${sy} q 6 ${len * 0.35} ${-4 + sw} ${len * 0.55} q ${-8 + sw} ${len * 0.3} 2 ${len * 0.45}`, opacity: p > 0.01 ? 1 : 0 });
    }
  };
}
