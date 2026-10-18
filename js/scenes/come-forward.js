// come forward：重い箱を前に「手伝って」と呼びかけるが、並んだ3人は誰も前へ出てこない（例文 No one came forward to help.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { person, pop } from './queue-up.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '助けを呼ぶ'], [1.8, '誰も出ない'], [3.6, '一人のまま']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  [[40, 60], [330, 70]].forEach(([x, h]) => el('rect', { x, y: FY - h - 40, width: 60, height: h + 40, rx: 4, fill: '#E4EEF7' }));
  // 呼びかける人と重い箱
  el('rect', { x: 74, y: FY - 40, width: 56, height: 40, rx: 3, fill: '#B98A55', stroke: '#8E6638', 'stroke-width': 2 });
  k.shadow(102, FY + 1, 32, 4);
  const asker = person(k, 'coral', { x: 46, y: FY, scale: 0.85 });
  const crowd = [k.buddy({ x: 230, y: FY - 6, scale: 0.8, facing: -1 }), person(k, 'blue', { x: 284, y: FY - 6, scale: 0.8, facing: -1 }), person(k, 'yellow', { x: 338, y: FY - 6, scale: 0.8, facing: -1 })];
  // 前へ出る位置（空いたまま）
  const spot = el('ellipse', { cx: 168, cy: FY + 4, rx: 24, ry: 5, fill: 'none', stroke: pal.sub, 'stroke-width': 2, 'stroke-dasharray': '5 4' });
  const bb = bubble(k, 52, 34);
  const hand = g({}, bb);
  el('circle', { cx: -9, r: 7, fill: pal.coral }, hand);
  k.text(10, 1, '?', { 'font-size': 18, fill: pal.coralDark }, bb);
  return {
    update(t) {
      const call = 1 - seg(t, 2.6, 3.0);
      asker.pose({ armR: lerp(30, 150 + 15 * Math.sin(t * 8), call), look: 0.6, mood: t < 2.6 ? 'open' : 'sad', lift: 4 * hump(seg(t, 0.3, 0.7)) });
      const s = pop(seg(t, 0.3, 0.7)) * (1 - seg(t, 2.6, 2.9));
      bb.setAttribute('opacity', s > 0.001 ? 1 : 0); tf(bb, 96, FY - 112, 0, Math.max(0.001, s));
      crowd.forEach((b, i) => {
        // 呼ばれて一瞬見るが、目をそらしてその場にとどまる
        const away = easeInOut(seg(t, 1.2 + i * 0.2, 1.7 + i * 0.2));
        b.pose({ look: lerp(-0.5, 0.6, away), facing: -1, mood: 'flat', armR: 10, lean: -3 * away, blink: Math.abs(t - 2.6 - i * 0.3) < 0.06 ? 1 : 0 });
      });
      spot.setAttribute('opacity', 0.5 + 0.4 * Math.sin(t * 4) * seg(t, 1.6, 2.0));
      void easeOut;
    }
  };
}
