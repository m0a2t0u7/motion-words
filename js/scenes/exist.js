// exist：夜の部屋でおばけの影におびえるが、明かりをつけるとハンガーの白いシーツだった。おばけはいない（例文 Ghosts do not exist.）
import { seg, lerp, easeInOut, easeOut, hump, wobble, backOut } from '../ease.js';
import { hp, reach } from './dig.js';
import { P, blinkAt } from './run-after.js';
import { drop } from './so-far-so-good.js';

// おばけの形（中心原点）
export function ghostShape(k, parent, fill) {
  const g = k.g({}, parent), pal = k.pal;
  k.el('path', { d: 'M -18 22 L -18 -6 Q -18 -26 0 -26 Q 18 -26 18 -6 L 18 22 L 12 16 L 6 22 L 0 16 L -6 22 L -12 16 Z', fill: fill || '#fff', stroke: pal.line, 'stroke-width': 1.5 }, g);
  k.el('ellipse', { cx: -6, cy: -8, rx: 3, ry: 4, fill: pal.ink }, g);
  k.el('ellipse', { cx: 6, cy: -8, rx: 3, ry: 4, fill: pal.ink }, g);
  return g;
}

export const meta = { duration: 4.4, beats: [[0, 'おばけ？'], [1.8, '明かりをつける'], [2.8, 'おばけはいない']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 6, width: 400, height: 6, fill: pal.line });
  el('rect', { x: 150, y: 46, width: 80, height: 64, rx: 6, fill: '#2F3A5C', stroke: '#fff', 'stroke-width': 5 });
  el('circle', { cx: 210, cy: 66, r: 8, fill: '#FFF3C4' });
  // コート掛けとシーツ（明るいところでは、ただの布）
  const RX = 300;
  k.shadow(RX, FY + 1, 26, 4);
  el('rect', { x: RX - 3, y: 70, width: 6, height: 166, fill: pal.woodDark });
  el('rect', { x: RX - 20, y: 232, width: 40, height: 6, rx: 3, fill: pal.woodDark });
  el('path', { d: `M ${RX - 14} 82 L ${RX + 14} 82`, stroke: pal.woodDark, 'stroke-width': 4, 'stroke-linecap': 'round' });
  const sheet = el('path', { d: `M ${RX - 32} 180 Q ${RX - 30} 92 ${RX} 80 Q ${RX + 30} 92 ${RX + 32} 180 L ${RX + 22} 172 L ${RX + 12} 182 L ${RX} 172 L ${RX - 12} 182 L ${RX - 22} 172 Z`, fill: '#F4F6FA', stroke: pal.line, 'stroke-width': 1.5 });
  // 暗闇の中で見えた「目」（しわの影）
  const eyes = g({});
  el('ellipse', { cx: RX - 10, cy: 110, rx: 4, ry: 6, fill: pal.ink }, eyes);
  el('ellipse', { cx: RX + 10, cy: 110, rx: 4, ry: 6, fill: pal.ink }, eyes);
  // 卓上ライト
  el('rect', { x: 196, y: 196, width: 50, height: 40, rx: 3, fill: pal.wood });
  el('rect', { x: 216, y: 160, width: 4, height: 36, fill: pal.sub });
  const shade = el('path', { d: 'M 204 162 L 232 162 L 226 144 L 210 144 Z', fill: '#E7D9B8' });
  const glow = el('ellipse', { cx: 218, cy: 176, rx: 60, ry: 40, fill: '#FFF3C4', opacity: 0 });
  const me = k.buddy({ x: 120, y: FY, scale: 1.0, facing: 1 });
  const sweat = drop(k);
  const dark = el('rect', { x: 0, y: 0, width: 400, height: 300, fill: '#1B2240' });
  // 最後に出る「おばけ ×」
  const nog = g({});
  ghostShape(k, nog);
  el('path', { d: 'M -26 -30 L 26 30 M 26 -30 L -26 30', stroke: pal.red, 'stroke-width': 6, 'stroke-linecap': 'round' }, nog);
  return {
    update(t) {
      const lit = easeOut(seg(t, 2.1, 2.3));
      dark.setAttribute('opacity', (0.62 * (1 - lit)).toFixed(3));
      glow.setAttribute('opacity', (0.5 * lit).toFixed(3));
      shade.setAttribute('fill', lit > 0 ? '#FFE08A' : '#E7D9B8');
      // 暗いうちは、シーツに目があるように見える（ゆらゆら）
      eyes.setAttribute('opacity', (1 - lit).toFixed(3));
      sheet.setAttribute('transform', `translate(0 0) skewX(${(t < 2.1 ? 2 * Math.sin(t * 3) : 0).toFixed(2)})`);
      // まめ：こわがって震える → ライトのスイッチを押す → ほっとする
      const scared = t < 2.3;
      const shiver = scared && t > 0.5 ? Math.sin(t * 40) * 1.5 : 0;
      const press = easeInOut(seg(t, 1.6, 2.0)) * (1 - easeInOut(seg(t, 2.3, 2.7)));
      P(me, { x: 120 + shiver + 20 * easeInOut(seg(t, 1.3, 1.7)), look: 0.9, blink: blinkAt(t), mood: scared ? (t > 0.5 ? 'open' : 'flat') : 'grin', squash: scared && t > 0.5 ? 0.94 : 1, lean: scared ? -6 * seg(t, 0.4, 0.7) : 0,
        armL: scared ? 140 * seg(t, 0.4, 0.7) : 10, armR: 10 });
      if (press > 0) me.pose({ armR: lerp(10, reach(me, 1.0, 'R', 218, 196), press) });
      if (t > 2.7) me.pose({ armR: 10 + 140 * easeOut(seg(t, 3.4, 3.7)), armL: 10 });
      const hd = hp(me, 1.0, 'L', 0);
      tf(sweat, hd.x + 4, hd.y - 30 + 6 * ((t * 1.3) % 1), 0, scared && t > 0.6 ? 1 : 0.001);
      const ng = seg(t, 2.9, 3.3);
      tf(nog, 230, 70, 0, ng > 0 ? Math.max(0.001, backOut(ng) * 0.9) : 0.001);
    }
  };
}
