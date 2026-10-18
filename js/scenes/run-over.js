// run over：トラックが道路の空き缶の上を通り、タイヤにひかれた缶がぺしゃんこになる（例文 A truck ran over a can in the road.）
import { seg, lerp, easeInOut, wobble } from '../ease.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 4.0, beats: [[0, '道に空き缶'], [1.8, 'タイヤがひく'], [3.2, 'ぺしゃんこ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = streetBg(k, 226);
  el('rect', { x: 0, y: FY, width: 400, height: 74, fill: '#D5DBE3' });
  for (let x = 10; x < 400; x += 40) el('rect', { x, y: FY + 40, width: 20, height: 3, fill: '#fff' });
  const RY = FY + 24, CX = 200;
  const csh = k.shadow(CX, RY, 12, 2.5);
  const can = g({});
  const cb = el('rect', { x: -8, y: -24, width: 16, height: 24, rx: 2, fill: pal.red }, can);
  const cs = el('rect', { x: -8, y: -16, width: 16, height: 6, fill: '#fff', opacity: 0.8 }, can);
  // トラック（運転席にまめ）
  const tr = g({});
  const body = g({}, tr);
  el('rect', { x: -150, y: -84, width: 110, height: 70, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, body);
  el('rect', { x: -144, y: -60, width: 98, height: 6, fill: pal.blue }, body);
  el('path', { d: 'M -36 -14 L -36 -72 L 0 -72 L 18 -44 L 22 -14 Z', fill: pal.blue }, body);
  el('path', { d: 'M -28 -66 L -4 -66 L 10 -46 L -28 -46 Z', fill: '#CFE9F7' }, body);
  const drv = k.buddy({ parent: body, x: -14, y: -38, scale: 0.32 }); drv.g.children[0].setAttribute('opacity', 0);
  el('path', { d: 'M -28 -66 L -4 -66 L 10 -46 L -28 -46 Z', fill: '#fff', opacity: 0.25 }, body);
  el('rect', { x: -150, y: -18, width: 172, height: 8, fill: pal.sub }, body);
  const wheels = [-118, -4].map((x) => { const w = g({}, tr); el('circle', { r: 15, fill: pal.ink }, w); el('circle', { r: 6, fill: '#B9C3D0' }, w); el('rect', { x: -1.5, y: -13, width: 3, height: 7, fill: '#B9C3D0' }, w); return [w, x]; });
  const tsh = k.shadow(0, RY, 100, 5);
  return {
    update(t) {
      const x = lerp(-40, 560, easeInOut(seg(t, 0.2, 3.6)) * 0.4 + seg(t, 0.2, 3.6) * 0.6);
      // 前輪・後輪が缶を越えるときに、ちょっと持ち上がる
      const bumpF = Math.max(0, 1 - Math.abs(x - 4 - CX) / 14), bumpR = Math.max(0, 1 - Math.abs(x - 118 - CX) / 14);
      const crushed = x - 4 > CX - 4;
      tf(tr, x, RY - 15 - 3 * bumpF - 3 * bumpR, (bumpF - bumpR) * 1.5);
      wheels.forEach(([w, wx]) => tf(w, wx, 0, x * 3));
      tf(body, 0, 15 + wobble(seg(x, CX + 4, CX + 80), 2, 4) * 1.5);
      tf(tsh, x - 64, 0);
      const sq = crushed ? 0.18 : 1, wide = crushed ? 1.8 : 1;
      tf(can, CX, RY, 0, wide, sq);
      k.set(csh, { rx: 12 * wide });
      drv.pose({ armR: 70 + 6 * Math.sin(t * 5), armL: 70, look: 0.6, mood: 'flat' });
    }
  };
}
