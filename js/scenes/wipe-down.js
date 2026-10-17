// wipe down：布でテーブルの天板全体を、奥から手前へ往復して拭き上げる（例文 He wiped down the table with a cloth.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, 'よごれた机'], [1.4, '全体を拭く'], [4.0, 'ぴかぴか']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 150, y: 36, width: 100, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 200, y1: 36, x2: 200, y2: 98, stroke: '#fff', 'stroke-width': 4 });
  // テーブル
  [[82, 188], [318, 188]].forEach(([x]) => el('rect', { x: x - 5, y: 186, width: 10, height: 50, rx: 3, fill: pal.woodDark }));
  el('rect', { x: 62, y: 186, width: 276, height: 12, rx: 3, fill: pal.woodDark });
  k.shadow(200, 237, 150, 6);
  el('path', { d: 'M 96 160 L 304 160 L 342 188 L 58 188 Z', fill: '#EBD6B4' });
  el('path', { d: 'M 58 188 L 342 188 L 342 193 L 58 193 Z', fill: pal.wood });
  // よごれ
  const dirt = [[140, 167, 11, 4], [206, 165, 9, 3.5], [266, 168, 12, 4], [262, 179, 12, 4.5], [194, 181, 14, 4.5], [124, 178, 10, 4]].map(([x, y, rx, ry]) => {
    const e = el('ellipse', { cx: x, cy: y, rx, ry, fill: pal.coffee, opacity: 0.55 });
    return { e, x };
  });
  const topClip = k.clip((cp) => el('path', { d: 'M 96 160 L 304 160 L 342 188 L 58 188 Z' }, cp));
  const gl = g({ 'clip-path': topClip });
  const gloss = el('rect', { x: 0, y: 161, width: 0, height: 11, fill: '#fff', opacity: 0.55 }, gl);
  const gloss2 = el('rect', { x: 0, y: 172, width: 0, height: 16, fill: '#fff', opacity: 0.55 }, gl);
  const b = k.buddy({ x: 64, y: FY, scale: 0.85 });
  const cloth = g({});
  el('rect', { x: -10, y: -6, width: 22, height: 11, rx: 4, fill: pal.blue }, cloth);
  el('rect', { x: -10, y: 1, width: 22, height: 4, rx: 2, fill: pal.blueDark }, cloth);
  const stars = [0, 1, 2].map(() => {
    const s = g({});
    el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, s);
    return s;
  });

  const off = (a) => (27 + 26 * Math.sin((a * Math.PI) / 180)) * 0.85;
  function state(t) {
    let xc = 95, arm = 20;
    const rowA = seg(t, 0.55, 2.0), rowB = seg(t, 2.35, 3.8);
    if (t < 0.55) { arm = lerp(20, 160, easeOut(seg(t, 0.1, 0.5))); }
    else if (t < 2.35) { arm = 160; xc = lerp(95, 300, easeInOut(rowA)); if (t > 2.0) arm = lerp(160, 125, easeInOut(seg(t, 2.0, 2.35))); xc = t > 2.0 ? 300 : xc; }
    else if (t < 3.8) { arm = 125; xc = lerp(300, 95, easeInOut(rowB)); }
    else { arm = lerp(125, 12, easeInOut(seg(t, 3.8, 4.2))); xc = 95; }
    const wig = (t > 0.6 && t < 2.0) || (t > 2.4 && t < 3.8) ? Math.sin(t * 24) * 5 : 0;
    return { xc, arm, wig, moving: (t > 0.6 && t < 2.0) || (t > 2.4 && t < 3.8) };
  }
  return {
    update(t) {
      const s = state(t);
      const bx = s.arm > 100 ? s.xc + s.wig - off(s.arm) : 64;
      b.pose({ x: bx, armR: s.arm, armL: 8, walk: s.moving ? t * 8 : 0, mood: t > 3.9 ? 'grin' : 'smile', look: 0.5 });
      const h = hand(b);
      tf(cloth, h.x, h.y + 2, 0, 1, 1);
      const x1 = lerp(95, 300, easeInOut(seg(t, 0.55, 2.0)));
      const x2 = lerp(300, 95, easeInOut(seg(t, 2.35, 3.8)));
      gloss.setAttribute('x', 62); gloss.setAttribute('width', Math.max(0, Math.min(x1 + 10, 340) - 62 + (x1 > 299 ? 40 : 0)) * (t > 0.55 ? 1 : 0));
      gloss2.setAttribute('x', Math.max(58, x2 - 10 - (x2 < 96 ? 40 : 0))); gloss2.setAttribute('width', Math.max(0, 342 - Math.max(58, x2 - 10 - (x2 < 96 ? 40 : 0))) * (t > 2.35 ? 1 : 0));
      dirt.forEach((d, i) => {
        const v = i < 3 ? 1 - seg(x1, d.x - 8, d.x + 8) : seg(x2, d.x - 8, d.x + 8);
        d.e.setAttribute('opacity', 0.55 * v);
      });
      [[130, 170], [210, 177], [275, 168]].forEach(([x, y], i) => {
        const q = seg(t, 3.85 + i * 0.12, 4.5 + i * 0.05);
        tf(stars[i], x, y - 10 * q, q * 90, 0.2 + hump(q));
        stars[i].setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
      });
    }
  };
}
