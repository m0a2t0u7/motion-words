// at one's own pace：となりは速くページをめくるが、まめは自分の速さでゆっくり読み進め、どちらも満足（例文 You can study at your own pace.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, desk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '一緒に勉強'], [1.5, '速さはそれぞれ'], [3.6, '自分のペース']] };

function book(k, x, y) {
  const { el, g, pal } = k;
  const o = g({});
  el('path', { d: `M ${x - 30} ${y} L ${x} ${y + 3} L ${x + 30} ${y} L ${x + 30} ${y - 4} L ${x - 30} ${y - 4} Z`, fill: pal.blueDark }, o);
  el('path', { d: `M ${x - 28} ${y - 4} Q ${x - 14} ${y - 12} ${x} ${y - 4} Q ${x + 14} ${y - 12} ${x + 28} ${y - 4} Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, o);
  const pg = el('path', { d: '', fill: '#F7F9FB', stroke: pal.line, 'stroke-width': 1.5 }, o);
  // p: 0→1 でページが右から左へめくれる
  return (p) => {
    const w = 28 * Math.cos(p * Math.PI), hh = 8 + 10 * Math.sin(p * Math.PI);
    k.set(pg, { d: `M ${x} ${y - 4} Q ${x + w / 2} ${y - 4 - hh} ${x + w} ${y - 4} Z`, opacity: p > 0.01 && p < 0.99 ? 1 : 0 });
  };
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 160, y: 40, width: 80, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const C = k.buddy({ x: 110, y: FY - 4, scale: 0.86, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 290, y: FY - 4, scale: 0.86 });
  const t1 = desk(k, 60, 120, FY), t2 = desk(k, 240, 120, FY);
  const fC = book(k, 120, t1), fA = book(k, 300, t2);
  // 読み終えた量（ページ数）を示すバー
  const bars = [[60, pal.coral], [240, pal.mint]].map(([x, c]) => { el('rect', { x: x + 20, y: 120, width: 80, height: 8, rx: 4, fill: '#E6EAF0' }); return el('rect', { x: x + 20, y: 120, width: 0, height: 8, rx: 4, fill: c }); });
  const lines = [0, 1].map((i) => el('path', { d: `M ${60 + i * 6} ${150 + i * 10} l -14 0`, stroke: pal.sub, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  const note = el('path', { d: 'M 0 0 L 0 -12 L 8 -14 L 8 -2', stroke: pal.violet, 'stroke-width': 2.4, fill: 'none' });
  const nh = el('circle', { r: 3, fill: pal.violet });
  return {
    update(t) {
      // ピンク：速くめくる（1.0秒に1枚）、まめ：ゆっくり（2.0秒に1枚）
      const pc = (t * 1.6) % 1, pa = Math.max(0, (t - 0.4) * 0.5) % 1;
      const flipC = easeInOut(seg(pc, 0.55, 1)), flipA = easeInOut(seg(pa, 0.7, 1));
      fC(flipC); fA(flipA);
      P(C, { lean: 10, look: 0.3, mood: 'flat', armR: reach(C, 0.86, 'R', lerp(150, 92, flipC), t1 - 8), armL: 40, squash: 1 + 0.01 * Math.sin(t * 9) });
      P(A, { lean: 6 + 3 * Math.sin(t * 2), look: 0.3, mood: t > 1.2 ? 'smile' : 'smile', armR: reach(A, 0.86, 'R', lerp(330, 272, flipA), t2 - 8), armL: 30, blink: Math.abs(t - 2.2) < 0.06 ? 1 : 0 });
      k.set(bars[0], { width: Math.min(80, 80 * t / 4.4) });
      k.set(bars[1], { width: Math.min(80, 40 * Math.max(0, t - 0.4) / 4.0) });
      lines.forEach((l, i) => l.setAttribute('opacity', 0.4 + 0.4 * Math.sin(t * 14 + i)));
      const q = (t * 0.6) % 1;
      tf(note, 336 + 6 * q, 128 - 16 * q); tf(nh, 336 + 6 * q, 128 - 16 * q);
      note.setAttribute('opacity', Math.sin(q * Math.PI)); nh.setAttribute('opacity', Math.sin(q * Math.PI));
      if (t > 3.6) { const e = easeOut(seg(t, 3.6, 4.0)); A.pose({ mood: 'grin', lean: lerp(A.state.lean, 0, e) }); C.pose({ mood: 'grin' }); }
    }
  };
}
