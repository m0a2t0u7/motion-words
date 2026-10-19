// disease：医者が心臓の図を指す。血管がつまって心臓が弱り、多くの人の心臓に同じ印がつく（例文 Heart disease is a serious problem for many people.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble, backOut } from '../ease.js';
import { P, reach, coat, clinicBg } from './hospital.js';

export const meta = { duration: 4.4, beats: [[0, '心臓の図'], [1.2, '血管がつまる'], [2.8, '多くの人の問題']] };

const HEART = 'M 0 14 C -26 -2 -19 -26 0 -12 C 19 -26 26 -2 0 14 Z';

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = clinicBg(k, 240);
  // 掲示ボード
  el('rect', { x: 128, y: 24, width: 260, height: 150, rx: 8, fill: '#fff', stroke: '#B8C3D2', 'stroke-width': 3 });
  // 大きな心臓（左）
  const HX = 186, HY = 82;
  const hg = g({});
  const vessel = el('path', { d: 'M 6 -16 Q 10 -34 26 -38', fill: 'none', stroke: '#E86F57', 'stroke-width': 7, 'stroke-linecap': 'round' }, hg);
  const plaque = el('circle', { cx: 12, cy: -30, r: 0.1, fill: pal.yellowDark }, hg);
  const body = el('path', { d: HEART, fill: pal.red, transform: 'scale(1.6)' }, hg);
  el('ellipse', { cx: -16, cy: -14, rx: 6, ry: 9, fill: '#fff', opacity: 0.3 }, hg);
  const crack = el('path', { d: 'M 2 -18 L -6 -4 L 4 4 L -4 16', fill: 'none', stroke: '#7A2A22', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 50, 'stroke-dashoffset': 50 }, hg);
  // 心電図
  const ecg = el('path', { fill: 'none', stroke: pal.green, 'stroke-width': 2.5, 'stroke-linejoin': 'round' });
  const warn = g({});
  el('path', { d: 'M 0 -14 L 13 9 L -13 9 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' }, warn);
  k.text(0, 2, '!', { 'font-size': 14, fill: pal.ink }, warn);
  // 多くの人（右）
  const ppl = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = 272 + c * 28, y = 62 + r * 36;
    const p = g({}); tf(p, x, y);
    const col = [pal.blue, pal.yellow, pal.violet, pal.coral][(r + c) % 4];
    el('circle', { cy: -8, r: 6, fill: col }, p);
    el('rect', { x: -7, y: -1, width: 14, height: 14, rx: 6, fill: col }, p);
    const m = g({}, p); tf(m, 0, 4, 0, 0.001);
    el('path', { d: HEART, fill: pal.red, stroke: '#fff', 'stroke-width': 3, transform: 'scale(0.36)' }, m);
    el('path', { d: 'M 1 -4 L -2 0 L 1 2 L -1 5', stroke: '#7A2A22', 'stroke-width': 1.4, fill: 'none' }, m);
    ppl.push({ p, m, sick: [0, 2, 3, 5, 6, 8, 9, 11].includes(r * 4 + c) });
  }
  const doc = k.buddy({ x: 78, y: FY, scale: 0.98 });
  coat(k, doc);
  return {
    update(t) {
      const bad = easeInOut(seg(t, 1.2, 2.3));
      // 心臓の鼓動：最初は規則正しく、つまると弱く乱れる
      const per = lerp(0.8, 0.55, bad), ph = (t % per) / per;
      const beat = 1 + lerp(0.1, 0.04, bad) * hump(seg(ph, 0, 0.3)) + (bad > 0.5 ? 0.03 * Math.sin(t * 31) : 0);
      tf(hg, HX, HY, bad * -4, beat);
      k.set(body, { fill: bad > 0 ? `rgb(${Math.round(lerp(242, 176, bad))},${Math.round(lerp(104, 86, bad))},${Math.round(lerp(91, 98, bad))})` : pal.red });
      k.set(plaque, { r: 0.1 + 5 * bad });
      crack.setAttribute('stroke-dashoffset', (50 * (1 - easeOut(seg(t, 2.0, 2.5)))).toFixed(1));
      let d = 'M 140 150';
      for (let x = 0; x <= 100; x += 2) {
        const u = ((x + t * 60) % 33) / 33;
        const n = bad > 0.4 ? Math.sin(x * 1.7 + t * 9) * 5 * bad : 0;
        const y = 150 - (u > 0.4 && u < 0.5 ? -18 * Math.sin((u - 0.4) * 31.4) * (1 - 0.6 * bad) : 0) + n;
        d += ` L ${140 + x} ${y.toFixed(1)}`;
      }
      k.set(ecg, { d, stroke: bad > 0.5 ? pal.red : pal.green });
      tf(warn, 236, 44, 0, Math.max(0.001, backOut(seg(t, 2.2, 2.5))));
      // 人々に印
      ppl.forEach((o, i) => {
        tf(o.m, 0, 4, 0, o.sick ? Math.max(0.001, backOut(seg(t, 2.8 + i * 0.09, 3.1 + i * 0.09))) : 0.001);
      });
      // 医者：心臓を指し、次に人々を指す
      const to = easeInOut(seg(t, 2.6, 3.1));
      const tx = lerp(HX - 30, 300, to), ty = lerp(HY + 10, 110, to);
      P(doc, { look: 0.6, mood: t > 2.2 ? 'flat' : 'smile', lean: -2 });
      P(doc, { ...doc.state, armR: lerp(reach(doc, 0.98, 'R', tx, ty), 172, 0) });
      P(doc, { ...doc.state, armR: Math.min(175, doc.state.armR) });
    }
  };
}
