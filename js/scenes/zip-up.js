// zip up：寒い中、ジャケットのファスナーを下から首元まで引き上げる（例文 Zip up your jacket. It's cold.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '寒くて震える'], [1.5, 'ファスナーを上げる'], [3.2, '首元まで閉まる']] };

// 体の上にかぶせる上着（zip-up / button-up で共有）。yc：閉じている上端、hand：手の位置（体の座標）
export function jacket(k, b, col, dark, buttons = null) {
  const { el, g, pal } = k;
  const face = b.body.children[3];
  const grp = g({}, b.body);
  b.body.insertBefore(grp, face);
  grp.setAttribute('clip-path', k.clip((cp) => el('rect', { x: -30, y: -80, width: 60, height: 80, rx: 28 }, cp)));
  const inner = el('polygon', { fill: '#F4F1EA' }, grp);
  const L = el('polygon', { fill: col }, grp), R = el('polygon', { fill: col }, grp);
  const seam = el('line', { stroke: dark, 'stroke-width': 2 }, grp);
  const pull = el('rect', { width: 5, height: 9, rx: 2, fill: pal.white, stroke: dark, 'stroke-width': 1.5 }, grp);
  const btn = buttons ? buttons.map(() => el('circle', { r: 3.2, fill: pal.white, stroke: dark, 'stroke-width': 1.5 }, grp)) : [];
  const collar = el('path', { fill: dark, opacity: 0.55 }, grp);
  b.armR.a.setAttribute('display', 'none');
  const arm = el('path', { fill: 'none', stroke: b.armR.hand.getAttribute('stroke'), 'stroke-width': 9, 'stroke-linecap': 'round' }, b.body);
  const hand = el('circle', { r: 6.5, fill: b.armR.hand.getAttribute('fill'), stroke: b.armR.hand.getAttribute('stroke'), 'stroke-width': 2.5 }, b.body);
  return {
    draw(yc, hx, hy, open = 9) {
      const T = -38;
      const v = (a) => a.map((p) => p.join(',')).join(' ');
      k.set(inner, { points: v([[-open, T], [open, T], [0, yc]]) });
      k.set(L, { points: v([[-32, T], [-open, T], [0, yc], [0, 4], [-32, 4]]) });
      k.set(R, { points: v([[32, T], [open, T], [0, yc], [0, 4], [32, 4]]) });
      k.set(seam, { x1: 0, y1: yc, x2: 0, y2: 4 });
      k.set(collar, { d: `M ${-open - 2} ${T - 3} L ${-open + 4} ${T + 4} L ${-open + 7} ${T - 3} Z M ${open + 2} ${T - 3} L ${open - 4} ${T + 4} L ${open - 7} ${T - 3} Z` });
      if (!buttons) { k.set(pull, { x: -2.5, y: yc - 1 }); pull.setAttribute('opacity', yc < 2 ? 1 : 0); }
      else pull.setAttribute('opacity', 0);
      const ex = 40, ey = (-46 + hy) / 2 + 4;
      k.set(arm, { d: `M 27 -46 Q ${ex} ${ey} ${hx} ${hy}` });
      k.set(hand, { cx: hx, cy: hy });
      return btn;
    }
  };
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 256 });
  // 雪（静止の地面＋降る雪は t から決める）
  el('ellipse', { cx: 60, cy: 262, rx: 90, ry: 10, fill: '#fff' });
  el('ellipse', { cx: 360, cy: 268, rx: 100, ry: 12, fill: '#fff' });
  const S = 1.6;
  const b = k.buddy({ x: 200, y: FY, scale: S });
  const j = jacket(k, b, pal.yellow, pal.yellowDark);
  const flakes = Array.from({ length: 16 }, (_, i) => el('circle', { r: 2 + (i % 3), fill: '#fff', stroke: '#CFE3F2', 'stroke-width': 1 }));
  const puff = el('circle', { r: 6, fill: '#fff', stroke: '#D5E3EE', 'stroke-width': 1.5 });
  return {
    update(t) {
      flakes.forEach((f, i) => {
        const y = (t * (24 + (i % 4) * 7) + i * 41) % 270 - 10;
        k.set(f, { cx: (i * 67) % 400 + Math.sin(t * 2 + i) * 8, cy: y });
      });
      const cold = 1 - easeInOut(seg(t, 2.6, 3.2));
      const sh = Math.sin(t * 46) * 1.6 * cold;
      const rest = { x: 33, y: -20 };
      const reach = easeOut(seg(t, 0.9, 1.3)) * (1 - easeInOut(seg(t, 2.8, 3.4)));
      const yc = lerp(-2, -38, easeInOut(seg(t, 1.4, 2.7)));
      const hx = lerp(rest.x, 4, reach), hy = lerp(rest.y, yc + 5, reach);
      b.pose({ x: 200 + sh, squash: 0.96 + 0.04 * (1 - cold), lean: 3 * cold, armL: 22, look: 0.5, mood: cold > 0.5 ? 'sad' : 'smile', blink: 0 });
      j.draw(yc, hx, hy);
      // 白い息
      const pf = seg(t, 0.2, 1.0);
      k.set(puff, { cx: 200 + 40 * S/1.35 + 22 * pf, cy: FY - 84 * S / 1.35 - 10 * pf, r: 5 + 8 * pf });
      puff.setAttribute('opacity', pf > 0 && pf < 1 ? 0.9 * (1 - pf) : 0);
    }
  };
}
