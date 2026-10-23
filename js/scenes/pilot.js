// pilot：機内の入口でパイロットのまめが、乗ってくる乗客に手を振っておじぎしてあいさつする（例文 The pilot greeted the passengers.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, P, blinkAt, walkTo, path, wear, pop } from './member.js';
import { cue } from './in-common.js';
import { suitcase } from './vehicle.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '入口に立つ'], [1.4, 'あいさつする'], [3.0, '乗客を迎える']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1, FY = 240;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  // 機内の壁（丸い天井・丸窓・座席）と、右の乗降口
  el('path', { d: `M 0 ${FY} L 0 60 Q 0 20 60 18 L 400 18 L 400 ${FY} Z`, fill: '#EEF1F5' });
  for (let i = 0; i < 4; i++) { el('rect', { x: 26 + i * 62, y: 70, width: 26, height: 36, rx: 13, fill: '#BFDDF2', stroke: '#D5DCE5', 'stroke-width': 3 }); }
  for (let i = 0; i < 4; i++) { el('rect', { x: 18 + i * 62, y: 140, width: 34, height: 60, rx: 8, fill: '#5C7FD6' }); el('rect', { x: 22 + i * 62, y: 136, width: 26, height: 14, rx: 4, fill: '#fff', opacity: 0.8 }); }
  el('rect', { x: 0, y: 200, width: 270, height: FY - 200, fill: '#DCE3EB' });
  el('rect', { x: 330, y: 50, width: 70, height: FY - 50, rx: 10, fill: '#DDEFFA' });
  el('rect', { x: 330, y: 50, width: 8, height: FY - 50, fill: '#C9D1DC' });
  const b = k.buddy({ x: 250, y: FY, scale: S, facing: 1 }); wear(k, b, 'tie', pal.blueDark); wear(k, b, 'cap', '#2B3446');
  const p1 = k.buddy({ x: 440, y: FY, scale: 0.85, facing: -1, ...CO(k) });
  const p2 = k.buddy({ x: 470, y: FY, scale: 0.75, facing: -1, ...BL(k) });
  const cs = suitcase(k, pal.violet, '#7F63D6');
  const hi = cue(k, 'Welcome!', 82, 30, 1, 13);
  const x1 = path([[0.4, 440], [1.6, 340]]), x2 = path([[1.4, 480], [2.8, 372]]);
  return {
    update(t) {
      const wave = hump(seg(t, 1.5, 2.6)), bow = hump(seg(t, 2.6, 3.4));
      P(b, { armR: 8 + 150 * wave + Math.sin(t * 14) * 12 * wave, armL: 10, lean: 22 * bow, squash: 1 - 0.04 * bow, look: 0.7, blink: blinkAt(t), mood: t > 1.4 ? 'grin' : 'smile' });
      hi.show(seg(t, 1.6, 1.9) - seg(t, 3.7, 3.9), 290, 70);
      const a = walkTo(x1, t, 440, -1);
      P(p1, { x: a.x, walk: a.walk, armL: a.armL, armR: 8 + 130 * hump(seg(t, 2.0, 3.0)), lean: a.lean + 14 * hump(seg(t, 2.8, 3.5)), facing: -1, blink: blinkAt(t, 1), look: 0.5, mood: t > 1.8 ? 'grin' : 'smile' });
      const c = walkTo(x2, t, 480, -1);
      P(p2, { x: c.x, walk: c.walk, armL: c.armL, armR: 22, lean: c.lean, facing: -1, blink: blinkAt(t, 2), look: 0.5, mood: t > 3 ? 'grin' : 'smile' });
      const h = hp(p2, 0.75, 'R', 28); tf(cs, h.x, h.y, 0, 0.7);
    }
  };
}
