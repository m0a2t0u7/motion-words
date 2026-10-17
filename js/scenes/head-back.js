// head back：山へ向かって歩いていた2人が、日が傾いたのでUターンして帰る（例文 It's getting dark, so let's head back.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '山へ進んでいる'], [1.7, '日が傾く'], [3.2, '引き返す']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240 });
  const sky = el('rect', { x: 0, y: 0, width: 400, height: 240, fill: '#F7B58E', opacity: 0 });
  const sun = el('circle', { cx: 130, r: 22, fill: pal.yellow });
  // 山（右）と家（左）は静止
  el('path', { d: 'M 230 240 L 320 96 L 410 240 Z', fill: '#B9C7D8' });
  el('path', { d: 'M 296 128 L 320 96 L 344 128 L 330 122 L 320 132 L 309 121 Z', fill: '#fff' });
  el('path', { d: 'M 170 240 L 240 150 L 310 240 Z', fill: '#C9D6C3' });
  el('rect', { x: 0, y: 150, width: 56, height: 90, rx: 4, fill: '#FBE9DC' });
  el('path', { d: 'M -8 156 L 28 120 L 66 156 Z', fill: pal.coral });
  el('rect', { x: 20, y: 192, width: 22, height: 48, rx: 3, fill: pal.blue });
  const lamp = el('circle', { cx: 46, cy: 176, r: 7, fill: pal.yellow, opacity: 0 });
  el('rect', { x: 0, y: FY, width: 400, height: 8, fill: '#E3E8EE' });
  const dusk = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#5B4A92', opacity: 0 });
  const S = 0.9;
  const a = k.buddy({ x: 160, y: FY + 6, scale: S });
  const c = k.buddy({ x: 96, y: FY + 6, scale: S, color: pal.coral, dark: pal.coralDark });
    const bub = g({});
  el('rect', { x: -24, y: -16, width: 48, height: 30, rx: 12, fill: '#fff', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('path', { d: 'M -6 14 L 0 24 L 6 14 Z', fill: '#fff' }, bub);
  k.text(0, -2, '!', { 'font-size': 20, fill: pal.red }, bub);
  return {
    update(t) {
      const dim = easeInOut(seg(t, 0.8, 3.4));
      sky.setAttribute('opacity', dim * 0.9);
      dusk.setAttribute('opacity', dim * 0.26);
      k.set(sun, { cy: lerp(80, 218, easeIn3(seg(t, 0.2, 3.6))) });
      lamp.setAttribute('opacity', seg(t, 2.8, 3.6));
      // 進む → 止まる → 振り返る → 戻る
      const fwd = easeOut(seg(t, 0, 1.5)) * 0.35 + seg(t, 0, 1.5) * 0.65;
      const xa = t < 3.0 ? lerp(160, 250, fwd) : lerp(250, 150, easeInOut(seg(t, 3.0, 4.6)) * 0.6 + seg(t, 3.0, 4.6) * 0.4);
      const moving = t < 1.5 || t > 3.0;
      const turn = t > 2.5;
      const w = moving ? (t < 1.5 ? t * 9 : t * 9) : 0;
      const look = hump(seg(t, 1.5, 2.2));
      a.pose({ x: xa, walk: w, facing: turn ? -1 : 1, armR: moving ? 8 + Math.sin(w) * 20 : 8 + 150 * look * (t < 2.5 ? 1 : 0), armL: moving ? 8 - Math.sin(w) * 20 : 8, look: t > 1.5 && t < 2.5 ? -0.2 : 0.5,
        mood: t > 1.6 && t < 3.0 ? 'open' : 'smile', lean: moving ? 3 : 0 });
      const xc = t < 3.0 ? lerp(96, 186, fwd) : lerp(186, 84, easeInOut(seg(t, 3.15, 4.6)) * 0.6 + seg(t, 3.15, 4.6) * 0.4);
      const movC = t < 1.5 || t > 3.15;
      c.pose({ x: xc, walk: movC ? w + 1 : 0, facing: t > 2.7 ? -1 : 1, armR: movC ? 8 - Math.sin(w) * 20 : 8, armL: movC ? 8 + Math.sin(w) * 20 : 8, look: 0.4,
        mood: t > 3.0 ? 'sad' : 'smile', lean: movC ? 3 : 0 });
      tf(bub, xa + 6, FY - 100, 0, 1.3 * seg(t, 1.6, 1.9), 1.3 * seg(t, 1.6, 1.9));
      bub.setAttribute('opacity', t > 1.6 && t < 3.0 ? 1 : 0);
    }
  };
}
const easeIn3 = (p) => p * p * (3 - 2 * p);
