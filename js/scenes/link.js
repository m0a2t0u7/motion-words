// link：リンクをクリックすると動画が再生される（例文 Click the link to watch the video.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.2, beats: [[0, 'リンクがある'], [1.2, 'クリック'], [2.6, '動画が始まる']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 175, y: FY, scale: S });
  el('rect', { x: 216, y: 66, width: 168, height: 122, rx: 8, fill: '#3A4456' });
  el('rect', { x: 223, y: 73, width: 154, height: 108, rx: 3, fill: '#fff' });
  el('rect', { x: 223, y: 73, width: 154, height: 12, fill: '#E3E9F1' });
  el('rect', { x: 236, y: 96, width: 100, height: 6, rx: 3, fill: '#C9D3DF' });
  el('rect', { x: 236, y: 108, width: 70, height: 6, rx: 3, fill: '#C9D3DF' });
  const ln = k.text(262, 138, 'LINK', { 'font-size': 14, fill: pal.blueDark });
  const ul = el('rect', { x: 246, y: 141, width: 32, height: 2, fill: pal.blueDark });
  el('rect', { x: 236, y: 154, width: 90, height: 6, rx: 3, fill: '#E3E9F1' });
  const vid = k.g({});
  el('rect', { x: 234, y: 90, width: 130, height: 82, rx: 6, fill: '#2B3342', stroke: '#fff', 'stroke-width': 3 }, vid);
  el('circle', { cx: 299, cy: 128, r: 18, fill: pal.coral }, vid);
  el('path', { d: 'M 293 118 L 293 138 L 311 128 Z', fill: '#fff' }, vid);
  el('rect', { x: 242, y: 162, width: 114, height: 4, rx: 2, fill: '#556', opacity: 0.8 }, vid);
  const pb = el('rect', { x: 242, y: 162, width: 0, height: 4, rx: 2, fill: pal.red }, vid);
  desk(k, 196, 200, 198);
  el('rect', { x: 226, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  const cur = el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const mv = easeInOut(seg(t, 0.4, 1.2)), press = hump(seg(t, 1.2, 1.5)), open = seg(t, 1.5, 1.9);
      k.tf(cur, lerp(330, 262, mv), lerp(160, 134, mv) + press * 2, 0, 1 - 0.1 * press, 1 - 0.1 * press);
      cur.setAttribute('opacity', open > 0.5 ? 0 : 1);
      k.set(ln, { fill: press > 0.2 ? pal.violet : pal.blueDark });
      k.tf(vid, 0, (1 - easeOut(open)) * 8); vid.setAttribute('opacity', easeOut(open));
      k.set(pb, { width: 114 * seg(t, 2.4, 4.0) * 0.5 });
      pz(b, S, { x: 175, facing: 1, lean: 5, look: 1, blink: blinkAt(t), mood: open > 0.5 ? 'grin' : 'smile' }, [lerp(222, 236, mv), 192 - press * 3], null);
    }
  };
}
