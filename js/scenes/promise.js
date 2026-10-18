// promise：「明日電話する」と言い、小指を出して相手と指切りする（例文 I promise to call you tomorrow.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';
import { hp } from './dig.js';
import { bubble, heart } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '電話すると言う'], [1.8, '小指を出す'], [3.0, '指切り']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 46, width: 100, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('ellipse', { cx: 200, cy: 262, rx: 150, ry: 14, fill: '#F1D9CF' });
  const G = k.buddy({ x: 150, y: FY, facing: 1 });
  const C = k.buddy({ x: 250, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const P = (b, o) => b.pose({ armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0, ...o });
  const bb = bubble(k, 104, 44);
  const ph = g({}, bb); tf(ph, -30, 0, -14);
  el('rect', { x: -8, y: -14, width: 16, height: 28, rx: 4, fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, ph);
  el('rect', { x: -5, y: -10, width: 10, height: 17, rx: 1.5, fill: '#fff' }, ph);
  el('path', { d: 'M -2 -14 q -5 -6 -9 -3 M 2 -14 q 5 -6 9 -3', stroke: pal.blueDark, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, ph);
  el('path', { d: 'M -12 0 L 6 0 M 1 -5 L 7 0 L 1 5', stroke: pal.sub, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: 'translate(0 0)' }, bb);
  const cal = g({}, bb); tf(cal, 32, 1);
  el('rect', { x: -14, y: -16, width: 28, height: 32, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -14, y: -16, width: 28, height: 10, rx: 4, fill: pal.red }, cal);
  k.text(0, 5, '+1', { 'font-size': 15, fill: pal.ink }, cal);
  const hook = g({});
  el('circle', { cx: -3, cy: 0, r: 5, fill: 'none', stroke: pal.mintDark, 'stroke-width': 3 }, hook);
  el('circle', { cx: 3, cy: 0, r: 5, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 }, hook);
  const hs = [0, 1, 2].map(() => heart(k, k.root));
  return {
    update(t) {
      const talk = t > 0.4 && t < 1.7 && Math.sin(t * 20) > 0;
      const up = easeInOut(seg(t, 1.9, 2.5)), shk = seg(t, 2.9, 3.8), sw = shk > 0 && shk < 1 ? Math.sin(shk * Math.PI * 4) * 10 : 0;
      P(G, { armR: lerp(8, 90, up) + sw, look: 0.4, mood: talk ? 'open' : t > 2.6 ? 'grin' : 'smile', lean: 3 * up });
      P(C, { armR: lerp(8, 90, easeInOut(seg(t, 2.1, 2.7))) + sw, look: 0.4, mood: t > 2.6 ? 'grin' : 'smile', lean: 3 * up });
      tf(bb, 150, 100, 0, Math.max(0.001, backOut(seg(t, 0.6, 1.1))) * (1 - 0.0));
      bb.setAttribute('opacity', 1 - seg(t, 3.6, 4.1) * 0.6);
      const a = hp(G, 1, 'R'), b = hp(C, 1, 'R');
      tf(hook, (a.x + b.x) / 2, (a.y + b.y) / 2 - 2, 0, seg(t, 2.6, 2.8) + 0.001);
      hs.forEach((h, i) => { const q = seg(t, 3.0 + i * 0.2, 3.9 + i * 0.1); tf(h, 186 + i * 14, 150 - 26 * q, 0, hump(q) * 1.1 + 0.001); });
    }
  };
}
