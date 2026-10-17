// go out：家のドアが開き、まめが外へ出て歩いていく（例文 I'm going out for a walk.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '家の中にいる'], [0.9, 'ドアから出る'], [2.1, '出かけていく']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236 });
  // 家
  const house = g({});
  el('rect', { x: 20, y: 96, width: 170, height: 140, rx: 6, fill: '#FBE9DC' }, house);
  el('path', { d: 'M 8 104 L 105 40 L 202 104 Z', fill: pal.coral, 'stroke-linejoin': 'round', stroke: pal.coral, 'stroke-width': 8 }, house);
  el('rect', { x: 36, y: 128, width: 40, height: 36, rx: 5, fill: '#CFE9F7' }, house);
  el('line', { x1: 56, y1: 128, x2: 56, y2: 164, stroke: '#FFFFFF', 'stroke-width': 3 }, house);
  // 戸口
  el('rect', { x: 96, y: 134, width: 62, height: 102, rx: 4, fill: '#56607A' }, house);
  el('rect', { x: 90, y: 230, width: 74, height: 8, rx: 3, fill: pal.woodDark }, house);
  // 道
  el('rect', { x: 160, y: FY, width: 240, height: 10, fill: '#E3E8EE' });

  const b = k.buddy({ x: 127, y: FY, scale: 0.8 });
  // ドア（左端が蝶番）
  const door = g({});
  const panel = g({}, door);
  el('rect', { x: 0, y: 0, width: 62, height: 102, rx: 4, fill: pal.blue }, panel);
  el('rect', { x: 8, y: 10, width: 46, height: 36, rx: 4, fill: '#FFFFFF', opacity: 0.25 }, panel);
  el('circle', { cx: 52, cy: 56, r: 4, fill: pal.yellow }, panel);
  el('rect', { x: 92, y: 130, width: 70, height: 6, rx: 3, fill: pal.coralDark });

  return {
    update(t) {
      // ドアが外側へ開く（横幅が縮んで見える）
      const op = easeInOut(seg(t, 0.15, 0.85));
      tf(door, 96, 134);
      tf(panel, 0, 0, 0, lerp(1, 0.16, op), 1);
      panel.setAttribute('opacity', 1);
      // 歩いて外へ
      const wp = seg(t, 0.9, 3.5);
      const x = lerp(127, 345, easeOut(wp) * 0.15 + wp * 0.85);
      const walking = t > 0.9 && t < 3.5;
      // ドアが開くまでは戸口の中に隠しておく（閉じたドアの下から足が見えないように）
      b.g.setAttribute('opacity', seg(t, 0.35, 0.6));
      b.pose({
        x,
        walk: walking ? (t - 0.9) * 9 : 0,
        armL: walking ? 8 + Math.sin((t - 0.9) * 9) * 18 : 0,
        armR: walking ? 8 - Math.sin((t - 0.9) * 9) * 18 : 0,
        look: 0.6,
        mood: 'smile',
        lean: walking ? 4 : 0
      });
    }
  };
}
