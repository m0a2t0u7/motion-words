// sauce：お皿のパスタの上に、まめが小なべを傾けて赤いトマトソースをとろーりとかける（例文 Pour the sauce over the pasta.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { P, blinkAt } from './run-after.js';
import { hp, reach } from './dig.js';
import { kitchen, plateG } from './flour.js';
import { pourFrom } from './oil.js';

export const meta = { duration: 4.2, beats: [[0, 'パスタ'], [1.2, 'ソースをかける'], [3.0, 'できあがり']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const R = kitchen(k), TY = R.TY, MY = TY + 22;
  const me = k.buddy({ x: 130, y: MY, scale: S });
  R.front();
  const PX = 250;
  const pl = g({}); tf(pl, PX, TY); plateG(k, pl, 96);
  // パスタ（黄色いめん）
  const pasta = g({}, pl);
  el('path', { d: 'M -32 -6 Q -26 -30 0 -32 Q 26 -30 32 -6 Z', fill: '#F6D27A' }, pasta);
  for (let i = 0; i < 6; i++) el('path', { d: `M ${-26 + i * 9} -8 q 6 -14 2 -22`, stroke: '#E9B43A', 'stroke-width': 2, fill: 'none' }, pasta);
  const sc = el('path', { d: '', fill: '#D9443A' }, pl);
  const drip = [0, 1, 2].map(() => el('path', { d: '', fill: '#D9443A' }, pl));
  el('circle', { cx: -6, cy: -30, r: 3.5, fill: '#59A85F' }, pl); const basil = pl.lastChild;
  // 小なべ（原点＝取っ手の握り、なべは +x 側）
  const sp = g({});
  el('rect', { x: -4, y: -3, width: 26, height: 6, rx: 3, fill: '#2A3242' }, sp);
  el('path', { d: 'M 22 -12 L 50 -12 L 48 6 Q 47 9 44 9 L 28 9 Q 25 9 24 6 Z', fill: '#AEB8C6' }, sp);
  el('ellipse', { cx: 36, cy: -12, rx: 14, ry: 3, fill: '#D9443A' }, sp);
  const stream = el('path', { stroke: '#D9443A', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' });
  return {
    update(t) {
      const go = easeInOut(seg(t, 0.3, 1.0)) * (1 - easeInOut(seg(t, 3.0, 3.6))), tilt = easeInOut(seg(t, 1.0, 1.4)) * (1 - easeInOut(seg(t, 2.6, 2.9)));
      P(me, { x: 130, y: MY, look: 0.7, mood: t > 3.0 ? 'grin' : 'smile', blink: blinkAt(t), lean: 5 * go });
      me.pose({ armR: lerp(40, reach(me, S, 'R', PX - 50, TY - 74), go) });
      const h = hp(me, S, 'R', 28), rot = 55 * tilt;
      tf(sp, h.x, h.y, rot, S);
      const m = pourFrom(h, rot, { x: 50, y: -10 }, S);
      const amt = easeOut(seg(t, 1.3, 2.8)), pour = tilt > 0.8;
      k.set(stream, { d: `M ${m.x} ${m.y} Q ${m.x + 3} ${(m.y + TY - 34) / 2} ${PX + 2} ${TY - 32}`, opacity: pour ? 1 : 0, 'stroke-width': pour ? 5 : 0 });
      const w = 4 + 24 * amt;
      k.set(sc, { d: amt > 0.01 ? `M ${-w} -24 Q ${-w * 0.6} ${-34 - 3 * amt} 0 -34 Q ${w * 0.6} ${-34 - 3 * amt} ${w} -24 Q 0 ${-18 + 4 * amt} ${-w} -24 Z` : '' });
      drip.forEach((d, i) => { const x = (i - 1) * 14 * amt, L = 10 * seg(t, 1.8 + i * 0.2, 2.8 + i * 0.2); k.set(d, { d: L > 0.3 ? `M ${x - 3} -24 Q ${x} ${-24 + L * 1.4} ${x + 3} -24 Z` : '' }); });
      basil.setAttribute('opacity', t > 3.1 ? 1 : 0); tf(basil, 0, -4 * (1 - easeOut(seg(t, 3.1, 3.4))));
    }
  };
}
