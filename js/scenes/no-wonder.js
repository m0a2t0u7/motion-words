// no wonder：大あくびの相手に「寝た？」→「寝てない」（ベッドに×）。まめは「なるほど、それでか」と電球が点いてうなずく（例文 You didn't sleep? No wonder you're tired.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, say, icon, bulb, popIn, roomBg } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '眠そうな相手'], [1.3, '寝てない'], [2.8, 'どうりで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'office', 240);
  const C = k.buddy({ x: 130, y: FY, scale: 0.92, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 280, y: FY, scale: 0.92, facing: -1 });
  const bags = [-10, 10].map((x) => el('path', { d: `M ${x - 4} -48 Q ${x} -45 ${x + 4} -48`, stroke: '#9C7FB8', 'stroke-width': 2, fill: 'none' }, C.body.children[3]));
  const ask = say(k, 58, 36, -1);
  const b1 = icon(k, 'bed', ask.g); tf(b1, -8, 0); k.text(16, 1, '?', { 'font-size': 16, fill: pal.sub }, ask.g);
  const ans = say(k, 52, 36, 1);
  icon(k, 'bed', ans.g);
  el('path', { d: 'M -12 -12 L 12 12 M 12 -12 L -12 12', stroke: pal.red, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, ans.g);
  const bl = g({}); bulb(k, bl);
  const rays = [0, 1, 2, 3, 4].map((i) => el('line', { x1: 0, y1: -18, x2: 0, y2: -24, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linecap': 'round', transform: `rotate(${-60 + i * 30})` }, bl));
  const zz = k.text(0, 0, 'z', { 'font-size': 14, fill: pal.violet });
  return {
    update(t) {
      // ピンク：あくび（口を大きく開け、腕を伸ばす）・まぶたが重い
      const yawn = hump(seg(t, 0.1, 1.1)) + hump(seg(t, 3.0, 4.0));
      const shake = t > 1.4 && t < 2.3 ? Math.sin((t - 1.4) * 14) : 0;
      P(C, { look: 0.6, blink: 0.55 + 0.35 * yawn, mood: yawn > 0.3 ? 'open' : 'flat', armR: 8 + 150 * yawn, armL: 8 + 150 * yawn, lean: -6 * yawn + 4 * shake, squash: 1 + 0.04 * yawn });
      ans.show(seg(t, 1.4, 1.65) * (1 - seg(t, 2.6, 2.8)), 104, 100);
      // まめ：聞く→ひらめき→うなずく
      const nod = t > 2.8 && t < 3.8 ? Math.max(0, Math.sin((t - 2.8) * Math.PI * 3)) : 0;
      P(A, { look: 0.6, mood: t > 0.4 && t < 1.2 && Math.sin(t * 20) > 0 ? 'open' : t > 2.6 ? 'grin' : 'flat', lean: 10 * nod, armR: t > 2.6 ? lerp(8, 70, easeOut(seg(t, 2.6, 2.9))) : 8 });
      ask.show(seg(t, 0.4, 0.65) * (1 - seg(t, 1.3, 1.5)), 266, 100);
      tf(bl, 288, 104 - 4 * hump(seg(t, 2.5, 2.9)), 0, popIn(seg(t, 2.5, 2.85)));
      tf(zz, 160 + 6 * Math.sin(t * 3), 120 - 10 * ((t * 0.7) % 1)); zz.setAttribute('opacity', t > 3.4 ? 1 : 0);
    }
  };
}
