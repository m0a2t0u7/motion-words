// put up：日が沈む前に、二人でポールを立ててテントを張る（例文 We put up the tent before dark.）
import { seg, lerp, easeInOut, easeOut, wobble, clamp } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, 'たたんだテント'], [1.6, 'ポールを立てる'], [3.6, 'テントが立った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#BFE3F7'], [1, '#FCE6D6']]) });
  const dusk = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#F4A77A'], [1, '#FCD9B8']]) });
  const sun = el('circle', { cx: 330, cy: 0, r: 20, fill: '#FFC46B' });
  el('path', { d: 'M 0 190 Q 120 140 240 186 T 400 176 L 400 236 L 0 236 Z', fill: '#8FB89C' });
  const FY = 236;
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#A9C59A' });
  const TX = 200;
  const tsh = k.shadow(TX, FY + 1, 80, 6);
  // テント：棟の高さ h で形が決まる
  const tent = el('path', { fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, 'stroke-linejoin': 'round' });
  const doorP = el('path', { fill: '#C98A2A' });
  const pole = el('line', { stroke: '#6C7488', 'stroke-width': 4, 'stroke-linecap': 'round' });
  const pegs = [TX - 80, TX + 80].map((x) => el('path', { d: `M ${x - 3} ${FY - 6} L ${x + 3} ${FY - 6} L ${x} ${FY + 4} Z`, fill: '#6C7488' }));
  const A = k.buddy({ x: 92, y: FY, scale: 0.75 });
  const C = k.buddy({ x: 312, y: FY, scale: 0.75, facing: -1, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      const ev = seg(t, 0.4, 4.2);
      dusk.setAttribute('opacity', ev);
      k.set(sun, { cy: lerp(60, 200, ev) });
      // ポールを起こす→布を引き上げる→ペグで留める
      const up = easeInOut(seg(t, 0.6, 2.4));
      const settle = wobble(seg(t, 2.4, 3.0), 2, 5);
      const h = lerp(6, 96, up) + settle * 4;
      const sag = lerp(30, 0, up);
      k.set(tent, { d: `M ${TX - 80} ${FY} Q ${TX - 40} ${FY - h * 0.5 + sag} ${TX} ${FY - h} Q ${TX + 40} ${FY - h * 0.5 + sag} ${TX + 80} ${FY} Z` });
      k.set(doorP, { d: `M ${TX - 16} ${FY} L ${TX} ${FY - h * 0.6} L ${TX + 16} ${FY} Z`, opacity: up > 0.5 ? 1 : 0 });
      k.set(pole, { x1: TX, y1: FY, x2: TX, y2: FY - h - 6, opacity: up > 0 ? 1 : 0 });
      tsh.setAttribute('rx', lerp(60, 86, up));
      pegs.forEach((p, i) => { const u = easeOut(seg(t, 2.8 + i * 0.3, 3.1 + i * 0.3)); p.setAttribute('transform', `translate(0 ${lerp(-14, 0, u)})`); p.setAttribute('opacity', t > 2.7 + i * 0.3 ? 1 : 0); });
      // A は棟（ポールの先）を持ち上げ、C は布の端を引く
      const top = { x: TX - 6, y: FY - h };
      const ax = lerp(92, 150, easeInOut(seg(t, 0.2, 0.7)));
      A.pose({ x: ax, armR: t < 2.6 ? reach(A, 0.75, 'R', top.x, top.y) : lerp(reach(A, 0.75, 'R', top.x, top.y), 140, easeOut(seg(t, 3.4, 3.8))), armL: t < 2.6 ? reach(A, 0.75, 'L', top.x, top.y + 6) : 12, lean: 4, mood: t > 3.4 ? 'grin' : 'flat', look: 0.6, lift: 4 * Math.sin(seg(t, 1.4, 2.2) * Math.PI) });
      const pull = t < 2.6 ? 0 : 1;
      C.pose({ x: lerp(312, 290, easeInOut(seg(t, 2.4, 2.8))), armR: t < 2.6 ? reach(C, 0.75, 'R', TX + 60, FY - h * 0.3) : t < 3.5 ? reach(C, 0.75, 'R', TX + 80, FY - 8) : lerp(30, 140, easeOut(seg(t, 3.5, 3.9))), armL: 12, lean: t > 2.6 && t < 3.5 ? 26 : 0, mood: t > 3.5 ? 'grin' : 'flat', look: 0.6, squash: 1 - 0.06 * pull * (t < 3.5 ? 1 : 0) });
    }
  };
}
