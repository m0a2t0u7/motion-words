// turn up：音が小さくて聞こえにくい→ラジオのつまみを回す→音量が上がる（例文 Can you turn up the volume?）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '音が小さい'], [1.3, 'つまみを回す'], [2.9, '大きくなった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 50, width: 80, height: 58, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 80, y1: 50, x2: 80, y2: 108, stroke: '#fff', 'stroke-width': 4 });
  // 机とラジオ
  el('rect', { x: 246, y: 210, width: 154, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: 256, y: 219, width: 8, height: 17, fill: pal.woodDark });
  el('rect', { x: 384, y: 219, width: 8, height: 17, fill: pal.woodDark });
  k.shadow(320, 237, 80, 5);
  el('line', { x1: 356, y1: 150, x2: 384, y2: 104, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' });
  el('rect', { x: 268, y: 148, width: 108, height: 62, rx: 12, fill: pal.violet });
  el('rect', { x: 268, y: 148, width: 108, height: 10, rx: 5, fill: '#fff', opacity: 0.25 });
  const spk = g({});
  tf(spk, 344, 182);
  el('circle', { r: 22, fill: '#6F5BD0' }, spk);
  const cone = g({}, spk);
  el('circle', { r: 17, fill: '#4B3BA0' }, cone);
  el('circle', { r: 8, fill: '#8C7BE8' }, cone);
  el('circle', { r: 3, fill: '#4B3BA0' }, cone);
  const knob = g({});
  tf(knob, 288, 182);
  el('circle', { r: 12, fill: '#E9EEF5', stroke: '#B8C2D0', 'stroke-width': 2.5 }, knob);
  const ind = el('line', { x1: 0, y1: 0, x2: 0, y2: -9, stroke: pal.red, 'stroke-width': 3, 'stroke-linecap': 'round' }, knob);
  // 音量ランプ
  const bars = [0, 1, 2, 3, 4].map((i) => el('rect', { x: 292 + i * 8, y: 162 - i * 3, width: 5, height: 8 + i * 3, rx: 1.5, fill: '#fff', opacity: 0.35 }));
  // 音波
  const waves = [0, 1, 2].map(() => el('path', { d: 'M 0 -14 Q 10 0 0 14', fill: 'none', stroke: pal.violet, 'stroke-linecap': 'round' }));
  const note = () => { const n = g({}); el('ellipse', { cx: 0, cy: 0, rx: 4.5, ry: 3.4, fill: pal.violet, transform: 'rotate(-20)' }, n); el('line', { x1: 3.8, y1: -1, x2: 3.8, y2: -13, stroke: pal.violet, 'stroke-width': 2 }, n); el('path', { d: 'M 3.8 -13 Q 10 -10 8 -5', fill: 'none', stroke: pal.violet, 'stroke-width': 2 }, n); return n; };
  const notes = [note(), note(), note()];
  const b = k.buddy({ x: 238, y: FY, scale: 0.85 });
  const hear = k.text(0, 0, '?', { 'font-size': 24, fill: pal.sub });

  return {
    update(t) {
      const prog = easeInOut(seg(t, 0.95, 2.4));
      const vol = 0.12 + 0.88 * prog;
      const reach = easeOut(seg(t, 0.2, 0.75)), back = easeInOut(seg(t, 2.55, 3.1));
      const arm = lerp(lerp(12, 100, reach), 18, back) + (t > 0.95 && t < 2.4 ? 4 * Math.sin(t * 9) : 0);
      b.pose({ x: 238, armR: arm, armL: 8, lean: lerp(7, 0, easeInOut(seg(t, 2.4, 3.0))) * (1 - 0.3 * reach), mood: t < 1.0 ? 'sad' : t < 2.6 ? 'flat' : 'grin', look: 0.8 });
      tf(knob, 288, 182, -80 + 150 * prog);
      // 音量ランプ
      bars.forEach((r, i) => {
        const on = vol * 5 > i + 0.2;
        r.setAttribute('fill', on ? (i > 2 ? pal.yellow : pal.green) : '#fff');
        r.setAttribute('opacity', on ? 1 : 0.35);
      });
      // スピーカーの振動と音波
      const pulse = 1 + vol * 0.1 * Math.sin(t * 34);
      tf(cone, 0, 0, 0, pulse);
      waves.forEach((w, i) => {
        const u = (t * (1.2 + vol) + i / 3) % 1;
        tf(w, 372 + 4 + 42 * vol * u, 182, 0, 0.5 + 1.1 * vol * (0.5 + u * 0.5));
        w.setAttribute('stroke-width', 1.5 + 2.5 * vol);
        w.setAttribute('opacity', hump(u) * (0.15 + 0.85 * vol));
      });
      notes.forEach((n, i) => {
        const u = (t * 0.7 + i / 3) % 1;
        const show = vol > 0.3 + i * 0.22 ? 1 : 0;
        tf(n, 330 + i * 18 + Math.sin(u * 6 + i) * 5, 140 - 36 * u, 0, 0.7 + 0.5 * vol);
        n.setAttribute('opacity', hump(u) * show);
      });
      tf(hear, 252, 150 - 3 * Math.sin(t * 6));
      hear.setAttribute('opacity', t < 1.0 ? 0.7 + 0.3 * Math.sin(t * 8) : 0);
    }
  };
}
