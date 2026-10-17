// keep up：相手の歩く速さについていこうと必死だが、離れていく（例文 I can't keep up with you. You walk too fast.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '並んで歩く'], [1.3, '相手が速い'], [3.0, '追いつけない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  const ticks = [];
  for (let i = 0; i < 8; i++) ticks.push(el('rect', { x: 0, y: FY + 18, width: 24, height: 5, rx: 2, fill: '#DDE3EA' }));
  const you = k.buddy({ x: 190, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  const me = k.buddy({ x: 110, y: FY, scale: 0.9 });
  const sweat = el('path', { d: 'M 0 -8 Q 5 0 0 5 Q -5 0 0 -8', fill: pal.water });
  const sp = g({});
  el('path', { d: 'M -34 -12 L 34 -12 Q 42 -12 42 -20 L 42 -34 Q 42 -42 34 -42 L -34 -42 Q -42 -42 -42 -34 L -42 -20 Q -42 -12 -34 -12 Z M -14 -12 L -22 -2 L -24 -12', fill: '#fff', stroke: '#CBD3DE', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, sp);
  k.text(0, -27, '!?', { 'font-size': 20, fill: pal.red }, sp);
  const dust = g({});
  [0, 1, 2].forEach((i) => el('circle', { cx: -i * 9, cy: -i * 2, r: 4 + i, fill: '#fff', opacity: 0.8 }, dust));
  return {
    update(t) {
      const speedUp = easeInOut(seg(t, 1.0, 2.0));
      // 背景を流す（歩く速さ）
      const v = 70 + 150 * speedUp;
      const off = (t < 1.0 ? t * 70 : t < 2.0 ? 70 + (t - 1.0) * 70 + 75 * (t - 1.0) ** 2 : 70 + 70 + 75 + (t - 2.0) * 220);
      ticks.forEach((tk, i) => tk.setAttribute('x', ((i * 60 - off) % 480 + 480) % 480 - 40));
      const gap = 80 + 150 * easeInOut(seg(t, 1.3, 3.6));
      const s = 0.9 + 0.2 * speedUp;
      const wy = you.state;
      const phY = t * (9 + 5 * speedUp), phM = t * (9 + 6 * speedUp);
      you.pose({ x: 110 + gap, walk: phY, armL: 8 + Math.sin(phY) * 26, armR: 8 - Math.sin(phY) * 26, lean: 6 + 6 * speedUp, mood: 'smile', look: 1 });
      const tired = seg(t, 1.6, 2.6);
      me.pose({ x: 110, walk: phM, armL: 8 + Math.sin(phM) * 30, armR: 8 - Math.sin(phM) * 30, lean: 8 + 8 * tired, mood: tired > 0.4 ? 'sad' : 'smile', look: 1 });
      tf(sweat, 92, FY - 90 + ((t * 40) % 26) * tired, 0, tired, tired);
      sweat.setAttribute('opacity', tired > 0.2 ? 0.9 : 0);
      const q = seg(t, 2.6, 2.9);
      tf(sp, 120, FY - 100, 0, q, q);
      tf(dust, 70, FY - 6, 0, 1, 1);
      dust.setAttribute('opacity', tired * (Math.sin(t * 14) > 0 ? 1 : 0.4));
    }
  };
}
