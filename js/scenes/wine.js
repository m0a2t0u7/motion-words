// wine：夕食のテーブルで、2人が赤ワインのグラスで乾杯して飲む（例文 They had red wine with dinner.）
import { seg, lerp, easeInOut, easeOut, clamp, hump } from '../ease.js';
import { arms, dinner, wineGlass, plateP, sip, P, blinkAt, C } from './jam.js';
import { homeBg } from './furniture.js';
import { dish } from './restaurant.js';

export const meta = { duration: 4.4, beats: [[0, '夕食'], [1.4, '乾杯'], [2.6, 'ワインを飲む']] };

export function create(k) {
  const { el, pal } = k, S = 1.1;
  const FY = homeBg(k, { winX: 158, winW: 84, sky: '#4B5C86', mood: 'evening' });
  const b = k.buddy({ x: 140, y: FY, scale: S });
  const c = k.buddy({ x: 260, y: FY, scale: S, facing: -1, ...C(k, 'coral') });
  dinner(k, 70, 330, 198, '#fff', '#9B2D4A');
  // 料理・ろうそく・ボトル
  const d1 = dish(k, undefined, '#B5652E', '#59C27A'); k.tf(d1.g, 110, 198); d1.set(1);
  const d2 = dish(k, undefined, '#B5652E', '#59C27A'); k.tf(d2.g, 290, 198); d2.set(1);
  el('rect', { x: 196, y: 168, width: 8, height: 28, rx: 2, fill: '#FFF6E0' });
  const fl = el('path', { d: 'M 0 0 Q -4 -6 0 -12 Q 4 -6 0 0 Z', fill: '#FFC93C' });
  el('path', { d: 'M 214 196 V 160 Q 214 152 220 150 V 140 H 226 V 150 Q 232 152 232 160 V 196 Z', fill: '#5A2034' });
  const g1 = wineGlass(k), g2 = wineGlass(k);
  const ringA = [0, 1, 2].map(() => el('line', { stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linecap': 'round' }));
  const A = arms(k, b, S), B = arms(k, c, S, { col: pal.coral, dark: pal.coralDark });
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.8, 1.4)) * (1 - easeInOut(seg(t, 2.2, 2.6)));
      const clink = hump(seg(t, 1.4, 1.7));
      const drink = easeInOut(seg(t, 2.6, 3.0)) * (1 - easeInOut(seg(t, 3.7, 4.1)));
      const lv = 0.8 - 0.35 * easeInOut(seg(t, 3.0, 3.7));
      P(b, { look: 0.6, lean: 4 * up, blink: drink > 0.5 ? 1 : blinkAt(t), mood: t > 1.4 ? 'grin' : 'smile' });
      P(c, { look: 0.6, lean: 4 * up, blink: drink > 0.5 ? 1 : blinkAt(t, 1.1), mood: t > 1.4 ? 'grin' : 'smile', facing: -1 });
      // グラスの位置：テーブル → 中央で乾杯 → 口へ
      const place = (bud, x0, dir, gl, AA) => {
        const base = { x: lerp(x0, 200 - dir * 9 + dir * 3 * clink, up), y: lerp(198, 160, up) };
        gl.set(lv);
        if (t < 2.6) { k.tf(gl.g, base.x, base.y, 0, 1.2); AA.to('R', base.x + dir * 3, base.y - 26); }
        else sip(k, AA, bud, S, gl.g, 'R', { x: x0, y: 198 }, drink, { sc: 1.2, w: 18, h: 32, tilt: 45 });
      };
      place(b, 168, 1, g1, A); place(c, 232, -1, g2, B);
      A.to('L', 140, 204); B.to('L', 260, 204);
      ringA.forEach((r, i) => { const a = -1.2 + i * 1.2; k.set(r, { x1: 200 + Math.sin(a) * 18, y1: 120 - Math.cos(a) * 18, x2: 200 + Math.sin(a) * 26, y2: 120 - Math.cos(a) * 26, opacity: clink }); });
      k.tf(fl, 200, 168, Math.sin(t * 9) * 5, 1, 0.9 + 0.1 * Math.sin(t * 13));
    }
  };
}
