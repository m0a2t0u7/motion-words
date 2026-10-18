// talk out of：彼が危ないがけを登ろうとロープに手をかける→ぼくら二人が危険を話して止める→彼はロープを放して戻ってくる（例文 We talked him out of the dangerous climb.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { say, faceAt, walkPose } from './look-over.js';

export const meta = { duration: 4.8, beats: [[0, '登ろうとする'], [1.6, '危ないと話す'], [3.4, 'やめて戻る']] };

export function warn(k, parent, s = 1) {
  const n = k.g({}, parent);
  k.el('path', { d: 'M 0 -12 L 13 10 L -13 10 Z', fill: k.pal.yellow, stroke: k.pal.ink, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, n);
  k.text(0, 3, '!', { 'font-size': 14 }, n);
  k.tf(n, 0, 0, 0, s);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240 });
  el('rect', { x: 0, y: 240, width: 400, height: 60, fill: '#D7EFCF' });
  // がけ
  el('path', { d: 'M 300 240 L 318 160 L 306 110 L 330 40 L 400 30 L 400 240 Z', fill: '#B9A792' });
  el('path', { d: 'M 318 160 L 340 150 M 306 110 L 330 116 M 330 70 L 352 66', stroke: '#9C8B77', 'stroke-width': 3, 'stroke-linecap': 'round' });
  const rope = el('path', { d: '', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const sign = g({}); el('rect', { x: -2, y: 0, width: 4, height: 34, fill: pal.woodDark }, sign); const w1 = warn(k, sign, 1.1); tf(w1, 0, -6, 0, 1.1); tf(sign, 268, 206);
  const W = [k.buddy({ x: 50, y: 240, scale: 0.8 }), k.buddy({ x: 100, y: 240, scale: 0.8, color: pal.blue, dark: pal.blueDark })];
  const him = k.buddy({ x: 296, y: 240, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  const sa = say(k, 40, 34, 1), sb = say(k, 40, 34, 1);
  warn(k, sa.g, 0.9); el('path', { d: 'M -6 -6 L 6 6 M 6 -6 L -6 6', stroke: pal.red, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, sb.g);
  const xf = (t) => lerp(296, 170, easeInOut(seg(t, 3.0, 4.2)));
  return {
    update(t) {
      const grab = easeOut(seg(t, 0.2, 0.7)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      const p = walkPose(xf, t, 296);
      const turn = seg(t, 1.4, 1.7) > 0.5 && t < 2.9 || t > 2.9;
      him.pose({ x: p.x, walk: p.walk, facing: turn ? -1 : 1, armR: turn ? (t > 2.9 ? p.armR : 10) : 8 + 160 * grab, armL: turn ? p.armL : 8 + 150 * grab, lift: 6 * grab * (turn ? 0 : 1), lean: p.lean, mood: t > 3.6 ? 'smile' : t > 1.6 ? 'flat' : 'grin', look: 0.5 });
      const hx = 316, top = 60, hand = lerp(220, 176, grab);
      k.set(rope, { d: t < 2.8 ? `M 334 ${top} Q 312 ${(top + hand) / 2} ${turn ? 314 : hx} ${hand} L ${turn ? 314 : hx} 236` : `M 334 ${top} Q 322 140 316 236` });
      W.forEach((w, i) => {
        const tk = t > 1.2 && t < 3.0;
        w.pose({ armR: tk ? 70 + 20 * Math.sin(t * 6 + i) : 10 + 110 * seg(t, 3.8, 4.1) * (i ? 1 : 0), armL: tk ? 30 : 10, lean: 6 * tk, mood: tk && Math.sin(t * 13 + i) > 0 ? 'open' : t > 3.8 ? 'grin' : 'flat', look: 0.6 });
      });
      sa.show(seg(t, 1.2, 1.4) * (1 - seg(t, 2.8, 3.0)), 70, 140); sb.show(seg(t, 1.6, 1.8) * (1 - seg(t, 2.8, 3.0)), 124, 132);
    }
  };
}
