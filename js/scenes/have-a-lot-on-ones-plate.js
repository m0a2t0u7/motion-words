// have a lot on one's plate：大皿の上の書類の山に、同僚が次々フォルダを積む。壁の予定表も今週ぎっしり（I have a lot on my plate this week.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump } from '../ease.js';
import { hp } from './get-something-off-ones-chest.js';

export const meta = { duration: 4.4, beats: [[0, '机の書類'], [1.6, '積まれる'], [3.4, '山積み']] };

const COLS = ['#6AA8F7', '#FFCF5C', '#FF8E77', '#A58BF3', '#5FCDB8'];

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 壁の予定表（今週）
  el('rect', { x: 24, y: 40, width: 128, height: 100, rx: 8, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 });
  el('rect', { x: 24, y: 40, width: 128, height: 18, rx: 8, fill: pal.red });
  el('rect', { x: 24, y: 50, width: 128, height: 8, fill: pal.red });
  const cells = [];
  for (let c = 0; c < 5; c++) for (let r = 0; r < 4; r++) {
    cells.push(el('rect', { x: 32 + c * 23.5, y: 64 + r * 18, width: 20, height: 14, rx: 3, fill: COLS[(c + r * 2) % 5], opacity: 0 }));
  }
  // 机
  k.shadow(222, FY + 2, 128, 6);
  const mint = k.buddy({ x: 190, y: FY - 6 });
  el('rect', { x: 120, y: 168, width: 200, height: 12, rx: 4, fill: pal.wood });
  el('rect', { x: 128, y: 180, width: 8, height: FY - 180, fill: pal.woodDark });
  el('rect', { x: 304, y: 180, width: 8, height: FY - 180, fill: pal.woodDark });
  // 皿（山の土台）
  const SX = 262, TOP = 168;
  el('ellipse', { cx: SX, cy: TOP - 2, rx: 38, ry: 7, fill: '#fff', stroke: '#CBD3DF', 'stroke-width': 2 });
  const stack = g({});
  const items = [];
  const N = 6;
  for (let i = 0; i < N; i++) {
    const it = g({}, stack);
    el('rect', { x: -26, y: -12, width: 52, height: 12, rx: 3, fill: i < 3 ? '#fff' : COLS[i - 3], stroke: i < 3 ? '#CBD3DF' : 'none', 'stroke-width': 2 }, it);
    if (i < 3) el('line', { x1: -16, y1: -6, x2: 12, y2: -6, stroke: '#CBD3DF', 'stroke-width': 2 }, it);
    items.push(it);
  }
  const coral = k.buddy({ x: 352, y: FY - 6, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  const drops = [1.0, 2.0, 2.9];
  return {
    update(t) {
      const n = drops.filter((d) => t >= d).length;
      // 山の高さ：土台3枚＋追加分
      let top = 0;
      items.forEach((it, i) => {
        let y, vis = 1;
        if (i < 3) y = TOP - 4 - 12 * i;
        else {
          const d = drops[i - 3];
          if (d === undefined) { vis = 0; y = 0; } else {
            const p = seg(t, d - 0.3, d);
            // 手から山の頂上へ（頂上＝下の枚数ぶんの高さ）
            const ty = TOP - 4 - 12 * i;
            const hand = hp(coral, 1, 'R', 24);
            y = lerp(hand.y, ty, easeIn(p)); vis = t > d - 0.7 ? 1 : 0;
            it.__x = lerp(hand.x - SX, 0, easeInOut(p));
          }
        }
        tf(it, SX + (i < 3 ? 0 : (it.__x || 0)), y, 0, 1, 1 - 0.1 * hump(seg(t, (drops[i - 3] || -9), (drops[i - 3] || -9) + 0.3)));
        it.setAttribute('opacity', vis);
      });
      // 山のぐらつき
      const sw = n >= 1 ? wobble(seg(t, drops[Math.max(0, n - 1)], drops[Math.max(0, n - 1)] + 0.9), 2, 3) * (2 + n) : 0;
      const baseSway = n >= 2 ? Math.sin(t * 3.4) * (n - 1) * 1.2 : 0;
      stack.setAttribute('transform', `rotate(${(sw + baseSway).toFixed(2)} ${SX} ${TOP})`);
      // 予定表が埋まる
      cells.forEach((c, i) => c.setAttribute('opacity', seg(t, 0.2 + i * 0.13, 0.35 + i * 0.13)));
      // 同僚がフォルダを置く腕
      const place = drops.reduce((a, d) => a + hump(seg(t, d - 0.6, d + 0.25)), 0);
      coral.pose({ armR: lerp(8, 100, Math.min(1, place)), armL: 8, look: 0.5, mood: 'smile', lean: 3 * Math.min(1, place) });
      // 本人：だんだん参る
      const load = seg(t, 0.8, 3.3), end = easeOut(seg(t, 3.3, 3.9));
      mint.pose({
        lean: -3 * load, squash: 1 - 0.05 * load - 0.03 * end,
        armL: lerp(8, 160, end), armR: lerp(8, 160, end),
        look: 0.7, mood: t < 0.8 ? 'smile' : t < 3.3 ? 'flat' : 'sad', blink: 0
      });
      const s = (t * 1.2) % 1;
      tf(sweat, 190 - 30, FY - 108 + 20 * s, 0, 1);
      sweat.setAttribute('opacity', t > 1.6 ? 1 - 0.5 * s : 0);
    }
  };
}
