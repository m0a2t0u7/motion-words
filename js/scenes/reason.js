// reason：遅れて来たコーラルのまめに待っていたまめが「？」と聞き、電車が止まった絵で理由を答える（例文 What's the reason for the delay?）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo, clock } from './run-after.js';
import { roomBg, say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '待っている'], [1.4, '理由を聞く'], [3.0, '電車が止まった']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const FY = roomBg(k, 'home', 240);
  const ck = clock(k, 210, 62, 24); ck.set(10, 0);
  const a = k.buddy({ x: 92, y: FY, scale: S });
  const c = k.buddy({ x: 420, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const q = say(k, 50, 40, 1); k.text(0, 8, '?', { 'font-size': 26, fill: pal.blue }, q.g);
  // 答えの吹き出し：止まった電車
  const ans = say(k, 124, 80, -1), A = ans.g;
  el('rect', { x: -56, y: 18, width: 112, height: 4, rx: 2, fill: pal.sub }, A);
  el('rect', { x: -48, y: -16, width: 62, height: 30, rx: 8, fill: pal.blue }, A);
  el('rect', { x: -43, y: -11, width: 14, height: 11, rx: 2, fill: '#DDEFFA' }, A);
  el('rect', { x: -24, y: -11, width: 14, height: 11, rx: 2, fill: '#DDEFFA' }, A);
  el('rect', { x: -5, y: -11, width: 14, height: 11, rx: 2, fill: '#DDEFFA' }, A);
  [-36, 4].forEach((x) => el('circle', { cx: x, cy: 16, r: 4.5, fill: pal.ink }, A));
  const sg = g({}, A); tf(sg, 38, -6);
  el('rect', { x: -2, y: 0, width: 4, height: 22, fill: pal.sub }, sg);
  el('circle', { r: 12, fill: pal.red }, sg);
  el('path', { d: 'M -5 -5 L 5 5 M 5 -5 L -5 5', stroke: '#fff', 'stroke-width': 3.2, 'stroke-linecap': 'round' }, sg);

  return {
    update(t) {
      const cx = (s) => lerp(420, 262, easeOut(seg(s, 0.2, 1.5)));
      const w = walkTo(cx, t, 420, -1);
      const askP = seg(t, 1.6, 1.95), ansP = seg(t, 2.9, 3.3);
      P(a, { look: 0.7, mood: t > 1.6 ? 'open' : 'flat', armR: lerp(8, 74, easeOut(seg(t, 1.8, 2.3))) * (1 - seg(t, 3.5, 4.0) * 0.4), armL: 8, blink: blinkAt(t) });
      P(c, { ...w, facing: -1, look: 0.7, mood: 'sad', blink: blinkAt(t, 1.2),
        armR: w.m > 0.2 ? w.armR : lerp(8, 62, easeInOut(seg(t, 2.7, 3.3))) , armL: w.m > 0.2 ? w.armL : lerp(8, 62, easeInOut(seg(t, 2.7, 3.3))) });
      q.show(askP, 100, 96);
      ans.show(ansP, 306, 94);
    }
  };
}
