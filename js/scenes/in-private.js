// in private：同僚の多い事務所で「ちょっといい？」と声をかけ、二人で小部屋に入ってドアを閉め、二人だけで話す（Can I talk to you in private?）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { officeBg, desk, monitor } from './get-on-with.js';
import { person } from './queue-up.js';
import { gait, hp } from './dig.js';
import { P, blinkAt, talk } from './so-far-so-good.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'ちょっといい？'], [1.6, '小部屋へ'], [3.2, '二人だけで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 120);
  const t1 = desk(k, 38, 54, FY); monitor(k, 66, t1);
  const t2 = desk(k, 128, 54, FY); monitor(k, 156, t2);
  const A = person(k, 'blue', { x: 22, y: FY, scale: 0.75 }), B = person(k, 'yellow', { x: 112, y: FY, scale: 0.75 });
  // 小部屋の中（奥の壁）
  el('rect', { x: 270, y: 30, width: 130, height: FY - 30, fill: '#E6EEF5' });
  const C = k.buddy({ x: 238, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const G = k.buddy({ x: 186, y: FY });
  // 小部屋の前面の壁（窓つき）＋ドア
  const wallD = `M 270 30 H 400 V ${FY + 8} H 316 V ${FY - 120} H 270 Z M 326 112 H 394 V 176 H 326 Z`;
  el('path', { d: wallD, fill: '#C9D6E3', 'fill-rule': 'evenodd' });
  el('rect', { x: 326, y: 112, width: 68, height: 64, fill: '#DDEFFA', opacity: 0.35, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 266, y: 26, width: 138, height: 6, fill: '#AFC0D2' });
  const door = g({}); el('rect', { x: 0, y: 0, width: 46, height: 120, rx: 2, fill: '#8FA6BF' }, door); el('circle', { cx: 38, cy: 64, r: 4, fill: pal.yellow }, door);
  const ask = talk(k, 'A word?', 74, 32, -1);
  const dots = say(k, 40, 26, -1); [-8, 0, 8].forEach((x) => el('circle', { cx: x, cy: 0, r: 2.5, fill: pal.sub }, dots.g));
  const gx = (t) => t < 1.5 ? lerp(186, 200, easeInOut(seg(t, 0.1, 0.6))) : lerp(200, 344, easeInOut(seg(t, 1.6, 3.0)));
  const cx = (t) => t < 1.5 ? 238 : lerp(238, 372, easeInOut(seg(t, 1.5, 2.8)));
  return {
    update(t) {
      const op = clamp(seg(t, 1.3, 1.7)) * (1 - seg(t, 3.0, 3.4));
      tf(door, 270, FY - 120, 0, lerp(1, 0.1, easeInOut(op)), 1);
      const pg = gait(gx, t, 186), pc = gait(cx, t, 238);
      const tap = hump(seg(t, 0.5, 1.0));
      const inside = t > 3.2, tk = inside && Math.sin(t * 14) > 0;
      P(G, { x: pg.x, walk: pg.walk, lean: pg.lean + (inside ? 4 : 0), armL: pg.armL, armR: t < 1.5 ? 8 + 70 * tap : pg.armR, facing: 1,
        mood: tk ? 'open' : 'smile', look: 0.6, blink: blinkAt(t) });
      P(C, { x: pc.x, walk: pc.walk, lean: pc.lean, armL: pc.armL, armR: pc.armR, facing: t > 1.45 && t < 2.85 ? 1 : -1, look: 0.5, mood: 'smile', blink: blinkAt(t, 1) });
      const cur = t > 1.0 && t < 3.6 ? (t < 2.2 ? 1 : 0.6) : 0;
      P(A, { look: cur, armR: 70, armL: 8, lean: 4, facing: 1, blink: blinkAt(t, 2), mood: 'flat' });
      P(B, { look: cur, armR: 70, armL: 8, lean: 4, facing: 1, blink: blinkAt(t, 0.7), mood: 'flat' });
      ask.show(seg(t, 0.6, 0.9) * (t < 1.6 ? 1 : 0), 222, 112);
      dots.show(seg(t, 3.5, 3.8), 340, 92);
    }
  };
}
