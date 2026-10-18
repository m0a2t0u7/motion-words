// add：塩の容器を鍋の上で振り、塩をスープに少し加える（例文 Add some salt to the soup.）
import { seg, lerp, easeInOut, easeIn, easeOut, hump } from '../ease.js';
import { hp } from './dig.js';
import { kitchenBg } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '塩を持つ'], [1.2, 'ふり入れる'], [3.4, '加えた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const S = 1.1, FY = 240;
  kitchenBg(k, FY);
  // カウンターとコンロ
  el('rect', { x: 0, y: 204, width: 400, height: 8, fill: pal.wood });
  el('rect', { x: 0, y: 212, width: 400, height: 28, fill: '#F6D9B3' });
  el('rect', { x: 226, y: 196, width: 84, height: 8, rx: 3, fill: '#8FA0B3' });
  // 鍋
  const POT = { x: 268, top: 170 };
  el('rect', { x: POT.x - 34, y: POT.top, width: 68, height: 28, rx: 8, fill: '#B9C4D2' });
  el('rect', { x: POT.x - 44, y: POT.top + 4, width: 12, height: 5, rx: 2.5, fill: '#8FA0B3' });
  el('rect', { x: POT.x + 32, y: POT.top + 4, width: 12, height: 5, rx: 2.5, fill: '#8FA0B3' });
  el('ellipse', { cx: POT.x, cy: POT.top, rx: 34, ry: 8, fill: '#9AA6B6' });
  el('ellipse', { cx: POT.x, cy: POT.top + 1, rx: 30, ry: 6.5, fill: '#F2A65A' });
  const rip = [0, 1, 2].map(() => el('ellipse', { cx: 0, cy: 0, rx: 0, ry: 0, fill: 'none', stroke: '#FFE0B8', 'stroke-width': 1.6, opacity: 0 }));
  const steam = [0, 1, 2].map((i) => el('path', { d: 'M 0 0 q 6 -7 0 -14 q -6 -7 0 -14', fill: 'none', stroke: '#D5DCE5', 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.7 }));
  const b = k.buddy({ x: 190, y: FY, scale: S });
  b.armR.a.setAttribute('display', 'none');
  // 塩の容器（原点＝ふた。体は上方向）
  const sk = g({});
  el('rect', { x: -7, y: -26, width: 14, height: 24, rx: 4, fill: '#EEF6FB', stroke: '#C8D6E2', 'stroke-width': 1.5 }, sk);
  el('rect', { x: -5, y: -22, width: 10, height: 14, rx: 2, fill: '#fff' }, sk);
  el('rect', { x: -7, y: -4, width: 14, height: 5, rx: 2, fill: pal.blueDark }, sk);
  [-3, 0, 3].forEach((x) => el('circle', { cx: x, cy: 0, r: 0.9, fill: pal.ink }, sk));
  const grains = Array.from({ length: 16 }, () => el('circle', { r: 2.6, fill: '#fff', stroke: '#8FA0B3', 'stroke-width': 1 }));
  const arm = { a: el('line', { stroke: pal.mintDark, 'stroke-width': 9 * S, 'stroke-linecap': 'round' }), h: el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 * S }) };
  return {
    update(t) {
      const up = easeInOut(seg(t, 0.3, 1.1)) * (1 - easeInOut(seg(t, 3.3, 3.9)));
      const shake = t > 1.2 && t < 3.2 ? Math.sin((t - 1.2) * 14) : 0;
      b.pose({ armR: 90, armL: 8, lean: 4 + 3 * up, look: 0.6, mood: t > 3.3 ? 'grin' : 'smile' });
      const tx = lerp(222, 256, up), ty = lerp(196, 128, up) + 3 * shake;
      const sh = hp(b, S, 'R', 0);
      k.set(arm.a, { x1: sh.x, y1: sh.y, x2: tx, y2: ty }); k.set(arm.h, { cx: tx, cy: ty });
      tf(sk, tx + 1, ty + 12, lerp(0, 18, up) + 8 * shake, 1.5);
      sk.parentNode.appendChild(arm.h);
      // 塩の粒
      grains.forEach((gr, i) => {
        const t0 = 1.3 + i * 0.11, p = (t - t0) / 0.34;
        const on = p > 0 && p < 1;
        const x0 = tx + 6 + (i % 3) * 2, y0 = ty + 20, x1 = POT.x - 8 + ((i * 7) % 16), y1 = POT.top + 1;
        k.set(gr, { cx: lerp(x0, x1, easeOut(p)), cy: lerp(y0, y1, easeIn(p)), opacity: on ? 1 : 0 });
      });
      rip.forEach((r, i) => {
        const q = seg(t, 1.8 + i * 0.5, 2.6 + i * 0.5);
        k.set(r, { cx: POT.x - 6 + i * 6, cy: POT.top + 1, rx: 4 + 18 * q, ry: 1.5 + 4.5 * q, opacity: (1 - q) * (q > 0 ? 0.9 : 0) });
      });
      steam.forEach((s, i) => tf(s, POT.x - 14 + i * 14, POT.top - 8 - 3 * Math.sin(t * 2 + i), 0, 0.8));
    }
  };
}
