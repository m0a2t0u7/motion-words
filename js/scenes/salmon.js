// salmon：お昼どき、まめがフライパンでサケの切り身を焼き、フライ返しでひっくり返すと、こんがり焼けた面が出る（例文 He grilled salmon for lunch.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { P, blinkAt, clock } from './run-after.js';
import { hp, reach } from './dig.js';
import { kitchen } from './flour.js';
import { stoveTop, panG } from './oil.js';

// サケの切り身（原点＝中心）。side 0=生の面 / 1=焼けた面
export function salmonG(k, parent) {
  const g = k.g({}, parent), { el } = k;
  const raw = k.g({}, g), done = k.g({}, g);
  [[raw, '#FF9E7A', '#FFD3C2'], [done, '#E8875A', '#F7C3A2']].forEach(([p, c, s]) => {
    el('path', { d: 'M -22 -4 Q -18 -12 0 -11 Q 20 -10 24 -2 Q 20 6 0 6 Q -18 6 -22 -4 Z', fill: c }, p);
    el('path', { d: 'M -22 -4 Q -18 -12 0 -11 Q 20 -10 24 -2', stroke: '#9AA3B2', 'stroke-width': 2.4, fill: 'none' }, p);
    [-12, -2, 8, 16].forEach((x) => el('path', { d: `M ${x} -8 q 4 6 0 12`, stroke: s, 'stroke-width': 2, fill: 'none' }, p));
  });
  [-10, 2, 14].forEach((x) => el('path', { d: `M ${x - 4} -9 l 8 12`, stroke: '#9C4F2E', 'stroke-width': 2.4, opacity: 0.7, 'stroke-linecap': 'round' }, done));
  return { g, side(s) { raw.setAttribute('opacity', s ? 0 : 1); done.setAttribute('opacity', s ? 1 : 0); } };
}
// フライ返し（原点＝握り、+y が先）
export function turnerG(k, parent) {
  const g = k.g({}, parent);
  k.el('rect', { x: -2.2, y: -6, width: 4.4, height: 18, rx: 2, fill: '#2A3242' }, g);
  k.el('rect', { x: -1.2, y: 12, width: 2.4, height: 10, fill: '#AEB8C6' }, g);
  k.el('rect', { x: -8, y: 22, width: 16, height: 12, rx: 2, fill: '#AEB8C6' }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'お昼に'], [1.4, 'サケを焼く'], [2.8, 'こんがり焼けた']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.05;
  const R = kitchen(k), TY = R.TY, MY = TY + 22;
  const ck = clock(k, 200, 56, 18); ck.set(12, 0);
  const me = k.buddy({ x: 140, y: MY, scale: S });
  R.front();
  const st = stoveTop(k, 256, TY);
  const pan = panG(k); tf(pan.g, 256, TY - 6); k.set(pan.oil, { rx: 30, ry: 3.6, opacity: 0.5 });
  const fish = salmonG(k);
  const tn = turnerG(k);
  const smoke = [0, 1, 2].map(() => el('circle', { r: 6, fill: '#fff' }));
  const sz = [0, 1, 2, 3].map(() => el('circle', { r: 1.4, fill: '#F2C14E' }));
  return {
    update(t) {
      st.fire(1, t);
      const sl = easeInOut(seg(t, 1.2, 1.6)), fl = seg(t, 1.6, 2.3), back = easeInOut(seg(t, 2.6, 3.0));
      P(me, { x: 140, y: MY, look: 0.7, mood: t > 2.4 ? 'grin' : 'smile', blink: blinkAt(t), lean: 6 * sl * (1 - back) });
      const under = { x: 256 - 26, y: TY - 26 }, up = { x: 256, y: TY - 70 };
      const tgt = fl > 0 && fl < 1 ? { x: lerp(under.x, up.x, hump(fl) * 0.6 + fl * 0.3), y: lerp(under.y, up.y, hump(fl)) } : under;
      me.pose({ armR: lerp(lerp(40, reach(me, S, 'R', under.x, under.y), sl), 40, back) });
      if (fl > 0 && fl < 1) me.pose({ armR: reach(me, S, 'R', tgt.x, tgt.y) });
      const h = hp(me, S, 'R', 27);
      const aimTo = fl > 0 && fl < 1 ? { x: h.x + 30, y: h.y + 6 } : back > 0 ? { x: h.x + 10, y: h.y + 30 } : under;
      tf(tn, h.x, h.y, (Math.atan2(-(aimTo.x - h.x), aimTo.y - h.y) * 180) / Math.PI, S);
      // 切り身：宙で裏返って戻る
      const fy = TY - 23 - 46 * hump(fl), flip = Math.cos(fl * Math.PI);
      tf(fish.g, 256 + 4 * hump(fl), fy + (fl >= 1 ? wobble(seg(t, 2.3, 2.8), 2, 6) * -2 : 0), 0, 1.1, 1.1 * (Math.abs(flip) < 0.05 ? 0.05 : flip));
      fish.side(fl > 0.5 ? 1 : 0);
      smoke.forEach((s, i) => { const q = ((t * 0.6 + i / 3) % 1); k.set(s, { cx: 246 + i * 12 + 6 * Math.sin(q * 6), cy: TY - 34 - 50 * q, r: 4 + 6 * q, opacity: 0.6 * (1 - q) }); });
      sz.forEach((s, i) => { const q = ((t * 3 + i * 0.25) % 1); k.set(s, { cx: 226 + i * 18, cy: TY - 22 - 10 * hump(q), opacity: hump(q) }); });
    }
  };
}
