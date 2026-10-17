// shut down：動いていたパソコンが突然落ちて画面が真っ暗になる（例文 The computer shut down suddenly.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '動いている'], [1.5, '突然止まる'], [3.0, '真っ暗に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 48, width: 80, height: 58, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 80, y1: 48, x2: 80, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  // 机
  el('rect', { x: 196, y: 192, width: 204, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: 206, y: 201, width: 8, height: 35, fill: pal.woodDark });
  el('rect', { x: 384, y: 201, width: 8, height: 35, fill: pal.woodDark });
  k.shadow(300, 237, 100, 5);
  // 本体
  el('rect', { x: 206, y: 134, width: 36, height: 58, rx: 6, fill: '#E3E8F0', stroke: '#C5CDD9', 'stroke-width': 2 });
  el('rect', { x: 212, y: 142, width: 24, height: 5, rx: 2, fill: '#B8C2D0' });
  el('rect', { x: 212, y: 150, width: 24, height: 5, rx: 2, fill: '#B8C2D0' });
  const pled = el('circle', { cx: 224, cy: 176, r: 3.5, fill: pal.green });
  el('circle', { cx: 224, cy: 176, r: 6.5, fill: 'none', stroke: '#B8C2D0', 'stroke-width': 1.5 });
  // モニター
  el('rect', { x: 296, y: 170, width: 12, height: 22, fill: '#A9B4C4' });
  el('rect', { x: 278, y: 188, width: 48, height: 5, rx: 2.5, fill: '#8D98AA' });
  el('rect', { x: 250, y: 98, width: 104, height: 76, rx: 8, fill: '#3C4558' });
  el('rect', { x: 256, y: 104, width: 92, height: 62, rx: 3, fill: '#0F141F' });
  const content = g({});
  tf(content, 302, 135);
  el('rect', { x: -46, y: -31, width: 92, height: 62, rx: 3, fill: '#CFE3FA' }, content);
  el('rect', { x: -38, y: -24, width: 48, height: 32, rx: 3, fill: '#fff' }, content);
  el('rect', { x: -38, y: -24, width: 48, height: 7, rx: 3, fill: pal.blue }, content);
  [-12, -5, 2].forEach((y, i) => el('rect', { x: -33, y, width: 38 - i * 8, height: 3, rx: 1.5, fill: '#C5CDD9' }, content));
  el('rect', { x: 14, y: -20, width: 26, height: 22, rx: 3, fill: pal.yellow }, content);
  el('rect', { x: 18, y: -12, width: 8, height: 10, rx: 2, fill: pal.coral }, content);
  el('rect', { x: 29, y: -8, width: 8, height: 6, rx: 2, fill: pal.green }, content);
  el('rect', { x: -46, y: 24, width: 92, height: 7, fill: '#8FB4E8' }, content);
  const flash = el('rect', { x: 256, y: 104, width: 92, height: 62, rx: 3, fill: '#fff', opacity: 0 });
  const dot = el('circle', { cx: 302, cy: 135, r: 3, fill: '#fff', opacity: 0 });
  el('path', { d: 'M 262 108 L 290 108 L 262 130 Z', fill: '#fff', opacity: 0.07 });
  const mled = el('circle', { cx: 302, cy: 170, r: 1.8, fill: pal.green });
  el('rect', { x: 262, y: 186, width: 60, height: 6, rx: 2, fill: '#F2F4F8', stroke: '#D5DBE5', 'stroke-width': 1 });
  const b = k.buddy({ x: 150, y: FY, scale: 0.85 });
  const mk = (s, size, col) => k.text(0, 0, s, { 'font-size': size, fill: col });
  const ex = mk('!', 28, pal.red), qm = mk('?', 26, pal.sub);
  const sw = el('path', { d: 'M 0 -6 Q 5 1 0 4 Q -5 1 0 -6 Z', fill: pal.water });

  const T = 1.5;
  return {
    update(t) {
      // 画面：明るい→一瞬ちらつく→縦につぶれて線→点→真っ暗
      const gl = t > T - 0.12 && t < T ? (Math.sin(t * 120) > 0 ? 0.5 : 0) : 0;
      const sy = 1 - easeIn(seg(t, T, T + 0.16));
      const sx = 1 - easeIn(seg(t, T + 0.16, T + 0.3));
      tf(content, 302, 135, 0, Math.max(0.001, t < T + 0.16 ? 1 : sx), Math.max(0.012, sy));
      content.setAttribute('opacity', t < T + 0.3 ? 1 : 0);
      flash.setAttribute('opacity', gl);
      const dp = seg(t, T + 0.28, T + 0.55);
      dot.setAttribute('opacity', dp > 0 && dp < 1 ? 1 - dp : 0);
      dot.setAttribute('r', 3 + 2 * dp);
      const off = t >= T + 0.05;
      mled.setAttribute('fill', off ? '#59647A' : pal.green);
      pled.setAttribute('fill', off ? '#59647A' : pal.green);
      // まめ：びっくり→きょとん→肩をすくめる
      const sh = seg(t, T + 0.1, T + 0.4);
      const hop = t > T + 0.1 && t < T + 0.75 ? Math.max(0, wobble(seg(t, T + 0.1, T + 0.75), 1, 2.5) * 0) + hump(seg(t, T + 0.1, T + 0.6)) * 12 : 0;
      const arms = t < T + 0.1 ? 8 : t < T + 1.0 ? lerp(8, 140, easeOut(sh)) : lerp(140, 70, easeInOut(seg(t, T + 1.0, T + 1.6)));
      b.pose({
        x: 150, lift: hop, armR: arms, armL: arms, lean: t > T + 1.0 ? -4 : 0, look: 0.9,
        mood: t < T ? 'smile' : t < T + 1.0 ? 'open' : 'sad',
        squash: 1 - 0.05 * hump(seg(t, T + 0.6, T + 0.9))
      });
      const e = seg(t, T + 0.1, T + 0.3);
      tf(ex, 176, 148 - 4 * e, 0, 0.6 + 0.6 * e);
      ex.setAttribute('opacity', t > T + 0.1 && t < T + 1.2 ? 1 : 0);
      const q = seg(t, T + 1.2, T + 1.6);
      tf(qm, 176, 150 + Math.sin(t * 5) * 2, 0, 0.6 + 0.5 * q);
      qm.setAttribute('opacity', q);
      const u = (t * 1.2) % 1;
      tf(sw, 126, 156 + 14 * u, 0, 1.2 * hump(u));
      sw.setAttribute('opacity', t > T + 0.3 ? 1 : 0);
    }
  };
}
