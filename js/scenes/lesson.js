// lesson：土曜日、先生（友だち）に見てもらいながらまめがピアノのレッスンを受ける（I take piano lessons on Saturdays.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp } from './dig.js';

export const meta = { duration: 4.2, beats: [[0, '土曜日'], [1.2, '弾く'], [3.2, '先生が褒める']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.0;
  const FY = roomBg(k, 'home', 240);
  // カレンダー
  const cal = g({}); tf(cal, 330, 76);
  el('rect', { x: -32, y: -26, width: 64, height: 56, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, cal);
  el('rect', { x: -32, y: -26, width: 64, height: 16, rx: 6, fill: pal.coral }, cal);
  k.text(0, 15, 'SAT', { 'font-size': 20, fill: pal.ink, 'text-anchor': 'middle' }, cal);
  // ピアノ
  const pi = g({});
  el('rect', { x: 170, y: 120, width: 190, height: 70, rx: 6, fill: pal.ink }, pi);
  el('rect', { x: 164, y: 188, width: 202, height: 10, rx: 3, fill: pal.woodDark }, pi);
  [180, 340].forEach((x) => el('rect', { x, y: 198, width: 8, height: FY - 198, fill: pal.woodDark }, pi));
  const keys = [];
  for (let i = 0; i < 9; i++) keys.push(el('rect', { x: 172 + i * 20, y: 170, width: 19, height: 24, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, pi));
  for (let i = 0; i < 8; i++) if (i % 7 !== 2 && i % 7 !== 6) el('rect', { x: 187 + i * 20, y: 170, width: 11, height: 15, rx: 2, fill: pal.ink }, pi);
  el('rect', { x: 205, y: 130, width: 40, height: 28, rx: 3, fill: '#fff' }, pi);
  [138, 146, 154].forEach((y) => el('line', { x1: 210, y1: y, x2: 240, y2: y, stroke: pal.sub, 'stroke-width': 1.5 }, pi));
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const tc = k.buddy({ x: 366, y: FY, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  const note = k.text(0, 0, '♪', { 'font-size': 22, fill: pal.violet });
  return {
    update(t) {
      const pl = seg(t, 1.0, 3.2), q = pl > 0 && pl < 1 ? 1 : 0;
      const w = Math.sin(t * 8) * q;
      P(b, { armR: lerp(20, 78, easeInOut(seg(t, 0.4, 1.0))) + w * 5, armL: lerp(20, 70, easeInOut(seg(t, 0.4, 1.0))) - w * 5, lean: 5, look: 0.7, mood: 'smile', blink: blinkAt(t) });
      keys.forEach((kk, i) => k.set(kk, { fill: q && i === Math.floor(t * 4) % 9 ? '#FFE9A8' : '#fff', y: q && i === Math.floor(t * 4) % 9 ? 172 : 170 }));
      const nt = (t * 0.9) % 1;
      tf(note, 240 + Math.sin(nt * 6) * 8, lerp(120, 70, nt));
      note.setAttribute('opacity', q * Math.sin(nt * Math.PI));
      const pr = easeInOut(seg(t, 3.0, 3.5));
      P(tc, { armR: 8 + 100 * pr * (1 - 0.0), armL: 8, look: 0.4, mood: pr > 0 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
    }
  };
}
