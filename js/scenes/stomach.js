// stomach：ケーキを何皿も食べたあと、おなかの中の胃が痛んで両手でおなかを押さえる（例文 My stomach hurts after eating too much cake.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, hp } from './hospital.js';
import { table } from './dig.js';
import { cake } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, 'ケーキを食べる'], [1.6, '食べすぎた'], [2.6, '胃が痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 196);
  const FY = 236;
  el('rect', { x: 250, y: 50, width: 90, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 295, y1: 50, x2: 295, y2: 116, stroke: '#fff', 'stroke-width': 4 });
  // 空いた皿の山
  [0, 1, 2, 3].forEach((i) => { el('ellipse', { cx: 330, cy: TY - 2 - i * 5, rx: 24, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }); });
  [[318, TY - 21], [338, TY - 22], [328, TY - 23]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.6, fill: '#E8C890' }));
  // 最後の一切れ
  el('ellipse', { cx: 250, cy: TY, rx: 24, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const piece = cake(k); tf(piece, 250, TY - 2, 0, 0.9);
  const S = 1.05;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  // 胃（おなかの中に見える）
  const st = g({});
  b.body.insertBefore(st, b.armR.a.parentNode);
  el('path', { d: 'M -6 -52 Q -6 -40 -2 -36', fill: 'none', stroke: '#F29AA6', 'stroke-width': 5, 'stroke-linecap': 'round' }, st);
  el('path', { d: 'M -4 -38 Q 12 -44 16 -30 Q 18 -14 2 -12 Q -10 -11 -14 -18 Q -10 -22 -2 -22 Q 6 -24 4 -32 Z', fill: '#F7B3BC', stroke: '#E07A8A', 'stroke-width': 2, 'stroke-linejoin': 'round' }, st);
  const ache = g({}, st);
  [[22, -34, 30], [24, -18, 80], [-18, -28, -40]].forEach(([x, y, r]) => { const z = g({}, ache); tf(z, x, y, r); el('path', { d: 'M 0 -6 L 3 -2 L -2 1 L 1 6', fill: 'none', stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, z); });
  // フォーク
  const fork = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 22, stroke: '#9AA6B6', 'stroke-width': 3, 'stroke-linecap': 'round' }, fork);
  [-3, 0, 3].forEach((x) => el('line', { x1: x, y1: 20, x2: x, y2: 28, stroke: '#9AA6B6', 'stroke-width': 1.6 }, fork));
  const bite = el('circle', { r: 4.5, fill: '#FFF1D6', stroke: '#F7B7C4', 'stroke-width': 1.5 });
  const sweat = el('path', { d: 'M 0 -7 Q 5 0 0 5 Q -5 0 0 -7 Z', fill: pal.water });
  return {
    update(t) {
      // 2口食べる
      const eat = (a) => hump(seg(t, a, a + 0.65));
      const e = Math.max(eat(0.2), eat(0.95));
      const ate = seg(t, 0.55, 0.6) * 0.5 + seg(t, 1.3, 1.35) * 0.5;
      tf(piece, 250, TY - 2, 0, 0.9, Math.max(0.001, 0.9 * (1 - ate)));
      const hold = easeOut(seg(t, 1.9, 2.4));
      const throb = 0.5 + 0.5 * Math.sin(t * 10);
      P(b, { look: lerp(0.5, 0, hold), mood: t > 1.9 ? 'sad' : e > 0.6 ? 'open' : 'smile', blink: hold * 0.6, lean: lerp(4, 12, hold), squash: 1 - 0.05 * hold * throb,
        armL: lerp(8, -20, hold), armR: t < 1.7 ? 50 + 0 : 50 });
      // フォーク：皿と口の間を往復
      const plate = { x: 238, y: TY - 12 }, mouthP = { x: 150 + 18 * S, y: FY - 54 * S };
      const tgt = { x: lerp(plate.x, mouthP.x + 8, e), y: lerp(plate.y, mouthP.y, e) };
      const ang = reach(b, S, 'R', tgt.x, tgt.y);
      const belly = { x: 150 + 12 * S, y: FY - 40 * S };
      P(b, { ...b.state, armR: lerp(t < 1.6 ? ang : lerp(ang, 8, seg(t, 1.6, 1.9)), reach(b, S, 'R', belly.x, belly.y), hold) });
      const h = hp(b, S, 'R', 28);
      tf(fork, h.x, h.y, -(b.state.armR - b.state.lean) + 180 + 90 * 0, S * 0.8);
      fork.setAttribute('transform', `translate(${h.x.toFixed(1)} ${h.y.toFixed(1)}) rotate(${(-b.state.armR + b.state.lean).toFixed(1)}) scale(${S * 0.8})`);
      fork.setAttribute('opacity', t < 1.75 ? 1 : 0);
      const loaded = (t > 0.25 && t < 0.58) || (t > 1.0 && t < 1.33);
      const fh = hp(b, S, 'R', 50);
      tf(bite, fh.x, fh.y); bite.setAttribute('opacity', loaded ? 1 : 0);
      st.setAttribute('opacity', easeOut(seg(t, 1.8, 2.3)));
      tf(ache, 0, 0, 0, 1 + 0.12 * throb); ache.setAttribute('opacity', seg(t, 2.1, 2.4) * (0.5 + 0.5 * throb));
      const sq = seg(t, 2.6, 3.8);
      tf(sweat, 150 - 30 * S, FY - 90 * S + 26 * sq); sweat.setAttribute('opacity', t > 2.6 ? 1 - sq : 0);
    }
  };
}
