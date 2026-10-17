// come back：出かけていた父が6時に家へ戻り、ドアの前で手を上げる（例文 My dad came back at six.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';

const R = 4.6 / 4.4; // 内部の時間割は 4.6 秒分。表示は 4.4 秒に収める
export const meta = { duration: 4.4, beats: [[0, '外にいる'], [1.2, '戻ってくる'], [3.3, '帰ってきた']].map(([a, n]) => [+(a / R).toFixed(2), n]) };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 道
  el('rect', { x: 0, y: FY, width: 260, height: 10, fill: '#E3E8EE' });
  // 家（go-out と同じ形を左右反転して右に置く）
  const house = g({ transform: 'translate(400 0) scale(-1 1)' });
  el('rect', { x: 20, y: 96, width: 170, height: 140, rx: 6, fill: '#FBE9DC' }, house);
  el('path', { d: 'M 8 104 L 105 40 L 202 104 Z', fill: pal.coral, 'stroke-linejoin': 'round', stroke: pal.coral, 'stroke-width': 8 }, house);
  el('rect', { x: 36, y: 128, width: 40, height: 36, rx: 5, fill: '#CFE9F7' }, house);
  el('line', { x1: 56, y1: 128, x2: 56, y2: 164, stroke: '#FFFFFF', 'stroke-width': 3 }, house);
  el('rect', { x: 96, y: 134, width: 62, height: 102, rx: 4, fill: pal.blue }, house);
  el('rect', { x: 104, y: 144, width: 46, height: 36, rx: 4, fill: '#FFFFFF', opacity: 0.25 }, house);
  el('circle', { cx: 148, cy: 190, r: 4, fill: pal.yellow }, house);
  el('rect', { x: 90, y: 230, width: 74, height: 8, rx: 3, fill: pal.woodDark }, house);
  el('rect', { x: 92, y: 130, width: 70, height: 6, rx: 3, fill: pal.coralDark }, house);

  // 壁の時計（破風の中）
  const clock = g({});
  el('circle', { cx: 0, cy: 0, r: 25, fill: '#FFFFFF', stroke: pal.ink, 'stroke-width': 3.5 }, clock);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, big = i % 3 === 0;
    el('line', { x1: Math.sin(a) * (big ? 17 : 19), y1: -Math.cos(a) * (big ? 17 : 19), x2: Math.sin(a) * 22, y2: -Math.cos(a) * 22, stroke: pal.sub, 'stroke-width': big ? 2.6 : 1.6, 'stroke-linecap': 'round' }, clock);
  }
  const hHand = g({}, clock), mHand = g({}, clock);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -11, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, hHand);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -18, stroke: pal.coralDark, 'stroke-width': 2.8, 'stroke-linecap': 'round' }, mHand);
  el('circle', { cx: 0, cy: 0, r: 3, fill: pal.ink }, clock);
  const dings = [-1, 1].map((d) => el('path', { d: `M ${d * 31} -8 Q ${d * 37} 0 ${d * 31} 8`, stroke: pal.yellowDark, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, clock));

  // お父さん（帽子とかばんで区別）
  const b = k.buddy({ x: 20, y: 224, scale: 0.45 });
  el('path', { d: 'M -23 -78 Q -22 -102 0 -103 Q 22 -102 23 -78 Z', fill: pal.blueDark }, b.body);
  el('rect', { x: -27, y: -81, width: 54, height: 7, rx: 3.5, fill: pal.blue }, b.body);
  const bag = g({});
  el('rect', { x: -10, y: -2, width: 20, height: 16, rx: 3, fill: pal.wood, stroke: pal.woodDark, 'stroke-width': 2 }, bag);
  el('path', { d: 'M -5 -2 Q 0 -9 5 -2', stroke: pal.woodDark, 'stroke-width': 2.2, fill: 'none' }, bag);
  const dusk = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#FF9F5A', opacity: 0, 'pointer-events': 'none' });

  return {
    update(tt) {
      const t = tt * R;
      const wp = seg(t, 0.5, 3.1);
      const walking = t > 0.5 && t < 3.1;
      const e = lerp(easeOut(wp), wp, 0.7);
      const x = lerp(20, 273, e);
      const s = lerp(0.45, 0.85, e);
      const y = lerp(222, 236, e);
      const ph = (t - 0.5) * 9;
      const wave = seg(t, 3.15, 3.5);
      const w = Math.sin((t - 3.4) * 11);
      b.pose({
        x, y, scale: s,
        walk: walking ? ph : 0,
        armL: walking ? 8 + Math.sin(ph) * 14 : 8,
        armR: walking ? 8 - Math.sin(ph) * 18 : lerp(8, 150, easeOut(wave)) + (wave >= 1 ? w * 14 : 0),
        lean: walking ? 4 : 0,
        mood: t > 3.1 ? 'open' : 'smile',
        look: 0.4
      });
      b.g.setAttribute('transform', b.g.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${s.toFixed(3)} ${s.toFixed(3)})`));
      const hp = b.handPos('L');
      tf(bag, hp.x, hp.y - 4, walking ? -Math.sin(ph) * 8 : 0, s * 1.1);
      // 時計：5時40分 → 6時
      const cp = easeInOut(seg(t, 0.9, 3.0));
      tf(hHand, 0, 0, lerp(170, 180, cp));
      tf(mHand, 0, 0, lerp(240, 360, cp));
      const dp = seg(t, 3.0, 3.9);
      tf(clock, 295, 82, wobble(dp, 4, 4) * 5);
      dings.forEach((d) => d.setAttribute('opacity', dp > 0 && dp < 0.85 ? 1 - dp : 0));
      dusk.setAttribute('opacity', 0.08 * easeInOut(seg(t, 0.8, 3.2)));
    }
  };
}
