// breath：質問されたまめが目を閉じて深く息を吸い、1から10まで数えてから答える（例文 Take a deep breath and count slowly to ten before you answer.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { talk } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '質問される'], [0.9, '深呼吸して数える'], [3.6, '答える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 160, y: 44, width: 84, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 202, y1: 44, x2: 202, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  const b = k.buddy({ x: 130, y: FY, scale: 1.05 });
  const c = k.buddy({ x: 300, y: FY, scale: 0.95, facing: -1, color: pal.coral, dark: pal.coralDark });
  const q = talk(k, '?', 44, 34, 1, 22);
  const ans = talk(k, '', 64, 34, -1);
  [-12, 0, 12].forEach((x) => el('circle', { cx: x, cy: 1, r: 3.5, fill: pal.ink }, ans.g));
  const air = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 10 -6 20 0', fill: 'none', stroke: '#9FC6E0', 'stroke-width': 3, 'stroke-linecap': 'round' }));
  const cnt = g({});
  el('circle', { r: 20, fill: '#fff', stroke: pal.blue, 'stroke-width': 3 }, cnt);
  const num = k.text(0, 1, '1', { 'font-size': 20, fill: pal.blueDark }, cnt);
  return {
    update(t) {
      q.show(seg(t, 0.1, 0.4) * (1 - seg(t, 0.9, 1.1)), 300 - 6, FY - 128);
      c.pose({ armR: 40 * hump(seg(t, 0.1, 1.0)) + 8, mood: t < 0.9 ? 'open' : 'smile', look: 0.5 });
      const inh = easeInOut(seg(t, 0.9, 1.8)), exh = easeInOut(seg(t, 3.0, 3.5));
      const br = inh * (1 - exh);
      b.pose({ squash: 1 - 0.06 * br, lift: 3 * br, lean: -5 * br, armL: 8 + 20 * br, armR: 8 + 20 * br, blink: t > 0.9 && t < 3.5 ? 1 : 0, mood: t > 3.5 ? 'open' : br > 0.3 ? 'flat' : 'smile', look: 0.5 });
      b.body.setAttribute('transform', b.body.getAttribute('transform') + ` scale(${1 + 0.08 * br} 1)`);
      air.forEach((a, i) => { const p = seg(t, 0.95 + i * 0.2, 1.6 + i * 0.2); tf(a, lerp(200, 150, p), FY - 62 - i * 6, 180, 1); a.setAttribute('opacity', hump(p)); });
      const n = Math.min(10, Math.max(1, Math.floor(1 + (t - 1.8) / 0.12)));
      num.textContent = String(n);
      const cs = seg(t, 1.7, 1.9) * (1 - seg(t, 3.3, 3.5));
      tf(cnt, 130, FY - 132, 0, cs <= 0 ? 0.001 : backOut(Math.min(1, cs * 1.2)) * (1 + 0.08 * Math.sin((t - 1.8) * 52)));
      ans.show(seg(t, 3.6, 3.9), 150, FY - 126);
    }
  };
}
