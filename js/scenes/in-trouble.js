// in trouble：レジで支払おうとポケットを探るが財布がない→ポケットは空っぽ、頭を抱えて困る（I'm in trouble. I lost my wallet.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { P, blinkAt, mark, wallet, drop } from './so-far-so-good.js';
import { cloud } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'レジで支払い'], [1.4, '財布がない'], [3.0, '困った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 棚
  [60, 100, 140].forEach((y, i) => { el('rect', { x: 10, y, width: 110, height: 5, fill: pal.woodDark }); [0, 1, 2, 3].forEach((j) => el('rect', { x: 16 + j * 26, y: y - 22, width: 18, height: 22, rx: 3, fill: [pal.coral, pal.yellow, pal.green, pal.blue][(i + j) % 4] })); });
  const C = k.buddy({ x: 300, y: FY - 26, facing: -1, color: pal.coral, dark: pal.coralDark, scale: 0.9 });
  // レジカウンター
  k.shadow(300, FY + 1, 80, 5);
  el('rect', { x: 220, y: 170, width: 170, height: 10, rx: 3, fill: pal.wood });
  el('rect', { x: 226, y: 180, width: 158, height: FY - 180, fill: '#F2DDBB' });
  el('rect', { x: 330, y: 140, width: 44, height: 30, rx: 4, fill: pal.ink });
  el('rect', { x: 334, y: 144, width: 36, height: 14, rx: 2, fill: '#9FE0B8' });
  k.text(352, 152, '$12', { 'font-size': 10, fill: pal.ink });
  el('rect', { x: 232, y: 146, width: 20, height: 24, rx: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('ellipse', { cx: 262, cy: 160, rx: 16, ry: 10, fill: '#E3B47A' });
  const G = k.buddy({ x: 150, y: FY });
  const pk = [0, 1].map(() => el('path', { d: 'M -7 0 L 7 0 L 5 10 Q 0 13 -5 10 Z', fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }));
  const th = cloud(k, 64, 46, 1);
  const w = wallet(k, th.g || th.c);
  const xm = mark(k, 'x', th.g || th.c, 1.2);
  const sw = [0, 1].map(() => drop(k));
  return {
    update(t) {
      const pat = t > 0.5 && t < 2.0;
      const ph = Math.sin(t * 14);
      const out = easeOut(seg(t, 1.9, 2.3));
      const head = easeOut(seg(t, 3.0, 3.4));
      P(G, { facing: 1, armR: pat ? 22 + 14 * ph : lerp(lerp(8, 30, out), 172, head), armL: pat ? 22 - 14 * ph : lerp(lerp(8, 30, out), 172, head),
        lean: pat ? 6 : -4 * head, look: pat ? Math.sin(t * 5) * 0.6 : 0.2, mood: t < 0.6 ? 'smile' : t < 3 ? 'open' : 'sad',
        squash: 1 - 0.05 * head, blink: blinkAt(t) });
      pk.forEach((p, i) => { tf(p, 150 + (i ? 20 : -20), FY - 30, 0, 1, Math.max(0.001, out)); p.setAttribute('opacity', out > 0 ? 1 : 0); });
      P(C, { facing: -1, armR: 8 + 40 * hump(seg(t, 0.1, 0.8)), look: 0.6, mood: t > 2.4 ? 'flat' : 'smile', blink: blinkAt(t, 1) });
      const s = seg(t, 2.3, 2.7);
      if (th.show) th.show(s, 96, 96); else tf(th.g, 96, 96, 0, Math.max(0.001, backOut(s)));
      sw.forEach((d, i) => { const q = ((t - 2.2 - i * 0.5) % 1) ; tf(d, 150 + (i ? 30 : -30), FY - 92 + q * 26); d.setAttribute('opacity', t > 2.2 + i * 0.5 && q < 0.8 ? 1 : 0); });
    }
  };
}
