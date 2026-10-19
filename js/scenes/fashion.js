// fashion：カレンダーが今年に変わり、若い人たちがみんなミニスカートで街を歩く。ポスターも流行の印（例文 Short skirts are in fashion this year among young people.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { wardrobe, gait, P, blinkAt, skirtProp } from './skirt.js';
import { streetBg } from './weigh.js';
import { star } from './get-on-with.js';

export const meta = { duration: 4.4, beats: [[0, '今年'], [1.0, 'みんなミニスカート'], [3.2, '流行している']] };

export function create(k) {
  const { el, g, pal, tf } = k;
  const FY = streetBg(k, 236);
  // カレンダー（去年 → 今年）
  el('rect', { x: 20, y: 18, width: 86, height: 50, rx: 6, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 20, y: 18, width: 86, height: 12, rx: 4, fill: pal.red });
  const y0 = k.text(63, 50, '2025', { 'font-size': 18, fill: pal.sub });
  const y1 = k.text(63, 50, '2026', { 'font-size': 18, fill: pal.ink });
  // 店のポスター：ミニスカート＋上向き矢印
  el('rect', { x: 296, y: 40, width: 84, height: 96, rx: 6, fill: '#FFF4E0', stroke: pal.yellowDark, 'stroke-width': 3 });
  tf(skirtProp(k, k.root, pal.coral, pal.coralDark, 18), 326, 66, 0, 1.2);
  const arrow = el('path', { d: 'M 0 10 L 0 -10 M -7 -3 L 0 -10 L 7 -3', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  const ppl = [
    { c: pal.mint, d: pal.mintDark, sk: pal.coral, x0: -40, x1: 120 },
    { c: pal.violet, d: '#8C70DD', sk: pal.yellow, x0: 440, x1: 200 },
    { c: pal.blue, d: pal.blueDark, sk: pal.mint, x0: -80, x1: 270 }
  ].map((o, i) => {
    const b = k.buddy({ x: o.x0, y: FY + 4, scale: 0.95, color: o.c, dark: o.d });
    const W = wardrobe(k, b);
    W.top({ color: '#fff', dark: pal.line, sleeve: 'short', to: -18 });
    W.bottom({ kind: 'skirt', color: o.sk, dark: 'rgba(0,0,0,0.2)', from: -18 });
    W.feet('shoe', pal.ink);
    return { b, o, xf: (t) => lerp(o.x0, o.x1, easeInOut(seg(t, 0.8 + i * 0.25, 2.8 + i * 0.25))) };
  });
  const sp = [0, 1, 2].map(() => star(k, k.root, 8));
  return {
    update(t) {
      const fl = easeInOut(seg(t, 0.2, 0.7));
      tf(y0, 0, -10 * fl); y0.setAttribute('opacity', 1 - fl);
      tf(y1, 0, 10 * (1 - fl)); y1.setAttribute('opacity', fl);
      ppl.forEach(({ b, o, xf }, i) => {
        const p = gait(xf, t, o.x0);
        const d = o.x1 - o.x0;
        const pose = easeOut(seg(t, 3.3 + i * 0.1, 3.7 + i * 0.1));
        P(b, { x: p.x, y: FY + 4, walk: p.walk, facing: t > 3.3 ? (i === 1 ? -1 : 1) : Math.sign(d), lean: p.lean, armL: p.armL, armR: lerp(p.armR, 150, pose), look: 0.3, mood: t > 3.2 ? 'grin' : 'smile', blink: blinkAt(t, i) });
      });
      tf(arrow, 360, 112 - 6 * hump(seg(t, 3.2, 3.8)), 0, t > 3.1 ? easeOut(seg(t, 3.1, 3.4)) : 0.001);
      sp.forEach((s, i) => { const q = seg(t, 3.4 + i * 0.15, 4.3); tf(s, 130 + i * 80, FY - 130 - 10 * q, q * 90, hump(q) + 0.001); });
    }
  };
}
