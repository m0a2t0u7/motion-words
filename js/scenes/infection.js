// infection：腕の切り傷にばい菌が入り、赤くはれる→彼は薬を水で飲む（例文 The cut got an infection, so he took medicine.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, hp, germ, pill, glass, bottle } from './hospital.js';
import { table } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '腕の切り傷'], [1.0, 'ばい菌で化のう'], [2.6, '薬を飲む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const TY = table(k, 210);
  const FY = 236;
  el('rect', { x: 40, y: 40, width: 80, height: 60, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const bt = bottle(k, null); tf(bt, 318, TY);
  const gl = glass(k); tf(gl.g, 262, TY);
  const S = 1.0;
  const me = k.buddy({ x: 170, y: FY, scale: S });
  // 左腕の傷（手前に見える小さな印）
  const mark = el('circle', { cx: 0, cy: 14, r: 3.5, fill: '#E2897C' }, me.armL.a);
  const pl = pill(k, null, pal.coral);
  // 拡大窓：腕の傷
  const Z = g({}); tf(Z, 76, 150);
  el('circle', { r: 50, fill: '#F6F3EE', stroke: pal.ink, 'stroke-width': 3 }, Z);
  const zi = g({ 'clip-path': k.clip((c) => el('circle', { r: 48 }, c)) }, Z);
  el('rect', { x: -70, y: -20, width: 140, height: 40, rx: 20, fill: pal.mintDark }, zi);
  const red = el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 20, fill: pal.red, opacity: 0 }, zi);
  el('path', { d: 'M -14 -4 L 14 4', stroke: '#B03A2A', 'stroke-width': 4, 'stroke-linecap': 'round' }, zi);
  const gs = [[-30, -34], [26, -36], [-4, 34], [34, 26]].map(([x, y]) => ({ n: germ(k, zi, pal.violet), x, y }));
  const link = el('line', { x1: 120, y1: 160, x2: 150, y2: 186, stroke: pal.ink, 'stroke-width': 2, 'stroke-dasharray': '4 4' });
  return {
    update(t) {
      // ばい菌が傷に入り、赤くはれる
      gs.forEach((o, i) => {
        const inn = easeInOut(seg(t, 0.4 + i * 0.12, 1.3 + i * 0.12)), gone = easeIn2(seg(t, 3.0 + i * 0.1, 3.6 + i * 0.1));
        tf(o.n, lerp(o.x, o.x * 0.25, inn), lerp(o.y, o.y * 0.12, inn) + Math.sin(t * 7 + i) * 2, t * 50 * (i % 2 ? 1 : -1), lerp(1, 0.75, inn) * (1 - gone) + 0.001);
        o.n.setAttribute('opacity', 1 - gone);
      });
      const swell = easeOut(seg(t, 1.0, 2.0)) * (1 - 0.7 * easeInOut(seg(t, 3.2, 4.2)));
      k.set(red, { opacity: 0.55 * swell, rx: 20 + 14 * swell, ry: 14 + 8 * swell });
      k.set(mark, { fill: swell > 0.4 ? pal.red : '#E2897C', r: 3.5 + 1.5 * swell });
      // 薬：びんから1粒→口へ、コップの水を飲む
      const pick = easeInOut(seg(t, 2.0, 2.4)), toMouth = easeInOut(seg(t, 2.4, 2.8)), cup = easeInOut(seg(t, 2.9, 3.3)), drink = seg(t, 3.3, 3.9), down = easeInOut(seg(t, 3.9, 4.3));
      const mouth = { x: 170 + 20, y: FY - 54 };
      let tgt;
      if (t < 2.4) tgt = { x: lerp(196, 318, pick), y: lerp(TY - 20, TY - 38, pick) };
      else if (t < 2.85) tgt = { x: lerp(318, mouth.x + 2, toMouth), y: lerp(TY - 38, mouth.y, toMouth) };
      else if (t < 3.3) tgt = { x: lerp(mouth.x + 4, 262, cup), y: lerp(mouth.y, TY - 14, cup) };
      else tgt = { x: lerp(mouth.x + 8, 262, down), y: lerp(mouth.y + 4, TY - 14, down) };
      if (t < 2.0) tgt = { x: lerp(196, 196, 0), y: TY - 20 };
      P(me, { look: 0.6, mood: t < 2.0 ? 'sad' : t > 2.6 && t < 2.85 ? 'open' : t > 3.9 ? 'smile' : 'flat', lean: 3, armL: 8 });
      P(me, { ...me.state, armR: t < 1.8 ? 8 : lerp(8, reach(me, S, 'R', tgt.x, tgt.y), seg(t, 1.8, 2.0)) });
      const h = hp(me, S, 'R', 28);
      tf(pl, h.x, h.y, 20, 1); pl.setAttribute('opacity', t > 2.38 && t < 2.8 ? 1 : 0);
      const held = t > 3.25;
      const tilt = held ? -55 * hump(clamp(drink * 1.05)) : 0;
      tf(gl.g, held ? h.x : 262, held ? h.y + 12 : TY, tilt);
      gl.set(lerp(0.8, 0.25, drink));
    }
  };
}
const easeIn2 = (p) => p * p;
