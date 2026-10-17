// jump on the bandwagon：楽隊の馬車が進み、見ていた人たちが次々に走って飛び乗る（Many people jumped on the bandwagon.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '馬車が来る'], [1.3, '飛び乗る'], [3.4, 'みんなで']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  [[300, 70], [60, 90]].forEach(([x, h]) => { el('rect', { x, y: 150 - h * 0.3, width: 80, height: FY - 150 + h * 0.3, fill: '#EDE3D6' }); el('rect', { x: x + 14, y: 170, width: 18, height: 22, rx: 3, fill: '#DDEFFA' }); el('rect', { x: x + 48, y: 170, width: 18, height: 22, rx: 3, fill: '#DDEFFA' }); });
  el('rect', { x: 0, y: FY + 14, width: 400, height: 56, fill: '#E4E8EE' });
  const DECK = FY - 30;
  const wx = (t) => 215 + 30 * easeInOut(seg(t, 0, 4.4));
  const wag = g({});
  k.shadow(0, FY + 2, 80, 6, wag);
  // 後ろの旗竿と飾り
  const flag = el('path', { d: '', fill: pal.red }, wag);
  el('rect', { x: -60, y: DECK - 88, width: 4, height: 88, rx: 2, fill: pal.ink }, wag);
  const wheels = [-42, 42].map((x) => { const w = g({}, wag); tf(w, x, FY - 18); el('circle', { r: 20, fill: pal.woodDark }, w); el('circle', { r: 14, fill: pal.wood }, w); for (let i = 0; i < 4; i++) el('line', { x1: 0, y1: -14, x2: 0, y2: 14, stroke: pal.woodDark, 'stroke-width': 3, transform: `rotate(${i * 45})` }, w); el('circle', { r: 4, fill: pal.ink }, w); return w; });
  el('rect', { x: -70, y: DECK, width: 140, height: 14, rx: 5, fill: pal.blue }, wag);
  el('rect', { x: -70, y: DECK + 10, width: 140, height: 5, fill: pal.blueDark }, wag);
  const buddies = [
    { c: pal.mint, d: pal.mintDark, sx: 70, tr: 0.7, off: -20 },
    { c: pal.coral, d: pal.coralDark, sx: 40, tr: 1.5, off: 18 },
    { c: pal.violet, d: '#8A6FDB', sx: 14, tr: 2.3, off: -44 }
  ].map((o) => ({ ...o, b: k.buddy({ x: o.sx, y: FY, color: o.c, dark: o.d }) }));
  const drummer = k.buddy({ x: 0, y: DECK, color: pal.yellow, dark: pal.yellowDark, facing: -1 });
  const wagF = g({});
  const drum = el('rect', { x: 36, y: DECK - 22, width: 22, height: 22, rx: 4, fill: pal.red }, wagF);
  const notes = [0, 1].map(() => el('path', { d: 'M 0 0 v -14 q 8 2 6 8', stroke: pal.ink, 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, wagF));
  const bunt = [0, 1, 2, 3, 4].map((i) => el('path', { d: `M ${-52 + i * 26} ${DECK - 64} l 8 14 l 8 -14 Z`, fill: [pal.yellow, pal.coral, pal.green, pal.violet, pal.yellow][i] }, wag));
  el('path', { d: `M -56 ${DECK - 64} Q 0 ${DECK - 50} 56 ${DECK - 64}`, stroke: pal.ink, 'stroke-width': 1.5, fill: 'none' }, wag);
  return {
    update(t) {
      const X = wx(t);
      tf(wag, X, 0);
      tf(wagF, X - 60, 0);
      wheels.forEach((w) => tf(w, w === wheels[0] ? -42 : 42, FY - 18, (X - 215) * 3.2));
      let fd = `M -56 ${DECK - 88}`;
      fd += ` q 14 ${-4 + 3 * Math.sin(t * 6)} 28 2 t 0 0`;
      flag.setAttribute('d', `M -56 ${DECK - 88} q 16 ${-6 + 4 * Math.sin(t * 6)} 32 0 l -6 8 l 6 8 q -16 ${-6 + 4 * Math.sin(t * 6 + 1)} -32 0 Z`);
      const beat = Math.abs(Math.sin(t * 8));
      drummer.pose({ x: X + 50, y: DECK, armR: 70 + 30 * beat, armL: 10, mood: 'grin', look: -0.3, squash: 1 - 0.02 * beat });
      tf(drum, 0, 0);
      notes.forEach((n, i) => { const p = (t * 0.6 + i * 0.5) % 1; tf(n, X + 20 + i * 16 + 8 * p, DECK - 60 - 40 * p, 0, 1); n.setAttribute('opacity', Math.sin(p * Math.PI)); });
      buddies.forEach((o, i) => {
        const T0 = o.tr, JT = 0.55;
        const launchX = (tt) => wx(tt) - 80;
        let x, y = FY, walk = 0, lift = 0, armL = 10, armR = 10, lean = 0, squash = 1, mood = 'smile';
        if (t < T0) {
          // 見ている：馬車を目で追い、足踏み
          x = o.sx; armR = 10 + 8 * Math.sin(t * 5 + i); mood = 'open';
        } else if (t < T0 + 0.5) {
          const p = easeInOut(seg(t, T0, T0 + 0.5));
          x = lerp(o.sx, launchX(T0 + 0.5), p); walk = t * 16; lean = 12; armL = 40 + 40 * Math.sin(t * 16); armR = 40 - 40 * Math.sin(t * 16); mood = 'open';
        } else if (t < T0 + 0.5 + JT) {
          const p = seg(t, T0 + 0.5, T0 + 0.5 + JT);
          x = lerp(launchX(T0 + 0.5), wx(t) + o.off, easeOut(p));
          y = lerp(FY, DECK, p * p * 0.4 + p * 0.6) - 64 * Math.sin(Math.PI * p); armL = armR = 150; lean = 4; mood = 'grin';
          squash = 1 + 0.04 * Math.sin(Math.PI * p);
        } else {
          const p = seg(t, T0 + 0.5 + JT, T0 + 0.5 + JT + 0.9);
          x = wx(t) + o.off; y = DECK; mood = 'grin';
          squash = 1 - 0.1 * Math.exp(-p * 6) * Math.cos(p * 18);
          armL = 120 + 30 * Math.sin(t * 9 + i * 2); armR = 120 - 30 * Math.sin(t * 9 + i * 2);
          y -= 5 * Math.abs(Math.sin(t * 9 + i * 2)) * seg(p, 0.3, 1);
        }
        o.b.pose({ x, y, walk, lean, armL, armR, squash, mood, look: 0.6, blink: 0 });
      });
    }
  };
}
