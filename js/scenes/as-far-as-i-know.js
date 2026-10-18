// as far as I know：「あの店は何時に開く？」と聞かれ、自分の記憶の中の店（時計は10時）を思い出しながら、確実ではないと肩をすくめて答える（例文 As far as I know, the shop opens at ten.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { streetBg } from './weigh.js';
import { cloud } from './look-over.js';
import { cue, popS } from './from-scratch.js';

export const meta = { duration: 4.6, beats: [[0, '何時に開く？'], [1.4, '思い出す'], [3.0, 'たぶん10時']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  const c = k.buddy({ x: 290, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 120, y: FY, facing: 1 });
  // 相手の質問：店＋時計＋？
  const Q = cue(k, '', 70, 40);
  const shopQ = g({}, Q.inner);
  el('rect', { x: -26, y: -10, width: 22, height: 18, fill: '#FFE7A8', stroke: pal.ink, 'stroke-width': 1.5 }, shopQ);
  el('path', { d: 'M -28 -10 L -2 -10 L -6 -16 L -24 -16 Z', fill: pal.blue }, shopQ);
  k.text(16, 0, '?', { 'font-size': 20, fill: pal.coralDark }, shopQ);
  // 自分の記憶（雲）：店のドアと 10時の時計
  const M = cloud(k, 120, 84, -1);
  const mem = g({}, M.g);
  el('rect', { x: -40, y: -20, width: 50, height: 36, fill: '#FFE7A8', stroke: pal.ink, 'stroke-width': 1.5 }, mem);
  el('path', { d: 'M -44 -20 L 14 -20 L 8 -30 L -38 -30 Z', fill: pal.blue }, mem);
  el('rect', { x: -26, y: -8, width: 16, height: 24, fill: pal.blue }, mem);
  const mc = clock(k, 32, -4, 14, mem); mc.set(10, 0);
  const q2 = k.text(0, 0, '?', { 'font-size': 16, fill: pal.sub });
  return {
    update(t) {
      const ask = t > 0.3 && t < 1.3;
      P(c, { x: 290, facing: -1, look: -0.5, armR: 8 + 50 * hump(seg(t, 0.3, 1.3)), mood: ask && Math.sin(t * 20) > 0 ? 'open' : 'smile', blink: blinkAt(t, 1), lean: 3 * hump(seg(t, 0.3, 1.3)) });
      Q.show(262, 100, easeOut(seg(t, 0.4, 0.7)) * (1 - seg(t, 1.6, 1.8)));
      // 自分：あごに手→思い出す→両手を少し広げて肩をすくめる
      const thinkP = easeOut(seg(t, 1.2, 1.5)) * (1 - easeInOut(seg(t, 2.8, 3.1)));
      const shrug = easeOut(seg(t, 3.0, 3.4));
      const sq = hump(seg(t, 3.0, 3.6));
      P(b, { x: 120, facing: 1, look: thinkP > 0.5 ? -0.3 : 0.6, armR: lerp(lerp(8, 150, thinkP), 60, shrug), armL: lerp(8, 60, shrug), lift: -2 * sq, squash: 1 + 0.03 * sq, mood: t > 3.0 ? (Math.sin(t * 18) > 0 && t < 4.0 ? 'open' : 'smile') : thinkP > 0.5 ? 'flat' : 'smile', blink: blinkAt(t) });
      if (thinkP > 0.5) b.body.children[3].setAttribute('transform', 'translate(-1 -6)');
      M.show(easeOut(seg(t, 1.5, 1.9)), 130, 74);
      tf(q2, 190, 46, 0, popS(seg(t, 3.2, 3.5)));
      q2.setAttribute('opacity', t > 3.2 ? 0.8 : 0);
    }
  };
}
