// in other words：家系図で「母（ママ）の兄弟」をたどって指したあと、同じ人を一言で「おじ」と言い換える（例文 He's my mom's brother. In other words, my uncle.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { reach } from './dig.js';
import { person } from './queue-up.js';
import { popS } from './from-scratch.js';

// 顔の丸アイコン（家系図用）
function head(k, c, d, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -14, y: -16, width: 28, height: 32, rx: 13, fill: c, stroke: d, 'stroke-width': 2 }, g);
  k.el('circle', { cx: -4.5, cy: -3, r: 2, fill: k.pal.ink }, g);
  k.el('circle', { cx: 4.5, cy: -3, r: 2, fill: k.pal.ink }, g);
  k.el('path', { d: 'M -3 4 Q 0 7 3 4', stroke: k.pal.ink, 'stroke-width': 1.6, fill: 'none' }, g);
  return g;
}

export const meta = { duration: 4.6, beats: [[0, '母の兄弟'], [2.0, '言い換えると'], [3.2, 'おじ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  // 壁の家系図：祖父母 → 母・母の兄弟 → 私
  el('rect', { x: 150, y: 10, width: 236, height: 140, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const N = { gp: [268, 34], mom: [214, 82], bro: [322, 82], me: [214, 126] };
  const line = (d, w = 3, c = pal.sub) => el('path', { d, stroke: c, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  line('M 268 48 L 268 58 M 214 58 L 322 58 M 214 58 L 214 66 M 322 58 L 322 66');
  line('M 214 98 L 214 110');
  tf(head(k, '#D9DFE7', pal.sub), 254, 34, 0, 0.8); tf(head(k, '#E6E0F4', pal.violet), 282, 34, 0, 0.8);
  const hm = head(k, pal.coral, pal.coralDark); tf(hm, ...N.mom);
  const hb = head(k, pal.blue, pal.blueDark); tf(hb, ...N.bro);
  const hme = head(k, pal.mint, pal.mintDark); tf(hme, ...N.me);
  // たどる線（私→母→祖父母の線→兄弟）
  const route = line('M 214 126 L 214 82 L 214 58 L 322 58 L 322 82', 5, pal.yellowDark);
  route.setAttribute('stroke-dasharray', 300); route.setAttribute('stroke-dashoffset', 300);
  // 言い換え：直線の矢印 私→おじ と「uncle」の札
  const direct = line('M 232 124 Q 290 120 312 98', 5, pal.green);
  direct.setAttribute('stroke-dasharray', 120); direct.setAttribute('stroke-dashoffset', 120);
  const tag = g({});
  el('rect', { x: -32, y: -13, width: 64, height: 26, rx: 13, fill: pal.green }, tag);
  k.text(0, 1, 'uncle', { 'font-size': 14, fill: '#fff' }, tag);
  const b = k.buddy({ x: 80, y: FY, facing: 1 });
  const u = person(k, 'blue', { x: 250, y: FY, facing: -1, scale: 0.85 });
  return {
    update(t) {
      const tr = easeInOut(seg(t, 0.4, 1.8));
      route.setAttribute('stroke-dashoffset', 300 * (1 - tr));
      const re = easeInOut(seg(t, 2.2, 2.9));
      direct.setAttribute('stroke-dashoffset', 120 * (1 - re));
      route.setAttribute('opacity', 1 - 0.7 * seg(t, 2.2, 2.6));
      tf(tag, 340, 120, 0, popS(seg(t, 2.9, 3.3)));
      // 図をなぞる指→おじ本人を手で示す
      P(b, { x: 80, facing: 1, look: 0.6 });
      const pts = [[214, 126], [214, 82], [214, 58], [322, 58], [322, 82]];
      const i = Math.min(3, Math.floor(tr * 4)), f = tr * 4 - i;
      const px = lerp(pts[i][0], pts[i + 1][0], f), py = lerp(pts[i][1], pts[i + 1][1], f);
      const aT = reach(b, 1, 'R', px, py), aU = reach(b, 1, 'R', 250, FY - 50);
      const show = easeOut(seg(t, 3.3, 3.7));
      const pt = easeOut(seg(t, 0.2, 0.5));
      P(b, { x: 80, facing: 1, look: show > 0.5 ? 0.6 : 0.8, armR: t < 3.3 ? lerp(8, aT, pt) : lerp(aT, aU, show), armL: 8, mood: t > 2.9 ? 'grin' : Math.sin(t * 20) > 0 && t < 1.9 ? 'open' : 'smile', blink: blinkAt(t) });
      if (show < 0.5) b.body.children[3].setAttribute('transform', 'translate(4 -6)');
      P(u, { x: 250, facing: -1, look: -0.5, mood: 'grin', armR: lerp(8, 120, easeOut(seg(t, 3.6, 4.0))) - 20 * Math.max(0, Math.sin(t * 9)) * seg(t, 3.9, 4.0), blink: blinkAt(t, 1) });
    }
  };
}
