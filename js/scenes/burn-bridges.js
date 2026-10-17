// burn bridges：橋を渡りきると橋が燃え落ち、もう戻れない（例文 Don't burn bridges when you quit.）
import { seg, lerp, easeInOut, easeIn, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '橋を渡る'], [1.8, '橋が燃える'], [3.4, '戻れない']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  // 川（谷）
  el('rect', { x: 130, y: FY, width: 140, height: 70, fill: pal.water });
  el('path', { d: 'M 130 252 Q 150 246 170 252 T 210 252 T 250 252 T 270 252', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 3, opacity: 0.7 });
  el('rect', { x: 0, y: FY, width: 132, height: 70, fill: pal.floor });
  el('rect', { x: 268, y: FY, width: 132, height: 70, fill: pal.floor });
  el('rect', { x: 0, y: FY, width: 132, height: 3, fill: pal.floorEdge });
  el('rect', { x: 268, y: FY, width: 132, height: 3, fill: pal.floorEdge });
  // 左岸：家（元の場所）
  el('rect', { x: 18, y: FY - 44, width: 50, height: 44, fill: '#F3D9B8' });
  el('path', { d: `M 10 ${FY - 44} L 76 ${FY - 44} L 43 ${FY - 74} Z`, fill: pal.coralDark });
  el('rect', { x: 36, y: FY - 26, width: 14, height: 26, fill: pal.woodDark });
  // 橋（板）
  const N = 7, planks = [];
  for (let i = 0; i < N; i++) {
    const pg = g({});
    const px = 134 + i * 20;
    el('rect', { x: -9, y: -4, width: 18, height: 9, rx: 2, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 1.5 }, pg);
    planks.push([pg, px]);
  }
  const rope = el('path', { d: `M 130 ${FY - 8} L 270 ${FY - 8}`, stroke: pal.woodDark, 'stroke-width': 3, opacity: 0.7 });
  // 炎
  const flames = planks.map(() => {
    const f = el('path', { d: 'M 0 0 Q -10 -10 -3 -22 Q 0 -14 4 -26 Q 12 -12 8 0 Z', fill: pal.coral });
    const f2 = el('path', { d: 'M 0 0 Q -5 -6 0 -14 Q 6 -6 4 0 Z', fill: pal.yellow });
    return [f, f2];
  });
  const b = k.buddy({ x: 40, y: FY, scale: 1 });
  const base = { armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0, mood: 'smile', blink: 0, lift: 0 };
  const smoke = el('ellipse', { rx: 20, ry: 10, fill: '#8B93A3' });

  return {
    update(t) {
      const walkP = easeInOut(seg(t, 0.2, 1.8));
      const x = lerp(90, 318, walkP);
      const turn = t > 2.5;
      const sadP = seg(t, 2.6, 3.0);
      b.pose({ ...base, x, y: FY - 0, walk: walkP > 0 && walkP < 1 ? t * 10 : 0, facing: turn ? -1 : 1, mood: turn ? 'sad' : 'smile', lean: turn ? 6 * sadP : 3, look: turn ? 0.6 : 0, armL: turn ? 20 : 8, armR: turn ? 20 : 8 });
      // 橋は左端から右へ燃え広がり、落ちる
      planks.forEach(([pg, px], i) => {
        const ig = 1.9 + i * 0.12;
        const fall = easeIn(seg(t, ig + 0.35, ig + 0.95));
        tf(pg, px + 4 * fall, FY - 4 + 90 * fall, 30 * fall, 1, 1);
        pg.setAttribute('opacity', 1 - seg(t, ig + 0.7, ig + 1.0));
        const fp = seg(t, ig, ig + 0.2) * (1 - seg(t, ig + 0.55, ig + 0.8));
        const [f, f2] = flames[i];
        const wv = 1 + 0.2 * Math.sin(t * 20 + i);
        tf(f, px, FY - 6, 0, fp * 1.1, fp * wv * 1.3);
        tf(f2, px, FY - 6, 0, fp, fp * wv);
      });
      rope.setAttribute('opacity', 0.7 * (1 - seg(t, 1.9, 2.9)));
      const sp = seg(t, 2.2, 3.4);
      tf(smoke, 160 + 30 * sp, FY - 30 - 50 * sp, 0, 1 + sp, 1 + sp);
      smoke.setAttribute('opacity', 0.4 * hump(sp));
    }
  };
}
