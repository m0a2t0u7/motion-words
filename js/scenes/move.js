// move：まめの車が車庫の前をふさいでいる。隣の人に頼まれ、まめが乗りこんで車を横へ動かす（例文 Please move your car.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt, car, walkTo } from './run-after.js';
import { path } from './queue-up.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '車がじゃま'], [1.2, '乗りこむ'], [2.4, '車を動かす']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E3E8EE' });
  // 車庫（シャッター）
  el('rect', { x: 20, y: 96, width: 170, height: FY - 96, fill: '#F3E6DC' });
  el('path', { d: 'M 10 100 L 105 64 L 200 100 Z', fill: pal.coral });
  el('rect', { x: 40, y: 122, width: 130, height: FY - 122, fill: '#C9D1DC' });
  for (let y = 128; y < FY; y += 10) el('rect', { x: 40, y, width: 130, height: 2, fill: '#AEB8C6' });
  // 駐車スペース
  el('rect', { x: 268, y: FY + 6, width: 4, height: 30, fill: '#fff' });
  el('rect', { x: 392, y: FY + 6, width: 4, height: 30, fill: '#fff' });
  const pS = g({}); tf(pS, 372, FY);
  el('rect', { x: -2, y: -70, width: 4, height: 70, fill: pal.sub }, pS);
  el('rect', { x: -13, y: -96, width: 26, height: 26, rx: 4, fill: pal.blue }, pS);
  k.text(0, -82, 'P', { 'font-size': 18, fill: '#fff' }, pS);
  const nb = k.buddy({ x: 214, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const cr = car(k, pal.mint, pal.mintDark);
  const head = el('circle', { cx: -6, cy: -50, r: 8, fill: pal.mint }, cr.body);
  el('circle', { cx: -3, cy: -52, r: 1.6, fill: pal.ink }, cr.body);
  const me = k.buddy({ x: 430, y: FY + 8, scale: 0.9, facing: -1 });
  const bub = cue(k, 'please', 68, 30, 1, 14);
  const cx = path([[2.3, 105], [3.7, 322]]);
  const nx = path([[0.8, 214], [1.4, 262]]);
  const mx = path([[0.1, 430], [1.4, 186]]);
  return {
    update(t) {
      const x = cx(t), v = (cx(t + 0.02) - cx(t - 0.02)) / 0.04;
      const acc = (cx(t + 0.04) - 2 * x + cx(t - 0.04)) / 0.0016;
      cr.set(x, -(x - 105) * 2.2, FY + 8, clamp(-acc * 0.004, -2, 2));
      head.parentNode && head.setAttribute('opacity', t > 1.75 ? 1 : 0);
      cr.body.lastChild.setAttribute('opacity', t > 1.75 ? 1 : 0);
      const w = walkTo(mx, t, 430, -1);
      const enter = seg(t, 1.45, 1.75);
      P(me, { x: w.x, walk: w.walk, facing: w.facing, armL: w.armL, armR: t > 1.3 ? 60 : w.armR, lean: w.lean, look: 0.3, mood: 'flat', blink: blinkAt(t, 0.5) });
      me.g.setAttribute('opacity', 1 - enter);
      // 隣の人：手で車をさして頼む → よけてもらって笑う
      const w2 = walkTo(nx, t, 214, 1);
      P(nb, { x: w2.x, walk: w2.walk, lean: w2.lean, facing: w2.m > 0.05 ? w2.facing : (t < 0.3 || t > 1.4 ? -1 : 1), armR: 8 + 80 * hump(seg(t, 0.2, 1.4)), armL: 8 + 120 * hump(seg(t, 3.7, 4.4)), lift: 6 * hump(seg(t, 3.8, 4.2)), look: 0.5, mood: talk(t, 0.3, 1.0) || (t > 3.6 ? 'grin' : 'flat'), blink: blinkAt(t, 1.0) });
      bub.show(seg(t, 0.3, 0.55) * (1 - seg(t, 1.4, 1.6)), 236, 104);
    }
  };
}
