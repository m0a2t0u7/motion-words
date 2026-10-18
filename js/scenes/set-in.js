// set in：まだ紅葉の時期なのに雪が降り出し、積もって冬が居すわる。まめはマフラーを巻く（例文 Winter set in early this year.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, tree } from './run-after.js';

export const meta = { duration: 4.6, beats: [[0, 'まだ秋'], [1.6, '雪が降り出す'], [3.6, '冬が居すわる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const grey = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#C8D0DC', opacity: 0 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E6DCCB' });
  const snowG = el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#F6F8FB', opacity: 0 });
  const tr = tree(k, 290, FY, 1.15, '#F2A65A', '#E58A3C');
  // カレンダー（10月）
  el('rect', { x: 40, y: 50, width: 52, height: 56, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 40, y: 50, width: 52, height: 15, rx: 4, fill: pal.red });
  k.text(66, 58, 'OCT', { 'font-size': 10, fill: '#fff' }); k.text(66, 86, '20', { 'font-size': 20 });
  const S = 0.86;
  const b = k.buddy({ x: 170, y: FY, scale: S });
  const scarf = g({}); el('rect', { x: -28, y: -40, width: 56, height: 9, rx: 4, fill: pal.red }, scarf); el('rect', { x: 8, y: -34, width: 9, height: 22, rx: 3, fill: pal.red }, scarf);
  b.body.insertBefore(scarf, b.body.children[4]);
  const leaves = Array.from({ length: 6 }, (_, i) => el('ellipse', { rx: 5, ry: 3, fill: i % 2 ? '#F2A65A' : '#E58A3C' }));
  const flakes = Array.from({ length: 26 }, () => el('circle', { r: 3, fill: '#fff' }));
  const cap = el('path', { d: 'M 258 112 Q 290 92 322 112', stroke: '#fff', 'stroke-width': 0, fill: 'none', 'stroke-linecap': 'round' });
  return {
    update(t) {
      const sn = seg(t, 1.2, 2.0), acc = seg(t, 1.8, 4.2);
      grey.setAttribute('opacity', 0.6 * sn);
      snowG.setAttribute('opacity', acc);
      cap.setAttribute('stroke-width', 9 * acc);
      tr.c.forEach((c) => c.setAttribute('fill', acc > 0.5 ? '#B98A62' : c.getAttribute('fill')));
      flakes.forEach((f, i) => {
        const st = 1.2 + (i % 9) * 0.15; const p = ((t - st) * 0.45 + (i * 0.37) % 1) % 1;
        tf(f, (i * 61) % 400 + Math.sin(t * 2 + i) * 8, -10 + p * (FY + 10));
        f.setAttribute('opacity', t > st ? 1 : 0);
      });
      leaves.forEach((l, i) => { const p = seg(t, 1.0 + i * 0.3, 2.6 + i * 0.3); tf(l, 270 + i * 9 + Math.sin(p * 8 + i) * 14, lerp(90 + i * 6, FY - 2, p), p * 300); l.setAttribute('opacity', p > 0 ? 1 : 0); });
      // 震える→マフラーを巻く
      const cold = seg(t, 1.8, 2.2), wrap = easeInOut(seg(t, 2.6, 3.2));
      const shiver = Math.sin(t * 40) * 1.2 * cold * (1 - wrap * 0.7);
      P(b, { x: 170 + shiver, facing: 1, armL: cold ? lerp(8, 150, wrap) * (1 - seg(t, 3.3, 3.6)) + lerp(8, 60, cold) * (1 - wrap) : 8, armR: lerp(8, 60, cold) * (1 - wrap) + lerp(0, 150, wrap) * (1 - seg(t, 3.3, 3.6)), squash: 1 - 0.05 * cold, look: t < 1.6 ? 0 : 0.5, mood: t > 1.8 ? (t > 3.4 ? 'flat' : 'open') : 'smile', blink: blinkAt(t) });
      scarf.setAttribute('opacity', wrap > 0.6 ? 1 : 0);
      tf(scarf, 0, 0, 0, lerp(0.6, 1, seg(wrap, 0.6, 1)), 1);
    }
  };
}
