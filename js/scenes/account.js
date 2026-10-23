// account：サイトの登録フォームに入力し、新しいアカウントができる（例文 I created a new account on the site.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.4, beats: [[0, '登録フォーム'], [1.4, '登録を押す'], [3.0, '新アカウント']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 175, y: FY, scale: S });
  el('rect', { x: 216, y: 66, width: 168, height: 122, rx: 8, fill: '#3A4456' });
  el('rect', { x: 223, y: 73, width: 154, height: 108, rx: 3, fill: '#fff' });
  el('rect', { x: 223, y: 73, width: 154, height: 12, fill: '#E3E9F1' });
  const form = k.g({});
  [0, 1, 2].forEach((i) => el('rect', { x: 250, y: 96 + i * 22, width: 100, height: 16, rx: 4, fill: '#fff', stroke: '#C9D3DF', 'stroke-width': 2 }, form));
  const fl = [0, 1, 2].map((i) => el('rect', { x: 256, y: 101 + i * 22, width: 0, height: 6, rx: 3, fill: pal.ink }, form));
  const btn = el('rect', { x: 270, y: 160, width: 60, height: 18, rx: 9, fill: pal.coral }, form);
  const card = k.g({});
  el('rect', { x: 246, y: 92, width: 108, height: 78, rx: 10, fill: '#F7F9FC', stroke: pal.green, 'stroke-width': 3 }, card);
  el('circle', { cx: 280, cy: 124, r: 16, fill: pal.mint }, card);
  el('circle', { cx: 274, cy: 122, r: 2.4, fill: pal.ink }, card);
  el('circle', { cx: 286, cy: 122, r: 2.4, fill: pal.ink }, card);
  el('path', { d: 'M 275 129 Q 280 134 285 129', stroke: pal.ink, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, card);
  el('rect', { x: 304, y: 114, width: 38, height: 7, rx: 3.5, fill: pal.ink }, card);
  el('rect', { x: 304, y: 128, width: 30, height: 5, rx: 2.5, fill: '#C9D3DF' }, card);
  el('rect', { x: 258, y: 148, width: 40, height: 14, rx: 7, fill: pal.coral }, card);
  k.text(278, 158, 'NEW', { 'font-size': 9, fill: '#fff' }, card);
  el('path', { d: 'M 318 154 L 324 160 L 336 148', stroke: pal.green, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, card);
  desk(k, 196, 200, 198);
  el('rect', { x: 226, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  const cur = el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
  return {
    update(t) {
      fl.forEach((f, i) => k.set(f, { width: (i === 2 ? 40 : 70) * easeOut(seg(t, 0.4 + i * 0.35, 0.9 + i * 0.35)) }));
      const typing = t > 0.4 && t < 1.7;
      const mv = easeInOut(seg(t, 1.5, 2.2)), press = hump(seg(t, 2.2, 2.5)), made = seg(t, 2.5, 3.0);
      k.set(btn, { fill: press > 0.2 ? pal.coralDark : pal.coral });
      form.setAttribute('opacity', made > 0 ? 0 : 1);
      k.tf(card, 0, (1 - backOut(made)) * 10); card.setAttribute('opacity', clamp(made * 3));
      k.tf(cur, lerp(330, 300, mv), lerp(150, 172, mv) + press * 2, 0, 1 - 0.1 * press, 1 - 0.1 * press);
      cur.setAttribute('opacity', made > 0 ? 0 : seg(t, 1.5, 1.7));
      const ph = t * 14;
      pz(b, S, { x: 175, facing: 1, lean: 5, look: 1, blink: blinkAt(t), mood: made > 0.5 ? 'grin' : 'smile' },
        [lerp(236, 242, mv), 192 - (typing ? 4 * Math.abs(Math.sin(ph)) : 0) - press * 3], null);
    }
  };
}
