// sweep up：庭に散らばった落ち葉を、ほうきで一か所へ掃き集める（例文 He swept up the leaves in the yard.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '散らばった葉'], [1.8, '掃き寄せる'], [3.9, '山になった']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E4EFD6' });
  el('rect', { x: 0, y: FY, width: 400, height: 2, fill: '#CFE0BC' });
  // 柵
  for (let x = -6; x < 400; x += 26) {
    el('path', { d: `M ${x} 236 L ${x} 128 L ${x + 11} 118 L ${x + 22} 128 L ${x + 22} 236 Z`, fill: '#F0E2C8', stroke: '#DCC9A6', 'stroke-width': 1.5 });
  }
  el('rect', { x: 0, y: 150, width: 400, height: 8, fill: '#DCC9A6' });
  el('rect', { x: 0, y: 206, width: 400, height: 8, fill: '#DCC9A6' });
  // 木
  el('rect', { x: 26, y: 118, width: 16, height: 118, rx: 5, fill: pal.woodDark });
  el('circle', { cx: 34, cy: 96, r: 44, fill: '#F2B65C' });
  el('circle', { cx: 10, cy: 112, r: 28, fill: '#E9A04A' });
  el('circle', { cx: 62, cy: 108, r: 26, fill: '#F7C873' });
  k.shadow(34, 238, 34, 5);
  // 葉
  const cols = [pal.red, pal.yellowDark, '#F2994A', pal.coralDark, pal.yellow];
  const L = [[122, 254], [150, 262], [172, 252], [194, 265], [214, 256], [238, 262], [256, 252], [274, 264], [290, 257], [136, 268], [226, 270]].map(([x, y], i) => {
    const n = g({});
    el('path', { d: 'M -8 0 Q 0 -8 8 0 Q 0 8 -8 0 Z', fill: cols[i % cols.length] }, n);
    el('line', { x1: -8, y1: 0, x2: 7, y2: 0, stroke: 'rgba(0,0,0,.18)', 'stroke-width': 1 }, n);
    return { n, x, y, r0: (i * 53) % 90 - 45 };
  });
  const b = k.buddy({ x: 40, y: FY, scale: 0.85 });
  const broom = g({});
  const handle = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, broom);
  const head = g({}, broom);
  el('path', { d: 'M -6 0 L 6 0 L 14 17 L -14 17 Z', fill: pal.yellowDark }, head);
  [-8, -3, 2, 7].forEach((x) => el('line', { x1: x * 0.6, y1: 3, x2: x * 1.4, y2: 17, stroke: '#B88A1E', 'stroke-width': 1.3 }, head));
  el('rect', { x: -7, y: -2, width: 14, height: 4, rx: 2, fill: pal.red }, head);
  const PILE = 292;
  const bxAt = (t) => lerp(40, 222, easeInOut(seg(t, 0.5, 3.5)));
  return {
    update(t) {
      const bx = bxAt(t);
      const walking = t > 0.5 && t < 3.5;
      const arm = lerp(12, 62, easeOut(seg(t, 0.1, 0.5))) - 12 * easeInOut(seg(t, 3.7, 4.2));
      b.pose({ x: bx, armR: arm, armL: walking ? Math.sin(t * 9) * 14 : 8, walk: walking ? t * 9 : 0, lean: walking ? 7 : 0, mood: t > 3.8 ? 'grin' : 'smile', look: 0.5 });
      const h = hand(b);
      const sw = walking ? Math.sin(t * 13) * 5 : 0;
      const lift = easeInOut(seg(t, 3.6, 4.1));
      const hx = lerp(h.x + 26 + sw, h.x + 6, lift), hy = lerp(253, h.y + 34, lift);
      handle.setAttribute('x1', h.x); handle.setAttribute('y1', h.y);
      handle.setAttribute('x2', hx); handle.setAttribute('y2', hy);
      tf(head, hx, hy, lerp(-14 + sw, 0, lift), 1, 1);
      // 掃き寄せられる葉：ほうきの前に押され、山の位置で止まる
      const front = Math.min(bx + 70, 3 + bxAt(3.5) + 70);
      L.forEach((l, i) => {
        const pileX = PILE + ((i * 7) % 20);
        const x = Math.min(Math.max(l.x, front + ((i * 5) % 16)), pileX);
        const moved = x - l.x;
        const stackY = moved > 0 ? -((i * 5) % 12) - 2 : 0;
        const y = l.y + stackY * easeOut(seg(x, 240, 292)) - Math.abs(Math.sin(moved * 0.12)) * 3 * (moved > 0 && front < 289 ? 1 : 0);
        tf(l.n, x, y, l.r0 + moved * 1.6, 1, 0.8 + 0.2 * Math.cos(moved * 0.1));
      });
    }
  };
}
