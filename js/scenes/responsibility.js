// responsibility：家族が先に出かけ、最後に出るまめが自分の鍵で玄関のドアに鍵をかけ、ちゃんと閉まったか確かめる（例文 It's my responsibility to lock the door.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hp, aim, walkTo, path, person, streetBg, mark } from './confused.js';

export const meta = { duration: 4.4, beats: [[0.0, '最後に出る'], [1.53, '鍵をかける'], [3.06, '確かめてOK']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1;
  const FY = streetBg(k);
  // 家の正面と玄関ドア
  el('rect', { x: 120, y: FY - 170, width: 200, height: 170, fill: '#F7EBDD' });
  el('path', { d: `M 104 ${FY - 166} L 220 ${FY - 220} L 336 ${FY - 166} Z`, fill: '#C98A5A' });
  el('rect', { x: 140, y: FY - 140, width: 50, height: 40, rx: 3, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 4 });
  const DX = 220, DW = 64;
  el('rect', { x: DX - 4, y: FY - 124, width: DW + 8, height: 124, fill: '#C98A5A' });
  el('rect', { x: DX, y: FY - 120, width: DW, height: 120, fill: '#5C7FD6' });
  el('circle', { cx: DX + 12, cy: FY - 58, r: 5, fill: pal.yellow });
  // 鍵穴とかんぬき
  el('rect', { x: DX + 6, y: FY - 48, width: 12, height: 18, rx: 3, fill: '#DCE3EA' });
  el('circle', { cx: DX + 12, cy: FY - 42, r: 2.4, fill: pal.ink });
  const bolt = el('rect', { y: FY - 76, width: 14, height: 6, rx: 2, fill: '#9AA4B2' });
  const fam = person(k, 'coral', { scale: 0.95 });
  const kid = person(k, 'yellow', { scale: 0.6 });
  const b = k.buddy({ x: 120, y: FY, scale: S, facing: -1 });
  const key = g({});
  el('circle', { cx: 0, cy: 0, r: 5, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3 }, key);
  el('path', { d: 'M 5 0 h 12 M 13 0 v 4 M 16 0 v 3', stroke: pal.yellowDark, 'stroke-width': 3, fill: 'none' }, key);
  const ok = mark(k, 'check', undefined, 2);
  const click = k.text(0, 0, 'click', { 'font-size': 11, fill: pal.sub });
  return {
    update(t) {
      t *= 4.6 / 4.4; // 4.4 秒に収める
      // 家族は先に左へ
      const fx = lerp(60, -90, easeInOut(seg(t, 0.2, 1.8)));
      P(fam, { x: fx, walk: fx * 0.107, facing: -1, armL: 20, armR: 20, mood: 'smile', blink: blinkAt(t, 1) });
      P(kid, { x: fx + 40, walk: fx * 0.15, facing: -1, armR: 20, mood: 'grin', blink: blinkAt(t, 2) });
      // まめ：ドアの前へ → 鍵を差して回す → ドアノブを引いて確認
      const xf = path([[0.4, 120], [1.3, 200]]), w = walkTo(xf, t, 120, 1);
      const ins = easeInOut(seg(t, 1.5, 1.9)), turn = easeInOut(seg(t, 2.1, 2.5)), chk = seg(t, 2.8, 3.4);
      P(b, { x: w.x, walk: w.walk, facing: t < 0.4 ? -1 : 1, lean: w.lean + 6 * ins, armL: w.armL, armR: w.armR, look: 0.8, mood: t > 3.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      const kx = lerp(DX - 16, DX + 6, ins), ky = FY - 42;
      if (t > 1.3 && t < 2.7) aim(b, S, 'R', kx, ky + 2);
      if (chk > 0 && chk < 1) { aim(b, S, 'R', DX + 12 - 3 * hump(chk * 2 % 1), FY - 58); }
      if (t > 3.4) b.pose({ armR: lerp(30, 150, easeOut(seg(t, 3.4, 3.7))) });
      const h = hp(b, S, 'R');
      if (t > 1.3 && t < 2.7) tf(key, kx, ky, -90 * turn * 0 + 0, 1, 1 - 1.6 * hump(turn * 0.5)); else tf(key, h.x, h.y, 0, t < 1.0 ? 0.001 : 1);
      tf(key, (t > 1.3 && t < 2.7) ? kx - 16 : h.x, (t > 1.3 && t < 2.7) ? ky : h.y, 0, t < 1.0 ? 0.001 : 1, (t > 1.3 && t < 2.7) ? Math.max(0.2, Math.abs(Math.cos(turn * Math.PI / 2))) : 1);
      k.set(bolt, { x: DX - 10 + 12 * turn });
      tf(click, DX + 34, FY - 92 - 6 * seg(t, 2.4, 2.8), 0, t > 2.4 && t < 3.0 ? 1 : 0.001);
      tf(ok, DX + 32, FY - 150, 0, t > 3.4 ? 2 * easeOut(seg(t, 3.4, 3.7)) : 0.001);
    }
  };
}
