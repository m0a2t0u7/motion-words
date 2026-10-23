// software：ソフトを更新する（バージョンが古い→更新ボタン→進行バー→新しい版）（例文 You need to update the software.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, '古い版'], [1.2, '更新中'], [3.2, '新しい版']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 175, y: FY, scale: S });
  el('rect', { x: 216, y: 66, width: 168, height: 122, rx: 8, fill: '#3A4456' });
  el('rect', { x: 223, y: 73, width: 154, height: 108, rx: 3, fill: '#fff' });
  el('rect', { x: 223, y: 73, width: 154, height: 12, fill: '#E3E9F1' });
  el('rect', { x: 240, y: 94, width: 36, height: 36, rx: 9, fill: pal.violet });
  el('circle', { cx: 258, cy: 112, r: 8, fill: '#fff', opacity: 0.85 });
  const v1 = k.text(330, 108, 'v1.0', { 'font-size': 16, fill: pal.sub });
  const v2 = k.text(330, 108, 'v2.0', { 'font-size': 16, fill: pal.green });
  const badge = el('circle', { cx: 274, cy: 96, r: 6, fill: pal.red });
  el('rect', { x: 240, y: 138, width: 120, height: 9, rx: 4.5, fill: '#E3E9F1' });
  const bar = el('rect', { x: 240, y: 138, width: 120, height: 9, rx: 4.5, fill: pal.blue });
  const btn = el('rect', { x: 270, y: 154, width: 60, height: 20, rx: 10, fill: pal.coral });
  const bl = k.text(300, 168, 'UPDATE', { 'font-size': 9, fill: '#fff' });
  const ck = el('path', { d: 'M 288 164 L 297 172 L 314 156', stroke: '#fff', 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 });
  desk(k, 196, 200, 198);
  el('rect', { x: 226, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  const cur = el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const mv = easeInOut(seg(t, 0.3, 1.0)), press = hump(seg(t, 1.0, 1.3)), pr = seg(t, 1.3, 3.0), done = seg(t, 3.0, 3.4);
      k.tf(cur, lerp(250, 296, mv), lerp(124, 164, mv) + press * 2, 0, 1 - 0.1 * press, 1 - 0.1 * press);
      k.set(bar, { width: 120 * easeInOut(pr) });
      k.set(btn, { fill: done > 0.5 ? pal.green : press > 0.2 ? pal.coralDark : pal.coral });
      bl.setAttribute('opacity', done > 0.5 ? 0 : 1); ck.setAttribute('stroke-dashoffset', 1 - clamp((done - 0.4) / 0.6));
      v1.setAttribute('opacity', pr >= 1 ? 0 : 1); v2.setAttribute('opacity', pr >= 1 ? 1 : 0);
      badge.setAttribute('opacity', pr > 0 ? 0 : 1);
      pz(b, S, { x: 175, facing: 1, lean: 5, look: 1, blink: blinkAt(t), mood: done > 0.5 ? 'grin' : 'smile' }, [lerp(215, 238, mv), 192 - press * 3], null);
    }
  };
}
