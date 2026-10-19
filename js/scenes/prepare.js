// prepare：まめが鍋で夕ごはんを作り、できた料理を家族の待つ食卓に並べる（例文 I prepared dinner for my family.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, walkTo } from './run-after.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '料理を作る'], [1.8, '食卓へ運ぶ'], [3.2, '夕ごはん完成']] };

function dish(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('ellipse', { cx: 0, cy: 0, rx: 18, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  k.el('path', { d: 'M -13 -1 Q 0 -16 13 -1 Z', fill: '#E58A4E' }, g);
  k.el('circle', { cx: -4, cy: -5, r: 2.4, fill: pal.green }, g);
  k.el('circle', { cx: 5, cy: -4, r: 2.4, fill: pal.red }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.82;
  const FY = k.backdrop({ floorY: 238, mood: 'evening' });
  el('rect', { x: 300, y: 40, width: 70, height: 54, rx: 6, fill: '#3E4A72', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 350, cy: 60, r: 7, fill: '#FFF3C4' });
  // コンロと鍋
  el('rect', { x: 0, y: 188, width: 110, height: 50, fill: '#D9DEE6' });
  el('rect', { x: 0, y: 182, width: 112, height: 8, rx: 3, fill: '#8A93A6' });
  const pot = g({}); tf(pot, 58, 182);
  el('rect', { x: -24, y: -26, width: 48, height: 26, rx: 5, fill: pal.blueDark }, pot);
  el('rect', { x: -28, y: -28, width: 56, height: 5, rx: 2, fill: pal.blue }, pot);
  el('rect', { x: 30, y: 200, width: 56, height: 26, rx: 3, fill: '#C9D1DC' });
  const steam = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 6 -8 0 -16 q -6 -8 0 -16', fill: 'none', stroke: '#fff', 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
  // 家族（食卓で待つ）
  const fam1 = k.buddy({ x: 300, y: FY, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
  const fam2 = k.buddy({ x: 352, y: FY, scale: 0.55, facing: -1, color: pal.yellow, dark: pal.yellowDark });
  const me = k.buddy({ x: 130, y: FY, scale: S, facing: -1 });
  const spoon = el('line', { stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  // 食卓（家族の腰から下を隠す）
  const TY = 200;
  el('rect', { x: 190, y: TY, width: 210, height: 8, rx: 3, fill: pal.wood });
  el('rect', { x: 190, y: TY + 8, width: 210, height: 18, fill: '#F3D7C6' });
  el('rect', { x: 200, y: TY + 26, width: 8, height: FY - TY - 26, fill: pal.woodDark });
  el('rect', { x: 380, y: TY + 26, width: 8, height: FY - TY - 26, fill: pal.woodDark });
  k.shadow(295, FY + 1, 100, 4);
  [250, 330, 372].forEach((x) => el('ellipse', { cx: x, cy: TY - 1, rx: 12, ry: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }));
  const d = dish(k);
  const mx = (t) => lerp(130, 214, easeInOut(seg(t, 2.0, 2.9)));
  return {
    update(t) {
      const w = walkTo(mx, t, 130, -1);
      const cook = t < 1.7;
      const stir = cook ? Math.sin(t * 7) : 0;
      const put = easeInOut(seg(t, 2.9, 3.3));
      P(me, { x: w.x, walk: w.walk, facing: cook ? -1 : 1, armR: cook ? 64 + 10 * stir : lerp(80, 74, put), armL: cook ? 8 : lerp(w.armL, 70, seg(t, 1.7, 2.0)),
        lean: cook ? 8 : w.lean + 10 * put * (1 - seg(t, 3.4, 3.8)), look: 0.7, mood: t > 3.3 ? 'grin' : 'smile' });
      const h = hp(me, S, 'R', 30);
      if (cook) k.set(spoon, { x1: h.x, y1: h.y - 4, x2: 62 + 8 * stir, y2: 164, opacity: 1 }); else k.set(spoon, { opacity: 0 });
      // 料理：盛りつけて手に → 運ぶ → 食卓の真ん中へ
      let dx = h.x + 4, dy = h.y - 4;
      if (t > 2.9) { dx = lerp(h.x + 4, 290, put); dy = lerp(h.y - 4, TY - 2, put); }
      if (t > 3.3) { dx = 290; dy = TY - 2 + wobble(seg(t, 3.3, 3.8), 2, 6); }
      tf(d, dx, dy, 0, t > 1.75 ? 1 : 0.001);
      steam.forEach((s, i) => { const q = (t - i * 0.4) / 1.2, u = q - Math.floor(q); tf(s, 50 + i * 8, 150 - 30 * u); s.setAttribute('opacity', Math.sin(u * Math.PI) * 0.9 * (1 - seg(t, 2.0, 2.6) * 0.6)); });
      const joy = seg(t, 3.3, 3.6);
      P(fam1, { x: 300, facing: -1, look: -0.4, mood: joy > 0 ? 'grin' : 'smile', armL: 8, armR: 8 + 120 * joy, lift: 4 * hump(seg(t, 3.4, 3.8)) });
      P(fam2, { x: 352, facing: -1, look: -0.4, mood: joy > 0 ? 'grin' : 'smile', armL: 140 * joy, armR: 140 * joy, lift: t > 3.3 ? 6 * Math.abs(Math.sin((t - 3.3) * 8)) : 0 });
    }
  };
}
