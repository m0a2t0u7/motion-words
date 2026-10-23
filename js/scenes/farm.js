// farm：赤い納屋と畑のある農場。まめが訪ねて行くと、おじいちゃんとおばあちゃんが家の前で手をふる（例文 My grandparents live on a farm.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { scene, hills, cloudG, sunG } from './nature.js';
import { grandpa } from './out-of-touch.js';
import { beast } from './animal.js';
import { rails } from './field.js';

export const meta = { duration: 4.4, beats: [[0, '農場へ'], [1.6, '祖父母が住む'], [3.0, 'いらっしゃい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.8;
  const { FY } = scene(k, { FY: 236, top: '#CDE9FA', bot: '#F2FAFE', ground: '#BFE3A4', edge: '#A9D690' });
  tf(sunG(k, 16).g, 60, 40); tf(cloudG(k, 70, 26), 170, 46);
  hills(k, FY, '#D5EBB8', '#C6E3A6');
  // 畑のうね
  for (let i = 0; i < 4; i++) el('path', { d: `M 0 ${FY - 40 + i * 9} Q 60 ${FY - 46 + i * 9} 130 ${FY - 40 + i * 9}`, stroke: i % 2 ? '#8CC973' : '#C79A68', 'stroke-width': 5, fill: 'none' });
  // サイロと納屋
  el('rect', { x: 238, y: FY - 130, width: 34, height: 130, fill: '#D9DFE7' }); el('path', { d: `M 238 ${FY - 130} Q 255 ${FY - 152} 272 ${FY - 130} Z`, fill: '#9AA3B2' });
  el('path', { d: `M 268 ${FY} L 268 ${FY - 96} L 322 ${FY - 136} L 376 ${FY - 96} L 376 ${FY} Z`, fill: '#D9544A' });
  el('path', { d: `M 262 ${FY - 94} L 322 ${FY - 140} L 382 ${FY - 94}`, stroke: '#fff', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' });
  el('rect', { x: 298, y: FY - 62, width: 48, height: 62, fill: '#fff' }); el('rect', { x: 302, y: FY - 58, width: 40, height: 58, fill: '#B8433A' });
  el('path', { d: `M 302 ${FY - 58} L 342 ${FY} M 342 ${FY - 58} L 302 ${FY}`, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 312, y: FY - 116, width: 20, height: 18, fill: '#fff' });
  const pig = beast(k, 'pig'); pig.set({ x: 160, y: FY - 4, s: 0.55 });
  rails(k, 120, 220, FY + 2, 30, 50);
  const gpa = k.buddy({ x: 250, y: FY + 20, scale: S, facing: -1, color: pal.blue, dark: pal.blueDark });
  const gma = k.buddy({ x: 300, y: FY + 24, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  grandpa(k, gpa);
  const gh = g({}, gma.body); el('circle', { cx: 0, cy: -84, r: 12, fill: '#fff' }, gh); el('path', { d: 'M -27 -66 Q -24 -88 0 -88 Q 24 -88 27 -66 Q 14 -76 0 -74 Q -14 -76 -27 -66 Z', fill: '#E9EDF2' }, gh);
  const me = k.buddy({ x: -30, y: FY + 34, scale: S * 0.9 });
  const xf = (t) => lerp(-30, 170, easeInOut(seg(t, 0.2, 2.2)));
  return {
    update(t) {
      const w = walkTo(xf, t, -30), see = seg(t, 1.6, 2.0), wv = Math.sin(t * 9) * 18;
      pig.set({ x: 160 + Math.sin(t * 0.8) * 6, y: FY - 4, s: 0.55, face: Math.cos(t * 0.8) > 0 ? 1 : -1, ph: t * 6, m: 0.4, tail: Math.sin(t * 8) * 10 });
      P(me, { x: w.x, y: FY + 34, walk: w.walk, armL: w.armL, armR: t > 2.4 ? 150 + wv : w.armR, lean: w.lean, mood: t > 2.2 ? 'grin' : 'smile', blink: blinkAt(t), lift: 6 * hump(seg(t, 2.4, 2.8)) });
      P(gpa, { x: 250, y: FY + 20, facing: -1, armR: see > 0 ? lerp(8, 150, easeOut(see)) + wv * see : 8, mood: t > 1.8 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      P(gma, { x: 300, y: FY + 24, facing: -1, armL: lerp(8, 110, easeOut(seg(t, 2.4, 3.0))), armR: lerp(8, 110, easeOut(seg(t, 2.4, 3.0))), mood: t > 2.0 ? 'grin' : 'smile', blink: blinkAt(t, 2) });
    }
  };
}
