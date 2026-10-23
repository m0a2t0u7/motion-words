// free：友だちに「週末ひま？」と聞かれ、まめがスマホの予定を見る。土日は空いていて、うれしくうなずく（例文 Are you free this weekend?）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, pop } from './member.js';
import { phone } from './look-over.js';
import { cue, talk } from './in-common.js';
import { mark } from './so-far-so-good.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '週末ひま？'], [1.4, '予定を見る'], [2.8, '空いてる！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  streetBg(k, FY);
  const fr = k.buddy({ x: 300, y: FY, scale: 1, facing: -1, ...CO(k) });
  const b = k.buddy({ x: 140, y: FY, scale: S, facing: 1 });
  const ask = cue(k, 'This weekend?', 112, 30, 1, 12);
  const ph = phone(k);
  // スマホの予定表を大きく見せる
  const zoom = g({});
  el('rect', { x: -66, y: -40, width: 132, height: 80, rx: 10, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 }, zoom);
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => {
    const x = -54 + i * 18;
    k.text(x, -26, d, { 'font-size': 10, fill: i > 4 ? pal.blueDark : pal.sub }, zoom);
    el('rect', { x: x - 7, y: -16, width: 14, height: 44, rx: 3, fill: i > 4 ? '#E6F4FF' : pal.floor }, zoom);
    if (i <= 4) el('rect', { x: x - 6, y: -12 + (i % 2) * 12, width: 12, height: 10, rx: 2, fill: pal.coral, opacity: 0.6 }, zoom);
  });
  const ok = mark(k, 'check', zoom, 1.5); tf(ok, 45, 6, 0, 0.001);
  const yes = cue(k, 'Free!', 60, 30, -1, 14);
  return {
    update(t) {
      P(fr, { look: 0.6, blink: blinkAt(t, 1), mood: talk(t, 0.3, 1.1) || (t > 3 ? 'grin' : 'smile'), armR: 8 + 60 * hump(seg(t, 0.3, 1.2)), lift: 8 * hump(seg(t, 3.2, 3.6)) });
      ask.show(seg(t, 0.3, 0.6) - seg(t, 1.6, 1.8), 270, 110);
      const look = easeInOut(seg(t, 1.2, 1.6)) * (1 - easeInOut(seg(t, 3.0, 3.3)));
      const nod = t > 3.0 && t < 3.8 ? Math.abs(Math.sin((t - 3.0) * 8)) : 0;
      P(b, { look: look > 0.5 ? 0.3 : 0.6, lean: 8 * look + 8 * nod, blink: blinkAt(t), mood: t > 2.6 ? 'grin' : 'flat' });
      b.pose({ armR: lerp(10, reach(b, S, 'R', 140 + 40, FY - 66), look) });
      const h = hp(b, S, 'R', 28); tf(ph.g, h.x + 2, h.y - 6, 0, look < 0.05 ? 0.001 : 1.1);
      tf(zoom, 150, 80, 0, pop(seg(t, 1.6, 2.0)) * (1 - seg(t, 3.1, 3.3) * 0.999));
      tf(ok, 45, 6, 0, pop(seg(t, 2.4, 2.7)));
      yes.show(seg(t, 3.2, 3.5), 176, 116);
    }
  };
}
