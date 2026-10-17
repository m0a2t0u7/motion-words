// bury：犬が骨をくわえて来て、穴を掘り、骨を落として土をかぶせて隠す（例文 The dog buried a bone in the garden.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, backOut } from '../ease.js';
import { streetBg } from './weigh.js';

export const meta = { duration: 5.0, beats: [[0, '骨をくわえる'], [1.5, '穴を掘る'], [3.6, '土をかぶせた']] };

const rad = (d) => (d * Math.PI) / 180;
// 横向きの犬（右向きが基準）。他のシーンからも使う
export function makeDog(k, parent, sc = 1) {
  const { el, g, tf, pal } = k;
  const BR = '#D9A066', BD = '#B9803F', EAR = '#8A5A3C';
  const outer = g({}, parent);
  const sh = k.shadow(0, 0, 40, 6, outer);
  const flip = g({}, outer);
  const inner = g({}, flip);
  const mkLeg = (x, dark) => { const l = g({}, inner); tf(l, x, -22); el('rect', { x: -4.5, y: 0, width: 9, height: 22, rx: 4.5, fill: dark ? BD : BR }, l); el('ellipse', { cx: 1.5, cy: 21, rx: 7, ry: 3.6, fill: dark ? '#9A6A33' : BD }, l); return l; };
  const hindB = mkLeg(-22, true), frontB = mkLeg(16, true);
  const tail = g({}, inner); tf(tail, -29, -32);
  el('path', { d: 'M 0 0 Q -14 -4 -16 -18 Q -9 -12 2 -8 Z', fill: BD }, tail);
  el('ellipse', { cx: 0, cy: -26, rx: 32, ry: 17, fill: BR }, inner);
  el('ellipse', { cx: 4, cy: -17, rx: 22, ry: 8, fill: '#F2D3A2' }, inner);
  const hindF = mkLeg(-14, false), frontF = mkLeg(22, false);
  const head = g({}, inner);
  const jaw = g({}, head); tf(jaw, 8, 4);
  el('path', { d: 'M 0 0 L 22 0 Q 24 8 14 9 Q 4 9 0 4 Z', fill: '#C98F58' }, jaw);
  el('path', { d: 'M 2 0 L 20 0 L 18 6 Q 10 8 4 5 Z', fill: '#9A3F3A' }, jaw);
  el('circle', { r: 14, fill: BR }, head);
  el('ellipse', { cx: 15, cy: 1, rx: 12, ry: 8.5, fill: '#F2D3A2' }, head);
  el('circle', { cx: 25, cy: -3, r: 3.6, fill: pal.ink }, head);
  el('circle', { cx: 5, cy: -5, r: 2.8, fill: pal.ink }, head);
  const ear = g({}, head); tf(ear, -5, -8);
  el('path', { d: 'M 0 0 Q -12 2 -10 18 Q 2 16 6 2 Z', fill: EAR }, ear);
  const st = { x: 0, y: 0, facing: 1, bow: 0, headRot: 0, jaw: 0, f1: 0, f2: 0, h1: 0, h2: 0, tail: 0, squash: 1 };
  const apply = () => {
    tf(outer, st.x, st.y, 0, sc); tf(flip, 0, 0, 0, st.facing, 1);
    inner.setAttribute('transform', `rotate(${st.bow} -22 0) translate(0 ${(0).toFixed(1)})`);
    tf(head, 31, -42, st.headRot);
    tf(jaw, 8, 4, st.jaw);
    tf(frontF, 22, -22, st.f1); tf(frontB, 16, -22, st.f2); tf(hindF, -14, -22, st.h1); tf(hindB, -22, -22, st.h2);
    tf(tail, -29, -32, st.tail);
    tf(ear, -5, -8, -6 * Math.sin(rad(st.headRot * 3)) + st.bow * -0.6);
  };
  apply();
  return {
    g: outer, st,
    pose(p) { Object.assign(st, p); apply(); },
    // 口先（くわえる位置）のワールド座標
    mouth() {
      const a = rad(st.headRot), hx = 31 + Math.cos(a) * 24 - Math.sin(a) * 7, hy = -42 + Math.sin(a) * 24 + Math.cos(a) * 7;
      const b = rad(st.bow), dx = hx + 22, dy = hy;
      return { x: st.x + sc * st.facing * (-22 + Math.cos(b) * dx - Math.sin(b) * dy), y: st.y + sc * (Math.sin(b) * dx + Math.cos(b) * dy) };
    }
  };
}
export function bone(k, parent) {
  const b = k.g({}, parent);
  k.el('rect', { x: -11, y: -3, width: 22, height: 6, rx: 3, fill: '#fff', stroke: '#D4D9E1', 'stroke-width': 1.2 }, b);
  [[-11, -3], [-11, 3], [11, -3], [11, 3]].forEach(([x, y]) => k.el('circle', { cx: x, cy: y, r: 3.6, fill: '#fff', stroke: '#D4D9E1', 'stroke-width': 1.2 }, b));
  return b;
}
export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 200, mood: 'outdoor' });
  // 庭：芝の地面と柵（動かない）
  el('rect', { x: 0, y: 200, width: 400, height: 100, fill: '#CDEBCF' });
  el('rect', { x: 0, y: 200, width: 400, height: 3, fill: '#B5DDB9' });
  for (let i = 0; i < 9; i++) { el('rect', { x: 8 + i * 46, y: 150, width: 14, height: 50, rx: 4, fill: '#F6EBDD' }); }
  el('rect', { x: 0, y: 164, width: 400, height: 7, fill: '#EBDCC8' }); el('rect', { x: 0, y: 184, width: 400, height: 7, fill: '#EBDCC8' });
  [[50, 8], [96, 12], [350, 10]].forEach(([x, h], i) => { const f = g({}); tf(f, x, 252); el('line', { x1: 0, y1: 0, x2: 0, y2: -h - 8, stroke: pal.green, 'stroke-width': 2.4 }, f); el('circle', { cy: -h - 10, r: 6, fill: i % 2 ? pal.coral : pal.violet }, f); el('circle', { cy: -h - 10, r: 2.4, fill: pal.yellow }, f); });
  // 掘る場所
  const GX = 292, GY = 254;
  el('ellipse', { cx: GX, cy: GY, rx: 46, ry: 11, fill: '#B98B5E' });
  const hole = el('ellipse', { cx: GX, cy: GY, rx: 0.1, ry: 0.1, fill: '#5A3E28' });
  const bn = bone(k, g({})); const bg = bn.parentNode;
  const mound = el('ellipse', { cx: GX, cy: GY, rx: 0.1, ry: 0.1, fill: '#A67748' });
  const mtop = el('ellipse', { cx: GX - 3, cy: GY - 2, rx: 0.1, ry: 0.1, fill: '#C79C6C' });
  const dog = makeDog(k, g({}), 1.3);
  const bg2 = bone(k, g({})); const bgm = bg2.parentNode;
  const dirt = Array.from({ length: 10 }, () => el('circle', { r: 2.6, fill: '#8A5E36' }));
  const hash = (i) => { const v = Math.sin(i * 78.2 + 1.7) * 43758.5; return v - Math.floor(v); };
  return {
    update(t) {
      const walk = easeInOut(seg(t, 0.1, 1.2));
      const x = lerp(-40, 214, walk);
      const mv = Math.abs(lerp(-40, 214, easeInOut(seg(t + 0.02, 0.1, 1.2))) - lerp(-40, 214, easeInOut(seg(t - 0.02, 0.1, 1.2)))) / 0.04;
      const wm = Math.min(1, mv / 30), ph = x * 0.1;
      const dig = seg(t, 1.3, 2.6), drop = seg(t, 2.6, 3.1), fill = easeInOut(seg(t, 3.2, 4.4));
      const digging = t > 1.3 && t < 2.6, pushing = t > 3.2 && t < 4.4;
      const dg = digging ? Math.sin(t * 24) : 0;
      let bow = 0, headRot = 0, jaw = 0, f1 = 0, f2 = 0, tail = 0;
      bow = 14 * easeInOut(seg(t, 1.2, 1.5)) * (1 - easeInOut(seg(t, 4.5, 4.9))) ;
      if (digging) { f1 = 28 * dg + 22; f2 = -28 * dg + 22; headRot = 18 + 6 * Math.sin(t * 24); }
      if (t >= 2.6 && t < 3.2) { headRot = lerp(18, 34, hump(drop)); jaw = 24 * easeOut(seg(t, 2.6, 2.8)); }
      if (t >= 3.2) { jaw = 24 * (1 - easeOut(seg(t, 3.2, 3.4))); headRot = 28 + 8 * Math.sin(t * 14) * (pushing ? 1 : 0) - 28 * seg(t, 4.3, 4.8) * 0; f1 = pushing ? 10 * Math.sin(t * 18) : 0; }
      if (t >= 4.5) headRot = lerp(headRot, 0, easeOut(seg(t, 4.5, 4.9)));
      if (t > 4.2) tail = 25 * Math.sin(t * 22);
      const wk = Math.sin(ph) * 24 * wm;
      dog.pose({ x, y: GY - 2, bow, headRot: t < 1.2 ? 4 : headRot, jaw, f1: f1 + wk, f2: f2 - wk, h1: -wk, h2: wk, tail: tail + (t < 1.3 ? 0 : 0) });
      dog.pose({ f1: digging || pushing || t > 2.6 && t < 3.3 ? f1 : wk, f2: digging ? f2 : -wk });
      // 骨：口→穴の中
      const m = dog.mouth();
      const bonePos = t < 2.55 ? { x: m.x, y: m.y + 1, a: 0 } : t < 3.1 ? (() => { const p = easeIn(seg(t, 2.65, 3.1)); return { x: lerp(m.x, GX - 2, easeOut(seg(t, 2.65, 3.1))), y: lerp(m.y, GY - 1, p), a: 40 * p }; })() : { x: GX - 2, y: GY - 1, a: 40 };
      tf(bgm, bonePos.x, bonePos.y, bonePos.a); bgm.setAttribute('opacity', t < 3.2 ? 1 : 0);
      tf(bg, bonePos.x, bonePos.y, bonePos.a); bg.setAttribute('opacity', t >= 3.2 && fill < 0.9 ? 1 : 0);
      // 穴は掘るほど広がり、埋めると小さくなる／土がもりあがる
      const hr = 17 * easeOut(dig) * (1 - fill);
      hole.setAttribute('rx', hr + 0.1); hole.setAttribute('ry', hr * 0.3 + 0.1);
      mound.setAttribute('rx', 26 * fill + 0.1); mound.setAttribute('ry', 11 * fill + 0.1); mound.setAttribute('cy', GY - 2 * fill);
      mtop.setAttribute('rx', 12 * fill + 0.1); mtop.setAttribute('ry', 4 * fill + 0.1);
      // 飛び散る土（掘るあいだは後ろへ、埋めるあいだは手前へ）
      dirt.forEach((d, i) => {
        const on = digging || pushing, p = ((t * 2.4 + hash(i)) % 1);
        const dir = digging ? -1 : 0.6;
        d.setAttribute('cx', (GX - 8 + dir * (10 + 38 * p) * (0.5 + hash(i + 3))).toFixed(1));
        d.setAttribute('cy', (GY - 4 - 30 * Math.sin(p * Math.PI) * (0.5 + hash(i + 5)) + 12 * p).toFixed(1));
        d.setAttribute('opacity', on ? 1 - p * 0.8 : 0);
      });
    }
  };
}
