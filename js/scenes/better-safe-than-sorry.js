// better safe than sorry：出かけようとするまめに、曇り空を指して相手が傘を差し出す→まめは受け取り、傘を持って出かける（例文 Take an umbrella. Better safe than sorry.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, reach, held, cue, walk, path, door, cloud } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '出かける前'], [1.3, '念のため傘'], [3.2, '傘を持って出る']] };

function umbrella(k) {
  const g = k.g({});
  k.el('path', { d: 'M 0 -4 L 0 -40', stroke: k.pal.ink, 'stroke-width': 2.5 }, g);
  k.el('path', { d: 'M 0 0 Q 0 6 5 6', stroke: k.pal.ink, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
  k.el('path', { d: 'M -5 -12 L 0 -44 L 5 -12 Z', fill: k.pal.blue, stroke: k.pal.blueDark, 'stroke-width': 1.5 }, g);
  return g;
}

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  // 曇り空の窓
  el('rect', { x: 30, y: 40, width: 110, height: 80, fill: '#BCC8D6' });
  const wc = g({}); wc.setAttribute('clip-path', k.clip((c) => el('rect', { x: 30, y: 40, width: 110, height: 80 }, c)));
  [[66, 70, 24], [104, 62, 28], [86, 84, 22]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#97A6B9' }, wc));
  el('rect', { x: 30, y: 40, width: 110, height: 80, rx: 6, fill: 'none', stroke: '#fff', 'stroke-width': 6 });
  el('line', { x1: 85, y1: 40, x2: 85, y2: 120, stroke: '#fff', 'stroke-width': 4 });
  // 玄関ドア
  el('rect', { x: 300, y: FY - 136, width: 84, height: 136, fill: '#D6E4EF' });
  const D = door(k, { x: 300, y: FY - 136, w: 84, h: 136, hinge: 'R', color: pal.blue });
  const C = k.buddy({ x: 100, y: FY, scale: 0.88, color: pal.coral, dark: pal.coralDark });
  const A = k.buddy({ x: 170, y: FY, scale: 0.88 });
  const um = umbrella(k);
  const say1 = cue(k, 'Just in case!', 108, 30, 1, 13);
  const xa = path([[0.2, 170], [1.0, 250], [1.3, 250], [1.6, 236], [3.2, 236], [4.1, 326]]);
  return {
    update(t) {
      // まめ：ドアへ向かう→呼び止められ振り返る→傘を受け取り出かける
      const back = t > 1.2 && t < 3.15;
      walk(A, xa, t, { facing: back ? -1 : 1, look: t > 2.4 && t < 2.8 ? -0.2 : 0.6, mood: t > 2.8 ? 'grin' : 'smile' });
      D.set(easeInOut(seg(t, 3.2, 3.7)));
      // ピンク：窓の曇りを指す→傘を差し出す
      const point = hump(seg(t, 0.9, 1.8));
      const offer = easeOut(seg(t, 1.8, 2.3)) * (1 - easeOut(seg(t, 2.5, 2.9)));
      const cx = lerp(100, 160, easeInOut(seg(t, 1.6, 2.2)));
      P(C, { x: cx, walk: (cx - 100) * 0.107, facing: 1, look: 0.6, mood: t > 1.0 && t < 2.2 && Math.sin(t * 20) > 0 ? 'open' : 'smile' });
      C.pose({ armL: lerp(8, 150, point), armR: lerp(8, 82, offer) });
      // 受け渡し（2.4）
      const take = easeOut(seg(t, 2.2, 2.45));
      if (back) A.pose({ armR: lerp(A.state.armR, 70, take * (1 - easeOut(seg(t, 2.6, 3.0)))) });
      const hc = held(k, C, 0.88, k.g({}), 'R', 0, 30), ha = held(k, A, 0.88, k.g({}), 'R', 0, 30);
      const mine = t > 2.45;
      um.setAttribute('opacity', t > 1.75 ? 1 : 0);
      tf(um, mine ? ha.x : hc.x, (mine ? ha.y : hc.y) + 6, 0, 0.9);
      say1.show(seg(t, 1.1, 1.4) * (1 - seg(t, 2.6, 2.8)), 112, 106);
    }
  };
}
