// by chance：駅のホームで、別々に歩いてきた二人がすれ違いざまに気づき「あっ！」→思いがけない再会に大喜び（I met an old friend by chance at the station.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { gait, hp } from './dig.js';
import { phone } from './look-over.js';
import { P, blinkAt, mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '駅を歩く'], [1.6, 'あっ！'], [2.6, '偶然の再会']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: 30, fill: '#C4CCD8' });
  [60, 340].forEach((x) => el('rect', { x: x - 8, y: 30, width: 16, height: FY - 30, fill: '#D9DFE7' }));
  el('rect', { x: 150, y: 46, width: 100, height: 28, rx: 5, fill: pal.blueDark });
  el('path', { d: 'M 168 60 H 232 M 222 52 L 232 60 L 222 68', stroke: '#fff', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  el('rect', { x: 0, y: FY, width: 400, height: 8, fill: pal.yellow });
  for (let x = 0; x < 400; x += 16) el('rect', { x: x + 4, y: FY + 2, width: 8, height: 4, rx: 1, fill: pal.yellowDark });
  el('rect', { x: 0, y: FY + 8, width: 400, height: 56, fill: '#B8C0CC' });
  el('rect', { x: 0, y: 92, width: 400, height: 6, fill: '#C9D1DC' });
  const G = k.buddy({ x: 20, y: FY });
  const C = k.buddy({ x: 390, y: FY, facing: -1, color: pal.coral, dark: pal.coralDark });
  const ph = phone(k);
  const bg = mark(k, 'bang'), bc = mark(k, 'bang');
  const gx = (t) => lerp(20, 168, easeInOut(seg(t, 0.0, 1.6)));
  const cx = (t) => lerp(390, 236, easeInOut(seg(t, 0.0, 1.6)));
  return {
    update(t) {
      const a = gait(gx, t, 20), b = gait(cx, t, 390);
      const sp = easeOut(seg(t, 1.6, 1.8)), joy = easeOut(seg(t, 2.3, 2.7));
      const hop = Math.abs(Math.sin(seg(t, 2.5, 4.0) * Math.PI * 3)) * (t > 2.5 && t < 4 ? 1 : 0);
      P(G, { x: a.x, walk: a.walk, facing: 1, lean: a.lean - 8 * hump(seg(t, 1.6, 2.1)), armL: lerp(a.armL, 150, joy), armR: lerp(a.armR, 150, joy),
        look: t < 1.4 ? 0.1 : 0.7, mood: t < 1.6 ? 'smile' : t < 2.3 ? 'open' : 'grin', lift: 10 * hump(seg(t, 1.6, 1.9)) + 8 * hop, blink: blinkAt(t) });
      const looking = t < 1.6;
      P(C, { x: b.x, walk: b.walk, facing: -1, lean: looking ? 6 : b.lean - 8 * hump(seg(t, 1.65, 2.15)), armL: lerp(b.armL, 150, joy), armR: looking ? 60 : lerp(20, 150, joy),
        look: looking ? 0.2 : 0.7, mood: looking ? 'flat' : t < 2.3 ? 'open' : 'grin', lift: 10 * hump(seg(t, 1.65, 1.95)) + 8 * hop, blink: blinkAt(t, 1) });
      const h = hp(C, 1, 'R');
      tf(ph.g, h.x, h.y - 6, 0); ph.g.setAttribute('opacity', t < 1.75 ? 1 : 0);
      tf(bg, gx(t) + 6, FY - 116, 0, Math.max(0.001, backOut(seg(t, 1.6, 1.85))));
      tf(bc, cx(t) - 6, FY - 116, 0, Math.max(0.001, backOut(seg(t, 1.7, 1.95))));
      bg.setAttribute('opacity', t < 2.6 ? 1 : 0); bc.setAttribute('opacity', t < 2.6 ? 1 : 0);
    }
  };
}
