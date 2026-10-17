// cool off：日なたで暑がっていた2人が、木陰のベンチに座って涼む（例文 We sat under a tree to cool off.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '日なたで暑い'], [1.6, '木陰へ向かう'], [3.4, 'ベンチで涼む']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'outdoor' });
  el('rect', { x: 0, y: 236, width: 400, height: 8, fill: '#CFEBC8' });
  // 太陽（左上・強い日差し）
  const sun = g({});
  for (let i = 0; i < 10; i++) el('line', { x1: 0, y1: -36, x2: 0, y2: -48, stroke: pal.yellowDark, 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${i * 36})` }, sun);
  el('circle', { cx: 0, cy: 0, r: 28, fill: pal.yellow }, sun);
  tf(sun, 52, 52, 0, 1);
  // 木と木陰
  el('ellipse', { cx: 245, cy: 240, rx: 100, ry: 13, fill: 'rgba(60,110,80,0.22)' });
  el('rect', { x: 233, y: 100, width: 24, height: 138, rx: 6, fill: pal.woodDark });
  const canopy = g({});
  [[0, 0, 44], [-38, 14, 34], [38, 14, 34], [-18, -22, 32], [20, -22, 32]].forEach(([x, y, r], i) => el('circle', { cx: x, cy: y, r, fill: i % 2 ? '#52BC74' : pal.green }, canopy));
  el('circle', { cx: -12, cy: -10, r: 16, fill: '#7FD39A', opacity: 0.5 }, canopy);
  tf(canopy, 245, 78, 0, 1);
  const leaf = el('path', { d: 'M 0 0 Q 6 -4 12 0 Q 6 4 0 0 Z', fill: pal.green });

  const m = k.buddy({ x: 84, y: FY, scale: 0.9 });
  const c = k.buddy({ x: 22, y: FY, scale: 0.9, color: pal.coral, dark: pal.coralDark });
  // ベンチ（座面の前板が足を隠す）
  el('rect', { x: 196, y: 202, width: 100, height: 12, rx: 4, fill: pal.wood });
  el('rect', { x: 198, y: 210, width: 96, height: 14, fill: pal.woodDark });
  [204, 280].forEach((x) => el('rect', { x, y: 222, width: 8, height: 14, rx: 2, fill: pal.woodDark }));
  const wind = g({});
  [[0, 0, 60], [16, 14, 44], [-6, 28, 52]].forEach(([x, y, w]) => el('path', { d: `M ${x} ${y} h ${w} q 10 0 10 -8 q -2 -6 -8 -4`, fill: 'none', stroke: '#BFD7EA', 'stroke-width': 3, 'stroke-linecap': 'round' }, wind));
  const drops = [0, 1, 2, 3].map(() => el('path', { d: 'M 0 -6 Q 4 0 0 4 Q -4 0 0 -6 Z', fill: pal.water }));

  const SEAT = 214, XM = 276, XC = 220;
  return {
    update(t) {
      const wm = easeInOut(seg(t, 1.1, 2.7)), wc = easeInOut(seg(t, 1.1, 2.7));
      const walking = t > 1.1 && t < 2.7;
      const hopP = seg(t, 2.75, 3.3);
      const hop = easeInOut(hopP);
      const sitY = lerp(FY, SEAT, hop), air = 14 * Math.sin(Math.PI * hopP);
      const cool = easeOut(seg(t, 3.1, 3.9));
      const hot = 1 - seg(t, 2.6, 3.4);
      const fan = (ph) => 150 + 28 * Math.sin(t * 17 + ph);
      const post = (b, x, wp, ph) => {
        const sitting = t > 3.3;
        const sq = 1 - 0.07 * hump(seg(t, 3.05, 3.4)) ;
        b.pose({
          x, y: sitY - air, walk: walking ? t * 9 + ph : 0, squash: sq,
          armR: walking ? 8 + Math.sin(t * 9 + ph) * 12 : hot > 0.5 && t < 1.1 ? fan(ph) : sitting ? 8 : 8 + (hot > 0.5 ? 0 : 0),
          armL: walking ? 8 - Math.sin(t * 9 + ph) * 12 : 8,
          mood: hot > 0.5 ? 'sad' : cool > 0.3 ? 'smile' : 'flat', look: 0.4,
          lean: walking ? 4 : 0, blink: cool > 0.5 && t > 3.6 && t < 4.1 ? 1 : 0
        });
      };
      post(m, lerp(84, XM, wm), wm, 0);
      post(c, lerp(22, XC, wc), wc, 1.2);
      // 暑い間は汗がしたたる（座って涼むと消える）
      drops.forEach((d, i) => {
        const b = i < 2 ? m : c, ph = (t * 1.5 + i * 0.37) % 1;
        const x = b.state.x + (i % 2 ? 22 : -22), y = b.state.y - 60 + 36 * ph * ph;
        tf(d, x, y, 0, 1);
        d.setAttribute('opacity', hot * (1 - seg(ph, 0.75, 1)));
      });
      sun.setAttribute('transform', `translate(52 52) scale(${1 + 0.05 * Math.sin(t * 5)})`);
      tf(canopy, 245, 78, 1.6 * Math.sin(t * 2.2) * cool);
      // そよ風
      const wp = (t - 3.1) / 1.2;
      tf(wind, 150 + 120 * (wp % 1), 112, 0, 1);
      wind.setAttribute('opacity', t > 3.1 ? 0.9 * Math.sin(Math.PI * (wp % 1)) : 0);
      const lp = seg(t, 3.3, 4.4);
      tf(leaf, 270 - 30 * lp, 120 + 70 * lp, 200 * lp, 1);
      leaf.setAttribute('opacity', lp > 0 && lp < 1 ? 1 - seg(lp, 0.85, 1) : 0);
    }
  };
}
