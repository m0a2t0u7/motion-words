// transfer：電車の路線図で次の駅が乗り換え駅（青線と黄線が交わる）。まめは青い電車を降り、向かいの黄色い電車へ乗り換える（例文 There's a transfer at the next station.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, walk, path, popIn } from './vehicle.js';
import { train } from './subway.js';

export const meta = { duration: 4.4, beats: [[0, '次は乗り換え駅'], [1.6, '電車を降りる'], [2.8, '黄色い線へ']] };

export function create(k) {
  const { el, g, pal } = k;
  const PY = 236;
  k.backdrop({ floorY: PY, mood: 'indoor' });
  // 路線図（上）
  el('rect', { x: 40, y: 18, width: 320, height: 80, rx: 8, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('line', { x1: 60, y1: 58, x2: 340, y2: 58, stroke: pal.blue, 'stroke-width': 7 });
  el('line', { x1: 230, y1: 26, x2: 230, y2: 90, stroke: pal.yellow, 'stroke-width': 7 });
  [90, 160, 300].forEach((x) => el('circle', { cx: x, cy: 58, r: 7, fill: '#fff', stroke: pal.blue, 'stroke-width': 3 }));
  const hub = el('circle', { cx: 230, cy: 58, r: 11, fill: '#fff', stroke: pal.ink, 'stroke-width': 4 });
  const dot = el('circle', { r: 6, fill: pal.red });
  // 青い電車（左）と黄色い電車（右）
  const blue = train(k, pal.blue, pal.blueDark, 1, [pal.mint, pal.mintDark]); blue.set(100, PY - 2, 1.15);
  const yel = train(k, pal.yellow, pal.yellowDark, 1, [pal.mint, pal.mintDark]); yel.set(320, PY - 2, 1.15);
  el('rect', { x: 0, y: PY, width: 400, height: 64, fill: '#E6EAF0' }); el('rect', { x: 0, y: PY, width: 400, height: 6, fill: pal.yellow });
  const me = k.buddy({ x: 112, y: PY + 30, scale: 0.8 });
  const X = path([[1.6, 112], [3.4, 296]]);
  return {
    update(t) {
      const d = easeInOut(seg(t, 0.2, 1.4));
      k.set(dot, { cx: lerp(160, 230, d), cy: 58 });
      k.set(hub, { r: 11 + 3 * Math.abs(Math.sin(t * 5)) * (t > 1.2 && t < 2.6 ? 1 : 0) });
      const out = seg(t, 1.5, 1.9), inn = seg(t, 3.4, 3.8);
      walk(me, X, t, { y: PY + 30 - 30 * (1 - out) - 30 * inn, mood: 'smile', look: 0.6, blink: blinkAt(t) });
      me.g.setAttribute('display', t < 1.5 || t > 3.8 ? 'none' : 'inline');
      blue.b.g.setAttribute('display', t < 1.5 ? 'inline' : 'none'); yel.b.g.setAttribute('display', t > 3.8 ? 'inline' : 'none');
      blue.b.pose({ look: 0.6, mood: 'open', blink: blinkAt(t) }); yel.b.pose({ look: 0.6, mood: 'grin' });
      void g; void popIn; void hump; void easeOut;
    }
  };
}
