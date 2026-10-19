// apply：まめが「スタッフ募集」の張り紙を見て、応募用紙を書き、お店の人に渡して申し込む（例文 I applied for a part-time job.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, walkTo, clock } from './run-after.js';
import { hp } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '募集の張り紙'], [1.2, '用紙に書く'], [3.0, '申し込む']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 店：日よけ・窓・入口
  el('rect', { x: 150, y: 70, width: 250, height: 166, fill: '#FFF3E4' });
  el('path', { d: 'M 140 70 L 400 70 L 400 96 L 140 96 Z', fill: pal.coral });
  for (let x = 140; x < 400; x += 26) el('path', { d: `M ${x} 96 q 13 12 26 0`, fill: x % 52 ? '#fff' : pal.coral });
  el('rect', { x: 168, y: 114, width: 104, height: 80, rx: 4, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 300, y: 120, width: 70, height: 116, fill: '#E7D2B2' });
  // 張り紙：STAFF WANTED と時計（パートの時間）
  const po = g({}); tf(po, 220, 154);
  el('rect', { x: -36, y: -32, width: 72, height: 64, rx: 3, fill: '#fff', stroke: pal.yellowDark, 'stroke-width': 2.5 }, po);
  k.text(0, -18, 'STAFF', { 'font-size': 13, fill: pal.coralDark }, po);
  k.text(0, -4, 'WANTED', { 'font-size': 11, fill: pal.coralDark }, po);
  clock(k, 0, 16, 10, po).set(10, 0);
  k.text(22, 16, '4h', { 'font-size': 10, fill: pal.sub }, po);
  const boss = k.buddy({ x: 336, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  el('path', { d: 'M -24 -34 L 24 -34 L 26 -2 L -26 -2 Z', fill: '#F4F0E6' }, boss.body);
  const me = k.buddy({ x: 60, y: FY, scale: S });
  // 応募用紙（クリップボード）
  const form = g({});
  el('rect', { x: -14, y: -18, width: 28, height: 36, rx: 3, fill: '#C9A577' }, form);
  el('rect', { x: -12, y: -14, width: 24, height: 30, fill: '#fff' }, form);
  el('rect', { x: -9, y: -11, width: 8, height: 9, fill: '#DDEFFA', stroke: pal.sub, 'stroke-width': 1 }, form);
  const ls = [0, 1, 2].map((i) => el('line', { x1: -9, y1: 2 + i * 5, x2: -9, y2: 2 + i * 5, stroke: pal.blueDark, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, form));
  const pen = el('line', { stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
  const mx = (t) => t < 2.6 ? lerp(60, 160, easeInOut(seg(t, 0.1, 0.9))) : lerp(160, 262, easeInOut(seg(t, 2.6, 3.3)));
  return {
    update(t) {
      const w = walkTo(mx, t, 60, 1);
      const write = t > 1.1 && t < 2.6, give = easeInOut(seg(t, 3.3, 3.7));
      const look = t > 0.9 && t < 1.2;
      P(me, { x: w.x, walk: w.walk, armL: write ? 60 : w.armL, armR: lerp(write ? 50 + 6 * Math.sin(t * 20) : lerp(w.armR, 60, seg(t, 1.0, 1.2)), 92, give), lean: w.lean + 4 * give, look: look ? 0.9 : 0.6, mood: t > 3.6 ? 'grin' : 'smile' });
      const h = hp(me, S, 'R', 30), lh = hp(me, S, 'L', 30), bh = hp(boss, S, 'R', 30);
      const taken = t > 3.7;
      const recv = easeInOut(seg(t, 3.4, 3.7)) * (1 - easeInOut(seg(t, 3.9, 4.3)));
      P(boss, { x: 336, facing: -1, armR: lerp(8, 92, recv) + (taken ? 40 * (1 - recv) : 0), armL: 8, look: -0.5, lean: 4 * recv, mood: taken ? 'grin' : 'smile' });
      const bh2 = hp(boss, S, 'R', 30);
      tf(form, taken ? bh2.x - 6 : h.x + 6, taken ? bh2.y - 6 : h.y - 8, taken ? -8 : 6, t > 0.95 ? 1 : 0.001);
      ls.forEach((l, i) => { const q = seg(t, 1.2 + i * 0.45, 1.6 + i * 0.45); l.setAttribute('x2', -9 + 18 * q * (i === 2 ? 0.7 : 1)); });
      const pp = write ? { x: h.x + 2 + 8 * ((t * 1.1) % 0.45) / 0.45, y: h.y - 4 } : null;
      if (pp) k.set(pen, { x1: pp.x + 7, y1: pp.y - 12, x2: pp.x, y2: pp.y, opacity: 1 }); else k.set(pen, { opacity: 0 });
    }
  };
}
