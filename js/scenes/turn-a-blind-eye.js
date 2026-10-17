// turn a blind eye：禁止の規則の前で同僚が飲み物を飲む→管理者が気づく→手で目をふさいで背を向ける（The manager turned a blind eye to the broken rule.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
// 手先の座標（体の傾き・向きを反映）
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}

export const meta = { duration: 4.0, beats: [[0, '規則違反'], [1.7, '気づく'], [3.3, '見ないふり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#EDE6DB' });
  // 窓
  el('rect', { x: 30, y: 36, width: 70, height: 84, rx: 6, fill: '#DDEFFA' });
  el('line', { x1: 65, y1: 36, x2: 65, y2: 120, stroke: '#fff', 'stroke-width': 4 });
  // 禁止サイン（カップに斜線）
  const sg = g({}); tf(sg, 200, 78);
  el('circle', { r: 32, fill: '#fff', stroke: pal.red, 'stroke-width': 7 }, sg);
  el('path', { d: 'M -11 -12 L 11 -12 L 8 14 L -8 14 Z', fill: pal.coffee }, sg);
  el('path', { d: 'M 11 -7 q 9 0 9 7 q 0 7 -9 7', fill: 'none', stroke: pal.coffee, 'stroke-width': 3.5 }, sg);
  el('line', { x1: -22, y1: -22, x2: 22, y2: 22, stroke: pal.red, 'stroke-width': 7, 'stroke-linecap': 'round' }, sg);
  // 床のマット
  el('rect', { x: 70, y: FY + 8, width: 260, height: 8, rx: 4, fill: '#E3E8EE' });

  const mgr = k.buddy({ x: 120, y: FY, scale: 1 });
  const wk = k.buddy({ x: 420, y: FY, scale: 1, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const cup = g({});
  el('path', { d: 'M -7 -8 L 7 -8 L 5 8 L -5 8 Z', fill: '#fff', stroke: pal.sub, 'stroke-width': 2 }, cup);
  el('rect', { x: -6, y: -8, width: 12, height: 5, fill: pal.coffee }, cup);
  const steam = el('path', { d: 'M -2 -12 q -4 -6 0 -12 M 3 -12 q -4 -6 0 -12', fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-linecap': 'round' }, cup);
  const ex = k.text(0, 0, '!', { 'font-size': 30, fill: pal.red });

  const xw = (t) => lerp(420, 290, easeInOut(seg(t, 0.1, 1.2)));
  return {
    update(t) {
      // 同僚：歩いて入り、飲む
      const x = xw(t), v = Math.abs(xw(t + 0.02) - xw(t - 0.02)) / 0.04, m = clamp(v / 25);
      const ph = (420 - x) * 0.107, w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
      const sip = hump(seg(t, 1.3, 2.0)) + hump(seg(t, 2.4, 3.1));
      wk.pose({ x, walk: w, armL: 8 + Math.sin(w) * 18 * m, armR: lerp(60, -118, clamp(sip)), lean: 3 * m - 4 * clamp(sip), mood: sip > 0.3 ? 'smile' : 'grin', look: -0.3 });
      const h = hp(wk, 1, 'R', 24);
      tf(cup, h.x, h.y, -clamp(sip) * 28);
      steam.setAttribute('opacity', 0.6 + 0.4 * Math.sin(t * 6));
      // 管理者：気づく→背を向けて目をふさぐ
      const n = easeOut(seg(t, 1.5, 1.7));
      const turn = easeInOut(seg(t, 2.1, 2.7));
      const cover = easeInOut(seg(t, 2.5, 3.1));
      mgr.pose({
        facing: lerp(1, -1, turn), lean: lerp(0, -8, n) * (1 - turn), look: 0.7,
        armL: 8, armR: lerp(8, -129, cover), squash: 1 - 0.03 * hump(seg(t, 1.5, 1.9)),
        mood: turn > 0.5 ? 'flat' : n > 0.1 ? 'open' : 'flat', lift: 6 * hump(seg(t, 1.5, 1.8))
      });
      ex.setAttribute('opacity', t > 1.55 && t < 2.3 ? 1 : 0);
      tf(ex, 120, 136 - 10 * easeOut(seg(t, 1.55, 1.8)), 0, 0.6 + 0.4 * easeOut(seg(t, 1.55, 1.75)));
    }
  };
}
