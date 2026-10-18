// download：「無料」のボタンをクリックすると、雲からファイルが降りてきてパソコンのフォルダに入る（例文 You can download the file for free.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, '無料のボタン'], [1.4, 'ファイルが降りる'], [3.6, '保存できた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 雲
  const cl = g({}); tf(cl, 300, 28);
  [[-18, 4, 11], [0, -4, 15], [18, 4, 11]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#DDEFFA' }, cl));
  el('rect', { x: -28, y: 4, width: 56, height: 11, rx: 5, fill: '#DDEFFA' }, cl);
  el('path', { d: 'M 0 -2 V 10 M -5 6 L 0 11 L 5 6', stroke: pal.blue, 'stroke-width': 2.4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cl);
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  // モニター
  el('rect', { x: 276, y: 168, width: 28, height: 32, rx: 3, fill: '#C9D3DF' });
  el('rect', { x: 206, y: 56, width: 184, height: 120, rx: 10, fill: '#2A3242' });
  el('rect', { x: 214, y: 64, width: 168, height: 104, rx: 5, fill: '#F7F9FC' });
  el('rect', { x: 224, y: 72, width: 90, height: 8, rx: 4, fill: pal.line });
  const btn = g({}); tf(btn, 298, 112);
  const btnR = el('rect', { x: -34, y: -12, width: 68, height: 24, rx: 12, fill: pal.green }, btn);
  k.text(0, 0, 'FREE', { 'font-size': 12, fill: '#fff' }, btn);
  const barBg = el('rect', { x: 262, y: 138, width: 72, height: 5, rx: 2.5, fill: pal.line, opacity: 0 });
  const bar = el('rect', { x: 262, y: 138, width: 0, height: 5, rx: 2.5, fill: pal.green });
  // フォルダ
  const fol = g({}); tf(fol, 356, 150);
  el('path', { d: 'M -14 -9 h 10 l 4 4 h 14 v 18 h -28 Z', fill: pal.yellow }, fol);
  el('rect', { x: -14, y: -3, width: 28, height: 14, rx: 2, fill: pal.yellowDark }, fol);
  const chk = g({}); tf(chk, 366, 140, 0, 0.001);
  el('circle', { r: 8, fill: pal.green }, chk);
  el('path', { d: 'M -3.4 0 L -1 2.6 L 3.8 -2.8', stroke: '#fff', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, chk);
  const S = 1.0;
  const me = k.buddy({ x: 140, y: FY, scale: S });
  // マウスは手のそば
  el('ellipse', { cx: 192, cy: 197, rx: 9, ry: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const cur = g({});
  el('path', { d: 'M 0 0 L 0 14 L 4 10.5 L 7 16 L 9.5 14.8 L 6.6 9.4 L 12 9 Z', fill: '#fff', stroke: pal.ink, 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, cur);
  const file = g({});
  el('path', { d: 'M -9 -12 h 12 l 6 6 v 18 h -18 Z', fill: '#fff', stroke: pal.blue, 'stroke-width': 2, 'stroke-linejoin': 'round' }, file);
  el('path', { d: 'M 3 -12 v 6 h 6', fill: pal.line, stroke: pal.blue, 'stroke-width': 1.6 }, file);
  el('path', { d: 'M -4 2 h 8 M -4 6 h 6', stroke: pal.blue, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, file);

  return {
    update(t) {
      const reachP = easeInOut(seg(t, 0.3, 0.9)), click = hump(seg(t, 1.1, 1.5));
      me.pose({ x: 140, armL: 8, lean: 3, look: 0.5, mood: t > 3.6 ? 'grin' : 'smile', squash: 1, armR: 30 });
      me.pose({ armR: lerp(30, reach(me, S, 'R', 190, 192 - 6 * (1 - click)), reachP) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      // カーソルがボタンへ移動してクリック
      const cp = easeInOut(seg(t, 0.4, 1.1));
      tf(cur, lerp(234, 306, cp) - 1, lerp(150, 116, cp) + 2 * click, 0, 1 + 0.0);
      tf(btn, 298, 112, 0, 1 - 0.1 * click);
      btnR.setAttribute('fill', click > 0.3 ? '#3F9F5E' : pal.green);
      const go = seg(t, 1.5, 3.5);
      barBg.setAttribute('opacity', t > 1.5 ? 1 : 0);
      bar.setAttribute('width', 72 * easeInOut(go));
      // ファイルが雲から降りる
      const fp = easeInOut(seg(t, 1.5, 3.3));
      file.setAttribute('opacity', t > 1.5 && fp < 1 ? 1 : 0);
      tf(file, lerp(300, 356, fp), lerp(36, 140, fp) - 6 * hump(fp), lerp(-8, 8, fp) * hump(fp), lerp(1, 0.85, fp));
      tf(fol, 356, 150, 0, 1 + 0.18 * hump(seg(t, 3.25, 3.6)), 1 - 0.12 * hump(seg(t, 3.25, 3.6)));
      tf(chk, 368, 138, 0, backOut(seg(t, 3.5, 4.0)) + 0.001);
      tf(cl, 300, 28 - 2 * Math.sin(t * 2));
    }
  };
}
