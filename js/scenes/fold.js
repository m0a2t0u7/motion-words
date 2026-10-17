// fold：1枚の紙の右端を手で持ち上げ、中央で折って左半分に重ね、折り目を押さえる（例文 Fold the paper in half.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '広げた紙'], [1.1, '折る'], [3.0, '半分になる']] };

export function create(k) {
  const { el, g, pal } = k;
  // 机の上（真上から見た面）
  el('rect', { x: 0, y: 0, width: 400, height: 300, fill: k.gradient([[0, '#F3E5CD'], [1, '#EBD8BA']]) });
  [60, 120, 180, 240].forEach((y) => el('line', { x1: 0, y1: y, x2: 400, y2: y, stroke: '#E2CDAA', 'stroke-width': 2, opacity: 0.7 }));
  const pen = g({ transform: 'translate(40 270) rotate(-8)' });
  el('rect', { x: 0, y: -5, width: 80, height: 10, rx: 4, fill: pal.yellow }, pen);
  el('path', { d: 'M 80 -5 L 98 0 L 80 5 Z', fill: '#F4D9B5' }, pen);
  el('path', { d: 'M 92 -1.5 L 98 0 L 92 1.5 Z', fill: pal.ink }, pen);
  el('rect', { x: 0, y: -5, width: 12, height: 10, rx: 4, fill: pal.coral }, pen);

  const CX = 200, CY = 140, HW = 110, HH = 90;
  const R = 6;
  // 紙の影（左半分。右半分の影は動く）
  el('rect', { x: CX - HW + 3, y: CY - HH + 6, width: HW, height: HH * 2, rx: 6, fill: pal.shadow });

  // 中身：折り線をまたぐ1枚分の線（x は中央からの距離。負＝左半分）
  const marks = [
    { x0: -92, x1: 62, y: -66, w: 12, c: pal.blue },
    { x0: -92, x1: 92, y: -38, w: 5, c: '#C8D2E0' },
    { x0: -92, x1: 70, y: -22, w: 5, c: '#C8D2E0' },
    { x0: -92, x1: 92, y: -6, w: 5, c: '#C8D2E0' },
    { x0: -92, x1: 30, y: 10, w: 5, c: '#C8D2E0' },
    { x0: -92, x1: 76, y: 74, w: 5, c: '#C8D2E0' }
  ];

  // ---- 左半分（動かない）：塗り＋3辺だけの縁（中央に縁を引かない） ----
  const left = g({});
  const lp = `M ${CX} ${CY - HH} L ${CX - HW + R} ${CY - HH} Q ${CX - HW} ${CY - HH} ${CX - HW} ${CY - HH + R} L ${CX - HW} ${CY + HH - R} Q ${CX - HW} ${CY + HH} ${CX - HW + R} ${CY + HH} L ${CX} ${CY + HH}`;
  el('path', { d: lp + ' Z', fill: '#FFFFFF' }, left);
  el('path', { d: lp, fill: 'none', stroke: '#D5DBE5', 'stroke-width': 2, 'stroke-linejoin': 'round' }, left);
  marks.forEach((m) => {
    const xa = CX + m.x0, xb = CX + Math.min(m.x1, 0), y = CY + m.y;
    el('line', { x1: xa, y1: y, x2: xb, y2: y, stroke: m.c, 'stroke-width': m.w }, left);
    el('circle', { cx: xa, cy: y, r: m.w / 2, fill: m.c }, left);
  });
  el('circle', { cx: CX - 52, cy: CY + 42, r: 15, fill: pal.mint }, left);

  // ---- 右半分（中央を軸に反転する） ----
  const rShadow = el('path', { d: '', fill: 'rgba(40,52,70,0.13)' });
  const rFill = el('path', { d: '', fill: '#FFFFFF' });
  const rEdge = el('path', { d: '', fill: 'none', stroke: '#D5DBE5', 'stroke-width': 2, 'stroke-linejoin': 'round' });
  const rLines = marks.map((m) => el('line', { stroke: m.c, 'stroke-width': m.w }));
  const rCaps = marks.map((m) => el('circle', { r: m.w / 2, fill: m.c }));
  const rDot = el('rect', { fill: pal.coral, rx: 4 });
  // 折ったあとにはじめて現れる折り目
  const band = el('rect', { x: CX - 9, y: CY - HH + 2, width: 9, height: HH * 2 - 4, fill: '#D3D9E6', opacity: 0 });
  const crease = el('line', { x1: CX, y1: CY - HH + 3, x2: CX, y2: CY + HH - 3, stroke: '#7F8CA3', 'stroke-width': 4, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 });

  // ---- 手（画面の下から伸びる） ----
  const arm = el('line', { stroke: pal.mintDark, 'stroke-width': 15, 'stroke-linecap': 'round' });
  const hand = el('circle', { r: 11, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 3 });

  const ANCH = [350, 345];
  const mix = (p, q, s) => [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s];
  const dist = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;

  return {
    update(t) {
      const p = easeInOut(seg(t, 1.1, 2.5));
      const sx = Math.cos(Math.PI * p);
      const d = 0.16 * hump(p);
      const front = sx > 0;
      const mp = (u, y) => [CX + u * sx, CY + y * (1 + d * (u / HW))];
      const pts = [mp(0, -HH), mp(HW, -HH), mp(HW, HH), mp(0, HH)];
      const [a, b, c, e] = pts;
      const f = (q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
      const b1 = mix(b, a, Math.min(0.5, R / dist(a, b))), b2 = mix(b, c, Math.min(0.5, R / dist(b, c)));
      const c1 = mix(c, b, Math.min(0.5, R / dist(b, c))), c2 = mix(c, e, Math.min(0.5, R / dist(c, e)));
      const open = `M ${f(a)} L ${f(b1)} Q ${f(b)} ${f(b2)} L ${f(c1)} Q ${f(c)} ${f(c2)} L ${f(e)}`;
      k.set(rFill, { d: open + ' Z', fill: front ? '#FFFFFF' : '#E6E9F1' });
      k.set(rEdge, { d: open });
      // 影：持ち上がるほど離れる
      const lift = hump(p);
      const o = 5 + 12 * lift;
      k.set(rShadow, { d: 'M ' + pts.map(([x, y]) => `${(x + o * 0.6).toFixed(1)} ${(y + o).toFixed(1)}`).join(' L ') + ' Z' });
      marks.forEach((m, i) => {
        const ua = Math.max(m.x0, 0), ub = m.x1;
        if (ub <= 0) { rLines[i].setAttribute('opacity', 0); rCaps[i].setAttribute('opacity', 0); return; }
        const [x1, y1] = mp(ua, m.y), [x2, y2] = mp(ub, m.y);
        k.set(rLines[i], { x1, y1, x2, y2, opacity: front ? 1 : 0 });
        k.set(rCaps[i], { cx: x2, cy: y2, opacity: front ? 1 : 0 });
      });
      const [dx, dy] = mp(40, 42), [dx2, dy2] = mp(88, 42);
      k.set(rDot, { x: Math.min(dx, dx2), y: dy - 15, width: Math.abs(dx2 - dx), height: 30, opacity: front ? 1 : 0 });

      // 折り目：折り終わってから、押さえる手に合わせて上から線が引かれる
      const press = seg(t, 2.9, 3.5);
      k.set(band, { opacity: seg(t, 2.9, 3.5) });
      k.set(crease, { 'stroke-dashoffset': 1 - press, opacity: seg(t, 2.85, 2.95) });

      // ---- 手：右端をつかむ → 持ち上げて折る → 折り目を押さえる → 去る ----
      const enter = easeOut(seg(t, 0.2, 1.0));
      const grab = mp(HW, 24);
      const toPress = easeInOut(seg(t, 2.55, 2.95));
      const slide = easeInOut(seg(t, 2.95, 3.5));
      const leave = easeInOut(seg(t, 3.55, 4.15));
      let hx, hy;
      if (t < 1.1) {
        hx = lerp(430, CX + HW - 4, enter);
        hy = lerp(335, CY + 24, enter);
      } else if (t < 2.55) {
        hx = grab[0] - 4 * sx;
        hy = grab[1] - 14 * lift;
      } else {
        // 折り終えた端（左端）から折り目の上へ → 折り目に沿って下へ押さえる
        const endP = [CX - HW + 4, CY + 24];
        const top = [CX + 10, CY - 56];
        const bot = [CX + 10, CY + 64];
        const h1 = mix(endP, top, toPress);
        const h2 = mix(h1, bot, slide);
        hx = h2[0];
        hy = h2[1];
        if (t >= 3.55) {
          hx = lerp(hx, 430, leave);
          hy = lerp(hy, 335, leave);
        }
      }
      k.set(hand, { cx: hx, cy: hy });
      k.set(arm, { x1: ANCH[0], y1: ANCH[1], x2: hx, y2: hy });
    }
  };
}
