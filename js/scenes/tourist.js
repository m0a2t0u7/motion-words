// tourist：春の京都。桜が舞う五重塔の前で、観光客のまめがカメラで写真を撮る（例文 Many tourists visit Kyoto in spring.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, hp, P, blinkAt, walkTo, path, wear, sc, pop } from './member.js';
import { treeG } from './nature.js';
import { cameraProp } from './camera.js';
import { bagProp } from './bag.js';

export const meta = { duration: 4.4, beats: [[0, '春の京都'], [1.6, '写真を撮る'], [3.0, '観光を楽しむ']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  k.backdrop({ floorY: FY });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#EADFCB' });
  // 五重塔
  const PX = 290;
  el('rect', { x: PX - 3, y: 18, width: 6, height: 26, fill: '#B8925A' });
  for (let i = 0; i < 5; i++) {
    const y = 44 + i * 34, w = 46 + i * 8;
    el('rect', { x: PX - w / 2 + 8, y: y + 6, width: w - 16, height: 28, fill: '#E9DCC4' });
    el('path', { d: `M ${PX - w / 2 - 14} ${y + 10} Q ${PX} ${y - 6} ${PX + w / 2 + 14} ${y + 10} L ${PX + w / 2} ${y + 2} L ${PX - w / 2} ${y + 2} Z`, fill: '#5B4A55' });
    el('rect', { x: PX - 6, y: y + 14, width: 12, height: 14, fill: '#C0463B' });
  }
  // 桜の木
  [[40, 1.1], [370, 0.9], [170, 0.75]].forEach(([x, s]) => { const tr = treeG(k, s, '#F8BFD0', '#F3A6BE'); tf(tr.g, x, FY); });
  const petals = Array.from({ length: 16 }, () => el('ellipse', { rx: 3, ry: 2, fill: '#F7A9C0' }));
  // 通りすがりの観光客
  const c1 = k.buddy({ x: 420, y: FY, scale: 0.7, facing: -1, ...CO(k) }); wear(k, c1, 'hat', '#fff');
  const mp = g({}); el('rect', { x: -12, y: -9, width: 24, height: 18, rx: 2, fill: '#FFF6D8', stroke: pal.yellowDark }, mp); el('path', { d: 'M -8 -3 L -2 2 L 5 -4 L 9 3', stroke: pal.red, 'stroke-width': 1.5, fill: 'none' }, mp);
  const b = k.buddy({ x: -40, y: FY, scale: S }); wear(k, b, 'hat', pal.yellow);
  const pack = bagProp(k, null, '#5C7FD6', '#3F60B5', 22, 24); b.body.insertBefore(pack, b.body.children[1]); tf(pack, -34, -66);
  const cam = cameraProp(k);
  const flash = el('circle', { r: 22, fill: '#FFFDE8' });
  const photo = g({}); el('rect', { x: -20, y: -24, width: 40, height: 48, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }, photo);
  el('rect', { x: -16, y: -20, width: 32, height: 30, fill: '#F9D9E3' }, photo); el('path', { d: 'M -4 10 L 0 -16 L 4 10 Z', fill: '#5B4A55' }, photo);
  const bx = path([[0, -40], [1.3, 130]]), cx = path([[0.3, 420], [4.4, 230]]);
  return {
    update(t) {
      const w = walkTo(bx, t, -40, 1), up = easeInOut(seg(t, 1.5, 2.0)), down = easeInOut(seg(t, 2.9, 3.3));
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(w.armR, 128, up - down * 0.6), lean: w.lean, blink: t > 1.9 && t < 2.9 ? 1 : blinkAt(t), look: 0.8, mood: t > 2.4 ? 'grin' : 'smile' });
      const h = hp(b, S, 'R', 30);
      tf(cam, h.x + 4, h.y + 2, 0, S * 0.85);
      const fp = seg(t, 2.2, 2.45);
      tf(flash, h.x + 18, h.y, 0, sc(hump(fp))); flash.setAttribute('opacity', 0.9 * hump(fp));
      tf(photo, h.x + 24 + 10 * easeOut(seg(t, 2.5, 3.0)), h.y - 40 - 10 * easeOut(seg(t, 2.5, 3.0)), 6, pop(seg(t, 2.5, 3.0)) * 0.9);
      const c = walkTo(cx, t, 420, -1);
      P(c1, { x: c.x, walk: c.walk, armL: c.armL, armR: 70, lean: c.lean, facing: -1, blink: blinkAt(t, 1), look: 0.3 });
      const hc = hp(c1, 0.7, 'R', 30); tf(mp, hc.x - 4, hc.y - 4, -10, 0.8);
      petals.forEach((p, i) => { const q = ((t * 0.35 + i * 0.137) % 1); tf(p, (i * 61 + Math.sin(q * 9 + i) * 18 + 400 - q * 80) % 420 - 10, -10 + q * (FY + 10), q * 300 + i * 20); });
    }
  };
}
