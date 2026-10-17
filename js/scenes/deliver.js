// deliver：配達バンが家の前に止まり、配達員のまめが箱を玄関まで運んで置く（例文 The package will be delivered tomorrow.）
import { seg, lerp, easeInOut, easeOut, easeIn, smooth, backOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '運ぶ'], [2.0, '届け先に着く'], [3.0, '届ける']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'outdoor' });
  // 道
  el('rect', { x: 0, y: 252, width: 400, height: 48, fill: '#E4E9F0' });
  [10, 90, 170, 250, 330].forEach((x) => el('rect', { x, y: 284, width: 40, height: 5, rx: 2.5, fill: '#FFFFFF', opacity: 0.8 }));

  // 家（go-out と同じ画風。右へ寄せる）
  const house = g({ transform: 'translate(195 14)' });
  el('rect', { x: 20, y: 96, width: 170, height: 140, rx: 6, fill: '#FBE9DC' }, house);
  el('path', { d: 'M 8 104 L 105 40 L 202 104 Z', fill: pal.coral, 'stroke-linejoin': 'round', stroke: pal.coral, 'stroke-width': 8 }, house);
  el('rect', { x: 36, y: 128, width: 40, height: 36, rx: 5, fill: '#CFE9F7' }, house);
  el('line', { x1: 56, y1: 128, x2: 56, y2: 164, stroke: '#FFFFFF', 'stroke-width': 3 }, house);
  el('rect', { x: 96, y: 134, width: 62, height: 102, rx: 4, fill: pal.blue }, house);
  el('rect', { x: 104, y: 144, width: 46, height: 36, rx: 4, fill: '#FFFFFF', opacity: 0.25 }, house);
  el('circle', { cx: 148, cy: 190, r: 4, fill: pal.yellow }, house);
  el('rect', { x: 90, y: 230, width: 74, height: 8, rx: 3, fill: pal.woodDark }, house);
  el('rect', { x: 92, y: 130, width: 70, height: 6, rx: 3, fill: pal.coralDark }, house);

  // 配達員のまめ（帽子つき）と箱。バンの後ろにいて、止まると出てくる
  const MS = 0.7, MY = 254;
  const b = k.buddy({ x: 108, y: MY, scale: MS });
  // 帽子（体にくっつけて動く）
  const cap = g({}, b.body);
  el('path', { d: 'M -27 -66 Q -27 -98 0 -98 Q 27 -98 27 -66 Z', fill: pal.blueDark }, cap);
  el('rect', { x: 4, y: -73, width: 38, height: 8, rx: 4, fill: pal.blueDark }, cap);
  el('circle', { cx: 0, cy: -84, r: 6, fill: '#FFFFFF' }, cap);
  el('circle', { cx: 0, cy: -84, r: 3, fill: pal.yellow }, cap);
  // 箱
  const BW = 34, BH = 28;
  const pkg = g({});
  const pkgIn = g({}, pkg);
  el('rect', { x: -BW / 2, y: -BH, width: BW, height: BH, rx: 4, fill: '#E7B97E', stroke: '#C9985C', 'stroke-width': 2 }, pkgIn);
  el('rect', { x: -4, y: -BH, width: 8, height: BH, fill: '#F6DDB2' }, pkgIn);
  el('rect', { x: -BW / 2 + 4, y: -BH + 5, width: 9, height: 6, rx: 2, fill: '#FFFFFF', opacity: 0.8 }, pkgIn);
  const pkgSh = k.shadow(0, 0, 20, 4);

  // バン（右向き。原点＝地面の接地点の中央）
  const van = g({});
  const vanSh = k.shadow(0, 2, 80, 7, van);
  const bodyG = g({}, van);
  el('rect', { x: -66, y: -98, width: 140, height: 80, rx: 12, fill: '#FFFFFF', stroke: '#DCE2EB', 'stroke-width': 2 }, bodyG);
  el('rect', { x: -66, y: -52, width: 140, height: 8, fill: pal.blue }, bodyG);
  el('rect', { x: 38, y: -88, width: 30, height: 32, rx: 7, fill: '#CFE9F7' }, bodyG);
  el('path', { d: 'M 44 -62 L 56 -84', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round' }, bodyG);
  el('line', { x1: 26, y1: -92, x2: 26, y2: -22, stroke: '#DCE2EB', 'stroke-width': 2.5 }, bodyG);
  el('rect', { x: 29, y: -66, width: 5, height: 11, rx: 2.5, fill: '#B9C4D4' }, bodyG);
  el('rect', { x: 66, y: -40, width: 9, height: 8, rx: 4, fill: pal.yellow }, bodyG);
  el('rect', { x: -66, y: -24, width: 140, height: 7, rx: 3, fill: '#C9D0DA' }, bodyG);
  // 荷物のマーク（箱のアイコン）
  el('rect', { x: -48, y: -90, width: 30, height: 24, rx: 4, fill: '#E7B97E', stroke: '#C9985C', 'stroke-width': 2 }, bodyG);
  el('rect', { x: -36, y: -90, width: 6, height: 24, fill: '#F6DDB2' }, bodyG);
  el('line', { x1: -10, y1: -78, x2: 12, y2: -78, stroke: '#E4E9F0', 'stroke-width': 3, 'stroke-linecap': 'round' }, bodyG);
  el('line', { x1: -10, y1: -70, x2: 4, y2: -70, stroke: '#E4E9F0', 'stroke-width': 3, 'stroke-linecap': 'round' }, bodyG);
  const wheels = [-38, 46].map((wx) => {
    const w = g({}, van);
    tf(w, wx, -12);
    el('circle', { r: 13, fill: '#3A4356' }, w);
    const sp = g({}, w);
    el('circle', { r: 6, fill: '#C9D0DA' }, sp);
    el('line', { x1: -6, y1: 0, x2: 6, y2: 0, stroke: '#7A8597', 'stroke-width': 2.5 }, sp);
    el('line', { x1: 0, y1: -6, x2: 0, y2: 6, stroke: '#7A8597', 'stroke-width': 2.5 }, sp);
    return { w, sp, wx };
  });

  // チャイム（ベル）
  const bell = g({});
  const waves = [-1, 1].map((s) => el('path', { d: `M ${s * 17} -6 Q ${s * 22} 0 ${s * 17} 6 M ${s * 22} -11 Q ${s * 31} 0 ${s * 22} 11`, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3, 'stroke-linecap': 'round' }, bell));
  const bellBody = g({}, bell);
  el('path', { d: 'M -12 7 Q -12 -12 0 -12 Q 12 -12 12 7 L 15 10 L -15 10 Z', fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bellBody);
  el('circle', { cx: 0, cy: 14, r: 3.5, fill: pal.yellowDark }, bellBody);
  el('circle', { cx: 0, cy: -14, r: 2.8, fill: pal.yellowDark }, bellBody);

  const VX0 = -62, VX1 = 106;
  const FINAL_X = 284;
  // 手の位置（体の傾き・つぶれも考慮）
  const handW = (st) => {
    const a = (st.a * Math.PI) / 180, l = (st.lean * Math.PI) / 180;
    const hx = (27 + Math.sin(a) * 26) * (2 - st.sq), hy = (-46 + Math.cos(a) * 26) * st.sq;
    const px = hx * Math.cos(l) - hy * Math.sin(l), py = hx * Math.sin(l) + hy * Math.cos(l) - 10 - st.bob;
    return { x: st.x + px * MS, y: MY + py * MS };
  };
  const mame = (t) => {
    const wp = seg(t, 1.2, 2.6);
    const x = lerp(108, FINAL_X, lerp(wp, smooth(wp), 0.35));
    const walking = t > 1.2 && t < 2.62;
    const w = walking ? (t - 1.2) * 9 : 0;
    const bend = easeInOut(seg(t, 2.6, 2.95)) * (1 - easeInOut(seg(t, 3.15, 3.45)));
    const a = lerp(72, 28, bend);
    return { x, a, lean: 12 * bend, sq: 1 - 0.05 * bend, walking, w, bob: walking ? Math.abs(Math.sin(w)) * 3 : 0, bend };
  };

  return {
    update(t) {
      // ---- バンが走ってきて止まる ----
      const dpp = seg(t, 0, 1.2);
      const dp = 1 - (1 - dpp) * (1 - dpp);
      const vx = lerp(VX0, VX1, dp);
      const moving = t < 1.2;
      const bob = moving ? Math.sin(t * 22) * 1.2 * (1 - dp) : 0;
      const stopPitch = t >= 1.0 ? wobble(seg(t, 1.0, 1.6), 2, 5) * 1.6 : 0;
      tf(van, vx, 268);
      tf(bodyG, 0, bob - Math.abs(stopPitch) * 0.5, -stopPitch * 0.6);
      wheels.forEach((q) => {
        tf(q.w, q.wx, -12 + bob * 0.3);
        tf(q.sp, 0, 0, ((vx - VX0) / 13) * (180 / Math.PI));
      });

      // ---- まめ（箱を持って歩く→置く→手を振る） ----
      const m = mame(t);
      b.g.setAttribute('opacity', t < 1.2 ? 0 : 1);
      const released = t >= 3.05;
      const wave = t > 3.5 ? 125 + 18 * Math.sin((t - 3.5) * 11) : null;
      const raise = easeInOut(seg(t, 3.4, 3.7));
      b.pose({
        x: m.x,
        walk: m.walking ? m.w : 0,
        armR: released ? (wave === null ? lerp(28, 72, easeOut(seg(t, 3.1, 3.4))) : lerp(72, wave, raise)) : m.a,
        armL: m.walking ? 8 - Math.sin(m.w) * 10 : 8,
        lean: m.lean,
        squash: m.sq,
        look: 0.7,
        mood: t > 3.3 ? 'grin' : 'smile'
      });
      // ---- 箱 ----
      const hnd = handW({ ...m, a: released ? 28 : m.a });
      let px = hnd.x + 5, py = hnd.y - 17;
      let sx = 1, sy = 1;
      if (released) {
        const h0 = handW({ ...mame(3.05), a: 28 });
        const fall = seg(t, 3.05, 3.28);
        const gx = lerp(h0.x + 5, FINAL_X + 29, easeOut(seg(t, 3.05, 3.4)));
        px = gx;
        py = lerp(h0.y - 17, MY - BH / 2 - 0, easeIn(fall));
        const bounce = t > 3.28 ? wobble(seg(t, 3.28, 3.8), 2.5, 6) : 0;
        sx = 1 + 0.08 * bounce;
        sy = 1 - 0.12 * bounce;
        tf(pkg, px, py + BH / 2);
        tf(pkgSh, px, MY + 1, 0, 1, 1);
        pkgSh.setAttribute('opacity', 1);
      } else {
        tf(pkg, px, py + BH / 2);
        tf(pkgSh, px, MY + 1, 0, 0.8, 1);
        pkgSh.setAttribute('opacity', 0);
      }
      tf(pkgIn, 0, 0, 0, sx, sy);
      pkg.setAttribute('opacity', t < 1.2 ? 0 : 1);
      // 箱は体の前に、ただしバンの後ろ（バンは後から描いているので順序はそのまま）

      // ---- チャイム ----
      const bp = seg(t, 3.2, 3.5);
      const bs = bp <= 0 ? 0 : backOut(bp, 2.2) * 0.95;
      tf(bell, 322, 134, 0, bs, bs);
      const sw = 16 * wobble(seg(t, 3.35, 4.4), 3, 2.2);
      tf(bellBody, 0, -12, sw);
      const ring = t > 3.4 ? 0.5 + 0.5 * Math.sin((t - 3.4) * 18) : 0;
      waves.forEach((w) => w.setAttribute('opacity', t > 3.4 ? 0.35 + 0.65 * ring : 0));
    }
  };
}
