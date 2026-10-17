// wait up：家族が出かけたあと、眠いのをこらえて起きたまま帰りを待つ（例文 Don't wait up for me tonight.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '「待たなくていい」'], [1.5, '眠いのをこらえる'], [3.4, '起きて待つ']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  // 夜の窓・月・時計・ドア・ソファ・ランプ（静止）
  el('rect', { x: 30, y: 44, width: 84, height: 74, rx: 8, fill: '#33406A' });
  const moon = el('path', { d: 'M 0 -12 a 12 12 0 1 0 12 12 a 9 9 0 1 1 -12 -12 Z', fill: '#FFE9A8' });
  [[44, 60], [98, 70], [60, 104]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 1.8, fill: '#fff' }));
  el('line', { x1: 72, y1: 44, x2: 72, y2: 118, stroke: '#fff', 'stroke-width': 4 });
  el('line', { x1: 30, y1: 81, x2: 114, y2: 81, stroke: '#fff', 'stroke-width': 4 });
  const clock = g({}); tf(clock, 200, 66);
  el('circle', { r: 24, fill: '#fff', stroke: pal.woodDark, 'stroke-width': 5 }, clock);
  [0, 90, 180, 270].forEach((a) => el('line', { x1: 0, y1: -19, x2: 0, y2: -15, stroke: pal.sub, 'stroke-width': 2, transform: `rotate(${a})` }, clock));
  const hh = el('line', { x1: 0, y1: 0, x2: 0, y2: -12, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, clock);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -18, stroke: pal.ink, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, clock);
  // 玄関：壁は x=318 まで。右は夜の屋外で、開いたドアは戸口の脇に静止
  el('rect', { x: 318, y: 0, width: 82, height: 300, fill: '#2E3A63' });
  el('rect', { x: 318, y: FY, width: 82, height: 60, fill: '#3B466F' });
  el('circle', { cx: 372, cy: 120, r: 2, fill: '#fff' }); el('circle', { cx: 350, cy: 70, r: 1.8, fill: '#fff' });
  el('rect', { x: 312, y: 96, width: 8, height: FY - 96, fill: pal.woodDark });
  el('rect', { x: 312, y: 90, width: 34, height: 8, rx: 3, fill: pal.woodDark });
  el('rect', { x: 320, y: 98, width: 10, height: FY - 98, fill: '#56607A' });
  el('rect', { x: 0, y: FY - 6, width: 318, height: 6, fill: pal.line });
  // ランプ
  el('rect', { x: 210, y: 190, width: 4, height: 62, fill: pal.sub });
  el('path', { d: 'M 196 192 L 228 192 L 220 166 L 204 166 Z', fill: pal.yellow });
  const glow = el('ellipse', { cx: 212, cy: 200, rx: 46, ry: 44, fill: pal.yellow, opacity: 0.18 });
  // 出かける人（右のドアから出る）
  const out = k.buddy({ x: 262, y: FY, scale: 0.95, color: pal.coral, dark: pal.coralDark, facing: 1 });
  el('rect', { x: 56, y: 192, width: 120, height: 48, rx: 16, fill: '#8F73DD' });
  const b = k.buddy({ x: 112, y: FY - 14, scale: 1.0 });
  el('rect', { x: 50, y: 226, width: 132, height: 26, rx: 10, fill: pal.violet });
  el('rect', { x: 40, y: 208, width: 20, height: 44, rx: 9, fill: '#8F73DD' });
  el('rect', { x: 172, y: 208, width: 20, height: 44, rx: 9, fill: '#8F73DD' });
  const bub = g({});
  el('rect', { x: -26, y: -16, width: 52, height: 30, rx: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('path', { d: 'M -8 14 L -14 24 L 0 14 Z', fill: '#fff' }, bub);
  k.text(0, -2, 'Zzz', { 'font-size': 16, fill: pal.sub }, bub);
  el('line', { x1: -22, y1: 14, x2: 22, y2: -16, stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, bub);
  const zz = k.text(0, 0, 'z', { 'font-size': 16, fill: pal.sub });
  return {
    update(t) {
      // 外へ出ていく人：手を振り、ドアの向こうへ（ドアの縁で隠れる）
      const wv = Math.sin(t * 14) * 14 * hump(seg(t, 0.2, 1.0));
      const go = easeInOut(seg(t, 1.0, 2.2));
      out.pose({ x: lerp(262, 440, go), walk: go > 0 && go < 1 ? t * 9 : 0, armR: t < 1.0 ? 120 + wv : 8 + Math.sin(t * 9) * 16 * (go > 0 && go < 1 ? 1 : 0), armL: 8, look: -0.4, mood: 'smile' });
      out.g.setAttribute('opacity', 1);
      tf(bub, 268, 150, 0, seg(t, 0.1, 0.35), seg(t, 0.1, 0.35));
      bub.setAttribute('opacity', t < 1.4 ? 1 : 0);
      // 時計と月
      const tm = seg(t, 0.8, 4.4);
      hh.setAttribute('transform', `rotate(${300 + tm * 40})`);
      mh.setAttribute('transform', `rotate(${tm * 480})`);
      tf(moon, 62, 60 + 8 * tm);
      // うとうと：頭が落ち、はっと起きる、を繰り返す
      const nod = clamp((Math.sin((t - 1.4) * 2.1) + 0.3) / 1.3) * seg(t, 1.4, 1.9) * (1 - seg(t, 3.3, 3.6));
      const jolt = hump(seg(t, 3.3, 3.8));
      const blinkv = t > 1.4 && t < 3.3 ? clamp(0.3 + nod * 0.9) : 0;
      b.pose({ squash: 0.86 - 0.03 * nod + 0.05 * jolt, lean: 4 + 12 * nod - 8 * jolt, look: 0.4, mood: t < 3.3 && t > 1.4 ? 'flat' : t >= 3.3 ? 'open' : 'smile', blink: blinkv * (1 - jolt),
        armR: t > 3.3 ? lerp(8, 70, jolt) : 8, armL: 8 });
      glow.setAttribute('opacity', 0.18);
      tf(zz, 150, FY - 108 - nod * 6, 0, nod > 0.3 ? 1 : 0.0001);
    }
  };
}
