// leader：旗を掲げたまめが先頭に立ち、仲間を山道へ導く。最後に振り返って励ます（例文 She is a good leader.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, YE, held, P, blinkAt, walkTo, path } from './member.js';
import { scene, hills, mountain, treeG } from './nature.js';

export const meta = { duration: 4.4, beats: [[0, '旗をかかげる'], [1.0, 'みんなを導く'], [3.4, '頼れるリーダー']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, s2 = 0.68, FY = 238;
  scene(k, { FY });
  mountain(k, 300, FY - 30, 230, 130, '#B3C8DD');
  hills(k, FY);
  const t1 = treeG(k, 0.9); tf(t1.g, 40, FY);
  const t2 = treeG(k, 0.7); tf(t2.g, 370, FY);
  el('path', { d: `M 0 ${FY + 20} Q 200 ${FY + 6} 400 ${FY + 18}`, stroke: '#E9DDC4', 'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' });
  const cols = [CO(k), BL(k), YE(k)];
  const fol = cols.map((c) => k.buddy({ x: -60, y: FY, scale: s2, ...c }));
  const b = k.buddy({ x: 120, y: FY, scale: S });
  // 旗（原点＝握り、+y が腕の先）
  const flag = g({});
  el('line', { x1: 0, y1: -8, x2: 0, y2: 58, stroke: pal.woodDark, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, flag);
  const cloth = el('path', { fill: pal.red }, flag);
  const lx = path([[0.6, 120], [3.2, 280]]);
  const fx = (i) => (t) => lx(t - 0.3 * (i + 1)) - 52 * (i + 1);
  return {
    update(t) {
      const w = walkTo(lx, t, 120, 1), back = easeInOut(seg(t, 3.4, 3.8));
      const up = easeOut(seg(t, 0.1, 0.6));
      P(b, { x: w.x, walk: w.walk, armL: back > 0.5 ? lerp(w.armL, 150, back) : w.armL, armR: lerp(110, 158, up), lean: w.lean, facing: back > 0.5 ? -1 : 1, blink: blinkAt(t), mood: back > 0.5 ? 'grin' : 'smile', look: 0.3 });
      held(k, b, S, flag, 'R', b.state.facing > 0 ? -8 : 8);
      const wv = Math.sin(t * 9) * 3;
      k.set(cloth, { d: `M 0 58 Q ${-12} ${54 + wv} -26 ${58 - wv} L -26 40 Q -12 ${36 - wv} 0 40 Z` });
      fol.forEach((f, i) => {
        const p = walkTo(fx(i), t, fx(i)(0), 1);
        P(f, { x: p.x, walk: p.walk, armL: p.armL, armR: back > 0.5 && i === 0 ? 8 + 110 * hump(seg(t, 3.7, 4.4)) : p.armR, lean: p.lean, blink: blinkAt(t, i * 0.7), look: 0.4, mood: t > 3.6 ? 'grin' : 'smile' });
      });
    }
  };
}
