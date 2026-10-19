// blood：看護師が腕に採血の針を当て、管に血が少したまる。取った血の管を見せる（例文 The nurse took a small sample of my blood.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, reach, hp, cap, clinicBg } from './hospital.js';

export const meta = { duration: 4.2, beats: [[0, '腕を出す'], [1.2, '血を採る'], [3.0, '少し採れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = clinicBg(k, 240);
  // 腕を置く台
  el('rect', { x: 186, y: 190, width: 50, height: 10, rx: 5, fill: '#9CC7F2' });
  el('rect', { x: 206, y: 200, width: 8, height: FY - 200, fill: '#B8C3D2' });
  el('rect', { x: 192, y: FY - 4, width: 36, height: 5, rx: 2, fill: '#B8C3D2' });
  // トレー
  el('rect', { x: 300, y: 172, width: 90, height: 8, rx: 3, fill: '#D9E1EA' });
  el('rect', { x: 306, y: 180, width: 6, height: FY - 180, fill: '#B8C3D2' });
  el('rect', { x: 378, y: 180, width: 6, height: FY - 180, fill: '#B8C3D2' });
  const S = 0.95;
  const me = k.buddy({ x: 126, y: FY, scale: S });
  // 針のあとの小さな絆創膏（腕の中ほど）
  const plaster = el('rect', { x: -5, y: 12, width: 10, height: 6, rx: 2, fill: '#F5D7B5' }, me.armR.a);
  const nurse = k.buddy({ x: 290, y: FY, scale: 0.92, facing: -1, color: pal.coral, dark: pal.coralDark });
  cap(k, nurse);
  // 採血管（原点＝針先、右へ伸びる）
  const tube = g({});
  el('line', { x1: 0, y1: 0, x2: 10, y2: 0, stroke: '#9AA6B6', 'stroke-width': 1.6 }, tube);
  el('rect', { x: 10, y: -5, width: 12, height: 10, rx: 2, fill: pal.blue }, tube);
  el('rect', { x: 22, y: -4, width: 26, height: 8, rx: 4, fill: '#fff', stroke: '#B9CBDD', 'stroke-width': 1.5 }, tube);
  const fill = el('rect', { x: 23, y: -3, height: 6, rx: 3, fill: pal.red }, tube);
  el('rect', { x: 46, y: -5, width: 6, height: 10, rx: 2, fill: pal.violet }, tube);
  return {
    update(t) {
      P(me, { armR: lerp(8, 84, easeInOut(seg(t, 0.1, 0.7))), look: lerp(0.4, 0.8, seg(t, 0.8, 1.2)), mood: t > 1.2 && t < 2.6 ? 'flat' : 'smile', blink: t > 1.3 && t < 2.5 ? 0.8 : 0 });
      const site = hp(me, S, 'R', 15);
      // 看護師：近づいて管を当てる→はずして見せる
      const app = easeInOut(seg(t, 0.6, 1.3)), off = easeInOut(seg(t, 2.7, 3.2)), show = easeOut(seg(t, 3.1, 3.7));
      P(nurse, { x: lerp(296, 278, app), walk: app * 2, facing: -1, look: 0.5, lean: 8 * app * (1 - off), mood: 'smile' });
      const tip0 = { x: site.x + 30, y: site.y - 12 };
      let tip = { x: lerp(tip0.x, site.x, easeOut(seg(t, 1.1, 1.4))), y: lerp(tip0.y, site.y - 1, easeOut(seg(t, 1.1, 1.4))) };
      const up = { x: 250, y: 120 };
      tip = { x: lerp(lerp(tip.x, site.x + 26, off), up.x, show), y: lerp(lerp(tip.y, site.y - 18, off), up.y, show) };
      let rot = -8, r = (rot * Math.PI) / 180;
      const grip = { x: tip.x + Math.cos(r) * 34, y: tip.y + Math.sin(r) * 34 };
      P(nurse, { ...nurse.state, armR: lerp(reach(nurse, 0.92, 'R', grip.x, grip.y), 165, show) });
      if (show > 0) {
        const h = hp(nurse, 0.92, 'R', 28);
        rot = lerp(-8, -100, show); r = (rot * Math.PI) / 180;
        const g0 = { x: lerp(grip.x, h.x, show), y: lerp(grip.y, h.y, show) };
        tip = { x: g0.x - Math.cos(r) * 34, y: g0.y - Math.sin(r) * 34 };
      }
      tf(tube, tip.x, tip.y, rot, 1);
      tube.setAttribute('opacity', seg(t, 0.6, 0.9));
      const lvl = easeInOut(seg(t, 1.5, 2.6)) * 0.55;
      k.set(fill, { width: Math.max(0.01, 24 * lvl), opacity: lvl > 0.01 ? 1 : 0 });
      plaster.setAttribute('opacity', t > 2.95 ? 1 : 0);
    }
  };
}
