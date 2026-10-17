// break down：走っていた車がガタンと揺れて煙を出し、止まって動かなくなる（例文 Our car broke down on the way home.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

const R = 4.6 / 4.4; // 内部の時間割は 4.6 秒分。表示は 4.4 秒に収める
export const meta = { duration: 4.4, beats: [[0, '走っている'], [1.5, '故障する'], [2.9, '動かない']].map(([a, n]) => [+(a / R).toFixed(2), n]) };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 190, mood: 'outdoor' });
  const GY = 262; // 車の接地線
  // 遠景（ゆっくり流れる）
  const far = g({});
  for (let i = 0; i < 6; i++) {
    el('ellipse', { cx: i * 120, cy: 188, rx: 70, ry: 26 + (i % 2) * 8, fill: i % 2 ? '#D6EFE0' : '#DDF2E5' }, far);
  }
  const mid = g({});
  for (let i = 0; i < 8; i++) {
    const t = g({ transform: `translate(${i * 90} 202)` }, mid);
    el('rect', { x: -3, y: -22, width: 6, height: 24, rx: 3, fill: pal.woodDark }, t);
    el('circle', { cx: 0, cy: -34, r: 16 + (i % 3) * 3, fill: i % 2 ? pal.green : '#7ADBA0' }, t);
  }
  // 道路
  el('rect', { x: 0, y: 214, width: 400, height: 90, fill: '#C9D1DC' });
  el('rect', { x: 0, y: 214, width: 400, height: 5, fill: '#B3BCC9' });
  const dashes = [];
  for (let i = 0; i < 9; i++) dashes.push(el('rect', { x: 0, y: 270, width: 44, height: 7, rx: 3.5, fill: '#FFFFFF' }));
  k.shadow(0, 0, 1, 1).remove();

  // 車（原点＝前後輪の中央、接地線 y=0、右向き）
  const car = g({});
  const sh = k.shadow(0, 0, 84, 7, car);
  const beam = el('path', { d: 'M 76 -30 L 170 -52 L 170 -8 Z', fill: pal.yellow, opacity: 0.22 }, car);
  const body = g({}, car);
  const cab = g({}, body);
  el('path', { d: 'M -48 -40 L -34 -76 Q -32 -80 -26 -80 L 16 -80 Q 22 -80 25 -75 L 44 -40 Z', fill: pal.blueDark }, cab);
  el('path', { d: 'M -40 -44 L -30 -72 L 14 -72 L 34 -44 Z', fill: '#DDEFFB' }, cab);
  const clipId = k.clip((cp) => el('path', { d: 'M -40 -44 L -30 -72 L 14 -72 L 34 -44 Z' }, cp));
  const drv = g({ 'clip-path': clipId }, cab);
  const b = k.buddy({ x: -6, y: -26, scale: 0.55, parent: drv, color: pal.coral, dark: pal.coralDark });
  b.g.firstChild.setAttribute('display', 'none');
  el('rect', { x: -80, y: -44, width: 160, height: 36, rx: 14, fill: pal.blue }, body);
  el('rect', { x: -80, y: -18, width: 160, height: 10, rx: 5, fill: pal.blueDark, opacity: 0.45 }, body);
  el('rect', { x: -72, y: -36, width: 22, height: 5, rx: 2.5, fill: '#FFFFFF', opacity: 0.35 }, body);
  const hood = g({}, body);
  el('path', { d: 'M 0 0 L 36 0 Q 40 0 40 -4 L 40 -7 L 0 -7 Z', fill: pal.blueDark }, hood);
  const head = el('circle', { cx: 74, cy: -30, r: 5, fill: pal.yellow, stroke: '#FFFFFF', 'stroke-width': 1.5 }, body);
  el('rect', { x: -80, y: -32, width: 6, height: 10, rx: 3, fill: pal.red }, body);
  // 車輪
  const wheels = [-46, 44].map((x) => {
    const w = g({}, car);
    const sp = g({}, w);
    el('circle', { cx: 0, cy: 0, r: 17, fill: pal.ink }, sp);
    el('circle', { cx: 0, cy: 0, r: 9, fill: '#DDE3EA' }, sp);
    [0, 60, 120].forEach((a) => el('line', { x1: -8, y1: 0, x2: 8, y2: 0, stroke: '#9AA6B8', 'stroke-width': 2.5, transform: `rotate(${a})` }, sp));
    el('circle', { cx: 0, cy: 0, r: 3, fill: '#9AA6B8' }, sp);
    return { w, sp, x };
  });
  // ガタン線
  const jolts = g({});
  [[-20, -10, -8], [0, -14, 0], [20, -10, 8]].forEach(([x, y, r]) => el('line', { x1: x, y1: y, x2: x + r * 0.5, y2: y - 14, stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }, jolts));
  // 煙
  const smoke = [0, 1, 2, 3, 4].map(() => el('circle', { cx: 0, cy: 0, r: 10, fill: '#8F99AA' }));
  // 三角表示板
  const tri = g({});
  k.shadow(0, 14, 34, 5, tri);
  el('path', { d: 'M 0 -36 L 32 16 L -32 16 Z', fill: pal.red, 'stroke-linejoin': 'round', stroke: pal.red, 'stroke-width': 6 }, tri);
  el('path', { d: 'M 0 -22 L 19 8 L -19 8 Z', fill: '#FFFFFF' }, tri);
  k.text(0, -2, '!', { 'font-size': 20, fill: pal.red }, tri);

  // 速度：走行 → ガクガクしながら止まる（t だけから距離を積分）
  const vel = (t) => (t < 1.5 ? 250 : t < 2.5 ? 250 * Math.pow(1 - (t - 1.5), 1.6) * (0.55 + 0.45 * Math.abs(Math.sin(t * 22))) : 0);
  const dist = (t) => { let d = 0; const n = Math.ceil(t * 120); for (let i = 0; i < n; i++) d += vel(i / 120) / 120; return d; };

  return {
    update(tt) {
      const t = tt * R;
      const D = dist(t);
      const mod = (v, m) => ((v % m) + m) % m;
      far.setAttribute('transform', `translate(${-mod(D * 0.15, 120) - 0} 0)`);
      mid.setAttribute('transform', `translate(${-mod(D * 0.45, 90) - 90} 0)`);
      dashes.forEach((d, i) => d.setAttribute('x', mod(i * 70 - D, 630) - 80));
      // 車の揺れ：1.5s にガタン
      const jolt = t > 1.5 ? Math.exp(-(t - 1.5) * 3) * 1 : 0;
      const run = t < 1.5 ? 1 : 0;
      const shake = t >= 1.5 && t < 3.0 ? Math.sin(t * 60) * 3 * Math.exp(-(t - 1.5) * 2.2) : 0;
      const bob = (run ? Math.sin(t * 20) * 1.1 : 0) - jolt * 4 * (t < 1.7 ? 1 : 0.5) * Math.abs(Math.sin(Math.min(t - 1.5, 0.25) * 12));
      const tilt = (t >= 1.5 ? 3.4 * easeOut(seg(t, 1.5, 1.62)) * (1 - easeInOut(seg(t, 2.4, 3.2)) * 0.6) : 0) + shake * 0.4;
      tf(car, 190 + shake, GY, 0, 1, 1);
      tf(body, 0, bob, tilt * 0.6);
      tf(hood, 40, -40, -16 * easeOut(seg(t, 1.55, 1.8)) + shake * 0.8);
      sh.setAttribute('opacity', 1);
      // 車輪
      const rot = (D / 17) * (180 / Math.PI);
      wheels.forEach(({ w, sp, x }) => { tf(w, x, -17 + bob * 0.3); tf(sp, 0, 0, rot); });
      head.setAttribute('fill', t < 1.55 ? pal.yellow : '#CFD6E0');
      beam.setAttribute('opacity', t < 1.5 ? 0.24 : 0);
      tf(jolts, 190 + 6, GY - 92);
      jolts.setAttribute('opacity', t > 1.5 && t < 1.95 && Math.sin(t * 40) > -0.2 ? 1 : 0);
      // ドライバー
      b.pose({ x: -6, y: -26, mood: t < 1.55 ? 'smile' : 'open', look: t < 1.55 ? 0.7 : 0, lean: shake * 0.5 });
      // 煙：ボンネットのすき間から
      smoke.forEach((s, i) => {
        const p0 = (t - 1.55 - i * 0.42) / 1.9;
        const p = p0 - Math.floor(p0);
        const on = t > 1.55 + i * 0.42 - 0.0;
        const burst = i === 0 && t < 2.1 ? 1.25 : 1;
        const x = 190 + 62 + (i - 2) * 3 - p * 34 + Math.sin(p * 6 + i) * 6;
        const y = GY - 50 - p * 92;
        tf(s, x, y, 0, (0.55 + p * 1.9) * burst, (0.55 + p * 1.9) * burst);
        s.setAttribute('opacity', on ? 0.82 * (1 - p * p) : 0);
        s.setAttribute('fill', i % 2 ? '#8F99AA' : '#A7B0BF');
      });
      // 三角表示板
      const tp = backOut(seg(t, 3.0, 3.5), 1.7);
      tf(tri, 82, GY - 2, 0, Math.max(0.001, tp), Math.max(0.001, tp));
    }
  };
}
