// tea：「紅茶はいかが？」とポットを持ってすすめ、うなずいたお客のカップに注ぐ（例文 Would you like some tea?）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { arms, vessel, teapot, steam, dinner, plateP, iconSay, P, blinkAt, track, C } from './jam.js';
import { homeBg } from './furniture.js';

export const meta = { duration: 4.4, beats: [[0, '紅茶はいかが？'], [1.6, 'お願い'], [2.4, 'カップに注ぐ']] };

export function create(k) {
  const S = 1.15;
  const FY = homeBg(k, { winX: 160, winW: 80 });
  const b = k.buddy({ x: 158, y: FY, scale: S });
  const g2 = k.buddy({ x: 316, y: FY, scale: 1.05, facing: -1, ...C(k, 'coral') });
  dinner(k, 196, 370, 196);
  const sau = plateP(k, null, 16); k.tf(sau, 270, 198);
  const cup = vessel(k, null, { w: 20, h: 15, taper: 0.7, handle: 8, liquid: '#B5652E' }); k.tf(cup.g, 270, 195, 0, 1.2);
  const st = steam(k, null, 2, 18);
  const pot = teapot(k);
  const A = arms(k, b, S, { back: ['L'] });
  const q = iconSay(k, 64, 40, -1, (g) => { const c = vessel(k, g, { w: 18, h: 13, taper: 0.7, handle: 7, liquid: '#B5652E' }); k.tf(c.g, -6, 8); c.set(0.7); k.text(16, 0, '?', { 'font-size': 18, fill: k.pal.blueDark }, g); });
  const yes = iconSay(k, 40, 30, 1, (g) => k.el('path', { d: 'M -8 0 L -2 6 L 9 -6', stroke: k.pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g));
  const hand = track([[0, 200, 180], [0.6, 210, 160], [2.3, 210, 160], [2.7, 226, 158], [3.6, 226, 158], [4.0, 212, 166]]);
  return {
    update(t) {
      const pour = easeInOut(seg(t, 2.7, 3.0)) * (1 - easeInOut(seg(t, 3.5, 3.8)));
      const nod = Math.sin(seg(t, 1.7, 2.3) * Math.PI * 2) * (t > 1.7 && t < 2.3);
      P(b, { lean: 4 + 4 * seg(t, 2.6, 3), look: 0.6, blink: blinkAt(t), mood: t < 1.5 ? 'open' : 'smile' });
      P(g2, { look: 0.3, lean: 6 * Math.abs(nod), blink: blinkAt(t, 0.9), mood: t > 1.7 ? 'grin' : 'smile', armL: 20, armR: 10, facing: -1 });
      const h = A.to('R', hand(t).x, hand(t).y);
      A.to('L', 170, 200);
      k.tf(pot, h.x, h.y + 6, 50 * pour, 1.15);
      cup.set(0.75 * easeInOut(seg(t, 2.9, 3.6)));
      st.set(270, 172, seg(t, 3.3, 3.8), t);
      q.show(seg(t, 0.3, 0.7) * (1 - seg(t, 1.6, 1.8)), 190, 92);
      yes.show(seg(t, 1.8, 2.1) * (1 - seg(t, 2.6, 2.8)), 300, 104);
    }
  };
}
