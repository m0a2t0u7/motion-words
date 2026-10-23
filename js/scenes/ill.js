// ill：具合の悪いまめがベッドで体温計を見て、せきをし、学校へ行く友だちを窓から見送って家で休む（例文 He stayed home because he was ill.）
import { seg, lerp, easeInOut, easeOut, hump, wobble } from '../ease.js';
import { P, blinkAt, hp, hold, homeBg, person, path, walkTo, sym, onFace, sweat } from './confused.js';

export const meta = { duration: 4.4, beats: [[0, '熱がある'], [1.6, 'せきが出る'], [3.0, '家で休む']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = homeBg(k, { winX: 240, winW: 130, winH: 84, winY: 40, curtain: '#C9DDF2' });
  // 窓の外：学校へ行く友だち（窓の中だけ見える）
  const out = g({ 'clip-path': k.clip((c) => el('rect', { x: 240, y: 40, width: 130, height: 84 }, c)) });
  el('rect', { x: 240, y: 108, width: 130, height: 16, fill: '#BFE3C4' }, out);
  const kids = ['coral', 'yellow'].map((c) => person(k, c, { scale: 0.32, parent: out }));
  // ベッド
  const MT = FY - 44;
  k.shadow(140, FY + 2, 110, 6);
  el('rect', { x: 30, y: FY - 110, width: 14, height: 110, rx: 5, fill: pal.woodDark });
  el('rect', { x: 236, y: FY - 70, width: 12, height: 70, rx: 5, fill: pal.woodDark });
  el('rect', { x: 40, y: MT, width: 200, height: 26, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 2 });
  el('rect', { x: 40, y: MT + 22, width: 200, height: 10, fill: pal.wood });
  const b = k.buddy({ x: 100, y: MT + 12, scale: S });
  const pale = onFace(k, b);
  [-12, -4, 4, 12].forEach((x) => el('line', { x1: x, y1: -86, x2: x, y2: -74, stroke: '#7FA6D8', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, pale));
  // 頭の氷のう
  const ice = el('rect', { x: -16, y: -6, width: 32, height: 12, rx: 6, fill: '#BFE2FA', stroke: '#8FC1E8', 'stroke-width': 2 });
  // 掛けぶとん（手前）
  el('path', { d: `M 60 ${MT - 16} Q 150 ${MT - 30} 236 ${MT - 8} L 236 ${MT + 24} L 60 ${MT + 24} Z`, fill: '#9CC3EE' });
  el('path', { d: `M 60 ${MT - 16} Q 150 ${MT - 30} 236 ${MT - 8}`, stroke: '#7FA6D8', 'stroke-width': 3, fill: 'none' });
  const th = g({});
  el('rect', { x: -2.5, y: -22, width: 5, height: 24, rx: 2.5, fill: '#fff', stroke: pal.sub, 'stroke-width': 1.2 }, th);
  el('rect', { x: -1.2, y: -16, width: 2.4, height: 15, fill: pal.red }, th);
  el('circle', { cx: 0, cy: 2, r: 3, fill: pal.red }, th);
  const hot = sym(k, '!', pal.red, 20), cough = [0, 1, 2].map(() => el('circle', { r: 3, fill: '#fff', stroke: pal.line, 'stroke-width': 1.5 }));
  const sw = sweat(k);
  return {
    update(t) {
      const look = easeInOut(seg(t, 0.4, 0.9)) * (1 - easeInOut(seg(t, 1.4, 1.8)));
      const c1 = hump(seg(t, 1.8, 2.2)), c2 = hump(seg(t, 2.3, 2.7)), lie = easeInOut(seg(t, 3.4, 4.2));
      P(b, { x: 100, y: MT + 12 + 6 * lie, armR: lerp(lerp(20, 150, look), 10, seg(t, 1.6, 1.9)), armL: 14, lean: -6 * lie + 6 * (c1 + c2), squash: 1 - 0.06 * (c1 + c2),
        look: t > 2.8 && t < 3.6 ? 0.9 : 0.2, mood: c1 + c2 > 0.2 ? 'open' : 'sad', blink: t > 3.8 ? 0.7 : 0.35 });
      hold(k, b, S, th, 'R', -150);
      th.setAttribute('opacity', t < 1.9 ? 1 : 0);
      hot(seg(t, 0.8, 1.1) * (1 - seg(t, 1.5, 1.7)), 172, MT - 120);
      tf(ice, b.state.x - 2, MT + 12 - 92 * S + 2 * lie, -6 * lie, 1);
      cough.forEach((c, i) => { const q = seg(t, 1.9 + (i % 2) * 0.5, 2.4 + (i % 2) * 0.5); k.set(c, { cx: 140 + q * 22 + i * 4, cy: MT - 56 - i * 5, opacity: hump(q) }); });
      sw((t * 0.7) % 1, 76, MT - 70);
      kids.forEach((p, i) => { const xf = path([[2.4 + i * 0.3, 380], [4.4, 250]]), w = walkTo(xf, t, 380, -1); P(p, { x: w.x, y: 122, walk: w.walk, facing: -1, armL: w.armL, armR: w.armR, mood: 'grin' }); });
    }
  };
}
