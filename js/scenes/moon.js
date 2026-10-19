// moon：夜、雲が流れて、まん丸の満月が出てくる。まめが見上げて「わあ」（例文 The moon is full tonight.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { nightBg, cloudG, hills, P, blinkAt, point } from './nature.js';

export function moonG(k, r = 30, parent) {
  const g = k.g({}, parent);
  k.el('circle', { r: r * 1.8, fill: '#FFF6CC', opacity: 0.12 }, g);
  k.el('circle', { r: r * 1.3, fill: '#FFF6CC', opacity: 0.18 }, g);
  k.el('circle', { r, fill: '#FFF3C4' }, g);
  [[-0.35, -0.2, 0.18], [0.3, 0.25, 0.13], [0.1, -0.45, 0.1], [-0.15, 0.4, 0.09]].forEach(([x, y, s]) => k.el('circle', { cx: x * r, cy: y * r, r: s * r, fill: '#EBDCA0' }, g));
  return g;
}

export const meta = { duration: 4.2, beats: [[0, '夜空を見る'], [1.2, '雲が流れる'], [2.6, '満月だ']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1;
  const { FY } = nightBg(k, { FY: 240 });
  const m = moonG(k, 32); tf(m, 270, 78);
  const c1 = cloudG(k, 150, 62, '#5E6E90', undefined, false), c2 = cloudG(k, 80, 30, '#6F7FA1', undefined, false);
  hills(k, FY, '#2F4157', '#384B62');
  // 家の窓明かり
  el('rect', { x: 20, y: FY - 80, width: 78, height: 80, fill: '#4A5B73' });
  el('path', { d: `M 12 ${FY - 76} L 59 ${FY - 116} L 106 ${FY - 76} Z`, fill: '#5A6C86' });
  el('rect', { x: 42, y: FY - 60, width: 30, height: 26, rx: 3, fill: '#FFD98A' });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const glow = el('circle', { cx: 270, cy: 78, r: 60, fill: '#FFF6CC', opacity: 0 });
  return {
    update(t) {
      const mv = easeInOut(seg(t, 0.6, 2.4));
      tf(c1, lerp(272, 440, mv), 82); tf(c2, lerp(250, -60, mv), 98);
      glow.setAttribute('opacity', 0.25 * easeOut(seg(t, 2.0, 2.8)) * (0.85 + 0.15 * Math.sin(t * 4)));
      const wow = easeOut(seg(t, 2.3, 2.8)), pt = easeInOut(seg(t, 2.8, 3.3));
      P(b, { look: 0.7, lean: -6, mood: wow > 0.5 ? 'open' : 'flat', blink: blinkAt(t), squash: 1 - 0.04 * hump(seg(t, 2.3, 2.7)), armL: 8 + 20 * wow });
      b.body.children[3].setAttribute('transform', 'translate(4 -4)');
      b.pose({ armR: lerp(8, point(b, S, 'R', 270, 78), pt), mood: t > 3.3 ? 'grin' : b.state.mood });
    }
  };
}
