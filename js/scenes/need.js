// need：書類の山を前に必死で作業するが、時計の針はどんどん進む。まめは時計を見て困り、「もっと時間が要る」と思う（例文 I need more time.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, clamp } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt, clock } from './run-after.js';
import { officeBg, desk } from './get-on-with.js';
import { thought } from './work-on.js';
import { drop } from './so-far-so-good.js';
import { pencil } from './be.js';

export const meta = { duration: 4.4, beats: [[0, '仕事が山積み'], [1.6, '時間が足りない'], [2.9, 'もっと時間を']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = officeBg(k, 236, 40);
  const ck = clock(k, 300, 66, 28);
  const S = 1.15;
  const me = k.buddy({ x: 150, y: FY, scale: S });
  const top = desk(k, 90, 260, FY);
  // 書類の山（動かない）と、書いている1枚
  for (let i = 0; i < 9; i++) el('rect', { x: 262 + (i % 2) * 2, y: top - 6 - i * 6, width: 46, height: 5, rx: 1, fill: i % 2 ? '#fff' : '#F4F1EA', stroke: pal.line, 'stroke-width': 1 });
  el('path', { d: 'M 182 -0 Z' });
  el('path', { d: `M 186 ${top - 6} L 232 ${top - 6} L 236 ${top} L 182 ${top} Z`, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 });
  const pen = pencil(k);
  const sw = [0, 1].map(() => drop(k, k.root));
  // 考え：時計＋「＋」
  const th = thought(k, 78, 54, -1);
  const tc = clock(k, 0, 0, 16); th.inner.appendChild(tc.g); tf(tc.g, -12, 0); tc.set(3, 0);
  el('path', { d: 'M 20 -8 V 8 M 12 0 H 28', stroke: pal.green, 'stroke-width': 5, 'stroke-linecap': 'round' }, th.inner);
  return {
    update(t) {
      // 針は速く回る（1時→4時）
      const hrs = lerp(1, 4, easeIn2(seg(t, 0, 2.6)));
      ck.set(Math.floor(hrs), (hrs % 1) * 60);
      const look = easeInOut(seg(t, 1.6, 2.0));
      const scrib = t < 1.7 ? Math.sin(t * 22) * 4 : 0;
      P(me, { lean: 10 - 12 * look, look: lerp(0.5, 1, look), mood: t > 1.8 ? 'sad' : 'flat', blink: blinkAt(t, 0.7), armL: 10 + 30 * hump(seg(t, 2.6, 3.4)), squash: 1 - 0.02 * Math.sin(t * 9) * (t < 1.7) });
      const tx = lerp(196 + scrib + 10 * Math.sin(t * 3), 200, look), ty = lerp(top - 6, top - 2, look);
      me.pose({ armR: reach(me, S, 'R', tx, ty) });
      const h = hp(me, S, 'R', 30); tf(pen, h.x + 2, h.y - 4, 18);
      sw.forEach((d, i) => { const q = (t * 1.2 + i * 0.5) % 1; tf(d, 120 + i * 58, FY - 104 + 16 * q); d.setAttribute('opacity', (t > 1.9) * (1 - q)); });
      const tp = seg(t, 2.6, 2.95);
      k.tf(th.g, 92, 72, 0, Math.max(0.001, easeOut(tp)));
      th.g.setAttribute('opacity', tp > 0 ? 1 : 0);
    }
  };
}
const easeIn2 = (p) => p * p;
