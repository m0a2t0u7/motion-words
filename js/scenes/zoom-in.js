// zoom-in：二本指を広げて地図を拡大し、道の名前が読める（例文 Zoom in to see the street names.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '全体の地図'], [1.2, '指を広げる'], [3.0, '道の名前']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 3, fill: '#EAE3D8' });
  el('rect', { x: 30, y: 38, width: 74, height: 54, rx: 4, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 5 });
  el('circle', { cx: 52, cy: 58, r: 8, fill: pal.yellow });
  el('path', { d: 'M 35 88 L 62 62 L 78 78 L 90 66 L 99 88 Z', fill: pal.mint });
  el('rect', { x: 372, y: 210, width: 20, height: 26, rx: 4, fill: pal.coral });
  [-14, 0, 14].forEach((d, i) => el('ellipse', { cx: 382 + d, cy: 198 - (i === 1 ? 10 : 0), rx: 7, ry: 17, fill: pal.green, transform: `rotate(${d * 1.5} ${382 + d} 208)` }));
  // 画面スタンド
  k.shadow(266, FY, 62, 8);
  el('rect', { x: 258, y: 218, width: 16, height: FY - 222, fill: '#AEB8C6' });
  el('ellipse', { cx: 266, cy: FY - 4, rx: 44, ry: 8, fill: '#9AA5B5' });
  el('rect', { x: 168, y: 48, width: 196, height: 172, rx: 16, fill: pal.ink });
  const SX = 177, SY = 58, SW = 178, SH = 152;
  el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 8, fill: '#fff' });
  const screen = g({ 'clip-path': k.clip((c) => el('rect', { x: SX, y: SY, width: SW, height: SH, rx: 8 }, c)) });
  const content = g({}, screen);
  el('rect', { x: -230, y: -190, width: 460, height: 400, fill: '#E8F2E0' }, content);
  el('path', { d: 'M -230 -112 Q -90 -140 20 -108 T 230 -90', fill: 'none', stroke: pal.water, 'stroke-width': 30 }, content);
  const blk = ['#F7D9C4', '#DCE6F7', '#F7EBC4', '#E2D8F7', '#D3EFE3'];
  let n = 0;
  const xs = [[-226, -72], [-60, 78], [90, 226]], ys = [[-50, 60], [78, 190]];
  ys.forEach(([y0, y1]) => xs.forEach(([x0, x1]) => {
    const w = (x1 - x0) / 2, h = (y1 - y0) / 2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++)
      el('rect', { x: x0 + 5 + i * w, y: y0 + 5 + j * h, width: w - 10, height: h - 10, rx: 3, fill: blk[n++ % 5] }, content);
  }));
  [-56, 66].forEach((y) => el('rect', { x: -230, y: y - 6, width: 460, height: 12, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 1.5 }, content));
  [-66, 84].forEach((x) => el('rect', { x: x - 6, y: -62, width: 12, height: 260, fill: '#fff', stroke: '#D5DBE5', 'stroke-width': 1.5 }, content));
  [[-66, -56], [-66, 66], [84, -56], [84, 66]].forEach(([x, y]) => el('rect', { x: x - 5, y: y - 5, width: 10, height: 10, fill: '#fff' }, content));
  const labels = g({}, content);
  k.text(30, -56, 'ELM ST', { 'font-size': 8, fill: pal.sub }, labels);
  const lv = k.text(84, -22, 'OAK ST', { 'font-size': 8, fill: pal.sub }, labels);
  lv.setAttribute('transform', 'rotate(-90 84 -22)');
  k.text(-150, 66, 'PARK AVE', { 'font-size': 8, fill: pal.sub }, labels);
  const pins = g({}, content);
  [[-150, 20], [150, 20], [-20, 130], [170, -20], [-130, 120], [10, 20]].forEach(([x, y]) => {
    el('circle', { cx: x, cy: y - 8, r: 7, fill: pal.red }, pins);
    el('path', { d: `M ${x - 5} ${y - 5} L ${x} ${y + 4} L ${x + 5} ${y - 5} Z`, fill: pal.red }, pins);
    el('circle', { cx: x, cy: y - 8, r: 2.5, fill: '#fff' }, pins);
  });
  const here = g({}, content);
  el('circle', { cx: 84, cy: -56, r: 6, fill: pal.blue, stroke: '#fff', 'stroke-width': 2 }, here);

  const dot1 = el('circle', { r: 11, fill: pal.blue, opacity: 0, stroke: pal.blueDark, 'stroke-width': 2 }, screen);
  const dot2 = el('circle', { r: 11, fill: pal.blue, opacity: 0, stroke: pal.blueDark, 'stroke-width': 2 }, screen);
  const b = k.buddy({ x: 140, y: FY, scale: 0.9 });
  const finger = el('line', { stroke: pal.mintDark, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0 });
  const tip = el('circle', { r: 5.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5, opacity: 0 });

  return {
    update(t) {
      const P = seg(t, 0.8, 2.6);
      const e = easeInOut(P);
      const sc = lerp(0.62, 2.5, e);
      const d = lerp(10, 58, e);
      tf(content, 266 - sc * 50, 134 - sc * -56, 0, sc);
      labels.setAttribute('opacity', seg(sc, 1.5, 2.0));
      pins.setAttribute('opacity', 1 - seg(sc, 0.9, 1.4));
      here.setAttribute('transform', `translate(84 -56) scale(${(1 / Math.max(sc, 0.5)).toFixed(3)}) translate(-84 56)`);
      const a = t < 0.8 ? lerp(20, 80, easeInOut(seg(t, 0.2, 0.8))) : t < 2.6 ? 80 + 12 * e : lerp(92, 20, easeInOut(seg(t, 2.6 + 0.3, 2.6 + 0.9)));
      const touching = t >= 0.8 && t < 2.6 + 0.15;
      b.pose({ armR: a, armL: 10, lean: 3, look: 0.6, mood: 'smile', blink: t > 0.1 && t < 0.2 ? 1 : 0 });
      const h = b.handPos('R');
      const f2 = { x: h.x + d * 0.8, y: h.y - d * 0.6 };
      dot1.setAttribute('cx', h.x); dot1.setAttribute('cy', h.y);
      dot2.setAttribute('cx', f2.x); dot2.setAttribute('cy', f2.y);
      dot1.setAttribute('opacity', touching ? 0.45 : 0);
      dot2.setAttribute('opacity', touching ? 0.45 : 0);
      finger.setAttribute('opacity', t >= 0.8 - 0.2 && t < 2.6 + 0.15 ? 1 : 0);
      tip.setAttribute('opacity', t >= 0.8 - 0.2 && t < 2.6 + 0.15 ? 1 : 0);
      k.set(finger, { x1: h.x, y1: h.y, x2: f2.x, y2: f2.y });
      k.set(tip, { cx: f2.x, cy: f2.y });
    }
  };
}
