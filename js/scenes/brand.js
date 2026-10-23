// brand：棚に並ぶ3つのコーヒー豆の袋（別々のマーク）から、1つを手に取って好きな銘柄を選ぶ（例文 Which brand of coffee do you like?）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg, desk, hp, reach } from './look-over.js';

export const meta = { duration: 3.8, beats: [[0, '見比べる'], [1.4, '手に取る'], [2.6, '好きな袋']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  desk(k, 20, 250, 200);
  // 袋（原点＝中心）。mark：0=丸 1=三角 2=星
  const bag = (x, col, dark, mark) => {
    const o = g({}); tf(o, x, 178);
    const sh = g({}); tf(sh, x, 200); k.shadow(0, 0, 17, 3, sh);
    el('rect', { x: -14, y: -22, width: 28, height: 44, rx: 4, fill: col }, o);
    el('rect', { x: -14, y: -22, width: 28, height: 7, rx: 3, fill: dark }, o);
    el('circle', { cx: 0, cy: 3, r: 9, fill: '#fff' }, o);
    if (mark === 0) el('circle', { cx: 0, cy: 3, r: 4, fill: dark }, o);
    if (mark === 1) el('path', { d: 'M 0 -2 L 5 7 L -5 7 Z', fill: dark }, o);
    if (mark === 2) el('path', { d: 'M 0 -3 L 1.8 2 L 6.5 2.2 L 2.8 5 L 4 9.5 L 0 6.8 L -4 9.5 L -2.8 5 L -6.5 2.2 L -1.8 2 Z', fill: dark }, o);
    return { o, sh };
  };
  const b2 = bag(150, pal.blue, pal.blueDark, 1), b3 = bag(100, pal.coral, pal.coralDark, 2);
  const b1 = bag(200, pal.mint, pal.mintDark, 0);
  const heart = g({});
  el('path', { d: 'M 0 6 C -14 -4 -8 -14 0 -7 C 8 -14 14 -4 0 6 Z', fill: pal.coral }, heart);
  return {
    update(t) {
      const grab = easeInOut(seg(t, 1.3, 1.9)), up = easeInOut(seg(t, 2.1, 2.7));
      const mx = lerp(110, 90, easeOut(seg(t, 0, 0.5))) ;
      const o = { x: 250, facing: -1, lean: 3, armL: 8, look: t < 1.3 ? Math.sin(t * 3) * 0.8 : 0.3, mood: up > 0.5 ? 'grin' : 'smile', blink: blinkAt(t) };
      P(b, { ...o, armR: 8 });
      const sx = hp(b, S, 'R', 0);
      const tx = sx.x - 24, ty = lerp(lerp(180, 182, grab), 150, up);
      const a = reach(b, S, 'R', tx, ty);
      P(b, { ...o, armR: grab > 0 ? a : lerp(8, a, easeOut(seg(t, 0.9, 1.4))) });
      const h = hp(b, S, 'R');
      const hold = grab > 0.01;
      tf(b1.o, hold ? h.x - 4 : 200, hold ? h.y + 0 : 178);
      b1.sh.setAttribute('opacity', hold ? 0 : 1);
      tf(heart, h.x - 4, h.y - 40 - up * 4, 0, up <= 0 ? 0.001 : backOut(seg(t, 2.5, 3.0)));
    }
  };
}
