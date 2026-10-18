// by all means：ソファの空いた席を指して「座ってもいい？」→座っている人が荷物をどけ、大きく手で席を勧めて「どうぞどうぞ」→相手が座る（"Can I sit here?" "By all means."）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { sofa } from './run-after.js';
import { gait, hp } from './dig.js';
import { P, blinkAt, talk } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '座っていい？'], [1.6, 'どうぞどうぞ'], [3.2, '隣に座る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 40, y: 40, width: 100, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 300, cy: 70, r: 18, fill: pal.yellow, opacity: 0.5 });
  const sf = sofa(k, 190, FY, 170, '#6AA8F7', '#4A8BE0');
  const G = k.buddy({ x: 140, y: FY - 18, scale: 0.9 });
  const C = k.buddy({ x: 450, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark, scale: 0.9 });
  const bag = g({}); el('rect', { x: -14, y: -16, width: 28, height: 20, rx: 4, fill: pal.violet }, bag); el('path', { d: 'M -7 -16 Q 0 -26 7 -16', stroke: '#7F63D6', 'stroke-width': 3, fill: 'none' }, bag);
  sf.front();
  const ask = talk(k, 'Here?', 60, 32, 1, 15);
  const yes = talk(k, 'Sure!', 60, 32, -1, 15);
  const cx = (t) => t < 2.4 ? lerp(450, 316, easeInOut(seg(t, 0.1, 1.0))) : lerp(316, 240, easeInOut(seg(t, 2.6, 3.3)));
  return {
    update(t) {
      const b = gait(cx, t, 450);
      const sit = easeInOut(seg(t, 3.0, 3.5));
      P(C, { x: b.x, y: lerp(FY, FY - 18, sit), walk: sit > 0 ? 0 : b.walk, facing: t > 3.25 ? 1 : -1, lean: b.lean, armL: b.armL,
        armR: t > 1.0 && t < 2.0 ? 8 + 72 * hump(seg(t, 1.0, 2.0)) : b.armR, look: 0.5, mood: t > 2.2 ? 'grin' : 'smile', squash: 1 - 0.06 * hump(seg(t, 3.4, 3.7)), blink: blinkAt(t, 1) });
      const mv = easeInOut(seg(t, 1.9, 2.3));
      const offer = easeOut(seg(t, 2.2, 2.6)) * (1 - easeInOut(seg(t, 3.4, 3.9)));
      const nod = Math.max(0, Math.sin(seg(t, 2.1, 3.0) * Math.PI * 3));
      P(G, { facing: 1, armR: t < 1.9 ? 8 : t < 2.3 ? lerp(8, 50, mv) : 30 + 70 * offer + 10 * Math.sin(t * 6) * offer, armL: 8,
        lean: 6 * nod, look: t < 0.8 ? 0.2 : 0.7, mood: t > 1.9 ? 'grin' : 'smile', blink: blinkAt(t) });
      // 荷物：隣の席→ひざの上（手で動かす）
      tf(bag, lerp(232, 160, mv), lerp(FY - 30, FY - 44, mv) - 10 * hump(mv));
      ask.show(seg(t, 1.1, 1.4) * (t < 2.2 ? 1 : 0), 330, 110);
      yes.show(seg(t, 2.3, 2.6) * (t < 3.6 ? 1 : 0), 168, 118);
    }
  };
}
