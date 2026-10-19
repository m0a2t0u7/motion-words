// hope：熱を出してベッドにいる友だち（氷のう・体温計）。まめが花を持ってお見舞いに来て花びんに挿し、元気になった友だちを思い描いて願う（例文 I hope you feel better soon.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, cloud } from './look-over.js';
import { path } from './queue-up.js';
import { bed } from './hate.js';
import { cue, talk } from './in-common.js';

function flowers(k, parent) {
  const g = k.g({}, parent), pal = k.pal;
  [[-6, -30, pal.coral], [4, -34, pal.yellow], [10, -26, pal.violet]].forEach(([x, y, c]) => { k.el('path', { d: `M 0 0 L ${x} ${y}`, stroke: pal.green, 'stroke-width': 2 }, g); k.el('circle', { cx: x, cy: y, r: 5, fill: c }, g); k.el('circle', { cx: x, cy: y, r: 1.8, fill: '#fff' }, g); });
  k.el('path', { d: 'M -6 -10 L 6 -10 L 3 2 L -3 2 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.2 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, '熱がある友だち'], [1.4, '花を届ける'], [2.8, '早くよくなって']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const B = bed(k, 196, FY, 190, pal.violet);
  const fr = k.buddy({ x: 300, y: FY - 30, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  fr.g.firstChild.setAttribute('display', 'none');
  // 氷のう（頭の上）と体温計
  const ice = g({}, fr.body);
  el('rect', { x: -18, y: -92, width: 36, height: 12, rx: 6, fill: '#BFE3F5', stroke: '#9CCDE8', 'stroke-width': 1.5 }, ice);
  el('rect', { x: -14, y: -42, width: 16, height: 3, rx: 1.5, fill: '#fff', stroke: pal.sub, 'stroke-width': 0.8 }, ice);
  el('circle', { cx: -14, cy: -40.5, r: 2, fill: pal.red }, ice);
  B.front(pal.violet);
  // 小さな台と花びん
  el('rect', { x: 140, y: FY - 54, width: 46, height: 54, rx: 4, fill: pal.wood });
  el('rect', { x: 140, y: FY - 54, width: 46, height: 5, rx: 2, fill: pal.woodDark });
  el('path', { d: `M 156 ${FY - 54} L 170 ${FY - 54} L 172 ${FY - 76} L 154 ${FY - 76} Z`, fill: pal.blue });
  const me = k.buddy({ x: -40, y: FY, scale: 0.85 });
  const fl = flowers(k);
  const th = cloud(k, 84, 56, 1);
  const happy = k.buddy({ x: 0, y: 18, scale: 0.34, parent: th.g, color: pal.coral, dark: pal.coralDark });
  happy.g.firstChild.setAttribute('display', 'none');
  const sun = el('circle', { cx: 26, cy: -10, r: 7, fill: pal.yellow }, th.g);
  const xf = path([[0.1, -40], [1.5, 110]]);
  return {
    update(t) {
      const cough = hump(seg(t, 0.4, 0.7)) + hump(seg(t, 0.8, 1.1));
      P(fr, { mood: t > 3.4 ? 'smile' : 'sad', blink: 0.5 + 0.3 * Math.sin(t * 2), look: 0.4, lean: -6 + 4 * cough, squash: 1 - 0.03 * cough });
      const w = walkTo(xf, t, -40, 1);
      // 花びんへ挿す（1.6-2.3）→ 手を胸の前で組む（2.6-）
      const put = easeInOut(seg(t, 1.6, 2.2)), pray = easeInOut(seg(t, 2.6, 3.0));
      P(me, { x: w.x, walk: w.walk, armL: lerp(w.armL, 70, pray), lean: w.lean + 10 * hump(put) - 4 * pray, look: 0.6, mood: t > 2.6 ? 'smile' : 'flat', blink: t > 3.0 ? 1 : blinkAt(t, 0.3), squash: 1 + 0.01 * Math.sin(t * 3) });
      const vase = { x: 163, y: FY - 80 };
      me.pose({ armR: t < 1.55 ? 70 + w.armR * 0.1 : lerp(lerp(70, reach(me, 0.85, 'R', vase.x, vase.y), put), 70, pray) });
      const h = hp(me, 0.85, 'R', 26);
      if (t < 2.25) tf(fl, h.x, h.y + 4); else tf(fl, vase.x, vase.y + 4);
      const tp = seg(t, 2.9, 3.3);
      th.show(tp, 210, 76);
      P(happy, { armR: 140, armL: 140, mood: 'grin', lift: 6 * Math.abs(Math.sin(t * 5)) });
      tf(happy.g, -6, 20, 0, 0.34);
    }
  };
}
