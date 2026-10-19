// wish：丘の上で空を飛ぶ鳥を見上げ、まめは腕をばたばたさせて跳ぶが、すぐ地面に戻る。翼で飛ぶ自分を思い描く（例文 I wish I could fly.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { cloud } from './look-over.js';

function bird(k) {
  const g = k.g({}), pal = k.pal;
  k.el('ellipse', { cx: 0, cy: 0, rx: 9, ry: 5, fill: pal.blueDark }, g);
  k.el('circle', { cx: 8, cy: -3, r: 4, fill: pal.blueDark }, g);
  k.el('path', { d: 'M 11 -3 L 15 -2 L 11 -1 Z', fill: pal.yellow }, g);
  const wing = k.el('path', { d: 'M -4 0 Q 0 -14 6 0 Z', fill: pal.blue }, g);
  return { g, set(x, y, ph) { k.tf(g, x, y); wing.setAttribute('transform', `scale(1 ${Math.sin(ph).toFixed(2)})`); } };
}

export const meta = { duration: 4.4, beats: [[0, '鳥を見上げる'], [1.3, '飛ぼうとする'], [2.9, '飛べたらなあ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  [[70, 50], [300, 70]].forEach(([x, y]) => { const c = g({ opacity: 0.8 }); [[0, 0, 22], [18, 4, 16], [-18, 4, 14]].forEach(([dx, dy, r]) => el('circle', { cx: x + dx, cy: y + dy, r, fill: '#fff' }, c)); });
  el('path', { d: `M -10 ${FY + 4} Q 200 ${FY - 40} 410 ${FY + 4} V 300 H -10 Z`, fill: '#CDE9C9' });
  el('path', { d: `M -10 ${FY + 12} Q 200 ${FY - 28} 410 ${FY + 12} V 300 H -10 Z`, fill: '#BFE2BA' });
  const birds = [0, 1].map(() => bird(k));
  const GY = FY - 18;
  const me = k.buddy({ x: 200, y: GY, scale: 0.95 });
  const th = cloud(k, 96, 60, 1);
  const wings = [-1, 1].map((d) => el('path', { d: `M 0 0 Q ${d * 26} -26 ${d * 34} -6 Q ${d * 20} -4 0 6 Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, th.g));
  const mini = k.buddy({ x: 0, y: 14, scale: 0.36, parent: th.g });
  mini.g.firstChild.setAttribute('display', 'none');
  return {
    update(t) {
      birds.forEach((b, i) => b.set(-30 + ((t * 80 + i * 200) % 460), 90 + i * 26 + 6 * Math.sin(t * 2 + i), t * 16 + i));
      // ばたばた＋2回ジャンプ（すぐ着地）
      const flap = t > 1.2 && t < 2.8 ? Math.sin((t - 1.2) * 18) : 0;
      const j1 = hump(seg(t, 1.5, 1.95)), j2 = hump(seg(t, 2.1, 2.55));
      const land = Math.max(hump(seg(t, 1.95, 2.1)), hump(seg(t, 2.55, 2.75)));
      const fl = t > 1.2 && t < 2.8 ? 1 : 0;
      P(me, { y: GY, lift: 18 * j1 + 22 * j2, squash: 1 - 0.1 * land - 0.06 * hump(seg(t, 1.35, 1.5)), armR: fl ? 95 + 50 * flap : 8 + 20 * hump(seg(t, 0, 1)), armL: fl ? 95 + 50 * flap : 8, look: t > 2.8 ? 0.2 : 0.5, mood: t > 2.9 ? 'sad' : fl ? 'open' : 'smile', blink: blinkAt(t, 0.4), lean: -4 + 2 * Math.sin(t * 1.5) });
      const tp = seg(t, 3.0, 3.4);
      th.show(tp, 108, 70);
      P(mini, { armR: 110, armL: 110, mood: 'grin', lean: 10, lift: 4 * Math.sin(t * 5) });
      wings.forEach((w, i) => { const d = i ? 1 : -1; w.setAttribute('transform', `translate(${d * 12} -6) rotate(${(d * 12 * Math.sin(t * 9)).toFixed(1)})`); });
      tf(mini.g, Math.sin(t * 3) * 4, 16 + 2 * Math.sin(t * 5), 0, 0.36);
    }
  };
}
