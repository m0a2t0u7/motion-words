// go without：昼の12時、弁当箱を開けると空っぽ。まめは昼ごはんなしのまま仕事に戻る（例文 I had to go without lunch today.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock, win } from './run-after.js';
import { frontL } from './dig.js';
import { reach, hp } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, 'お昼の時間'], [1.5, '弁当が空'], [3.2, 'なしで仕事']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 26, 40, 90, 70); w.frame();
  const ck = clock(k, 160, 62, 22);
  const S = 0.9;
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const L = frontL(b, S);
  // 机・PC・弁当箱
  el('rect', { x: 150, y: 176, width: 200, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 330, y: 186, width: 8, height: 50, fill: pal.woodDark });
  el('path', { d: 'M 270 176 L 282 136 L 330 136 L 322 176 Z', fill: '#8F9BB0' });
  el('rect', { x: 268, y: 172, width: 64, height: 5, rx: 2, fill: '#C4CCD8' });
  el('rect', { x: 186, y: 158, width: 56, height: 18, rx: 4, fill: '#FFF', stroke: pal.blueDark, 'stroke-width': 3 });
  el('rect', { x: 190, y: 162, width: 48, height: 11, rx: 2, fill: '#F3F5F8' });
  const lid = g({});
  el('rect', { x: 0, y: -6, width: 58, height: 7, rx: 3, fill: pal.blue }, lid);
  el('rect', { x: 22, y: -10, width: 14, height: 4, rx: 2, fill: pal.blueDark }, lid);
  k.shadow(250, 237, 96, 5);
  const growl = g({}); [0, 1].forEach((i) => el('path', { d: `M ${i * 10} 0 q 3 -5 6 0 q 3 5 6 0`, stroke: pal.sub, 'stroke-width': 2, fill: 'none' }, growl));
  return {
    update(t) {
      ck.set(11, lerp(58, 60, seg(t, 0.1, 0.6)) + 10 * seg(t, 0.6, 4.4));
      // ふたを開けて中をのぞく→空なので閉じる→PC作業に戻る
      const close = easeInOut(seg(t, 2.7, 3.1));
      const lift = easeInOut(seg(t, 0.8, 1.4)) * (1 - close);
      const ly = 158 - 26 * lift;
      const peek = easeInOut(seg(t, 1.4, 1.8)) * (1 - easeInOut(seg(t, 2.6, 3.0)));
      const sag = hump(seg(t, 2.0, 3.0));
      const base = { x: 120, lean: 4 + 10 * peek, squash: 1 - 0.05 * sag, look: 0.6, mood: t > 1.6 ? 'sad' : 'smile', blink: blinkAt(t) };
      P(b, { ...base, armR: 40 });
      const toLid = reach(b, S, 'R', 214, ly - 8), toPc = reach(b, S, 'R', 290, 168);
      const goPc = easeInOut(seg(t, 3.15, 3.5)), ty = Math.sin(t * 22) * 6 * seg(t, 3.5, 3.6);
      const arm = t < 0.8 ? lerp(8, toLid, easeOut(seg(t, 0.2, 0.8))) : lerp(toLid, toPc, goPc) + ty;
      P(b, { ...base, armR: arm });
      L.set(lerp(20, 60, goPc) - ty);
      tf(lid, 185, ly, -4 * lift);
      const gq = seg(t, 1.9, 2.8);
      tf(growl, 150, 190); growl.setAttribute('opacity', hump(gq));
    }
  };
}
