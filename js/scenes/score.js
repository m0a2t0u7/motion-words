// score：彼がシュートを2回決め、ネットが揺れて得点板が1、2と増える（例文 He scored two goals.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, hump } from '../ease.js';
import { gait } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '1本目を蹴る'], [1.9, '1点・2本目'], [4.0, '2得点']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 190, mood: 'outdoor' });
  el('rect', { x: 0, y: 150, width: 400, height: 40, fill: '#CDEBD3' });
  el('rect', { x: 0, y: 190, width: 400, height: 110, fill: '#8ED6A0' });
  for (let i = 0; i < 6; i++) el('rect', { x: i * 70 - 20, y: 190, width: 35, height: 110, fill: '#7FCB92', opacity: 0.6 });
  const GY = 232;
  // 得点板
  const bd = g({}); tf(bd, 200, 30);
  el('rect', { x: -34, y: -18, width: 68, height: 36, rx: 8, fill: pal.ink }, bd);
  const num = k.text(0, 1, '0', { 'font-size': 26, fill: '#fff' }, bd);
  // ゴール（奥）
  el('rect', { x: 290, y: 142, width: 100, height: 80, fill: '#fff', opacity: 0.35 });
  for (let x = 290; x <= 390; x += 10) el('line', { x1: x, y1: 142, x2: x, y2: 222, stroke: '#fff', 'stroke-width': 1.2, opacity: 0.8 });
  for (let y = 142; y <= 222; y += 10) el('line', { x1: 290, y1: y, x2: 390, y2: y, stroke: '#fff', 'stroke-width': 1.2, opacity: 0.8 });
  el('rect', { x: 286, y: 138, width: 6, height: 88, rx: 3, fill: '#fff' });
  el('rect', { x: 286, y: 138, width: 108, height: 6, rx: 3, fill: '#fff' });
  const b = k.buddy({ x: 60, y: GY, facing: 1, color: pal.blue, dark: pal.blueDark });
  const mkBall = () => {
    const n = g({}), sh = k.shadow(0, 0, 9, 2.5, n);
    const bl = g({}, n);
    el('circle', { r: 9, fill: '#fff', stroke: pal.ink, 'stroke-width': 1.6 }, bl);
    el('path', { d: 'M 0 -4 L 4 -1 L 2.5 4 L -2.5 4 L -4 -1 Z', fill: pal.ink }, bl);
    return { n, bl, sh };
  };
  const B = [mkBall(), mkBall()];
  const nets = [0, 1].map(() => el('rect', { x: 366, y: 150, width: 24, height: 70, fill: '#fff', opacity: 0 }));
  const REST = [160, 205];
  const posx = (t) => t < 1.8 ? lerp(60, 128, easeInOut(seg(t, 0.1, 0.9))) : lerp(128, 173, easeInOut(seg(t, 1.8, 2.3)));
  return {
    update(t) {
      const a = gait(posx, t, 60, 12);
      // 1本目 t=1.1 に接触、2本目 t=2.7
      const c1 = easeInOut(seg(t, 0.7, 1.1)), r1 = easeOut(seg(t, 1.1, 1.5));
      const c2 = easeInOut(seg(t, 2.3, 2.7)), r2 = easeOut(seg(t, 2.7, 3.1));
      const swing = Math.max(c1 * (1 - r1), c2 * (1 - r2));
      const cel = seg(t, 3.4, 3.8);
      b.pose({ x: a.x, walk: a.m > 0.3 ? a.walk : 0, armL: lerp(a.armL, 60, swing) + 70 * cel, armR: lerp(a.armR, 40, swing) + 130 * cel, lean: a.lean + 8 * swing, mood: cel > 0.2 ? 'grin' : 'open', look: 0.6, lift: 14 * Math.sin(cel * Math.PI * 3) * cel * (1 - cel * 0.5) });
      // 蹴り脚
      const legs = b.g.children[1].children;
      const ang = (c1 > 0 && r1 < 1 ? lerp(40 * c1, -70, r1) : 0) + (c2 > 0 && r2 < 1 ? lerp(40 * c2, -70, r2) : 0);
      legs[1].setAttribute('transform', `translate(12 ${-14 - b.state.lift}) rotate(${ang})`);
      // ボール：蹴られて弧を描きネットへ入り、揺らして下に落ちる
      [0, 1].forEach((i) => {
        const t0 = i ? 2.7 : 1.1, p = seg(t, t0, t0 + 0.6), e = easeOut(p);
        const sx = REST[i], sy = GY - 9, ex = 352 + i * 8, ey = i ? 186 : 172;
        let x = lerp(sx, ex, e), y = lerp(sy, ey, e) - 60 * hump(p);
        if (p >= 1) { const f = easeIn(seg(t, t0 + 0.6, t0 + 1.0)); y = lerp(ey, sy, f); x = ex + 4 * easeOut(seg(t, t0 + 0.6, t0 + 1.0)); }
        tf(B[i].n, x, y, 0, 1);
        tf(B[i].bl, 0, 0, p * 700);
        k.set(B[i].sh, { cy: sy - y + 9, opacity: 0.6 - 0.3 * (sy - y) / 80 });
        k.set(nets[i], { opacity: 0.5 * hump(seg(t, t0 + 0.55, t0 + 1.2)) });
      });
      // 得点
      num.textContent = t < 1.75 ? '0' : t < 3.35 ? '1' : '2';
      tf(bd, 200, 30, 0, 1 + 0.12 * hump(seg(t, 1.75, 2.1)) + 0.12 * hump(seg(t, 3.35, 3.7)));
    }
  };
}
