// get at：相手が遠回しに話す（吹き出しの中の曲がりくねった線の先に、見えない「要点」）。まめが首をかしげ「？」と聞き返す（例文 What are you getting at?）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { officeBg, say, star } from './get-on-with.js';

export const meta = { duration: 4.0, beats: [[0, '遠回しな話'], [1.6, '首をかしげる'], [3.0, '何が言いたい？']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  const a = k.buddy({ x: 110, y: FY, scale: 0.95 });
  const c = k.buddy({ x: 300, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark, facing: -1 });
  // 相手の吹き出し：くねくね線と、その先の点線の「要点」
  const bc = say(k, 120, 64);
  const path = el('path', { d: 'M -48 8 C -40 -24 -24 24 -12 -4 S 8 -22 16 4 S 30 16 36 -6', fill: 'none', stroke: pal.coralDark, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-dasharray': 120, 'stroke-dashoffset': 120 }, bc.inner);
  const pt = g({}, bc.inner); tf(pt, 46, -12);
  el('circle', { r: 8, fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '3 3' }, pt);
  // まめの吹き出し「？」
  const ba = say(k, 46, 40);
  k.text(0, 1, '?', { 'font-size': 26, fill: pal.blueDark }, ba.inner);
  const marks = g({});
  [[-6, 0], [6, -6]].forEach(([x, y]) => el('path', { d: `M ${x} ${y} q 3 -6 0 -10`, stroke: pal.sub, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, marks));
  return {
    update(t) {
      const talk = t < 2.4;
      bc.show(262, 92, seg(t, 0.1, 0.4) * (1 - seg(t, 3.4, 3.7) * 0.4));
      k.set(path, { 'stroke-dashoffset': 120 * (1 - easeInOut(seg(t, 0.3, 2.2))) });
      pt.setAttribute('opacity', 0.4 + 0.4 * hump(seg(t, 1.6, 2.6)));
      c.pose({ armR: talk ? 40 + Math.sin(t * 6) * 22 : 14, armL: talk ? 20 + Math.sin(t * 6 + 1) * 14 : 10, mood: talk ? 'open' : 'flat', look: 0.4, lean: talk ? Math.sin(t * 3) * 3 : 0 });
      // まめ：聞く→首をかしげる（体を傾けて目を細める）→指さして聞き返す
      const tilt = easeInOut(seg(t, 1.4, 2.0)), ask = easeOut(seg(t, 2.6, 3.0));
      a.pose({ lean: lerp(lerp(0, -12, tilt), 6, ask), look: 0.6, blink: 0.4 * tilt * (1 - ask), mood: ask > 0.3 ? 'open' : tilt > 0.5 ? 'flat' : 'smile',
        armR: lerp(lerp(10, 140, tilt), 80, ask), armL: 8 });
      marks.setAttribute('opacity', tilt * (1 - ask));
      tf(marks, 92, 120);
      ba.show(150, 108, backOut(seg(t, 2.7, 3.1)));
    }
  };
}
