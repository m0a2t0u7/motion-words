// turn down：差し出された「OFFER」の封筒を、首を振り手のひらを向けて丁寧に断り、封筒は相手の手元へ戻る（例文 She turned down the job offer.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '差し出される'], [1.3, '首を振る'], [2.6, '断った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 164, y: 34, width: 72, height: 54, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 200, y1: 34, x2: 200, y2: 88, stroke: '#FFFFFF', 'stroke-width': 4 });
  el('ellipse', { cx: 200, cy: 262, rx: 190, ry: 18, fill: '#FBE3D8' });
  el('rect', { x: 20, y: 200, width: 18, height: 36, rx: 5, fill: pal.coral });
  el('ellipse', { cx: 24, cy: 188, rx: 8, ry: 20, fill: pal.green, transform: 'rotate(-18 24 188)' });
  el('ellipse', { cx: 36, cy: 186, rx: 8, ry: 22, fill: '#7ADBA0', transform: 'rotate(16 36 186)' });

  const S = 0.95;
  const A = k.buddy({ x: 96, y: FY, scale: S, facing: 1, color: pal.coral, dark: pal.coralDark });
  const B = k.buddy({ x: 296, y: FY, scale: S, facing: -1 });
  // 封筒
  const env = g({});
  el('rect', { x: -22, y: -14, width: 46, height: 31, rx: 4, fill: 'rgba(40,52,70,0.14)' }, env);
  el('rect', { x: -23, y: -16, width: 46, height: 31, rx: 4, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, env);
  el('path', { d: 'M -23 -14 L 0 3 L 23 -14', stroke: pal.sub, 'stroke-width': 2, fill: 'none', 'stroke-linejoin': 'round' }, env);
  el('rect', { x: -14, y: 5, width: 28, height: 8, rx: 2, fill: pal.yellow }, env);
  k.text(0, 9.3, 'OFFER', { 'font-size': 7.4, fill: pal.ink }, env);
  // 断りの吹き出し（✕）
  const no = g({});
  el('circle', { cx: 0, cy: 0, r: 15, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, no);
  el('path', { d: 'M -6 -6 L 6 6 M 6 -6 L -6 6', stroke: pal.red, 'stroke-width': 4, 'stroke-linecap': 'round' }, no);

  return {
    update(t) {
      // 差し出す側
      const step = easeInOut(seg(t, 0.3, 1.0)), back = easeInOut(seg(t, 2.4, 3.1));
      const ax = lerp(lerp(96, 150, step), 124, back);
      const aArm = lerp(8, 90, easeOut(seg(t, 0.4, 1.0))) - 46 * easeInOut(seg(t, 2.5, 3.1));
      A.pose({
        x: ax, armR: aArm, armL: 8, walk: step > 0 && step < 1 ? (t - 0.3) * 11 : 0,
        lean: -5 * hump(seg(t, 2.4, 3.2)) + 3 * (1 - back) * (t > 1 ? 0 : 0),
        mood: t < 2.5 ? 'smile' : 'sad', look: 0.4
      });
      const hp = A.handPos('R');
      tf(env, hp.x + 15, hp.y - 4, lerp(-4, -14, back));
      // 受け取らない側
      const raise = easeOut(seg(t, 1.2, 1.65)), shk = hump(seg(t, 1.45, 2.5));
      const push = hump(seg(t, 2.3, 3.4));
      const sx = 296 - 10 * push;
      const sh = Math.sin((t - 1.45) * 15);
      B.pose({
        x: sx, armR: lerp(8, 92, raise), armL: 8,
        lean: sh * 6 * shk + 4 * push,
        look: sh * shk * 1.0,
        mood: t < 1.1 ? 'open' : t < 3.1 ? 'flat' : 'smile',
        squash: 1
      });
      const ns = Math.max(0.001, backOut(seg(t, 1.55, 1.9), 1.6));
      tf(no, 296 + 6, FY - 112, 0, ns, ns);
    }
  };
}
