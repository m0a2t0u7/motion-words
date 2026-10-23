// knife：まな板のパンを左手で押さえ、このナイフで前後に引いて切ると、1枚が倒れる（例文 Cut the bread with this knife.）
import { seg, lerp, easeInOut, easeOut, clamp, hump, wobble } from '../ease.js';
import { kitchen, TOP, arms, knifeP, P, blinkAt } from './jam.js';

export const meta = { duration: 4.2, beats: [[0, 'このナイフ'], [1.0, 'パンを切る'], [3.0, '切れた']] };

export function create(k) {
  const { el, pal } = k, S = 1.2;
  const kit = kitchen(k);
  const b = k.buddy({ x: 156, y: kit.FY, scale: S });
  kit.front();
  // まな板
  el('rect', { x: 186, y: TOP - 8, width: 150, height: 10, rx: 3, fill: '#E3C49B', stroke: '#C9A577', 'stroke-width': 1.5 });
  const BY = TOP - 8, CUT = 286;
  // パン（切り口より左が本体、右が切れる1枚）
  const loaf = 'M 0 0 L 0 -30 Q 0 -44 20 -44 L 70 -44 Q 90 -44 90 -30 L 90 0 Z';
  el('path', { d: loaf, fill: '#D9964F', transform: `translate(${CUT - 90} ${BY})`, 'clip-path': k.clip((c) => k.el('rect', { x: 0, y: -50, width: 90, height: 50 }, c)) });
  [20, 44, 66].forEach((x) => el('path', { d: `M ${CUT - 90 + x} ${BY - 42} q 6 -2 8 4`, stroke: '#B97E3E', 'stroke-width': 2, fill: 'none' }));
  el('rect', { x: CUT - 3, y: BY - 42, width: 3, height: 42, fill: '#F6E3B9' });
  const slice = k.g({});
  el('path', { d: 'M 0 0 L 0 -42 Q 12 -42 14 -30 L 14 0 Z', fill: '#D9964F' }, slice);
  el('rect', { x: 0, y: -40, width: 3, height: 40, fill: '#F6E3B9' }, slice);
  const kn = knifeP(k, undefined, 40);
  const crumbs = [0, 1, 2].map(() => el('circle', { r: 1.6, fill: '#D9964F' }));
  const A = arms(k, b, S, { back: [] });
  return {
    update(t) {
      const reach = easeInOut(seg(t, 0.2, 0.8));
      const saw = clamp((t - 1.0) / 1.8);
      const depth = easeInOut(seg(t, 1.0, 2.8));
      const fall = easeIn2(seg(t, 2.9, 3.4));
      P(b, { lean: 8, look: 0.7, blink: blinkAt(t), mood: t > 3.2 ? 'grin' : t > 1 ? 'flat' : 'smile' });
      // 左手：パンの本体を押さえる
      A.to('L', CUT - 60, BY - 40);
      // ナイフ：刃を下に向け、切り口で前後に動かす
      const stroke = t > 1.0 && t < 2.8 ? Math.sin(saw * Math.PI * 2 * 4) * 14 : 0;
      const hx = lerp(210, CUT - 14 + stroke, reach), hy = lerp(TOP - 30, BY - 84 + depth * 38, reach);
      A.to('R', hx, hy);
      // 刃先を右下（切り口）へ
      k.tf(kn, hx, hy, lerp(-90, -18, reach), 1.2, 1.2);
      // 切れた1枚：右へ倒れる（下の角を支点）
      slice.setAttribute('transform', `translate(${CUT + 2 * fall} ${BY}) rotate(${(78 * fall + 4 * wobble(seg(t, 3.4, 4), 2, 5) * (t > 3.4)).toFixed(1)} 14 0)`);
      crumbs.forEach((c, i) => { const u = seg(t, 1.4 + i * 0.4, 2.0 + i * 0.4); k.set(c, { cx: CUT + 4 + i * 5, cy: lerp(BY - 20, BY - 1, u), opacity: u > 0 ? 1 : 0 }); });
    }
  };
}
const easeIn2 = (p) => p * p;
