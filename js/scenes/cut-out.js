// cut out：はさみで紙の星の線にそって切り進み、星を切り抜いて持ち上げる（例文 She cut out a star from the paper.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';
import { hp, reach, frontL } from './dig.js';
import { grip } from './hand-over.js';
import { drawOn } from './work-on.js';

export const meta = { duration: 4.6, beats: [[0, '紙に星の線'], [1.6, '切り進む'], [3.8, '星が取れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 310, y: 56, width: 70, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  // 紙（イーゼルに立ててある）
  const PX = 244, PY = 136;
  el('rect', { x: PX - 4, y: PY + 54, width: 8, height: 46, fill: pal.woodDark });
  k.shadow(PX, 237, 30, 4);
  el('rect', { x: PX - 62, y: PY - 58, width: 124, height: 114, rx: 4, fill: pal.wood });
  el('rect', { x: PX - 54, y: PY - 50, width: 108, height: 98, fill: '#fff' });
  const pts = [];
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 17 : 40, a = (i * 36 - 90) * Math.PI / 180; pts.push([PX + r * Math.cos(a), PY + r * Math.sin(a)]); }
  const D = 'M ' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L ') + ' Z';
  const hole = el('path', { d: D, fill: pal.wood, opacity: 0 });
  el('path', { d: D, fill: 'none', stroke: pal.sub, 'stroke-width': 1.5, 'stroke-dasharray': '4 4' });
  const cutP = el('path', { d: D, fill: 'none', stroke: pal.ink, 'stroke-width': 2 });
  const cOn = drawOn(cutP);
  const S = 1.05;
  const b = k.buddy({ x: 120, y: 236, scale: S });
  const fl = frontL(b, S);
  const star = g({});
  el('path', { d: D, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 2, transform: `translate(${-PX} ${-PY})` }, star);
  // はさみ（原点＝支点、+x が刃先）
  const sc = g({});
  const bl1 = g({}, sc), bl2 = g({}, sc);
  el('path', { d: 'M 0 0 L 20 -3 L 0 2 Z', fill: '#B9C3D0', stroke: pal.sub, 'stroke-width': 1 }, bl1);
  el('circle', { cx: -9, cy: -5, r: 5, fill: 'none', stroke: pal.red, 'stroke-width': 3 }, bl1);
  el('path', { d: 'M 0 0 L 20 3 L 0 -2 Z', fill: '#B9C3D0', stroke: pal.sub, 'stroke-width': 1 }, bl2);
  el('circle', { cx: -9, cy: 5, r: 5, fill: 'none', stroke: pal.red, 'stroke-width': 3 }, bl2);
  el('circle', { r: 1.8, fill: pal.ink }, sc);
  const gR = grip(k, pal.mint, pal.mintDark, S);
  const L = cutP.getTotalLength();
  return {
    update(t) {
      const c = easeInOut(seg(t, 0.8, 3.6));
      cOn(c);
      const p = cutP.getPointAtLength(L * c);
      const done = t > 3.6;
      const lift = easeOut(seg(t, 3.8, 4.4));
      // 刃先が線の上。手ははさみの持ち手（刃先から左へ約 24）
      let tip = t < 0.8 ? { x: lerp(170, pts[0][0], easeInOut(seg(t, 0.2, 0.8))), y: lerp(210, pts[0][1], easeInOut(seg(t, 0.2, 0.8))) } : { x: p.x, y: p.y };
      if (done) tip = { x: lerp(p.x, 200, easeInOut(seg(t, 3.6, 3.9))), y: lerp(p.y, 214, easeInOut(seg(t, 3.6, 3.9))) };
      const hx = tip.x - 24, hy = tip.y + 2;
      const bx = lerp(120, 150, easeInOut(seg(t, 0.1, 0.8))) + (done ? 0 : (hx - 190) * 0.4);
      b.pose({ x: bx, lean: 6, look: 0.7, mood: done ? 'grin' : 'flat', armL: 10 });
      b.pose({ armR: reach(b, S, 'R', hx, hy) });
      fl.set(done ? lerp(60, 150, lift) : 40);
      const h = hp(b, S, 'R');
      const snip = Math.abs(Math.sin(t * 16)) * (t > 0.8 && t < 3.6 ? 1 : 0);
      tf(sc, h.x + 4, h.y, 0); tf(bl1, 0, 0, -12 * snip); tf(bl2, 0, 0, 12 * snip);
      gR(h);
      // 星：切り終わると左手で持ち上げる
      const hl = fl.pos();
      hole.setAttribute('opacity', done ? 1 : 0);
      tf(star, done ? lerp(PX, hl.x + 6, lift) : PX, done ? lerp(PY, hl.y - 26, lift) : PY, done ? -12 * lift : 0, done ? lerp(1, 0.75, lift) : 1);
    }
  };
}
