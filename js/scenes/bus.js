// bus：バス停でバスに乗り、窓から見ながら学校の前で降りる（例文 I take the bus to school.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { road, auto, P, blinkAt, walk, path } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'バス停で待つ'], [1.3, 'バスに乗る'], [3.6, '学校に着く']] };

export function backpack(k, b, color = '#FFCF5C', dark = '#E9B43A') {
  const g = k.g({}); b.body.insertBefore(g, b.body.children[1]);
  k.el('rect', { x: -40, y: -66, width: 20, height: 42, rx: 8, fill: color, stroke: dark, 'stroke-width': 2 }, g);
  k.el('path', { d: 'M -26 -58 Q -20 -40 -26 -24', stroke: dark, 'stroke-width': 3, fill: 'none' }, b.body);
  return g;
}

export function create(k) {
  const { el, pal } = k;
  const FY = 186, GY = road(k, FY, { city: false });
  // 学校（右）とバス停（左）
  el('rect', { x: 250, y: 66, width: 150, height: FY - 66, fill: '#F6E7D4' });
  el('path', { d: 'M 300 66 L 325 40 L 350 66 Z', fill: pal.coral });
  el('circle', { cx: 325, cy: 58, r: 8, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 });
  [262, 300, 338, 370].forEach((x) => el('rect', { x, y: 88, width: 24, height: 24, rx: 3, fill: '#DDEFFA' }));
  el('rect', { x: 306, y: 132, width: 38, height: FY - 132, fill: pal.wood });
  el('rect', { x: 0, y: 120, width: 250, height: FY - 120, fill: '#E7EEF3' });
  el('rect', { x: 76, y: 104, width: 4, height: FY - 104, fill: pal.sub });
  el('circle', { cx: 78, cy: 100, r: 15, fill: pal.blue, stroke: '#fff', 'stroke-width': 3 });
  el('rect', { x: 70, y: 94, width: 16, height: 11, rx: 3, fill: '#fff' });
  const S = 0.95;
  const bus = auto(k, { kind: 'bus', color: pal.yellow, dark: pal.yellowDark, driver: { color: pal.blue, dark: pal.blueDark }, ds: 0.5, riders: [[30, pal.mint, pal.mintDark]] });
  const me = k.buddy({ x: 170, y: FY + 14, scale: 0.74, facing: -1 });
  backpack(k, me);
  const DOOR = 103;
  const BX = path([[0, -260], [1.1, 132 - DOOR * S], [2.2, 132 - DOOR * S], [3.4, 330 - DOOR * S]]);
  return {
    update(t) {
      const bx = BX(t), v = Math.abs(BX(t + 0.02) - BX(t - 0.02)) / 0.04;
      const brake = hump(seg(t, 0.9, 1.35)) + hump(seg(t, 3.2, 3.65));
      bus.set(bx, GY, bx * 1.4, Math.sin(t * 30) * 0.4 * clamp(v / 60), -brake * 1.2, S);
      const op = easeInOut(seg(t, 1.15, 1.35)) * (1 - easeInOut(seg(t, 1.9, 2.1))) + easeInOut(seg(t, 3.6, 3.8));
      bus.door.setAttribute('transform', `translate(92 0) scale(${(1 - 0.85 * op).toFixed(3)} 1) translate(-92 0)`);
      const inBus = t > 1.75 && t < 3.75;
      me.g.setAttribute('display', inBus ? 'none' : 'inline');
      bus.ppl[0].g.setAttribute('display', inBus ? 'inline' : 'none');
      bus.ppl[0].pose({ look: 0.8, mood: 'smile', blink: blinkAt(t) });
      if (t < 3.7) {
        // 乗る：ドアへ近づき、手前（車道側）へ一歩
        const p = seg(t, 1.25, 1.75), wv = seg(t, 0.1, 0.9);
        P(me, { x: lerp(170, 136, p), y: FY + 14 + 30 * easeIn2(p), walk: p * 6, armR: 8 + 150 * hump(wv) * (0.8 + 0.2 * Math.sin(t * 16)), facing: -1, look: wv > 0 && wv < 1 ? -0.8 : -0.3, mood: t > 0.4 ? 'grin' : 'smile', blink: blinkAt(t) });
      } else {
        const p = seg(t, 3.75, 4.3);
        P(me, { x: lerp(332, 360, easeOut(p)), y: FY + 44 - 30 * easeOut(p), walk: p * 6, armR: lerp(8, 150, easeOut(seg(t, 4.0, 4.4))), facing: 1, look: 0.2, mood: 'grin' });
      }
      bus.d.pose({ look: 0.6, blink: blinkAt(t, 1) });
    }
  };
}
const easeIn2 = (p) => p * p;
