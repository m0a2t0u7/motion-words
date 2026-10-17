// the ball is in your court：自分の提案を打ち返したまめ。ボールが相手のコートに入り、次は相手が決める番（例文 I made my offer. The ball is in your court.）
import { seg, lerp, easeInOut, easeOut, easeIn, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '打ち返す'], [1.4, '相手のコートへ'], [2.8, '次はあなたの番']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 214, mood: 'outdoor' });
  // コート
  el('rect', { x: 0, y: FY, width: 200, height: 86, fill: '#CFEBD4' });
  el('rect', { x: 200, y: FY, width: 200, height: 86, fill: '#F6DCCB' });
  el('line', { x1: 0, y1: FY + 4, x2: 400, y2: FY + 4, stroke: '#fff', 'stroke-width': 3 });
  el('line', { x1: 0, y1: 286, x2: 400, y2: 286, stroke: '#fff', 'stroke-width': 3 });
  // ネット
  el('rect', { x: 197, y: FY - 44, width: 6, height: 52, fill: pal.sub });
  el('rect', { x: 188, y: FY - 44, width: 24, height: 38, rx: 2, fill: '#fff', opacity: 0.6, stroke: pal.sub, 'stroke-width': 1.5 });
  const A = k.buddy({ x: 92, y: FY + 18, scale: 1.0 });
  const B = k.buddy({ x: 316, y: FY + 18, scale: 1.0, facing: -1, color: pal.coral, dark: pal.coralDark });
  const racket = g({});
  el('line', { x1: 0, y1: 0, x2: 0, y2: 26, stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' }, racket);
  el('ellipse', { cx: 0, cy: 40, rx: 11, ry: 14, fill: 'none', stroke: pal.ink, 'stroke-width': 3.5 }, racket);
  const ball = g({});
  el('circle', { r: 8, fill: pal.yellow, stroke: pal.yellowDark, 'stroke-width': 1.5 }, ball);
  el('path', { d: 'M -7 -3 Q 0 2 7 -3', fill: 'none', stroke: '#fff', 'stroke-width': 1.6 }, ball);
  const ring = el('circle', { r: 14, fill: 'none', stroke: pal.coralDark, 'stroke-width': 3 });
  const q = k.text(0, 0, '?', { 'font-size': 26, fill: pal.sub });
  const foot = el('path', { d: 'M 0 0', fill: 'none' });
  return {
    update(t) {
      const hit = 0.9, land = 2.0;
      const sw = t < hit ? lerp(150, 160, easeOut(seg(t, 0.3, 0.7))) : lerp(160, 80, easeIn(seg(t, hit - 0.15, hit))) ;
      let a = 120;
      if (t < hit - 0.15) a = lerp(100, 150, easeOut(seg(t, 0.1, 0.7)));
      else if (t < hit) a = lerp(150, 85, easeIn(seg(t, hit - 0.15, hit)));
      else a = lerp(85, 60, easeOut(seg(t, hit, hit + 0.4)));
      A.pose({
        armR: a, armL: 8, lean: t < hit ? lerp(-4, 8, seg(t, hit - 0.15, hit)) : 4,
        mood: t < 2.8 ? 'smile' : 'smile', look: 0.9
      });
      const hp = A.handPos('R');
      tf(racket, hp.x, hp.y, -a - 0);
      // ボール
      let bx, by;
      if (t < hit) { bx = hp.x + 20; by = hp.y + 40 * 0 - 30 - 30 * (1 - seg(t, 0, hit)); by = lerp(FY - 120, hp.y, easeIn(seg(t, 0.1, hit))); bx = lerp(hp.x + 18, hp.x + 26, seg(t, 0, hit)); }
      else if (t < land) { const p = seg(t, hit, land); bx = lerp(hp.x + 26, 300, easeOut(p) * 0.6 + p * 0.4); by = lerp(hp.y, FY + 28, p) - Math.sin(p * Math.PI) * 90; }
      else { const p = seg(t, land, land + 0.7); bx = 300 + 12 * easeOut(p); by = FY + 28 - 18 * Math.abs(wobble(p, 1.5, 4)); }
      tf(ball, bx, by, t * 200);
      // 相手：見て、ボールに気づいて考える
      const notice = seg(t, 2.0, 2.5);
      B.pose({
        look: t < 1.4 ? -0.3 : 0.1 - 0.6 * notice, lean: 5 * notice, mood: t < 2.8 ? 'smile' : 'flat',
        armR: t < 2.6 ? 8 : lerp(8, 160, easeOut(seg(t, 2.6, 3.2))), armL: 8, squash: 1 - 0.03 * hump(seg(t, 2.0, 2.4))
      });
      // 光る輪と？
      const rp = seg(t, land, land + 0.9);
      tf(ring, 312, FY + 28, 0, 1 + rp * 0.4);
      ring.setAttribute('opacity', rp > 0 ? 1 - rp * 0.2 : 0);
      const qp = backOut(seg(t, 2.5, 3.0), 2);
      tf(q, 316, FY - 90, 0, qp, qp);
      q.setAttribute('opacity', t < 2.5 ? 0 : 1);
    }
  };
}
