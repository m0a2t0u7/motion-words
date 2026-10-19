// star：夜の丘に座った2人が、空の星を指さして1つずつ数える（例文 We counted the stars in the sky.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { nightBg, tufts, P, blinkAt, point, popIn } from './nature.js';

export function starShape(k, r = 9, fill = '#FFE27A', parent) {
  const pts = [];
  for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; pts.push(`${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`); }
  return k.el('path', { d: 'M ' + pts.join(' L ') + ' Z', fill, 'stroke-linejoin': 'round' }, parent);
}

export const meta = { duration: 4.4, beats: [[0, '星空を見る'], [1.0, '1つ、2つ…'], [3.6, '5つ数えた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.9;
  const { FY } = nightBg(k, { FY: 244, n: 14 });
  el('path', { d: `M 0 ${FY - 6} Q 200 ${FY - 40} 400 ${FY - 6} V 300 H 0 Z`, fill: '#3D5A4E' });
  const SP = [[90, 60], [150, 36], [215, 70], [280, 40], [340, 82]];
  const st = SP.map(([x, y], i) => { const n = g({}); starShape(k, 10, '#FFE27A', n); const num = k.text(0, 20, String(i + 1), { 'font-size': 13, fill: '#fff' }, n); return { n, num, x, y }; });
  const SY = FY - 18;
  const a = k.buddy({ x: 170, y: SY, scale: S });
  const c = k.buddy({ x: 238, y: SY, scale: S * 0.95, color: pal.coral, dark: pal.coralDark, facing: -1 });
  el('path', { d: `M 120 ${SY + 2} Q 200 ${SY - 12} 290 ${SY + 2} V 300 H 120 Z`, fill: '#3D5A4E' });
  tufts(k, SY - 4, 130, 280, '#4E7363', 10);
  const T0 = 0.9, DT = 0.6;
  return {
    update(t) {
      const i = clamp(Math.floor((t - T0) / DT), 0, 4), q = seg(t - T0 - i * DT, 0, DT);
      const tgt = t < T0 ? SP[0] : SP[i];
      const pt = easeInOut(seg(t, 0.4, 0.9)) * (1 - easeInOut(seg(t, 3.9, 4.3)));
      P(a, { y: SY, look: 0.5, lean: -6, mood: t > 3.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      a.body.children[3].setAttribute('transform', 'translate(3 -4)');
      const prev = i > 0 && q < 0.4 ? SP[i - 1] : tgt, mv = easeInOut(seg(q, 0, 0.4));
      const tx = lerp(prev[0], tgt[0], i > 0 && q < 0.4 ? mv : 1), ty = lerp(prev[1], tgt[1], i > 0 && q < 0.4 ? mv : 1);
      a.pose({ armR: lerp(8, point(a, S, 'R', tx, ty), pt) });
      P(c, { y: SY, facing: 1, look: 0.4, lean: -6, mood: t > 3.8 ? 'grin' : 'open', blink: blinkAt(t, 1), armL: 20, armR: 30 + 10 * Math.sin(t * 5) * seg(t, 3.7, 4) });
      c.body.children[3].setAttribute('transform', 'translate(2 -4)');
      st.forEach((s, j) => {
        const on = seg(t, T0 + j * DT + 0.3, T0 + j * DT + 0.6), tw = 1 + 0.08 * Math.sin(t * 7 + j);
        tf(s.n, s.x, s.y, 0, (0.7 + 0.5 * popIn(on) * (on > 0 ? 1 : 0)) * tw);
        s.num.setAttribute('opacity', on > 0 ? 1 : 0);
      });
    }
  };
}
