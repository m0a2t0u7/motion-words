// dig：子どもたちが砂場でシャベルを使い、砂を掘って穴を作る（例文 The children dug a hole in the sand.）
import { seg, lerp, easeInOut, easeOut, smooth, clamp } from '../ease.js';
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;

// 手先の正確な座標（体の傾き・つぶれ・向きを反映）
export function hp(b, s, side = 'R', len = 28) {
  const st = b.state, a = rad(side === 'R' ? -st.armR : st.armL);
  let x = (side === 'R' ? 27 : -27) - len * Math.sin(a), y = -46 + len * Math.cos(a);
  x *= 2 - st.squash; y *= st.squash;
  const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
  return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
}
// 手に持つ物を、腕の向きに合わせて手先へ置く（node の原点＝握り、+y方向＝腕の先）
export function held(k, b, s, node, side = 'R', rot = 0, len = 28) {
  const st = b.state, h = hp(b, s, side, len);
  const A = (side === 'R' ? st.armR : -st.armL) - st.lean;
  k.tf(node, h.x, h.y, -A * st.facing + rot, s, s);
  return h;
}
// 指定の点へ手を伸ばすための腕の角度
export function reach(b, s, side, tx, ty) {
  const st = b.state, o = hp(b, s, side, 0);
  const phi = deg(Math.atan2(-(tx - o.x) * st.facing, ty - o.y));
  return side === 'R' ? st.lean - phi : phi - st.lean;
}
// 室内＋カウンター。front() を呼ぶと、それ以降に作った図形の下にカウンター前面が入る（人物の腰から下を隠す）
export function room(k, wall = 'indoor') {
  const { el, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: wall });
  el('rect', { x: 0, y: 196, width: 400, height: 40, fill: '#F1EBE2' });
  return {
    FY, TY: 196,
    front() {
      el('rect', { x: 0, y: 196, width: 400, height: 6, fill: pal.wood });
      el('rect', { x: 0, y: 202, width: 400, height: 46, fill: '#F6D9B3' });
      el('rect', { x: 0, y: 202, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
      for (let x = 0; x <= 400; x += 100) el('rect', { x: x + 4, y: 210, width: 92, height: 30, rx: 3, fill: 'none', stroke: pal.woodDark, 'stroke-width': 1.5, opacity: 0.55 });
    }
  };
}

// 左腕を体の前に出す（手前の腕）。set(角度) で腕を動かし pos() で手先座標を得る。pose() の後に毎回 set() を呼ぶこと
export function frontL(b, s, bx = 20, by = -44) {
  b.body.appendChild(b.armL.a);
  const st = b.state;
  return {
    set(ang) { b.armL.a.setAttribute('transform', `translate(${bx} ${by}) rotate(${-ang})`); st.fla = ang; },
    pos(len = 28) {
      const a = rad(-(st.fla || 0));
      let x = bx - len * Math.sin(a), y = by + len * Math.cos(a);
      x *= 2 - st.squash; y *= st.squash;
      const l = rad(st.lean), c = Math.cos(l), sn = Math.sin(l);
      return { x: st.x + (x * c - y * sn) * st.facing * s, y: st.y + (x * sn + y * c - 10 - st.lift) * s };
    },
    ang() { return (st.fla || 0) - st.lean; }
  };
}
// 右側に置いたテーブル（人物は左の床に立つ。手がテーブルの上に出る）。戻り値は天板の奥行き中心 y
export function table(k, TX = 196, mood = 'indoor') {
  const { el, pal } = k;
  k.backdrop({ floorY: 236, mood });
  el('rect', { x: TX, y: 178, width: 400 - TX, height: 28, fill: '#F2DDBB' });
  el('rect', { x: TX, y: 178, width: 400 - TX, height: 3, fill: '#fff', opacity: 0.5 });
  el('rect', { x: TX, y: 206, width: 400 - TX, height: 14, fill: pal.wood });
  el('rect', { x: TX, y: 206, width: 400 - TX, height: 3, fill: pal.woodDark, opacity: 0.35 });
  el('rect', { x: TX + 8, y: 220, width: 8, height: 18, fill: pal.woodDark });
  k.shadow(TX + 12, 237, 14, 3);
  return 192;
}
// 位置 x から歩行位相（足をそろえる動きは呼び側で）
export const stepPhase = (x, x0) => Math.abs(x - x0) * 0.107;

export const meta = { duration: 4.2, beats: [[0, '平らな砂'], [1.6, '掘っている'], [3.5, '穴ができた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 190, mood: 'outdoor' });
  el('rect', { x: 0, y: 150, width: 400, height: 40, fill: '#BFE3F5' });
  el('rect', { x: 0, y: 190, width: 400, height: 110, fill: '#F2DFB5' });
  el('rect', { x: 0, y: 190, width: 400, height: 3, fill: '#E6CE9B' });
  const hole = g({}); tf(hole, 200, 252);
  const hOut = el('ellipse', { cx: 0, cy: 0, rx: 10, ry: 3, fill: '#D9BE86' }, hole);
  const hIn = el('ellipse', { cx: 0, cy: 1, rx: 8, ry: 2.5, fill: '#8E7442' }, hole);
  const pile = el('path', { d: '', fill: '#E6CE9B' });
  const B = [
    { b: k.buddy({ x: 126, y: 244, scale: 0.9 }), f: 1, ph: 0 },
    { b: k.buddy({ x: 274, y: 244, scale: 0.9, color: pal.coral, dark: pal.coralDark, facing: -1 }), f: -1, ph: 0.55 }
  ];
  B.forEach((o) => { o.sh = g({}); const sg = g({ transform: 'translate(0 -14)' }, o.sh); el('rect', { x: -1.8, y: 0, width: 3.6, height: 40, rx: 1.5, fill: pal.woodDark }, sg); el('path', { d: 'M -9 36 L 9 36 L 6 56 Q 0 61 -6 56 Z', fill: o.f > 0 ? pal.blue : pal.red }, sg); });
  const sand = [0, 1, 2, 3, 4, 5].map(() => el('circle', { r: 3.2, fill: '#D9BE86' }));
  const P = 1.1;
  return {
    update(t) {
      const g0 = seg(t, 0.3, 3.4);
      B.forEach((o, i) => {
        const u = t < 0.5 ? 0 : ((t - 0.5) / P + o.ph) % 1; // 掘る周期
        const on = t > 0.5 && t < 3.6 ? 1 : 0;
        const dig = on ? (u < 0.4 ? easeInOut(u / 0.4) : u < 0.7 ? 1 - easeInOut((u - 0.4) / 0.3) : 0) : 0;
        const tip = on ? smooth(seg(u, 0.7, 0.85)) * (1 - smooth(seg(u, 0.85, 1))) : 0;
        o.b.pose({ armR: on ? lerp(105, 52, dig) + tip * 20 : 28, armL: on ? lerp(70, 40, dig) : 8, lean: lerp(0, 16, dig) - tip * 4, squash: 1 - 0.04 * dig, look: 0.4, mood: on ? 'grin' : 'smile' });
        const h = held(k, o.b, 0.9, o.sh, 'R', 8);
        if (on && u > 0.45 && u < 0.7) o.carry = 1; else o.carry = 0;
        if (u > 0.7 && u < 1 && on) {
          const q = (u - 0.7) / 0.3, ex = 200 + (o.f > 0 ? -6 : 6), tx = h.x, ty = h.y + 24;
          const p = sand[i * 3];
          k.set(p, { cx: lerp(tx, ex, q), cy: lerp(ty, 276, q) - 26 * Math.sin(q * Math.PI), opacity: 1 });
        } else k.set(sand[i * 3], { opacity: 0 });
      });
      // 穴は深く広く、砂山は高く
      const rx = lerp(10, 54, easeOut(g0)), ry = lerp(3, 13, easeOut(g0));
      k.set(hOut, { rx, ry }); k.set(hIn, { rx: rx - 4, ry: ry - 2, cy: 1 });
      const ph = lerp(0, 36, g0);
      k.set(pile, { d: `M 140 302 Q 200 ${302 - ph * 2} 260 302 Z`, opacity: g0 > 0.02 ? 1 : 0 });
      sand.forEach((p, i) => { if (i % 3) k.set(p, { opacity: 0 }); });
    }
  };
}

// 位置の関数 xf(t) から歩行の位相と腕振りを作る（止まると脚をそろえる）
export function gait(xf, t, x0, amp = 18, kf = 0.107) {
  const x = xf(t), v = Math.abs(xf(t + 0.02) - xf(t - 0.02)) / 0.04;
  const ph = Math.abs(x - x0) * kf, m = clamp(v / 25);
  const w = lerp(Math.round(ph / Math.PI) * Math.PI, ph, m);
  return { x, walk: w, armL: 8 + Math.sin(w) * amp * m, armR: 8 - Math.sin(w) * amp * m, lean: 3 * m, m };
}
