// book：電車の中で立って本を読み、ページをめくる（例文 I read a book on the train every day.）
import { seg, lerp, easeInOut, hump } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach, faceAt } from './look-over.js';

export const meta = { duration: 4.0, beats: [[0, '本を開く'], [1.2, '読む'], [2.8, 'ページをめくる']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.15;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 20, y: 44, width: 360, height: 90, rx: 8, fill: '#DDEFFA' });
  const sc = g({});
  sc.setAttribute('clip-path', k.clip((c) => el('rect', { x: 20, y: 44, width: 360, height: 90, rx: 8 }, c)));
  const mv = g({}, sc);
  for (let i = 0; i < 7; i++) {
    const x = i * 90;
    el('path', { d: `M ${x} 134 Q ${x + 45} 84 ${x + 90} 134 Z`, fill: '#BFE3C6' }, mv);
    el('rect', { x: x + 20, y: 98, width: 26, height: 36, fill: i % 2 ? pal.coral : pal.yellow }, mv);
    el('path', { d: `M ${x + 16} 98 L ${x + 33} 82 L ${x + 50} 98 Z`, fill: pal.coralDark }, mv);
  }
  [110, 200, 290].forEach((x) => el('rect', { x: x - 3, y: 44, width: 6, height: 90, fill: '#fff' }));
  el('rect', { x: 20, y: 44, width: 360, height: 90, rx: 8, fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 300, y: 160, width: 100, height: 14, rx: 6, fill: pal.violet });
  el('rect', { x: 300, y: 174, width: 100, height: 30, fill: '#8C70DD' });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  k.shadow(150, FY, 30, 5);
  // 本（原点＝開いた本の下中央）
  const bk = g({});
  el('rect', { x: -30, y: -44, width: 60, height: 46, rx: 4, fill: pal.blueDark }, bk);
  el('rect', { x: -27, y: -42, width: 26, height: 40, fill: '#fff' }, bk);
  el('rect', { x: 1, y: -42, width: 26, height: 40, fill: '#fff' }, bk);
  for (let i = 0; i < 4; i++) {
    el('line', { x1: -23, x2: -5, y1: -34 + i * 8, y2: -34 + i * 8, stroke: '#9AA6B8', 'stroke-width': 2 }, bk);
    el('line', { x1: 5, x2: 23, y1: -34 + i * 8, y2: -34 + i * 8, stroke: '#9AA6B8', 'stroke-width': 2 }, bk);
  }
  const pg = g({}, bk);
  el('rect', { x: 0, y: -42, width: 27, height: 40, fill: '#fff', stroke: '#E1E6EE' }, pg);
  for (let i = 0; i < 4; i++) el('line', { x1: 5, x2: 22, y1: -34 + i * 8, y2: -34 + i * 8, stroke: '#9AA6B8', 'stroke-width': 2 }, pg);
  return {
    update(t) {
      const open = easeInOut(seg(t, 0, 0.8)), sway = Math.sin(t * 5) * 0.8;
      const rd = seg(t, 1.0, 2.7);
      mv.setAttribute('transform', `translate(${-((t * 80) % 90)} 0)`);
      const o = { lean: 3 + sway, armL: 10, look: 0.6, blink: blinkAt(t), mood: 'smile' };
      P(b, o);
      const a = reach(b, S, 'R', 150 + 40 * S, FY - 40 * S);
      P(b, { ...o, armR: lerp(20, a, open) });
      const h = hp(b, S, 'R');
      faceAt(b, 4 + Math.sin(rd * 9) * 1.5 * hump(rd), 6);
      tf(bk, h.x + 2, h.y + 4, 0, 0.3 + 0.7 * open, 0.3 + 0.7 * open);
      const f = seg(t, 2.8, 3.5), ang = f * Math.PI;
      tf(pg, 0, 0, 0, f < 1 ? Math.cos(ang) : -1, 1);
      pg.setAttribute('opacity', f > 0 ? 1 : 0);
    }
  };
}
