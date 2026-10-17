// push：まめが箱を自分から遠ざける方向へ押し、箱が床を滑っていく（例文 She pushed the box across the floor.）
import { seg, lerp, easeInOut, easeOut, smooth, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '構える'], [1.1, '押す'], [2.5, '遠くへ動く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 床に目印のラグ・壁の窓
  el('rect', { x: 28, y: 40, width: 80, height: 62, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 68, y1: 40, x2: 68, y2: 102, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('rect', { x: 290, y: 60, width: 70, height: 50, rx: 6, fill: '#FBE3D8' });
  el('circle', { cx: 325, cy: 85, r: 12, fill: pal.coral, opacity: 0.7 });
  // 方向を示す床の目印（箱の通り道）
  const marks = [0, 1, 2, 3, 4, 5].map((i) => el('rect', { x: 16 + i * 70, y: FY + 34, width: 22, height: 5, rx: 2.5, fill: '#DDE3EA' }));

  const P0 = 160, S = 1.05;
  const boxX = (t) => {
    if (t < 1.0) return P0;
    if (t < 1.45) return P0 + 5 * smooth(seg(t, 1.0, 1.45));
    if (t < 2.3) return P0 + 5 + 55 * Math.pow(seg(t, 1.45, 2.3), 1.6);
    const v = (55 * 1.6) / 0.85, L = 1.3, tau = t - 2.3;
    return P0 + 60 + (v / L) * (1 - Math.exp(-L * tau));
  };
  const speed = (t) => (t < 1.45 ? 0 : t < 2.3 ? (55 * 1.6 * Math.pow(seg(t, 1.45, 2.3), 0.6)) / 0.85 : ((55 * 1.6) / 0.85) * Math.exp(-1.3 * (t - 2.3)));

  const box = g({});
  const bsh = k.shadow(0, 0, 40, 6, box);
  el('rect', { x: -33, y: -56, width: 66, height: 56, rx: 4, fill: pal.wood }, box);
  el('rect', { x: -33, y: -56, width: 66, height: 9, rx: 4, fill: '#F0D9B8' }, box);
  el('rect', { x: -7, y: -56, width: 14, height: 56, fill: '#EBD3AE' }, box);
  el('rect', { x: -33, y: -8, width: 66, height: 8, rx: 3, fill: pal.woodDark, opacity: 0.5 }, box);
  el('rect', { x: 14, y: -32, width: 14, height: 10, rx: 3, fill: '#FFFFFF', opacity: 0.55 }, box);
  const lines = [0, 1, 2].map((i) => el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));

  const b = k.buddy({ x: 75, y: FY, scale: S });
  b.g.firstChild.setAttribute('display', 'none');
  const sh = k.shadow(0, FY + 2, 32 * S, 6);
  // 2本目の腕（体の前に出して両腕で押す）
  const arm2 = g({}, b.body);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 31, stroke: pal.mintDark, 'stroke-width': 9, 'stroke-linecap': 'round' }, arm2);
  el('circle', { cx: 0, cy: 33, r: 6.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 }, arm2);

  return {
    update(t) {
      const bx = boxX(t);
      const press = t > 1.0 && t < 2.3 ? 1 : 0;
      const tremble = t > 1.0 && t < 1.5 ? Math.sin(t * 48) * 0.9 : 0;
      tf(box, bx + tremble, FY + 2);
      // まめ：箱に手が触れたまま歩き、離れたところで止まる
      const mx = Math.min(bx - 90, P0 + 60 - 90) - (t < 1.0 ? 0 : 0);
      const reach = easeOut(seg(t, 0.3, 0.85));
      const set = easeInOut(seg(t, 0.7, 1.1));
      const strain = t > 1.0 && t < 2.35 ? 1 : 0;
      const after = easeInOut(seg(t, 2.35, 3.6));
      const leanA = 6 * reach + 16 * set + 4 * strain * Math.sin(t * 40) * (t < 1.5 ? 1 : 0.3) - after * 18;
      const walking = t > 1.45 && t < 2.35;
      const armA = lerp(8, 84, reach) * (1 - after) + after * 30 + (1 - after) * 0;
      b.pose({
        x: mx, y: FY,
        armR: armA, armL: 8,
        lean: leanA,
        squash: 1 - 0.07 * set * (1 - after) + 0.0,
        walk: walking ? (t - 1.45) * 12 : 0,
        mood: t < 2.5 ? (t > 1.0 ? 'open' : 'smile') : 'smile',
        look: 0.5
      });
      tf(arm2, 18, -36, -armA + 4);
      arm2.setAttribute('opacity', reach > 0.05 ? 1 : 0);
      tf(sh, mx, 2, 0, 1, 1);
      sh.setAttribute('transform', `translate(${mx.toFixed(2)} 0)`);
      // 滑るときの速度線
      const v = speed(t);
      lines.forEach((l, i) => {
        const len = Math.min(34, v * 0.28);
        const y = FY - 14 - i * 16;
        k.set(l, { x1: bx - 40 - i * 4, y1: y, x2: bx - 40 - i * 4 - len, y2: y });
        l.setAttribute('opacity', v > 25 ? 0.8 : 0);
      });
      // 床の目印は箱と逆向きに流れる（動いているのが分かる）
    }
  };
}
