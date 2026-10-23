// citizen：式典でカナダの市民証書を受け取り、カナダの旗を振って喜ぶ（例文 He became a citizen of Canada.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, hp, reach, P, blinkAt, walkTo, path, wear, sc } from './member.js';

const LEAF = 'M 0 -9 L 2 -4 L 5 -6 L 4 -1 L 8 0 L 4 3 L 5 6 L 1 4 L 1 9 L -1 9 L -1 4 L -5 6 L -4 3 L -8 0 L -4 -1 L -5 -6 L -2 -4 Z';
export function caFlag(k, w, parent) {
  const g = k.g({}, parent), h = w / 2, { el, pal } = k;
  el('rect', { x: 0, y: 0, width: w, height: h, fill: '#fff', stroke: '#E8D9D9', 'stroke-width': 1 }, g);
  el('rect', { x: 0, y: 0, width: w / 4, height: h, fill: pal.red }, g);
  el('rect', { x: (3 * w) / 4, y: 0, width: w / 4, height: h, fill: pal.red }, g);
  el('path', { d: LEAF, fill: pal.red, transform: `translate(${w / 2} ${h / 2}) scale(${w / 44})` }, g);
  return g;
}
export const meta = { duration: 4.4, beats: [[0, '式に出る'], [1.6, '証書を受け取る'], [3.0, 'カナダ市民に']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: 0, width: 400, height: FY, fill: '#F4EEE6' });
  const big = caFlag(k, 120); tf(big, 140, 30);
  el('line', { x1: 136, y1: 26, x2: 136, y2: 100, stroke: pal.woodDark, 'stroke-width': 4 });
  // 係員と演台
  const o = k.buddy({ x: 312, y: FY, scale: 1, facing: -1, ...CO(k) }); wear(k, o, 'tie', pal.blueDark);
  el('path', { d: `M 330 ${FY} L 336 ${FY - 52} L 380 ${FY - 52} L 386 ${FY} Z`, fill: pal.woodDark });
  el('rect', { x: 330, y: FY - 58, width: 56, height: 8, rx: 2, fill: pal.wood });
  const b = k.buddy({ x: 40, y: FY, scale: S });
  const cert = g({});
  el('rect', { x: -16, y: -12, width: 32, height: 24, rx: 2, fill: '#FFF8E6', stroke: pal.yellowDark, 'stroke-width': 1.5 }, cert);
  el('path', { d: LEAF, fill: pal.red, transform: 'translate(-6 -2) scale(0.55)' }, cert);
  el('circle', { cx: 8, cy: 5, r: 4, fill: pal.yellow, stroke: pal.yellowDark }, cert);
  el('line', { x1: 2, y1: -6, x2: 12, y2: -6, stroke: pal.sub, 'stroke-width': 1.2 }, cert);
  const fl = g({}); el('line', { x1: 0, y1: 0, x2: 0, y2: -40, stroke: pal.woodDark, 'stroke-width': 2.5 }, fl); tf(caFlag(k, 30, fl), 0, -40);
  const conf = [0, 1, 2, 3, 4, 5].map((i) => el('rect', { width: 5, height: 8, rx: 1, fill: [pal.red, pal.yellow, pal.blue][i % 3] }));
  const bx = path([[0.2, 40], [1.4, 200]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 40, 1), give = easeInOut(seg(t, 1.4, 1.9)), got = t > 2.0, back = easeInOut(seg(t, 2.1, 2.5));
      const wave = easeOut(seg(t, 2.8, 3.1));
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: w.armR, lean: w.lean, blink: blinkAt(t), look: 0.5, mood: t > 2.3 ? 'grin' : 'smile', lift: 6 * hump(seg(t, 3.2, 3.6)) });
      P(o, { blink: blinkAt(t, 1), look: 0.4, armR: lerp(lerp(30, 70, give), 20, back), armL: 10 + 30 * hump(seg(t, 3.0, 4.0)) });
      const oh = hp(o, 1, 'R', 32);
      if (t > 1.2) b.pose({ armR: got ? lerp(reach(b, S, 'R', oh.x, oh.y), 40, back) : lerp(w.armR, reach(b, S, 'R', oh.x, oh.y), give) });
      b.pose({ armL: lerp(b.state.armL, 165 + 12 * Math.sin(t * 12), wave) });
      const h = got ? hp(b, S, 'R', 32) : oh;
      tf(cert, h.x, h.y + 4);
      const hl = hp(b, S, 'L', 30);
      tf(fl, hl.x, hl.y + 4, -8 * Math.sin(t * 12) * wave, sc(wave));
      conf.forEach((c, i) => { const p = seg(t, 3.0 + i * 0.08, 4.4); k.tf(c, 150 + i * 30, 20 + 200 * p, p * 400 + i * 40); c.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0); });
    }
  };
}
