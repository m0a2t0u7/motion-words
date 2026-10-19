// kiss：まめが抱っこした赤ちゃんのほおに、そっとキスする（例文 She kissed her baby on the cheek.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';
import { win } from './run-after.js';

export const meta = { duration: 4.0, beats: [[0, '赤ちゃんを抱く'], [1.4, 'ほおにキス'], [2.8, 'にっこり']] };
const HEART = 'M 0 6 C -12 -2 -8 -12 0 -5 C 8 -12 12 -2 0 6 Z';

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0, SB = 0.42;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  const w = win(k, 250, 46, 90, 66); w.frame();
  el('ellipse', { cx: 180, cy: 262, rx: 130, ry: 14, fill: '#F6DCE3' });
  const mom = k.buddy({ x: 160, y: FY, scale: S });
  // 赤ちゃん（おくるみ）。母の前の腕の中
  const baby = g({});
  const bb = k.buddy({ parent: baby, x: 0, y: 0, scale: SB, facing: -1, color: pal.coral, dark: pal.coralDark });
  bb.g.children[0].setAttribute('opacity', 0);
  el('path', { d: 'M -16 -2 Q -16 -24 0 -24 Q 16 -24 16 -2 Q 16 6 0 6 Q -16 6 -16 -2 Z', fill: '#FFF4D6', stroke: '#F0D9A6', 'stroke-width': 2 }, baby);
  const cheek = el('circle', { r: 3.4, fill: '#FF7A8A', opacity: 0 });
  const arm = el('line', { stroke: pal.mintDark, 'stroke-width': 9, 'stroke-linecap': 'round' });
  const hand = el('circle', { r: 6.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 });
  mom.armR.a.setAttribute('display', 'none');
  const hearts = [0, 1, 2].map(() => el('path', { d: HEART, fill: pal.red }));
  return {
    update(t) {
      const lean = easeInOut(seg(t, 1.2, 1.9)) * (1 - easeInOut(seg(t, 2.5, 3.1)));
      const sway = Math.sin(t * 2.4) * 2 * (1 - lean);
      mom.pose({ x: 160, lean: 4 + 20 * lean, armL: 22, armR: 60, mood: lean > 0.6 ? 'flat' : 'smile', blink: lean > 0.6 ? 1 : 0, look: 0.6 });
      // 赤ちゃんの位置：母の胸の前
      const bx = 205 + sway, by = FY - 64 - lean * 4;
      tf(baby, bx, by, -6 + sway);
      bb.pose({ mood: t > 2.4 ? 'grin' : 'smile', look: 0.6, blink: t > 2.6 && t < 3.0 ? 0 : 0, armL: 30, armR: 30 + 30 * hump(seg(t, 2.6, 3.6)) });
      // 前の腕で赤ちゃんを支える
      const sh = hp(mom, S, 'R', 0);
      k.set(arm, { x1: sh.x, y1: sh.y, x2: bx + 10, y2: by + 4 });
      k.set(hand, { cx: bx + 10, cy: by + 4 });
      // キスの印（ほおが赤くなる）
      const kp = seg(t, 1.9, 2.4);
      k.set(cheek, { cx: bx - 4, cy: by - 18, opacity: kp > 0 ? 0.7 * (1 - seg(t, 3.4, 4.0) * 0.5) : 0 });
      hearts.forEach((h, i) => {
        const q = seg(t, 2.0 + i * 0.25, 3.2 + i * 0.25);
        tf(h, 186 + i * 22, FY - 120 - 26 * q - (i % 2) * 8, 0, hump(q) * 1.1 + 0.001);
      });
    }
  };
}
