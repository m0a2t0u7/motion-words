// continue：絵本を読み聞かせていたまめが止まる。聞き手に「続けて」と促され、ページをめくって話の続きを読む（例文 Please continue your story.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { cue, talk } from './in-common.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, 'お話の途中'], [1.2, '止まる'], [2.5, '続きを話す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  el('ellipse', { cx: 210, cy: 262, rx: 150, ry: 14, fill: '#E2EEDF' });
  const me = k.buddy({ x: 130, y: FY, scale: 0.95 });
  const kid = k.buddy({ x: 300, y: FY, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 絵本（聞き手に絵を見せる向き）
  const bk = g({});
  el('rect', { x: -2, y: -20, width: 4, height: 40, fill: pal.coffee }, bk);
  el('rect', { x: 2, y: -20, width: 30, height: 40, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, bk);
  const pic1 = g({}, bk); el('path', { d: 'M 5 12 L 14 -2 L 22 8 L 26 3 L 30 12 Z', fill: pal.green }, pic1); el('circle', { cx: 24, cy: -10, r: 4, fill: pal.yellow }, pic1);
  const pic2 = g({}, bk); el('rect', { x: 4, y: -18, width: 26, height: 36, fill: '#4B5683' }, pic2); el('circle', { cx: 22, cy: -8, r: 5, fill: '#FFF3C4' }, pic2); el('circle', { cx: 10, cy: 4, r: 1.5, fill: '#fff' }, pic2);
  const leaf = el('rect', { x: 2, y: -20, width: 30, height: 40, rx: 2, fill: '#F7F4EE', stroke: pal.line, 'stroke-width': 1.5 }, bk);
  // 物語の吹き出し（場面の絵）
  const st = cue(k, '', 58, 40, -1);
  const s1 = g({}, st.g); el('path', { d: 'M -18 12 L -6 -6 L 4 6 L 10 0 L 18 12 Z', fill: pal.green }, s1); el('circle', { cx: 10, cy: -8, r: 5, fill: pal.yellow }, s1);
  const s2 = g({}, st.g); el('rect', { x: -22, y: -12, width: 44, height: 26, rx: 6, fill: '#4B5683' }, s2); el('circle', { cx: 9, cy: -2, r: 6, fill: '#FFF3C4' }, s2); const sp = star(k, s2, 4, '#fff'); tf(sp, -10, 2);
  const dots = cue(k, '...', 44, 28, -1, 16);
  const go = cue(k, 'and then?', 86, 30, 1, 13);
  return {
    update(t) {
      const flip = seg(t, 2.3, 2.7);
      const talking = talk(t, 0.1, 1.1) || talk(t, 2.8, 4.2);
      P(me, { armR: 72, armL: 10 + 20 * Math.sin(t * 3) * (talking ? 1 : 0), look: t > 1.1 && t < 2.3 ? 0.8 : 0.3, lean: 3, mood: talking || (t > 1.1 && t < 2.3 ? 'flat' : 'smile'), blink: blinkAt(t, 0.5) });
      const h = hp(me, 0.95, 'R', 26);
      tf(bk, h.x - 4, h.y - 8, -4, 1.1);
      pic1.setAttribute('opacity', flip < 0.5 ? 1 : 0); pic2.setAttribute('opacity', flip >= 0.5 ? 1 : 0);
      k.set(leaf, { transform: `translate(2 0) scale(${(Math.abs(Math.cos(flip * Math.PI)) * (flip > 0 && flip < 1 ? 1 : 0) + 0.001).toFixed(3)} 1) translate(-2 0)` });
      leaf.setAttribute('transform', `translate(2 0) scale(${(flip > 0 && flip < 1 ? (flip < 0.5 ? 1 - flip * 2 : -(flip - 0.5) * 2) : 0.001).toFixed(3)} 1) translate(-2 0)`);
      s1.setAttribute('opacity', t < 2.0 ? 1 : 0); s2.setAttribute('opacity', t >= 2.0 ? 1 : 0);
      st.show(seg(t, 0.1, 0.35) * (1 - seg(t, 1.0, 1.15)) + seg(t, 2.8, 3.05), 104, 112);
      dots.show(seg(t, 1.2, 1.4) * (1 - seg(t, 2.1, 2.25)), 104, 116);
      go.show(seg(t, 1.5, 1.75) * (1 - seg(t, 2.6, 2.8)), 304, 118);
      P(kid, { look: 0.6, mood: talk(t, 1.55, 2.2) || (t > 2.8 ? 'grin' : 'smile'), armR: 8 + 95 * hump(seg(t, 1.4, 2.5)) + 6 * Math.sin(t * 9) * (t > 1.5 && t < 2.3), lean: 6 * hump(seg(t, 1.4, 2.5)) + 3 * Math.sin(t * 2), squash: 1 - 0.03 * hump(seg(t, 3.4, 3.8)), blink: blinkAt(t, 1.6) });
    }
  };
}
