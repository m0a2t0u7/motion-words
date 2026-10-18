// face to face：これまでは画面越しのビデオ通話だけ。ついに通りで実際に会い、向かい合って握手する（例文 We finally met face to face.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { streetBg } from './weigh.js';
import { roomBg } from './look-over.js';
import { reach, hp } from './dig.js';
import { heart } from './weigh.js';

// ノートパソコン（原点＝底の中央）。screen の中に相手の顔を入れる
function laptop(k, x, y, face, faceDark) {
  const { el, g } = k;
  const L = g({});
  el('rect', { x: x - 34, y: y - 4, width: 68, height: 6, rx: 2, fill: k.pal.sub }, L);
  el('rect', { x: x - 28, y: y - 50, width: 56, height: 44, rx: 4, fill: k.pal.ink }, L);
  el('rect', { x: x - 24, y: y - 46, width: 48, height: 36, rx: 2, fill: '#DDEFFA' }, L);
  el('rect', { x: x - 12, y: y - 36, width: 24, height: 26, rx: 11, fill: face }, L);
  el('circle', { cx: x - 4, cy: y - 28, r: 1.8, fill: k.pal.ink }, L);
  el('circle', { cx: x + 4, cy: y - 28, r: 1.8, fill: k.pal.ink }, L);
  el('path', { d: `M ${x - 3} ${y - 23} Q ${x} ${y - 20} ${x + 3} ${y - 23}`, stroke: k.pal.ink, 'stroke-width': 1.4, fill: 'none' }, L);
  return L;
}

export const meta = { duration: 4.6, beats: [[0, '画面越し'], [1.8, 'ついに会う'], [3.4, '向かい合う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  // 場面2：通り（下の層）
  const FY = streetBg(k, 236);
  const c2 = k.buddy({ x: 400, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b2 = k.buddy({ x: 0, y: FY, facing: 1 });
  const hearts = g({}); heart(k, hearts, pal.red);
  // 場面1：左右に分かれた部屋（上の層、あとで消える）
  const A = g({});
  const clipL = k.clip((c) => el('rect', { x: 0, y: 0, width: 198, height: 300 }, c));
  const clipR = k.clip((c) => el('rect', { x: 202, y: 0, width: 198, height: 300 }, c));
  const roomL = g({ 'clip-path': clipL }, A), roomR = g({ 'clip-path': clipR }, A);
  [roomL, roomR].forEach((r, i) => {
    el('rect', { x: 0, y: 0, width: 400, height: 300, fill: i ? '#FBF0E6' : '#EEF5FB' }, r);
    el('rect', { x: 0, y: 236, width: 400, height: 64, fill: pal.floor }, r);
    el('rect', { x: i ? 220 : 20, y: 40, width: 70, height: 54, rx: 5, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 }, r);
    el('rect', { x: i ? 222 : 70, y: 190, width: 110, height: 8, rx: 3, fill: pal.wood }, r);
    el('rect', { x: i ? 272 : 120, y: 198, width: 8, height: 38, fill: pal.woodDark }, r);
  });
  const b1 = k.buddy({ x: 50, y: 236, facing: 1, parent: roomL });
  roomL.appendChild(laptop(k, 140, 190, pal.coral));
  const c1 = k.buddy({ x: 350, y: 236, facing: -1, color: pal.coral, dark: pal.coralDark, parent: roomR });
  roomR.appendChild(laptop(k, 262, 190, pal.mint));
  el('rect', { x: 198, y: 0, width: 4, height: 300, fill: '#fff' }, A);
  return {
    update(t) {
      const out = easeInOut(seg(t, 1.6, 2.0));
      A.setAttribute('opacity', 1 - out);
      const wave = Math.sin(t * 8) * 25;
      P(b1, { x: 50, y: 236, armR: 120 + wave, look: 0.7, mood: Math.sin(t * 18) > 0 ? 'open' : 'smile', blink: blinkAt(t) });
      P(c1, { x: 350, y: 236, facing: -1, armR: 120 - wave, look: 0.7, mood: 'grin', blink: blinkAt(t, 1) });
      const xb = (tt) => lerp(40, 168, easeOut(seg(tt, 1.8, 3.2)));
      const xc = (tt) => lerp(360, 232, easeOut(seg(tt, 1.8, 3.2)));
      const wb = walkTo(xb, t, 40, 1), wc = walkTo(xc, t, 360, -1);
      const sh = easeOut(seg(t, 3.2, 3.5));
      const pump = Math.sin(seg(t, 3.5, 4.3) * Math.PI * 4) * 8 * (t < 4.3 ? 1 : 0) * sh;
      P(b2, { ...wb, facing: 1, look: 0.6, mood: 'grin', blink: blinkAt(t) });
      P(c2, { ...wc, facing: -1, look: 0.6, mood: 'grin', blink: blinkAt(t, 1) });
      const mx = 200, my = FY - 52 + pump;
      const ab = reach(b2, 1, 'R', mx, my), ac = reach(c2, 1, 'R', mx, my);
      P(b2, { ...wb, facing: 1, look: 0.6, mood: 'grin', blink: blinkAt(t), armR: lerp(wb.armR, ab, sh) });
      P(c2, { ...wc, facing: -1, look: 0.6, mood: 'grin', blink: blinkAt(t, 1), armR: lerp(wc.armR, ac, sh) });
      tf(hearts, 200, FY - 120 - 10 * seg(t, 3.6, 4.6), 0, Math.max(0.001, easeOut(seg(t, 3.6, 4.0)) * 1.6));
    }
  };
}
