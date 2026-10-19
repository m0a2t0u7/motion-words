// bandage：看護師が、差し出された彼の手に白い包帯をくるくる巻き、テープでとめる（例文 The nurse put a bandage on his hand.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, hp, cap, clinicBg } from './hospital.js';

export const meta = { duration: 4.2, beats: [[0, '手を出す'], [1.0, '包帯を巻く'], [3.2, '巻き終わり']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = clinicBg(k, 240);
  el('rect', { x: 300, y: 150, width: 92, height: 8, rx: 3, fill: '#D9E1EA' });
  el('rect', { x: 382, y: 158, width: 6, height: FY - 158, fill: '#B8C3D2' });
  const S = 1.1;
  const me = k.buddy({ x: 120, y: FY, scale: S });
  // 手（腕のグループ内、手の円 (0,26) r6.5）に重ねる包帯
  const wrap = g({}, me.armR.a);
  const base = el('circle', { cx: 0, cy: 26, r: 8, fill: '#fff', stroke: '#DCE3EC', 'stroke-width': 1.5 }, wrap);
  const bands = [-4, -1.5, 1, 3.5, 6].map((d) => el('path', { d: `M -8 ${26 + d} Q 0 ${26 + d + 3} 8 ${26 + d}`, fill: 'none', stroke: '#DCE3EC', 'stroke-width': 1.4 }, wrap));
  const tape = el('rect', { x: 2, y: 24, width: 7, height: 5, rx: 1, fill: '#F5D7B5' }, wrap);
  const nurse = k.buddy({ x: 300, y: FY, scale: 0.98, facing: -1, color: pal.coral, dark: pal.coralDark });
  cap(k, nurse);
  // 包帯ロールと、手からのびる帯
  const strip = el('path', { fill: 'none', stroke: '#fff', 'stroke-width': 6, 'stroke-linecap': 'round' });
  const stripE = el('path', { fill: 'none', stroke: '#DCE3EC', 'stroke-width': 1.2 });
  const roll = g({});
  el('circle', { r: 8, fill: '#fff', stroke: '#DCE3EC', 'stroke-width': 2 }, roll);
  el('circle', { r: 3, fill: '#EEF1F5' }, roll);
  return {
    update(t) {
      P(me, { armR: lerp(8, 82, easeInOut(seg(t, 0.1, 0.6))), look: 0.8, mood: t > 3.3 ? 'grin' : 'flat', blink: 0 });
      const hand = hp(me, S, 'R', 28);
      const app = easeInOut(seg(t, 0.4, 1.0)), away = easeInOut(seg(t, 3.3, 3.9));
      P(nurse, { x: lerp(300, 254, app) + 20 * away, walk: (app - away) * 4, facing: -1, look: 0.6, mood: 'smile', lean: 8 * app * (1 - away) });
      // 手のまわりを回る（奥→手前）
      const wq = seg(t, 1.0, 3.0), ang = wq * Math.PI * 2 * 4;
      const r = 13;
      const rp = t > 1.0 && t < 3.0
        ? { x: hand.x + Math.sin(ang) * 4 + 4, y: hand.y + Math.cos(ang) * r }
        : t <= 1.0 ? { x: lerp(hand.x + 40, hand.x + 4, app), y: lerp(hand.y - 20, hand.y + r, app) } : { x: hand.x + 30, y: hand.y - 6 };
      P(nurse, { ...nurse.state, armR: reach(nurse, 0.98, 'R', rp.x + 4, rp.y) });
      tf(roll, rp.x, rp.y, ang * 50, 1 - 0.12 * Math.cos(ang) * (t > 1 && t < 3 ? 1 : 0));
      roll.setAttribute('opacity', t < 3.1 ? seg(t, 0.4, 0.6) : 0);
      const on = t > 1.0 && t < 3.05;
      const d = `M ${hand.x.toFixed(1)} ${hand.y.toFixed(1)} L ${rp.x.toFixed(1)} ${rp.y.toFixed(1)}`;
      k.set(strip, { d, opacity: on ? 1 : 0 }); k.set(stripE, { d, opacity: on ? 0.8 : 0 });
      // 包帯が厚くなる
      const cov = easeOut(wq);
      base.setAttribute('opacity', cov > 0.02 ? 1 : 0);
      base.setAttribute('r', (6 + 3 * cov).toFixed(2));
      bands.forEach((b, i) => b.setAttribute('opacity', cov > (i + 1) / 6 ? 1 : 0));
      tape.setAttribute('opacity', t > 3.1 ? 1 : 0);
      // 巻き終わりに手を軽く振る
      if (t > 3.5) P(me, { ...me.state, armR: 82 + 10 * Math.sin((t - 3.5) * 9) * (1 - seg(t, 3.5, 4.2)) });
    }
  };
}
