// safe：蛇口の水をコップにくみ、「飲んでも安全？」と確かめる。飲用OKのマークを見て、安心して飲む（例文 Is this water safe to drink?）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, pop, sc } from './member.js';
import { glass } from './hospital.js';
import { mark } from './so-far-so-good.js';
import { mark as sym } from './nature.js';
import { parkBg, tree } from './run-after.js';

export const meta = { duration: 4.4, beats: [[0, '水をくむ'], [1.4, '安全かな？'], [2.6, '飲んでも安心']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05, FY = 236;
  parkBg(k, FY);
  tree(k, 340, FY - 4, 1.1);
  // 水飲み場と看板
  const WX = 220;
  el('rect', { x: WX - 10, y: FY - 90, width: 20, height: 90, rx: 4, fill: '#C9D1DC' });
  el('path', { d: `M ${WX} ${FY - 90} L ${WX} ${FY - 104} L ${WX - 22} ${FY - 104} L ${WX - 22} ${FY - 96}`, stroke: '#9AA6B6', 'stroke-width': 6, fill: 'none', 'stroke-linejoin': 'round' });
  el('rect', { x: WX - 6, y: FY - 112, width: 12, height: 6, rx: 2, fill: pal.blue });
  const stream = el('rect', { x: WX - 24, width: 4, rx: 2, fill: pal.water });
  el('rect', { x: WX + 30, y: FY - 140, width: 4, height: 140, fill: pal.sub });
  const sign = g({}); tf(sign, WX + 32, FY - 150);
  el('rect', { x: -28, y: -24, width: 56, height: 46, rx: 6, fill: '#fff', stroke: pal.blue, 'stroke-width': 3 }, sign);
  el('path', { d: 'M -8 -14 L 8 -14 L 6 8 L -6 8 Z', fill: pal.water, stroke: pal.blueDark, 'stroke-width': 1.5 }, sign);
  const ok = mark(k, 'check', sign, 1.2); tf(ok, 12, 6, 0, 0.001);
  const q = sym(k, '?', pal.blueDark);
  const b = k.buddy({ x: 150, y: FY, scale: S, facing: 1 });
  const cup = glass(k);
  const ahh = el('path', { d: 'M -6 0 Q 0 -8 6 0', stroke: pal.sub, 'stroke-width': 2, fill: 'none' });
  return {
    update(t) {
      const fill = easeOut(seg(t, 0.4, 1.2)), inspect = easeInOut(seg(t, 1.3, 1.6)) * (1 - easeInOut(seg(t, 2.4, 2.7)));
      const drink = easeInOut(seg(t, 2.8, 3.2)), down = easeInOut(seg(t, 3.8, 4.2));
      const under = { x: WX - 22, y: FY - 70 }, eye = { x: 150 + 34 * S, y: FY - 70 * S }, mouth = { x: 150 + 20 * S, y: FY - 46 * S };
      let tg = t < 1.3 ? under : { x: lerp(lerp(under.x, eye.x, inspect), mouth.x, drink), y: lerp(lerp(under.y, eye.y, inspect + (t > 2.6 ? 0 : 0)), mouth.y, drink) };
      if (t > 2.4 && t < 2.8) tg = { x: lerp(eye.x, under.x - 8, easeInOut(seg(t, 2.4, 2.7))), y: lerp(eye.y, FY - 80, easeInOut(seg(t, 2.4, 2.7))) };
      if (down > 0) tg = { x: lerp(mouth.x, 150 + 44, down), y: lerp(mouth.y, FY - 50, down) };
      P(b, { look: t > 2.0 && t < 2.6 ? 1 : 0.6, lean: 4 + 6 * inspect - 10 * drink, blink: drink > 0.5 && down < 0.5 ? 1 : blinkAt(t), mood: t > 2.6 ? (drink > 0.5 && down < 0.5 ? 'flat' : 'grin') : t > 1.4 ? 'flat' : 'smile' });
      b.pose({ armR: reach(b, S, 'R', tg.x, tg.y) });
      const h = hp(b, S, 'R', 30);
      tf(cup.g, h.x + 4, h.y + 12, -60 * drink * (1 - down), S * 0.9);
      cup.set(lerp(0.05, 0.85, fill) - 0.7 * seg(t, 3.0, 3.6));
      const fl = t > 0.3 && t < 1.25;
      k.set(stream, { y: FY - 96, height: fl ? Math.max(0, h.y - (FY - 96)) : 0 });
      q.show(seg(t, 1.5, 1.8) - seg(t, 2.3, 2.5), 150 + 10, FY - 120);
      tf(ok, 12, 6, 0, pop(seg(t, 2.1, 2.5)));
      const a = seg(t, 3.7, 4.3); tf(ahh, 186, FY - 104 - 8 * a, 0, sc(hump(a)));
    }
  };
}
