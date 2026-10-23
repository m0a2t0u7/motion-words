// proud：がんばって勉強したまめが100点の答案を見せ、親が胸を張って頭をなでる（例文 I'm proud of you for working so hard.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt, hp, hold, aim, walkTo, path, person, homeBg, desk, paper, pencil, heart, sweat } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '一生けんめい'], [1.8, '100点！'], [3.0, '誇らしい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9, M = 1;
  const FY = homeBg(k, { winX: 40 });
  const b = k.buddy({ x: 130, y: FY, scale: S });
  const top = FY - 30;
  k.shadow(150, FY + 1, 64, 4);
  el('rect', { x: 86, y: top, width: 128, height: 8, rx: 3, fill: pal.wood });
  [92, 202].forEach((x) => el('rect', { x, y: top + 8, width: 6, height: 22, fill: pal.woodDark }));
  el('rect', { x: 92, y: top - 14, width: 26, height: 14, rx: 2, fill: pal.blue });
  el('rect', { x: 96, y: top - 24, width: 22, height: 10, rx: 2, fill: pal.coral });
  const mom = person(k, 'coral', { x: 360, y: FY, scale: M, facing: -1 });
  const pen = pencil(k), sheet = g({});
  paper(k, sheet, 34, 40, 3);
  const ok = g({}, sheet);
  el('circle', { cx: 0, cy: 4, r: 12, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 }, ok);
  k.text(0, 5, '100', { 'font-size': 10, fill: pal.red }, ok);
  const sw = sweat(k), hs = [0, 1, 2].map(() => heart(k));
  const bx = path([[1.9, 130], [2.8, 272]]);
  return {
    update(t) {
      const study = t < 1.7, w = walkTo(bx, t, 130, 1), show = easeOut(seg(t, 1.6, 1.9));
      P(b, { x: w.x, walk: w.walk, lean: study ? 14 : w.lean, look: study ? 0.6 : 0.8, armR: study ? 55 + 10 * Math.sin(t * 24) : w.armR, armL: study ? 20 : lerp(20, 150, show),
        mood: study ? 'flat' : 'grin', blink: blinkAt(t) });
      if (study) aim(b, S, 'R', 166 + 10 * Math.sin(t * 24), top - 22);
      hold(k, b, S, pen, 'R', -30); pen.setAttribute('opacity', study ? 1 : 0);
      const h = hp(b, S, 'L');
      if (study) tf(sheet, 170, top - 2, 0, 1.1, 0.14); else tf(sheet, h.x, h.y - 16, 0, 0.9);
      ok.setAttribute('opacity', study ? 0 : 1);
      sw((t * 1.3) % 1 * (study ? 1 : 0), 130, FY - 78);
      // 親：近づいて胸を張り、頭をなでる
      const pat = seg(t, 2.9, 4.4), pr = easeOut(seg(t, 2.7, 3.1));
      const mx = lerp(360, 330, easeInOut(seg(t, 2.2, 2.8)));
      P(mom, { x: mx, facing: -1, lean: -8 * pr, look: 0.5, mood: t > 2.2 ? 'grin' : 'smile', blink: t > 2.9 ? 1 : blinkAt(t), armL: 20 + 10 * pr });
      if (t > 2.6) aim(mom, M, 'R', w.x + 4 + 6 * Math.sin(pat * 18), FY - 84 * S - 10);
      hs.forEach((n, i) => { const q = seg(t, 3.1 + i * 0.25, 4.2 + i * 0.1); tf(n, 250 + i * 30, FY - 120 - 30 * q, 0, Math.max(0.001, hump(q) * 1.2)); });
    }
  };
}
