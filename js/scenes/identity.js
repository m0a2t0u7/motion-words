// identity：入口で係の人に身分証を見せる。係の人が顔と写真を見比べてうなずき、扉を開けて通してくれる（例文 They checked my identity at the door.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { hp, reach, P, blinkAt, walkTo, face, idCard, streetBg } from './bag.js';
import { door } from './queue-up.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '入口へ'], [1.0, '身分証を見せる'], [2.6, '本人だと確認']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.1, FY = 236;
  streetBg(k, FY);
  el('rect', { x: 250, y: FY - 170, width: 150, height: 170, fill: '#E9E1F2' });
  el('rect', { x: 250, y: FY - 176, width: 150, height: 10, fill: '#CFC3E0' });
  el('rect', { x: 296, y: FY - 136, width: 74, height: 136, fill: '#3D4A60' });
  const dr = door(k, { x: 300, y: FY - 130, w: 66, h: 130, hinge: 'R', color: '#8C7BC4' });
  const gd = k.buddy({ x: 268, y: FY, scale: 1.1, facing: -1, color: pal.coral, dark: pal.coralDark });
  const cap = el('path', { d: 'M -26 -72 Q -24 -92 0 -92 Q 24 -92 26 -72 Z', fill: '#2F4C7A' }, gd.body);
  const b = k.buddy({ x: 50, y: FY, scale: S });
  const card = k.g({}); idCard(k, card, '#DCEBFF');
  const ok = mark(k, 'check', k.root, 1.6);
  const xf = (t) => t < 2 ? lerp(50, 172, easeInOut(seg(t, 0, 1.0))) : lerp(172, 240, easeInOut(seg(t, 3.4, 4.3)));
  return {
    update(t) {
      const w = walkTo(xf, t, 50);
      const show = easeInOut(seg(t, 1.0, 1.4)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      P(b, { x: w.x, walk: w.walk, armL: w.armL, lean: w.lean, look: 0.6, blink: blinkAt(t), mood: t > 2.5 ? 'grin' : 'smile' });
      b.pose({ armR: lerp(w.armR, reach(b, S, 'R', 216, FY - 76), show) });
      face(b, 4, 0);
      const h = hp(b, S, 'R');
      tf(card, h.x + 8, h.y - 6, 0, S);
      card.setAttribute('opacity', t < 3.1 ? 1 : 0);
      // 係の人：カードを見る → 顔を見る → うなずく → 横へよけて扉を開ける
      const lookCard = seg(t, 1.4, 2.4), nod = hump(seg(t, 2.4, 2.8));
      const step = easeInOut(seg(t, 2.9, 3.4));
      P(gd, { x: lerp(268, 330, step), facing: -1, look: 0.5, blink: blinkAt(t, 1), lean: 12 * hump(lookCard) + 10 * nod, mood: t > 2.4 ? 'grin' : 'flat' });
      face(gd, 0, lookCard > 0 && lookCard < 1 ? (Math.sin(lookCard * Math.PI * 3) > 0 ? 3 : -3) : 0);
      gd.pose({ armL: 8 + 80 * easeInOut(seg(t, 3.2, 3.6)) });
      dr.set(0.85 * easeInOut(seg(t, 2.9, 3.5)));
      const op = seg(t, 2.45, 2.7) - seg(t, 3.6, 3.8);
      tf(ok, 235, FY - 140, 0, Math.max(0.001, op * 1.6));
      void cap;
    }
  };
}
