// cap：遊びに出かける前、野球帽をかぶってつばを前に向け、ボールを持って外へ駆け出す（例文 He always wears a baseball cap when he goes out to play.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { gait, held, reach, hp, P, blinkAt } from './skirt.js';

export const meta = { duration: 4.4, beats: [[0, '帽子を持つ'], [0.9, 'かぶる'], [2.2, '遊びに行く']] };

// 野球帽（体の座標。つばは +x＝前）
export function capShape(k, parent, c = '#F2685B', d = '#C94B40') {
  const g = k.g({}, parent);
  k.el('path', { d: 'M -27 -70 Q -26 -94 0 -94 Q 26 -94 27 -70 Z', fill: c }, g);
  k.el('path', { d: 'M 18 -72 Q 40 -74 46 -68 Q 40 -64 18 -66 Z', fill: d }, g);
  k.el('path', { d: 'M 0 -94 L 0 -71 M -14 -90 Q -6 -80 -8 -71 M 14 -90 Q 6 -80 8 -71', stroke: d, 'stroke-width': 1.4, fill: 'none', opacity: 0.6 }, g);
  k.el('circle', { cx: 0, cy: -94, r: 3, fill: d }, g);
  k.el('rect', { x: -27, y: -73, width: 46, height: 4, rx: 2, fill: d, opacity: 0.5 }, g);
  return g;
}
function ball(k) {
  const g = k.g({});
  k.el('circle', { r: 8, fill: '#fff', stroke: k.pal.line, 'stroke-width': 1.5 }, g);
  k.el('path', { d: 'M -5 -6 Q -1 0 -5 6 M 5 -6 Q 1 0 5 6', stroke: k.pal.red, 'stroke-width': 1.5, fill: 'none' }, g);
  return g;
}

export function create(k) {
  const { el, g, pal, tf } = k, S = 1.2;
  const FY = k.backdrop({ floorY: 236 });
  // 家（左）と公園（右）
  el('rect', { x: 0, y: 70, width: 130, height: FY - 70, fill: '#F3E6DC' });
  el('path', { d: 'M -10 76 L 65 30 L 140 76 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' });
  el('rect', { x: 30, y: 128, width: 58, height: FY - 128, rx: 3, fill: '#5A6480' });
  const door = el('rect', { x: 30, y: 128, width: 58, height: FY - 128, rx: 3, fill: pal.blue });
  el('rect', { x: 130, y: FY, width: 270, height: 64, fill: '#CDEBC4' });
  el('rect', { x: 0, y: FY, width: 130, height: 64, fill: '#E3E8EE' });
  [[300, 1], [366, 0.8]].forEach(([x, s]) => {
    const tr = g({ transform: `translate(${x} ${FY}) scale(${s})` });
    k.shadow(0, 0, 26, 5, tr);
    el('rect', { x: -5, y: -44, width: 10, height: 44, rx: 4, fill: pal.woodDark }, tr);
    el('circle', { cx: 0, cy: -62, r: 30, fill: '#7FD3A0' }, tr);
  });
  const b = k.buddy({ x: 70, y: FY, scale: S });
  const cap = capShape(k, k.root);
  const bl = ball(k);
  const xf = (t) => lerp(110, 250, easeInOut(seg(t, 2.2, 3.7)));
  return {
    update(t) {
      // ドアが開いて出てくる
      tf(door, 0, 0, 0, 1, 1); door.setAttribute('transform', `translate(30 0) scale(${lerp(1, 0.15, easeInOut(seg(t, 0, 0.3)))} 1) translate(-30 0)`);
      const out = easeInOut(seg(t, 0.1, 0.6));
      const p = gait(xf, t, 110, 26, 0.13);
      const x = t < 2.2 ? lerp(70, 110, out) : p.x;
      const put = easeInOut(seg(t, 0.8, 1.4)), turn = easeInOut(seg(t, 1.5, 1.9));
      P(b, { x, walk: t < 2.2 ? out * 3 : p.walk, lean: p.lean * 2 + 4 * hump(seg(t, 1.4, 1.6)), armL: t < 2.2 ? 60 : p.armL, armR: t < 2.2 ? 8 : p.armR,
        lift: t > 2.2 ? Math.abs(Math.sin(p.walk)) * 6 * p.m : 0, look: 0.4, mood: t > 1.9 ? 'grin' : 'smile', blink: blinkAt(t) });
      // 帽子：右手に持つ → 頭へ → つばを後ろから前へ回す（体の座標に入れる）
      if (t < 1.4) {
        b.pose({ armR: lerp(60, 165, put) });
        if (cap.parentNode !== k.root) k.root.appendChild(cap);
        const h = hp(b, S, 'R');
        const top = { x: x, y: FY - 10 * S };
        tf(cap, lerp(h.x, top.x, put), lerp(h.y + 76 * S, top.y, put), 0, S * -1, S);
        b.g.parentNode.appendChild(cap);
      } else {
        if (cap.parentNode !== b.body) b.body.appendChild(cap);
        const f = lerp(-1, 1, turn);
        cap.setAttribute('transform', `translate(0 ${2 * hump(seg(t, 1.4, 1.6))}) scale(${Math.abs(f) < 0.05 ? 0.05 : f} 1)`);
        if (t < 2.2) b.pose({ armR: lerp(165, 150, turn) * (1 - easeInOut(seg(t, 1.9, 2.2))) + 8 * easeInOut(seg(t, 1.9, 2.2)) });
      }
      // ボール：左手に持って走る
      const toss = seg(t, 3.7, 4.3);
      if (t > 3.6) b.pose({ armL: lerp(8, 150, easeOut(seg(t, 3.6, 3.8))) });
      const hl = hp(b, S, 'L', 34);
      tf(bl, hl.x, hl.y - 60 * hump(toss), toss * 360);
      b.g.parentNode.appendChild(bl);
      b.g.setAttribute('opacity', 1);
      void reach; void wobble;
    }
  };
}
