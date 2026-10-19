// counter：店員が「お会計はカウンターで」と手で示し、まめは品物を持ってカウンターへ行き、硬貨を置いて払う（例文 Please pay at the counter.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, held, reach, coin } from './vehicle.js';
import { shopBg, clerk } from './skirt.js';
import { icon } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '品物を持つ'], [1.4, 'カウンターへ'], [2.8, 'ここで払う']] };

export function create(k) {
  const { el, g, pal } = k;
  const sb = shopBg(k, 236, 300);
  const ck = clerk(k, 330, 236);
  sb.front();
  const reg = g({}); el('rect', { x: -16, y: -22, width: 32, height: 22, rx: 3, fill: pal.ink }, reg); el('rect', { x: -12, y: -18, width: 24, height: 8, fill: '#9BE3B0' }, reg); k.tf(reg, 360, 186);
  const me = k.buddy({ x: 80, y: 242, scale: 0.92 });
  const item = g({}); icon(k, 'book', item);
  const cn = g({}); coin(k, cn, 7);
  const X = path([[1.0, 80], [2.4, 218]]);
  const placed = g({}); icon(k, 'book', placed); 
  return {
    update(t) {
      // 店員：カウンターを手で示す
      const pt = easeOut(seg(t, 0.2, 0.6)) * (1 - easeInOut(seg(t, 2.0, 2.4)));
      P(ck, { x: 330, look: -0.6, mood: t < 1.2 && Math.sin(t * 22) > 0 ? 'open' : 'smile', blink: blinkAt(t, 1), armR: lerp(8, 70, pt) });
      walk(me, X, t, { mood: 'smile', look: 0.6, blink: blinkAt(t), armR: 40, armL: 30 });
      // 品物を置く → 硬貨を置く
      const put = easeInOut(seg(t, 2.5, 2.9)), pay = easeInOut(seg(t, 3.1, 3.6));
      if (t > 2.4) me.pose({ armR: reach(me, 0.92, 'R', lerp(260, 280, pay), 180) });
      const h = held(k, me, 0.92, item, 'R', 0, 34);
      item.setAttribute('display', t < 2.9 ? 'inline' : 'none');
      k.tf(placed, 262, 176); placed.setAttribute('display', t >= 2.9 ? 'inline' : 'none');
      k.tf(cn, h.x, h.y); cn.setAttribute('display', t > 3.0 ? 'inline' : 'none');
      if (t > 3.6) k.tf(cn, 282, 180);
      if (t > 3.0) ck.pose({ mood: 'grin', armL: 8 + 40 * hump(seg(t, 3.6, 4.2)) });
      void put; void easeOut;
    }
  };
}
