// jacket：電車を降りたまめが、座席に上着を置き忘れたことに気づき、取りに戻る（例文 He left his jacket on the train and had to go back.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { flat } from './shirt.js';
import { gait } from './dig.js';
import { mark } from './so-far-so-good.js';

export const meta = { duration: 4.2, beats: [[0, '電車を降りる'], [1.5, '上着がない！'], [2.6, '取りに戻る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: FY - 4, width: 400, height: 4, fill: pal.yellow });
  el('rect', { x: 250, y: 60, width: 6, height: FY - 60, fill: '#B8C2CF' });
  el('rect', { x: 236, y: 54, width: 140, height: 10, rx: 3, fill: '#C6CFDA' });
  el('rect', { x: 300, y: 76, width: 64, height: 22, rx: 4, fill: pal.blueDark });
  el('rect', { x: 308, y: 84, width: 30, height: 5, rx: 2, fill: '#fff' });
  // 電車の車両（左）
  const TR = g({});
  k.shadow(100, FY + 1, 120, 4, TR);
  el('rect', { x: -20, y: 84, width: 236, height: FY - 88, rx: 14, fill: '#F4F6F9', stroke: '#CBD3DE', 'stroke-width': 2 }, TR);
  el('rect', { x: -20, y: FY - 44, width: 236, height: 10, fill: pal.green }, TR);
  // 窓の中：座席と忘れた上着
  el('rect', { x: 14, y: 104, width: 112, height: 64, rx: 8, fill: '#CFE6F5' }, TR);
  el('rect', { x: 20, y: 140, width: 100, height: 24, rx: 6, fill: '#5C7FC4' }, TR);
  el('rect', { x: 20, y: 120, width: 100, height: 22, rx: 6, fill: '#6F90D2' }, TR);
  const jk = flat(k, 'jacket', pal.coral, pal.coralDark, TR, false);
  tf(jk, 70, 110, 0, 0.66);
  const ring = el('rect', { x: 46, y: 116, width: 48, height: 40, rx: 12, fill: 'none', stroke: pal.yellowDark, 'stroke-width': 3.5 }, TR);
  // 開いたドア
  el('rect', { x: 146, y: 96, width: 54, height: FY - 100, rx: 4, fill: '#7A8597' }, TR);
  el('rect', { x: 150, y: 100, width: 46, height: FY - 108, rx: 3, fill: '#C3CBD6' }, TR);
  const S = 0.95, b = k.buddy({ x: 172, y: FY - 2, scale: S });
  const bang = mark(k, 'bang', null, 1.6);
  const xf = (t) => t < 2.3 ? lerp(172, 300, easeInOut(seg(t, 0.15, 1.4))) : lerp(300, 178, easeInOut(seg(t, 2.6, 3.7)));
  return {
    update(t) {
      const p = gait(xf, t, 172, t > 2.6 ? 26 : 18, t > 2.6 ? 0.13 : 0.107);
      const pat = hump(seg(t, 1.45, 2.15)), turn = easeInOut(seg(t, 2.25, 2.55));
      const tap = -46 + 18 * Math.abs(Math.sin(seg(t, 1.5, 2.1) * Math.PI * 3));
      const fc = lerp(1, -1, turn), face = Math.sign(fc || 1) * Math.max(0.1, Math.abs(fc));
      b.pose({ x: p.x, walk: p.walk, facing: face, armR: lerp(p.armR, tap, pat), armL: p.armL, lean: p.lean * (t > 2.6 ? 2.5 : 1),
        look: t > 1.8 && t < 2.3 ? -0.9 : 0.4, mood: t < 1.5 ? 'smile' : t < 2.6 ? 'open' : 'flat', squash: 1 - 0.05 * hump(seg(t, 1.8, 2.1)) });
      const bp = seg(t, 1.8, 2.05);
      tf(bang, p.x + 6, FY - 112 - 4 * hump(seg(t, 1.8, 2.6)), 0, bp <= 0 ? 0.001 : 1.6 * backOut(bp));
      bang.setAttribute('opacity', t > 1.8 && t < 3.3 ? 1 - seg(t, 3.0, 3.3) : 0);
      ring.setAttribute('opacity', t > 1.9 ? 0.55 + 0.45 * Math.sin((t - 1.9) * 9) : 0);
    }
  };
}
