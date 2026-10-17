// figure out：スマホのアプリが分からず考え、ひらめいて使い方が分かる（例文 I finally figured out how to use this app.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '分からない'], [1.3, '考える'], [2.7, '分かった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 296, y: 36, width: 70, height: 56, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 331, y1: 36, x2: 331, y2: 92, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 190, ry: 18, fill: '#FBE3D8' });

  const MX = 138, S = 1.05;
  const b = k.buddy({ x: MX, y: FY, scale: S });
  // スマホ（右手に持つ。画面はこちら向き）
  const ph = g({});
  el('rect', { x: -22, y: -42, width: 44, height: 84, rx: 10, fill: '#2A3242' }, ph);
  el('rect', { x: -18.5, y: -37, width: 37, height: 74, rx: 6.5, fill: '#EAF4FB' }, ph);
  const cols = [pal.coral, pal.yellow, pal.violet, pal.blue, pal.mint, pal.coral, pal.yellow, pal.blue];
  const icons = cols.map((c, i) => el('rect', { x: -13 + (i % 2) * 16, y: -30 + Math.floor(i / 2) * 15, width: 11, height: 11, rx: 3, fill: c, opacity: 0.85 }, ph));
  const okScr = g({}, ph);
  el('rect', { x: -18.5, y: -37, width: 37, height: 74, rx: 6.5, fill: '#E3F6EA' }, okScr);
  el('circle', { cx: 0, cy: -4, r: 14, fill: pal.green }, okScr);
  el('path', { d: 'M -7 -4 L -2 2 L 8 -10', stroke: '#FFFFFF', 'stroke-width': 4.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, okScr);
  el('rect', { x: -12, y: 18, width: 24, height: 5, rx: 2.5, fill: '#B8E5C7' }, okScr);
  const qm = g({}, ph); // 画面の「？」
  k.text(0, -4, '?', { 'font-size': 26, fill: pal.coralDark }, qm);

  // 頭上：？ → 歯車 → 電球
  const HX = MX - 4, HY = 100;
  const bigQ = g({});
  k.text(0, 0, '?', { 'font-size': 46, fill: pal.blueDark }, bigQ);
  const cog = (r, n, col) => {
    const gg = g({});
    const pts = [];
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.78 : r; pts.push(`${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`); }
    el('polygon', { points: pts.join(' '), fill: col, stroke: col, 'stroke-width': 4, 'stroke-linejoin': 'round' }, gg);
    el('circle', { cx: 0, cy: 0, r: r * 0.34, fill: '#FFFFFF' }, gg);
    return gg;
  };
  const gearBox = g({});
  const c1 = cog(17, 8, pal.sub), c2 = cog(12, 6, '#A9B3C4');
  gearBox.appendChild(c1); gearBox.appendChild(c2);
  const bulb = g({});
  const glow = el('circle', { cx: 0, cy: 0, r: 34, fill: pal.yellow, opacity: 0 }, bulb);
  const rays = [0, 1, 2, 3, 4, 5, 6].map((i) => { const a = Math.PI + (i / 6) * Math.PI; return el('line', { x1: Math.cos(a) * 26, y1: Math.sin(a) * 26 - 2, x2: Math.cos(a) * 36, y2: Math.sin(a) * 36 - 2, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 }, bulb); });
  el('circle', { cx: 0, cy: -2, r: 18, fill: '#E4E9F0' }, bulb);
  const bulbOn = el('circle', { cx: 0, cy: -2, r: 18, fill: pal.yellow, opacity: 0 }, bulb);
  el('path', { d: 'M -8 14 L -8 24 Q 0 28 8 24 L 8 14 Z', fill: '#8F9BB0' }, bulb);
  el('rect', { x: -7, y: 19, width: 14, height: 3, fill: '#6E7890' }, bulb);
  el('path', { d: 'M -6 6 Q 0 -8 6 6', stroke: '#B0BAC9', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, bulb);
  const bulbHi = el('path', { d: 'M -9 -8 Q -8 -14 -2 -15', stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }, bulb);

  return {
    update(t) {
      const think = easeInOut(seg(t, 1.2, 1.5)) * (1 - easeOut(seg(t, 2.55, 2.7)));
      const aha = seg(t, 2.6, 2.85);
      const solved = t > 2.8;
      // 頭をかく右手 / スマホを持つ左手
      const scratch = Math.sin(t * 13) * 7 * think;
      const done = easeInOut(seg(t, 3.1, 3.5));
      b.pose({
        x: MX, armR: 66, armL: lerp(8, 150, think * (1 - done)) + scratch * (1 - done),
        look: 0.8 - 0.8 * done * 0, lean: 3 - 3 * done + hump(aha) * -6,
        squash: 1 - 0.03 * hump(aha),
        mood: solved ? 'grin' : t < 1.2 ? 'flat' : 'open', blink: 0
      });
      // 腕の向きを逆にして、スマホは前（右）に見せる：右手＝画面右側
      const hp = b.handPos('R');
      tf(ph, hp.x + 16, hp.y - 26, -8, 1.15);
      qm.setAttribute('opacity', solved ? 0 : 1);
      tf(qm, 0, 0, 0, 1 + 0.08 * Math.sin(t * 7));
      okScr.setAttribute('opacity', easeOut(seg(t, 3.0, 3.35)));
      icons.forEach((ic) => ic.setAttribute('opacity', t > 3.05 ? 0 : 0.85));
      // 頭上の記号
      const qs = (1 - easeOut(seg(t, 1.1, 1.3))) ;
      const bq = Math.max(0.001, backOut(seg(t, 0.15, 0.5), 1.6)) * (1 - easeOut(seg(t, 1.1, 1.3)));
      tf(bigQ, HX, HY + Math.sin(t * 4) * 2, Math.sin(t * 3) * 6, bq, bq);
      const gp = Math.max(0.001, backOut(seg(t, 1.25, 1.6), 1.4)) * (1 - easeOut(seg(t, 2.55, 2.75)));
      tf(gearBox, HX, HY, 0, gp, gp);
      const sp = t < 2.6 ? t * 150 : 2.6 * 150;
      tf(c1, -8, 4, sp); tf(c2, 15, -10, -sp * 1.42 + 12);
      const bp = Math.max(0.001, backOut(aha, 2.0));
      tf(bulb, HX, HY, 0, bp, bp);
      bulb.setAttribute('opacity', aha > 0 ? 1 : 0);
      const lit = seg(t, 2.65, 2.85);
      bulbOn.setAttribute('opacity', lit);
      glow.setAttribute('opacity', 0.3 * lit * (0.8 + 0.2 * Math.sin(t * 10)));
      rays.forEach((r) => r.setAttribute('opacity', lit > 0.4 ? 1 : 0));
    }
  };
}
