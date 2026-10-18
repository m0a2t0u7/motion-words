// up to you：「ピザとパスタどっち？」と聞かれ、まめは両手を相手に向けて「君が選んで」。決めるのは相手（例文 "Pizza or pasta?" "It's up to you."）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, say, cue, icon } from './in-common.js';

export const meta = { duration: 4.2, beats: [[0, 'どっち？'], [1.6, '君が決めて'], [3.0, '相手が考える']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 160, y: 36, width: 80, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // テーブル（奥）
  k.shadow(200, FY, 70, 5);
  el('rect', { x: 145, y: 200, width: 110, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 194, y: 208, width: 12, height: FY - 208, fill: pal.woodDark });
  el('rect', { x: 176, y: FY - 4, width: 48, height: 4, rx: 2, fill: pal.woodDark });
  const C = k.buddy({ x: 120, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 280, y: FY, scale: 0.9, facing: -1 });
  const q = say(k, 100, 40, 1);
  const pz = icon(k, 'pizza', q.g), ps = icon(k, 'pasta', q.g);
  tf(pz, -28, 0); tf(ps, 28, 0); k.text(0, 1, 'or', { 'font-size': 12, fill: pal.sub }, q.g);
  const r = cue(k, 'You pick!', 92, 30, -1, 14);
  const th = say(k, 76, 36, 1);
  const tp = icon(k, 'pizza', th.g), ts = icon(k, 'pasta', th.g); tf(tp, -16, 0); tf(ts, 16, 0);
  const hl = el('circle', { r: 15, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 2.5 }, th.g);
  return {
    update(t) {
      const ask = t > 0.2 && t < 1.4;
      P(C, { look: 0.6, mood: ask && Math.sin(t * 20) > 0 ? 'open' : 'smile', armR: ask ? 60 + 10 * Math.sin(t * 6) : t > 2.9 ? lerp(8, 150, easeOut(seg(t, 2.9, 3.3))) : 8, lean: ask ? 4 : 0 });
      q.show(seg(t, 0.25, 0.5) * (1 - seg(t, 1.5, 1.7)), 150, 104);
      // まめ：肩をすくめて両手のひらを相手へ
      const give = easeOut(seg(t, 1.6, 2.0)) * (1 - easeInOut(seg(t, 3.5, 3.9)));
      const sp = t > 1.6 && t < 2.6 && Math.sin(t * 20) > 0;
      P(A, { look: 0.6, mood: sp ? 'open' : 'grin', armR: lerp(8, 82, give), armL: lerp(8, 70, give), lean: 6 * give, lift: 3 * hump(seg(t, 1.6, 2.0)) });
      r.show(seg(t, 1.7, 1.95) * (1 - seg(t, 2.8, 3.0)), 256, 104);
      // ピンク：考える（決めるのは自分）
      th.show(seg(t, 3.0, 3.3), 136, 100);
      const side = Math.sin((t - 3.0) * 6) > 0 ? -16 : 16;
      k.set(hl, { cx: side, opacity: t > 3.2 ? 1 : 0 });
      if (t > 3.0) C.pose({ look: 0.2 + 0.3 * Math.sin(t * 4), lean: -3, mood: 'flat' });
    }
  };
}
