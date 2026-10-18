// leave alone：疲れて眠る相手に、遊ぼうとボールを持って近づくが、手を止め、そっと離れていく（例文 Leave him alone. He is tired.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { hp, gait } from './dig.js';

export const meta = { duration: 4.6, beats: [[0, '疲れている'], [1.8, '手を止める'], [3.6, 'そっとしておく']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  el('rect', { x: 260, y: 50, width: 90, height: 66, rx: 6, fill: '#F6D3B8', stroke: '#fff', 'stroke-width': 5 });
  // ソファ
  k.shadow(110, FY, 90, 5);
  el('rect', { x: 26, y: 160, width: 170, height: 46, rx: 14, fill: pal.violet });
  el('rect', { x: 20, y: 190, width: 182, height: 34, rx: 12, fill: '#B9A3F7' });
  el('rect', { x: 34, y: 224, width: 8, height: 12, fill: pal.woodDark }); el('rect', { x: 180, y: 224, width: 8, height: 12, fill: pal.woodDark });
  const C = k.buddy({ x: 110, y: 196, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  C.g.children[0].setAttribute('opacity', 0);
  const zz = [0, 1, 2].map((i) => k.text(0, 0, 'z', { 'font-size': 12 + i * 4, fill: pal.sub }));
  const S = 0.95;
  const A = k.buddy({ x: 420, y: FY, scale: S, facing: -1 });
  const ball = g({}); el('circle', { r: 11, fill: pal.yellow }, ball); el('path', { d: 'M -11 0 Q 0 -6 11 0', stroke: '#fff', 'stroke-width': 3, fill: 'none' }, ball);
  const xf = (t) => t < 2.6 ? lerp(420, 250, easeOut(seg(t, 0.2, 1.6))) : lerp(250, 360, easeInOut(seg(t, 2.9, 4.4)));
  return {
    update(t) {
      const br = Math.sin(t * 2.2);
      C.pose({ armL: 6, armR: 6, lean: -8 + br, squash: 0.94 + 0.02 * br, blink: 1, mood: 'flat' });
      zz.forEach((z, i) => { const q = ((t * 0.5 + i / 3) % 1); tf(z, 130 + 14 * q + i * 4, 104 - 40 * q); z.setAttribute('opacity', hump(q)); });
      const p = gait(xf, t, 420, 10, t > 2.6 ? 0.18 : 0.107);
      const reachOut = easeInOut(seg(t, 1.5, 1.9)) * (1 - easeInOut(seg(t, 2.1, 2.5)));
      const tip = t > 2.8 ? 1 : 0;
      A.pose({ x: p.x, walk: p.walk * (tip ? 0.6 : 1), armR: lerp(lerp(60, 95, reachOut), 40, seg(t, 2.1, 2.5)), armL: lerp(p.armL, 70, tip * seg(t, 2.6, 2.9)), lean: p.lean + 10 * reachOut - 6 * seg(t, 2.1, 2.4) * (1 - seg(t, 2.6, 2.9)),
        facing: -1, look: t > 2.0 ? 0.3 : 0.7, mood: t < 1.6 ? 'grin' : t < 2.6 ? 'open' : 'flat', lift: tip ? 3 * Math.abs(Math.sin(p.walk)) : 0, squash: tip ? 0.97 : 1 });
      const h = hp(A, S, 'R');
      tf(ball, h.x - 4, h.y + 2);
    }
  };
}
