// melt：日なたの皿の上で氷が角から丸くなって縮み、水たまりだけになる（例文 The ice melted in the sun.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '氷'], [0.9, '溶けていく'], [3.0, '水になる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 226, mood: 'outdoor' });
  // テーブル
  el('rect', { x: 0, y: 226, width: 400, height: 74, fill: '#EBD3B0' });
  el('rect', { x: 0, y: 226, width: 400, height: 10, fill: pal.wood });

  // 太陽
  const sun = g({});
  tf(sun, 322, 62);
  const halo = el('circle', { r: 46, fill: pal.yellow, opacity: 0.25 }, sun);
  const rays = g({}, sun);
  for (let i = 0; i < 10; i++) el('line', { x1: 36, y1: 0, x2: 48, y2: 0, stroke: pal.yellowDark, 'stroke-width': 5, 'stroke-linecap': 'round', transform: `rotate(${i * 36})` }, rays);
  el('circle', { r: 28, fill: pal.yellow }, sun);
  el('circle', { cx: -8, cy: -9, r: 8, fill: '#FFFFFF', opacity: 0.4 }, sun);

  // 皿
  const PX = 200, PY = 214;
  k.shadow(PX + 4, 236, 120, 11);
  el('ellipse', { cx: PX, cy: PY + 8, rx: 108, ry: 20, fill: '#DDE3EB' });
  el('ellipse', { cx: PX, cy: PY, rx: 112, ry: 22, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 });
  el('ellipse', { cx: PX, cy: PY + 2, rx: 90, ry: 15, fill: '#F2F5F9' });

  // 水たまり
  const puddle = el('ellipse', { cx: PX, cy: PY + 4, rx: 1, ry: 1, fill: pal.water, opacity: 0.9 });
  const puddleHi = el('ellipse', { cx: PX - 18, cy: PY + 1, rx: 1, ry: 1, fill: '#FFFFFF', opacity: 0.6 });
  const ripples = [0, 1].map(() => el('ellipse', { cx: PX, cy: PY + 5, rx: 1, ry: 1, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2 }));

  // 氷
  const ice = g({});
  tf(ice, PX, PY + 6);
  const iceBody = el('path', { d: '', fill: '#CDEEFB', stroke: '#A6DAF2', 'stroke-width': 3, 'stroke-linejoin': 'round' }, ice);
  const iceTop = el('path', { d: '', fill: '#E9F8FE' }, ice);
  const glint = el('rect', { rx: 4, fill: '#FFFFFF', opacity: 0.7 }, ice);
  // 光るきらり
  const star = el('path', { d: 'M 0 -9 Q 1.5 -1.5 9 0 Q 1.5 1.5 0 9 Q -1.5 1.5 -9 0 Q -1.5 -1.5 0 -9 Z', fill: '#FFFFFF' });

  // しずく
  const drops = [0, 1, 2].map(() => el('path', { d: 'M 0 -7 Q 5 0 0 4 Q -5 0 0 -7 Z', fill: pal.water }));

  const roundRect = (w, h, rt, rb) => {
    const x = w / 2;
    return `M ${-x + rt} ${-h} L ${x - rt} ${-h} Q ${x} ${-h} ${x} ${-h + rt} L ${x} ${-rb} Q ${x} 0 ${x - rb} 0 L ${-x + rb} 0 Q ${-x} 0 ${-x} ${-rb} L ${-x} ${-h + rt} Q ${-x} ${-h} ${-x + rt} ${-h} Z`;
  };

  return {
    update(t) {
      // 太陽の光：ゆっくり回って脈打つ
      tf(rays, 0, 0, t * 12);
      k.set(halo, { r: 46 + 4 * Math.sin(t * 3) });

      // 氷：縮みながら角が丸くなる
      const sp0 = seg(t, 0.7, 3.4);
      const m = lerp(sp0, easeInOut(sp0), 0.45);
      const w = lerp(84, 46, m);
      const h = lerp(82, 0, Math.pow(m, 0.9));
      const roundP = easeOut(seg(t, 0.8, 2.0));
      const rb = Math.min(5 + 8 * roundP, h * 0.4);
      const rt = Math.min(lerp(8, 40, roundP), h - rb, w / 2);
      const vis = h > 6;
      ice.setAttribute('opacity', vis ? clamp(h / 12) : 0);
      if (vis) {
        k.set(iceBody, { d: roundRect(w, h, Math.max(1, rt), Math.max(1, rb)) });
        k.set(iceTop, { d: roundRect(w * 0.8, Math.min(14, h * 0.3), 6, 4).replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (s, a, b) => `${a} ${(+b - h + 6).toFixed(1)}`) });
        k.set(glint, { x: -w / 2 + 9, y: -h + 14, width: Math.max(2, w * 0.14), height: Math.max(2, h * 0.45), opacity: h > 20 ? 0.7 : 0 });
      }
      // きらり（最初に1回）
      const sp = hump(seg(t, 0.15, 0.7));
      tf(star, PX + 22, PY - 70, sp * 90, sp, sp);
      star.setAttribute('opacity', sp > 0 ? 1 : 0);

      // 水たまり
      const pp = easeOut(seg(t, 0.95, 3.6));
      k.set(puddle, { rx: Math.max(1, 86 * pp), ry: Math.max(1, 13.5 * pp), cy: PY + 4 });
      k.set(puddleHi, { rx: Math.max(1, 30 * pp), ry: Math.max(0.6, 2.8 * pp), cx: PX - 22 * pp });
      puddle.setAttribute('opacity', pp > 0 ? 0.92 : 0);
      puddleHi.setAttribute('opacity', pp > 0.1 ? 0.6 : 0);

      // しずく：氷の縁にふくらんで、落ちて、波紋になる
      drops.forEach((d, i) => {
        const T = 0.85;
        const c = (t - 1.0 - i * 0.28) / T;
        const on = c >= 0 && t < 3.2 && h > 12;
        const ph = c - Math.floor(c);
        const side = i === 1 ? -1 : 1;
        const cx = PX + side * (w / 2 - 1 + (i === 2 ? -10 : 0));
        const topY = PY + 6 - h * (i === 2 ? 0.55 : 0.8);
        const ground = PY + 14 + (i === 1 ? 4 : 0);
        let y, s;
        if (ph < 0.4) { s = 0.3 + 0.7 * easeOut(ph / 0.4); y = topY + 2 * ph; }
        else { s = 1; y = lerp(topY, ground, easeIn((ph - 0.4) / 0.38)); }
        const fell = ph > 0.78;
        tf(d, cx + side * (ph > 0.4 ? 3 * seg(ph, 0.4, 0.78) : 0), y, 0, s, s * (ph >= 0.4 ? 1.2 : 1));
        d.setAttribute('opacity', on && !fell ? 1 : 0);
      });
      ripples.forEach((r, i) => {
        const c = (t - 1.0 - i * 0.28 + 0 - 0) / 0.85;
        const ph = c - Math.floor(c);
        const q = seg(ph, 0.78, 1.0);
        const on = c >= 0 && t < 3.3 && t > 1.7 && q > 0;
        const side = i === 0 ? 1 : -1;
        k.set(r, { cx: PX + side * (w / 2 + 6), rx: 3 + 20 * q, ry: 1 + 5 * q, opacity: on ? 0.9 * (1 - q) : 0 });
      });
    }
  };
}
