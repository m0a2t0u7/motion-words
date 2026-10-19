// customs：税関の緑のレーン（申告なし）。職員がスーツケースをちらっと見てすぐ手で「どうぞ」と通し、まめはさっと通り抜ける（例文 We went through customs quickly.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, hall, suitcase, pullCase, path, walk, deskFront, mark, popIn } from './vehicle.js';

export const meta = { duration: 4.0, beats: [[0, '税関へ'], [1.3, 'すぐにどうぞ'], [2.4, 'さっと通過']] };

export function create(k) {
  const { el, g, pal } = k;
  const FY = 236;
  hall(k, FY, { win: false });
  // 緑のレーン（申告なし）と赤のレーン
  el('rect', { x: 140, y: 30, width: 120, height: 40, rx: 6, fill: pal.green });
  const ic = suitcase(k, '#fff', '#fff'); k.tf(ic, 166, 34, 0, 0.42); el('path', { d: 'M 200 50 l 8 8 l 16 -16', stroke: '#fff', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' });
  el('rect', { x: 0, y: FY, width: 400, height: 64, fill: '#D6F0DD' });
  el('rect', { x: 300, y: 80, width: 100, height: FY - 80, fill: '#E3EAF0' }); el('rect', { x: 320, y: 100, width: 70, height: FY - 100, fill: '#BFE3C8' }); // 出口
  const off = k.buddy({ x: 200, y: FY - 30, scale: 0.8, facing: -1, color: pal.blue, dark: pal.blueDark });
  el('path', { d: 'M -28 -76 Q 0 -96 28 -76 L 32 -72 L -28 -72 Z', fill: pal.blueDark }, off.body);
  deskFront(k, 160, 80, FY - 54, FY, '#C9D1DC', '#9AA5B4');
  const me = k.buddy({ x: -40, y: FY + 10, scale: 0.86 });
  const cs = suitcase(k, pal.coral, pal.coralDark);
  const X = path([[0, -40], [1.1, 110], [1.7, 112], [3.2, 360]]);
  const lines = [0, 1, 2].map(() => el('line', { stroke: pal.sub, 'stroke-width': 3, 'stroke-linecap': 'round' }));
  return {
    update(t) {
      walk(me, X, t, { mood: t > 1.5 ? 'grin' : 'smile', look: 0.6, blink: blinkAt(t), armL: 30 });
      pullCase(k, cs, { x: me.state.x - 28, y: me.state.y - 48 }, FY + 16, 0.85, -1);
      const v = Math.abs(X(t + 0.02) - X(t - 0.02)) / 0.04;
      lines.forEach((l, i) => { const x = me.state.x - 70 - i * 6; k.set(l, { x1: x, y1: FY - 60 + i * 14, x2: x - 26, y2: FY - 60 + i * 14, opacity: t > 1.8 && t < 3.2 ? Math.min(1, v / 160) : 0 }); });
      const wave = easeOut(seg(t, 1.2, 1.5)) * (1 - easeInOut(seg(t, 2.4, 2.8)));
      P(off, { x: 200, y: FY - 30, look: t < 1.2 ? -0.8 : 0.3, mood: 'smile', blink: blinkAt(t, 1), armR: 8 + 80 * wave + 10 * Math.sin(t * 10) * wave });
      off.body.children[3].setAttribute('transform', t > 0.9 && t < 1.3 ? 'translate(-4 6)' : 'translate(0 0)');
      void lerp; void hump; void g; void mark; void popIn;
    }
  };
}
