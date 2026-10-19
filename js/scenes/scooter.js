// scooter：かばんを提げた女性がスクーターに乗って通りを進み、会社の前で止まって足をつく（例文 She goes to work on a scooter.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { blinkAt, path, skyline } from './vehicle.js';
import { twoWheel, mount, helmet } from './bicycle.js';

export const meta = { duration: 4.4, beats: [[0, 'スクーターで'], [1.6, '通りを進む'], [3.6, '会社に着く']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 214;
  k.backdrop({ floorY: FY });
  skyline(k, FY - 20, ['#F3E6DC', '#E6F1E8', '#E4EEF7']);
  el('rect', { x: 276, y: 40, width: 124, height: FY - 40, rx: 4, fill: '#E8E2F4' });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) el('rect', { x: 288 + c * 36, y: 54 + r * 30, width: 26, height: 20, rx: 3, fill: '#fff', opacity: 0.85 });
  el('rect', { x: 318, y: FY - 44, width: 44, height: 44, rx: 3, fill: pal.violet });
  el('rect', { x: 0, y: FY, width: 400, height: 86, fill: '#DCE2EA' });
  for (let i = 0; i < 8; i++) el('rect', { x: i * 56, y: FY + 44, width: 28, height: 4, rx: 2, fill: '#fff' });
  const S = 0.8, C = 1.3, GY = FY + 50;
  const sc = twoWheel(k, 'scooter', pal.mint, pal.mintDark, C);
  // 足もとのかばん（フックに掛ける）
  const bag = k.g({});
  el('path', { d: 'M -6 -12 Q 0 -20 6 -12', stroke: pal.coffee, 'stroke-width': 2, fill: 'none' }, bag);
  el('rect', { x: -10, y: -12, width: 20, height: 16, rx: 4, fill: pal.coffee }, bag);
  const her = k.buddy({ scale: S, color: pal.coral, dark: pal.coralDark }); her.g.firstChild.setAttribute('display', 'none');
  helmet(k, her, '#FFFFFF');
  const X = path([[0.1, -90], [3.6, 236]]);
  return {
    update(t) {
      const x = X(t), stop = seg(t, 3.5, 4.0);
      const brake = hump(seg(t, 3.3, 3.9));
      sc.set(x, GY, (x + 90) * 3.2, 0, -brake * 2);
      k.tf(bag, x + 22 * C, GY - 30 * C);
      mount(k, her, S, sc, x, GY, { mood: t > 3.6 ? 'grin' : 'smile', blink: blinkAt(t), lean: lerp(2, -2, stop) + 5 * brake });
      // 止まったら片足を地面につく
      if (stop > 0) {
        const lg = her.g.children[1].children[1], ln = lg.firstChild;
        const tx = her.state.x + 12 * S, ty = her.state.y - 14 * S;
        const fx = lerp(+ln.getAttribute('x2') * S + tx, x + 30, easeOut(stop)), fy = lerp(+ln.getAttribute('y2') * S + ty, GY - 2, easeOut(stop));
        k.set(ln, { x2: ((fx - tx) / S).toFixed(2), y2: ((fy - ty) / S).toFixed(2) });
      }
      void easeInOut; void clamp;
    }
  };
}
