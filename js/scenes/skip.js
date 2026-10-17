// skip：女の子が左右の足を入れかえながら、弾むように通りを進む（例文 The girl skipped down the street.）
import { seg, lerp, easeInOut, easeOut, smooth } from '../ease.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '歩き出す'], [1.3, '弾んで進む'], [3.6, '通りを進んだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 並木（動かない）
  [[70], [190], [320]].forEach(([x]) => {
    const t = g({}); tf(t, x, FY - 6);
    el('rect', { x: -4, y: -34, width: 8, height: 34, rx: 3, fill: pal.woodDark }, t);
    el('circle', { cx: 0, cy: -46, r: 22, fill: '#7FD3A0' }, t); el('circle', { cx: -12, cy: -36, r: 14, fill: '#6BC48F' }, t); el('circle', { cx: 13, cy: -37, r: 15, fill: '#6BC48F' }, t);
  });
  const b = k.buddy({ x: 50, y: FY + 4, scale: 1.1, color: pal.coral, dark: pal.coralDark });
  const notes = [0, 1, 2].map(() => k.text(0, 0, '♪', { 'font-size': 18, fill: pal.violet }));
  const PER = 0.46; // スキップ1歩の長さ
  const X = (t) => lerp(50, 350, easeInOut(seg(t, 0.2, 4.0)));
  return {
    update(t) {
      const run = seg(t, 0.2, 0.7) * (1 - seg(t, 3.8, 4.2));
      const c = t / PER, n = Math.floor(c), u = c - n;
      // 1歩 = 長い着地 + 短い跳ね。足は左右が交互に前へ
      const hop = Math.pow(Math.sin(Math.PI * Math.min(1, u / 0.7)), 0.9) * (u < 0.7 ? 1 : 0);
      const ph = Math.PI * (n + smooth(Math.min(1, u / 0.7)));
      const swing = Math.sin(ph) * run;
      b.pose({ x: X(t), lift: 15 * hop * run, walk: ph, squash: 1 - 0.07 * (u > 0.7 ? Math.sin((u - 0.7) / 0.3 * Math.PI) : 0) * run,
        armL: 8 + 70 * Math.max(0, swing) * run + 20 * run, armR: 8 + 70 * Math.max(0, -swing) * run + 20 * run, lean: 5 * run, mood: 'grin', look: 0.5 });
      notes.forEach((nt, i) => { const p = ((t * 0.7 + i / 3) % 1) * run; tf(nt, X(t) - 14 - i * 24, FY - 100 - 30 * p - i * 8, 0, 1); nt.setAttribute('opacity', run > 0.5 ? Math.sin(p * Math.PI) : 0); });
    }
  };
}
