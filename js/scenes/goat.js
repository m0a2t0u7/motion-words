// goat：ヤギがぴょん、ぴょんと岩の段をとびのぼり、てっぺんに立つ。まめが拍手する（例文 The goat climbed onto the rock.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { scene, hills, cloudG, mountain } from './nature.js';
import { beast } from './animal.js';

export const meta = { duration: 4.4, beats: [[0, '岩の下'], [1.0, 'とびのぼる'], [3.2, '岩の上に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const { FY } = scene(k, { FY: 240, top: '#CDE9FA', bot: '#F2FAFE', ground: '#BFE3A4', edge: '#A9D690' });
  mountain(k, 300, FY - 20, 260, 120, '#C3D3E2'); tf(cloudG(k, 70, 26), 100, 50); hills(k, FY);
  // 岩（段が2つ）
  k.shadow(290, FY + 2, 100, 6);
  el('path', { d: `M 196 ${FY} L 204 ${FY - 40} L 250 ${FY - 46} L 262 ${FY - 90} L 330 ${FY - 98} L 352 ${FY - 50} L 376 ${FY} Z`, fill: '#A9B2C0' });
  el('path', { d: `M 204 ${FY - 40} L 250 ${FY - 46} L 252 ${FY - 40} L 206 ${FY - 35} Z M 262 ${FY - 90} L 330 ${FY - 98} L 332 ${FY - 92} L 264 ${FY - 85} Z`, fill: '#C9D0DA' });
  el('path', { d: `M 330 ${FY - 98} L 352 ${FY - 50} L 376 ${FY} L 340 ${FY} Z`, fill: '#8F98A8' });
  const gt = beast(k, 'goat');
  const me = k.buddy({ x: 70, y: FY, scale: 0.9 });
  // 足場：地面 → 1段目 → てっぺん
  const P0 = { x: 130, y: FY }, P1 = { x: 228, y: FY - 43 }, P2 = { x: 296, y: FY - 94 };
  const jump = (t, a, A, B) => { const q = easeInOut(seg(t, a, a + 0.55)); return { x: lerp(A.x, B.x, q), y: lerp(A.y, B.y, q) - 40 * hump(q), q }; };
  return {
    update(t) {
      let pos = P0, q = 0, crouch = 0, tilt = 0;
      const crouch1 = hump(seg(t, 0.8, 1.2)), crouch2 = hump(seg(t, 1.9, 2.3));
      if (t < 1.1) { pos = P0; crouch = crouch1; }
      else if (t < 1.65) { const j = jump(t, 1.1, P0, P1); pos = j; q = j.q; tilt = -20 * hump(q); }
      else if (t < 2.2) { pos = P1; crouch = crouch2 + 0.5 * hump(seg(t, 1.65, 1.85)); }
      else if (t < 2.75) { const j = jump(t, 2.2, P1, P2); pos = j; q = j.q; tilt = -24 * hump(q); }
      else { pos = P2; crouch = 0.6 * hump(seg(t, 2.75, 3.0)); }
      gt.set({ x: pos.x, y: pos.y, s: 1.0, squash: 1 - 0.12 * crouch, tilt, head: t > 3.0 ? -10 : 4 * crouch, ph: q * 3, m: q > 0 ? 0.5 : 0, tail: Math.sin(t * 8) * 10 });
      const clap = t > 3.0 ? Math.abs(Math.sin(t * 12)) : 0;
      P(me, { x: 70, armR: t > 3.0 ? 60 + 22 * clap : 8, armL: t > 3.0 ? -(60 + 22 * clap) : 8, look: 0.9, mood: t > 3.0 ? 'grin' : t > 1.1 ? 'open' : 'smile', blink: blinkAt(t) });
    }
  };
}
