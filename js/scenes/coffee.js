// coffee：眠くてたまらない朝、コーヒーをいれて飲むと目が覚める（例文 I need a cup of coffee.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { kitchen, TOP, arms, vessel, steam, sip, P, blinkAt } from './jam.js';
import { cloud } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'ねむい…'], [1.2, 'コーヒーをいれる'], [2.8, 'シャキッ']] };

export function create(k) {
  const { el, pal } = k, S = 1.2;
  const kit = kitchen(k);
  const b = k.buddy({ x: 170, y: kit.FY, scale: S });
  kit.front();
  // コーヒーメーカー
  const MX = 262;
  el('rect', { x: MX - 26, y: TOP - 82, width: 52, height: 84, rx: 6, fill: '#3E4655' });
  el('rect', { x: MX - 26, y: TOP - 82, width: 52, height: 22, rx: 6, fill: '#566070' });
  el('rect', { x: MX - 16, y: TOP - 58, width: 32, height: 46, fill: '#262C36' });
  const lamp = el('circle', { cx: MX - 18, cy: TOP - 71, r: 4, fill: '#6D7889' });
  const drip = el('rect', { x: MX - 1.5, y: TOP - 56, width: 3, height: 0, fill: pal.coffee });
  const cup = vessel(k, null, { w: 20, h: 18, taper: 0.8, handle: 7, col: '#fff', liquid: pal.coffee });
  const st = steam(k, null, 2, 18);
  const th = cloud(k, 70, 48, -1);
  const ic = vessel(k, th.g, { w: 20, h: 16, taper: 0.8, handle: 7, liquid: pal.coffee }); k.tf(ic.g, -3, 10); ic.set(0.8);
  const zz = k.text(126, 96, 'z z', { 'font-size': 18, fill: pal.sub });
  const A = arms(k, b, S);
  return {
    update(t) {
      const awake = easeOut(seg(t, 3.3, 3.6));
      const sleepy = 1 - awake;
      const drink = easeInOut(seg(t, 2.6, 3.0)) * (1 - easeInOut(seg(t, 3.7, 4.1)));
      P(b, { lean: 6 * sleepy, squash: 1 - 0.05 * sleepy + 0.04 * hump(seg(t, 3.3, 3.8)), look: 0.4, blink: drink > 0.5 ? 1 : 0.65 * sleepy, mood: t < 0.9 ? (t > 0.3 ? 'open' : 'flat') : awake > 0.5 ? 'grin' : 'flat' });
      th.show(seg(t, 0.4, 0.8) * (1 - seg(t, 1.2, 1.4)), 120, 70);
      zz.setAttribute('opacity', (sleepy * (t < 2.6) * (0.5 + 0.5 * Math.sin(t * 5))).toFixed(2));
      // ボタンを押す → 抽出
      const press = hump(seg(t, 1.0, 1.4));
      const brew = seg(t, 1.3, 2.3);
      k.set(lamp, { fill: t > 1.25 ? pal.red : '#6D7889' });
      k.set(drip, { height: t > 1.3 && t < 2.3 ? TOP - 20 - (TOP - 56) : 0 });
      cup.set(0.8 * brew);
      if (t < 2.4) {
        A.to('R', lerp(220, MX - 18, easeInOut(seg(t, 0.8, 1.1)) * (1 - seg(t, 1.4, 1.7))), lerp(204, TOP - 71 + press * 2, easeInOut(seg(t, 0.8, 1.1)) * (1 - seg(t, 1.4, 1.7))));
        A.to('L', 150, 214);
        k.tf(cup.g, MX, TOP - 12, 0, 1.15);
      } else {
        const base0 = { x: MX, y: TOP - 12 };
        const p = easeInOut(seg(t, 2.4, 2.6));
        sip(k, A, b, S, cup.g, 'R', base0, drink, { sc: 1.15, w: 20, h: 18, tilt: 50 });
        void p; A.to('L', 150, 214);
      }
      st.set(t < 2.4 ? MX : -100, TOP - 34, seg(t, 1.8, 2.3), t);
    }
  };
}
