// wipe off：机の上の水たまりを布でぬぐい取り、机のふちの外へ水を落とす（例文 She wiped off the water on the desk.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '机の水'], [1.2, '拭き取る'], [3.5, 'かわいた']] };

const hand = (b) => {
  const m = b.armR.hand.getCTM && b.armR.hand.getCTM();
  if (!m) return b.handPos('R');
  return { x: m.c * 26 + m.e, y: m.d * 26 + m.f };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 250, y: 44, width: 90, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 295, y1: 44, x2: 295, y2: 100, stroke: '#fff', 'stroke-width': 4 });
  // 机
  el('rect', { x: 84, y: 190, width: 9, height: 46, rx: 3, fill: pal.woodDark });
  el('rect', { x: 204, y: 188, width: 92, height: 48, rx: 4, fill: pal.wood });
  [194, 216].forEach((y) => { el('rect', { x: 210, y: y, width: 80, height: 17, rx: 3, fill: pal.woodDark, opacity: 0.4 }); el('rect', { x: 242, y: y + 6, width: 16, height: 4, rx: 2, fill: pal.yellowDark }); });
  k.shadow(190, 237, 118, 5);
  el('path', { d: 'M 112 160 L 268 160 L 302 188 L 78 188 Z', fill: '#EBD6B4' });
  el('path', { d: 'M 78 188 L 302 188 L 302 193 L 78 193 Z', fill: pal.wood });
  // ペン立てとノート
  el('rect', { x: 126, y: 146, width: 13, height: 15, rx: 3, fill: pal.violet });
  [[129, 138, 'red'], [134, 135, 'blue']].forEach(([x, y, c]) => el('line', { x1: x, y1: y + 12, x2: x + 2, y2: y, stroke: c === 'red' ? pal.red : pal.blueDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  el('path', { d: 'M 224 163 L 258 163 L 262 169 L 220 169 Z', fill: pal.green });
  // 水たまり（ふき取り範囲でクリップ）
  const mkClip = () => { let r; const id = k.clip((cp) => { r = el('rect', { x: 0, y: 150, width: 0, height: 50 }, cp); }); return { id, r }; };
  const cw = mkClip(), cf = mkClip();
  const water = g({ 'clip-path': cw.id });
  el('ellipse', { cx: 195, cy: 176, rx: 42, ry: 8, fill: pal.water }, water);
  el('path', { d: 'M 170 174 Q 185 170 200 173', stroke: '#fff', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }, water);
  [[150, 181, 2.5], [243, 171, 2], [160, 168, 1.8]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: pal.water }, water));
  const film = g({ 'clip-path': cf.id, opacity: 0.4 });
  el('ellipse', { cx: 195, cy: 176, rx: 44, ry: 9, fill: pal.water }, film);
  const b = k.buddy({ x: 70, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  const cloth = g({});
  el('rect', { x: -10, y: -6, width: 22, height: 11, rx: 4, fill: '#9CC4F8' }, cloth);
  const wet = el('rect', { x: -10, y: -6, width: 22, height: 11, rx: 4, fill: pal.blueDark }, cloth);
  const drops = [0, 1, 2].map(() => el('ellipse', { rx: 2.4, ry: 3.4, fill: pal.water }));
  const splash = [0, 1, 2].map(() => el('ellipse', { rx: 4, ry: 1.5, fill: pal.water }));
  const star = g({});
  el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, star);

  const off = (a) => (27 + 26 * Math.sin((a * Math.PI) / 180)) * 0.85;
  const X0 = 118, X1 = 302;
  const p1 = (t) => lerp(X0, X1, easeInOut(seg(t, 0.65, 1.75)));
  const p2 = (t) => lerp(X1, X0, easeInOut(seg(t, 2.25, 3.2)));
  return {
    update(t) {
      let xc = X0, arm = 20;
      const m1 = t > 0.65 && t < 1.75, m2 = t > 2.25 && t < 3.2;
      if (t < 0.65) arm = lerp(20, 135, easeOut(seg(t, 0.1, 0.5)));
      else if (t < 2.25) { arm = 135; xc = p1(t); }
      else if (t < 3.3) { arm = 135; xc = p2(t); }
      else { arm = lerp(135, 12, easeInOut(seg(t, 3.3, 3.8))); xc = X0; }
      const wig = m1 || m2 ? Math.sin(t * 22) * 4 : 0;
      b.pose({ x: arm > 100 ? xc + wig - off(arm) : 70, armR: arm, armL: 8, walk: m1 || m2 ? t * 8 : 0, mood: t > 3.4 ? 'grin' : 'smile', look: 0.5 });
      const h = hand(b);
      tf(cloth, h.x, h.y + 2);
      wet.setAttribute('opacity', 0.9 * seg(t, 0.7, 1.7));
      // 水たまり：布の前に残り、後ろはうすい水膜
      const a = p1(t), c = p2(t);
      cw.r.setAttribute('x', Math.max(150, a)); cw.r.setAttribute('width', Math.max(0, 250 - Math.max(150, a)));
      cf.r.setAttribute('x', 150);
      const filmW = t < 2.25 ? Math.max(0, Math.min(a, 250) - 150) : Math.max(0, Math.min(c, 250) - 150);
      cf.r.setAttribute('width', filmW);
      // 机のふちから落ちるしずく
      drops.forEach((d, i) => {
        const t0 = 1.5 + i * 0.13, u = t - t0;
        const y = 192 + 650 * u * u * 0.5;
        const on = u > 0 && y < 232;
        d.setAttribute('opacity', on ? 1 : 0);
        d.setAttribute('cx', 303 + i * 3); d.setAttribute('cy', y);
        const sp = seg(t, t0 + 0.27, t0 + 0.55);
        splash[i].setAttribute('opacity', u > 0.27 ? (1 - sp) * 0.9 : 0);
        splash[i].setAttribute('cx', 303 + i * 3); splash[i].setAttribute('cy', 233);
        splash[i].setAttribute('rx', 3 + 7 * sp);
      });
      const q = seg(t, 3.4, 4.1);
      tf(star, 190, 168 - 8 * q, q * 90, 0.2 + hump(q));
      star.setAttribute('opacity', q > 0 && q < 1 ? 1 : 0);
    }
  };
}
