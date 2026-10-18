// earn：彼女がパソコンで働くと、コインが次々に飛び出して瓶にたまっていく（例文 She earns a good salary.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';
import { frontL } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, '仕事を始める'], [1.8, 'コインがたまる'], [4.0, 'たくさん稼いだ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // オフィスの壁
  el('rect', { x: 40, y: 40, width: 84, height: 64, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 82, y1: 40, x2: 82, y2: 104, stroke: '#fff', 'stroke-width': 4 });
  el('rect', { x: 250, y: 56, width: 56, height: 40, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  [[258, 82, 8, '#6AA8F7'], [272, 72, 8, '#5FCDB8'], [286, 64, 8, '#FFCF5C']].forEach(([x, y, w, c]) => el('rect', { x, y, width: w, height: 90 - y, rx: 2, fill: c }));
  // 机の天板とノートPC（人物より奥）
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  const lap = g({});
  el('rect', { x: 182, y: 192, width: 66, height: 8, rx: 3, fill: '#C9D3DF' }, lap);
  el('rect', { x: 188, y: 189, width: 52, height: 4, rx: 2, fill: '#E3E8EE' }, lap);
  el('path', { d: 'M 242 192 L 252 148 L 259 150 L 250 194 Z', fill: '#8F9BAB' }, lap);
  el('path', { d: 'M 245 190 L 253 152 L 256 153 L 248 191 Z', fill: '#2A3242' }, lap);
  const S = 1.0;
  const me = k.buddy({ x: 136, y: FY, scale: S, color: pal.coral, dark: pal.coralDark });
  const L = frontL(me, S);
  // 机の前面
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  // 瓶
  const JX = 320;
  const jarBack = g({});
  el('rect', { x: JX - 18, y: 150, width: 36, height: 52, rx: 8, fill: '#DDEFFA', opacity: 0.55 }, jarBack);
  const coins = [];
  const N = 6;
  for (let i = 0; i < N; i++) {
    const c = g({});
    el('ellipse', { rx: 8, ry: 3.4, fill: pal.yellowDark }, c);
    el('ellipse', { cy: -2, rx: 8, ry: 3.4, fill: pal.yellow }, c);
    el('ellipse', { cy: -2, rx: 4.2, ry: 1.6, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 1 }, c);
    coins.push(c);
  }
  const jarFront = g({});
  el('rect', { x: JX - 18, y: 150, width: 36, height: 52, rx: 8, fill: 'none', stroke: '#9CC3DC', 'stroke-width': 3 }, jarFront);
  el('rect', { x: JX - 21, y: 144, width: 42, height: 8, rx: 4, fill: pal.woodDark }, jarFront);
  el('rect', { x: JX - 12, y: 156, width: 4, height: 30, rx: 2, fill: '#fff', opacity: 0.6 }, jarFront);
  k.shadow(JX, 202, 22, 4);
  const hand = el('circle', { r: 0.1 });
  const T0 = 0.8, DT = 0.62;
  const rest = (i) => ({ x: JX + (i % 2 ? 3 : -3), y: 196 - 5 * i });

  return {
    update(t) {
      const typing = t < 3.9 ? 1 : 0, cheer = easeOut(seg(t, 3.9, 4.5));
      const w = Math.sin(t * 17);
      me.pose({ armR: lerp(60 + 7 * w * typing, 165, cheer), armL: 8, lean: 4 * (1 - cheer), look: 0.6, mood: cheer > 0.2 ? 'grin' : 'smile', squash: 1 + 0.04 * hump(seg(t, 3.9, 4.6)), lift: 3 * hump(seg(t, 3.9, 4.4)) });
      L.set(lerp(58 - 7 * w * typing, 165, cheer));
      coins.forEach((c, i) => {
        const t0 = T0 + DT * i;
        const p = seg(t, t0, t0 + 0.5), q = seg(t, t0 + 0.5, t0 + 0.75);
        if (t < t0) { c.setAttribute('opacity', 0); return; }
        c.setAttribute('opacity', 1);
        const r = rest(i);
        let x = lerp(254, JX, easeInOut(p)), y = lerp(150, 140, p) - 44 * hump(p);
        if (q > 0) { x = lerp(JX, r.x, q); y = lerp(140, r.y, easeIn(q)); }
        const sc = 1 + 0.25 * hump(p);
        tf(c, x, y, p < 1 ? (p * 260) % 360 * 0 : 0, sc, sc);
      });
    }
  };
}
