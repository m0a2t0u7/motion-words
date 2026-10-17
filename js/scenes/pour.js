// pour：まめがケトルの取っ手を持ち、腕で傾けてカップへお湯をていねいに注ぐ（例文 He poured hot water into the cup.）
import { seg, lerp, easeInOut, easeOut, easeIn, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '傾ける'], [1.3, '注ぐ'], [3.1, 'たまった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓
  el('rect', { x: 30, y: 30, width: 70, height: 62, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 65, y1: 30, x2: 65, y2: 92, stroke: '#FFFFFF', 'stroke-width': 4 });

  const TT = 258, MS = 1.4, MY = 278; // テーブル天板の高さ、まめの大きさ・足元
  const CX = 285, CS = 0.66;          // カップの位置・大きさ
  const KS = 0.7, GRIP = 68;          // ケトルの大きさ、取っ手の握り位置（ケトル中心から左へ）

  // 低いテーブル
  k.shadow(268, 292, 126, 6);
  el('rect', { x: 156, y: TT + 10, width: 10, height: 26, rx: 3, fill: pal.woodDark });
  el('rect', { x: 370, y: TT + 10, width: 10, height: 26, rx: 3, fill: pal.woodDark });
  el('rect', { x: 140, y: TT, width: 256, height: 14, rx: 7, fill: pal.wood });
  el('rect', { x: 146, y: TT + 10, width: 244, height: 4, rx: 2, fill: pal.woodDark, opacity: 0.45 });

  // カップ
  const CUP_H = 76;
  k.shadow(CX + 4, TT + 3, 32, 5);
  const cup = g({});
  tf(cup, CX, TT, 0, CS, CS);
  el('path', { d: 'M 34 -62 Q 66 -62 62 -38 Q 58 -18 28 -18', fill: 'none', stroke: pal.blue, 'stroke-width': 8, 'stroke-linecap': 'round' }, cup);
  const bodyD = `M -34 ${-CUP_H} L 34 ${-CUP_H} L 28 -6 Q 27 0 20 0 L -20 0 Q -27 0 -28 -6 Z`;
  el('path', { d: bodyD, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }, cup);
  const clipId = k.clip((cp) => el('path', { d: bodyD }, cp));
  const water = g({ 'clip-path': clipId }, cup);
  const wRect = el('rect', { x: -40, y: -10, width: 80, height: 90, fill: pal.water }, water);
  const wTop = el('rect', { x: -40, y: -10, width: 80, height: 4, fill: '#C4E9FA' }, water);
  el('rect', { x: -28, y: -14, width: 56, height: 6, rx: 3, fill: pal.blue, opacity: 0.18 }, cup);
  el('ellipse', { cx: -20, cy: -46, rx: 3, ry: 14, fill: '#FFFFFF', opacity: 0.7 }, cup);
  const steams = [0, 1, 2].map(() => {
    const s = g({}, cup);
    el('path', { d: 'M 0 0 C 9 -9 -9 -19 0 -29 S 9 -47 0 -56', fill: 'none', stroke: '#BFCBDA', 'stroke-width': 5, 'stroke-linecap': 'round' }, s);
    return s;
  });

  // 水の流れ
  const stream = el('path', { d: '', fill: 'none', stroke: pal.water, 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const drops = [0, 1, 2].map(() => el('circle', { r: 2.2, fill: pal.water }));
  const ripple = el('ellipse', { rx: 10, ry: 2.5, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 2 });

  // ケトル（原点＝取っ手の握り位置。ここを手に合わせて回す）
  const kShadow = k.shadow(0, 0, 36, 5);
  const kettle = g({});
  const kb = g({}, kettle);
  tf(kb, GRIP, 0);
  el('path', { d: 'M -38 -22 Q -72 -22 -68 0 Q -64 22 -36 20', fill: 'none', stroke: pal.yellowDark, 'stroke-width': 9, 'stroke-linecap': 'round' }, kb);
  el('path', { d: 'M 36 -2 Q 54 -10 64 -46', fill: 'none', stroke: pal.coralDark, 'stroke-width': 12, 'stroke-linecap': 'round' }, kb);
  el('rect', { x: -44, y: -34, width: 88, height: 68, rx: 26, fill: pal.coral }, kb);
  el('ellipse', { cx: -22, cy: -12, rx: 7, ry: 15, fill: '#FFFFFF', opacity: 0.28 }, kb);
  el('path', { d: 'M -22 -34 Q 0 -46 22 -34 Z', fill: pal.coralDark }, kb);
  el('circle', { cx: 0, cy: -46, r: 6, fill: pal.yellow }, kb);

  const b = k.buddy({ x: 100, y: MY, scale: MS });

  const rad = Math.PI / 180;
  return {
    update(t) {
      // ---- まめ：近づきながら腕を上げ、注ぎ終えたらケトルを下ろして戻る ----
      const lift = easeInOut(seg(t, 0.4, 1.3));
      const low = easeInOut(seg(t, 3.3, 4.0));
      const a = 18 + 147 * lift - 147 * low;
      const mx = 100 + 35 * lift - 35 * low;
      const walking = (t > 0.4 && t < 1.3) || (t > 3.3 && t < 4.0);
      const w = walking ? (t < 2 ? t - 0.4 : t - 3.3) * 9 : 0;
      const sw = walking ? Math.sin(w) * 14 : 0;
      b.pose({ x: mx, walk: w, armR: a, armL: 8 + sw, look: 0.9, mood: t > 3.4 ? 'grin' : 'smile', lean: 0, squash: 1 });
      const hp = b.handPos('R');
      const hx = hp.x, hy = hp.y - (walking ? Math.abs(Math.sin(w)) * 3 * MS : 0);

      // ---- ケトル：取っ手の位置を手に合わせ、そこを中心に傾ける ----
      const tilt = (36 * easeInOut(seg(t, 0.85, 1.45)) + 4 * seg(t, 1.7, 2.8)) * (1 - easeInOut(seg(t, 2.95, 3.4)));
      tf(kettle, hx, hy, tilt, KS, KS);
      const onTable = tilt < 1 ? clamp(1 - (TT - (hy + 34 * KS)) / 24) : 0;
      tf(kShadow, hx + GRIP * KS, TT + 3, 0, 1, 1);
      kShadow.setAttribute('opacity', onTable);

      // 注ぎ口の先
      const ca = Math.cos(tilt * rad), sa = Math.sin(tilt * rad);
      const lx = KS * (GRIP + 64), ly = KS * -46;
      const tipX = hx + lx * ca - ly * sa;
      const tipY = hy + lx * sa + ly * ca;

      // 水位
      const lv = lerp(0, 56, easeInOut(seg(t, 1.6, 3.0)));
      const surf = -6 - lv;
      k.set(wRect, { y: surf });
      k.set(wTop, { y: surf });
      const surfY = TT + surf * CS;

      // 水の流れ（注ぎ口→水面）
      const u1 = easeOut(seg(t, 1.42, 1.64));
      const u0 = easeInOut(seg(t, 2.75, 3.1));
      const flowing = t > 1.42 && u0 < u1;
      if (flowing) {
        let d = '';
        for (let i = 0; i <= 8; i++) {
          const u = lerp(u0, u1, i / 8);
          const x = tipX + 7 * (1 - (1 - u) * (1 - u));
          const y = lerp(tipY, surfY, u);
          d += (i ? ' L ' : 'M ') + x.toFixed(1) + ' ' + y.toFixed(1);
        }
        k.set(stream, { d, opacity: 1, 'stroke-width': 6 - 2.5 * u0 });
      } else {
        k.set(stream, { opacity: 0 });
      }
      const falling = t > 1.64 && t < 3.15;
      const endX = tipX + 7;
      drops.forEach((c, i) => {
        const ph = (t * 2.4 + i * 0.34) % 1;
        const up = 14 * 4 * ph * (1 - ph);
        k.set(c, { cx: endX + (i - 1) * (5 + ph * 11), cy: surfY - up, opacity: falling ? 0.9 : 0 });
      });
      const rp = (t * 1.8) % 1;
      k.set(ripple, { cx: endX, cy: surfY + 1, rx: 6 + rp * 14, opacity: falling ? 0.8 * (1 - rp) : 0 });

      // 湯気：たまってきたら立ちのぼる
      const sv = seg(t, 2.3, 3.1);
      steams.forEach((s, i) => {
        const ph = (t * 0.55 + i / 3) % 1;
        tf(s, (i - 1) * 20 + Math.sin(t * 2 + i) * 2, -CUP_H - 6 - ph * 10, 0, 1, 1);
        s.setAttribute('opacity', sv * Math.sin(Math.PI * ph) * 0.9);
      });
    }
  };
}
