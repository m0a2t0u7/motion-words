// change：カフェでコーヒーを指さして注文しかけたが、考えが変わり（頭の中の絵がくるっと入れ替わる）ジュースを指さし直す（例文 I changed my mind.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { P, reach, hp } from './hospital.js';
import { room } from './dig.js';
import { cloud } from './look-over.js';

export const meta = { duration: 4.2, beats: [[0, 'コーヒーにする'], [1.6, '考えが変わる'], [2.8, 'ジュースにした']] };

function cup(k, parent) {
  const g = k.g({}, parent || k.root), pal = k.pal;
  k.el('path', { d: 'M -11 -12 L 11 -12 L 8 10 L -8 10 Z', fill: '#fff', stroke: pal.coffee, 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
  k.el('rect', { x: -9, y: -9, width: 18, height: 5, fill: pal.coffee }, g);
  k.el('path', { d: 'M 10 -7 Q 18 -5 9 4', fill: 'none', stroke: pal.coffee, 'stroke-width': 2.4 }, g);
  k.el('path', { d: 'M -3 -16 Q -6 -20 -2 -24 M 3 -16 Q 0 -20 4 -24', stroke: pal.sub, 'stroke-width': 1.6, fill: 'none' }, g);
  return g;
}
function juice(k, parent) {
  const g = k.g({}, parent || k.root), pal = k.pal;
  k.el('path', { d: 'M -10 -14 L 10 -14 L 7 12 L -7 12 Z', fill: '#FFE3A8', stroke: '#F2A65A', 'stroke-width': 2.4, 'stroke-linejoin': 'round' }, g);
  k.el('path', { d: 'M -9 -6 L 9 -6 L 7 12 L -7 12 Z', fill: '#F2A65A' }, g);
  k.el('line', { x1: 3, y1: -14, x2: 8, y2: -24, stroke: pal.red, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
  k.el('circle', { cx: -8, cy: -14, r: 5, fill: pal.yellow, stroke: '#E9B43A', 'stroke-width': 1.5 }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const R = room(k, 'indoor');
  const FY = R.FY, TY = R.TY;
  // メニュー看板（壁）：コーヒーとジュース
  el('rect', { x: 210, y: 30, width: 170, height: 86, rx: 6, fill: '#3F4A5E', stroke: pal.woodDark, 'stroke-width': 5 });
  const mC = cup(k); tf(mC, 252, 76, 0, 1.3);
  const mJ = juice(k); tf(mJ, 338, 76, 0, 1.3);
  const hiC = el('rect', { x: 226, y: 44, width: 52, height: 62, rx: 8, fill: 'none', stroke: pal.yellow, 'stroke-width': 3 });
  const hiJ = el('rect', { x: 312, y: 44, width: 52, height: 62, rx: 8, fill: 'none', stroke: pal.yellow, 'stroke-width': 3 });
  const staff = k.buddy({ x: 330, y: FY, scale: 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  R.front();
  const me = k.buddy({ x: 120, y: FY + 6, scale: 1.0 });
  // 考え雲：中身がくるっと入れ替わる
  const c = cloud(k, 70, 54, -1);
  const card = g({}, c.g);
  const tC = cup(k, card), tJ = juice(k, card);
  const q = k.text(0, 0, '?', { 'font-size': 22, fill: pal.blueDark });
  return {
    update(t) {
      // 指さし先：コーヒー → ジュース
      const sw = easeInOut(seg(t, 2.2, 2.7));
      const aim = { x: lerp(252, 338, sw), y: 82 };
      const pt = easeOut(seg(t, 0.3, 0.8)), hes = hump(seg(t, 1.2, 2.2));
      P(me, { y: FY + 6, look: 0.7, mood: t > 2.7 ? 'grin' : hes > 0.3 ? 'flat' : 'smile', lean: -2 });
      P(me, { ...me.state, armR: lerp(8, reach(me, 1, 'R', aim.x, aim.y), pt * (1 - 0.6 * hes)) });
      // 考え雲の中身：コーヒー→（裏返る）→ジュース
      c.show(seg(t, 0.2, 0.5), 80, 92);
      const flip = seg(t, 1.6, 2.2), sx = Math.cos(flip * Math.PI);
      tf(card, 0, 0, 0, Math.max(0.02, Math.abs(sx)), 1);
      tC.setAttribute('opacity', sx > 0 ? 1 : 0); tJ.setAttribute('opacity', sx > 0 ? 0 : 1);
      tf(q, 120, 46 - 6 * hump(seg(t, 1.2, 1.8)), 0, Math.max(0.001, hump(seg(t, 1.1, 2.2))));
      hiC.setAttribute('opacity', pt * (1 - sw)); hiJ.setAttribute('opacity', sw);
      P(staff, { facing: -1, look: 0.5, mood: 'smile', armR: lerp(8, 30, hump(seg(t, 2.8, 3.6))) });
    }
  };
}
