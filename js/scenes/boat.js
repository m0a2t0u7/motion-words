// boat：湖の上で2人がボートに乗り、まめがオールをこいで進む（例文 We rowed a boat on the lake.）
import { seg, lerp, easeInOut } from '../ease.js';
import { blinkAt, reach } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, '湖のボート'], [1.2, 'オールをこぐ'], [3.4, 'すいすい進む']] };

export function create(k) {
  const { el, g, pal } = k;
  const WY = 196;
  k.backdrop({ floorY: WY });
  el('path', { d: `M 0 ${WY} L 80 120 L 150 ${WY} Z M 110 ${WY} L 220 96 L 330 ${WY} Z M 280 ${WY} L 360 136 L 420 ${WY} Z`, fill: '#CFE0D6' });
  el('path', { d: 'M 202 112 L 220 96 L 238 112 Z', fill: '#fff' });
  el('rect', { x: 0, y: WY, width: 400, height: 104, fill: pal.water });
  const rip = [0, 1, 2, 3, 4, 5].map((i) => el('path', { d: 'M 0 0 q 10 -4 20 0', stroke: '#fff', 'stroke-width': 2.5, fill: 'none', opacity: 0.7 }));
  const boat = g({});
  const ppl = [[-30, 1, pal.mint, pal.mintDark], [30, -1, pal.coral, pal.coralDark]].map(([x, f, c, d]) => { const b = k.buddy({ parent: boat, x, y: -6, scale: 0.62, facing: f, color: c, dark: d }); b.g.firstChild.setAttribute('display', 'none'); return b; });
  el('path', { d: 'M -78 -14 L 78 -14 Q 70 12 40 14 L -44 14 Q -72 12 -78 -14 Z', fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 3 }, boat);
  el('rect', { x: -78, y: -16, width: 156, height: 5, rx: 2, fill: pal.woodDark }, boat);
  const oar = el('line', { stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, boat);
  const blade = el('ellipse', { rx: 9, ry: 4, fill: pal.woodDark }, boat);
  return {
    update(t) {
      const ph = Math.max(0, t - 0.8) * 4.2, stroke = Math.sin(ph) * (t > 0.8 ? 1 : 0);
      const bx = 140 + 120 * easeInOut(seg(t, 0.8, 4.4)) + Math.sin(ph) * 3;
      k.tf(boat, bx, WY + 18 + Math.sin(t * 3) * 2, Math.sin(t * 3) * 1.2);
      // オールの先：漕ぐたびに前後へ弧を描く（水をかくときは水中）
      const ox = -60 + 26 * stroke, oy = 30 - 10 * Math.cos(ph) * (t > 0.8 ? 1 : 0);
      const gx = -2 + 8 * stroke, gy = -40;
      k.set(oar, { x1: gx, y1: gy, x2: ox, y2: oy }); k.tf(blade, ox, oy, 70);
      const me = ppl[0];
      me.pose({ lean: -8 * stroke, look: 0.6, mood: 'grin', blink: blinkAt(t) });
      me.pose({ armR: reach(me, 0.62, 'R', gx, gy), armL: reach(me, 0.62, 'L', gx - 2, gy) });
      ppl[1].pose({ look: 0.5, mood: 'smile', blink: blinkAt(t, 1), armR: 8, armL: 8 + 120 * seg(t, 3.4, 3.8) });
      rip.forEach((r, i) => { const a = ((t * 0.5 + i / 6) % 1); k.tf(r, bx - 90 - 160 * a + (i % 2) * 40, WY + 30 + (i % 3) * 18); r.setAttribute('opacity', 0.8 * (1 - a)); });
      void lerp;
    }
  };
}
