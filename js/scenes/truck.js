// truck：大きなトラックが後ろ向きに出てきて道をふさぎ、走ってきたまめの車が急ブレーキで止まる（例文 A big truck blocked the road.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { auto, P, blinkAt, mark, popIn } from './vehicle.js';

export const meta = { duration: 4.2, beats: [[0, 'トラックが出る'], [1.4, '道をふさぐ'], [2.8, '通れない！']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 176;
  k.backdrop({ floorY: FY });
  // 両側を壁にはさまれた細い道
  el('rect', { x: 0, y: 92, width: 400, height: FY - 92, fill: '#EADFD3' });
  for (let x = 0; x < 400; x += 40) el('rect', { x, y: 92, width: 2, height: FY - 92, fill: '#DCCFBF' });
  el('rect', { x: 250, y: 100, width: 110, height: FY - 100, fill: '#C9B49A' }); // 倉庫の入口（奥）
  el('rect', { x: 0, y: FY, width: 400, height: 124, fill: '#B9C2CF' });
  el('rect', { x: 0, y: 284, width: 400, height: 16, fill: '#D9CFC2' });
  const GY = 262;
  const truck = auto(k, { kind: 'truck', color: '#FF8E77', dark: '#E86F57', driver: { color: pal.blue, dark: pal.blueDark }, ds: 0.55 });
  const box = el('rect', { x: -100, y: -116, width: 136, height: 88, rx: 4, fill: '#F5F7FA' }, truck.body);
  const lamp = el('circle', { cx: -102, cy: -40, r: 5, fill: pal.yellow }, truck.body);
  const car = auto(k, { color: pal.mint, dark: pal.mintDark, driver: { color: pal.mint, dark: pal.mintDark }, ds: 0.52 });
  const bang = mark(k, 'bang');
  const TX = (t) => lerp(470, 280, easeOut(seg(t, 0.2, 1.5)));
  const CX = (t) => lerp(-120, 80, easeOut(seg(t, 1.0, 2.5)));
  return {
    update(t) {
      const tx = TX(t), stop = seg(t, 1.5, 2.2);
      truck.set(tx, GY - 6, tx * 1.3, wobble(stop, 2, 6) * 1.2, 0, 1.15);
      lamp.setAttribute('opacity', t > 1.5 && Math.sin(t * 12) > 0 ? 1 : 0.25);
      truck.d.pose({ look: -0.8, blink: blinkAt(t) });
      const cx = CX(t), br = seg(t, 2.1, 2.9);
      car.set(cx, GY + 14, cx * 4, 0, 3.5 * wobble(br, 1.2, 4) * (br > 0 ? 1 : 0), 1.05);
      car.d.pose({ look: 0.9, lean: 10 * hump(br), mood: t > 2.2 ? 'open' : 'smile', blink: blinkAt(t, 0.6), armR: 60, armL: -40 });
      const bp = seg(t, 2.3, 2.6); k.tf(bang, cx + 30, GY - 100, 0, popIn(bp) * 1.8 + 0.001);
      void box; void P;
    }
  };
}
