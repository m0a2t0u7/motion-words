// go with the flow：白紙の地図（計画なし）をしまい、2人は漕がずにボートに寝そべって、川の流れのまま進む（例文 We had no plan, so we just went with the flow.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '計画は白紙'], [1.4, '漕がない'], [3.2, '流れに任せる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 300, mood: 'outdoor' });
  el('rect', { x: 0, y: 150, width: 400, height: 40, fill: '#9ED9B0' });
  [[40, 140], [150, 130], [270, 145], [360, 135]].forEach(([x, y]) => { el('circle', { cx: x, cy: y - 10, r: 22, fill: '#7FD3A0' }); el('rect', { x: x - 3, y: y + 8, width: 6, height: 14, fill: pal.woodDark }); });
  el('rect', { x: 0, y: 186, width: 400, height: 114, fill: '#8FD3F4' });
  const flow = Array.from({ length: 12 }, (_, i) => el('path', { d: 'M 0 0 q 8 -4 16 0 q 8 4 16 0', stroke: '#fff', 'stroke-width': 2.5, fill: 'none', opacity: 0.7 }));
  const boat = g({});
  const A = k.buddy({ x: -20, y: -6, scale: 0.62, parent: boat });
  const C = k.buddy({ x: 22, y: -6, scale: 0.62, color: pal.coral, dark: pal.coralDark, parent: boat });
  el('path', { d: 'M -56 -14 L 56 -14 Q 50 10 30 12 L -30 12 Q -50 10 -56 -14 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, boat);
  el('path', { d: 'M -50 -6 L 50 -6', stroke: pal.yellowDark, 'stroke-width': 2, opacity: 0.6 }, boat);
  const map = g({});
  el('rect', { x: -14, y: -11, width: 28, height: 22, rx: 2, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, map);
  k.text(0, 1, '?', { 'font-size': 15, fill: pal.sub }, map);
  const ripple = el('path', { d: '', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.8 });
  return {
    update(t) {
      // 流れの線は右へ流れる
      flow.forEach((f, i) => { const x = ((i * 67 + t * 40) % 440) - 40, y = 204 + (i % 4) * 22; tf(f, x, y); });
      const bx = lerp(80, 300, seg(t, 0, 4.4)), by = 214 + 2 * Math.sin(t * 2.4);
      tf(boat, bx, by, 1.5 * Math.sin(t * 2.1));
      k.set(ripple, { d: `M ${bx - 70} ${by + 12} q 10 4 20 0 M ${bx + 54} ${by + 12} q 10 4 20 0` });
      // 地図を見て肩をすくめる→しまう→寝そべる
      const look = t < 1.3;
      const relax = easeInOut(seg(t, 1.6, 2.4));
      const shrug = hump(seg(t, 0.9, 1.5));
      P(A, { x: -20, y: -6, look: 0.3, mood: look ? 'flat' : 'grin', armR: look ? 70 : lerp(8, 170, relax), armL: lerp(8 + 120 * shrug, 170, relax), lean: lerp(0, -14, relax), blink: t > 3.4 && t < 3.5 ? 1 : 0 });
      P(C, { x: 22, y: -6, facing: -1, look: 0.4, mood: look ? 'flat' : 'grin', armR: 8 + 120 * shrug, armL: 8 + 120 * shrug, lean: lerp(0, -14, easeInOut(seg(t, 1.8, 2.6))) });
      if (t > 1.8) C.pose({ armR: lerp(8, 170, easeInOut(seg(t, 1.8, 2.6))), armL: lerp(8, 170, easeInOut(seg(t, 1.8, 2.6))) });
      const put = easeInOut(seg(t, 1.3, 1.7));
      tf(map, bx + lerp(4, 40, put), by - lerp(84, 4, put), 0, lerp(1, 0.5, put));
      map.setAttribute('opacity', 1 - seg(t, 1.6, 1.75));
    }
  };
}
