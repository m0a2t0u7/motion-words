// employ：工場に作業員が次々と入っていき、働く人の数が約200人になる（例文 The factory employs about 200 people.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { P } from './run-after.js';
import { COL } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, '工場'], [1.2, '人が働きに来る'], [3.4, '約200人']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.42;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DADFE6' });
  // 工場：のこぎり屋根・煙突・入口
  k.shadow(290, FY + 1, 110, 6);
  el('rect', { x: 330, y: 50, width: 18, height: 70, fill: '#B9A08A' });
  el('path', { d: 'M 180 236 L 180 120 L 220 96 L 220 120 L 260 96 L 260 120 L 300 96 L 300 120 L 340 96 L 340 120 L 396 120 L 396 236 Z', fill: '#C9D1DC' });
  [190, 230, 270, 310].forEach((x) => el('path', { d: `M ${x} 118 L ${x + 26} 102 L ${x + 26} 118 Z`, fill: '#9FC3E2' }));
  el('rect', { x: 180, y: 160, width: 216, height: 6, fill: '#A9B3C2' });
  [196, 336].forEach((x) => el('rect', { x, y: 176, width: 40, height: 26, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 3 }));
  el('rect', { x: 256, y: 178, width: 60, height: 58, fill: '#4A5568' });
  const smoke = [0, 1, 2].map(() => el('circle', { r: 12, fill: '#fff', opacity: 0 }));
  // 人数の表示板
  const bd = g({}); tf(bd, 90, 78);
  el('rect', { x: -66, y: -30, width: 132, height: 60, rx: 10, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bd);
  const pi = g({}, bd); tf(pi, -40, 0);
  el('circle', { cy: -8, r: 7, fill: pal.mint }, pi); el('path', { d: 'M -11 14 Q -11 0 0 0 Q 11 0 11 14 Z', fill: pal.mint }, pi);
  const num = k.text(14, 2, '0', { 'font-size': 28, fill: pal.ink }, bd);
  k.text(-60, -22, '≈', { 'font-size': 16, fill: pal.sub, 'text-anchor': 'start' }, bd);
  // 作業員（ヘルメット）。時刻からそれぞれの位置が決まる
  const cols = ['mint', 'blue', 'coral', 'yellow', 'violet'];
  const N = 9;
  const ws = Array.from({ length: N }, (_, i) => {
    const b = k.buddy({ x: -30, y: FY + 6, scale: S, color: COL[cols[i % 5]][0], dark: COL[cols[i % 5]][1] });
    el('path', { d: 'M -27 -66 Q -26 -90 0 -90 Q 26 -90 27 -66 Z', fill: pal.yellow }, b.body);
    el('rect', { x: -32, y: -68, width: 64, height: 6, rx: 3, fill: pal.yellowDark }, b.body);
    return b;
  });
  return {
    update(t) {
      ws.forEach((b, i) => {
        const t0 = i * 0.38, p = clamp((t - t0) / 1.6);
        const x = lerp(-30, 290, p), walk = (x + 30) * 0.12;
        P(b, { x, y: FY + 6, walk: p > 0 && p < 1 ? walk : 0, armL: 8 + Math.sin(walk) * 16, armR: 8 - Math.sin(walk) * 16, lean: 3, look: 0.5 });
        b.g.setAttribute('opacity', p > 0 && p < 1 ? 1 - seg(x, 262, 288) : 0);
      });
      const n = Math.round(200 * easeOut(seg(t, 0.4, 3.6)));
      num.textContent = String(n);
      tf(num, 0, 0, 0, 1 + 0.15 * (t > 3.6 ? Math.exp(-(t - 3.6) * 6) : 0));
      smoke.forEach((s, i) => { const q = ((t * 0.5 + i / 3) % 1); tf(s, 339 + q * 20, 44 - q * 40, 0, 0.6 + q); s.setAttribute('opacity', 0.8 * (1 - q)); });
    }
  };
}
