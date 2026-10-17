// under the weather：頭上に小さな雨雲がついてくるまめが、くしゃみをして、毛布と温かいお茶で休む（例文 I'm feeling a bit under the weather today.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '元気がない'], [1.1, 'くしゃみ'], [2.5, '休んでいる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  // 窓（曇り空）
  el('rect', { x: 150, y: 28, width: 92, height: 74, rx: 8, fill: '#D5DEE8' });
  el('line', { x1: 196, y1: 28, x2: 196, y2: 102, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('ellipse', { cx: 176, cy: 60, rx: 18, ry: 8, fill: '#E6EBF2' });
  el('ellipse', { cx: 218, cy: 78, rx: 18, ry: 8, fill: '#E6EBF2' });

  // ソファ（左）と毛布
  el('rect', { x: 8, y: 150, width: 20, height: 88, rx: 8, fill: '#B9A8F0' });
  el('rect', { x: 8, y: 150, width: 134, height: 36, rx: 12, fill: pal.violet });
  el('rect', { x: 8, y: 186, width: 134, height: 52, rx: 12, fill: '#B9A8F0' });
  el('rect', { x: 132, y: 168, width: 22, height: 70, rx: 9, fill: pal.violet });
  el('rect', { x: 20, y: 236, width: 8, height: 12, fill: pal.woodDark });
  el('rect', { x: 126, y: 236, width: 8, height: 12, fill: pal.woodDark });
  k.shadow(84, 252, 80, 5);
  // 側のテーブルとお茶
  const TX = 346;
  el('rect', { x: TX - 34, y: 220, width: 68, height: 8, rx: 4, fill: pal.wood });
  el('rect', { x: TX - 4, y: 228, width: 8, height: 22, fill: pal.woodDark });
  el('ellipse', { cx: TX, cy: 252, rx: 22, ry: 4, fill: pal.shadow });

  // 毛布（ソファの上 → 体にかかる）
  const blanket = g({});
  const bl = (parent) => {
    el('rect', { x: -26, y: -10, width: 52, height: 20, rx: 8, fill: pal.coral }, parent);
    [-12, 0, 12].forEach((x) => el('line', { x1: x, y1: -9, x2: x, y2: 9, stroke: '#FFFFFF', 'stroke-width': 3, opacity: 0.55 }, parent));
  };
  bl(blanket);

  // お茶
  const cup = g({});
  el('path', { d: 'M 11 -12 Q 21 -12 20 -5 Q 19 2 10 2', fill: 'none', stroke: pal.blue, 'stroke-width': 4, 'stroke-linecap': 'round' }, cup);
  el('path', { d: 'M -12 -16 L 12 -16 L 9 -1 Q 8.5 2 5 2 L -5 2 Q -8.5 2 -9 -1 Z', fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2, 'stroke-linejoin': 'round' }, cup);
  el('path', { d: 'M -10.5 -12 L 10.5 -12 L 9.4 -4 L -9.4 -4 Z', fill: '#C9A77B' }, cup);
  const steams = [0, 1].map(() => { const s = g({}, cup); el('path', { d: 'M 0 0 C 5 -5 -5 -10 0 -15 S 5 -23 0 -28', fill: 'none', stroke: '#BFCBDA', 'stroke-width': 3, 'stroke-linecap': 'round' }, s); return s; });

  // まめ
  const MS = 0.9, MY = 262;
  const b = k.buddy({ x: 215, y: MY, scale: MS });
  const poncho = g({});
  b.armR.a.parentNode.parentNode.insertBefore(poncho, b.armR.a.parentNode);
  el('path', { d: 'M -32 -34 Q 0 -42 32 -34 L 36 -6 Q 0 2 -36 -6 Z', fill: pal.coral }, poncho);
  [-20, -7, 7, 20].forEach((x) => el('line', { x1: x, y1: -37, x2: x * 1.06, y2: -3, stroke: '#FFFFFF', 'stroke-width': 3.5, opacity: 0.5 }, poncho));
  poncho.setAttribute('opacity', 0);

  // 雨雲
  const cloud = g({});
  el('ellipse', { cx: 0, cy: 6, rx: 36, ry: 12, fill: '#AEBBCB' }, cloud);
  el('circle', { cx: -14, cy: -4, r: 14, fill: '#B9C5D4' }, cloud);
  el('circle', { cx: 6, cy: -10, r: 17, fill: '#C3CEDB' }, cloud);
  el('circle', { cx: 22, cy: -1, r: 12, fill: '#B9C5D4' }, cloud);
  const rain = [0, 1, 2].map(() => el('path', { d: 'M 0 -6 Q 4.5 0 0 3.5 Q -4.5 0 0 -6 Z', fill: pal.blue }, cloud));
  // くしゃみ
  const ach = k.text(0, 0, 'Achoo!', { 'font-size': 17, fill: pal.coralDark });
  const bits = [0, 1, 2].map(() => el('circle', { r: 2.4, fill: pal.water }));

  const xAt = (t) => {
    if (t < 2.55) return 215;
    return lerp(215, 268, easeInOut(seg(t, 2.65, 3.2)));
  };
  return {
    update(t) {
      const x = xAt(t);
      const walking = t > 2.65 && t < 3.2;
      const w = walking ? (t - 2.65) * 9 : 0;
      // くしゃみ：のけぞる → 前へ
      const back = easeOut(seg(t, 1.15, 1.45));
      const snz = t >= 1.45 ? easeOut(seg(t, 1.45, 1.6)) * (1 - easeInOut(seg(t, 1.75, 2.3))) : 0;
      let lean = 8 * (1 - back) + -9 * back;
      if (t >= 1.45) lean = lerp(-9, 18, snz) * (1 - 0) + 0;
      if (t >= 1.75) lean = lerp(18, 8, easeInOut(seg(t, 1.75, 2.3)));
      const calm = t >= 2.5;
      const facingL = t >= 1.95 && t < 2.55;
      // 腕：毛布を取りに行く（左へ）→ お茶を取る
      let aR = 8;
      if (t >= 1.9 && t < 2.5) aR = lerp(8, 82, easeInOut(seg(t, 1.9, 2.15))) * (1 - easeInOut(seg(t, 2.3, 2.5))) + 8 * easeInOut(seg(t, 2.3, 2.5));
      else if (t >= 3.15) aR = lerp(8, 72, easeInOut(seg(t, 3.15, 3.5))) + (t > 3.5 ? lerp(0, 40, easeInOut(seg(t, 3.6, 4.1))) : 0);
      b.pose({
        x, facing: facingL ? -1 : 1, walk: w, armR: aR, armL: 8, look: facingL ? 0.9 : -0.5, lean: t < 1.15 ? 8 + 1.5 * Math.sin(t * 2.4) : lean,
        squash: t < 1.15 ? 0.97 : 1 - 0.05 * snz, mood: t >= 3.5 ? 'flat' : t < 2.5 ? 'sad' : 'flat', blink: t >= 3.6 ? 0.7 * hump(seg(t, 3.6, 4.1)) : 0
      });
      const hp = b.handPos('R');

      // 毛布：ソファの上 → 手 → 肩にかかる
      let bp, brot = -8, bs = 1;
      if (t < 2.1) bp = [100, 170];
      else if (t < 2.55) { const u = easeInOut(seg(t, 2.1, 2.5)); bp = [lerp(100, 160, u), lerp(170, 190, u) - 18 * hump(u)]; brot = lerp(-8, 0, u); }
      else bp = [x, MY - 20];
      const onBody = t >= 2.5;
      tf(blanket, bp[0], bp[1], brot, onBody ? 0.001 : 1, onBody ? 0.001 : 1);
      poncho.setAttribute('opacity', onBody ? 1 : 0);
      if (!onBody && t >= 2.1) tf(blanket, bp[0] + 0, bp[1], brot, 1, 1);

      // お茶：テーブル → 手 → 湯気
      let cp;
      if (t < 3.3) cp = [TX, 220 - 2];
      else cp = [hp.x + 3, hp.y - 4];
      tf(cup, cp[0], cp[1], 0, 1, 1);
      steams.forEach((s, i) => {
        const ph = (t * 0.6 + i * 0.5) % 1;
        tf(s, (i ? 6 : -6) + Math.sin(t * 2 + i) * 2, -16 - ph * 6);
        s.setAttribute('opacity', (t >= 3.0 ? 1 : 0.6) * Math.sin(Math.PI * ph) * 0.9);
      });

      // 雨雲：ついてくる。くしゃみでぶるっと、休むと小さく雨がやむ
      const cx = xAt(t - 0.15);
      const shiver = t > 1.45 && t < 2.1 ? 3 * Math.sin(t * 45) * (1 - seg(t, 1.45, 2.1)) : 0;
      const csz = lerp(1, 0.7, easeInOut(seg(t, 2.5, 3.3)));
      tf(cloud, cx + shiver, 136 + 3 * Math.sin(t * 2.4), 0, csz, csz);
      const rainOn = 1 - seg(t, 2.5, 3.0);
      rain.forEach((d, i) => {
        const ph = (t * 1.7 + i * 0.37) % 1;
        tf(d, -14 + i * 14, 16 + ph * 32);
        d.setAttribute('opacity', rainOn * (1 - ph * 0.7));
      });
      // くしゃみの文字としぶき
      const ap = seg(t, 1.45, 1.62) * (1 - seg(t, 2.0, 2.3));
      tf(ach, x + 56, 190 - 6 * seg(t, 1.45, 2.0), -8, 0.6 + 0.5 * ap, 0.6 + 0.5 * ap);
      ach.setAttribute('opacity', ap > 0 ? ap : 0);
      bits.forEach((c, i) => {
        const u = seg(t, 1.45, 1.9);
        k.set(c, { cx: x + 18 + u * (22 + i * 8), cy: 212 + (i - 1) * 8 + 24 * u * u, opacity: u > 0 && u < 1 ? 1 - u : 0 });
      });
    }
  };
}
