// kind：まめはだれにでも親切。おばあさんが落としたりんごを拾って渡し、泣いている子の頭をなでて笑顔にする（例文 She is kind to everyone.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { CO, YE, hp, reach, P, blinkAt, walkTo, path, sc } from './member.js';
import { parkBg, tree } from './run-after.js';
import { icon, drop } from './in-common.js';
import { heart } from './weigh.js';
import { bagProp } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, '落とし物'], [1.0, '拾って渡す'], [2.6, 'みんなに優しい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 236;
  parkBg(k, FY);
  tree(k, 200, FY - 4, 1.2);
  const gm = k.buddy({ x: 80, y: FY, scale: 0.9, facing: 1, ...CO(k) });
  el('path', { d: 'M -22 -78 Q 0 -96 22 -78 Q 0 -86 -22 -78 Z', fill: '#E9E4F0' }, gm.body);
  const bag = bagProp(k, k.root, '#B98C5A', '#8F6A42', 24, 22);
  const kid = k.buddy({ x: 330, y: FY, scale: 0.6, facing: -1, ...YE(k) });
  const b = k.buddy({ x: 190, y: FY, scale: S, facing: -1 });
  const ap = icon(k, 'apple');
  const tears = [0, 1].map(() => drop(k));
  const hs = [0, 1].map(() => heart(k));
  const bx = path([[0.2, 190], [0.7, 132], [1.9, 132], [2.6, 278]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 190, -1);
      // りんご：袋から落ちて転がる → 拾われ → 渡される
      const fall = easeIn(seg(t, 0, 0.35)), roll = easeOut(seg(t, 0.35, 0.8));
      const pick = seg(t, 0.8, 1.1), give = seg(t, 1.3, 1.6);
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean + 30 * hump(seg(t, 0.7, 1.3)), facing: t < 2.0 ? -1 : 1, look: 0.6, blink: blinkAt(t), mood: 'smile' });
      const ax = lerp(104, 116, roll), ay = lerp(FY - 30, FY - 6, fall);
      if (t > 0.7 && t < 1.7) b.pose({ armR: t < 1.1 ? reach(b, S, 'R', ax, FY - 4) : lerp(reach(b, S, 'R', ax, FY - 4), 80, easeInOut(seg(t, 1.1, 1.5))) });
      const gh = hp(gm, 0.9, 'R', 30);
      P(gm, { look: 0.6, blink: blinkAt(t, 1), mood: t > 1.5 ? 'grin' : t > 0.3 ? 'open' : 'smile', armR: lerp(20, 70, seg(t, 1.3, 1.6)) * (1 - seg(t, 2.0, 2.3) * 0.7), lean: -4 * seg(t, 0.2, 0.4) });
      tf(bag, gh.x, gh.y - 4, 0, 0.9);
      const bh = hp(b, S, 'R', 30);
      if (t < 1.0) tf(ap, ax, ay - 2, roll * 360, 0.7);
      else if (t < 1.6) tf(ap, bh.x, bh.y - 2, 0, 0.7);
      else tf(ap, gh.x, gh.y + 6, 0, 0.7 * (1 - seg(t, 2.0, 2.2)) + 0.001);
      // 泣いている子の頭をなでる
      const pat = t > 2.6 ? Math.sin((t - 2.6) * 10) : 0, happy = t > 3.3;
      if (t > 2.5) b.pose({ armR: reach(b, S, 'R', 322 + 3 * pat, FY - 62), lean: 8 });
      P(kid, { look: 0.5, blink: happy ? 0 : 0.6, mood: happy ? 'grin' : 'sad', squash: happy ? 1 : 0.96 + 0.02 * Math.sin(t * 14), lift: happy ? 6 * hump(seg(t, 3.4, 3.8)) : 0 });
      tears.forEach((d, i) => { const q = ((t * 1.5 + i * 0.5) % 1); tf(d, 330 + (i ? -14 : 14), FY - 30 + 16 * q, 0, happy ? 0.001 : sc(1 - q) * 0.7); });
      hs.forEach((h, i) => { const q = seg(t, i ? 3.4 : 1.7, i ? 4.3 : 2.6); tf(h, i ? 300 : 100, FY - 110 - 20 * q, 0, sc(hump(q))); });
    }
  };
}
