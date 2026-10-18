// combine：小麦粉をボウルに注ぎ、卵を二つ割り入れ、スプーンで混ぜて一つにする（例文 Combine the flour and the eggs in a bowl.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, hump } from '../ease.js';
import { hp, reach, frontL, table } from './dig.js';

export const meta = { duration: 4.4, beats: [[0, '粉と卵'], [1.7, '卵を割り入れる'], [3.7, '混ざった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  table(k, 60);
  const BX = 258, BY = 205, SY = 1;
  const b = k.buddy({ x: 172, y: 236 });
  const L = frontL(b, 1);
  // ボウル（奥側）
  const bowl = g({}); tf(bowl, BX, BY);
  k.shadow(0, 1, 40, 6, bowl);
  el('path', { d: 'M -36 -30 Q -34 0 0 0 Q 34 0 36 -30 Z', fill: pal.blue, stroke: pal.blueDark, 'stroke-width': 2 }, bowl);
  el('ellipse', { cx: 0, cy: -30, rx: 36, ry: 9, fill: '#D6E8FB', stroke: pal.blueDark, 'stroke-width': 2 }, bowl);
  el('ellipse', { cx: 0, cy: -29, rx: 31, ry: 6.5, fill: '#B9CFE8' }, bowl);
  const cc = k.clip((c) => el('ellipse', { cx: 0, cy: -29, rx: 31, ry: 6.5 }, c));
  const inb = g({}, bowl); inb.setAttribute('clip-path', cc);
  const flour = el('ellipse', { cx: 0, cy: -27, rx: 0, ry: 0, fill: '#fff' }, inb);
  const mix = el('ellipse', { cx: 0, cy: -29, rx: 31, ry: 7, fill: '#F7E7A0', opacity: 0 }, inb);
  const yolks = [-9, 8].map((x) => el('circle', { cx: x, cy: -29, r: 0, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, inb));
  const sw = el('path', { d: 'M -14 -29 Q 0 -35 14 -29 Q 0 -24 -14 -29', fill: 'none', stroke: '#E9CE74', 'stroke-width': 2, opacity: 0 }, inb);
  // 小麦粉カップ
  const cup = g({});
  el('path', { d: 'M -9 -11 L -7 11 L 7 11 L 9 -11 Z', fill: '#E9EEF5', stroke: '#9AA6B6', 'stroke-width': 2, 'stroke-linejoin': 'round' }, cup);
  const cf = el('ellipse', { cx: 0, cy: -10, rx: 8, ry: 2.2, fill: '#fff' }, cup);
  const stream = el('path', { d: '', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' });
  const spoon = el('line', { stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const spb = el('circle', { r: 5, fill: pal.woodDark });
  const eggs = [0, 1].map(() => el('ellipse', { rx: 6, ry: 7.5, fill: '#FFF3DE', stroke: '#D9C3A0', 'stroke-width': 1.5 }));
  const drops = [0, 1].map(() => el('circle', { r: 4.5, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.2 }));
  const P = (o) => b.pose({ armR: 8, armL: 8, lean: 0, squash: 1, walk: 0, look: 0.6, mood: 'smile', blink: 0, lift: 0, ...o });
  const REST = { x: 222, y: 197 };
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.2, 0.7)), pour = easeInOut(seg(t, 0.7, 1.0)), tilt = easeInOut(seg(t, 1.0, 1.4)) * (1 - easeInOut(seg(t, 1.7, 2.0)));
      const back = easeInOut(seg(t, 1.9, 2.4)); // カップを置く
      const stir = seg(t, 3.0, 4.2), stirOn = seg(t, 2.9, 3.2);
      const lean = 11 * Math.max(pour * (1 - back), stirOn);
      const eggP = (i) => seg(t, 2.0 + i * 0.5, 2.4 + i * 0.5);
      // 右手の目標：カップで注ぐ → 休み位置へ戻す → スプーンを取って混ぜる
      const mv = (p, q, u) => ({ x: lerp(p.x, q.x, u), y: lerp(p.y, q.y, u) });
      const RT = { x: REST.x, y: REST.y - 4 }, PT = { x: 242, y: 160 }, ST = { x: 240, y: 160 };
      let tgt;
      if (t < 1.9) tgt = mv(RT, PT, pour); else if (t < 2.4) tgt = mv(PT, RT, back); else if (t < 3.0) tgt = mv(RT, ST, easeInOut(seg(t, 2.4, 2.9)));
      else tgt = { x: ST.x + 7 * Math.cos(stir * Math.PI * 8), y: ST.y + 4 * Math.sin(stir * Math.PI * 8) };
      P({ lean, mood: t > 4.0 ? 'grin' : 'smile' });
      b.pose({ armR: reach(b, 1, 'R', tgt.x, tgt.y) });
      const eg = easeInOut(seg(t, 1.8, 2.3));
      L.set(lerp(28, 106, eg) - 70 * easeInOut(seg(t, 3.0, 3.4)) + 4 * Math.sin(t * 3));
      const hr = hp(b, 1, 'R'), hl = L.pos(24);
      // カップ：手に持つ（休み位置にもどる）
      const ca = lerp(0, 112, tilt);
      tf(cup, lerp(hr.x, REST.x, back), lerp(hr.y - 2, REST.y - 2, back), ca, 1);
      cup.setAttribute('opacity', 1);
      const lipX = hr.x + Math.sin(ca * Math.PI / 180) * 9 + 6, lipY = hr.y - 2 + 8 * Math.cos(ca * Math.PI / 180) - 4;
      const fl = tilt > 0.3 && t < 1.8;
      k.set(stream, { d: `M ${lipX} ${lipY} L ${lipX - 2} ${BY - 28}`, opacity: fl ? 1 : 0 });
      k.set(cf, { cy: lerp(-10, -2, seg(t, 1.1, 1.7)), rx: 8 - 2 * seg(t, 1.1, 1.7) });
      const fh = easeOut(seg(t, 1.1, 1.8));
      k.set(flour, { rx: 24 * fh, ry: 7 * fh, cy: -26 - 2 * fh });
      // 卵：左手に二つ、順に割り入れる
      eggs.forEach((e, i) => {
        const p = eggP(i);
        k.set(e, { cx: hl.x - 5 + i * 8, cy: hl.y - 6 - i * 2, opacity: p > 0.05 ? 0 : 1 });
      });
      drops.forEach((d, i) => {
        const p = eggP(i), land = BY - 29;
        const y = p < 0.2 ? hl.y - 6 : lerp(hl.y - 6, land, easeIn(seg(p, 0.2, 0.6)));
        k.set(d, { cx: hl.x - 3 + i * 5, cy: y, opacity: p > 0.05 && p < 0.62 ? 1 : 0 });
      });
      yolks.forEach((y, i) => k.set(y, { cx: lerp(i ? 8 : -9, 0, stirOn * 0.4), r: backOut(seg(eggP(i), 0.6, 0.9)) * 6 * (1 - 0.85 * stir) }));
      k.set(mix, { opacity: easeInOut(seg(t, 3.1, 4.0)) });
      k.set(sw, { opacity: hump(seg(t, 3.0, 4.2)) * 0.9, transform: `rotate(${stir * 720} 0 -29)` });
      // スプーン：ボウルの縁にさし、手にとって混ぜる
      const top = t > 2.7 ? { x: hr.x + 2, y: hr.y - 2 } : { x: 240, y: 158 };
      k.set(spoon, { x1: BX - 6 + 4 * Math.sin(stir * 8), y1: BY - 24, x2: top.x, y2: top.y, opacity: t < 2.4 && t < 2.9 ? 1 : 1 });
      k.set(spb, { cx: BX - 6 + 4 * Math.sin(stir * 8), cy: BY - 24 });
    }
  };
}
