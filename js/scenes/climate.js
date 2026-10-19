// climate：この土地の1年の気温グラフ。1月から12月まで、どの月も暖かい。ヤシの木の下で半そでのまめ（例文 This area has a warm climate.）
import { seg, lerp, easeInOut, easeOut, clamp } from '../ease.js';
import { scene, sunG, P, blinkAt, point } from './nature.js';

export function palm(k, parent, s = 1) {
  const g = k.g({}, parent);
  k.shadow(0, 0, 26 * s, 4, g);
  k.el('path', { d: `M ${-5 * s} 0 Q ${-2 * s} ${-50 * s} ${10 * s} ${-100 * s} L ${18 * s} ${-98 * s} Q ${6 * s} ${-50 * s} ${5 * s} 0 Z`, fill: '#C79A68' }, g);
  const top = k.g({}, g); k.tf(top, 14 * s, -100 * s);
  [-150, -100, -40, 10, 60].forEach((a) => k.el('path', { d: `M 0 0 Q ${30 * s} ${-14 * s} ${52 * s} ${6 * s} Q ${28 * s} ${-2 * s} 0 0 Z`, fill: '#5DB36F', transform: `rotate(${a})` }, top));
  return { g, top };
}

export const meta = { duration: 4.4, beats: [[0, '1月も暖かい'], [1.2, '1年じゅう暖かい'], [3.4, '暖かい気候']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const { FY } = scene(k, { FY: 240, top: '#8FD0F5', bot: '#FFF3DC', ground: '#F3DFB5', edge: '#E3CB9A' });
  el('rect', { x: 0, y: 200, width: 400, height: 40, fill: '#7FD0EE' });
  el('path', { d: 'M 0 210 q 25 -6 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0', stroke: '#fff', 'stroke-width': 2, fill: 'none', opacity: 0.6 });
  const sun = sunG(k, 18); tf(sun.g, 360, 40);
  const pm = palm(k, undefined, 1.1); tf(pm.g, 360, FY + 4);
  // 気温グラフのボード
  const BX = 130, BY = 40, BW = 200, BH = 130;
  el('rect', { x: BX + 96, y: BY + BH, width: 8, height: FY - BY - BH, fill: pal.woodDark });
  el('rect', { x: BX, y: BY, width: BW, height: BH, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  const base = BY + BH - 22;
  el('line', { x1: BX + 12, y1: base, x2: BX + BW - 10, y2: base, stroke: pal.sub, 'stroke-width': 2 });
  const H = [62, 64, 70, 76, 82, 88, 92, 92, 86, 78, 70, 64];
  const bars = H.map((h, i) => {
    const x = BX + 18 + i * 14.5;
    if (i === 0 || i === 5 || i === 11) k.text(x + 5, base + 11, String(i + 1), { 'font-size': 9, fill: pal.sub });
    return { n: el('rect', { x, y: base, width: 10, height: 0, rx: 2, fill: i > 3 && i < 9 ? '#FF8A5C' : '#FFAA66' }), h, x };
  });
  el('line', { x1: BX + 14, y1: base - 50, x2: BX + BW - 12, y2: base - 50, stroke: '#FF8A5C', 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
  const b = k.buddy({ x: 80, y: FY, scale: S });
  // サングラス（最後にかける）
  const gl = g({}, b.body.children[3]);
  el('rect', { x: -17, y: -59, width: 14, height: 9, rx: 4, fill: pal.ink }, gl); el('rect', { x: 3, y: -59, width: 14, height: 9, rx: 4, fill: pal.ink }, gl);
  el('line', { x1: -3, y1: -55, x2: 3, y2: -55, stroke: pal.ink, 'stroke-width': 2 }, gl);
  return {
    update(t) {
      bars.forEach(({ n, h }, i) => { const p = easeOut(seg(t, 0.3 + i * 0.2, 0.7 + i * 0.2)); k.set(n, { y: base - h * p, height: h * p + 0.01 }); });
      const cur = clamp(Math.floor((t - 0.3) / 0.2), 0, 11);
      const pt = easeOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 3.2, 3.6)));
      P(b, { look: 0.6, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t), armL: 14 });
      b.pose({ armR: lerp(8, point(b, S, 'R', bars[cur].x + 5, base - bars[cur].h), pt) + 150 * easeOut(seg(t, 3.4, 3.8)) * (1 - pt) });
      gl.setAttribute('opacity', easeOut(seg(t, 3.4, 3.6)));
      sun.rays.setAttribute('transform', `rotate(${t * 15})`);
      tf(pm.top, 15.4, -110, 3 * Math.sin(t * 2));
    }
  };
}
