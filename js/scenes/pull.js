// pull：まめがロープをたぐって、箱を自分のほうへ引き寄せる（例文 She pulled the box toward her with a rope.）
import { seg, lerp, easeInOut, easeOut, smooth, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, 'ロープを持つ'], [0.9, '引く'], [2.9, '手前に来る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 292, y: 40, width: 80, height: 62, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 332, y1: 40, x2: 332, y2: 102, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('rect', { x: 60, y: 58, width: 70, height: 50, rx: 6, fill: '#FBE3D8' });
  el('circle', { cx: 95, cy: 83, r: 12, fill: pal.coral, opacity: 0.7 });
  [0, 1, 2, 3, 4, 5].forEach((i) => el('rect', { x: 16 + i * 70, y: FY + 34, width: 22, height: 5, rx: 2.5, fill: '#DDE3EA' }));

  const S = 1.05, MX = 80, B0 = 330;
  const starts = [0.9, 1.65, 2.4], DUR = 0.5, STEP = 51;
  const boxX = (t) => B0 - STEP * starts.reduce((m, s0) => m + smooth(seg(t, s0, s0 + DUR)), 0) - 3 * easeOut(seg(t, 2.9, 3.3));
  const boxV = (t) => { const h = 0.02; return (boxX(t - h) - boxX(t + h)) / (2 * h); };

  const rope = el('path', { d: '', stroke: '#A9824F', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' });
  const ropeHi = el('path', { d: '', stroke: '#D9B67E', 'stroke-width': 1.6, fill: 'none', 'stroke-linecap': 'round', 'stroke-dasharray': '3 5' });
  const box = g({});
  k.shadow(0, 0, 40, 6, box);
  el('rect', { x: -33, y: -56, width: 66, height: 56, rx: 4, fill: pal.wood }, box);
  el('rect', { x: -33, y: -56, width: 66, height: 9, rx: 4, fill: '#F0D9B8' }, box);
  el('rect', { x: -7, y: -56, width: 14, height: 56, fill: '#EBD3AE' }, box);
  el('rect', { x: -33, y: -8, width: 66, height: 8, rx: 3, fill: pal.woodDark, opacity: 0.5 }, box);
  el('rect', { x: 8, y: -32, width: 14, height: 10, rx: 3, fill: '#FFFFFF', opacity: 0.55 }, box);
  el('circle', { cx: -33, cy: -26, r: 5, fill: 'none', stroke: pal.sub, 'stroke-width': 3 }, box);
  const lines = [0, 1, 2].map(() => el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));

  const b = k.buddy({ x: MX, y: FY, scale: S });
  b.g.firstChild.setAttribute('display', 'none');
  const sh = k.shadow(0, FY + 2, 32 * S, 6);
  const arm2 = g({}, b.body);
  el('line', { x1: 0, y1: 0, x2: 0, y2: 31, stroke: pal.mintDark, 'stroke-width': 9, 'stroke-linecap': 'round' }, arm2);
  el('circle', { cx: 0, cy: 33, r: 6.5, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.5 }, arm2);

  return {
    update(t) {
      const bx = boxX(t);
      const v = boxV(t);
      // 引いている区間か（引く：0〜DUR、持ち替え：DUR〜DUR+0.22）
      let pulling = 0, regrab = 0, phase = 0;
      starts.forEach((s0) => {
        const q = t - s0;
        if (q >= 0 && q < DUR) { pulling = 1; phase = q / DUR; }
        else if (q >= DUR && q < DUR + 0.22 && s0 !== starts[2]) { regrab = 1; phase = (q - DUR) / 0.22; }
      });
      const reach = easeOut(seg(t, 0.3, 0.75));
      const done = easeInOut(seg(t, 2.95, 3.6));
      let armA;
      if (pulling) armA = lerp(86, 38, smooth(phase));
      else if (regrab) armA = lerp(38, 86, easeOut(phase));
      else if (t < 2.95) armA = t < 0.9 ? lerp(8, 86, reach) : 38;
      else armA = lerp(38, 12, done);
      const engaged = easeInOut(seg(t, 0.65, 0.95)) * (1 - done);
      const lean = -(pulling ? 17 : regrab ? 9 : 10) * engaged + 3 * hump(seg(t, 3.0, 3.6)) * (t > 3.0 ? 1 : 0) + Math.sin(t * 40) * 0.8 * pulling;
      b.pose({
        x: MX - 2 * pulling * Math.sin(phase * Math.PI), y: FY, armR: armA, armL: 8, lean,
        squash: 1 - 0.06 * engaged, walk: 0, look: -0.5,
        mood: t < 0.9 ? 'smile' : t < 3.0 ? 'open' : 'smile'
      });
      tf(arm2, 18, -36, -armA + 4);
      arm2.setAttribute('opacity', reach > 0.05 ? 1 : 0);
      sh.setAttribute('transform', `translate(${(MX - 2 * pulling * Math.sin(phase * Math.PI)).toFixed(2)} 0)`);
      // 箱（動くときに少し前が上がる）
      tf(box, bx, FY + 2, v > 20 ? -1.2 : 0);
      // ロープ：引いている間はピンと張る
      const hp = b.handPos('R');
      const ax = bx - 33, ay = FY - 26 + 2;
      const taut = pulling ? 1 : 0;
      const slack = t < 0.9 ? 14 + 10 * (1 - reach) : regrab ? 8 : t > 2.95 ? 8 + 22 * done : 3;
      const dist = Math.hypot(ax - hp.x, ay - hp.y);
      const sag = taut ? 0 : Math.min(slack, 6 + dist * 0.2);
      const mx = (ax + hp.x) / 2, my = (ay + hp.y) / 2 + sag + (taut ? Math.sin(t * 60) * 0.8 : 0);
      const d = `M ${ax} ${ay} Q ${mx} ${my} ${hp.x} ${hp.y}`;
      rope.setAttribute('d', d); ropeHi.setAttribute('d', d);
      // 動いているときの速度線（箱の後ろ側）
      lines.forEach((l, i) => {
        const len = Math.min(30, v * 0.3), y = FY - 12 - i * 16;
        k.set(l, { x1: bx + 40 + i * 4, y1: y, x2: bx + 40 + i * 4 + len, y2: y });
        l.setAttribute('opacity', v > 25 ? 0.8 : 0);
      });
    }
  };
}
