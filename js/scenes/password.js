// password：パスワードを入れても通らず、またパスワードを忘れて頭をかく（例文 I forgot my password again.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, '入力する'], [1.8, '2回目も×'], [3.0, '思い出せない']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 150, y: FY, scale: S });
  el('rect', { x: 236, y: 92, width: 120, height: 94, rx: 8, fill: '#3A4456' });
  el('rect', { x: 243, y: 99, width: 106, height: 80, rx: 3, fill: '#F7F9FC' });
  el('rect', { x: 243, y: 99, width: 106, height: 16, fill: pal.violet });
  el('circle', { cx: 296, cy: 128, r: 6, fill: '#C9D3DF' });
  el('rect', { x: 256, y: 138, width: 80, height: 18, rx: 4, fill: '#fff', stroke: pal.violet, 'stroke-width': 2 });
  const dots = [0, 1, 2, 3, 4, 5].map((i) => el('circle', { cx: 266 + i * 11, cy: 147, r: 3, fill: pal.ink }));
  const bad = k.text(296, 170, '✕', { 'font-size': 14, fill: pal.red });
  desk(k, 215, 180, 198);
  el('rect', { x: 236, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  const q = cloud(k, 74, 50, -1);
  const qm = k.text(0, 8, '?', { 'font-size': 26, fill: pal.sub }, q.g);
  return {
    update(t) {
      // 2回入力して2回とも×、その後頭をかく
      const n = (a, c) => Math.floor(clamp((t - a) / (c - a)) * 6);
      const typing = (t > 0.3 && t < 1.0) || (t > 1.9 && t < 2.6);
      const cnt = t < 1.0 ? n(0.3, 1.0) : t < 1.4 ? 6 : t < 1.9 ? 0 : t < 2.6 ? n(1.9, 2.6) : 6;
      dots.forEach((d, i) => d.setAttribute('opacity', i < cnt ? 1 : 0));
      const fail = (t > 1.0 && t < 1.7) || t > 2.6;
      bad.setAttribute('opacity', fail ? 1 : 0);
      k.tf(bad, fail ? Math.sin(t * 40) * 3 * (t < 1.7 || t < 3.0 ? 1 : 0) : 0, 0);
      const scratch = seg(t, 3.0, 3.4);
      const ph = t * 14;
      const o = { x: 150, facing: 1, lean: 5, look: 1, blink: blinkAt(t), mood: scratch > 0 ? 'sad' : fail ? 'flat' : 'smile' };
      if (scratch > 0) {
        P(b, { ...o, armR: lerp(8, 160, easeOut(scratch)) + Math.sin(t * 12) * 8 * scratch, lean: 0 });
      } else {
        pz(b, S, o, [244, 192 - (typing ? 4 * Math.abs(Math.sin(ph)) : 0)], null);
      }
      q.show(seg(t, 3.2, 3.6), 168, 52);
    }
  };
}
