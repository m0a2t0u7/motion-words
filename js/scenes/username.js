// username：ユーザー名とパスワードを入力する（例文 Enter your username and password.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, '空の入力欄'], [0.8, 'ユーザー名'], [2.4, 'パスワード']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 175, y: FY, scale: S });
  el('rect', { x: 216, y: 66, width: 168, height: 122, rx: 8, fill: '#3A4456' });
  el('rect', { x: 223, y: 73, width: 154, height: 108, rx: 3, fill: '#fff' });
  el('rect', { x: 223, y: 73, width: 154, height: 12, fill: '#E3E9F1' });
  el('rect', { x: 245, y: 92, width: 110, height: 84, rx: 8, fill: '#F7F9FC', stroke: '#C9D3DF', 'stroke-width': 2 });
  const f1 = el('rect', { x: 254, y: 102, width: 92, height: 22, rx: 5, fill: '#fff', stroke: '#C9D3DF', 'stroke-width': 2 });
  const f2 = el('rect', { x: 254, y: 134, width: 92, height: 22, rx: 5, fill: '#fff', stroke: '#C9D3DF', 'stroke-width': 2 });
  el('circle', { cx: 266, cy: 109, r: 3.5, fill: pal.sub });
  el('path', { d: 'M 259 120 Q 266 112 273 120 Z', fill: pal.sub });
  el('rect', { x: 260, y: 143, width: 12, height: 8, rx: 2, fill: pal.sub });
  el('path', { d: 'M 262 143 Q 262 137 266 137 Q 270 137 270 143', stroke: pal.sub, 'stroke-width': 2, fill: 'none' });
  const nm = el('rect', { x: 280, y: 110, width: 0, height: 7, rx: 3.5, fill: pal.ink });
  const dots = [0, 1, 2, 3, 4, 5].map((i) => el('circle', { cx: 286 + i * 10, cy: 145, r: 3.2, fill: pal.ink }));
  el('rect', { x: 276, y: 162, width: 48, height: 9, rx: 4.5, fill: pal.blue, opacity: 0.35 });
  desk(k, 196, 200, 198);
  el('rect', { x: 226, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  return {
    update(t) {
      const ty1 = t > 0.8 && t < 2.2, ty2 = t > 2.4 && t < 3.6;
      k.set(nm, { width: 56 * easeOut(seg(t, 0.8, 2.2)) });
      const n = Math.floor(seg(t, 2.4, 3.6) * 6.99);
      dots.forEach((d, i) => d.setAttribute('opacity', i < n ? 1 : 0));
      k.set(f1, { stroke: ty1 ? pal.blue : '#C9D3DF' });
      k.set(f2, { stroke: ty2 ? pal.blue : '#C9D3DF' });
      const ph = t * 14;
      pz(b, S, { x: 175, facing: 1, lean: 5 + (ty1 || ty2 ? 1 : 0), look: 1, blink: blinkAt(t), mood: t > 3.6 ? 'grin' : 'smile' },
        [236, 192 - (ty1 || ty2 ? 4 * Math.abs(Math.sin(ph)) : 0)], [226, 192 - (ty1 || ty2 ? 4 * Math.abs(Math.cos(ph)) : 0)]);
    }
  };
}
