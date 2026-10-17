// take away：店員が袋を差し出し、まめがハンバーガー2個入りの袋を受け取って持ち帰る（例文 Can I have two burgers to take away?）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '店で注文'], [1.43, '袋を受け取る'], [3.06, '持ち帰る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 236, width: 400, height: 8, fill: '#E3E8EE' });
  el('rect', { x: 40, y: 150, width: 6, height: 86, fill: pal.woodDark });
  el('circle', { cx: 43, cy: 130, r: 26, fill: '#9ADFA0' });
  el('circle', { cx: 30, cy: 142, r: 16, fill: '#7FD08A' });
  // 店
  el('rect', { x: 244, y: 76, width: 160, height: 160, fill: '#FFEBD9' });
  el('rect', { x: 244, y: 70, width: 160, height: 10, fill: pal.coralDark });
  el('circle', { cx: 324, cy: 100, r: 15, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 3 });
  el('path', { d: 'M 313 98 Q 324 84 335 98 Z', fill: '#F2B66D' });
  el('rect', { x: 313, y: 99, width: 22, height: 3, rx: 1.5, fill: pal.green });
  el('rect', { x: 314, y: 102, width: 20, height: 3.5, rx: 1.7, fill: pal.coffee });
  el('path', { d: 'M 313 106 Q 324 112 335 106 Z', fill: '#F2B66D' });
  el('rect', { x: 256, y: 134, width: 138, height: 64, rx: 6, fill: '#FFE3BF' });
  el('rect', { x: 256, y: 134, width: 138, height: 8, fill: '#F7CF9C' });
  const ca = k.buddy({ x: 340, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  // カウンター
  el('rect', { x: 250, y: 196, width: 154, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 254, y: 206, width: 150, height: 40, fill: pal.woodDark });
  // 日よけ
  for (let i = 0; i < 8; i++) el('path', { d: `M ${238 + i * 21} 112 h 21 v 14 q -10.5 8 -21 0 Z`, fill: i % 2 ? '#fff' : pal.red });
  el('rect', { x: 238, y: 108, width: 168, height: 6, fill: pal.coralDark });
  // 袋（ハンバーガー2個入り）
  const bag = g({});
  const mkBurger = (x, parent) => { el('path', { d: `M ${x - 7} -12 Q ${x} -22 ${x + 7} -12 Z`, fill: '#F2B66D' }, parent); el('rect', { x: x - 7, y: -12, width: 14, height: 3, rx: 1.5, fill: pal.green }, parent); };
  mkBurger(-6, bag); mkBurger(7, bag);
  el('path', { d: 'M -15 -13 L 15 -13 L 13 18 L -13 18 Z', fill: '#D9B27C', stroke: '#B88F5A', 'stroke-width': 2, 'stroke-linejoin': 'round' }, bag);
  el('path', { d: 'M -15 -13 L 15 -13 L 14 -8 L -14 -8 Z', fill: '#C9A06A' }, bag);
  el('circle', { cx: 0, cy: 3, r: 5, fill: pal.red, opacity: 0.85 }, bag);
  const me = k.buddy({ x: 100, y: FY, scale: 0.9 });

  return {
    update(t0) {
      const t = t0 * 1.0455;
      // 店員：袋を押し出す（カウンターに身を乗り出す）
      const push = easeInOut(seg(t, 0.8, 1.5));
      const cx = lerp(340, 316, push);
      const ca_a = lerp(8, 92, easeOut(seg(t, 0.6, 0.9))) * (1 - easeInOut(seg(t, 1.6, 2.0))) + 8 * easeInOut(seg(t, 1.6, 2.0));
      ca.pose({ x: cx, armR: ca_a, armL: 8, lean: 8 * push * (1 - easeInOut(seg(t, 1.6, 2.0))), look: -0.4, mood: t < 1.6 ? 'smile' : 'grin', blink: t > 0.4 && t < 0.5 ? 1 : 0 });
      const hc = ca.handPos('R');
      // お客（まめ）：歩いて近づき、袋を受け取り、向きを変えて歩き去る
      const toShop = easeInOut(seg(t, 0.2, 1.3));
      const walkBack = seg(t, 2.1, 4.4);
      const turn = easeInOut(seg(t, 1.9, 2.06));
      const face = lerp(1, -1, turn);
      const mx = t < 2.1 ? lerp(100, 211, toShop) : lerp(211, 46, easeOut(walkBack) * 0.5 + walkBack * 0.5);
      const walking = (t > 0.2 && t < 1.3) || t > 2.1;
      const rec = easeOut(seg(t, 1.25, 1.55));
      const low = easeInOut(seg(t, 2.35, 2.9));
      const aM = lerp(8, 92, rec) * (1 - low) + 22 * low;
      const w = t * 10;
      me.pose({ x: mx, facing: face, walk: walking ? w : 0, armR: walking && t < 1.3 ? 8 + Math.sin(w) * 12 : aM + (t > 2.9 ? Math.sin(w) * 4 : 0), armL: walking ? 8 - Math.sin(w) * 14 : 8, lean: t > 2.1 ? 3 : walking ? 3 : 0, look: 0.6 * face, mood: t > 1.7 ? 'grin' : 'smile', blink: t > 0.9 && t < 1.0 ? 1 : 0 });
      const hm = me.handPos('R');
      // 袋：カウンターの上を滑る → 手に持たれる
      let bx, by, rot = 0;
      if (t < 1.5) { bx = lerp(322, 268, push); by = 178; }
      else {
        const g2 = easeOut(seg(t, 1.5, 1.7));
        const off = { x: lerp(10 * face, 4 * face, low), y: lerp(-8, 17, low) };
        bx = lerp(268, hm.x + off.x, g2); by = lerp(178, hm.y + off.y, g2);
        if (t > 2.9) rot = Math.sin(w * 0.5) * 7;
      }
      tf(bag, bx, by, rot);
      void hc;
    }
  };
}
