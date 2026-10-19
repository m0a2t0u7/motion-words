// thumb：ドアを閉めたとき親指をはさんだ。手をふって、親指にフーフー息をかける（例文 I hurt my thumb in the door.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, ache, lens } from './body.js';
import { bigHand } from './finger.js';
import { homeBg } from './furniture.js';
import { door } from './queue-up.js';

export const meta = { duration: 4.4, beats: [[0, 'ドアを閉める'], [1.2, '親指をはさむ'], [2.4, '親指が痛い']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.2, FY = 236;
  homeBg(k, { FY, winX: 30 });
  el('rect', { x: 236, y: 70, width: 84, height: FY - 70, fill: '#6E5A4C' });
  el('rect', { x: 230, y: 64, width: 96, height: 8, fill: '#C9A577' });
  const b = k.buddy({ x: 170, y: FY, scale: S });
  const dr = door(k, { x: 236, y: 70, w: 84, h: FY - 70, hinge: 'R', color: pal.wood });
  const hurt = ache(k);
  const breath = [0, 1, 2].map(() => el('path', { d: 'M 0 0 q 4 -3 8 0', stroke: '#B8C2CE', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }));
  const L = lens(k, 44);
  const bh = bigHand(k, L.inner); tf(bh.g, 6, 18);
  return {
    update(t) {
      const close = easeInOut(seg(t, 0.2, 1.2));
      dr.set(lerp(0.85, 0, close));
      const kn = { x: 236 + 6 + (1 - lerp(0.85, 0, close)) * 0 + 84 * (1 - lerp(1, 0.13, lerp(0.85, 0, close))) * 0, y: 160 };
      const pinch = t > 1.2, shake = t > 1.4 && t < 2.3, blow = t > 2.5;
      const edge = 320 - 84 * lerp(1, 0.13, lerp(0.85, 0, close));
      P(b, { lift: pinch ? 10 * hump(seg(t, 1.2, 1.6)) : 0, lean: pinch ? -6 : 4, mood: pinch ? (blow ? 'open' : 'sad') : 'flat', blink: pinch && t < 2.2 ? 1 : blinkAt(t), look: 0.5 });
      const face = bp(b, S, 26, -44);
      let tg;
      if (!pinch) tg = { x: edge - 2, y: 160 };
      else if (t < 2.4) tg = { x: b.state.x + 40, y: FY - 70 + (shake ? 16 * Math.sin(t * 30) : 0) };
      else tg = { x: lerp(b.state.x + 40, face.x + 14, easeInOut(seg(t, 2.4, 2.7))), y: lerp(FY - 70, face.y + 4, easeInOut(seg(t, 2.4, 2.7))) };
      b.pose({ armR: reach(b, S, 'R', tg.x, tg.y) });
      const h = hp(b, S, 'R', 26);
      hurt.set(easeOut(seg(t, 1.2, 1.4)) * (1 - seg(t, 3.8, 4.2)), h.x + 18, h.y - 10, t, 50);
      breath.forEach((p, i) => { const q = ((t * 2 + i * 0.33) % 1); tf(p, face.x + 4 + 10 * q, face.y + 2, 20, blow ? 1 : 0.001); p.setAttribute('opacity', (1 - q).toFixed(2)); });
      L.show(easeOut(seg(t, 2.0, 2.5)), 90, 86, h.x, h.y);
      bh.thumb.setAttribute('fill', pinch ? '#F28B82' : pal.mint);
      bh.thumb.setAttribute('transform', `rotate(-40 -36 6) scale(${pinch ? 1.15 : 1})`);
      void kn;
    }
  };
}
