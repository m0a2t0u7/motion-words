// job：面接に受かったまめが、上司と握手して社員証を首にかけてもらい、喜んで跳ぶ。カレンダーは先月のページ（例文 She got a new job last month.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, person, officeBg, idCard, calendar, star } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '握手する'], [1.6, '社員証をもらう'], [3.0, '新しい仕事！']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = officeBg(k, 236, 40);
  // 先月のカレンダー（日付に丸）
  const cal = calendar(k, 300, 34, 54); cal.set('4');
  el('circle', { cx: 300, cy: 34 + 54 * 0.62, r: 16, fill: 'none', stroke: pal.red, 'stroke-width': 2.5 });
  const boss = person(k, 'blue', { x: 270, y: FY, scale: 1, facing: -1 });
  const tie = el('path', { d: 'M -4 0 L 4 0 L 2 18 L 0 22 L -2 18 Z', fill: pal.red });
  const b = k.buddy({ x: 170, y: FY, scale: S, facing: 1 });
  // 社員証（ひも付き）
  const strap = el('path', { d: '', stroke: pal.blueDark, 'stroke-width': 2, fill: 'none' });
  const card = idCard(k, undefined, '#DCEBFF', 20, 14, pal.mint);
  const sp = [0, 1, 2].map(() => star(k, undefined, 8));
  return {
    update(t) {
      const shake = seg(t, 0.3, 1.4), give = easeInOut(seg(t, 1.6, 2.4)), joy = seg(t, 2.8, 4.4);
      const jump = Math.abs(Math.sin((t - 2.8) * 6)) * (joy > 0 ? 1 : 0) * (1 - seg(t, 3.9, 4.2));
      P(b, { x: 170, facing: 1, lift: 20 * jump, armR: 10, armL: joy > 0 ? 150 : 10, mood: t > 1.0 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t), squash: 1 + 0.04 * jump });
      P(boss, { x: 270, facing: -1, look: 0.6, mood: 'grin', blink: blinkAt(t, 1), lean: 4 * give });
      tf(tie, 270, FY - 66, 0, 1);
      if (shake < 1 && t > 0.2) { const y = FY - 56 + 5 * Math.sin(t * 22) * (shake > 0 ? 1 : 0); aim(b, S, 'R', 220, y); aim(boss, 1, 'R', 220, y); }
      if (joy > 0) b.pose({ armR: 150 });
      // 上司が首にかける → 胸で揺れる
      const neck = { x: 170, y: FY - 80 - 20 * jump };
      const bh = hp(boss, 1, 'R');
      if (t > 1.5 && t < 2.6) { aim(boss, 1, 'R', lerp(240, 186, give), lerp(FY - 60, FY - 64, give)); aim(boss, 1, 'L', lerp(240, 186, give), FY - 64); }
      const cx = t < 1.6 ? bh.x : t < 2.4 ? lerp(bh.x, 170, give) : 170 + 3 * Math.sin(t * 6) * jump;
      const cy = t < 2.4 ? lerp(bh.y + 4, FY - 34 - 20 * jump, give) : FY - 34 - 20 * jump;
      tf(card, cx, cy, 0, t > 1.4 ? 1 : 0.001);
      k.set(strap, { d: t > 2.3 ? `M ${170 - 14} ${neck.y + 22} L ${cx} ${cy - 7} L ${170 + 14} ${neck.y + 22}` : '' });
      sp.forEach((s, i) => { const q = seg(t, 3.0 + i * 0.2, 3.8 + i * 0.2); tf(s, 130 + i * 40, FY - 130 - 20 * q, 0, q > 0 ? hump(q) * 1.4 : 0.001); });
    }
  };
}
