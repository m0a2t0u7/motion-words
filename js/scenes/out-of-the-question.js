// out of the question：窓の外は大嵐。「出かける？」と傘を持つ相手に、稲光を見て首を大きく振り「ありえない」（Going out in this storm is out of the question.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { hp, held } from './dig.js';
import { P, blinkAt, talk, mark, umbrella } from './so-far-so-good.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '外は嵐'], [1.2, '出かける？'], [2.6, '論外']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  const WX = 130, WY = 34, WW = 150, WH = 120;
  const sky = el('rect', { x: WX, y: WY, width: WW, height: WH, fill: '#4F5A73' });
  const inner = g({ 'clip-path': k.clip((c) => el('rect', { x: WX, y: WY, width: WW, height: WH }, c)) });
  el('rect', { x: WX, y: WY + WH - 22, width: WW, height: 22, fill: '#3E5A4C' }, inner);
  const tr = g({}, inner); el('rect', { x: -4, y: -50, width: 8, height: 50, fill: '#5B4636' }, tr); el('circle', { cx: 0, cy: -60, r: 22, fill: '#3F7A5A' }, tr);
  const rain = g({}, inner);
  for (let i = 0; i < 26; i++) el('line', { x1: (i * 37) % 170, y1: (i * 53) % 150, x2: (i * 37) % 170 - 10, y2: (i * 53) % 150 + 18, stroke: '#BFD3EA', 'stroke-width': 2, 'stroke-linecap': 'round' }, rain);
  const bolt = el('path', { d: 'M 236 34 L 222 72 L 234 72 L 216 112 L 248 64 L 236 64 L 246 34 Z', fill: '#FFE27A' }, inner);
  el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 4, fill: 'none', stroke: '#fff', 'stroke-width': 7 });
  el('line', { x1: WX + WW / 2, y1: WY, x2: WX + WW / 2, y2: WY + WH, stroke: '#fff', 'stroke-width': 5 });
  // ドア
  el('rect', { x: 318, y: FY - 130, width: 70, height: 130, rx: 4, fill: pal.woodDark });
  el('circle', { cx: 330, cy: FY - 64, r: 4.5, fill: pal.yellow });
  const C = k.buddy({ x: 290, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const G = k.buddy({ x: 96, y: FY, facing: 1 });
  const um = umbrella(k, pal.blue);
  const q = talk(k, 'Go out?', 74, 32, 1);
  const no = say(k, 52, 40, -1); tf(mark(k, 'x', no.g, 1.3), 0, 0);
  return {
    update(t) {
      const fl = t > 1.6 && t < 1.85 ? 1 : t > 1.95 && t < 2.05 ? 0.7 : 0;
      sky.setAttribute('fill', fl ? '#E8ECF5' : '#4F5A73');
      bolt.setAttribute('opacity', fl ? 1 : 0);
      tf(rain, WX - 10 + ((t * 120) % 30) * -0.5, WY - 40 + ((t * 260) % 53));
      tf(tr, WX + 40, WY + WH - 18, 14 + 6 * Math.sin(t * 7));
      const offer = easeOut(seg(t, 0.6, 1.1)) * (1 - easeInOut(seg(t, 3.3, 3.8)));
      P(C, { facing: -1, armR: 8 + 60 * offer, armL: 8, look: t < 2.6 ? 0.5 : 0.2, mood: t < 2.6 ? 'smile' : 'flat', lean: -6 * fl, blink: blinkAt(t, 1) });
      { const h = hp(C, 1, 'R'); tf(um, h.x, h.y - 4, 180 - 25 * offer); }
      const shake = Math.sin(t * 20) * hump(seg(t, 2.4, 3.6));
      const jump = hump(seg(t, 1.6, 2.0));
      P(G, { facing: 1, look: t < 1.6 ? 0.6 : shake, lean: -10 * jump + 3 * shake, lift: 6 * jump,
        armR: t > 2.4 ? lerp(8, 95, easeOut(seg(t, 2.4, 2.7))) : 8 + 60 * jump, armL: 8 + 60 * jump,
        mood: t > 1.6 ? (t > 2.4 ? 'flat' : 'open') : 'smile', blink: blinkAt(t) });
      q.show(seg(t, 0.9, 1.2) * (t < 2.4 ? 1 : 0), 276, 120);
      no.show(seg(t, 2.6, 2.9), 130, 116);
    }
  };
}
