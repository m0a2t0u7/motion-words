// no hard feelings：かけっこで相手が先にゴールテープを切る→負けたまめは笑って歩み寄り、握手する（例文 You won fair and square. No hard feelings.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, run, reach, hp, cue } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, 'かけっこ'], [1.4, '相手の勝ち'], [3.0, '笑って握手']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 40, fill: '#E9A07A' });
  [212, 226].forEach((y) => el('rect', { x: 0, y, width: 400, height: 2, fill: '#fff', opacity: 0.7 }));
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#9ED9B0' });
  [[40, 130], [130, 150], [370, 140]].forEach(([x, y]) => { el('circle', { cx: x, cy: y, r: 30, fill: '#9ED9B0' }); el('rect', { x: x - 4, y, width: 8, height: 200 - y, fill: pal.woodDark }); });
  // ゴール（奥の柱）
  el('rect', { x: 312, y: 120, width: 6, height: 80, fill: pal.sub });
  const tapeL = el('path', { d: '', stroke: pal.red, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  const tapeR = el('path', { d: '', stroke: pal.red, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  const A = k.buddy({ x: -100, y: 232, scale: 0.84 });
  const C = k.buddy({ x: -40, y: 232, scale: 0.84, color: pal.coral, dark: pal.coralDark });
  el('rect', { x: 298, y: 134, width: 6, height: 100, fill: pal.sub });
  const ok = cue(k, 'Well done!', 92, 30, -1, 14);
  const xc = (t) => lerp(-40, 352, easeOut(seg(t, 0, 1.5)));
  const xa = (t) => t < 1.95 ? lerp(-100, 270, easeOut(seg(t, 0, 1.95))) : 270;
  return {
    update(t) {
      // テープ：ピンクが胸で切る（t≈1.15）
      const TY = 172, cut = 1.12;
      if (t < cut) { k.set(tapeL, { d: `M 301 ${TY} Q 308 ${TY - 2} 315 ${TY - 10}` }); k.set(tapeR, { d: '' }); }
      else {
        const s = seg(t, cut, cut + 1.2), w = wobble(s, 2, 3) * 10;
        k.set(tapeL, { d: `M 301 ${TY} Q ${296 - 4 * s} ${TY + 10 + w} ${290 - 6 * s} ${TY + 26 - 6 * s}` });
        k.set(tapeR, { d: `M 315 ${TY - 10} Q ${320 + 4 * s} ${TY + w} ${324 + 6 * s} ${TY + 16 - 6 * s}` });
      }
      const rc = run(xc, t, -40, 1), ra = run(xa, t, -100, 1);
      const win = easeOut(seg(t, 1.45, 1.8));
      const shakeT = seg(t, 2.6, 3.0), sh = t > 3.0 && t < 3.9 ? Math.sin((t - 3.0) * 18) * 5 : 0;
      if (t < 1.5) P(C, { x: rc.x, y: 232, walk: rc.walk, armL: rc.armL, armR: rc.armR, lean: rc.lean, lift: rc.lift, look: 0.6, mood: 'open' });
      else P(C, { x: 352, y: 232, facing: t > 2.4 ? -1 : 1, look: 0.6, mood: 'grin', armR: t < 2.4 ? lerp(8, 170, win) : 8, armL: t < 2.4 ? lerp(8, 170, win) : 8, lift: 8 * hump(seg(t, 1.5, 1.9)) });
      if (t < 1.95) P(A, { x: ra.x, y: 232, walk: ra.walk, armL: ra.armL, armR: ra.armR, lean: ra.lean, lift: ra.lift, look: 0.6, mood: 'open' });
      else P(A, { x: 270, y: 232, look: 0.6, mood: t > 2.4 ? 'grin' : 'flat', lean: lerp(12, 0, seg(t, 1.95, 2.4)), squash: 1 - 0.03 * Math.max(0, Math.sin(t * 14)) * (1 - seg(t, 1.95, 2.6)) });
      // 握手：両者が手を伸ばして中央で合わせ、上下に振る
      if (t > 2.5) {
        const mx = 311, my = 196 + sh, e = easeInOut(shakeT);
        A.pose({ armR: lerp(8, reach(A, 0.84, 'R', mx, my), e) });
        C.pose({ armR: lerp(8, reach(C, 0.84, 'R', mx, my), e), mood: 'grin' });
      }
      ok.show(seg(t, 2.6, 2.85) * (1 - seg(t, 4.0, 4.2)), 238, 108);
    }
  };
}
