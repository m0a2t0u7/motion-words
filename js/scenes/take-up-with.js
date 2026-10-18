// take up with：学校の裏、壁に落書きをしているサングラスの不良グループ。まめが近づいて仲間に入り、同じサングラスをかけて一緒にたむろする（例文 He took up with a bad crowd at school.）
import { seg, lerp, easeInOut, easeOut, hump, backOut } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '不良グループ'], [1.8, '近づいて仲間に'], [3.4, 'つるみ始めた']] };

function shades(k, b) {
  const g = k.g({}, b.body);
  k.el('rect', { x: -19, y: -60, width: 16, height: 10, rx: 4, fill: k.pal.ink }, g);
  k.el('rect', { x: 3, y: -60, width: 16, height: 10, rx: 4, fill: k.pal.ink }, g);
  k.el('line', { x1: -4, y1: -56, x2: 4, y2: -56, stroke: k.pal.ink, 'stroke-width': 2.5 }, g);
  k.el('line', { x1: -17, y1: -58, x2: -11, y2: -58, stroke: '#fff', 'stroke-width': 1.5, opacity: 0.6 }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 校舎と時計
  el('rect', { x: 10, y: 50, width: 210, height: 186, rx: 4, fill: '#F3E6DC' });
  el('circle', { cx: 115, cy: 76, r: 16, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 });
  el('line', { x1: 115, y1: 76, x2: 115, y2: 66, stroke: pal.ink, 'stroke-width': 2.5 }); el('line', { x1: 115, y1: 76, x2: 123, y2: 76, stroke: pal.ink, 'stroke-width': 2.5 });
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) el('rect', { x: 26 + i * 64, y: 108 + j * 50, width: 46, height: 32, rx: 3, fill: '#DDEFFA' });
  // 裏の灰色の壁と落書き
  el('rect', { x: 220, y: 136, width: 180, height: 100, fill: '#C9CED6' });
  for (let i = 0; i < 4; i++) el('line', { x1: 220, x2: 400, y1: 156 + i * 20, y2: 156 + i * 20, stroke: '#B5BBC5', 'stroke-width': 1.5 });
  const graf = el('path', { d: 'M 300 160 q 10 -16 20 0 t 20 0 t 20 0 M 310 178 l 14 10 l 10 -14 l 12 12', stroke: pal.violet, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': 160, 'stroke-dashoffset': 160 });
  const crowd = [k.buddy({ x: 300, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark, facing: -1 }), k.buddy({ x: 360, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark, facing: -1 })];
  crowd.forEach((c) => shades(k, c));
  const can = g({}); el('rect', { x: -5, y: -10, width: 10, height: 20, rx: 3, fill: pal.violet }, can); el('rect', { x: -3, y: -14, width: 6, height: 5, fill: pal.sub }, can);
  const me = k.buddy({ x: 60, y: FY, scale: 0.9 });
  const myShades = shades(k, me);
  const xf = (t) => lerp(60, 240, easeInOut(seg(t, 0.6, 2.0)));
  return {
    update(t) {
      k.set(graf, { 'stroke-dashoffset': 160 * (1 - seg(t, 0, 1.6)) });
      const p = gait(xf, t, 60);
      const join = easeOut(seg(t, 2.3, 2.6)), cool = easeInOut(seg(t, 2.9, 3.3));
      me.pose({ x: p.x, walk: p.walk, armL: p.armL, armR: lerp(p.armR, 150, hump(seg(t, 2.8, 3.4))), lean: p.lean - 6 * cool, look: 0.4, mood: t > 3.2 ? 'flat' : 'smile' });
      // サングラス：手で上から下ろしてかける
      const on = easeOut(seg(t, 2.9, 3.3));
      tf(myShades, 0, lerp(-40, 0, on)); myShades.setAttribute('opacity', seg(t, 2.85, 2.95));
      const lead = crowd[0];
      lead.pose({ facing: t < 1.7 ? 1 : -1, armR: t < 1.7 ? 120 + Math.sin(t * 14) * 8 : lerp(20, 90, join) * (1 - seg(t, 2.9, 3.2)) + 10, lean: -6 + 3 * join, mood: t > 2.2 ? 'grin' : 'flat', look: 0.5 });
      const h = lead.handPos('R');
      tf(can, h.x + 2 * lead.state.facing, h.y - 4);
      crowd[1].pose({ lean: -6, armL: 20 + 15 * hump(seg(t, 2.5, 2.9)), armR: 20, mood: t > 2.4 ? 'grin' : 'flat', look: 0.4, lift: hump(seg(t, 3.4, 3.7)) * 4 });
    }
  };
}
