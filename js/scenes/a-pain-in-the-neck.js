// a pain in the neck：プリンターが紙づまりを起こしてうんざり（This printer is a pain in the neck.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, smooth, wobble, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '印刷開始'], [1.4, '紙がつまる'], [3.0, 'うんざり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 244, mood: 'indoor' });
  // 机
  el('rect', { x: 205, y: 190, width: 190, height: 12, rx: 4, fill: pal.wood });
  el('rect', { x: 215, y: 200, width: 10, height: 44, fill: pal.woodDark });
  el('rect', { x: 375, y: 200, width: 10, height: 44, fill: pal.woodDark });
  const pr = g({});
  el('rect', { x: -52, y: -48, width: 104, height: 50, rx: 8, fill: '#E8ECF2', stroke: '#C5CCD8', 'stroke-width': 2 }, pr);
  el('rect', { x: -40, y: -64, width: 60, height: 20, rx: 4, fill: '#fff', stroke: '#C5CCD8', 'stroke-width': 2 }, pr);
  el('rect', { x: -38, y: -20, width: 76, height: 7, rx: 3, fill: '#8A93A3' }, pr);
  const led = el('circle', { cx: 40, cy: -34, r: 4, fill: pal.green }, pr);
  // 紙（出てくる／つまる）
  const paper = el('path', { fill: '#fff', stroke: '#C5CCD8', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  const warn = g({});
  el('circle', { r: 14, fill: pal.red, stroke: '#fff', 'stroke-width': 3 }, warn);
  k.text(0, 1, '!', { 'font-size': 18, fill: '#fff' }, warn);
  const anger = g({});
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, c]) => el('path', { d: 'M ' + a * 3 + ' ' + c * 9 + ' Q ' + a * 8 + ' ' + c * 8 + ' ' + a * 9 + ' ' + c * 3, fill: 'none', stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, anger));
  const b = k.buddy({ x: 120, y: FY, scale: 1.0 });
  return {
    update(t) {
      const jam = seg(t, 1.2, 1.7);
      const shake = jam > 0 && t < 3.6 ? Math.sin(t * 40) * 2.2 * (t < 2.2 ? 1 : 0.4) : 0;
      tf(pr, 300 + shake, 190);
      const out = easeOut(seg(t, 0.3, 1.2)) * 34;
      let d = 'M 300 ' + (126 + 0) + ' ';
      d = '';
      const x0 = 285, y0 = 126;
      if (t < 1.2) {
        d = 'M ' + x0 + ' ' + y0 + ' L ' + (x0 + 36) + ' ' + y0 + ' L ' + (x0 + 36) + ' ' + (y0 - out) + ' L ' + x0 + ' ' + (y0 - out) + ' Z';
      } else {
        const c = easeOut(jam);
        d = 'M ' + x0 + ' ' + y0 + ' L ' + (x0 + 36) + ' ' + y0 + ' L ' + (x0 + 40 + 8 * c) + ' ' + (y0 - 14 - 10 * c) + ' L ' + (x0 + 22) + ' ' + (y0 - 22 - 12 * c) + ' L ' + (x0 + 38 - 14 * c) + ' ' + (y0 - 36 - 6 * c) + ' L ' + (x0 + 4) + ' ' + (y0 - 30 - 10 * c) + ' L ' + (x0 - 6 - 6 * c) + ' ' + (y0 - 16) + ' Z';
      }
      k.set(paper, { d, transform: 'translate(' + shake + ' 64)' });
      k.set(led, { fill: t < 1.2 ? pal.green : (Math.floor(t * 6) % 2 ? pal.red : '#F7B4AD') });
      const wp = backOut(seg(t, 1.5, 1.9), 2);
      tf(warn, 336, 100, 0, wp, wp);
      const rub = Math.sin(t * 11) * 6;
      const arm = easeOut(seg(t, 2.1, 2.6));
      b.pose({
        armR: lerp(8, 200 + rub, arm), armL: 8, lean: lerp(0, -5, arm), look: 0.9,
        squash: 1 - 0.04 * arm, mood: t < 1.5 ? 'smile' : t < 2.1 ? 'open' : 'sad'
      });
      const ap = backOut(seg(t, 2.3, 2.7), 2);
      tf(anger, 164, 128 + 2 * Math.sin(t * 8), 0, ap, ap);
    }
  };
}
