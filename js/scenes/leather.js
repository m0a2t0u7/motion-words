// leather：革のかばんを店で買い、そばで待つ母に手渡す。母はうれしそう（例文 He bought a leather bag for his mother.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { shopBg, clerk, hp, gait, P, blinkAt } from './skirt.js';
import { coin } from './get-on-with.js';
import { heart } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '革のかばん'], [1.0, '買う'], [2.6, '母に渡す']] };

// 革のかばん（原点＝底の中央）。ステッチと光沢、持ち手
export function leatherBag(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('path', { d: 'M -14 -24 Q -14 -38 0 -38 Q 14 -38 14 -24', fill: 'none', stroke: '#6B4329', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  k.el('path', { d: 'M -22 0 L -20 -24 Q -20 -27 -17 -27 L 17 -27 Q 20 -27 20 -24 L 22 0 Z', fill: '#9A6A44' }, g);
  k.el('path', { d: 'M -18 -2 L -16.5 -23 L 16.5 -23 L 18 -2 Z', fill: 'none', stroke: '#E7C9A4', 'stroke-width': 1.2, 'stroke-dasharray': '2 2' }, g);
  k.el('path', { d: 'M -20 -27 L 20 -27 L 18 -15 Q 0 -10 -18 -15 Z', fill: '#7E5434' }, g);
  k.el('rect', { x: -3.5, y: -16, width: 7, height: 6, rx: 1.5, fill: '#D9B44A' }, g);
  k.el('path', { d: 'M -14 -22 Q -10 -25 -4 -24', stroke: '#fff', 'stroke-width': 2, opacity: 0.35, fill: 'none', 'stroke-linecap': 'round' }, g);
  void pal;
  return g;
}

export function create(k) {
  const { pal, tf } = k, S = 1.1;
  const shop = shopBg(k, 236, 300);
  const FY = shop.FY;
  const c = clerk(k, 336, FY, 1.05);
  shop.front();
  const mom = k.buddy({ x: 70, y: FY, scale: 1.15, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 214, y: FY, scale: S });
  const bag = leatherBag(k, k.root);
  const co = coin(k, k.root, 6);
  const hs = [0, 1, 2].map(() => heart(k, k.root, pal.red));
  const xf = (t) => lerp(214, 132, easeInOut(seg(t, 1.8, 2.7)));
  const REST = { x: 286, y: FY - 50 };
  return {
    update(t) {
      const p = gait(xf, t, 214);
      const face = t < 1.75 ? 1 : -1;
      const pay = hump(seg(t, 0.2, 0.9)), take = easeInOut(seg(t, 1.0, 1.4));
      const give = easeInOut(seg(t, 2.7, 3.2));
      P(b, { x: p.x, walk: p.walk, facing: face, lean: p.lean + 8 * pay, armL: p.armL, look: 0.4, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t),
        armR: t < 1.0 ? 8 + 72 * pay : t < 1.8 ? lerp(70, 40, easeInOut(seg(t, 1.4, 1.8))) : t < 2.7 ? 40 : lerp(40, 80, give) });
      if (t > 0.95 && t < 1.4) b.pose({ armR: lerp(8, 72, easeOut(seg(t, 0.95, 1.15))) });
      P(c, { x: 336, armR: 8 + 40 * hump(seg(t, 0.6, 1.2)), look: 0.3, blink: blinkAt(t, 1) });
      // コイン：手 → 台
      const h = hp(b, S, 'R');
      tf(co, t < 0.6 ? h.x : lerp(h.x, 262, seg(t, 0.6, 0.75)), t < 0.6 ? h.y : FY - 54);
      co.setAttribute('opacity', t > 0.25 && t < 1.2 ? 1 : 0);
      // かばん：台の上 → まめの手 → 母の手
      const mh = hp(mom, 1.15, 'R');
      let bx, by;
      if (t < 1.15) { bx = REST.x; by = REST.y; }
      else if (t < 3.05) { bx = h.x; by = h.y + 30 * S; }
      else { bx = lerp(h.x, mh.x, easeInOut(seg(t, 3.05, 3.3))); by = lerp(h.y + 30 * S, mh.y + 34, easeInOut(seg(t, 3.05, 3.3))); }
      tf(bag, bx, by, 0, 1.2);
      const got = easeOut(seg(t, 3.0, 3.4));
      P(mom, { x: 70, armR: lerp(8, 60, got), armL: 8 + 30 * got, look: 0.5, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t, 0.5), squash: 1 - 0.03 * hump(seg(t, 3.3, 3.8)) });
      hs.forEach((n, i) => { const q = seg(t, 3.4 + i * 0.2, 4.3); tf(n, 70 + (i - 1) * 24, FY - 130 - 18 * q - (i % 2) * 8, 0, hump(q) + 0.001); });
    }
  };
}
