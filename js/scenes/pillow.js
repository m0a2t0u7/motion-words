// pillow：かたい枕で寝づらく、起きて押してもへこまない。ふかふかの枕を思い浮かべる（例文 I need a softer pillow.）
import { seg, lerp, easeInOut, easeOut, wobble, hump, clamp } from '../ease.js';
import { reach } from './dig.js';
import { blinkAt } from './run-after.js';
import { lie } from './surgery.js';
import { cloud } from './look-over.js';
import { bedroomBg, bedFrame } from './mattress.js';

export const meta = { duration: 4.6, beats: [[0, '枕がかたい'], [1.4, '起きて押す'], [3.0, 'やわらかい枕がほしい']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.78;
  const FY = bedroomBg(k, { winX: 290, winW: 74 });
  const X0 = 110, X1 = 360, MT = 194;
  bedFrame(k, X0, X1, MT, FY, { TH: 22 });
  // かたい枕（角ばって、へこまない）
  const PX = 182, PY = MT - 9;
  const pil = g({}); tf(pil, PX, PY);
  el('rect', { x: -30, y: -9, width: 60, height: 18, rx: 3, fill: '#E8E1CF', stroke: '#C9BFA6', 'stroke-width': 2 }, pil);
  el('path', { d: 'M -22 -2 H 22 M -22 3 H 22', stroke: '#D3C9B0', 'stroke-width': 1.4 }, pil);
  const OX = 226, OY = MT - 24;
  const L = lie(k, { scale: S });
  // 掛け布団（手前）
  const quilt = el('path', { d: `M ${OX - 22} ${MT + 22} L ${OX - 22} ${OY - 6} Q ${OX + 60} ${OY - 18} ${X1 - 2} ${OY - 2} L ${X1 - 2} ${MT + 22} Z`, fill: '#8FB6EE', stroke: '#fff', 'stroke-width': 2 });
  el('path', { d: `M ${OX - 18} ${OY + 4} Q ${OX + 60} ${OY - 8} ${X1 - 6} ${OY + 8}`, stroke: '#fff', 'stroke-width': 3, fill: 'none', opacity: 0.45 });
  const lines = [0, 1].map(() => el('path', { d: 'M 0 0 l 6 -6 M 4 6 l 9 -3', stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round', fill: 'none' }));
  const th = cloud(k, 110, 66, 1);
  // 考え雲の中：ふかふかの枕に頭がしずむ
  const soft = g({}, th.g);
  el('path', { d: 'M -32 6 Q -38 -10 -22 -12 Q 0 -18 22 -12 Q 38 -10 32 6 Q 0 14 -32 6 Z', fill: '#fff', stroke: '#BFD0EA', 'stroke-width': 2.2 }, soft);
  el('path', { d: 'M -14 -4 Q 0 0 14 -4', stroke: '#D6E2F3', 'stroke-width': 2, fill: 'none' }, soft);
  const head = el('circle', { r: 11, fill: pal.mint }, th.g);
  return {
    update(t) {
      const up = easeInOut(seg(t, 1.3, 1.9));
      const fidget = t < 1.3 ? 3 * Math.sin(t * 5) * seg(t, 0.2, 0.5) : 0;
      L.set(OX, OY - 2 * hump(seg(t, 0.5, 0.75)) - 2 * hump(seg(t, 0.95, 1.2)), lerp(-82 + fidget, 0, up));
      const press = easeInOut(seg(t, 2.0, 2.3)) * (1 - easeInOut(seg(t, 2.9, 3.2)));
      const knock = Math.abs(Math.sin((t - 2.3) * 10)) * press;
      L.b.pose({ facing: -1, look: up > 0.5 ? -0.5 + 0.8 * seg(t, 3.0, 3.3) : 0.2, blink: t < 1.3 ? 0 : blinkAt(t), mood: t > 3.6 ? 'smile' : 'sad', lean: 6 * press, armL: 8, armR: 8 });
      L.b.pose({ armR: lerp(lerp(8, 20, up), reach(L.b, S, 'R', PX + 16 - OX, PY - 8 + 4 * knock - OY), press) });
      // ぶつかり線（頭が当たる・押してもかたい）
      const hit1 = hump(seg(t, 0.5, 0.75)) + hump(seg(t, 0.95, 1.2));
      tf(lines[0], PX - 40, PY - 18, 0, 1); lines[0].setAttribute('opacity', clamp(hit1 + knock * 1.2));
      tf(lines[1], PX + 8, PY - 22, 0, 1); lines[1].setAttribute('opacity', clamp(knock * 1.2));
      tf(pil, PX, PY, 0, 1, 1 - 0.02 * knock);
      const c = seg(t, 3.0, 3.5);
      th.show(c, 300, 92);
      const sink = 0.5 + 0.5 * Math.sin((t - 3.4) * 6);
      tf(soft, 0, 6, 0, 1 + 0.08 * sink, 1 - 0.22 * sink);
      k.set(head, { cx: 0, cy: -10 + 6 * sink });
    }
  };
}
