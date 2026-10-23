// website：ウェブサイトの注文ボタンを押してネットで注文する（例文 You can order online from our website.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from '../ease.js';
import { P, blinkAt, walkTo } from './run-after.js';
import { roomBg, desk, say, cloud } from './look-over.js';
import { hp, held, reach } from './dig.js';
function pz(b, S, o, R, L) { P(b, o); const a = {}; if (R) a.armR = reach(b, S, 'R', R[0], R[1]); if (L) a.armL = reach(b, S, 'L', L[0], L[1]); P(b, { ...o, ...a }); }

export const meta = { duration: 4.0, beats: [[0, 'サイトを見る'], [1.4, '注文を押す'], [3.0, '注文できた']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = roomBg(k, 'home');
  const S = 1.1;
  const b = k.buddy({ x: 175, y: FY, scale: S });
  el('rect', { x: 216, y: 66, width: 168, height: 122, rx: 8, fill: '#3A4456' });
  el('rect', { x: 223, y: 73, width: 154, height: 108, rx: 3, fill: '#fff' });
  el('rect', { x: 223, y: 73, width: 154, height: 14, fill: '#E3E9F1' });
  el('rect', { x: 240, y: 76, width: 96, height: 8, rx: 4, fill: '#fff' });
  k.text(288, 81, 'www', { 'font-size': 7, fill: pal.sub });
  el('rect', { x: 233, y: 96, width: 56, height: 42, rx: 6, fill: pal.mint });
  el('circle', { cx: 261, cy: 112, r: 9, fill: '#fff', opacity: 0.8 });
  el('rect', { x: 233, y: 144, width: 56, height: 5, rx: 2.5, fill: '#C9D3DF' });
  el('rect', { x: 298, y: 96, width: 70, height: 6, rx: 3, fill: '#C9D3DF' });
  el('rect', { x: 298, y: 108, width: 50, height: 6, rx: 3, fill: '#E3E9F1' });
  const btn = el('rect', { x: 298, y: 148, width: 70, height: 22, rx: 11, fill: pal.coral });
  const bl = k.text(333, 160, 'ORDER', { 'font-size': 9, fill: '#fff' });
  const ck = el('path', { d: 'M 322 159 L 330 167 L 346 150', stroke: '#fff', 'stroke-width': 3.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': 1 });
  const cart = el('circle', { cx: 366, cy: 80, r: 6, fill: pal.red });
  const cn = k.text(366, 83, '1', { 'font-size': 8, fill: '#fff' });
  desk(k, 196, 200, 198);
  el('rect', { x: 226, y: 190, width: 80, height: 8, rx: 3, fill: '#DDE3EA' });
  const cur = el('path', { d: 'M0 0 L0 15 L4 11.5 L7 18 L10 16.5 L7 10.5 L12 10.5 Z', fill: pal.ink, stroke: '#fff', 'stroke-width': 1.4, 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const mv = easeInOut(seg(t, 0.5, 1.5)), press = hump(seg(t, 1.5, 1.8)), done = seg(t, 1.8, 2.2);
      const cx = lerp(250, 328, mv), cy = lerp(120, 156, mv);
      k.tf(cur, cx, cy + press * 2, 0, 1 - 0.1 * press, 1 - 0.1 * press);
      k.set(btn, { fill: done > 0.5 ? pal.green : press > 0.2 ? pal.coralDark : pal.coral });
      bl.setAttribute('opacity', done > 0.5 ? 0 : 1); ck.setAttribute('stroke-dashoffset', 1 - clamp((done - 0.4) / 0.6));
      const cs = 1 + 0.5 * hump(seg(t, 2.2, 2.7));
      k.tf(cart, 0, 0, 0, 1, 1); cart.setAttribute('opacity', done > 0.9 ? 1 : 0); cn.setAttribute('opacity', done > 0.9 ? 1 : 0);
      const ph = Math.sin(t * 8);
      pz(b, S, { x: 175, facing: 1, lean: 5, look: 1, blink: blinkAt(t), mood: done > 0.5 ? 'grin' : 'smile' }, [lerp(215, 238, mv) + 0, 192 - press * 3], null);
    }
  };
}
