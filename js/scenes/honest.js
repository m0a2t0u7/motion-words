// honest：「正直に話して」と聞かれ、まめは背中に隠していた割れたお皿を前に出して見せ、頭を下げる（例文 Please be honest with me about the problem.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, person, homeBg, cue, mark, sweat, talk } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '何か隠してる？'], [1.6, '正直に見せる'], [3.2, 'うそをつかない']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = homeBg(k, { winX: 160 });
  // 割れた皿（2片）
  const plate = g({});
  const pa = el('path', { d: 'M -16 0 A 16 6 0 0 0 0 6 L -2 -1 L 2 -4 L 0 -6 A 16 6 0 0 0 -16 0 Z', fill: '#fff', stroke: pal.blueDark, 'stroke-width': 1.8 }, plate);
  const pb = el('path', { d: 'M 0 6 A 16 6 0 0 0 0 -6 L 2 -4 L -2 -1 Z', fill: '#fff', stroke: pal.blueDark, 'stroke-width': 1.8 }, plate);
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const mom = person(k, 'coral', { x: 290, y: FY, scale: 1, facing: -1 });
  const q = cue(k, '?', 40, 30, 1, 18);
  const ok = mark(k, 'check', undefined, 1.8), sw = sweat(k);
  return {
    update(t) {
      const show = easeInOut(seg(t, 1.6, 2.3)), bow = hump(seg(t, 2.6, 3.6)) * 0.9, after = seg(t, 3.4, 3.8);
      // 隠している間：腕を後ろへ、目をそらす
      P(b, { x: 150, armR: lerp(-40, 40, show), armL: lerp(-30, 40, show), lean: 22 * bow, look: lerp(-0.7, 0.6, show), mood: t < 1.5 ? 'flat' : t < 3.4 ? 'sad' : 'smile', blink: bow > 0.4 ? 1 : blinkAt(t) });
      const r = hp(b, S, 'R'), l = hp(b, S, 'L');
      tf(plate, (r.x + l.x) / 2, (r.y + l.y) / 2 - 4, 0, 1.3);
      if (show > 0.4) k.root.appendChild(plate); else k.root.insertBefore(plate, b.g);
      // 2片をそろえて持つ（前に出すと割れ目が見える）
      pb.setAttribute('transform', `translate(${(3 * show).toFixed(2)} ${(2 * show).toFixed(2)}) rotate(${(10 * show).toFixed(2)})`);
      sw((t * 1.1) % 1 * (t < 1.6 ? 1 : 0), 128, FY - 94);
      P(mom, { x: 290, facing: -1, armR: t < 1.6 ? 40 : lerp(40, 10, seg(t, 1.6, 2)), armL: 8, look: 0.6, mood: talk(t, 0.3, 1.2) || (t > 3.3 ? 'grin' : 'flat'), blink: blinkAt(t, 1), lean: 4 });
      if (t > 3.6) mom.pose({ armR: lerp(10, 110, easeOut(seg(t, 3.6, 4.0))) });
      q.show(seg(t, 0.3, 0.6) * (1 - seg(t, 1.5, 1.7)), 262, FY - 126);
      tf(ok, 220, FY - 140, 0, t > 3.5 ? 1.8 * easeOut(seg(t, 3.5, 3.8)) : 0.001);
    }
  };
}
