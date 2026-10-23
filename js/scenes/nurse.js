// nurse：看護師のまめが患者のわきに体温計をはさみ、目盛りが上がるのを見て記録する（例文 The nurse took my temperature.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, walkTo, path } from './member.js';
import { coat, cap, clinicBg, thermo } from './hospital.js';
import { cue } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '体温計を持つ'], [1.2, '体温をはかる'], [3.2, '36.5℃']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  clinicBg(k, FY);
  // 丸いす
  el('rect', { x: 262, y: FY - 40, width: 50, height: 8, rx: 4, fill: '#7FB3E8' });
  el('rect', { x: 283, y: FY - 32, width: 8, height: 32, fill: pal.sub });
  const me = k.buddy({ x: 287, y: FY - 32, scale: 0.85, facing: -1, ...CO(k) }); me.g.firstChild.setAttribute('display', 'none');
  const b = k.buddy({ x: 90, y: FY, scale: S }); coat(k, b); cap(k, b);
  const th = thermo(k);
  const read = cue(k, '36.5', 60, 30, 1, 15);
  const bx = path([[0.2, 90], [1.0, 200]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 90, 1), put = easeInOut(seg(t, 1.0, 1.5)), take = easeInOut(seg(t, 2.8, 3.2));
      // 患者のわき（左腕の付け根）
      const arm = { x: 287 - 22 * 0.85, y: FY - 32 - 50 * 0.85 };
      P(me, { y: FY - 32, look: 0.5, blink: blinkAt(t, 1), mood: t > 3.2 ? 'smile' : 'flat', armR: lerp(8, 30, put) * (1 - take) + 8 * take });
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(w.armR, 80, seg(t, 0, 0.3)), lean: w.lean + 6 * put, look: 0.7, blink: blinkAt(t), mood: 'smile' });
      const tgt = { x: lerp(arm.x - 10, arm.x, put), y: lerp(arm.y + 10, arm.y + 4, put) };
      const holdUp = { x: w.x + 44, y: FY - 80 };
      if (t > 0.8) b.pose({ armR: reach(b, S, 'R', lerp(tgt.x, holdUp.x, take), lerp(tgt.y, holdUp.y, take)) });
      const h = hp(b, S, 'R', 30);
      tf(th.g, h.x + 2, h.y + 18, lerp(lerp(20, 60, put), -10, take), 0.8);
      th.set(lerp(0.2, 0.75, easeOut(seg(t, 1.6, 2.8))));
      read.show(seg(t, 3.2, 3.5), w.x + 70, FY - 130);
    }
  };
}
