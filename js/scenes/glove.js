// glove：帰り道、片方の手袋がするっと落ちたまま気づかず家に着き、手を見て「ない！」（例文 I lost one glove on the way home.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';
import { wardrobe, gait, hp, P, blinkAt } from './skirt.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.4, beats: [[0, '帰り道'], [1.3, '手袋が落ちる'], [3.3, 'なくした']] };

const GC = '#F2685B', GD = '#C94B40';
export function create(k) {
  const { el, g, pal, tf } = k, S = 1.25;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  // 家（右）と街灯
  el('rect', { x: 300, y: 100, width: 110, height: FY - 100, fill: '#F3E6DC' });
  el('path', { d: 'M 290 106 L 360 58 L 430 106 Z', fill: pal.coral, stroke: pal.coral, 'stroke-width': 8, 'stroke-linejoin': 'round' });
  el('rect', { x: 330, y: 150, width: 50, height: FY - 150, rx: 3, fill: pal.blue });
  el('rect', { x: 312, y: 116, width: 22, height: 20, rx: 3, fill: '#FFE39A' });
  el('rect', { x: 118, y: 90, width: 5, height: FY - 90, fill: pal.sub });
  el('circle', { cx: 120, cy: 88, r: 10, fill: '#FFE39A' });
  el('circle', { cx: 120, cy: 88, r: 24, fill: '#FFE39A', opacity: 0.3 });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#E4E1E8' });
  const b = k.buddy({ x: 30, y: FY, scale: S });
  const W = wardrobe(k, b);
  W.top({ color: '#5E6E99', dark: '#46557C', sleeve: 'long', to: -12, collar: true });
  W.bottom({ kind: 'trousers', color: '#3F4656', dark: '#2E3440', from: -12 });
  W.feet('shoe', pal.ink);
  W.glove('L', GC, GD);
  const gR = W.glove('R', GC, GD);
  // 落ちる手袋（道に残る）
  const drop = g({});
  el('rect', { x: -8, y: -12, width: 16, height: 5, rx: 2, fill: GD }, drop);
  el('path', { d: 'M -7 -8 Q -8 4 0 5 Q 8 4 7 -8 Z', fill: GC }, drop);
  el('ellipse', { cx: 7, cy: -4, rx: 3, ry: 4.5, fill: GC, transform: 'rotate(-30 7 -4)' }, drop);
  const dsh = k.shadow(0, 0, 10, 2.5);
  const ex = mark(k, 'bang', k.root, 1.4);
  const xf = (t) => lerp(30, 280, easeInOut(seg(t, 0.1, 3.1)));
  const TD = 1.3;
  return {
    update(t) {
      const p = gait(xf, t, 30);
      const look = easeOut(seg(t, 3.2, 3.5));
      P(b, { x: p.x, walk: p.walk, lean: p.lean, armL: p.armL, armR: t < 3.2 ? p.armR : lerp(p.armR, 75, look), look: t < 3.3 ? 0.3 : lerp(0.3, -0.8, easeOut(seg(t, 3.7, 4.0))),
        mood: t > 3.3 ? 'open' : 'smile', blink: blinkAt(t) });
      gR.setAttribute('display', t < TD ? 'inline' : 'none');
      // 落ちた瞬間の手の位置から、地面へ落ちて止まる
      const h0 = (() => { const st = { ...b.state }; return st; })();
      void h0;
      let x, y, r;
      if (t < TD) { const h = hp(b, S, 'R', 32); x = h.x; y = h.y; r = 0; }
      else {
        const f = seg(t, TD, TD + 0.45);
        const sx = xf(TD) + 30, sy = FY - 40;
        x = sx + 10 * f; y = lerp(sy, FY + 4, easeIn(f)) - 3 * Math.abs(wobble(seg(t, TD + 0.45, TD + 1), 2, 6)); r = 90 * easeOut(f);
      }
      tf(drop, x, y, r, S);
      drop.setAttribute('opacity', t < TD ? 0 : 1);
      k.set(dsh, { cx: x, cy: FY + 6, opacity: t > TD ? seg(t, TD, TD + 0.45) : 0 });
      tf(ex, p.x + 30, FY - 130, 0, t > 3.3 ? easeOut(seg(t, 3.3, 3.6)) * 1.4 : 0.001);
    }
  };
}
