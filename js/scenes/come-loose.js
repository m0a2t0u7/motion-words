// come loose：機械のカバーを留めたねじが回りながら浮いてきて、カバーががたがた揺れだす（例文 The screw came loose and the part shook.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, 'ねじで固定'], [1.4, 'ねじがゆるむ'], [3.0, '部品が揺れる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: 40, width: 400, height: 8, fill: '#E2DDD4' });
  // 機械（静止）
  el('rect', { x: 150, y: 90, width: 200, height: 150, rx: 8, fill: '#B7C3D3' });
  el('rect', { x: 160, y: 100, width: 60, height: 20, rx: 4, fill: '#8E9BB0' });
  el('circle', { cx: 330, cy: 112, r: 6, fill: pal.green });
  k.shadow(250, 241, 104, 6);
  // カバー（右下のねじ1本がゆるむ。左上を支点に揺れる）
  const C = g({});
  el('rect', { x: 0, y: 0, width: 130, height: 80, rx: 5, fill: '#DCE3EC', stroke: '#9AA8BC', 'stroke-width': 2 }, C);
  [[30, 22], [30, 44], [30, 58]].forEach(([x, y]) => el('rect', { x: x, y, width: 70, height: 5, rx: 2.5, fill: '#B7C3D3' }, C));
  const fixed = [[10, 10], [120, 10], [10, 70]].map(([x, y]) => { const s = g({}, C); tf(s, x, y); el('circle', { r: 5, fill: '#7E8BA0' }, s); el('line', { x1: -3.5, y1: 0, x2: 3.5, y2: 0, stroke: '#4A5568', 'stroke-width': 1.6 }, s); return s; });
  const screw = g({});
  const shaft = el('rect', { x: -2, y: 0, width: 4, height: 0, fill: '#9AA8BC' }, screw);
  const head = g({}, screw);
  el('circle', { r: 6, fill: '#7E8BA0', stroke: '#5A6680', 'stroke-width': 1 }, head);
  const slot = el('line', { x1: -4, y1: 0, x2: 4, y2: 0, stroke: '#3A4152', 'stroke-width': 1.8 }, head);
  const B = k.buddy({ x: 84, y: FY, scale: 0.85 });
  const marks = [0, 1].map((i) => el('path', { d: 'M 0 0 Q 6 6 0 12', stroke: pal.ink, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round' }));
  return {
    update(t) {
      const loose = easeInOut(seg(t, 0.6, 2.2));
      const shake = seg(t, 2.0, 2.4) * (Math.sin(t * 46) * 2.4 + Math.sin(t * 29) * 1.6);
      const ang = shake + 3 * loose;
      tf(C, 200, 140, ang);
      const r = (ang * Math.PI) / 180, lx = 120, ly = 70;
      const sx = 200 + lx * Math.cos(r) - ly * Math.sin(r), sy = 140 + lx * Math.sin(r) + ly * Math.cos(r);
      // ねじは回りながら手前へ出る（上に少しずつ浮いて見える）
      const out = loose * 12;
      tf(screw, sx + out * 0.5, sy - out * 0.2);
      tf(head, 0, 0, loose * 1080);
      k.set(shaft, { x: -2, y: -1, width: out * 0.5 + 1, height: 2, transform: `translate(${-out * 0.5} 0)` });
      const sv = seg(t, 2.2, 2.6);
      marks.forEach((m, i) => { m.setAttribute('opacity', sv > 0 ? 0.6 * (0.5 + 0.5 * Math.sin(t * 20 + i * 3)) : 0); tf(m, 342 + i * 10, 200 + i * 6); });
      B.pose({ look: lerp(0.2, 0.9, seg(t, 1.0, 1.4)), mood: t > 2.2 ? 'open' : t > 1.2 ? 'flat' : 'smile', armR: lerp(8, 60, easeOut(seg(t, 2.4, 2.8))), lean: 4 * seg(t, 2.4, 2.8) });
    }
  };
}
