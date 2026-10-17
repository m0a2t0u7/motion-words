// in the same boat：雨の海で、ひとつのボートに乗る3人。みんな同じ状況で、顔を見合わせて寄り添う（We are all in the same boat.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'ひとりずつ'], [1.6, '顔を見合わせる'], [3.0, '寄り添う']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 110, fill: '#C9D3DF' });
  el('rect', { x: 0, y: 150, width: 400, height: 150, fill: '#8FD3F4' });
  el('rect', { x: 0, y: 150, width: 400, height: 3, fill: '#fff', opacity: 0.6 });
  [[70, 50, 1], [220, 36, 1.3], [340, 56, 0.9]].forEach(([x, y, s]) => {
    const c = g({}); tf(c, x, y, 0, s);
    [[-26, 6, 20], [0, -6, 26], [26, 6, 20]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r, fill: '#8E9BAD' }, c));
  });
  const boatG = g({});
  const cols = [[pal.mint, pal.mintDark], [pal.coral, pal.coralDark], [pal.yellow, pal.yellowDark]];
  const bs = cols.map(([c, d], i) => k.buddy({ x: 150 + i * 50, y: 220, color: c, dark: d, facing: i === 2 ? -1 : 1 }));
  const front = g({});
  el('path', { d: 'M 96 192 L 304 192 Q 292 232 262 236 L 138 236 Q 108 232 96 192 Z', fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 }, front);
  el('rect', { x: 96, y: 188, width: 208, height: 8, rx: 4, fill: pal.woodDark }, front);
  el('rect', { x: 120, y: 206, width: 160, height: 5, rx: 2, fill: pal.woodDark, opacity: 0.5 }, front);
  const wave = el('path', { d: '', fill: '#6BC3EC' });
  const rain = [];
  for (let i = 0; i < 26; i++) rain.push(el('line', { stroke: '#fff', 'stroke-width': 2, 'stroke-linecap': 'round', opacity: 0.8 }));
  const hearts = [0, 1].map(() => el('path', { d: 'M 0 6 C -10 -2 -7 -10 0 -5 C 7 -10 10 -2 0 6 Z', fill: pal.red }));
  return {
    update(t) {
      const bob = 5 * Math.sin(t * 2.2), roll = 2.2 * Math.sin(t * 1.7);
      tf(front, 0, bob, roll * 0.5);
      front.setAttribute('transform', `translate(0 ${bob.toFixed(2)}) rotate(${(roll * 0.5).toFixed(2)} 200 230)`);
      const notice = easeInOut(seg(t, 1.5, 2.1)), close = easeOut(seg(t, 2.9, 3.6));
      const happy = t > 2.7;
      bs.forEach((b, i) => {
        const dir = i === 2 ? -1 : 1;
        const away = (i === 0 ? -1 : i === 2 ? 1 : 0.2);
        const look = lerp(away * 0.8, i === 1 ? -0.6 : dir * 0.6 * 1, notice);
        const sh = Math.sin(t * 14 + i * 2) * (1 - notice);
        b.pose({
          x: lerp(150 + i * 50, 156 + i * 44, close), y: 214 + bob + 2 * Math.sin(t * 2.2 + i), lean: roll + sh * 1.5,
          armL: lerp(10, 40, 1 - notice) * (1 - close) + lerp(0, 55, close), armR: lerp(10, 30, 1 - notice) * (1 - close) + lerp(0, 55, close),
          look, mood: happy ? 'smile' : 'sad', blink: 0, squash: 1 - 0.02 * Math.abs(sh)
        });
      });
      const sw = 14 * t;
      let d = 'M 0 300 L 0 236';
      for (let x = 0; x <= 400; x += 20) d += ` L ${x} ${236 + 6 * Math.sin((x + sw * 6) / 22) - 0}`;
      wave.setAttribute('d', d + ' L 400 300 Z');
      wave.setAttribute('transform', `translate(0 ${(bob * 0.5).toFixed(2)})`);
      rain.forEach((r, i) => {
        const p = (t * 1.6 + i * 0.173) % 1, x = (i * 53) % 420 - 10 + p * -14, y = p * 270 - 10;
        k.set(r, { x1: x, y1: y, x2: x - 4, y2: y + 12 });
      });
      hearts.forEach((h, i) => { const p = seg(t, 3.3 + i * 0.2, 4.1); tf(h, 175 + i * 50, 150 - 24 * p + bob, 0, hump(p) * 1.2); });
    }
  };
}
