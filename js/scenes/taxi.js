// taxi：歩道で手を上げてタクシーを止め、2人で乗り込み、駅へ向かう（例文 Let's take a taxi to the station.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { road, auto, P, blinkAt, cue, path, gait } from './vehicle.js';

export const meta = { duration: 4.4, beats: [[0, 'タクシーを呼ぶ'], [1.6, '乗り込む'], [3.2, '駅に着く']] };

export function station(k, x, FY, w = 120) {
  const { el, pal } = k;
  el('rect', { x, y: FY - 104, width: w, height: 104, fill: '#E8E2F4' });
  el('path', { d: `M ${x - 8} ${FY - 104} L ${x + w / 2} ${FY - 130} L ${x + w + 8} ${FY - 104} Z`, fill: pal.violet });
  el('circle', { cx: x + w / 2, cy: FY - 112, r: 9, fill: '#fff', stroke: pal.ink, 'stroke-width': 2 });
  el('rect', { x: x + 12, y: FY - 94, width: w - 24, height: 20, rx: 4, fill: pal.blue });
  // 電車の絵（看板）
  el('rect', { x: x + w / 2 - 14, y: FY - 92, width: 28, height: 15, rx: 4, fill: '#fff' });
  el('rect', { x: x + w / 2 - 10, y: FY - 89, width: 8, height: 5, fill: pal.blue }); el('rect', { x: x + w / 2 + 2, y: FY - 89, width: 8, height: 5, fill: pal.blue });
  el('rect', { x: x + 20, y: FY - 62, width: w - 40, height: 62, fill: '#CFE3F2', stroke: '#fff', 'stroke-width': 3 });
}

export function create(k) {
  const { pal } = k;
  const FY = 196, GY = road(k, FY);
  station(k, 300, FY, 96);
  const taxi = auto(k, { kind: 'taxi', color: pal.yellow, dark: pal.yellowDark, driver: { color: pal.blue, dark: pal.blueDark }, ds: 0.5, riders: [[-4, pal.mint, pal.mintDark]] });
  taxi.d.state.x = 22; taxi.d.pose({ x: 24 });
  const me = k.buddy({ x: 150, y: FY + 10, scale: 0.72 });
  const fr = k.buddy({ x: 106, y: FY + 10, scale: 0.72, color: pal.coral, dark: pal.coralDark });
  const lets = cue(k, '', 40, 30, -1);
  // 駅の絵を吹き出しに
  k.el('rect', { x: -12, y: -7, width: 24, height: 14, rx: 4, fill: pal.blue }, lets.g); k.el('rect', { x: -8, y: -4, width: 7, height: 5, fill: '#fff' }, lets.g); k.el('rect', { x: 1, y: -4, width: 7, height: 5, fill: '#fff' }, lets.g);
  const S = 1.15;
  const X = path([[0.4, -100], [1.5, 160], [2.6, 160], [3.9, 296]]);
  return {
    update(t) {
      const x = X(t), br = hump(seg(t, 1.2, 1.7)) + hump(seg(t, 3.6, 4.1));
      taxi.set(x, GY, x * 3, 0, -br * 1.5, S);
      taxi.d.pose({ x: 24, look: t > 1.5 && t < 2.5 ? -0.8 : 0.6, blink: blinkAt(t, 1) });
      const inside = t > 2.15;
      taxi.ppl[0].g.setAttribute('display', inside ? 'inline' : 'none');
      taxi.ppl[0].pose({ look: 0.8, mood: 'grin' });
      // 歩道で：友だちが駅を指し、まめが手を上げる → 車の位置へ歩いて乗る
      const go = seg(t, 1.7, 2.15);
      const raise = easeOut(seg(t, 0.3, 0.7)) * (1 - easeInOut(seg(t, 1.5, 1.8)));
      P(me, { x: lerp(150, 168, go), y: FY + 10 + 26 * go * go, walk: go * 5, armR: 8 + 160 * raise + 8 * Math.sin(t * 14) * raise, mood: raise > 0.3 ? 'open' : 'grin', look: 0.6, blink: blinkAt(t) });
      P(fr, { x: lerp(106, 150, go), y: FY + 10 + 26 * go * go, walk: go * 5, armR: 8 + 82 * hump(seg(t, 0.1, 1.4)), mood: 'smile', look: 0.6, blink: blinkAt(t, 1.1) });
      [me, fr].forEach((b) => b.g.setAttribute('display', inside ? 'none' : 'inline'));
      lets.show(seg(t, 0.15, 0.5) * (1 - seg(t, 1.3, 1.5)), 100, FY - 66);
      void clamp; void gait;
    }
  };
}
