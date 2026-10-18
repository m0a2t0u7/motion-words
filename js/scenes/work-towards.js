// work towards：2人が旗のある目標へ向かって、段を1段ずつ登っていく（まだ途中）（例文 We are working towards our goal step by step.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '目標を見る'], [1.4, '1段ずつ登る'], [3.6, '近づいてきた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'outdoor' });
  [[60, 80, 30], [330, 60, 24]].forEach(([x, y, r]) => { el('circle', { cx: x, cy: y, r, fill: '#fff' }); el('circle', { cx: x + r, cy: y + 6, r: r * 0.7, fill: '#fff' }); });
  // 階段（左下→右上）
  const N = 6, SW = 46, SH = 26, X0 = 60;
  const top = (i) => FY - SH * (i + 1);
  for (let i = 0; i < N; i++) {
    el('rect', { x: X0 + i * SW, y: top(i), width: 400, height: SH * (i + 1) + 2, fill: i % 2 ? '#E3C49B' : '#EBD0AC' });
    el('rect', { x: X0 + i * SW, y: top(i), width: 400, height: 4, fill: pal.woodDark, opacity: 0.5 });
  }
  // 頂上の旗（目標）
  const fx = X0 + (N - 1) * SW + 24, fy = top(N - 1);
  el('rect', { x: fx - 2, y: fy - 62, width: 4, height: 62, fill: pal.sub });
  const flag = el('path', { d: '', fill: pal.red });
  el('circle', { cx: fx, cy: fy - 64, r: 4, fill: pal.yellow });
  const stars = [0, 1].map(() => el('path', { d: 'M 0 -6 L 2 -2 L 6 0 L 2 2 L 0 6 L -2 2 L -6 0 L -2 -2 Z', fill: pal.yellow }));
  const A = k.buddy({ scale: 0.62 }), C = k.buddy({ scale: 0.62, color: pal.coral, dark: pal.coralDark });
  // 段 i の上での x（中央）
  const sx = (i) => (i < 0 ? 30 : X0 + i * SW + SW / 2);
  const sy = (i) => (i < 0 ? FY : top(i));
  const hopPos = (t, t0, per, n) => {
    // t0 から per 秒ごとに1段ずつ上がる。n 段で止まる
    const u = Math.max(0, (t - t0) / per), i = Math.min(n, Math.floor(u)), f = i >= n ? 0 : u - i;
    const e = easeInOut(seg(f, 0.15, 0.75)), a = i - 1, bI = i;
    const x = lerp(sx(a), sx(bI), e), y = lerp(sy(a), sy(bI), e) - 16 * hump(e);
    const crouch = f < 0.15 ? hump(f / 0.3) : f > 0.75 ? hump((f - 0.75) / 0.5) : 0;
    return { x, y, crouch, air: hump(e), moving: i < n };
  };
  return {
    update(t) {
      const w = Math.sin(t * 5) * 6;
      el && k.set(flag, { d: `M ${fx + 2} ${fy - 62} Q ${fx + 20} ${fy - 58 + w * 0.3} ${fx + 34} ${fy - 52 + w * 0.5} Q ${fx + 20} ${fy - 46} ${fx + 2} ${fy - 42} Z` });
      const pa = hopPos(t, 0.5, 0.75, 4), pc = hopPos(t, 1.3, 0.75, 3);
      [[A, pa, 0], [C, pc, -24]].forEach(([b, p, off]) => {
        b.pose({ x: p.x + off * 0.3, y: p.y, squash: 1 - 0.14 * p.crouch, lift: 0, lean: 8 * p.air, armL: 10 + 50 * p.air, armR: 10 + 50 * p.air, look: 0.8, mood: 'grin' });
      });
      // 後ろの人は少し左（奥）
      const e = seg(t, 3.6, 4.4);
      stars.forEach((s, i) => { tf(s, fx - 30 + i * 60, fy - 80 + 5 * Math.sin(t * 4 + i), t * 60, 0.7 + 0.3 * Math.sin(t * 5 + i)); s.setAttribute('opacity', 0.4 + 0.6 * e); });
    }
  };
}
