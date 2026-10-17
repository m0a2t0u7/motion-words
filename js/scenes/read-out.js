// read out：先生（まめ）が名簿を持ち、名前を声に出して読み上げる（例文 The teacher read out the names.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '名簿を持つ'], [1.0, '名前を読む'], [3.0, '声が届く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 黒板
  el('rect', { x: 78, y: 26, width: 240, height: 100, rx: 6, fill: '#4F7F72', stroke: pal.woodDark, 'stroke-width': 6 });
  el('path', { d: 'M 100 56 q 14 -14 28 0 t 28 0', stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.7, 'stroke-linecap': 'round' });
  el('line', { x1: 100, y1: 84, x2: 200, y2: 84, stroke: '#fff', 'stroke-width': 3, opacity: 0.6, 'stroke-linecap': 'round' });
  el('rect', { x: 250, y: 108, width: 30, height: 6, rx: 3, fill: '#fff', opacity: 0.8 });
  el('circle', { cx: 358, cy: 52, r: 16, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 4 });
  el('line', { x1: 358, y1: 52, x2: 358, y2: 42, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });
  el('line', { x1: 358, y1: 52, x2: 365, y2: 55, stroke: pal.ink, 'stroke-width': 2.4, 'stroke-linecap': 'round' });

  const st = k.buddy({ x: 316, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 生徒の机（前面が下半身を隠す）
  el('rect', { x: 276, y: 206, width: 100, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 282, y: 214, width: 88, height: 34, fill: pal.woodDark });
  const te = k.buddy({ x: 110, y: FY, scale: 1 });
  // 名簿
  const list = g({});
  el('rect', { x: 0, y: -46, width: 36, height: 48, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, list);
  const cols = [pal.mint, pal.coral, pal.yellow];
  const checks = [];
  cols.forEach((c, i) => {
    el('circle', { cx: 7, cy: -34 + i * 14, r: 3.4, fill: c }, list);
    el('rect', { x: 14, y: -37 + i * 14, width: 16, height: 6, rx: 3, fill: pal.line }, list);
    checks.push(el('path', { d: `M 12 ${-34 + i * 14} L 17 ${-30 + i * 14} L 28 ${-40 + i * 14}`, stroke: pal.green, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0 }, list));
  });
  const wave = g({});
  [10, 20].forEach((r) => el('path', { d: `M ${r} -${r * 0.7} Q ${r * 1.4} 0 ${r} ${r * 0.7}`, fill: 'none', stroke: pal.sub, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, wave));
  const names = ['Ann', 'Ben', 'Cleo'], T0 = [1.0, 1.7, 2.4];
  const bubbles = names.map((n, i) => {
    const bg = g({});
    el('rect', { x: -21, y: -11, width: 42, height: 22, rx: 11, fill: '#fff', stroke: cols[i], 'stroke-width': 3 }, bg);
    k.text(0, 1, n, { 'font-size': 12 }, bg);
    return bg;
  });
  const P0 = [128, 178], P1 = [210, 36], P2 = [296, 160];
  return {
    update(t) {
      const sp = T0.some((a) => t > a && t < a + 0.42);
      const hands = easeOut(seg(t, 0.1, 0.6));
      te.pose({ armR: lerp(10, 92, hands), armL: 8, lean: 2, look: 0.5, mood: sp ? (Math.sin(t * 22) > 0 ? 'open' : 'smile') : 'smile', blink: t > 0.7 && t < 0.8 ? 1 : 0 });
      const h = te.handPos('R');
      tf(list, h.x - 12, h.y + 4, 0, 1);
      T0.forEach((a, i) => checks[i].setAttribute('opacity', t > a + 0.1 ? 1 : 0));
      const speak = sp ? 1 : 0;
      tf(wave, 140, 178, 0, 1);
      wave.setAttribute('opacity', speak * (0.5 + 0.5 * Math.sin(t * 26)));
      bubbles.forEach((bg, i) => {
        const p = seg(t, T0[i] + 0.1, T0[i] + 1.15);
        const q = easeInOut(p);
        const x = (1 - q) * (1 - q) * P0[0] + 2 * (1 - q) * q * P1[0] + q * q * P2[0];
        const y = (1 - q) * (1 - q) * P0[1] + 2 * (1 - q) * q * P1[1] + q * q * P2[1];
        const vis = p > 0 && p < 1;
        tf(bg, x, y, 0, vis ? lerp(0.4, 1, easeOut(seg(p, 0, 0.25))) * (1 - 0.3 * seg(p, 0.85, 1)) : 0.001);
        bg.setAttribute('opacity', vis ? 1 - seg(p, 0.85, 1) : 0);
      });
      // 生徒：名前が届くたびにうなずき、最後（Cleo）に手を挙げる
      const nod = [1.9, 2.6].reduce((s, a) => s + hump(seg(t, a, a + 0.35)) * 0.06, 0);
      const raise = easeOut(seg(t, 3.0, 3.4));
      st.pose({ squash: 1 - nod, armR: lerp(8, 170, raise), armL: 8, look: 0.4, mood: raise > 0.5 ? 'grin' : 'smile', blink: t > 1.4 && t < 1.5 ? 1 : 0 });
    }
  };
}
