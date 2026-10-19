// garden：庭の畑でまめがトマトに水をやり、実が赤くなると友だちが一つ摘んでかごに入れる（例文 We grow tomatoes in the garden.）
import { seg, lerp, easeInOut, easeOut, wobble, hump, backOut, clamp } from '../ease.js';
import { gait, hp, reach } from './dig.js';
import { P, blinkAt, tree } from './run-after.js';

const mix = (a, b, p) => {
  const h = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(p))).toString(16).padStart(2, '0')).join('');
};
// じょうろ（原点＝取っ手。spout() で注ぎ口の位置）
export function wateringCan(k, parent) {
  const { el, pal } = k, g = k.g({}, parent);
  el('path', { d: 'M -10 2 Q -2 -12 10 2', stroke: pal.blueDark, 'stroke-width': 3.5, fill: 'none' }, g);
  el('rect', { x: -14, y: 2, width: 28, height: 22, rx: 5, fill: pal.blue }, g);
  el('path', { d: 'M 12 16 L 32 2', stroke: pal.blueDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
  el('ellipse', { cx: 33, cy: 1, rx: 3, ry: 4.5, fill: pal.blueDark, transform: 'rotate(-35 33 1)' }, g);
  return g;
}

export const meta = { duration: 4.6, beats: [[0, '水をやる'], [1.8, 'トマトが育つ'], [3.4, '赤いトマト']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 70, width: 400, height: 70, fill: '#E3F2E0' });
  tree(k, 30, FY - 4, 0.7);
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#CFE7C6' });
  // 畑
  el('path', { d: `M 172 ${FY + 4} Q 176 ${FY - 10} 200 ${FY - 10} L 352 ${FY - 10} Q 376 ${FY - 10} 380 ${FY + 4} Z`, fill: '#9C6B48' });
  const PX = [214, 270, 326];
  const plants = PX.map((x) => {
    el('rect', { x: x + 9, y: FY - 104, width: 4, height: 96, fill: pal.woodDark }); // 支柱（動かない）
    const p = g({}); tf(p, x, FY - 8);
    const st = g({}, p);
    el('path', { d: 'M 0 0 Q -3 -40 2 -80', stroke: '#4E9A5E', 'stroke-width': 4, fill: 'none' }, st);
    [[-14, -24, -30], [14, -40, 30], [-14, -58, -30], [12, -72, 25]].forEach(([lx, ly, r]) => el('ellipse', { cx: lx, cy: ly, rx: 13, ry: 6, fill: '#5DB56E', transform: `rotate(${r} ${lx} ${ly})` }, st));
    const fr = [[-8, -36], [8, -54], [-6, -66]].map(([fx, fy]) => { const f = el('circle', { cx: 0, cy: 0, r: 7, fill: '#7CC46A' }, st); el('path', { d: 'M -3 -7 L 0 -9 L 3 -7', stroke: '#3E8A4E', 'stroke-width': 2, fill: 'none' }, null); return [f, fx, fy]; });
    return { p, st, fr };
  });
  const S = 0.85;
  const fr = k.buddy({ x: 372, y: FY, scale: 0.85, facing: -1, color: pal.coral, dark: pal.coralDark });
  const basket = g({});
  el('path', { d: 'M -16 0 L 16 0 L 12 16 L -12 16 Z', fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, basket);
  el('path', { d: 'M -12 0 Q 0 -16 12 0', stroke: pal.woodDark, 'stroke-width': 2.5, fill: 'none' }, basket);
  const me = k.buddy({ x: 120, y: FY, scale: S });
  const can = wateringCan(k);
  const drops = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => el('path', { d: 'M 0 -6 Q 4.5 0 0 4.5 Q -4.5 0 0 -6 Z', fill: pal.water }));
  const pick = el('circle', { r: 7, fill: pal.red });
  const xf = (t) => lerp(120, 196, easeInOut(seg(t, 0.2, 2.2)));
  return {
    update(t) {
      const w = gait(xf, t, 120, 6, 0.08);
      const pour = easeOut(seg(t, 0.2, 0.5)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      P(me, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(8, 62, pour), lean: w.lean + 4 * pour, look: 0.7, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      const h = hp(me, S, 'R');
      const tilt = 32 * pour;
      tf(can, h.x - 2, h.y - 2, tilt, S);
      const a = (tilt * Math.PI) / 180, sx = h.x - 2 + (33 * Math.cos(a) - 1 * Math.sin(a)) * S, sy = h.y - 2 + (33 * Math.sin(a) + 1 * Math.cos(a)) * S;
      drops.forEach((d, i) => {
        const q = ((t * 2.2 + i / 10) % 1);
        tf(d, sx + 22 * q, sy + 60 * q * q);
        d.setAttribute('opacity', pour > 0.7 ? 1 - q * 0.6 : 0);
      });
      // 育つ → 実が大きく → 赤く
      plants.forEach(({ st, fr: fs }, i) => {
        const gr = easeOut(seg(t, 0.6 + i * 0.4, 2.2 + i * 0.4));
        tf(st, 0, 0, Math.sin(t * 2 + i) * 1.5, 1, lerp(0.45, 1, gr));
        fs.forEach(([f, fx, fy], j) => {
          const sw = backOut(seg(t, 1.8 + i * 0.2 + j * 0.1, 2.4 + i * 0.2 + j * 0.1));
          const red = seg(t, 2.6 + j * 0.15, 3.3 + j * 0.15);
          k.set(f, { cx: fx, cy: fy + 9, r: 7.5 * Math.max(0, sw), fill: mix('#7CC46A', '#F2685B', red) });
        });
      });
      // 友だち：赤いトマトを摘んでかごへ
      const rch = easeInOut(seg(t, 3.4, 3.8)), put = easeInOut(seg(t, 3.9, 4.3));
      const T = { x: 326 + 6, y: FY - 8 - 36 + 9 };
      P(fr, { x: 372 - 8 * rch, facing: -1, look: 0.5, mood: t > 3.9 ? 'grin' : 'smile', blink: blinkAt(t, 1) });
      fr.pose({ armR: lerp(lerp(8, reach(fr, 0.85, 'R', T.x, T.y), rch), 20, put), armL: 30 });
      const fh = hp(fr, 0.85, 'L');
      tf(basket, fh.x - 4, fh.y);
      const rh = hp(fr, 0.85, 'R');
      const picked = t > 3.8;
      plants[2].fr[0][0].setAttribute('opacity', picked ? 0 : 1);
      pick.setAttribute('opacity', picked ? 1 : 0);
      tf(pick, lerp(rh.x, fh.x - 4, put * 0), picked ? (put > 0.95 ? fh.y + 4 : rh.y) : 0);
      if (put > 0.95) tf(pick, fh.x - 4, fh.y + 3);
    }
  };
}
