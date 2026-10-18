// put out：ヘルメットの消防士（まめ2人）がホースで放水し、小屋の火がみるみる小さくなって消え、煙だけが残る（例文 The firefighters put out the fire quickly.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { hp } from './dig.js';

export const meta = { duration: 4.0, beats: [[0, '燃えている'], [1.4, '放水する'], [3.0, '火が消えた']] };

export function helmet(k, b, c) {
  const g = k.g({}, b.body);
  k.el('path', { d: 'M -30 -66 Q -28 -96 0 -96 Q 28 -96 30 -66 Z', fill: c || k.pal.yellow }, g);
  k.el('rect', { x: -36, y: -70, width: 72, height: 7, rx: 3, fill: k.pal.yellowDark }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  // 小屋
  const HX = 300;
  el('rect', { x: HX - 50, y: 150, width: 100, height: 86, fill: '#D8BFA0' });
  el('path', { d: `M ${HX - 62} 154 L ${HX} 108 L ${HX + 62} 154 Z`, fill: '#9C7A5A' });
  el('rect', { x: HX - 14, y: 190, width: 28, height: 46, fill: '#7B5E44' });
  const soot = el('path', { d: `M ${HX - 40} 150 Q ${HX} 130 ${HX + 40} 150 L ${HX + 30} 170 Q ${HX} 160 ${HX - 30} 170 Z`, fill: '#5A5560', opacity: 0 });
  // 炎（大小3つ）
  const flames = [[-28, 148, 1], [6, 120, 1.3], [34, 150, 0.9]].map(([dx, y, s]) => {
    const f = g({});
    el('path', { d: 'M 0 0 C -18 -10 -14 -30 0 -48 C 4 -34 18 -30 14 -14 C 16 -6 10 0 0 0 Z', fill: pal.red }, f);
    el('path', { d: 'M 0 0 C -9 -6 -7 -18 0 -28 C 3 -18 10 -16 7 -8 C 8 -3 5 0 0 0 Z', fill: pal.yellow }, f);
    return [f, HX + dx, y, s];
  });
  const smokes = [0, 1, 2, 3].map(() => el('circle', { r: 10, fill: '#A6A9B2' }));
  // 消防士2人とホース
  const A = k.buddy({ x: 70, y: FY, scale: 0.85 }), B = k.buddy({ x: 130, y: FY + 6, scale: 0.85 });
  helmet(k, A); helmet(k, B);
  const hose = el('path', { d: '', stroke: '#C8463A', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' });
  const nozzle = g({}); el('rect', { x: 0, y: -4, width: 18, height: 8, rx: 2, fill: pal.sub }, nozzle);
  const drops = Array.from({ length: 16 }, () => el('circle', { r: 3.2, fill: pal.water }));
  return {
    update(t) {
      const on = seg(t, 0.9, 1.1), power = on * (1 - seg(t, 3.2, 3.5));
      const out = easeIn(seg(t, 1.3, 2.9));
      flames.forEach(([f, x, y, s], i) => { const ss = s * (1 - out) * (1 + 0.12 * Math.sin(t * 14 + i * 2)); tf(f, x, y, Math.sin(t * 9 + i) * 6, ss * 0.9 + 0.001, ss * 1.1 + 0.001); f.setAttribute('opacity', ss > 0.02 ? 1 : 0); });
      soot.setAttribute('opacity', 0.5 * out);
      smokes.forEach((s, i) => { const q = (t * 0.5 + i / 4) % 1; k.set(s, { cx: HX + Math.sin(q * 5 + i) * 14, cy: 120 - q * 90, r: 8 + q * 14, opacity: (0.25 + 0.35 * out) * hump(q) }); });
      const brace = easeOut(seg(t, 0.4, 0.9)), recoil = power * Math.sin(t * 30) * 0.8;
      A.pose({ armR: lerp(10, 70, brace), armL: lerp(10, 60, brace), lean: lerp(0, 10, brace) - recoil, squash: 1 - 0.06 * brace, look: 0.8, mood: t > 3.0 ? 'grin' : 'flat' });
      B.pose({ armR: lerp(10, 60, brace), armL: lerp(10, 50, brace), lean: lerp(0, 8, brace) - recoil, squash: 1 - 0.06 * brace, look: 0.8, mood: t > 3.0 ? 'grin' : 'flat' });
      const hb = hp(A, 0.85), ha = hp(B, 0.85);
      tf(nozzle, ha.x, ha.y, -12);
      k.set(hose, { d: `M ${ha.x} ${ha.y} Q ${(ha.x + hb.x) / 2} ${ha.y + 14} ${hb.x} ${hb.y} Q ${hb.x - 30} ${FY + 4} ${-10} ${FY + 2}` });
      // 水：ノズルの先から火へ放物線
      const nx = ha.x + 18 * Math.cos(-12 * Math.PI / 180), ny = ha.y + 18 * Math.sin(-12 * Math.PI / 180);
      drops.forEach((d, i) => {
        const q = (t * 2.2 + i / drops.length) % 1;
        const tx = HX - 10, ty = 140;
        k.set(d, { cx: lerp(nx, tx, q), cy: lerp(ny, ty, q) - Math.sin(q * Math.PI) * 50, opacity: power > 0 ? power : 0 });
      });
    }
  };
}
