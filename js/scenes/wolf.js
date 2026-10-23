// wolf：月夜の丘でオオカミが空を見上げて「アオーン」と遠ぼえする。キャンプのまめと友だちが耳をすませて聞く（例文 We heard a wolf howling.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { nightBg } from './nature.js';
import { moonG } from './moon.js';
import { beast } from './animal.js';

export const meta = { duration: 4.4, beats: [[0, '夜のキャンプ'], [1.0, '遠ぼえ'], [2.4, '聞こえた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY, stars } = nightBg(k, { FY: 240, ground: '#3D5A55' });
  tf(moonG(k, 26), 300, 66);
  el('path', { d: `M 160 ${FY} Q 260 ${FY - 110} 400 ${FY - 104} V ${FY} Z`, fill: '#2F4744' });
  const W = beast(k, 'wolf');
  // テントとたき火
  el('path', { d: `M 20 ${FY + 20} L 70 ${FY - 50} L 120 ${FY + 20} Z`, fill: '#F2B84B' }); el('path', { d: `M 70 ${FY - 50} L 60 ${FY + 20} L 80 ${FY + 20} Z`, fill: '#C98B2E' });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: '#3D5A55' });
  const fire = g({}); tf(fire, 220, FY + 34);
  el('path', { d: 'M -14 4 L 14 -2 M -14 -2 L 14 4', stroke: '#8A5A3C', 'stroke-width': 5, 'stroke-linecap': 'round' }, fire);
  const fl = el('path', { d: 'M -10 0 Q -12 -16 0 -30 Q 12 -16 10 0 Z', fill: '#FFB547' }, fire); const fl2 = el('path', { d: 'M -5 0 Q -6 -10 0 -18 Q 6 -10 5 0 Z', fill: '#FFE27A' }, fire);
  const glow = el('circle', { cx: 220, cy: FY + 20, r: 70, fill: '#FFB547', opacity: 0.12 });
  const me = k.buddy({ x: 150, y: FY + 44, scale: 0.85 });
  const fr = k.buddy({ x: 290, y: FY + 44, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const waves = [0, 1, 2].map(() => el('path', { d: 'M -10 -14 Q 4 0 -10 14', stroke: '#E8EEF8', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }));
  return {
    update(t) {
      stars.forEach((s, i) => s.setAttribute('opacity', 0.4 + 0.4 * Math.sin(t * 2 + i)));
      tf(fl, 0, 0, 0, 1 + 0.12 * Math.sin(t * 13), 1 + 0.15 * Math.sin(t * 17)); tf(fl2, 0, 0, 0, 1, 1 + 0.2 * Math.sin(t * 19));
      glow.setAttribute('opacity', 0.1 + 0.04 * Math.sin(t * 11));
      const how = easeInOut(seg(t, 0.8, 1.3)) * (1 - easeInOut(seg(t, 3.6, 4.0)));
      W.set({ x: 300, y: FY - 100, s: 0.75, face: 1, head: -50 * how, tilt: -6 * how, tail: 0 });
      if (W.parts.mouth) k.set(W.parts.mouth, { d: `M 8 6 Q 14 ${6 + 6 * how} 19 ${6 - 2 * how}` });
      const hd = W.headAt({ x: 300, y: FY - 100, s: 0.75 });
      waves.forEach((w, i) => { const q = ((t - 1.2 - i * 0.3) / 1.2) % 1; tf(w, hd.x - 10 - 70 * q, hd.y - 20 - 10 * q, 180, 0.6 + 0.7 * q); w.setAttribute('opacity', t > 1.2 + i * 0.3 && t < 3.8 ? 1 - q : 0); });
      const ear = easeInOut(seg(t, 1.8, 2.3));
      P(me, { x: 150, y: FY + 44, armR: lerp(8, 150, ear), look: lerp(0.3, 1, ear), mood: t > 1.6 ? 'open' : 'smile', blink: blinkAt(t), lift: 4 * hump(seg(t, 1.4, 1.7)) });
      P(fr, { x: 290, y: FY + 44, facing: -1, armL: lerp(8, 150, easeInOut(seg(t, 2.0, 2.5))), look: lerp(0, -1, ear), mood: t > 1.6 ? 'open' : 'smile', blink: blinkAt(t, 1) });
    }
  };
}
