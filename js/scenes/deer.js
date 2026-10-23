// deer：森の中の道路を、シカがピョーンととびはねながら横切る。歩いていたまめは道ばたで立ち止まって見送る（例文 A deer ran across the road.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { scene, treeG, mark } from './nature.js';
import { beast } from './animal.js';

export const meta = { duration: 4.2, beats: [[0, '森の道'], [1.2, 'シカが走る'], [2.8, '横切った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 150, top: '#CFE8E0', bot: '#EEF7F2', ground: '#A9D38F', edge: '#97C77C' });
  [[30, 0.6], [90, 0.5], [300, 0.55], [370, 0.65]].forEach(([x, s]) => tf(treeG(k, s, '#5DB36F', '#4FA562').g, x, FY));
  // 奥から手前へのびる道路
  el('path', { d: `M 190 ${FY} L 220 ${FY} L 330 300 L 80 300 Z`, fill: '#8E97A6' });
  el('path', { d: `M 205 ${FY + 6} L 205 ${FY + 20} M 206 ${FY + 36} L 207 ${FY + 58} M 208 ${FY + 80} L 210 ${FY + 112} M 211 ${FY + 134} L 213 300`, stroke: '#fff', 'stroke-width': 4, 'stroke-dasharray': 'none' });
  const D = beast(k, 'deer');
  tf(treeG(k, 0.9, '#6BBF84', '#5DB36F').g, 40, 286);
  const me = k.buddy({ x: 340, y: 284, scale: 0.85, facing: -1 });
  const ex = mark(k, '!', pal.coralDark);
  const DY = 216, xf = (t) => lerp(-40, 440, easeIn2(seg(t, 1.0, 3.0)));
  function easeIn2(p) { return p; }
  return {
    update(t) {
      const x = xf(t), on = t > 1.0 && t < 3.0, ph = (x + 40) * 0.07;
      D.set({ x, y: DY, s: 0.95, ph, m: on ? 1 : 0, lift: on ? 14 * Math.abs(Math.sin(ph)) : 0, tilt: on ? -6 * Math.cos(ph) : 0, tail: 0 });
      D.g.setAttribute('opacity', x > -30 && x < 430 ? 1 : 0);
      const stop = easeOut(seg(t, 1.1, 1.4)), wx = lerp(370, 340, easeInOut(seg(t, 0, 1.1)));
      P(me, { x: wx, y: 284, facing: -1, walk: (370 - wx) * 0.11, armL: 8, armR: 8, lift: 10 * hump(seg(t, 1.2, 1.5)), look: clamp((x - wx) / -120, -1, 1) * -1, mood: t > 1.2 ? 'open' : 'smile', blink: blinkAt(t) });
      ex.show(seg(t, 1.2, 1.5) * (1 - seg(t, 3.0, 3.3)), wx, 180);
    }
  };
}
