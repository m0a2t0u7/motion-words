// shy：知らない人に声をかけられ、小さなまめがお母さんの後ろに隠れてそっとのぞく（例文 The shy boy hid behind his mother.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, path, person, scene, treeG, blush, cue } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '声をかけられる'], [1.6, '後ろに隠れる'], [3.0, 'そっとのぞく']] };

export function create(k) {
  const { el, tf, pal } = k, S = 0.58;
  const { FY } = scene(k);
  const tr = treeG(k, 0.9); tf(tr.g, 60, FY);
  const boy = k.buddy({ x: 262, y: FY, scale: S, facing: 1 });
  const bl = blush(k, boy);
  const mom = person(k, 'coral', { x: 214, y: FY, scale: 1, facing: 1 });
  const guy = person(k, 'blue', { x: 440, y: FY, scale: 0.95, facing: -1 });
  const hi = cue(k, 'Hi!', 50, 28, 1);
  const gx = path([[0.1, 440], [1.2, 340]]), bx = path([[1.5, 262], [2.0, 200]]);
  return {
    update(t) {
      const g2 = walkTo(gx, t, 440, -1), wave = seg(t, 1.1, 2.6);
      P(guy, { x: g2.x, walk: g2.walk, facing: -1, lean: g2.lean + 6 * wave, armR: wave > 0 ? 150 + 18 * Math.sin(t * 14) : g2.armR, armL: g2.armL, mood: 'grin', look: 0.6, blink: blinkAt(t) });
      hi.show(seg(t, 1.2, 1.5) * (1 - seg(t, 2.4, 2.6)), g2.x - 24, FY - 132);
      const w = walkTo(bx, t, 262, 1), peek = easeInOut(seg(t, 3.0, 3.6));
      const xx = lerp(w.x, 254, peek);
      P(boy, { x: xx, walk: w.walk, facing: t > 2.1 ? 1 : w.facing, lean: t < 1.5 ? 0 : 8 * peek, armL: w.armL, armR: w.armR, look: t < 1.5 ? 0.5 * seg(t, 0.8, 1.1) : 0.9,
        mood: t > 1.4 ? 'flat' : 'smile', blink: blinkAt(t), squash: 1 - 0.05 * seg(t, 1.5, 2.0) });
      bl(seg(t, 1.2, 1.6));
      P(mom, { x: 214, facing: 1, look: 0.6, armL: 8 + 14 * seg(t, 1.8, 2.2), armR: 10, mood: 'smile', blink: blinkAt(t, 1) });
    }
  };
}
