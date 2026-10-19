// make：日曜日（カレンダーSUN）、母がスポンジにクリームを塗り、いちごを1つずつのせてケーキを作る。子どもが見ている（例文 My mother makes a cake every Sunday.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach, frontL } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { kitchenBg } from './weigh.js';
import { desk } from './get-on-with.js';
import { calendar } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, 'クリームを塗る'], [1.9, 'いちごをのせる'], [3.6, 'ケーキの完成']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = kitchenBg(k, 236);
  const cal = calendar(k, 200, 34, 52); cal.set('SUN');
  const S = 1.15, CX = 252;
  const mom = k.buddy({ x: 184, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  // エプロン
  el('path', { d: 'M -20 -40 L 20 -40 L 24 -2 Q 0 4 -24 -2 Z', fill: '#fff', opacity: 0.9 }, mom.body);
  const kid = k.buddy({ x: 352, y: FY, scale: 0.74, facing: -1 });
  const top = desk(k, 90, 230, FY);
  // ケーキ（台の上に固定）
  const cake = g({}); tf(cake, CX, top);
  el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cake);
  el('rect', { x: -26, y: -18, width: 52, height: 17, rx: 3, fill: '#F2C882' }, cake);
  el('rect', { x: -26, y: -11, width: 52, height: 3, fill: '#FFF6E8', opacity: 0.9 }, cake);
  const cream = el('rect', { x: -27, y: -18, width: 54, height: 0, rx: 3, fill: '#FFFDF8', stroke: '#EFE3D2', 'stroke-width': 1 }, cake);
  const berries = [-13, 0, 13].map(() => { const b = g({}, cake); el('path', { d: 'M 0 -5 Q 6 -4 5 2 Q 2 7 0 7 Q -2 7 -5 2 Q -6 -4 0 -5 Z', fill: pal.red }, b); el('path', { d: 'M -3 -5 L 0 -8 L 3 -5', fill: pal.green, stroke: pal.green, 'stroke-width': 1.5 }, b); return b; });
  // いちごの小鉢（台の上）とへら・つまんだいちご（右手）
  const bowl = g({});
  el('path', { d: 'M -14 -6 L 14 -6 Q 12 6 0 6 Q -12 6 -14 -6 Z', fill: pal.blue }, bowl);
  [-6, 2, 8].forEach((x, i) => el('circle', { cx: x, cy: -7 - (i % 2) * 2, r: 4, fill: pal.red }, bowl));
  const spat = g({});
  el('rect', { x: -2, y: -6, width: 4, height: 14, rx: 2, fill: pal.woodDark }, spat);
  el('rect', { x: -4, y: 8, width: 8, height: 16, rx: 3, fill: '#C9D1DC' }, spat);
  const pick = g({}); el('path', { d: 'M 0 -5 Q 6 -4 5 2 Q 2 7 0 7 Q -2 7 -5 2 Q -6 -4 0 -5 Z', fill: pal.red }, pick);
  const cTop = (c) => top - 18 - c;
  return {
    update(t) {
      const cr = 7 * easeOut(seg(t, 0.4, 1.8));
      k.set(cream, { y: -18 - cr, height: cr + 3 });
      P(mom, { lean: 12, look: 0.6, mood: 'smile', blink: blinkAt(t, 0.3), armL: 10, squash: 1 - 0.01 * Math.sin(t * 6) });
      const bp = { x: 208, y: top - 6 }; tf(bowl, bp.x, bp.y);
      let tx, ty, ber = -1;
      if (t < 1.9) { const sw = Math.sin((t - 0.4) * 7); tx = CX + 18 * sw * seg(t, 0.3, 0.5); ty = cTop(cr) - 26; }
      else {
        const i = Math.min(2, Math.floor((t - 1.9) / 0.55)), q = ((t - 1.9) - i * 0.55) / 0.55;
        const a = { x: bp.x, y: bp.y - 26 }, b = { x: CX - 13 + i * 13, y: cTop(7) - 30 };
        const u = easeInOut(clamp(q / 0.8));
        tx = lerp(a.x, b.x, u); ty = lerp(a.y, b.y, u) - 14 * hump(u); ber = q < 0.8 ? i : -1;
      }
      mom.pose({ armR: reach(mom, S, 'R', tx, ty + 26) });
      const h = hp(mom, S, 'R', 28);
      tf(spat, h.x, h.y - 4, -60); spat.setAttribute('opacity', t < 1.9 ? 1 : 0);
      tf(pick, h.x, h.y + 4); pick.setAttribute('opacity', ber >= 0 ? 1 : 0);
      berries.forEach((b, i) => { const on = t > 1.9 + i * 0.55 + 0.44; const q = seg(t, 1.9 + i * 0.55 + 0.44, 1.9 + i * 0.55 + 0.7); tf(b, -13 + i * 13, -18 - 7 - 5 + wobble(q, 2, 6) * 1.5); b.setAttribute('opacity', on ? 1 : 0); });
      P(kid, { look: 0.7, lean: 6, mood: t > 3.6 ? 'grin' : 'open', lift: 5 * hump(seg(t, 3.7, 4.1)), armR: 8 + 120 * hump(seg(t, 3.6, 4.3)), blink: blinkAt(t, 1.4) });
    }
  };
}
