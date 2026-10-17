// submit：報告書を提出箱の差し込み口へ差し出し、収まって✓（例文 Please submit the report by Monday.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, clamp } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, '報告書'], [0.9, '差し出す'], [2.9, '提出完了']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });
  // 壁のカレンダー（締め切り MON）
  const cal = g({});
  tf(cal, 56, 34);
  el('rect', { x: 3, y: 4, width: 74, height: 78, rx: 8, fill: pal.shadow }, cal);
  el('rect', { width: 74, height: 78, rx: 8, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 }, cal);
  el('path', { d: 'M 0 22 L 0 8 Q 0 0 8 0 L 66 0 Q 74 0 74 8 L 74 22 Z', fill: pal.red }, cal);
  [18, 56].forEach((x) => el('circle', { cx: x, cy: 0, r: 4, fill: '#FFFFFF', stroke: '#C9D0DA', 'stroke-width': 2 }, cal));
  k.text(37, 11.5, 'DEADLINE', { 'font-size': 9, fill: '#FFFFFF' }, cal);
  k.text(37, 46, 'MON', { 'font-size': 24, fill: pal.red }, cal);
  [0, 1, 2, 3, 4].forEach((i) => el('rect', { x: 10 + i * 12.5, y: 64, width: 9, height: 5, rx: 2, fill: i === 0 ? pal.red : '#E1E6EE' }, cal));

  // 提出箱
  const BXL = 282, BXR = 366, BTOP = 178, SLOT_X = 324;
  const box = g({});
  k.shadow(324, FY + 3, 54, 6);
  el('rect', { x: BXL, y: BTOP, width: BXR - BXL, height: FY - BTOP, rx: 10, fill: pal.violet }, box);
  el('rect', { x: BXL, y: BTOP, width: BXR - BXL, height: 16, rx: 8, fill: '#C3B2F7' }, box);
  el('rect', { x: SLOT_X - 30, y: BTOP + 3, width: 60, height: 7, rx: 3.5, fill: '#5B49A8' }, box);
  el('rect', { x: BXL + 8, y: BTOP + 28, width: 6, height: 28, rx: 3, fill: '#FFFFFF', opacity: 0.3 }, box);
  // 箱の目印（下向きの矢印と受け皿）
  const icon = g({}, box);
  el('path', { d: `M ${SLOT_X} 202 L ${SLOT_X} 220 M ${SLOT_X - 8} 213 L ${SLOT_X} 221 L ${SLOT_X + 8} 213`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, icon);
  el('path', { d: `M ${SLOT_X - 15} 224 L ${SLOT_X - 15} 230 L ${SLOT_X + 15} 230 L ${SLOT_X + 15} 224`, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, icon);
  const check = g({});
  el('circle', { r: 21, fill: pal.green, stroke: '#FFFFFF', 'stroke-width': 4 }, check);
  el('path', { d: 'M -10 1 L -3 8 L 11 -8', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, check);

  // 報告書（箱の中に入った部分は見えない）
  const clipId = k.clip((cp) => {
    el('rect', { x: 0, y: 0, width: 400, height: BTOP + 4 }, cp);
    el('rect', { x: 0, y: BTOP + 4, width: BXL, height: 120 }, cp);
    el('rect', { x: BXR, y: BTOP + 4, width: 400 - BXR, height: 120 }, cp);
  });
  const repClip = g({ 'clip-path': clipId });
  const rep = g({}, repClip);
  const RW = 56, RH = 74;
  el('rect', { x: -RW / 2 + 3, y: -RH / 2 + 4, width: RW, height: RH, rx: 5, fill: pal.shadow }, rep);
  el('rect', { x: -RW / 2, y: -RH / 2, width: RW, height: RH, rx: 5, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2 }, rep);
  el('rect', { x: -RW / 2 + 8, y: -RH / 2 + 9, width: 30, height: 9, rx: 4, fill: pal.blue }, rep);
  [0, 1, 2, 3, 4].forEach((i) => el('line', { x1: -RW / 2 + 8, y1: -RH / 2 + 28 + i * 9, x2: RW / 2 - 8 - (i % 2) * 10, y2: -RH / 2 + 28 + i * 9, stroke: '#C8D2E0', 'stroke-width': 3, 'stroke-linecap': 'round' }, rep));
  const tag = g({ transform: `translate(${RW / 2 - 5} ${-RH / 2 + 8}) rotate(8)` }, rep);
  el('rect', { x: -15, y: -8, width: 30, height: 15, rx: 4, fill: pal.red }, tag);
  k.text(0, 0, 'MON', { 'font-size': 10, fill: '#FFFFFF' }, tag);

  const S = 1.1;
  const b = k.buddy({ x: 100, y: FY, scale: S });
  const sparks = [[300, 150], [352, 156], [330, 128]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  // 時刻 t のまめの状態（腕の角度から手の位置を出す）
  const state = (t) => {
    const walkP = easeInOut(seg(t, 0.7, 1.95));
    const x = lerp(100, 232, walkP);
    const walking = t > 0.7 && t < 1.95;
    const up = easeOut(seg(t, 1.95, 2.45));
    const push = easeInOut(seg(t, 2.55, 2.95));
    const sw = walking ? Math.sin((t - 0.7) * 9) * 5 : 0;
    const a = lerp(lerp(100 + sw, 150, up), 108, push);
    const w = walking ? (t - 0.7) * 9 : 0;
    return { x, a, walking, w, up };
  };
  const handOf = (st) => {
    const ang = (st.a * Math.PI) / 180;
    const bob = st.walking ? Math.abs(Math.sin(st.w)) * 3 : 0;
    return { x: st.x + (27 + Math.sin(ang) * 26) * S, y: FY + (-46 + Math.cos(ang) * 26 - 10 - bob) * S };
  };

  return {
    update(t) {
      const st = state(t);
      const released = t >= 3.0;
      const sr = released ? 1 - easeInOut(seg(t, 3.0, 3.35)) : 1;
      b.pose({
        x: st.x,
        walk: st.walking ? st.w : 0,
        armR: released ? lerp(8, state(3.0).a, sr) : st.a,
        armL: st.walking ? 8 - Math.sin(st.w) * 14 : 8,
        look: released ? 0.3 : 0.8,
        lean: !released && st.up > 0 ? 4 * st.up : 0,
        mood: t >= 3.3 ? 'grin' : 'smile',
        lift: t >= 3.4 ? 8 * Math.abs(Math.sin((t - 3.4) * 8)) * (1 - seg(t, 3.4, 4.2)) : 0
      });

      // ---- 報告書 ----
      const h = handOf(st);
      const rot = lerp(-8, 0, st.up);
      let cx = h.x + 24, cy = h.y - 34;
      if (released) {
        const h0 = handOf(state(3.0));
        const slide = easeIn(seg(t, 3.0, 3.4));
        cx = h0.x + 24;
        cy = h0.y - 34 + 78 * slide;
      }
      // 端が少し弾む
      tf(rep, cx, cy, rot);

      // ---- 箱：受け取ったら小さく弾む ----
      const bump = t >= 3.4 ? wobble(seg(t, 3.4, 4.0), 2, 5) : 0;
      tf(box, 0, 0, 0, 1, 1);
      box.setAttribute('transform', `translate(${SLOT_X} ${FY}) scale(${(1 + 0.03 * bump).toFixed(3)} ${(1 - 0.05 * bump).toFixed(3)}) translate(${-SLOT_X} ${-FY})`);
      // ---- ✓ ----
      const cp = seg(t, 3.4, 3.75);
      const cs = cp <= 0 ? 0 : backOut(cp, 2.4);
      tf(check, SLOT_X, 218, 0, cs, cs);
      icon.setAttribute('opacity', 1 - clamp(cp * 3));
      sparks.forEach((q, i) => {
        const u = seg(t, 3.5 + i * 0.1, 3.95 + i * 0.1);
        const sc = u <= 0 ? 0 : u >= 1 ? 0.85 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc, sc);
      });
    }
  };
}
