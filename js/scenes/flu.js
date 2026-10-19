// flu：教室の机6つのうち3つが空席。空いた席の子はインフルエンザで家のベッドに（例文 Half of my class is out with the flu.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, backOut } from '../ease.js';
import { P, germ, thermo } from './hospital.js';
import { cloud } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, '教室'], [1.2, '席が空いている'], [2.6, '半分がインフル']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 240, mood: 'indoor' });
  // 黒板
  el('rect', { x: 110, y: 26, width: 180, height: 70, rx: 4, fill: '#3F6B5A', stroke: pal.woodDark, 'stroke-width': 5 });
  el('rect', { x: 120, y: 90, width: 40, height: 4, fill: '#fff', opacity: 0.6 });
  const XS = [40, 104, 168, 232, 296, 360];
  const here = [0, 2, 5];
  const cols = [[pal.mint, pal.mintDark], [pal.blue, pal.blueDark], [pal.violet, '#7F63D6']];
  const kids = here.map((xi, i) => k.buddy({ x: XS[xi], y: FY - 16, scale: 0.64, color: cols[i][0], dark: cols[i][1], facing: xi < 3 ? 1 : -1 }));
  // 机（前面）とイス
  XS.forEach((x, i) => {
    el('rect', { x: x - 26, y: FY - 44, width: 52, height: 6, rx: 2, fill: pal.wood });
    el('rect', { x: x - 22, y: FY - 38, width: 44, height: 22, fill: '#F2DDBB' });
    el('rect', { x: x - 22, y: FY - 16, width: 4, height: 16, fill: pal.woodDark });
    el('rect', { x: x + 18, y: FY - 16, width: 4, height: 16, fill: pal.woodDark });
    k.shadow(x, FY + 1, 30, 3);
  });
  // 空席の上：家で寝ているようす（雲）
  const clouds = [1, 3, 4].map((xi, i) => {
    const c = cloud(k, 64, 46, i === 2 ? 1 : -1);
    const ig = g({}, c.g);
    el('rect', { x: -22, y: 0, width: 44, height: 8, rx: 3, fill: pal.wood }, ig);
    el('ellipse', { cx: 14, cy: -2, rx: 9, ry: 4, fill: '#fff', stroke: pal.line }, ig);
    el('circle', { cx: 10, cy: -6, r: 7, fill: [pal.yellow, pal.coral, '#7FD3A0'][i] }, ig);
    el('rect', { x: -22, y: -6, width: 26, height: 10, rx: 4, fill: pal.blue }, ig);
    const th = thermo(k, ig); tf(th.g, 14, -4, 60, 0.28); th.set(0.9);
    const gm = germ(k, ig, pal.violet); tf(gm, -12, -14, 0, 0.6);
    return { c, x: XS[xi] };
  });
  // 空席のしるし
  const empt = [1, 3, 4].map((xi) => { const r = el('rect', { x: XS[xi] - 20, y: FY - 70, width: 40, height: 24, rx: 6, fill: 'none', stroke: pal.coral, 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }); return r; });
  return {
    update(t) {
      // 主人公（左）が空席を見回す
      const look = t < 1.0 ? 0.4 : Math.sin((t - 1.0) * 2.4) * 0.8;
      kids.forEach((b, i) => P(b, { look: i ? 0.3 : look, mood: t > 2.4 ? 'sad' : 'smile', blink: (t * 0.7 + i * 0.3) % 1 > 0.95 ? 1 : 0, facing: here[i] < 3 ? 1 : -1 }));
      empt.forEach((r, i) => r.setAttribute('opacity', hump(seg(t, 1.0 + i * 0.25, 2.2 + i * 0.25)) * (0.6 + 0.4 * Math.sin(t * 10))));
      clouds.forEach((o, i) => o.c.show(seg(t, 2.0 + i * 0.3, 2.4 + i * 0.3), o.x, 130 + (i % 2) * 10));
    }
  };
}
