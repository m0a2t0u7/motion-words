// update：古い画面の携帯。更新の通知をタップすると進捗バーが満ち、新しい画面になる（例文 I need to update my phone.）
import { seg, lerp, easeInOut, easeOut, backOut } from '../ease.js';
import { reach } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '更新の通知'], [1.4, '更新中'], [3.6, '新しい画面']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 238, mood: 'indoor' });
  el('rect', { x: 36, y: 50, width: 90, height: 70, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const b = k.buddy({ x: 130, y: FY });
  // 携帯（体の右前に大きく見せる）
  const PX = 250, PY = 70, PW = 100, PH = 170;
  const ph = g({}); tf(ph, PX, PY);
  k.shadow(PX + PW / 2, FY - 2, 46, 6);
  el('rect', { width: PW, height: PH, rx: 14, fill: '#3A4457' }, ph);
  el('rect', { x: 5, y: 8, width: PW - 10, height: PH - 16, rx: 9, fill: '#F2F4F8' }, ph);
  // ホーム画面：古い（くすんだ）アイコン → 新しい（鮮やか）
  const cols = [[pal.coral, '#D8B8B0'], [pal.yellow, '#D8CDA8'], [pal.blue, '#B4C2D4'], [pal.violet, '#C4BCD8'], [pal.mint, '#B0CFC8'], [pal.red, '#D8B0B0']];
  const icons = cols.map(([n, o], i) => {
    const x = 16 + (i % 3) * 25, y = 22 + Math.floor(i / 3) * 28;
    const old = el('rect', { x, y, width: 19, height: 19, rx: 5, fill: o }, ph), nw = el('rect', { x, y, width: 19, height: 19, rx: 5, fill: n, opacity: 0 }, ph);
    return { old, nw };
  });
  const clock = g({}, ph);
  // 通知バナー
  const ban = g({}, ph);
  el('rect', { x: 10, y: 84, width: 80, height: 30, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, ban);
  el('circle', { cx: 24, cy: 99, r: 8, fill: pal.blue }, ban); el('path', { d: 'M 24 94 V 103 M 20 99 L 24 103 L 28 99', stroke: '#fff', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ban);
  el('rect', { x: 38, y: 92, width: 44, height: 5, rx: 2, fill: pal.ink }, ban); el('rect', { x: 38, y: 101, width: 32, height: 4, rx: 2, fill: pal.line }, ban);
  const badge = g({}, ph); tf(badge, 91, 12); el('circle', { r: 8, fill: pal.red, stroke: '#fff', 'stroke-width': 2 }, badge); k.text(0, 0, '1', { 'font-size': 10, fill: '#fff' }, badge);
  // 更新画面
  const up = g({}, ph);
  el('rect', { x: 5, y: 8, width: PW - 10, height: PH - 16, rx: 9, fill: '#fff' }, up);
  const cir = g({}, up); tf(cir, 50, 70);
  el('circle', { r: 20, fill: pal.blue }, cir); el('path', { d: 'M 0 -9 V 9 M -8 2 L 0 10 L 8 2', stroke: '#fff', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, cir);
  el('rect', { x: 14, y: 108, width: 72, height: 8, rx: 4, fill: pal.line }, up);
  const bar = el('rect', { x: 14, y: 108, width: 0, height: 8, rx: 4, fill: pal.blue }, up);
  const ok = g({}, up); tf(ok, 50, 70);
  el('circle', { r: 22, fill: pal.green }, ok); el('path', { d: 'M -9 0 L -2 7 L 10 -7', stroke: '#fff', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ok);
  const tap = el('circle', { r: 8, fill: 'none', stroke: pal.blue, 'stroke-width': 2.5 });
  return {
    update(t) {
      const tp = seg(t, 0.9, 1.3), load = easeInOut(seg(t, 1.4, 3.4)), fin = backOut(seg(t, 3.5, 4.0), 1.5);
      const scr = t < 1.3 ? 0 : 1;
      up.setAttribute('opacity', scr);
      ban.setAttribute('opacity', t < 1.3 ? 1 : 0); badge.setAttribute('opacity', t < 1.3 ? 1 : 0);
      k.set(bar, { width: 72 * load });
      tf(cir, 50, 66, 0, 1 - 0.0 - fin * 1, 1 - fin * 1); cir.setAttribute('opacity', 1 - seg(t, 3.4, 3.6));
      tf(ok, 50, 70, 0, fin + 0.001, fin + 0.001);
      // 完了後は更新画面が消えてホーム（鮮やかなアイコン）が出る
      const home = seg(t, 4.1, 4.5);
      up.setAttribute('opacity', t < 1.3 ? 0 : 1 - home);
      icons.forEach((ic, i) => ic.nw.setAttribute('opacity', home > 0 ? seg(t, 4.1 + i * 0.05, 4.4 + i * 0.05) : 0));
      // 手でタップ
      const tx = PX + 50, ty = PY + 99;
      b.pose({ armR: lerp(8, reach(b, 1, 'R', tx, ty), easeOut(seg(t, 0.4, 1.0))) * (1 - seg(t, 1.5, 1.9)) + 8 * seg(t, 1.5, 1.9) + 6 * Math.sin(seg(t, 1.0, 1.3) * Math.PI), lean: 4 * (1 - seg(t, 1.5, 1.9)), look: 0.7, mood: t > 3.6 ? 'grin' : 'smile', squash: 1 });
      const rr = seg(t, 1.0, 1.5); k.set(tap, { cx: tx, cy: ty, r: 6 + 16 * rr, opacity: rr > 0 && rr < 1 ? 1 - rr : 0 });
    }
  };
}
