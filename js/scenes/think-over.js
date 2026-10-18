// think over：相手がAとBの2案を差し出す→まめはあごに手を当て、考え雲の中でA・Bを行ったり来たり比べる（決める前）（例文 Let me think it over before I decide.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, cloud, faceAt, desk } from './look-over.js';

export const meta = { duration: 4.6, beats: [[0, 'どっちにする？'], [1.4, 'じっくり考える'], [3.6, 'まだ決めない']] };

export function card(k, parent, label, color) {
  const n = k.g({}, parent);
  k.el('rect', { x: -14, y: -18, width: 28, height: 36, rx: 4, fill: '#fff', stroke: color, 'stroke-width': 3 }, n);
  k.text(0, 1, label, { 'font-size': 18, fill: color }, n);
  return n;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const b = k.buddy({ x: 110, y: FY, scale: 0.95 });
  const o = k.buddy({ x: 330, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark, facing: -1 });
  desk(k, 180, 110, 200);
  const cA = card(k, null, 'A', pal.blueDark), cB = card(k, null, 'B', pal.coralDark);
  const cl = cloud(k, 116, 74, -1);
  const iA = card(k, cl.g, 'A', pal.blueDark), iB = card(k, cl.g, 'B', pal.coralDark);
  const sc = el('path', { d: 'M -10 -4 L 10 -4 M 0 -14 L 0 6', stroke: pal.sub, 'stroke-width': 0 }, cl.g);
  return {
    update(t) {
      const give = easeInOut(seg(t, 0.2, 1.0));
      o.pose({ armR: 8 + 70 * hump(seg(t, 0.2, 1.4)), mood: 'smile', look: 0.5, lean: 6 * hump(seg(t, 0.2, 1.4)) });
      tf(cA, lerp(306, 214, give), lerp(176, 186, give), lerp(0, -8, give)); tf(cB, lerp(312, 252, give), lerp(176, 186, give), lerp(0, 8, give));
      const chin = easeOut(seg(t, 1.1, 1.5)), sway = Math.sin((t - 1.6) * 3.2) * seg(t, 1.6, 1.9);
      b.pose({ armR: 8 + 128 * chin, armL: 8 + 50 * chin, lean: 3 * sway, mood: 'flat', look: 0.5 + 0.4 * sway, blink: hump(seg(t, 2.7, 2.85)) });
      faceAt(b, 3 + 3 * sway, -3 * chin);
      cl.show(easeOut(seg(t, 1.4, 1.9)), 190, 76);
      // 雲の中で A と B が交互に前に出る（どちらにも決まらない）
      const f = sway;
      tf(iA, -24, 2, -6, 1 + 0.25 * Math.max(0, f)); iA.setAttribute('opacity', 0.55 + 0.45 * Math.max(0, f));
      tf(iB, 24, 2, 6, 1 + 0.25 * Math.max(0, -f)); iB.setAttribute('opacity', 0.55 + 0.45 * Math.max(0, -f));
    }
  };
}
