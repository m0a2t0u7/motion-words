// bottle：店のレジで代金を払い、水のペットボトルを1本受け取って買う（例文 He bought a bottle of water.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, P, blinkAt, C } from './jam.js';
import { counterBg, register } from './bag.js';
import { coin } from './get-on-with.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, 'レジへ'], [1.4, 'お金を払う'], [3.0, '水を買った']] };

// 水のボトル（原点＝底の中心）
export function waterBottle(k, parent, s = 1) {
  const g = k.g({}, parent || k.root), { el } = k;
  el('path', { d: 'M -9 0 L -9 -30 Q -9 -38 -4 -42 L -4 -48 L 4 -48 L 4 -42 Q 9 -38 9 -30 L 9 0 Z', fill: 'rgba(170,220,248,0.75)', stroke: '#86C1E3', 'stroke-width': 1.5 }, g);
  el('rect', { x: -5, y: -54, width: 10, height: 7, rx: 2, fill: '#4A8BE0' }, g);
  el('rect', { x: -9, y: -26, width: 18, height: 10, fill: '#fff' }, g);
  el('path', { d: 'M -5 -21 q 2.5 -3 5 0 t 5 0', stroke: '#4A8BE0', 'stroke-width': 1.6, fill: 'none' }, g);
  k.tf(g, 0, 0, 0, s);
  return g;
}

export function create(k) {
  const { pal } = k, S = 1.1;
  const cb = counterBg(k, 236, 300, 150);
  const clerk = k.buddy({ x: 320, y: 236, scale: 1.1, facing: -1, ...C(k, 'coral') });
  cb.front();
  register(k, 350, cb.TY);
  const b = k.buddy({ x: 40, y: 236, scale: S });
  const bt = k.g({}); waterBottle(k, bt, 1.1);
  const cn = coin(k, undefined, 7);
  const A = arms(k, b, S, { back: ['L'] }), B = arms(k, clerk, 1.1, { col: pal.coral, dark: pal.coralDark });
  const xf = (t) => lerp(40, 186, easeInOut(seg(t, 0, 1.2)));
  const TY = cb.TY;
  return {
    update(t) {
      const g = gait(xf, t, 40);
      const pay = easeInOut(seg(t, 1.3, 1.8)), back = easeInOut(seg(t, 1.9, 2.3));
      const take = easeInOut(seg(t, 2.6, 3.0)), lift = easeInOut(seg(t, 3.0, 3.6));
      P(b, { x: g.x, walk: g.walk, lean: g.lean + 4 * pay * (1 - back), look: 0.5, blink: blinkAt(t), mood: t > 3.2 ? 'grin' : 'smile' });
      P(clerk, { look: 0.5, blink: blinkAt(t, 1), facing: -1, mood: t > 1.8 ? 'grin' : 'smile', lean: 3 });
      // 客の右手：コインを差し出す → 戻す → ボトルを取って掲げる
      const cx = lerp(g.x + 30, 252, pay), cy = lerp(198, TY - 6, pay);
      let hx = cx, hy = cy;
      if (t > 1.9) { hx = lerp(252, g.x + 30, back); hy = lerp(TY - 6, 198, back); }
      if (t > 2.6) { hx = lerp(g.x + 30, 250, take); hy = lerp(198, TY - 26, take); }
      if (t > 3.0) { hx = lerp(250, g.x + 26, lift); hy = lerp(TY - 26, 132, lift); }
      A.to('R', hx, hy); A.to('L', g.x - 18, 200);
      // コイン：手 → カウンター → 店員の手
      const cHand = t < 1.8;
      const cT = easeInOut(seg(t, 2.0, 2.4));
      k.tf(cn, cHand ? hx : lerp(256, 296, cT), cHand ? hy - 4 : lerp(TY - 4, TY - 16, cT));
      // 店員の手
      // 店員：コインを受け取る（それまでは台に手を置く）
      if (t < 1.9) B.to('R', 300, TY - 2);
      else B.to('R', lerp(256, 296, cT) + 4, lerp(TY - 4, TY - 16, cT) + 4);
      B.to('L', 334, TY - 2);
      // ボトル：台の上 → 客が持つ
      if (t < 2.6) k.tf(bt, 250, TY);
      else k.tf(bt, hx, hy + 22);
    }
  };
}
