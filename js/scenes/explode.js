// explode：花火が空へ昇り、ぱっと爆発して火花が広がって落ちる。二人が見上げる（例文 The fireworks exploded in the sky.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '打ち上げ'], [1.3, '爆発'], [3.0, '空に広がる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = 236;
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#3A3068'], [0.7, '#8A5B96'], [1, '#E7A0A0']]) });
  // 星
  [[30, 30], [90, 60], [150, 22], [260, 40], [330, 24], [370, 70], [60, 110], [350, 120]].forEach(([x, y], i) => el('circle', { cx: x, cy: y, r: i % 2 ? 1.2 : 1.8, fill: '#fff', opacity: 0.7 }));
  // 街のシルエット
  [[0, 70, 46], [46, 96, 40], [86, 60, 54], [140, 84, 36], [250, 90, 44], [294, 62, 50], [344, 100, 56]].forEach(([x, h, w]) => {
    el('rect', { x, y: FY - h, width: w, height: h + 70, fill: '#2B2650' });
    for (let j = 0; j < 3; j++) el('rect', { x: x + 8 + (j % 2) * 18, y: FY - h + 12 + j * 20, width: 8, height: 8, rx: 1.5, fill: '#FFD98A', opacity: 0.55 });
  });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#3A3563' });
  const b1 = k.buddy({ x: 170, y: FY + 24, scale: 0.9 });
  const b2 = k.buddy({ x: 232, y: FY + 24, scale: 0.82, facing: -1, color: pal.coral, dark: pal.coralDark });
  const BURSTS = [
    { t0: 0.3, tb: 1.3, x: 200, y: 78, c: '#FFCF5C', n: 26, r: 62 },
    { t0: 1.9, tb: 2.7, x: 120, y: 98, c: '#FF8E77', n: 22, r: 46 },
    { t0: 2.2, tb: 3.2, x: 290, y: 70, c: '#8FD3F4', n: 24, r: 52 }
  ];
  const parts = [];
  BURSTS.forEach((B, bi) => {
    const rocket = el('circle', { r: 3, fill: '#fff' });
    const trail = el('line', { stroke: '#FFE9A8', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
    const flash = el('circle', { r: 10, fill: '#fff', opacity: 0 });
    const ps = [];
    for (let i = 0; i < B.n; i++) {
      const ang = (i / B.n) * Math.PI * 2 + bi * 0.4, sp = B.r * (0.75 + 0.25 * ((i * 37) % 10) / 10);
      ps.push({ n: el('circle', { r: 2.4, fill: i % 3 === 0 ? '#fff' : B.c }), ang, sp });
    }
    parts.push({ B, rocket, trail, flash, ps });
  });
  return {
    update(t) {
      parts.forEach(({ B, rocket, trail, flash, ps }) => {
        const up = seg(t, B.t0, B.tb);
        const sx = B.x + (bi2(B) - 0) * 0, sy0 = FY - 70;
        const ry = lerp(sy0, B.y, easeOut(up));
        const alive = t >= B.t0 && t < B.tb;
        rocket.setAttribute('opacity', alive ? 1 : 0);
        k.set(rocket, { cx: B.x, cy: ry });
        trail.setAttribute('opacity', alive ? 0.8 : 0);
        k.set(trail, { x1: B.x, y1: ry, x2: B.x, y2: ry + 26 * (1 - up * 0.5) });
        const q = seg(t, B.tb, B.tb + 1.6);
        const fl = hump(seg(t, B.tb, B.tb + 0.25));
        flash.setAttribute('opacity', fl * 0.9);
        k.set(flash, { cx: B.x, cy: B.y, r: 8 + 26 * fl });
        ps.forEach((p) => {
          const e = easeOut(Math.min(1, q * 1.3));
          const x = B.x + Math.cos(p.ang) * p.sp * e, y = B.y + Math.sin(p.ang) * p.sp * e + 38 * q * q;
          p.n.setAttribute('opacity', q > 0 && q < 1 ? 1 - q * q : 0);
          k.set(p.n, { cx: x, cy: y, r: 2.6 * (1 - 0.6 * q) });
        });
      });
      const cheer = easeOut(seg(t, 1.2, 1.7));
      b1.pose({ armL: 8 + 120 * cheer, armR: 8 + 130 * cheer, lean: -5 * cheer, look: 0, mood: cheer > 0.3 ? 'open' : 'smile', lift: 5 * hump(seg(t, 1.2, 1.8)) });
      b2.pose({ armL: 8 + 110 * cheer, armR: 8 + 125 * cheer, lean: -5 * cheer, look: 0, mood: cheer > 0.3 ? 'grin' : 'smile', lift: 5 * hump(seg(t, 1.3, 1.9)) });
    }
  };
}
const bi2 = () => 0;
