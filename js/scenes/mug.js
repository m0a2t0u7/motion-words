// mug：顔ほどもある大きなマグカップを両手で持ち、コーヒーを飲む（例文 I drink coffee from a big mug.）
import { seg, lerp, easeInOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, vessel, steam, sip, mouthAt, P, blinkAt } from './jam.js';

export const meta = { duration: 4.2, beats: [[0, '大きなマグ'], [1.0, '両手で持つ'], [2.0, 'コーヒーを飲む']] };

export function create(k) {
  const { el, pal } = k, S = 1.15;
  const kit = kitchen(k);
  const b = k.buddy({ x: 170, y: kit.FY, scale: S });
  kit.front();
  // 比べるための小さなカップ
  const small = vessel(k, null, { w: 16, h: 12, taper: 0.75, handle: 6, liquid: pal.coffee }); k.tf(small.g, 300, TOP + 2, 0, 1.1); small.set(0);
  const MX = 236;
  const mug = vessel(k, null, { w: 44, h: 50, taper: 0.95, handle: 14, col: '#FFCF5C', stroke: '#E9B43A', liquid: pal.coffee });
  const dot = el('circle', { r: 7, fill: '#fff', opacity: 0.8 });
  const st = steam(k, null, 3, 22);
  const A = arms(k, b, S);
  return {
    update(t) {
      const q = easeInOut(seg(t, 1.0, 1.7)) * (1 - easeInOut(seg(t, 3.3, 3.9)));
      P(b, { lean: 4, look: 0.5, blink: q > 0.6 ? 1 : blinkAt(t), mood: q > 0.6 ? 'flat' : t > 3.5 ? 'grin' : 'smile' });
      mug.set(0.85 - 0.3 * easeInOut(seg(t, 1.8, 3.2)));
      const pre = easeInOut(seg(t, 0.3, 0.9));
      if (t < 1.0) { k.tf(mug.g, MX, TOP + 2); A.to('R', lerp(206, MX + 30, pre), lerp(214, TOP - 26, pre)); A.to('L', lerp(150, MX - 22, pre), lerp(214, TOP - 18, pre)); }
      else {
        const h = sip(k, A, b, S, mug.g, 'R', { x: MX, y: TOP + 2 }, q, { w: 44, h: 50, tilt: 35 });
        // 左手は胴の反対側を支える
        A.to('L', h.x - 44 + 8 * q, h.y + 12 - 6 * q);
      }
      const n = mug.g.getAttribute('transform'); dot.setAttribute('transform', n + ' translate(0 -24)');
      st.set(t < 1.0 ? MX : -99, TOP - 54, 1, t);
      void mouthAt;
    }
  };
}
