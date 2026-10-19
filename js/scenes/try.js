// try：相手がケーキの皿を差し出して「食べてみて」。まめがフォークでひと口取って食べ、目を輝かせて「おいしい！」（例文 Try this cake. It's delicious.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { cue, talk } from './in-common.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, 'どうぞ'], [1.4, 'ひと口食べる'], [2.8, 'おいしい！']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k, 236);
  const S = 1;
  const me = k.buddy({ x: 140, y: FY, scale: S });
  const her = k.buddy({ x: 268, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // ケーキの皿（相手の手）
  const pl = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, pl);
  el('path', { d: 'M -14 -1 L -14 -16 L 14 -20 L 14 -1 Z', fill: '#7A4A33' }, pl);
  el('path', { d: 'M -14 -9 L 14 -11', stroke: '#F4E1C1', 'stroke-width': 3 }, pl);
  el('path', { d: 'M -14 -16 L 14 -20', stroke: '#5A3424', 'stroke-width': 4 }, pl);
  const bite = el('circle', { cx: -14, cy: -10, r: 0.01, fill: pal.white }, pl);
  // フォークとひと口
  const fk = g({});
  el('rect', { x: -1.5, y: -18, width: 3, height: 22, rx: 1.5, fill: '#B9C3D0' }, fk);
  [-3, 0, 3].forEach((x) => el('rect', { x: x - 0.8, y: 4, width: 1.6, height: 7, fill: '#B9C3D0' }, fk));
  const morsel = el('path', { d: 'M -4 9 L 4 9 L 4 15 L -4 15 Z', fill: '#7A4A33' }, fk);
  const say = cue(k, 'try this!', 80, 28, 1, 13);
  const yum = cue(k, 'yum!', 52, 28, -1, 14);
  const stars = [0, 1, 2].map(() => star(k, k.root, 7, pal.yellow));
  return {
    update(t) {
      const off = easeOut(seg(t, 0.2, 0.7));
      P(her, { lean: 6 * off, look: 0.6, mood: talk(t, 0.3, 1.0) || 'smile', armR: 8 + 72 * off - 4 * Math.sin(t * 2) * off, blink: blinkAt(t, 1.4) });
      const hh = hp(her, S, 'R', 28);
      tf(pl, hh.x - 6, hh.y - 2);
      // まめ：フォークで皿から取る（1.2-1.6）→ 口へ（1.7-2.1）→ もぐもぐ
      const go = easeInOut(seg(t, 1.1, 1.5)), up = easeInOut(seg(t, 1.6, 2.1)), down = easeInOut(seg(t, 2.6, 3.0));
      const plateP = { x: hh.x - 16, y: hh.y - 14 }, mouth = { x: 152, y: FY - 54 };
      let tg = { x: lerp(176, plateP.x, go), y: lerp(FY - 20, plateP.y, go) };
      if (t > 1.55) tg = { x: lerp(plateP.x, mouth.x, up), y: lerp(plateP.y, mouth.y, up) - 8 * hump(up) };
      if (t > 2.55) tg = { x: lerp(mouth.x, 178, down), y: lerp(mouth.y, FY - 36, down) };
      const chew = t > 2.1 && t < 2.8 ? Math.abs(Math.sin((t - 2.1) * 14)) : 0;
      const joy = easeOut(seg(t, 2.8, 3.1));
      P(me, { look: 0.6, lean: 6 * go * (1 - up) + 2, squash: 1 - 0.04 * chew + 0.05 * hump(seg(t, 2.8, 3.1)), lift: 8 * hump(seg(t, 2.85, 3.3)), mood: t > 2.1 && t < 2.8 ? (chew > 0.5 ? 'open' : 'flat') : t > 2.8 ? 'grin' : 'smile', blink: t > 2.1 && t < 2.8 ? 1 : blinkAt(t, 0.2), armL: 8 + 130 * joy });
      me.pose({ armR: t < 1.05 ? 8 : reach(me, S, 'R', tg.x, tg.y) });
      const mh = hp(me, S, 'R', 28);
      tf(fk, mh.x + 2, mh.y - 4, 20); fk.setAttribute('opacity', t > 1.0 ? 1 : 0);
      morsel.setAttribute('opacity', t > 1.5 && t < 2.1 ? 1 : 0);
      bite.setAttribute('r', t > 1.5 ? 4.5 : 0.01);
      say.show(seg(t, 0.3, 0.55) * (1 - seg(t, 1.3, 1.5)), 290, 116);
      yum.show(seg(t, 2.9, 3.15), 112, 112);
      stars.forEach((s, i) => { const q = seg(t, 2.9 + i * 0.15, 3.6 + i * 0.15); tf(s, 120 + i * 24 + (i - 1) * 8 * q, 150 - (i % 2) * 18 - 12 * q, q * 90, Math.max(0.001, hump(q) * 1.2)); });
    }
  };
}
