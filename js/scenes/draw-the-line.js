// draw the line：うそは受け入れないと、地面に線を引いて「ここまで」と示す（例文 I draw the line at lying.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '近づいてくる'], [1.2, '線を引く'], [2.8, 'ここから先はだめ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 232, mood: 'outdoor' });
  const LX = 205;
  // 引かれる線（床の上）
  const line = el('line', { x1: LX, y1: FY + 4, x2: LX, y2: FY + 62, stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': 1, 'stroke-dashoffset': 1 });
  const wall = el('line', { x1: LX, y1: FY - 140, x2: LX, y2: FY + 4, stroke: pal.red, 'stroke-width': 4, 'stroke-dasharray': '10 8', opacity: 0 });
  const a = k.buddy({ x: 140, y: FY, scale: 1.05 });
  const c = k.buddy({ x: 470, y: FY, scale: 1.05, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'flat', blink: 0, lift: 0 };
  // うそつきの鼻（コーラルの長い鼻）
  const nose = el('path', { d: 'M 0 0 L -10 3 L 0 6 Z', fill: '#E86F57' });
  // チョーク
  const chalk = el('line', { x1: 0, y1: 0, x2: 10, y2: 0, stroke: '#FFFFFF', 'stroke-width': 5, 'stroke-linecap': 'round' });
  // ×印の吹き出し
  const bub = g({});
  el('ellipse', { cx: 0, cy: 0, rx: 26, ry: 22, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.5 }, bub);
  el('path', { d: 'M -10 -10 L 10 10 M 10 -10 L -10 10', stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round' }, bub);

  return {
    update(t) {
      // コーラルが近づく→線の前で止まる
      const walk = easeOut(seg(t, 0, 1.5));
      const cx = lerp(470, 262, walk);
      const walking = t < 1.5;
      const stopP = seg(t, 2.6, 3.0);
      c.pose({ ...base, x: cx, walk: walking ? t * 9 : 0, mood: t > 2.8 ? 'sad' : 'grin', lean: t > 2.8 ? -6 * stopP : 4, armL: 8, armR: 8 });
      // 長い鼻（うそ）
      const nl = lerp(0.2, 1, seg(t, 0.2, 1.2));
      k.set(nose, { d: `M ${cx - 26} ${FY - 62} L ${cx - 26 - 30 * nl} ${FY - 58} L ${cx - 26} ${FY - 52} Z` });
      // まめ：しゃがんで線を引く→手を前に出して止める
      const draw = seg(t, 1.2, 2.3);
      const stop = easeOut(seg(t, 2.3, 2.8));
      const bend = Math.sin(Math.PI * Math.min(1, draw * 1)) * (t < 2.3 ? 1 : 0);
      a.pose({ ...base, x: 140 + 30 * draw, armR: t < 1.2 ? 8 : t < 2.3 ? 40 : lerp(40, 92, stop), armL: 8, lean: t < 2.3 ? 20 * bend : lerp(0, -4, stop), squash: 1 - 0.1 * bend, mood: t > 2.3 ? 'flat' : 'smile', look: 0.4 });
      const h = a.handPos('R');
      const py = FY + 4 + 58 * easeInOut(draw);
      tf(chalk, draw > 0 && t < 2.3 ? LX - 8 : -50, draw > 0 && t < 2.3 ? py : 0, 0, 1, 1);
      k.set(line, { 'stroke-dashoffset': 1 - easeInOut(draw) });
      wall.setAttribute('opacity', 0.85 * seg(t, 2.3, 2.7));
      const bp = backOut(seg(t, 2.8, 3.2), 2);
      tf(bub, LX + 6, 72, 0, bp, bp);
    }
  };
}
