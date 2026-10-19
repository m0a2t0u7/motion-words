// motorcycle：ヘルメットのおじさんがオートバイにまたがって走り出し、見送るまめが手を振る（例文 My uncle rides a motorcycle.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, clamp } from '../ease.js';
import { P, blinkAt, puffs, road } from './vehicle.js';
import { twoWheel, mount, helmet } from './bicycle.js';

export const meta = { duration: 4.4, beats: [[0, 'おじさんのバイク'], [1.4, 'エンジン始動'], [2.4, '走っていく']] };

export function create(k) {
  const { el, pal } = k;
  const FY = 180, GY = road(k, FY);
  // 家の前
  el('rect', { x: 20, y: 96, width: 120, height: FY - 96, fill: '#F6EDE2' });
  el('path', { d: 'M 10 100 L 80 60 L 150 100 Z', fill: pal.blue });
  el('rect', { x: 90, y: 128, width: 30, height: FY - 128, rx: 3, fill: pal.wood });
  const kid = k.buddy({ x: 64, y: FY + 12, scale: 0.6 });
  const S = 0.95;
  const mc = twoWheel(k, 'moto', pal.red, '#C94A3E', 1.35);
  const ex = puffs(k, 5);
  const uncle = k.buddy({ scale: S, color: pal.coral, dark: pal.coralDark }); uncle.g.firstChild.setAttribute('display', 'none');
  helmet(k, uncle, pal.ink);
  el('path', { d: 'M -14 -40 Q -7 -46 0 -41 Q 7 -46 14 -40 Q 7 -37 0 -39 Q -7 -37 -14 -40 Z', fill: '#8A5A3C' }, uncle.body.children[3]);
  const X = (t) => 200 + 300 * easeIn(seg(t, 2.2, 4.3));
  return {
    update(t) {
      const x = X(t), d = x - 200, rev = seg(t, 1.2, 1.5);
      const idle = t > 1.2 ? Math.sin(t * 50) * 0.6 * (1 - seg(t, 2.2, 2.6)) : 0;
      const wheelie = hump(seg(t, 2.2, 2.9)) * -5;
      mc.set(x, GY + idle * 0.5, d * 2.6, 0, wheelie);
      ex(x - 58 * 1.35, GY - 30, t, (b) => b > 1.25, 0.18);
      mount(k, uncle, S, mc, x, GY, { look: 0.6, mood: t > 1.3 ? 'grin' : 'smile', blink: blinkAt(t), lean: 10 + 8 * hump(seg(t, 2.2, 3.0)) });
      // おじさんがエンジンをふかす前に、まめへ親指を立てる代わりに顔を向ける
      if (t < 1.2) uncle.pose({ look: -0.6 });
      const wave = seg(t, 2.4, 4.4);
      P(kid, { x: 64, y: FY + 12, look: lerp(0.6, 1, wave), armR: 8 + 150 * easeOut(seg(t, 2.3, 2.7)) + 18 * Math.sin(t * 14) * (wave > 0 ? 1 : 0), mood: t > 1.3 ? 'grin' : 'smile', blink: blinkAt(t, 1), lift: 6 * hump(seg(t, 1.2, 1.5)) });
      void rev; void easeInOut; void clamp; void lerp;
    }
  };
}
