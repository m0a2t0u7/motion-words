// library：図書館のカウンターで、司書が本にスタンプを押して手渡し、借りた本を胸に抱える（例文 I borrowed this book from the library.）
// 共有：bookshelf（本棚）、book（本）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, signBoard, twinkle, pop } from './restaurant.js';
import { room } from './dig.js';

export function bookshelf(k, x, y, w, h, rows = 3) {
  const { el, pal } = k, cols = ['#E57B6E', '#6AA8F7', '#FFCF5C', '#59C27A', '#A58BF3', '#F2A65A'];
  el('rect', { x, y, width: w, height: h, rx: 3, fill: pal.woodDark });
  const rh = (h - 8) / rows;
  for (let r = 0; r < rows; r++) {
    const by = y + 4 + r * rh;
    el('rect', { x: x + 4, y: by, width: w - 8, height: rh - 4, fill: '#8E6A45' });
    for (let bx = x + 6, i = r * 3; bx < x + w - 12; i++) { const bw = 7 + (i * 7) % 6, bh = rh - 8 - (i * 5) % 9; el('rect', { x: bx, y: by + rh - 4 - bh, width: bw, height: bh, rx: 1, fill: cols[i % cols.length] }); bx += bw + 1.5; }
  }
}
// 本（原点＝中心）
export function book(k, parent, c = '#6AA8F7', dark = '#4A8BE0') {
  const g = k.g({}, parent);
  k.el('rect', { x: -15, y: -11, width: 30, height: 22, rx: 2, fill: c, stroke: dark, 'stroke-width': 2 }, g);
  k.el('rect', { x: -15, y: -11, width: 5, height: 22, fill: dark }, g);
  k.el('rect', { x: -4, y: -5, width: 14, height: 4, rx: 1, fill: '#fff', opacity: 0.7 }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'カウンターで'], [1.3, '本を借りる'], [3.0, 'この本']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  const R = room(k);
  el('rect', { x: 0, y: 0, width: 400, height: 196, fill: '#F3EEE6' });
  bookshelf(k, 14, 40, 120, 156); bookshelf(k, 266, 40, 120, 156);
  signBoard(k, 200, 34, 110, 24, 'LIBRARY', '#7F63D6', '#fff', 12);
  const lib = k.buddy({ x: 228, y: 214, scale: 0.9, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 司書の眼鏡
  [-10, 10].forEach((x) => el('circle', { cx: x, cy: -54, r: 7, fill: 'none', stroke: pal.ink, 'stroke-width': 2 }, lib.body.children[3]));
  R.front();
  const stamp = g({}); el('rect', { x: -5, y: -16, width: 10, height: 12, rx: 3, fill: pal.woodDark }, stamp); el('rect', { x: -8, y: -4, width: 16, height: 6, rx: 1, fill: pal.red }, stamp);
  const me = k.buddy({ x: 132, y: FY + 20, scale: 1.1, facing: 1 });
  const bk = book(k);
  const mark = el('rect', { x: -4, y: -1, width: 9, height: 8, rx: 1, fill: pal.red, opacity: 0 }, bk);
  const sp = [0, 1, 2].map(() => twinkle(k));
  const B0 = { x: 200, y: 190 };
  return {
    update(t) {
      // 司書：左手でスタンプ（0.5-1.1）、右手で本を差し出す（1.3-2.0）
      const st = hump(seg(t, 0.5, 1.1)), hit = t > 0.8;
      const give = easeInOut(seg(t, 1.3, 2.0)), back = easeInOut(seg(t, 2.3, 2.7));
      P(lib, { lean: 8, look: 0.6, mood: 'smile', blink: blinkAt(t, 1) });
      lib.pose({ armL: reach(lib, 0.9, 'L', B0.x + 2, B0.y - 18 + 14 * st) });
      const sl = hp(lib, 0.9, 'L', 24); tf(stamp, sl.x, sl.y + 6);
      stamp.setAttribute('opacity', t < 1.3 ? 1 : 0);
      mark.setAttribute('opacity', hit ? 1 : 0);
      const H = { x: lerp(B0.x, 190, give), y: lerp(B0.y, 176, give) };
      const take = easeInOut(seg(t, 1.6, 2.1)), hug = easeInOut(seg(t, 2.4, 3.0));
      P(me, { lean: 6 * take * (1 - hug), look: 0.5, mood: t > 2.8 ? 'grin' : 'smile', blink: blinkAt(t) });
      const chest = { x: me.state.x + 20, y: FY + 20 - 52 };
      const mt = t < 2.2 ? { x: lerp(me.state.x + 30, H.x - 10, take), y: lerp(FY + 10, H.y, take) } : { x: lerp(H.x - 10, chest.x, hug), y: lerp(H.y, chest.y, hug) };
      me.pose({ armR: reach(me, 1.1, 'R', mt.x, mt.y), armL: lerp(10, 60, hug) });
      lib.pose({ armR: t < 2.2 ? reach(lib, 0.9, 'R', lerp(B0.x + 8, H.x + 10, give), H.y) : lerp(reach(lib, 0.9, 'R', H.x + 10, H.y), 10, back) });
      const mh = hp(me, 1.1, 'R', 26);
      if (t < 1.3) tf(bk, B0.x, B0.y);
      else if (t < 2.1) { const lh = hp(lib, 0.9, 'R', 26); tf(bk, lh.x - 10, lh.y); }
      else tf(bk, mh.x + 4, mh.y, -8 * hug, 1 + 0.15 * hug);
      sp.forEach((s, i) => { const q = seg(t, 3.0 + i * 0.15, 4.4); tf(s, chest.x - 22 + i * 24, chest.y - 34 - (i % 2) * 10, 45 * q, pop(easeOut(seg(q, 0, 0.3)) * (0.7 + 0.3 * Math.sin(t * 9 + i)))); });
    }
  };
}
