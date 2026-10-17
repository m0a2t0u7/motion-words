// balance：片足を上げてぐらぐら揺れ、腕を広げて立ち止まる（例文 She balanced on one foot.）
import { seg, lerp, easeInOut, easeOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '両足で立つ'], [1.4, '片足でぐらつく'], [3.5, 'ぴたっと止まる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 36, y: 44, width: 84, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // ヨガマット（足元・動かない）
  el('rect', { x: 120, y: FY - 3, width: 160, height: 10, rx: 5, fill: pal.violet });
  const grp = g({}); // 足元を中心に傾ける
  const b = k.buddy({ x: 0, y: 0, scale: 1.15, parent: grp, color: pal.coral, dark: pal.coralDark });
  const legs = b.g.children[1].children;
  const stars = [0, 1, 2].map(() => { const s = g({}); el('path', { d: 'M 0 -8 L 2.4 -2.4 L 8 0 L 2.4 2.4 L 0 8 L -2.4 2.4 L -8 0 L -2.4 -2.4 Z', fill: pal.yellow }, s); return s; });
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.8, 1.5));
      const wob = (1 - seg(t, 1.5, 3.5)) * 1.0;
      const sw = Math.sin(t * 7.5) * wob;
      const arms = lerp(8, 92, easeOut(seg(t, 0.7, 1.3)));
      const tilt = 11 * sw * up + 4 * Math.sin(t * 13) * wob * 0.3;
      tf(grp, 200, FY + 4, tilt);
      b.pose({ x: 0, y: 0, armL: arms + 22 * sw * up, armR: arms - 22 * sw * up, lean: 3 * sw, squash: 1, look: 0.2, mood: t < 1.4 ? 'smile' : t < 3.5 ? 'open' : 'grin', blink: t < 1.4 ? 0 : t < 3.5 ? 0 : 0 });
      // 片足を前に上げる（もう一方は立ったまま）
      legs[1].setAttribute('transform', `translate(12 -14) rotate(${(-78 * up + 8 * sw * up).toFixed(1)})`);
      legs[0].setAttribute('transform', `translate(-12 -14) rotate(${(-2 * sw * up).toFixed(1)})`);
      stars.forEach((s, i) => { const p = seg(t, 3.6 + i * 0.12, 4.4 + i * 0.12); tf(s, 200 - 40 + i * 40, 90 - 14 * easeOut(p) + (i % 2) * 14, 0, p > 0 && p < 1 ? Math.sin(p * Math.PI) : 0); });
    }
  };
}
