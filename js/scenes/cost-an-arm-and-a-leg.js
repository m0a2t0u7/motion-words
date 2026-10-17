// cost an arm and a leg：バッグの値札に仰天、財布からお金が次々飛んで財布はぺちゃんこ（例文 That bag cost an arm and a leg.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '値札を見る'], [1.2, 'お金が飛ぶ'], [3.0, '財布が空に']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 台とバッグ
  el('rect', { x: 262, y: 172, width: 100, height: 68, rx: 6, fill: pal.wood });
  el('rect', { x: 262, y: 172, width: 100, height: 8, rx: 4, fill: pal.woodDark });
  k.shadow(312, 242, 54, 5);
  const bag = g({}, g({ transform: 'translate(312 172)' }));
  el('path', { d: 'M -14 -42 Q -14 -62 0 -62 Q 14 -62 14 -42', fill: 'none', stroke: pal.violet, 'stroke-width': 6, 'stroke-linecap': 'round' }, bag);
  el('rect', { x: -32, y: -46, width: 64, height: 46, rx: 9, fill: pal.violet }, bag);
  el('rect', { x: -32, y: -34, width: 64, height: 5, fill: '#fff', opacity: 0.35 }, bag);
  el('circle', { cx: 0, cy: -22, r: 6, fill: pal.yellow }, bag);
  // 値札
  const tag = g({}, g({ transform: 'translate(335 118)' }));
  const tagIn = g({}, tag);
  el('line', { x1: 0, y1: 0, x2: -14, y2: 36, stroke: pal.sub, 'stroke-width': 1.5 }, tagIn);
  el('rect', { x: -40, y: -14, width: 62, height: 28, rx: 6, fill: '#fff', stroke: pal.red, 'stroke-width': 3 }, tagIn);
  k.text(-9, 0, '$$$$', { 'font-size': 17, fill: pal.red }, tagIn);
  tf(tagIn, 0, 0, 0, 0.001);
  // 財布
  const wallet = g({});
  const wbody = el('rect', { x: -20, y: -12, width: 40, height: 28, rx: 6, fill: pal.coffee }, wallet);
  el('rect', { x: 6, y: -3, width: 18, height: 12, rx: 4, fill: pal.woodDark }, wallet);
  const coins = [];
  for (let i = 0; i < 7; i++) {
    const c = g({});
    el('circle', { r: 7, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2 }, c);
    k.text(0, 0.5, '$', { 'font-size': 9, fill: pal.yellowDark }, c);
    coins.push(c);
  }
  const b = k.buddy({ x: 130, y: FY, scale: 1.05 });
  const sweat = el('path', { d: 'M 0 -6 Q 5 2 0 6 Q -5 2 0 -6 Z', fill: pal.water });
  return {
    update(t) {
      const look = easeOut(seg(t, 0.3, 0.7));
      const tp = backOut(seg(t, 0.5, 0.95), 2);
      tf(tagIn, 0, 0, 8 * wobble(seg(t, 0.9, 1.8), 2, 3), tp, tp);
      const pay = seg(t, 1.3, 2.9);
      const shock = hump(seg(t, 0.5, 1.2));
      b.pose({
        armR: t < 1.1 ? lerp(8, 105, easeOut(seg(t, 0.8, 1.1))) : 105 - 12 * Math.sin(pay * 20),
        armL: 8,
        look: 0.9, lean: -4 * shock + 6 * seg(t, 2.8, 3.6),
        mood: t < 0.5 ? 'smile' : t < 2.9 ? 'open' : 'sad',
        squash: 1 - 0.04 * shock, blink: 0
      });
      const hp = b.handPos('R');
      // 財布はつぶれていく
      const flat = 1 - 0.7 * easeOut(pay);
      tf(wallet, hp.x + 10, hp.y - 4, 0, 1, flat);
      coins.forEach((c, i) => {
        const s = 1.35 + i * 0.22, p = seg(t, s, s + 0.7);
        const x = lerp(hp.x + 14, 300 + (i % 3) * 12, p);
        const y = lerp(hp.y - 6, 165, p) - Math.sin(p * Math.PI) * 60;
        tf(c, x, y, p * 360, 1, Math.abs(Math.cos(p * 8)) * 0.6 + 0.4);
        c.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      });
      const sp = seg(t, 0.9, 1.3);
      tf(sweat, lerp(150, 158, sp), lerp(FY - 100, FY - 84, sp));
      sweat.setAttribute('opacity', sp > 0 && t < 3.4 ? 1 : 0);
    }
  };
}
