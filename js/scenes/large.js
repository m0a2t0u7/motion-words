// large：家族がひとり、またひとりと集まり、大家族になる（例文 They have a large family.）
import { seg, lerp, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt, parkBg, tree } from './run-after.js';

export const meta = { duration: 3.8, beats: [[0, 'ひとり'], [1.3, 'どんどん増える'], [3.0, '大家族']] };

export function create(k) {
  const { el, pal } = k;
  const FY = parkBg(k, 238);
  tree(k, 36, FY - 4, 0.7); tree(k, 372, FY - 4, 0.6);
  const defs = [
    [70, 0.78, pal.mint, pal.mintDark, 0.1], [128, 0.78, pal.coral, pal.coralDark, 0.7], [182, 0.58, pal.blue, pal.blueDark, 1.2],
    [230, 0.62, pal.yellow, pal.yellowDark, 1.6], [278, 0.5, pal.violet, '#7A5FD0', 2.0], [322, 0.46, '#7FD3A0', '#4FB27A', 2.4], [358, 0.4, pal.coral, pal.coralDark, 2.7]
  ];
  const ms = defs.map(([x, s, c, d]) => k.buddy({ x, y: FY + 4, scale: s, color: c, dark: d }));
  // 全員をまとめるかっこ
  const br = el('path', { d: 'M 40 160 Q 200 140 376 160', stroke: pal.yellowDark, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  br.setAttribute('pathLength', 100);
  br.setAttribute('stroke-dasharray', '100');
  return {
    update(t) {
      ms.forEach((b, i) => {
        const at = defs[i][4], p = seg(t, at, at + 0.45), drop = (1 - backOut(p)) * 70;
        b.g.setAttribute('opacity', p > 0 ? 1 : 0);
        const cheer = seg(t, 3.0, 3.8) * Math.abs(Math.sin(t * 7 + i));
        P(b, { y: FY + 4 - drop, squash: 1 - 0.12 * hump(seg(t, at + 0.35, at + 0.6)), armL: 8 + cheer * 150, armR: 8 + cheer * 150, mood: i === 0 && t < 0.5 ? 'flat' : 'grin', look: i % 2 ? -0.3 : 0.3, blink: blinkAt(t, i * 0.4) });
      });
      br.setAttribute('stroke-dashoffset', 100 - 100 * easeOut(seg(t, 2.6, 3.3)));
      br.setAttribute('opacity', seg(t, 2.6, 2.8));
    }
  };
}
