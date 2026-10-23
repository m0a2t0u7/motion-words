// towel：洗面台で手を洗ったあと、かけてあるタオルで手をふいてかわかす（例文 Dry your hands with a towel.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, P, blinkAt } from './jam.js';

export const meta = { duration: 4.4, beats: [[0, '手を洗う'], [1.6, 'タオルで'], [2.4, '手をふく']] };

export function create(k) {
  const { el, pal } = k, S = 1.2;
  const kit = kitchen(k, { wall: '#EAF3F7', win: false });
  // 鏡とタオル掛け
  el('rect', { x: 130, y: 30, width: 90, height: 70, rx: 10, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('rect', { x: 268, y: 92, width: 74, height: 5, rx: 2.5, fill: '#AEB8C6' });
  const b = k.buddy({ x: 176, y: kit.FY, scale: S });
  kit.front('#DDE7EE');
  // 蛇口と水
  el('rect', { x: 210, y: TOP - 50, width: 6, height: 30, fill: '#AEB8C6' });
  el('rect', { x: 210, y: TOP - 50, width: 30, height: 6, rx: 3, fill: '#AEB8C6' });
  const water = el('rect', { x: 233, y: TOP - 44, width: 5, height: 40, fill: pal.water, opacity: 0.8 });
  el('ellipse', { cx: 236, cy: TOP - 1, rx: 34, ry: 5, fill: '#C9D6E0' });
  const drops = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -4 Q 3 0 0 3 Q -3 0 0 -4 Z', fill: pal.water }));
  // タオル（掛けてある → 両手でつかんでこする）
  const tw = k.g({});
  el('rect', { x: -18, y: 0, width: 36, height: 50, rx: 4, fill: '#FFCF5C' }, tw);
  el('rect', { x: -18, y: 38, width: 36, height: 5, fill: '#E9B43A' }, tw);
  const A = arms(k, b, S);
  return {
    update(t) {
      const wash = t < 1.4;
      const rub = Math.sin(t * 16);
      const grab = easeInOut(seg(t, 1.5, 2.0)), dry = t > 2.2 && t < 3.6;
      const dryP = seg(t, 2.2, 3.6);
      P(b, { look: 0.5, lean: 6, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' });
      water.setAttribute('opacity', t < 1.3 ? 0.85 : 0);
      let R = { x: 226 + rub * 4 * wash, y: TOP - 18 }, L = { x: 242 - rub * 4 * wash, y: TOP - 14 };
      let tx = 305, ty = 94, tr = 0;
      if (!wash) {
        const hx = lerp(234, 300, grab), hy = lerp(TOP - 16, 120, grab);
        R = { x: hx + 8, y: hy }; L = { x: hx - 8, y: hy + 4 };
        tx = lerp(305, 305, grab); ty = 94;
        if (t > 2.0) {
          const m = easeInOut(seg(t, 2.0, 2.3));
          const cx = lerp(300, 230, m), cy = lerp(120, 150, m);
          tx = cx; ty = cy - 24; tr = dry ? Math.sin(t * 14) * 6 : 0;
          R = { x: cx + 10 + (dry ? Math.sin(t * 14) * 6 : 0), y: cy }; L = { x: cx - 10 - (dry ? Math.sin(t * 14) * 6 : 0), y: cy + 6 };
        }
      }
      k.tf(tw, tx, ty, tr);
      A.to('R', R.x, R.y); A.to('L', L.x, L.y);
      drops.forEach((d, i) => { const u = (t * 2.2 + i * 0.25) % 1; const on = t < 3.0 && !(t > 2.2 && dryP > 0.5); k.tf(d, (t < 1.5 ? 234 : R.x) - 8 + i * 5, (t < 1.5 ? TOP - 12 : R.y + 6) + u * 18); d.setAttribute('opacity', on ? 1 - u : 0); });
    }
  };
}
