// get a taste of one's own medicine：人にパイを投げた子が、やり返されて自分がパイを浴びる（例文 He got a taste of his own medicine.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '相手にぶつける'], [1.7, 'やり返される'], [3.4, '自分が浴びる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const a = k.buddy({ x: 88, y: FY, scale: 1.05 });
  const c = k.buddy({ x: 312, y: FY, scale: 1.05, color: pal.coral, dark: pal.coralDark, facing: -1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0 };
  const pie = () => {
    const p = g({});
    el('ellipse', { cx: 0, cy: 3, rx: 15, ry: 5, fill: '#D9A25E' }, p);
    el('path', { d: 'M -14 2 Q -14 -10 0 -10 Q 14 -10 14 2 Z', fill: '#FFFFFF' }, p);
    el('circle', { cx: 0, cy: -11, r: 3.5, fill: pal.red }, p);
    return p;
  };
  const splat = () => {
    const s = g({});
    el('path', { d: 'M -22 4 Q -26 -10 -10 -14 Q -4 -26 8 -16 Q 24 -16 22 -2 Q 26 10 10 12 Q 0 20 -10 12 Q -20 14 -22 4 Z', fill: '#FFFFFF', stroke: '#E5EAF1', 'stroke-width': 2 }, s);
    el('circle', { cx: 8, cy: -6, r: 4, fill: pal.red }, s);
    return s;
  };
  const pieA = pie(), pieC = pie(), splA = splat(), splC = splat();
  const ha = k.text(0, 0, 'ha', { 'font-size': 14, fill: pal.coralDark, opacity: 0 });

  return {
    update(t) {
      // 1) コーラルがパイを投げる（t 0.4-1.2）→ まめに命中
      const th1 = seg(t, 0.5, 1.0), fl1 = seg(t, 0.9, 1.5);
      // 2) まめがパイを持ち、投げ返す（1.9-2.5）→ コーラルに命中
      const th2 = seg(t, 2.4, 2.8), fl2 = seg(t, 2.7, 3.3);
      const hitA = t > 1.5, hitC = t > 3.3;
      const jig = (s) => Math.sin(s * 40) * Math.exp(-s * 6) * 5;
      c.pose({ ...base, armR: t < 0.5 ? 140 : lerp(140, 30, easeOut(th1)) , armL: 8, facing: -1, mood: t < 3.3 ? 'grin' : 'sad', lean: lerp(-6, 8, th1) * (t < 1.5 ? 1 : 0.2) + (hitC ? jig(t - 3.3) : 0), squash: 1 - (hitC ? 0.04 : 0), blink: hitC ? 0.8 : 0 });
      a.pose({ ...base, armR: t < 2.0 ? 8 : t < 2.4 ? lerp(8, 140, easeOut(seg(t, 2.0, 2.4))) : lerp(140, 30, easeOut(th2)), armL: 8, mood: t < 1.5 ? 'smile' : t < 2.3 ? 'flat' : 'grin', lean: hitA && t < 2.4 ? -6 + jig(t - 1.5) : lerp(0, 8, th2), blink: hitA && t < 2.4 ? 0.8 : 0 });
      const hC = c.handPos('R'), hA = a.handPos('R');
      // パイ1：コーラルの手→まめの顔
      const p1x = lerp(hC.x, 100, easeInOut(fl1)), p1y = lerp(hC.y - 10, FY - 62, easeInOut(fl1)) - 40 * hump(fl1);
      tf(pieC, p1x, p1y, lerp(0, -300, fl1), 1, 1);
      pieC.setAttribute('opacity', fl1 > 0 && fl1 < 1 || fl1 === 0 && t < 1.5 ? 1 : 0);
      if (fl1 === 0) tf(pieC, hC.x - 4, hC.y - 12, 0, 1, 1);
      tf(splA, 88 + 2, FY - 62, 0, (hitA ? 1 : 0) * (t > 2.4 ? 1 - seg(t, 2.4, 2.7) : 1), (hitA ? 1 : 0) * (t > 2.4 ? 1 - seg(t, 2.4, 2.7) : 1));
      // パイ2：まめの手→コーラルの顔
      const q = t < 2.0 ? 0 : 1;
      const showQ = t >= 2.0 && t < 3.3;
      const p2x = lerp(hA.x + 4, 300, easeInOut(fl2)), p2y = lerp(hA.y - 12, FY - 62, easeInOut(fl2)) - 40 * hump(fl2);
      tf(pieA, p2x, p2y, lerp(0, 300, fl2), 1, 1);
      pieA.setAttribute('opacity', showQ ? 1 : 0);
      tf(splC, 312, FY - 62, 0, hitC ? 1.05 : 0, hitC ? 1.05 : 0);
      const hp = hump(seg(t, 0.9, 1.7));
      tf(ha, 330, FY - 112, 0, 1, 1);
      ha.setAttribute('opacity', t > 1.3 && t < 2.2 ? 1 : 0);
      ha.textContent = 'ha ha';
    }
  };
}
