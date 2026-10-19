// boot：玄関先でブーツに足を入れて引き上げ、雪の中へ歩いて出ていく（例文 He put on his boots and went out in the snow.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { wardrobe, gait, reach, P, blinkAt } from './skirt.js';

export const meta = { duration: 4.4, beats: [[0, 'ブーツをはく'], [1.6, '引き上げる'], [2.6, '雪の中へ']] };

const BC = '#8A5A3C', BD = '#6B4329';
function bootProp(k) {
  const g = k.g({});
  k.shadow(4, 23, 14, 3, g);
  k.el('path', { d: 'M -8 -2 L 6 -2 L 6 11 Q 15 13 15 19 Q 15 23 11 23 L -8 23 Q -10 23 -10 18 Z', fill: BC }, g);
  k.el('rect', { x: -9, y: -3, width: 16, height: 4, rx: 2, fill: BD }, g);
  return g;
}

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.3;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#DCE6F0', opacity: 0.6 });
  // 家の壁とドア（左）
  el('rect', { x: 0, y: 40, width: 150, height: FY - 40, fill: '#F3E6DC' });
  el('rect', { x: 30, y: 100, width: 70, height: FY - 100, rx: 3, fill: pal.blue });
  el('circle', { cx: 90, cy: 172, r: 4, fill: pal.yellow });
  el('rect', { x: 0, y: 34, width: 160, height: 10, rx: 3, fill: pal.coralDark });
  // 玄関の床（木）と雪原
  el('rect', { x: 0, y: FY, width: 180, height: 64, fill: pal.wood });
  el('rect', { x: 0, y: FY, width: 180, height: 3, fill: pal.woodDark });
  el('path', { d: `M 170 ${FY - 4} Q 280 ${FY - 14} 400 ${FY - 6} L 400 300 L 170 300 Z`, fill: '#fff' });
  el('ellipse', { cx: 330, cy: FY + 30, rx: 80, ry: 10, fill: '#EAF3FB' });
  [[250, 1], [360, 1.3]].forEach(([x, s]) => {
    const tr = g({ transform: `translate(${x} ${FY - 6}) scale(${s * 0.55})` });
    el('rect', { x: -5, y: -14, width: 10, height: 18, rx: 3, fill: pal.woodDark }, tr);
    el('path', { d: 'M 0 -110 L 34 -52 L -34 -52 Z M 0 -78 L 44 -14 L -44 -14 Z', fill: pal.green, stroke: pal.green, 'stroke-width': 6, 'stroke-linejoin': 'round' }, tr);
    el('path', { d: 'M 0 -110 L 14 -86 Q 0 -80 -14 -86 Z M -30 -52 L 30 -52 L 20 -44 L -20 -44 Z', fill: '#fff' }, tr);
  });
  const prints = Array.from({ length: 7 }, () => el('ellipse', { rx: 7, ry: 2.6, fill: '#C9D8E8' }));
  const X1 = 130;
  const props = [-12, 12].map((dx) => { const p = bootProp(k); tf(p, X1 + dx * S, FY - 18 * S, 0, S); return p; });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: pal.coral, dark: pal.coralDark, sleeve: 'long', to: -16 });
  W.bottom({ kind: 'trousers', color: '#596377', dark: '#444D5F', from: -16 });
  const worn = W.feet('boot', BC, BD);
  const sock = W.legs.map((l) => el('ellipse', { cx: 3, cy: 18, rx: 9, ry: 4, fill: '#fff' }, l));
  const snow = Array.from({ length: 22 }, (_, i) => ({ n: el('circle', { r: 2 + (i % 3) * 0.7, fill: '#fff', stroke: '#C9D8E8', 'stroke-width': 1 }), i }));
  const xf = (t) => t < 2.4 ? lerp(70, X1, easeInOut(seg(t, 0.1, 1.0))) : lerp(X1, 330, easeInOut(seg(t, 2.5, 4.2)));
  return {
    update(t) {
      const on = t > 1.0;
      props.forEach((p) => p.setAttribute('display', on ? 'none' : 'inline'));
      worn.forEach((w) => w.setAttribute('display', on ? 'inline' : 'none'));
      sock.forEach((s) => s.setAttribute('display', on ? 'none' : 'inline'));
      const p = gait(xf, t, 70);
      const tug = easeInOut(seg(t, 1.15, 1.5)) * (1 - easeInOut(seg(t, 2.1, 2.45)));
      const pull = hump(seg(t, 1.5, 1.8)) + hump(seg(t, 1.8, 2.1));
      P(b, { x: p.x, walk: p.walk, lean: p.lean + 30 * tug, squash: 1 - 0.04 * pull + 0.03 * wobble(seg(t, 2.1, 2.6), 2, 5),
        armL: p.armL, armR: p.armR, look: 0.5, mood: t > 2.5 ? 'grin' : 'smile', blink: blinkAt(t) });
      if (tug > 0.01) {
        const ty = FY - 24 * S - 5 * pull;
        b.pose({ armR: lerp(p.armR, reach(b, S, 'R', p.x + 14 * S, ty), tug), armL: lerp(p.armL, reach(b, S, 'L', p.x - 10 * S, ty), tug) });
      }
      // 雪の上の足あと（通ったところに残る）
      prints.forEach((n, i) => {
        const x = 196 + i * 20;
        n.setAttribute('cx', x); n.setAttribute('cy', FY + 6 + (i % 2) * 6);
        n.setAttribute('opacity', p.x > x + 14 ? 0.9 : 0);
      });
      snow.forEach(({ n, i }) => {
        const sp = 22 + (i % 5) * 7, yy = ((t * sp + i * 47) % 280) - 10, xx = 160 + ((i * 53) % 240) + Math.sin(t * 1.3 + i) * 8;
        k.set(n, { cx: xx, cy: yy, opacity: yy > FY + 30 ? 0 : 0.95 });
      });
    }
  };
}
