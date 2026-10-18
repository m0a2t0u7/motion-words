// from time to time：毎日が過ぎていくなか、ときどき（2日だけ）昔の友だちに電話する（例文 I call my old friends from time to time.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt, sofa } from './run-after.js';
import { roomBg } from './look-over.js';
import { hp, reach } from './dig.js';
import { days, handset, ringWaves, popS } from './from-scratch.js';

// 日ごとの長さの表から「今が何日目で、その日の中のどこか」を返す。spec=[[長さ,種類],...]
export function schedule(spec, t, t0 = 0.2) {
  let s = t0;
  if (t < s) return { i: -1, q: 0, kind: null, end: false };
  for (let i = 0; i < spec.length; i++) {
    const [d, kind] = spec[i];
    if (t < s + d || i === spec.length - 1) return { i, q: clamp((t - s) / d), kind, s, d };
    s += d;
  }
}
// 1日の切れ目の暗転（日の始めと終わりで少し暗くなる）
export const dayDim = (q, last) => (last && q > 0.5 ? 0 : 0.3 * Math.max(1 - seg(q, 0, 0.12), seg(q, 0.9, 1)));

export const meta = { duration: 4.4, beats: [[0, 'ふだんの日'], [0.85, '電話する'], [3.6, '時々かける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = roomBg(k, 'home', 240);
  const so = sofa(k, 150, FY, 150);
  const b = k.buddy({ x: 150, y: FY - 26, scale: 0.95 });
  so.front();
  const ph = handset(k);
  // 昔の友だち（丸い窓の中、受話器を持つ）
  const ins = g({});
  el('circle', { cx: 0, cy: 0, r: 40, fill: '#FFF3E6', stroke: '#fff', 'stroke-width': 5 }, ins);
  const fr = k.buddy({ x: 0, y: 40, scale: 0.62, color: pal.coral, dark: pal.coralDark, facing: -1, parent: ins });
  const fph = handset(k, ins);
  el('circle', { cx: 0, cy: 0, r: 40, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 }, ins);
  const waves = ringWaves(k);
  const D = days(k, 52, 18, 9, 28, 24);
  const marks = [2, 6].map((i) => { const m = handset(k, D.cells[i]); tf(m.g, 14, 16, 0, 0.55); return m.g; });
  const spec = [[0.22, 0], [0.22, 0], [1.3, 1], [0.22, 0], [0.22, 0], [0.22, 0], [1.3, 1], [0.22, 0], [0.3, 0]];
  const dim = el('rect', { x: 0, y: 48, width: 400, height: 252, fill: '#2A3242', opacity: 0 });
  return {
    update(t) {
      const S = schedule(spec, t);
      D.hi(S.i);
      dim.setAttribute('opacity', S.i < 0 ? 0 : dayDim(S.q, S.i === spec.length - 1));
      const call = S.kind === 1 ? S.q : 0;
      const up = easeOut(seg(call, 0.12, 0.3)) * (1 - easeInOut(seg(call, 0.82, 0.95)));
      const talking = call > 0.3 && call < 0.82;
      P(b, { x: 150, y: FY - 26, lean: 3 * up });
      const ear = { x: 150 + 30, y: FY - 26 - 62 };
      P(b, { x: 150, y: FY - 26, armR: lerp(52, 168, up), armL: 10, look: lerp(0.4, 0.8, up), mood: talking && Math.sin(t * 20) > 0 ? 'open' : 'smile', blink: blinkAt(t), lean: 3 * up });
      const h = hp(b, 0.95);
      const rest = { x: 270, y: FY - 56 };
      const px = h.x - 2 + 4 * (1 - up), py = h.y + lerp(2, 13, up);
      tf(ph.g, px, py, lerp(90, 10, up), 1);
      ph.scr.setAttribute('fill', talking ? '#B8F0D8' : '#9FB4CC');
      const ring = false;
      tf(waves, h.x - 8, h.y - 10, 0, ring ? 0.6 + 0.1 * Math.sin(t * 18) : 0.001);
      waves.setAttribute('opacity', ring ? 0.9 : 0);
      const ip = easeOut(seg(call, 0.22, 0.4)) * (1 - seg(call, 0.82, 0.95));
      tf(ins, 320, 128, 0, popS(ip));
      ins.setAttribute('opacity', ip > 0 ? 1 : 0);
      P(fr, { x: 0, y: 40, armR: 150, armL: 10 + 30 * Math.max(0, Math.sin(t * 8)), look: -0.5, mood: talking && Math.sin(t * 20) < 0 ? 'open' : 'grin', facing: -1 });
      const fh = hp(fr, 0.62);
      tf(fph.g, fh.x + 4, fh.y - 4, 20, 0.7);
      marks.forEach((m, j) => { const di = j ? 6 : 2; m.setAttribute('opacity', S.i > di || (S.i === di && call > 0.4) ? 1 : 0); });
    }
  };
}
