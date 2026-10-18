// all set：切符を確かめて（チェック）、かばんを背負って（チェック）、準備OKのポーズ（例文 I have my ticket and bag. I'm all set.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { streetBg } from './weigh.js';
import { hp, held } from './dig.js';
import { check } from './work-on.js';
import { popS } from './from-scratch.js';

export const meta = { duration: 4.2, beats: [[0, '切符を確認'], [1.4, 'かばんも'], [2.8, '準備OK']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  // 駅の入口
  el('rect', { x: 250, y: 70, width: 150, height: FY - 76, fill: '#E6ECF4' });
  el('rect', { x: 244, y: 64, width: 162, height: 26, rx: 4, fill: pal.blueDark });
  [270, 300, 330, 360].forEach((x) => el('rect', { x: x - 2, y: 98, width: 4, height: 12, fill: '#fff', opacity: 0.8 }));
  el('rect', { x: 280, y: FY - 96, width: 100, height: 90, rx: 4, fill: '#C8D9EA' });
  el('path', { d: 'M 300 160 L 312 152 L 360 152 L 368 160 Z', fill: pal.blue });
  // 背負うかばん（体の後ろ）
  const bag = g({});
  el('rect', { x: -16, y: -22, width: 32, height: 40, rx: 9, fill: pal.violet }, bag);
  el('rect', { x: -10, y: -6, width: 20, height: 12, rx: 3, fill: '#8C70DD' }, bag);
  el('path', { d: 'M -8 -22 Q 0 -32 8 -22', stroke: '#7F63D6', 'stroke-width': 3, fill: 'none' }, bag);
  const b = k.buddy({ x: 160, y: FY, facing: 1 });
  const strap = el('path', { d: 'M -22 -70 Q -8 -48 -20 -22', stroke: '#7F63D6', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }, b.body);
  // 切符（手に持つ）
  const tk = g({});
  el('rect', { x: -12, y: -7, width: 24, height: 14, rx: 2, fill: '#fff', stroke: pal.coralDark, 'stroke-width': 2 }, tk);
  el('rect', { x: -12, y: -7, width: 7, height: 14, fill: pal.coral }, tk);
  // チェック表（切符・かばん）
  const L = g({}); tf(L, 80, 58);
  el('rect', { x: -44, y: -26, width: 88, height: 60, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, L);
  const ic1 = g({}, L); tf(ic1, -18, -10, 0, 0.8);
  el('rect', { x: -12, y: -7, width: 24, height: 14, rx: 2, fill: '#fff', stroke: pal.coralDark, 'stroke-width': 2 }, ic1);
  const ic2 = g({}, L); tf(ic2, -18, 16, 0, 0.55);
  el('rect', { x: -16, y: -22, width: 32, height: 40, rx: 9, fill: pal.violet }, ic2);
  const c1 = check(k, 16, -10, 1, pal.green, L), c2 = check(k, 16, 16, 1, pal.green, L);
  const spark = [0, 1, 2, 3].map(() => el('circle', { r: 3, fill: pal.yellow }));
  return {
    update(t) {
      const look1 = easeOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 1.2, 1.5)));
      const sling = easeInOut(seg(t, 1.5, 2.3));
      const okp = easeOut(seg(t, 2.8, 3.2));
      // かばん：足元→肩越しに背中へ
      P(b, { x: 160, facing: 1, armR: lerp(lerp(20, 95, look1), 60, okp), armL: t < 1.5 ? 10 : lerp(lerp(10, 170, hump(sling)), 160, okp), look: look1 > 0.3 ? 0.7 : 0.3, lean: 0, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t), lift: 10 * hump(seg(t, 3.0, 3.5)), squash: 1 - 0.05 * hump(seg(t, 2.9, 3.1)) + 0.04 * hump(seg(t, 3.5, 3.7)) });
      const h = hp(b, 1);
      tf(tk, h.x + 6, h.y - 8, look1 * -10);
      const sx = lerp(132, 136, sling), sy = lerp(FY - 12, FY - 46 - b.state.lift, sling) - 40 * hump(sling);
      tf(bag, t < 2.3 ? sx : 134, t < 2.3 ? sy : FY - 46 - b.state.lift, lerp(-20, 0, sling));
      if (t >= 2.3) bag.setAttribute('transform', `translate(134 ${(FY - 46 - b.state.lift).toFixed(2)})`);
      strap.setAttribute('opacity', t > 2.25 ? 1 : 0);
      c1(easeOut(seg(t, 0.9, 1.2))); c2(easeOut(seg(t, 2.3, 2.6)));
      spark.forEach((s, i) => { const a = i * 1.57 + 0.6, q = seg(t, 3.1, 3.8); tf(s, 160 + Math.cos(a) * (40 + 30 * q), FY - 70 + Math.sin(a) * (40 + 30 * q), 0, Math.max(0.001, hump(q))); });
    }
  };
}
