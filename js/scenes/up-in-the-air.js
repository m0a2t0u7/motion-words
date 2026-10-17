// up in the air：行き先を決められず、コインを投げる→コインが宙にあるまま二人とも決まらない（Our travel plans are still up in the air.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}

export const meta = { duration: 3.8, beats: [[0, '行き先を迷う'], [1.2, 'コインを投げる'], [3.2, 'まだ宙に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#EDE6DB' });
  // 左：海のポスター　右：山のポスター
  const poster = (x, kind) => {
    el('rect', { x, y: 50, width: 70, height: 84, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
    el('rect', { x: x + 6, y: 56, width: 58, height: 72, rx: 3, fill: kind === 'sea' ? '#CFEAF8' : '#DCEBF6' });
    if (kind === 'sea') {
      el('circle', { cx: x + 48, cy: 76, r: 9, fill: pal.yellow });
      el('rect', { x: x + 6, y: 98, width: 58, height: 30, fill: pal.water });
      el('path', { d: `M ${x + 10} 108 q 6 -6 12 0 t 12 0 t 12 0 t 12 0`, fill: 'none', stroke: '#fff', 'stroke-width': 2.5 });
    } else {
      el('path', { d: `M ${x + 6} 128 L ${x + 28} 84 L ${x + 42} 108 L ${x + 50} 96 L ${x + 64} 128 Z`, fill: pal.mintDark });
      el('path', { d: `M ${x + 22} 94 L ${x + 28} 84 L ${x + 34} 94 L ${x + 28} 92 Z`, fill: '#fff' });
    }
  };
  poster(36, 'sea'); poster(294, 'mtn');
  // 旅行かばん
  const bag = g({}); tf(bag, 200, FY);
  k.shadow(0, 0, 28, 5, bag);
  el('rect', { x: -22, y: -34, width: 44, height: 34, rx: 7, fill: pal.blue }, bag);
  el('rect', { x: -8, y: -42, width: 16, height: 9, rx: 4, fill: 'none', stroke: pal.blueDark, 'stroke-width': 3 }, bag);
  el('rect', { x: -22, y: -20, width: 44, height: 4, fill: pal.blueDark }, bag);
  // コインの影と本体
  const csh = el('ellipse', { cx: 200, cy: FY + 14, rx: 8, ry: 2, fill: pal.shadow });
  const coin = g({});
  el('ellipse', { rx: 10, ry: 10, fill: pal.yellowDark }, coin);
  const face = el('ellipse', { rx: 7, ry: 7, fill: pal.yellow }, coin);
  // はてな
  const q1 = k.text(0, 0, '?', { 'font-size': 26, fill: pal.violet });
  const q2 = k.text(0, 0, '?', { 'font-size': 26, fill: pal.violet });

  const a = k.buddy({ x: 138, y: FY, facing: 1 });
  const c = k.buddy({ x: 262, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      const choose = Math.sin(t * 3.2) * (1 - seg(t, 0.8, 1.0));  // 左右のポスターを見比べる
      const wind = easeOut(seg(t, 0.9, 1.1));
      const flick = hump(seg(t, 0.95, 1.2));
      const worry = easeOut(seg(t, 2.2, 2.7));
      a.pose({
        armR: lerp(8, 75, easeOut(seg(t, 0.3, 0.8))) + 90 * (t > 0.9 && t < 1.25 ? easeOut(seg(t, 0.95, 1.2)) : 0) * (1 - seg(t, 1.3, 1.9)) + (t >= 1.25 ? 0 : 0),
        armL: lerp(8, 60, worry), lean: -8 * wind * 0.6 - 6 * worry, look: 0.7 * choose * (1 - wind) + 0.2 * wind,
        mood: t < 1.0 ? 'flat' : t < 2.2 ? 'open' : 'sad', squash: 1 - 0.04 * flick
      });
      c.pose({
        armR: lerp(8, 55, worry), armL: lerp(8, 60, worry), lean: -8 * worry, look: -0.7 * choose * (1 - wind),
        mood: t < 1.0 ? 'flat' : t < 2.2 ? 'open' : 'sad', squash: 1 - 0.02 * Math.sin(t * 2.5)
      });
      // コイン：手の上→投げ上げ→まだ宙
      const h = hp(a, 1, 'R', 30);
      const rel = seg(t, 1.05, 3.6);
      const u = easeOut(rel);
      const cx = lerp(h.x + 6, 200, easeOut(seg(t, 1.05, 2.0)));
      const hand0 = t < 1.05;
      const cy = hand0 ? h.y - 10 : lerp(h.y - 10, 44, u) + 2 * Math.sin(t * 2.2) * u;
      const spin = Math.max(0, t - 1.05) * 16 + 0.4;
      tf(coin, hand0 ? h.x + 4 : cx, cy, 0, 1);
      coin.firstChild.setAttribute('rx', 10 * Math.max(0.12, Math.abs(Math.cos(spin))));
      face.setAttribute('rx', 7 * Math.max(0.08, Math.abs(Math.cos(spin))));
      const ht = clamp(((FY - cy) / 190));
      k.set(csh, { cx: hand0 ? 200 : cx, rx: lerp(8, 4, ht) * (hand0 ? 0 : 1), opacity: hand0 ? 0 : lerp(1, 0.35, ht) });
      const qp = easeOut(seg(t, 2.4, 2.9));
      tf(q1, 138, 128 - 8 * qp + 2 * Math.sin(t * 3), -8, 0.5 + 0.5 * qp);
      tf(q2, 262, 128 - 8 * qp + 2 * Math.sin(t * 3 + 1), 8, 0.5 + 0.5 * qp);
      q1.setAttribute('opacity', qp); q2.setAttribute('opacity', qp);
    }
  };
}
