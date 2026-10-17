// head out：荷物を肩にかけ、「じゃあ行くね」と手を振って玄関を出ていく（例文 I'm going to head out now.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '荷物を取る'], [1.3, '手を振る'], [2.5, '玄関から出る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  // 壁の飾り・フック・玄関ドア（静止）
  el('rect', { x: 36, y: 56, width: 56, height: 44, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('path', { d: 'M 42 94 L 56 76 L 66 88 L 76 72 L 86 94 Z', fill: pal.green });
  el('rect', { x: 100, y: 120, width: 8, height: 8, rx: 4, fill: pal.woodDark });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 玄関：壁はここまで。右は屋外。開いたドアは戸口の脇に静止（まめが通り抜ける）
  el('rect', { x: 300, y: 0, width: 100, height: 300, fill: k.gradient([[0, pal.skyTop], [1, pal.skyBottom]]) });
  el('rect', { x: 300, y: FY, width: 100, height: 50, fill: '#E3E8EE' });
  el('rect', { x: 300, y: FY, width: 100, height: 3, fill: '#D3DAE3' });
  el('rect', { x: 372, y: FY - 70, width: 6, height: 70, fill: pal.woodDark });
  el('circle', { cx: 375, cy: FY - 84, r: 26, fill: '#8FCB9B' });
  el('rect', { x: 292, y: 96, width: 8, height: FY - 96, fill: pal.woodDark });
  el('rect', { x: 292, y: 90, width: 30, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 300, y: 98, width: 10, height: FY - 98, fill: pal.blue });
  el('rect', { x: 200, y: 168, width: 8, height: 8, rx: 4, fill: pal.woodDark });
  const bag = g({});
  el('rect', { x: -14, y: 0, width: 28, height: 34, rx: 8, fill: pal.violet }, bag);
  el('rect', { x: -14, y: 0, width: 28, height: 8, rx: 5, fill: '#fff', opacity: 0.25 }, bag);
  el('path', { d: 'M -8 0 Q 0 -20 8 0', fill: 'none', stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, bag);
  const S = 1;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.3, 0.9)), wave = seg(t, 1.2, 2.2);
      const go = seg(t, 2.3, 3.9);
      const x = t < 2.3 ? lerp(130, 150, easeOut(seg(t, 0.2, 0.8))) : lerp(150, 350, easeInOut(go) * 0.5 + go * 0.5);
      const moving = t > 2.3;
      const wv = Math.sin(wave * 18) * 14 * hump(wave);
      b.pose({ x, walk: moving ? (t - 2.3) * 9 : (t > 0.2 && t < 0.8 ? t * 9 : 0), facing: 1,
        armR: t < 1.2 ? lerp(8, 90, grab) * (1 - seg(t, 0.9, 1.2)) + 8 * seg(t, 0.9, 1.2) : t < 2.3 ? 130 + wv : 8 + Math.sin((t - 2.3) * 9) * 20,
        armL: moving ? 8 - Math.sin((t - 2.3) * 9) * 20 : 8, look: 0.5, mood: t > 1.2 ? 'grin' : 'smile', lean: moving ? 4 : 0 });
      // バッグ：フック → 手 → 肩の位置（体といっしょに動く）
      const carry = seg(t, 0.9, 1.3);
      const hookPos = { x: 204, y: 190 };
      const shoulder = { x: x - 30, y: FY - 56 + (moving ? Math.abs(Math.sin((t - 2.3) * 9)) * -3 : 0) };
      const px = lerp(hookPos.x, shoulder.x, easeInOut(carry)), py = lerp(hookPos.y, shoulder.y, easeInOut(carry));
      tf(bag, px, py, lerp(0, 10, carry));
    }
  };
}
