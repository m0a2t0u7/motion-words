// traffic：朝日の中、2車線に車がぎっしり並び、少し進んでは止まる。運転中のまめはため息（例文 There was heavy traffic this morning.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { road, auto, blinkAt } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '朝の道'], [1.2, '車がぎっしり'], [3.0, 'なかなか進まない']] };

const COLS = [['#A58BF3', '#7F63D6'], ['#FFCF5C', '#E9B43A'], ['#FF8E77', '#E86F57'], ['#6AA8F7', '#4A8BE0'], ['#9ED3B2', '#6FB78C'], ['#C9D1DC', '#9AA5B4']];

export function create(k) {
  const { el, pal } = k;
  const FY = 168;
  k.backdrop({ floorY: FY, mood: 'evening' });
  // 朝日
  const sun = el('circle', { cx: 70, cy: 120, r: 26, fill: '#FFD57A' });
  el('circle', { cx: 70, cy: 120, r: 40, fill: '#FFD57A', opacity: 0.25 });
  [[110, 70], [170, 96], [230, 60], [300, 84], [350, 66]].forEach(([x, h]) => el('rect', { x, y: FY - h, width: 52, height: h, rx: 3, fill: '#F1DCCB' }));
  el('rect', { x: 0, y: FY, width: 400, height: 132, fill: '#B9C2CF' });
  el('rect', { x: 0, y: FY, width: 400, height: 6, fill: '#D6DCE5' });
  for (let i = 0; i < 7; i++) el('rect', { x: i * 64, y: 226, width: 34, height: 4, rx: 2, fill: '#fff' });
  const lane = (y, s, n, off, me) => Array.from({ length: n }, (_, i) => {
    const c = COLS[(i * 2 + off) % COLS.length];
    const car = auto(k, { color: i === me ? pal.mint : c[0], dark: i === me ? pal.mintDark : c[1], driver: i === me ? { color: pal.mint, dark: pal.mintDark } : { color: '#E9EEF4', dark: '#C9D1DC' }, ds: 0.52 });
    return { car, x0: -60 + i * 132 * s + off * 30, y, s };
  });
  const back = lane(214, 0.8, 5, 1, -1), front = lane(272, 0.95, 4, 0, 2);
  // 少し進んでは止まる
  const creep = (t, d) => 16 * easeInOut(seg(t, 0.8 + d, 1.4 + d)) + 16 * easeInOut(seg(t, 2.4 + d, 3.0 + d));
  return {
    update(t) {
      [[back, 0.25], [front, 0]].forEach(([ln, d]) => ln.forEach((c, i) => {
        const x = c.x0 + creep(t, d + i * 0.06), br = hump(seg(t, 1.3 + d, 1.7 + d)) + hump(seg(t, 2.9 + d, 3.3 + d));
        c.car.set(x, c.y, (x - c.x0) * 4, 0, br * 1.2, c.s);
        if (c.car.d && c.car.d.state.color !== 1) c.car.d.pose({ look: 0.4, blink: blinkAt(t, i) });
      }));
      const me = front[2].car.d, sigh = seg(t, 2.0, 4.4);
      me.pose({ look: lerp(0.8, -0.2, easeInOut(seg(t, 1.6, 2.2))), mood: t > 1.9 ? 'sad' : 'flat', blink: blinkAt(t, 0.3), lean: -6 * hump(sigh), squash: 1 - 0.05 * hump(sigh), armL: 70, armR: 70 });
      k.set(sun, { cy: 120 - 10 * easeOut(seg(t, 0, 4.4)) });
    }
  };
}
