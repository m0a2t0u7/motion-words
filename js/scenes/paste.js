// paste：画面の文章を選んでコピーキー、続けて貼り付けキーを押すと、右の枠に文章が入る（例文 Copy the text and paste it here.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.0, beats: [[0, '文章を選ぶ'], [1.4, 'コピー'], [3.0, '貼り付け']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  // モニター
  el('rect', { x: 236, y: 186, width: 28, height: 14, rx: 3, fill: '#C9D3DF' });
  el('rect', { x: 206, y: 40, width: 184, height: 150, rx: 10, fill: '#2A3242' });
  el('rect', { x: 214, y: 48, width: 168, height: 134, rx: 5, fill: '#F7F9FC' });
  // 左ウィンドウ：元の文章
  el('rect', { x: 220, y: 56, width: 74, height: 118, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const sel = el('rect', { x: 224, y: 86, width: 66, height: 14, rx: 2, fill: pal.blue, opacity: 0 });
  [70, 93, 116, 132, 148].forEach((y, i) => el('rect', { x: 226, y: y, width: i === 1 ? 54 : 58 - (i % 2) * 12, height: 4, rx: 2, fill: pal.sub, opacity: 0.8 }));
  // 右ウィンドウ：貼り付け先
  el('rect', { x: 302, y: 56, width: 74, height: 118, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  [70, 116, 132, 148].forEach((y, i) => el('rect', { x: 308, y: y, width: 56 - (i % 2) * 12, height: 4, rx: 2, fill: pal.line }));
  const slot = el('rect', { x: 306, y: 90, width: 66, height: 14, rx: 2, fill: 'none', stroke: pal.blue, 'stroke-width': 1.5, 'stroke-dasharray': '3 2' });
  const pasted = el('rect', { x: 308, y: 93, width: 54, height: 4, rx: 2, fill: pal.sub, opacity: 0 });
  const chip = el('rect', { x: -27, y: -7, width: 54, height: 14, rx: 3, fill: pal.blue, opacity: 0 });
  // キーボード
  const S = 1.0;
  const kb = g({});
  el('path', { d: 'M 150 200 L 158 188 L 232 188 L 240 200 Z', fill: '#C9D3DF', stroke: '#9AA6B6', 'stroke-width': 1.2 }, kb);
  const keys = ['C', 'V'].map((ch, i) => {
    const x = 180 + i * 26;
    const r = el('rect', { x: x - 9, y: 190, width: 18, height: 8, rx: 2, fill: '#fff' }, kb);
    k.text(x, 194.5, ch, { 'font-size': 7, 'font-weight': 800 }, kb);
    return { r, x };
  });
  const me = k.buddy({ x: 128, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });

  return {
    update(t) {
      const tap1 = seg(t, 1.4, 1.75), tap2 = seg(t, 3.0, 3.35);
      const phase = t < 2.4 ? 0 : 1;
      const px = keys[phase].x;
      const lift = phase === 0 ? 10 * (1 - hump(tap1)) * (t > 1.2 ? 1 : 0.6) : 10 * (1 - hump(tap2));
      const move = easeInOut(seg(t, 2.3, 2.8));
      const bx = lerp(128, 150, move);
      const act = easeOut(seg(t, 0.8, 1.3));
      me.pose({ x: bx, armL: 8, lean: 3, look: 0.5, mood: t > 3.6 ? 'grin' : 'smile', squash: 1, armR: 40 });
      const kx = lerp(keys[0].x, keys[1].x, move);
      const a = lerp(40, reach(me, S, 'R', kx, 188 - Math.max(0, lift) - (t > 1.0 ? 0 : 6)), act);
      me.pose({ armR: a });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      keys[0].r.setAttribute('fill', hump(tap1) > 0.3 ? pal.yellow : '#fff');
      keys[1].r.setAttribute('fill', hump(tap2) > 0.3 ? pal.yellow : '#fff');
      sel.setAttribute('opacity', seg(t, 0.4, 0.7) * 0.55);
      // コピー：選んだ文章が浮いて、貼り付けで右へ飛ぶ
      const fly = easeInOut(seg(t, 3.25, 3.9));
      chip.setAttribute('opacity', t >= 3.25 && fly < 1 ? 0.85 : 0);
      tf(chip, lerp(257, 335, fly), lerp(93, 97, fly) - 14 * hump(fly), 0, 1);
      pasted.setAttribute('opacity', fly >= 1 ? 1 : 0);
      slot.setAttribute('opacity', fly >= 1 ? 0 : 1);
      if (fly >= 1) sel.setAttribute('opacity', 0.55);
      if (t >= 1.75 && t < 3.25) sel.setAttribute('fill', pal.blueDark);
    }
  };
}
