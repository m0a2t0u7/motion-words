// ambulance：事故現場でまめがけが人のそばから手を振り、サイレンを光らせた救急車が5分で到着して止まる（例文 An ambulance arrived at the scene of the accident within five minutes.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';
import { streetBg } from './weigh.js';
import { car } from './pull-up.js';

// 救急車（右向き、原点＝地面中央）。update(x, dist, pitch, flash)
export function ambulanceVan(k) {
  const { el, g, tf, pal } = k;
  const o = g({}), sh = k.shadow(0, 2, 80, 6, o), body = g({}, o);
  el('rect', { x: -74, y: -96, width: 106, height: 80, rx: 7, fill: '#FFFFFF', stroke: '#D3DAE3', 'stroke-width': 2 }, body);
  el('path', { d: 'M 30 -74 L 52 -74 Q 60 -74 64 -66 L 74 -44 Q 76 -40 76 -34 L 76 -16 L 30 -16 Z', fill: '#fff', stroke: '#D3DAE3', 'stroke-width': 2 }, body);
  el('path', { d: 'M 38 -68 L 52 -68 Q 56 -68 58 -64 L 66 -46 L 38 -46 Z', fill: '#BFE0F2' }, body);
  el('rect', { x: -74, y: -44, width: 150, height: 8, fill: pal.red }, body);
  el('rect', { x: -32, y: -84, width: 12, height: 34, rx: 2, fill: pal.red }, body);
  el('rect', { x: -43, y: -73, width: 34, height: 12, rx: 2, fill: pal.red }, body);
  el('rect', { x: 70, y: -32, width: 6, height: 7, rx: 2, fill: '#FFF3C4' }, body);
  el('rect', { x: -6, y: -104, width: 30, height: 9, rx: 3, fill: '#C9D2DE' }, body);
  const lr = el('rect', { x: -6, y: -104, width: 15, height: 9, rx: 3, fill: pal.red }, body);
  const lb = el('rect', { x: 9, y: -104, width: 15, height: 9, rx: 3, fill: pal.blue }, body);
  const halo = el('circle', { cx: 9, cy: -100, r: 22, fill: pal.red, opacity: 0 }, body);
  const wheels = [-46, 46].map((x) => { const w = g({}, o); el('circle', { r: 13, fill: pal.ink }, w); el('circle', { r: 5, fill: '#C9CED8' }, w); el('rect', { x: -1.5, y: -11, width: 3, height: 7, fill: '#C9CED8' }, w); return { w, x }; });
  return {
    g: o,
    update(x, y, dist, pitch, flash) {
      tf(o, x, y);
      wheels.forEach((w) => tf(w.w, w.x, -13, (dist / 13) * 57.3));
      body.setAttribute('transform', `rotate(${pitch.toFixed(2)} 50 0)`);
      const on = Math.sin(flash) > 0;
      lr.setAttribute('opacity', on ? 1 : 0.35); lb.setAttribute('opacity', on ? 0.35 : 1);
      k.set(halo, { fill: on ? pal.red : pal.blue, opacity: 0.18 + 0.1 * Math.abs(Math.sin(flash)) });
    }
  };
}

export const meta = { duration: 4.2, beats: [[0, '事故が起きた'], [1.0, '救急車が来る'], [3.0, '5分で到着']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 236);
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#DCE1E8' });
  for (let x = 10; x < 400; x += 60) el('rect', { x, y: FY + 28, width: 30, height: 4, fill: '#fff' });
  // 事故：電柱にぶつかった車
  el('rect', { x: 382, y: FY - 140, width: 10, height: 150, fill: '#9AA4B4' });
  const c = car(k, { color: pal.blue, dark: pal.blueDark, driver: false });
  c.update(330, FY + 22, 0, 4, 0.8);
  const smoke = [0, 1, 2].map(() => el('circle', { r: 8, fill: '#C9D0DA' }));
  // けが人と、そばで手を振るまめ
  const hurt = k.buddy({ x: 268, y: FY + 34, scale: 0.72, facing: -1, color: pal.coral, dark: pal.coralDark });
  const b = k.buddy({ x: 224, y: FY + 36, scale: 0.84, facing: -1 });
  const amb = ambulanceVan(k);
  // ストップウォッチ（0→5分）
  const sw = g({}); tf(sw, 46, 46);
  el('circle', { r: 26, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, sw);
  el('rect', { x: -5, y: -36, width: 10, height: 8, rx: 2, fill: pal.ink }, sw);
  const sector = el('path', { fill: pal.coral, opacity: 0.55 }, sw);
  const hand = el('line', { x1: 0, y1: 0, x2: 0, y2: -20, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, sw);
  const lab = k.text(46, 88, '0 min', { 'font-size': 14 });
  const ax = (t) => lerp(-110, 98, easeOut(seg(t, 0.7, 3.0)));
  return {
    update(t) {
      const m = 5 * easeInOut(seg(t, 0.3, 3.0)), a = (m / 60) * Math.PI * 2 * 6;
      k.set(sector, { d: `M 0 0 L 0 -21 A 21 21 0 ${a > Math.PI ? 1 : 0} 1 ${21 * Math.sin(a)} ${-21 * Math.cos(a)} Z` });
      hand.setAttribute('transform', `rotate(${(a * 57.3).toFixed(1)})`);
      lab.textContent = `${Math.round(m)} min`;
      const stop = wobble(seg(t, 3.0, 3.8), 1.5, 5);
      amb.update(ax(t), FY + 22, ax(t) + 110, -2.5 * stop, t * 12);
      smoke.forEach((s, i) => { const q = (t * 0.5 + i / 3) % 1; k.set(s, { cx: 380 + 6 * Math.sin(q * 6 + i), cy: FY - 10 - q * 46, r: 5 + 8 * q, opacity: 0.6 * (1 - q) }); });
      hurt.pose({ squash: 0.86, lean: -6, mood: 'sad', armR: 40, armL: 20, look: -0.4, blink: t % 2.2 > 2.05 ? 1 : 0 });
      const wave = t < 3.0 ? 150 + 22 * Math.sin(t * 10) : lerp(150, 60, easeInOut(seg(t, 3.0, 3.5)));
      b.pose({ armR: wave, armL: 30, lean: 4, mood: t > 3.1 ? 'smile' : 'open', look: 0.7, squash: 0.95 + 0.03 * Math.sin(t * 10) * (t < 3 ? 1 : 0) });
    }
  };
}
