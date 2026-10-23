// dangerous：浮き輪を持って海へ向かうまめが「遊泳禁止」の看板と荒い波・岩を見て、びっくりして引き返す（例文 It's dangerous to swim here.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, P, blinkAt, walkTo, path, sc, pop } from './member.js';
import { drop } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '泳ぎたい'], [1.4, '危険の看板'], [2.8, 'やめておく']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  k.backdrop({ floorY: 300 });
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#C9D6E2'], [1, '#EEF2F6']]) });
  // 荒い海と岩
  const sea = el('path', { fill: '#4F8FBF' });
  const foam = el('path', { stroke: '#fff', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' });
  [[300, 30], [360, 22], [250, 16]].forEach(([x, r]) => el('path', { d: `M ${x - r} 300 L ${x - r * 0.6} ${236 - r} L ${x + r * 0.2} ${236 - r * 1.3} L ${x + r} 300 Z`, fill: '#6D7889' }));
  // 砂浜
  el('path', { d: `M 0 ${FY} L 190 ${FY} Q 230 ${FY + 20} 250 300 L 0 300 Z`, fill: '#F1DEB8' });
  // 看板（泳ぐ人に×）
  const SX = 170;
  el('rect', { x: SX - 3, y: FY - 120, width: 6, height: 120, fill: pal.woodDark });
  el('path', { d: `M ${SX} ${FY - 170} L ${SX + 34} ${FY - 112} L ${SX - 34} ${FY - 112} Z`, fill: pal.yellow, stroke: pal.ink, 'stroke-width': 3, 'stroke-linejoin': 'round' });
  el('circle', { cx: SX - 6, cy: FY - 136, r: 4, fill: pal.ink });
  el('path', { d: `M ${SX - 16} ${FY - 124} q 8 -6 16 0 t 16 0`, stroke: pal.blueDark, 'stroke-width': 3, fill: 'none' });
  el('path', { d: `M ${SX - 14} ${FY - 146} L ${SX + 14} ${FY - 118} M ${SX + 14} ${FY - 146} L ${SX - 14} ${FY - 118}`, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const b = k.buddy({ x: -30, y: FY, scale: S, facing: 1 });
  const ring = g({}); el('circle', { r: 16, fill: 'none', stroke: pal.coral, 'stroke-width': 9 }, ring); el('circle', { r: 16, fill: 'none', stroke: '#fff', 'stroke-width': 9, 'stroke-dasharray': '10 15' }, ring);
  const bang = k.text(0, 0, '!', { 'font-size': 28, fill: pal.red });
  const sw = [0, 1].map(() => drop(k));
  const bx = path([[0.1, -30], [1.3, 110], [2.8, 110], [3.8, 50]]);
  return {
    update(t) {
      const w = walkTo(bx, t, -30, 1), shock = seg(t, 1.4, 1.7), back = t > 2.8;
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: 40, lean: w.lean - 12 * hump(seg(t, 1.4, 2.0)), facing: back ? (t < 3.8 ? -1 : 1) : 1, look: 0.9, blink: blinkAt(t), mood: t > 1.4 ? (t > 2.0 ? 'sad' : 'open') : 'grin', lift: 14 * hump(seg(t, 1.4, 1.8)), squash: 1 - 0.05 * hump(seg(t, 1.8, 2.1)) });
      const h = hp(b, S, 'R', 28); tf(ring, h.x + 6 * b.state.facing, h.y + 6);
      tf(bang, w.x + 6, FY - 120 - 6 * shock, 0, pop(shock) * (1 - seg(t, 2.6, 2.8) * 0.999));
      sw.forEach((d, i) => { const q = seg(t, 1.8 + i * 0.3, 2.6 + i * 0.3); tf(d, w.x + (i ? -26 : 24), FY - 80 + 12 * q, 0, sc(hump(q))); });
      // 波：大きく高く打ち寄せる
      let d = `M 196 300 L 196 ${FY + 8}`, f = '';
      for (let x = 196; x <= 400; x += 12) { const y = FY - 4 + Math.sin(x * 0.06 - t * 5) * 12 + Math.sin(x * 0.02 + t * 2) * 8; d += ` L ${x} ${y.toFixed(1)}`; f += `${x === 196 ? 'M' : 'L'} ${x} ${(y - 2).toFixed(1)} `; }
      d += ' L 400 300 Z';
      k.set(sea, { d }); k.set(foam, { d: f });
    }
  };
}
