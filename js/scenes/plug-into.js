// plug into：ヘッドホンのプラグをスマホの差込口へ差し込むと、音楽が流れ出す（例文 She plugged the headphones into the phone.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, 'プラグを手に'], [1.5, '差込口へ近づける'], [3.0, '音楽が流れる']] };

const ctm = (n, x, y) => {
  const m = n.getCTM && n.getCTM();
  return m ? { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f } : { x: 0, y: 0 };
};

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 40, y: 48, width: 80, height: 58, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 80, y1: 48, x2: 80, y2: 106, stroke: '#fff', 'stroke-width': 4 });
  // 机とスマホ
  el('rect', { x: 272, y: 210, width: 128, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: 282, y: 219, width: 8, height: 17, fill: pal.woodDark });
  k.shadow(336, 237, 66, 5);
  const phone = g({});
  el('rect', { x: 302, y: 126, width: 46, height: 84, rx: 9, fill: '#3C4558' }, phone);
  const screen = el('rect', { x: 306, y: 134, width: 38, height: 68, rx: 5, fill: '#59647A' }, phone);
  const on = g({}, phone);
  el('rect', { x: 306, y: 134, width: 38, height: 68, rx: 5, fill: pal.violet }, on);
  el('circle', { cx: 325, cy: 156, r: 11, fill: '#fff', opacity: 0.9 }, on);
  el('path', { d: 'M 322 151 L 322 161 M 322 151 L 329 153 L 329 163', stroke: pal.violet, 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }, on);
  const bars = [0, 1, 2, 3, 4].map((i) => el('rect', { x: 312 + i * 6.5, y: 190, width: 4, height: 8, rx: 2, fill: '#fff' }, on));
  el('rect', { x: 299, y: 170, width: 4, height: 9, rx: 1.5, fill: '#1E2533' }, phone);
  const jack = { x: 300, y: 174.5 };
  const b = k.buddy({ x: 225, y: FY, scale: 0.85, color: pal.coral, dark: pal.coralDark });
  // ヘッドホン（体のグループに付ける）
  const hp = g({}, b.body);
  el('path', { d: 'M -30 -58 Q -30 -96 0 -96 Q 30 -96 30 -58', fill: 'none', stroke: '#4A5266', 'stroke-width': 5, 'stroke-linecap': 'round' }, hp);
  [-1, 1].forEach((s) => { el('rect', { x: s > 0 ? 28 : -38, y: -68, width: 10, height: 24, rx: 5, fill: pal.violet, stroke: '#4A5266', 'stroke-width': 2 }, hp); });
  const mark = el('circle', { cx: 35, cy: -52, r: 0.1, fill: 'none' }, hp);
  const cord = el('path', { d: 'M 0 0', fill: 'none', stroke: '#4A5266', 'stroke-width': 2.6, 'stroke-linecap': 'round' });
  const plug = g({});
  el('rect', { x: 8, y: -2.2, width: 12, height: 4.4, rx: 1.5, fill: '#C5CDD9' }, plug);
  el('rect', { x: -9, y: -5, width: 18, height: 10, rx: 3, fill: '#4A5266' }, plug);
  const spark = g({});
  [-1, 0, 1].forEach((d) => el('line', { x1: -4, y1: d * 6, x2: -12, y2: d * 11, stroke: pal.yellow, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, spark));
  const note = () => { const n = g({}); el('ellipse', { cx: 0, cy: 0, rx: 4.5, ry: 3.4, fill: pal.violet, transform: 'rotate(-20)' }, n); el('line', { x1: 3.8, y1: -1, x2: 3.8, y2: -13, stroke: pal.violet, 'stroke-width': 2 }, n); el('path', { d: 'M 3.8 -13 Q 10 -10 8 -5', fill: 'none', stroke: pal.violet, 'stroke-width': 2 }, n); return n; };
  const notes = [note(), note(), note()];

  function poseAt(t) {
    const raise = easeInOut(seg(t, 0.9, 1.6));
    const step = easeInOut(seg(t, 2.0, 2.3));
    const back = easeInOut(seg(t, 2.8, 3.4));
    const arm = lerp(lerp(70, 125, raise), 14, back) + (t > 1.6 && t < 2.0 ? 3 * Math.sin((t - 1.6) * 28) : 0);
    return { x: lerp(225, 241, step), armR: arm, armL: 8, lean: 0, squash: 1 + (t > 2.4 ? 0.012 * Math.sin(t * 7) : 0), blink: t > 2.4 ? 0.85 : 0, mood: t > 2.3 ? 'grin' : 'smile', look: 0.5 };
  }

  return {
    update(t) {
      b.pose(poseAt(2.7));
      const hf = { ...ctm(b.armR.hand, 0, 26) };
      b.pose(poseAt(t));
      const h = ctm(b.armR.hand, 0, 26);
      const px = t < 2.7 ? h.x - 2 : hf.x - 2, py = t < 2.7 ? h.y : hf.y;
      tf(plug, px, py);
      const cup = ctm(mark, 0, 0);
      const dx = (cup.x + px - 9) / 2;
      cord.setAttribute('d', `M ${cup.x} ${cup.y} Q ${dx} ${Math.max(cup.y, py) + 38} ${px - 9} ${py}`);
      // 接続の火花と画面の点灯
      const sp = seg(t, 2.25, 2.6);
      tf(spark, jack.x, jack.y, 0, 0.5 + hump(sp));
      spark.setAttribute('opacity', sp > 0 && sp < 1 ? 1 : 0);
      const onp = easeOut(seg(t, 2.3, 2.7));
      on.setAttribute('opacity', onp);
      bars.forEach((r, i) => { const hh = 6 + 12 * Math.abs(Math.sin(t * 7 + i * 1.3)); r.setAttribute('height', hh); r.setAttribute('y', 198 - hh); });
      notes.forEach((n, i) => {
        const u = (t * 0.8 + i / 3) % 1;
        const sx = i === 1 ? 255 : 230 + i * 14;
        tf(n, sx + Math.sin(u * 6 + i) * 5, 150 - 40 * u, 0, 0.9);
        n.setAttribute('opacity', t > 2.5 ? hump(u) : 0);
      });
    }
  };
}
