// no big deal：遅れて駆けこんできた相手が「ごめん」と深くおじぎ→まめは笑って手をひらひら「気にしないで」（例文 "Sorry I'm late." "No big deal."）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, run, cue, clock, drop, streetBg } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '遅れて到着'], [1.4, 'ごめんね'], [2.8, '気にしないで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 待ち合わせの時計（ポール付き）
  el('rect', { x: 196, y: 70, width: 8, height: FY - 70, fill: pal.sub });
  const ck = clock(k, 200, 62, 20);
  const A = k.buddy({ x: 120, y: FY + 8, scale: 0.9 });
  const C = k.buddy({ x: 460, y: FY + 8, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const sorry = cue(k, 'Sorry!', 70, 30, 1, 15);
  const ok = cue(k, "It's OK!", 82, 30, -1, 15);
  const sw = drop(k);
  const xc = (t) => lerp(460, 270, easeOut(seg(t, 0, 1.3)));
  return {
    update(t) {
      ck.set(10, lerp(14, 20, seg(t, 0, 4.4)));
      // ピンク：走ってきて、深くおじぎ→ほっとする
      const r = run(xc, t, 460, -1);
      const bow = hump(seg(t, 1.4, 2.8));
      if (t < 1.3) P(C, { x: r.x, y: FY + 8, walk: r.walk, armL: r.armL, armR: r.armR, lean: r.lean, lift: r.lift, facing: -1, look: 0.6, mood: 'open' });
      else P(C, { x: 270, y: FY + 8, facing: -1, look: 0.6, lean: 30 * bow, armL: 8 + 20 * bow, armR: 8 + 20 * bow, mood: t < 3.0 ? 'sad' : 'grin', squash: 1 - 0.03 * hump(seg(t, 1.3, 1.5)) });
      sorry.show(seg(t, 1.5, 1.8) * (1 - seg(t, 2.6, 2.8)), 248, 104);
      // まめ：笑って手をひらひら
      const wave = easeOut(seg(t, 2.6, 2.9));
      P(A, { x: 120, y: FY + 8, look: 0.6, mood: t > 2.7 && t < 3.6 && Math.sin(t * 20) > 0 ? 'open' : 'grin', armR: lerp(8, 110 + 22 * Math.sin(t * 12), wave), lean: -3 * wave });
      ok.show(seg(t, 2.8, 3.05), 150, 104);
      sw.setAttribute('opacity', t > 1.0 && t < 2.9 ? 1 : 0); tf(sw, 300, FY - 90 + 12 * seg(t, 1.0, 2.9));
    }
  };
}
