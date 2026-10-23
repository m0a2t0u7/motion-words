// uncle：五重塔の見える京都の町。ひげのおじさんが家の戸を開けて、遊びに来たおいを迎える（例文 My uncle lives in Kyoto.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, mustache, keys, P, blinkAt, C } from './jam.js';
import { gait } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '京都'], [1.0, 'おじさんの家'], [2.6, 'いらっしゃい']] };

export function create(k) {
  const { el, pal } = k, FY = 236;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#FBE3D2'], [1, '#FFF6EE']]) });
  // 山と五重塔
  el('path', { d: 'M 0 150 Q 80 90 170 140 T 400 130 V 236 H 0 Z', fill: '#D7E8CF' });
  const pag = k.g({}); k.tf(pag, 70, 196);
  for (let i = 0; i < 5; i++) { const y = -i * 22, w = 46 - i * 6; el('path', { d: `M ${-w} ${y} L ${w} ${y} L ${w - 10} ${y - 8} L ${-w + 10} ${y - 8} Z`, fill: '#5A4A42' }, pag); el('rect', { x: -w * 0.5, y: y - 22 + 8, width: w, height: 14, fill: '#C9433A' }, pag); }
  el('rect', { x: -1.5, y: -140, width: 3, height: 30, fill: '#5A4A42' }, pag);
  el('rect', { x: 52, y: 196, width: 36, height: 40, fill: '#C9433A' });
  // 鳥居
  el('rect', { x: 0, y: 150, width: 46, height: 6, fill: '#E8574A' }); el('rect', { x: 8, y: 156, width: 5, height: 80, fill: '#E8574A' }); el('rect', { x: 34, y: 156, width: 5, height: 80, fill: '#E8574A' });
  // 町家（おじさんの家）
  el('rect', { x: 200, y: 110, width: 190, height: 126, fill: '#F3E6D0' });
  el('path', { d: 'M 190 112 L 400 112 L 400 92 L 210 92 Z', fill: '#4E5968' });
  for (let x = 300; x < 388; x += 8) el('rect', { x, y: 132, width: 4, height: 60, fill: '#8B5E3C' });
  el('rect', { x: 296, y: 196, width: 92, height: 6, fill: '#8B5E3C' });
  el('rect', { x: 216, y: 136, width: 70, height: 100, fill: '#4E3A2E' });
  const uncle = k.buddy({ x: 251, y: FY, scale: 1.04, facing: -1 });
  mustache(k, uncle);
  // 引き戸（右へ開く）
  const door = el('rect', { x: 216, y: 136, width: 70, height: 100, fill: '#B07548' });
  const lat = k.g({}); for (let x = 6; x < 70; x += 12) el('rect', { x, y: 6, width: 3, height: 88, fill: '#8B5E3C' }, lat);
  // 地名の札
  el('rect', { x: 140, y: 150, width: 56, height: 24, rx: 3, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 });
  k.text(168, 163, 'KYOTO', { 'font-size': 11 });
  el('rect', { x: 165, y: 174, width: 6, height: 62, fill: pal.woodDark });
  const nephew = k.buddy({ x: -40, y: FY, scale: 0.7, ...C(k, 'coral') });
  const A = arms(k, uncle, 1.04);
  const xf = keys([[0, -40], [2.2, 170]]);
  return {
    update(t) {
      const op = easeInOut(seg(t, 1.0, 1.6));
      k.set(door, { x: 216 + 64 * op, width: 70 - 0 }); k.tf(lat, 216 + 64 * op, 136);
      const out = easeInOut(seg(t, 1.7, 2.3));
      P(uncle, { x: lerp(251, 236, out), facing: -1, look: 0.5, blink: blinkAt(t), mood: t > 2.2 ? 'grin' : 'smile', lean: 4 * out });
      A.vis(op > 0.6);
      const wave = t > 2.3 ? Math.sin(t * 10) * 14 : 0;
      A.ang('R', t > 2.2 ? 140 + wave : 10); A.ang('L', 12);
      const g = gait(xf, t, -40);
      P(nephew, { x: g.x, walk: g.walk, armL: g.armL, armR: t > 2.4 ? 150 + wave : g.armR, lean: g.lean, look: 0.6, blink: blinkAt(t, 1), mood: t > 2.3 ? 'grin' : 'smile' });
    }
  };
}
