// destroy：嵐が来て雷が鳴り、並んだ家々が次々に屋根を飛ばされ壁が崩れ、がれきになる（例文 The storm destroyed many houses.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '家が並ぶ'], [1.4, '嵐が壊す'], [3.8, 'がれき']] };

const rnd = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'outdoor' });
  const sky = el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#46505F', opacity: 0 });
  el('rect', { x: 0, y: FY, width: 400, height: 60, fill: pal.floor });
  const HS = [{ x: 28, c: '#F6E2C6', r: pal.coralDark }, { x: 120, c: '#E3EEF8', r: pal.blueDark }, { x: 212, c: '#F3E6DC', r: '#8670D6' }, { x: 304, c: '#E6F1E8', r: '#4FA774' }];
  const W = 68, H = 50;
  const houses = HS.map((h, i) => {
    const root = g({}); tf(root, h.x, FY);
    const whole = g({}, root);
    k.shadow(W / 2, 0, 38, 5, root);
    const wall = g({}, whole);
    el('rect', { x: 0, y: -H, width: W, height: H, fill: h.c }, wall);
    el('rect', { x: 10, y: -H + 12, width: 16, height: 16, rx: 2, fill: '#CFE9F7', stroke: '#fff', 'stroke-width': 2 }, wall);
    el('rect', { x: 40, y: -34, width: 18, height: 34, rx: 2, fill: '#8A6A47' }, wall);
    const roof = g({}, root); tf(roof, W / 2, -H);
    el('path', { d: `M ${-W / 2 - 6} 0 L 0 -30 L ${W / 2 + 6} 0 Z`, fill: h.r }, roof);
    // 崩れた壁の残り
    const ruin = g({}, root);
    el('path', { d: `M 0 0 L 0 -14 L 10 -8 L 18 -17 L 30 -6 L 44 -12 L 52 -4 L ${W} -9 L ${W} 0 Z`, fill: h.c }, ruin);
    el('path', { d: `M 4 0 L 4 -8 L 16 -4 L 30 -9 L 50 -3 L 60 0 Z`, fill: '#000', opacity: 0.08 }, ruin);
    const deb = Array.from({ length: 6 }, (_, j) => el('rect', { x: -4, y: -4, width: 8 + rnd(j, i) * 6, height: 6 + rnd(j, i + 9) * 5, rx: 1.5, fill: j % 2 ? h.c : h.r }, root));
    const dust = el('circle', { cx: W / 2, cy: -14, r: 14, fill: '#B9B2A8', opacity: 0 }, root);
    return { h, root, whole, wall, roof, ruin, deb, dust, T: 1.0 + i * 0.55 };
  });
  // 嵐
  const cloud = g({});
  [[-50, 4, 34], [-14, -8, 40], [26, 0, 36], [58, 8, 28]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#59647A' }, cloud));
  const bolt = el('path', { d: 'M 0 0 L -12 30 L 0 30 L -10 62 L 16 22 L 4 22 L 12 0 Z', fill: pal.yellow, opacity: 0 });
  const rain = Array.from({ length: 36 }, (_, i) => el('line', { stroke: '#BFD3E8', 'stroke-width': 1.6, 'stroke-linecap': 'round', opacity: 0 }));
  const flash = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#fff', opacity: 0 });
  return {
    update(t) {
      const storm = easeInOut(seg(t, 0, 1.0)), clear = seg(t, 4.0, 4.6);
      k.set(sky, { opacity: 0.85 * storm * (1 - 0.25 * clear) });
      tf(cloud, lerp(40, 340, easeInOut(seg(t, 0, 3.8))) , 52 - 4 * storm, 0, 1.25);
      const cx = lerp(40, 340, easeInOut(seg(t, 0, 3.8)));
      rain.forEach((r, i) => {
        const x = ((i * 53 + t * 140) % 440) - 20, y = ((i * 37 + t * 420 + rnd(i, 3) * 200) % 260) + 20;
        k.set(r, { x1: x, y1: y, x2: x - 8, y2: y + 18, opacity: 0.7 * storm * (1 - clear) });
      });
      houses.forEach((o, i) => {
        const p = t - o.T, hit = seg(t, o.T, o.T + 0.2);
        const shake = p > -0.5 && p < 0.35 ? Math.sin(t * 60) * 2 * (1 - Math.abs(p) * 2) : 0;
        tf(o.whole, shake, 0);
        const done = p > 0.35;
        // 屋根：風に持っていかれる
        const rp = seg(p, 0.2, 1.2), dir = i < 2 ? 1 : -1;
        const dx = (48 + 14 * rnd(i, 1)) * easeOut(rp) * dir;
        const dy = -80 * hump(rp) + (H - 8) * easeIn(rp);
        const rot = (rnd(i, 2) - 0.5) * 40 + 300 * dir * (1 - easeOut(rp)) * (rp > 0 ? 1 : 0);
        tf(o.roof, W / 2 + (done ? dx : 0), -H + (done ? dy : 0), done ? rot : 0);
        o.roof.setAttribute('opacity', 1);
        o.whole.setAttribute('display', done ? 'none' : 'inline');
        o.roof.setAttribute('display', p > -9 ? 'inline' : 'none');
        if (!done) tf(o.roof, W / 2 + shake, -H);
        o.ruin.setAttribute('display', done ? 'inline' : 'none');
        // がれき：飛び散って落ち、はずむ
        o.deb.forEach((d, j) => {
          const q = seg(p, 0.3, 1.0), vx = (rnd(j, i) - 0.5) * 110, vy = -60 - rnd(j, i + 5) * 60;
          const x = W / 2 + vx * q, y = -26 + vy * q * (1 - q * 0.0) + 190 * q * q;
          const gy = -3 - (j % 3) * 2;
          const yy = Math.min(y, gy) + (q >= 1 ? 0 : 0);
          tf(d, x, done ? Math.min(y, gy) : -9999, q * 300, 1);
        });
        k.set(o.dust, { opacity: 0.5 * hump(seg(p, 0.35, 1.3)), r: 14 + 22 * seg(p, 0.35, 1.3) });
      });
      // 雷：家のひとつが壊れる瞬間
      const fl = Math.max(0, 1 - Math.abs(t - 1.05) * 9) + Math.max(0, 1 - Math.abs(t - 2.15) * 9);
      k.set(flash, { opacity: 0.35 * fl });
      const bt = [1.0, 2.1].map((a) => seg(t, a, a + 0.25) * (1 - seg(t, a + 0.25, a + 0.4)));
      k.set(bolt, { opacity: Math.max(...bt), transform: `translate(${bt[0] > 0 ? 60 : 210} 78)` });
    }
  };
}
