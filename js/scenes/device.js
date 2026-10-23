// device：電子機器（スマホ・タブレット・パソコン）の電源を1台ずつ切る（例文 Please turn off all electronic devices.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, '全部ついている'], [1.4, '1台ずつ切る'], [3.4, '全部オフ']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  desk(k, 270, 260, 198);
  // 画面（ついている間は光る）
  const mk = (x, w, h, col) => {
    el('rect', { x: x - w / 2, y: 198 - h - 8, width: w, height: h, rx: 5, fill: '#3A4456' });
    el('rect', { x: x - 3, y: 198 - 8, width: 6, height: 8, fill: '#B9C2CF' });
    el('rect', { x: x - w / 3, y: 195, width: w * 0.66, height: 3, rx: 1.5, fill: '#B9C2CF' });
    const s = el('rect', { x: x - w / 2 + 4, y: 198 - h - 4, width: w - 8, height: h - 8, rx: 3, fill: col });
    el('circle', { cx: x, cy: 198 - h + 2, r: 4, fill: '#fff', opacity: 0.5 });
    return s;
  };
  const sc = [mk(245, 30, 52, pal.blue), mk(305, 50, 44, pal.mint), mk(365, 60, 52, pal.violet)];
  const b = k.buddy({ x: 170, y: FY, scale: S });
  const cols = [pal.blue, pal.mint, pal.violet];
  const hx = [245, 305, 365], hy = [152, 158, 148];
  const xf = (t) => lerp(lerp(lerp(170, 202, easeInOut(seg(t, 0.2, 0.9))), 262, easeInOut(seg(t, 1.5, 2.1))), 322, easeInOut(seg(t, 2.6, 3.2)));
  return {
    update(t) {
      const tp = [seg(t, 0.9, 1.1), seg(t, 2.1, 2.3), seg(t, 3.2, 3.4)];
      sc.forEach((s, i) => k.set(s, { fill: tp[i] >= 1 ? '#2B3342' : cols[i] }));
      const press = [hump(seg(t, 0.9, 1.3)), hump(seg(t, 2.1, 2.5)), hump(seg(t, 3.2, 3.6))];
      const w = walkTo(xf, t, 170);
      const idx = t < 1.7 ? 0 : t < 2.9 ? 1 : 2;
      const pr = Math.max(...press);
      const moving = Math.abs(xf(t + 0.03) - xf(t - 0.03)) > 0.05;
      const o = { x: w.x, walk: w.walk, facing: 1, lean: 6, look: 1, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' };
      pz(b, S, o, moving ? null : [hx[idx] - 6, hy[idx] + 4 * pr], null);
      if (moving) P(b, { ...o, armR: w.armR, armL: w.armL });
    }
  };
}
