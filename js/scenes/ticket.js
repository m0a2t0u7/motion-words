// ticket：パソコンで電車の切符を選んで「買う」を押すと、画面に切符（QRつき）が出る（例文 I bought a train ticket online.）
import { seg, lerp, easeInOut, backOut, hump, clamp } from '../ease.js';
import { reach, P, blinkAt, face, homeBg, desk } from './bag.js';
import { ticket as ticketProp } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, 'ネットで選ぶ'], [1.6, '買うを押す'], [2.4, '切符が買えた']] };

export function create(k) {
  const { el, tf, pal } = k, S = 1.15, FY = 236;
  homeBg(k, { FY, winX: 30, winW: 80 });
  const b = k.buddy({ x: 150, y: FY, scale: S });
  const top = desk(k, 120, 250, FY);
  // ノートパソコン（画面＋キーボード）
  const LX = 270;
  el('path', { d: `M ${LX - 48} ${top} L ${LX + 48} ${top} L ${LX + 40} ${top - 6} L ${LX - 40} ${top - 6} Z`, fill: '#C9D1DC' });
  el('rect', { x: LX - 44, y: top - 74, width: 88, height: 66, rx: 5, fill: pal.ink });
  const scr = k.g({});
  el('rect', { x: LX - 39, y: top - 69, width: 78, height: 56, rx: 2, fill: '#EEF5FC' }, scr);
  // 電車の絵と「BUY」ボタン
  el('rect', { x: LX - 32, y: top - 62, width: 30, height: 18, rx: 5, fill: pal.mint }, scr);
  el('rect', { x: LX - 28, y: top - 58, width: 9, height: 7, rx: 1, fill: '#fff' }, scr);
  el('rect', { x: LX - 16, y: top - 58, width: 9, height: 7, rx: 1, fill: '#fff' }, scr);
  el('rect', { x: LX + 4, y: top - 60, width: 28, height: 4, rx: 2, fill: pal.sub }, scr);
  el('rect', { x: LX + 4, y: top - 52, width: 20, height: 4, rx: 2, fill: pal.sub, opacity: 0.6 }, scr);
  const btn = el('rect', { x: LX - 18, y: top - 36, width: 36, height: 14, rx: 7, fill: pal.coral }, scr);
  k.text(LX, top - 28.5, 'BUY', { 'font-size': 9, fill: '#fff' }, scr);
  const done = k.g({});
  el('rect', { x: LX - 39, y: top - 69, width: 78, height: 56, rx: 2, fill: '#F4FBF7' }, done);
  const tk = ticketProp(k, done); tf(tk, LX - 8, top - 44, 0, 1.6);
  const qr = k.g({}, done);
  el('rect', { x: 0, y: 0, width: 16, height: 16, fill: '#fff', stroke: pal.ink, 'stroke-width': 1 }, qr);
  [[2, 2], [9, 2], [2, 9], [10, 10], [6, 6]].forEach(([x, y]) => el('rect', { x, y, width: 5, height: 5, fill: pal.ink }, qr));
  tf(qr, LX + 18, top - 52);
  const ck = el('path', { d: `M ${LX - 16} ${top - 22} l 5 5 l 10 -10`, stroke: pal.green, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, done);
  return {
    update(t) {
      P(b, { x: 150, lean: 14, look: 0.9, blink: blinkAt(t), mood: t > 2.4 ? 'grin' : 'smile' });
      face(b, 5, 1);
      // 手でタッチパッドを動かし、ボタンでクリック
      const press = hump(seg(t, 1.6, 1.9));
      const tx = lerp(LX - 30, LX - 4, easeInOut(seg(t, 0.4, 1.5))) + 3 * Math.sin(t * 6) * (t < 1.5);
      b.pose({ armR: reach(b, S, 'R', tx, top - 6 + 3 * press) });
      btn.setAttribute('fill', press > 0.3 ? pal.coralDark : pal.coral);
      const d = seg(t, 2.0, 2.4);
      done.setAttribute('opacity', d);
      tf(tk, LX - 8, top - 44, 0, 1.6 * (d <= 0 ? 0.001 : backOut(d)));
      ck.setAttribute('opacity', seg(t, 2.6, 2.8));
    }
  };
}
