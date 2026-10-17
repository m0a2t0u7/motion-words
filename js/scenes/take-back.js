// take back：借りた道具を持って店まで行き、店員に返す（例文 I need to take this tool back to the store.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, grip } from './hand-over.js';

export const meta = { duration: 4.4, beats: [[0, '道具を持つ'], [1.5, '店へ向かう'], [3.1, '店に返す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 道と店（静止）
  el('rect', { x: 0, y: FY, width: 400, height: 12, fill: '#E3E8EE' });
  el('rect', { x: 226, y: 66, width: 168, height: 170, rx: 4, fill: '#F4ECE0' });
  el('rect', { x: 226, y: 60, width: 168, height: 14, fill: pal.woodDark });
  el('rect', { x: 262, y: 80, width: 96, height: 26, rx: 6, fill: pal.blue });
  k.text(310, 94, 'SHOP', { 'font-size': 16, fill: '#fff' });
  el('rect', { x: 236, y: 122, width: 148, height: 88, rx: 4, fill: '#FFF7E8' });
  el('rect', { x: 236, y: 122, width: 148, height: 88, rx: 4, fill: 'none', stroke: pal.woodDark, 'stroke-width': 4 });
  for (let i = 0; i < 7; i++) el('path', { d: `M ${232 + i * 23} 108 h 23 v 18 h -23 Z`, fill: i % 2 ? '#fff' : pal.coral });
  el('rect', { x: 250, y: 132, width: 40, height: 5, rx: 2, fill: pal.woodDark });
  const S = 1;
  const clerk = k.buddy({ x: 330, y: FY, scale: S, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const hm = g({});
  el('rect', { x: -2.5, y: -22, width: 5, height: 30, rx: 2, fill: pal.woodDark }, hm);
  el('rect', { x: -10, y: -28, width: 20, height: 9, rx: 2, fill: '#8A94A6' }, hm);
  el('rect', { x: -10, y: -28, width: 20, height: 3, rx: 1.5, fill: '#fff', opacity: 0.4 }, hm);
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const gm = grip(k, pal.mint, pal.mintDark, S);
  // カウンター（店員の手前）
  el('rect', { x: 232, y: 202, width: 156, height: 44, rx: 4, fill: pal.wood });
  el('rect', { x: 232, y: 200, width: 156, height: 7, rx: 3, fill: pal.woodDark });
  gm({ x: -40, y: -40 });
  return {
    update(t) {
      const wp = easeOut(seg(t, 0.2, 2.5));
      const walking = t > 0.2 && t < 2.5;
      const ph = walking ? (t - 0.2) * 9 : 0;
      const ext = easeInOut(seg(t, 2.5, 3.1)), back = easeInOut(seg(t, 3.7, 4.2));
      b.pose({ x: lerp(40, 200, wp), walk: ph, armR: lerp(48 + (walking ? Math.sin(ph) * 5 : 0), 88, ext) * (1 - back) + 12 * back, armL: walking ? 8 - Math.sin(ph) * 18 : 8, look: 0.5,
        lean: walking ? 3 : 3 * hump(ext), mood: t > 3.2 ? 'grin' : 'smile' });
      const cext = easeInOut(seg(t, 2.8, 3.3)), cback = easeInOut(seg(t, 3.5, 4.1));
      clerk.pose({ armR: lerp(lerp(12, 90, cext), 70, cback), armL: 10, look: 0.3, mood: 'smile', squash: 1 - 0.04 * hump(seg(t, 3.2, 3.6)) });
      const ha = hp(b, S), hc = hp(clerk, S);
      const m = easeInOut(seg(t, 3.15, 3.45));
      tf(hm, lerp(ha.x + 3, hc.x - 3, m), lerp(ha.y - 12, hc.y - 12, m), lerp(-12, 10, m));
      gm(ha);
    }
  };
}
