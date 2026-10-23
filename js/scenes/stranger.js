// stranger：公園で知らない人に声をかけられても話さない。首をふって、お母さんのところへ走る（例文 Don't talk to strangers.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, wear, keys, iconSay, P, blinkAt, C } from './jam.js';
import { tree, run } from './run-after.js';
import { gait } from './weigh.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '知らない人'], [1.4, '話さない'], [2.4, 'お母さんの所へ']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#CDE8C9' });
  tree(k, 200, FY, 1.2);
  const mom = k.buddy({ x: 40, y: FY, scale: 1.2, ...C(k, 'coral') });
  const kid = k.buddy({ x: 220, y: FY, scale: 0.7 });
  const st = k.buddy({ x: 470, y: FY, scale: 1.2, facing: -1, ...C(k, 'blue') });
  // 帽子とサングラス（知らない人）
  wear(k, st, (g) => { el('rect', { x: -38, y: -84, width: 76, height: 7, rx: 3, fill: '#4E5968' }, g); el('rect', { x: -24, y: -104, width: 48, height: 22, rx: 6, fill: '#4E5968' }, g); el('rect', { x: -20, y: -60, width: 16, height: 9, rx: 3, fill: pal.ink }, g); el('rect', { x: 4, y: -60, width: 16, height: 9, rx: 3, fill: pal.ink }, g); el('line', { x1: -4, y1: -57, x2: 4, y2: -57, stroke: pal.ink, 'stroke-width': 2 }, g); });
  const S2 = arms(k, st, 1.2, { col: pal.blue, dark: pal.blueDark, back: ['L'] });
  const hi = iconSay(k, 50, 30, 1, (g) => k.text(0, 1, 'Hi!', { 'font-size': 14 }, g));
  const no = k.g({}); mark(k, 'x', no, 2.2);
  const xs = keys([[0, 470], [1.2, 300]]);
  const xk = keys([[0, 220], [2.0, 220], [3.2, 90]]);
  return {
    update(t) {
      const g = gait(xs, t, 470);
      P(st, { x: g.x, walk: g.walk, lean: g.lean + 6 * seg(t, 1.2, 1.5), facing: -1, look: 0.6, blink: 0, mood: 'smile' });
      S2.to('R', g.x - 40, FY - 60 + 6 * Math.sin(t * 8) * (t > 1.2 && t < 2)); S2.to('L', g.x - 20, FY - 36);
      hi.show(seg(t, 1.1, 1.4) * (1 - seg(t, 2.0, 2.2)), 330, 110);
      // 子ども：首をふる（向きを左右に）→ 走って逃げる
      const shake = t > 1.5 && t < 2.1 ? Math.sin((t - 1.5) * 26) : 0;
      const r = run(xk, t, 220, 1);
      P(kid, { x: r.x, walk: r.walk, armL: r.armL, armR: t > 1.5 && t < 2.1 ? 120 : r.armR, lean: r.lean - 6 * seg(t, 1.2, 1.5) * (t < 2), lift: r.lift, facing: t > 2.0 ? -1 : 1, look: t > 2.0 ? 0.6 : 0.6 + shake * 0.4, blink: blinkAt(t), mood: t > 1.3 && t < 3.2 ? 'flat' : 'smile' });
      k.tf(no, 252, 150, 0, t > 1.5 && t < 2.3 ? 1 : 0.001);
      // お母さん：両手を広げて迎える
      const op = easeOut(seg(t, 2.6, 3.1));
      P(mom, { look: 0.6, blink: blinkAt(t, 1), mood: t > 3.1 ? 'grin' : 'smile', armR: 10 + 80 * op, armL: 10 + 30 * op, lean: 6 * op });
    }
  };
}
