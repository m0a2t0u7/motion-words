// in general：時計の針がぐるぐる進む間、部屋のあちこちの猫たちはほとんどずっと寝ている。それを見てうなずく（例文 In general, cats sleep a lot.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, sofa, clock } from './run-after.js';
import { roomBg } from './look-over.js';

// 丸まって眠る猫（原点＝接地中央）。set(breath, awake)
export function cat(k, col, dark, parent) {
  const { el, g, tf, pal } = k;
  const o = g({}, parent);
  k.shadow(0, 0, 24, 4, o);
  const body = g({}, o);
  el('path', { d: 'M 22 -4 Q 34 -6 28 -20', stroke: dark, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, body);
  el('ellipse', { cx: 2, cy: -12, rx: 24, ry: 13, fill: col }, body);
  const head = g({}, body);
  el('circle', { cx: 0, cy: 0, r: 11, fill: col }, head);
  el('path', { d: 'M -9 -5 L -8 -15 L -2 -9 Z M 9 -5 L 8 -15 L 2 -9 Z', fill: col }, head);
  const eyes = el('path', { d: 'M -6 1 Q -4 3 -2 1 M 2 1 Q 4 3 6 1', stroke: pal.ink, 'stroke-width': 1.6, fill: 'none' }, head);
  const open = g({}, head);
  el('circle', { cx: -4, cy: 1, r: 1.8, fill: pal.ink }, open); el('circle', { cx: 4, cy: 1, r: 1.8, fill: pal.ink }, open);
  el('path', { d: 'M -1.5 4 L 1.5 4 L 0 5.5 Z', fill: pal.coralDark }, head);
  return { g: o, set(x, y, br, awake = 0, s = 1) { tf(o, x, y, 0, s); tf(body, 0, 0, 0, 1 + 0.03 * br, 1 - 0.04 * br + 0.0); tf(head, -18, -10 - 8 * awake, 0); eyes.setAttribute('opacity', awake > 0.5 ? 0 : 1); open.setAttribute('opacity', awake > 0.5 ? 1 : 0); } };
}

export const meta = { duration: 4.4, beats: [[0, '猫たち'], [1.4, '時間がたっても'], [3.2, 'よく寝る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const C = clock(k, 200, 46, 18);
  el('rect', { x: 40, y: 116, width: 84, height: 8, rx: 3, fill: '#fff' });
  const so = sofa(k, 300, FY, 130);
  so.front();
  el('ellipse', { cx: 150, cy: FY + 8, rx: 60, ry: 10, fill: '#F1D9CF' });
  // 箱
  el('rect', { x: 330, y: FY - 108, width: 0, height: 0 });
  const cats = [[82, 116, '#F2B880', '#C98B4F', 0.8], [300, FY - 30, '#8A8F9C', '#5F6573', 0.9], [150, FY + 6, '#fff', '#C9CED8', 1], [228, FY + 2, '#3D4250', '#272B35', 0.85]].map(([x, y, c, d, s]) => ({ c: cat(k, c, d), x, y, s }));
  const b = k.buddy({ x: 50, y: FY, facing: 1, scale: 0.9 });
  const zs = cats.map(() => [0, 1].map(() => k.text(0, 0, 'z', { 'font-size': 13, fill: pal.sub })));
  return {
    update(t) {
      const hrs = 22 + 10 * easeInOut(seg(t, 0.2, 3.4));
      C.set(Math.floor(hrs) % 12, (hrs % 1) * 60);
      cats.forEach((o, i) => {
        // 1匹だけ一瞬顔を上げて、またすぐ寝る
        const aw = i === 3 ? hump(seg(t, 1.6, 2.3)) : 0;
        o.c.set(o.x, o.y, Math.sin(t * 2.6 + i * 1.3), aw, o.s);
        zs[i].forEach((z, j) => { const q = (t * 0.6 + j * 0.5 + i * 0.27) % 1; tf(z, o.x - 18 * o.s + 10 * q, o.y - 30 * o.s - 26 * q); z.setAttribute('opacity', aw > 0.3 ? 0 : 1 - q); });
      });
      const nod = seg(t, 3.2, 4.2);
      const nd = nod > 0 && nod < 1 ? Math.max(0, Math.sin(nod * Math.PI * 3)) : 0;
      const look = t < 3.2 ? Math.sin(t * 1.2) * 0.8 : 0.4;
      P(b, { x: 50, facing: 1, look, lean: 8 * nd, mood: t > 3.2 ? 'grin' : 'smile', armR: 20, armL: 8, blink: blinkAt(t) });
    }
  };
}
