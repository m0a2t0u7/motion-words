// chopsticks：「おはし使える？」と聞かれ、はしで餃子をつまんで持ち上げてみせる（例文 Can you use chopsticks?）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, dinner, plateP, iconSay, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, 'はし使える？'], [1.4, 'つまむ'], [2.8, '使えるよ']] };

// はし（原点＝握り、+y が先。open=先の開き）
function sticks(k) {
  const g = k.g({});
  const a = k.el('line', { x1: 0, y1: -8, x2: 0, y2: 40, stroke: '#B5652E', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  const c = k.el('line', { x1: 0, y1: -8, x2: 0, y2: 40, stroke: '#C9814A', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
  return { g, set(x, y, rot, open) { k.tf(g, x, y, rot, 1.1); a.setAttribute('transform', `rotate(${(-open * 5).toFixed(1)} 0 -6) translate(-2 0)`); c.setAttribute('transform', `rotate(${(open * 5).toFixed(1)} 0 -6) translate(2 0)`); } };
}
function gyoza(k) {
  const g = k.g({});
  k.el('path', { d: 'M -10 2 Q -10 -9 0 -9 Q 10 -9 10 2 Z', fill: '#F6E3B9', stroke: '#D9B97A', 'stroke-width': 1.3 }, g);
  k.el('path', { d: 'M -5 -8 l 1 3 M 0 -9 l 0 3 M 5 -8 l -1 3', stroke: '#D9B97A', 'stroke-width': 1.2 }, g);
  return g;
}

export function create(k) {
  const { el, pal } = k, S = 1.1;
  const FY = homeBg(k, { winX: 260, winW: 80 });
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const fr = k.buddy({ x: 300, y: FY, scale: 1.1, facing: -1, ...C(k, 'blue') });
  dinner(k, 60, 360, 198);
  const PX = 210;
  k.tf(plateP(k, undefined, 28), PX, 200);
  const gs = [0, 1, 2].map(() => gyoza(k));
  const ch = sticks(k);
  const A = arms(k, b, S, { back: ['L'] });
  const ask = iconSay(k, 64, 40, 1, (g) => { k.el('path', { d: 'M -18 10 L -2 -10 M -12 12 L 4 -8', stroke: '#B5652E', 'stroke-width': 3, 'stroke-linecap': 'round' }, g); k.text(14, 0, '?', { 'font-size': 20, fill: pal.blueDark }, g); });
  const claps = [0, 1, 2].map(() => el('line', { stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const go = easeInOut(seg(t, 1.2, 1.7)), pinch = easeOut(seg(t, 1.7, 1.95)), up = easeInOut(seg(t, 2.0, 2.7));
      const clap = t > 2.9 ? Math.abs(Math.sin((t - 2.9) * 12)) : 0;
      P(b, { look: 0.6, lean: 6 * go * (1 - up), blink: blinkAt(t), mood: t > 2.7 ? 'grin' : t > 1.7 ? 'flat' : 'smile' });
      const hx = lerp(lerp(176, PX - 6, go), 186, up), hy = lerp(lerp(180, 160, go), 128, up);
      A.to('R', hx, hy);
      const rot = lerp(lerp(30, 12, go), 40, up);
      const open = t < 1.2 ? 0.2 : t < 1.7 ? lerp(0.2, 1, go) : 1 - pinch * 0.8;
      ch.set(hx, hy, rot, open);
      A.to('L', 118, 196);
      const a = (rot * Math.PI) / 180, tip = { x: hx - Math.sin(a) * 42, y: hy + Math.cos(a) * 42 };
      gs.forEach((g, i) => {
        if (i === 1 && t > 1.95) k.tf(g, tip.x, tip.y + 4, rot * 0.3);
        else k.tf(g, PX - 14 + i * 14, 198);
      });
      P(fr, { look: 0.5, blink: blinkAt(t, 0.8), facing: -1, mood: t > 2.7 ? 'grin' : t < 1.2 ? 'open' : 'smile', armL: 30 + 50 * clap, armR: 30 + 50 * clap });
      claps.forEach((c, i) => { const ang = -0.7 + i * 0.7; k.set(c, { x1: 300 + Math.sin(ang) * 54, y1: 140 - Math.cos(ang) * 54 + 30, x2: 300 + Math.sin(ang) * 62, y2: 140 - Math.cos(ang) * 62 + 30, opacity: clap > 0.6 ? 1 : 0 }); });
      ask.show(seg(t, 0.2, 0.5) * (1 - seg(t, 1.3, 1.5)), 270, 100);
    }
  };
}
