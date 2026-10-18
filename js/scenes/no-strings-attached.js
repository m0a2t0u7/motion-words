// no strings attached：プレゼントを渡す→相手がお礼のお金を出そうとする→「いらないよ」と手で止める→相手は贈り物だけ受け取る（It's a free gift, no strings attached.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { roomBg } from './look-over.js';
import { hp } from './dig.js';
import { P, blinkAt, talk, wallet } from './so-far-so-good.js';

export function gift(k, parent, c = k.pal.violet) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('rect', { x: -16, y: -14, width: 32, height: 26, rx: 3, fill: c }, g);
  k.el('rect', { x: -18, y: -18, width: 36, height: 8, rx: 2, fill: c, stroke: '#fff', 'stroke-width': 1, opacity: 0.95 }, g);
  k.el('rect', { x: -3, y: -18, width: 6, height: 30, fill: pal.yellow }, g);
  k.el('path', { d: 'M 0 -18 Q -12 -30 -10 -20 Z M 0 -18 Q 12 -30 10 -20 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '贈り物を渡す'], [1.6, 'お金を出す'], [2.6, 'いらないよ']] };

export function create(k) {
  const { tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const G = k.buddy({ x: 140, y: FY });
  const C = k.buddy({ x: 268, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const box = gift(k);
  const wal = wallet(k);
  const bub = talk(k, 'Free!', 62, 32, -1, 15);
  return {
    update(t) {
      const give = easeInOut(seg(t, 0.2, 1.0));
      const take = easeInOut(seg(t, 1.0, 1.4));
      const pay = easeOut(seg(t, 1.6, 2.2)) * (1 - easeInOut(seg(t, 3.0, 3.5)));
      const stop = hump(seg(t, 2.3, 3.6));
      const hug = easeOut(seg(t, 3.4, 3.9));
      const shake = Math.sin(t * 18) * hump(seg(t, 2.4, 3.3));
      P(G, { x: lerp(140, 170, give) - 14 * easeInOut(seg(t, 3.3, 4.0)), armR: t < 1.4 ? lerp(10, 78, give) * (1 - take) + 10 * take : 10 + 92 * clamp(stop * 1.6), armL: 8,
        look: shake * 0.8, mood: t > 2.3 ? 'grin' : 'smile', lean: 3 * give, blink: blinkAt(t) });
            const tk = seg(t, 0.8, 1.1);
      P(C, { facing: -1, armR: t < 1.4 ? lerp(8, 70, tk) : t < 3.5 ? lerp(20, 82, pay) : lerp(20, 30, hug), armL: t < 1.4 ? 8 : lerp(8, 34, seg(t, 1.3, 1.6)) * (1 - hug) + 20 * hug, look: 0.5,
        lean: -3 * hump(seg(t, 2.3, 3.0)), mood: t > 3.4 ? 'grin' : t > 2.3 ? 'open' : 'smile', blink: blinkAt(t, 1) });
      const hg = hp(G, 1, 'R'), hc = hp(C, 1, 'R'), hl = hp(C, 1, 'L');
      let bx = lerp(hg.x + 10, hc.x - 6, take), by = lerp(hg.y - 6, hc.y - 6, take);
      if (t >= 1.4) { const m = easeInOut(seg(t, 1.4, 1.7)); bx = lerp(lerp(bx, hl.x, m), C.state.x - 4, hug); by = lerp(lerp(by, hl.y - 8, m), FY - 30, hug); }
      tf(box, bx, by, 0, 0.9);
      tf(wal, hc.x, hc.y, 0, 0.9);
      wal.setAttribute('opacity', t > 1.6 && t < 3.4 ? 1 : 0);
      bub.show(seg(t, 2.4, 2.7), 190, 112);
    }
  };
}
