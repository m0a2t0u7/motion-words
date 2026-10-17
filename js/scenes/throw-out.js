// throw out：古いいすを持って戸口から外へ運び、ごみ箱へ放り込む（例文 He threw out the old chair.）
import { seg, lerp, easeInOut, easeOut, wobble } from '../ease.js';

export const meta = { duration: 4.8, beats: [[0, '古いいす'], [2.0, '外へ運ぶ'], [4.0, '捨てた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  // 室内（左）と壁の戸口
  el('rect', { x: 0, y: 0, width: 236, height: 236, fill: k.gradient([[0, pal.indoorTop], [1, pal.indoorBottom]]) });
  el('rect', { x: 0, y: 236, width: 236, height: 64, fill: '#E8DCCB' });
  el('rect', { x: 0, y: 234, width: 236, height: 3, fill: pal.woodDark });
  el('rect', { x: 52, y: 52, width: 72, height: 62, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 88, y1: 52, x2: 88, y2: 114, stroke: '#fff', 'stroke-width': 4 });
  el('ellipse', { cx: 104, cy: 243, rx: 52, ry: 9, fill: '#D6C5AE' });
  el('rect', { x: 236, y: 0, width: 16, height: 124, fill: '#E9DFD2' });
  el('rect', { x: 226, y: 118, width: 36, height: 8, rx: 2, fill: pal.woodDark });
  el('rect', { x: 236, y: 126, width: 5, height: 110, fill: pal.woodDark });
  el('rect', { x: 246, y: 126, width: 5, height: 110, fill: pal.woodDark });
  el('rect', { x: 232, y: 236, width: 24, height: 5, rx: 2, fill: pal.woodDark });
  // ごみ箱（奥の縁・ふた）
  const bin = g({});
  el('path', { d: 'M 326 172 L 392 172 L 386 128 L 332 128 Z', fill: '#3F9A5E' }, bin);
  el('rect', { x: 326, y: 170, width: 66, height: 14, fill: '#2F5D45' }, bin);
  const shadowC = k.shadow(0, 237, 22, 4);
  // 人物
  const b = k.buddy({ x: 55, y: FY, scale: 0.85 });
  // いす（原点＝座面の中央）
  const ch = g({});
  const chair = g({}, ch);
  el('rect', { x: -15, y: 3, width: 6, height: 20, rx: 2, fill: pal.woodDark }, chair);
  el('rect', { x: 9, y: 3, width: 6, height: 20, rx: 2, fill: pal.woodDark }, chair);
  el('path', { d: 'M -17 4 L -13 4 L -14 14 L -17 20 Z', fill: pal.woodDark, opacity: 0 }, chair);
  el('rect', { x: -18, y: -37, width: 6, height: 40, rx: 2, fill: pal.wood }, chair);
  el('rect', { x: -17, y: -30, width: 4, height: 3, fill: pal.woodDark }, chair);
  el('rect', { x: -18, y: -4, width: 36, height: 8, rx: 3, fill: pal.wood }, chair);
  el('path', { d: 'M 4 -4 L 8 0 L 5 4', fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5 }, chair);
  el('rect', { x: -12, y: -12, width: 8, height: 8, rx: 2, fill: pal.red, opacity: 0.0 }, chair);
  // ごみ箱の手前の面（いすはここに隠れて入る）
  const front = g({});
  el('path', { d: 'M 320 182 L 398 182 L 392 236 L 326 236 Z', fill: pal.green }, front);
  el('rect', { x: 318, y: 178, width: 82, height: 8, rx: 3, fill: '#3F9A5E' }, front);
  [196, 210, 224].forEach((y) => el('line', { x1: 324, y1: y, x2: 394, y2: y, stroke: '#3F9A5E', 'stroke-width': 2 }, front));
  const puff = g({});
  [-1, 0, 1].forEach((i) => el('circle', { cx: i * 14, cy: 0, r: 6, fill: '#fff', opacity: 0.9 }, puff));
  const P0 = { x: 302.7, y: 181.6 }, LX = 356, LY = 190;

  return {
    update(t) {
      const lift = easeOut(seg(t, 0.8, 1.3));
      const wp = seg(t, 1.2, 2.9);
      const x = t < 1.2 ? 55 : lerp(55, 272, easeInOut(wp));
      const walking = t > 1.2 && t < 2.9;
      const wph = (t - 1.2) * 9;
      const wind = easeInOut(seg(t, 2.95, 3.2)), swing = easeOut(seg(t, 3.2, 3.4));
      const rel = 3.3;
      let arm = lerp(lerp(15, 62, lift), 40, wind);
      arm = t < 3.2 ? arm : lerp(40, 135, swing);
      if (t > 3.8) arm = lerp(135, 12, easeInOut(seg(t, 3.8, 4.1)));
      // 手をはたく
      const clap = t > 4.1 ? Math.sin((t - 4.1) * 16) * 20 : 0;
      b.pose({
        x, armR: arm + clap, armL: walking ? Math.sin(wph) * 18 : 8, walk: walking ? wph : 0,
        lean: lift * 4 + wind * -6 + swing * 8 * (t < 3.9 ? 1 : 0), mood: t < 0.8 ? 'flat' : t > 3.9 ? 'grin' : 'smile',
        look: t < 0.8 ? 0.5 + 0.5 * Math.sin(t * 8) : 0.5
      });
      const h = b.handPos('R');
      let px, py, rot = 0, sh = 1;
      if (t < 0.8) { px = 118; py = 213; rot = wobble(seg(t, 0.2, 0.8), 2, 3) * 2; }
      else if (t < rel) { px = lerp(118, h.x - 14, lift); py = lerp(213, h.y - 3, lift); }
      else {
        const p = seg(t, rel, 3.9), e = p;
        px = lerp(P0.x, LX, e);
        py = lerp(P0.y, LY, e) - 4 * 52 * e * (1 - e);
        rot = lerp(0, 205, easeInOut(e));
        sh = 0;
        if (t >= 3.9) { px = LX; py = LY; rot = 205 + wobble(seg(t, 3.9, 4.7), 2, 4) * 7; }
      }
      tf(ch, px, py, rot);
      shadowC.setAttribute('opacity', 1 - lift);
      tf(shadowC, px, 0);
      // ごみ箱：着地でわずかにつぶれ、ほこりが出る
      const hit = seg(t, 3.85, 4.5);
      const sq = 1 - 0.035 * Math.sin(Math.min(1, hit * 3) * Math.PI) * (t > 3.85 ? 1 : 0);
      front.setAttribute('transform', `translate(359 236) scale(1 ${sq.toFixed(3)}) translate(-359 -236)`);
      tf(puff, 356, 168 - 14 * hit, 0, 0.4 + hit);
      puff.setAttribute('opacity', t > 3.85 ? (1 - hit) * 0.9 : 0);
    }
  };
}
