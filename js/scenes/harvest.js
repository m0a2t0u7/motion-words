// harvest：秋の田んぼで、農家の二人が鎌で黄金色の稲を刈り取っていく（例文 Farmers harvest rice in autumn.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump } from '../ease.js';
import { hp } from './weigh.js';

export const meta = { duration: 4.4, beats: [[0, '実った稲'], [1.2, '鎌で刈る'], [3.5, '刈り取った']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 214, mood: 'evening' });
  // 田んぼ（動かない）：遠くの山と柿の木、手前の稲
  el('path', { d: 'M 0 150 Q 70 100 140 140 T 280 130 T 400 146 L 400 214 L 0 214 Z', fill: '#EBD7B0' });
  el('rect', { x: 0, y: 214, width: 400, height: 90, fill: '#E3C98E' });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: '#D3B677' });
  const tr = g({}); tf(tr, 360, 190);
  el('rect', { x: -4, y: -40, width: 8, height: 44, rx: 3, fill: pal.woodDark }, tr); el('circle', { cx: 0, cy: -54, r: 26, fill: '#F2A154' }, tr); el('circle', { cx: -15, cy: -42, r: 16, fill: '#E58A3F' }, tr);
  const S = 1.1, GY = 252;
  const mkStalk = (x, sc = 1) => {
    const s = g({}); tf(s, x, GY, 0, sc);
    const stub = el('rect', { x: -1.5, y: -9, width: 3, height: 9, rx: 1.5, fill: '#B89A57', opacity: 0 }, s);
    const top = g({}, s);
    el('path', { d: 'M 0 -8 Q 1 -40 14 -60', fill: 'none', stroke: '#D9B24A', 'stroke-width': 3, 'stroke-linecap': 'round' }, top);
    for (let i = 0; i < 6; i++) el('ellipse', { cx: 14 - i * 1.2 - 2, cy: -60 + i * 4.4, rx: 3.2, ry: 5, fill: '#F2C94C', transform: `rotate(${-24 + i * 4} ${14 - i * 1.2} ${-60 + i * 4.4})` }, top);
    return { s, top, stub };
  };
  const fields = [{ X: [152, 168, 184], T: [1.05, 1.65, 2.25], x: 118 }, { X: [320, 336, 352], T: [1.35, 1.95, 2.55], x: 282 }];
  const groupsRows = fields.map((f) => f.X.map((x) => mkStalk(x, 1.55)));
  // 背景の稲（動かない）
  const bgSt = []; for (let x = 8; x < 400; x += 11) { if ((x > 140 && x < 200) || (x > 306 && x < 366)) continue; const s = mkStalk(x); tf(s.s, x, GY - 14 + (x % 3) * 2); }
  const bs = fields.map((f, i) => k.buddy({ x: f.x, y: GY + 2, scale: S, color: i ? pal.coral : pal.mint, dark: i ? pal.coralDark : pal.mintDark }));
  // 鎌
  const sick = fields.map((f, i) => { const s = g({}); el('rect', { x: -2, y: 0, width: 4, height: 15, rx: 2, fill: pal.woodDark }, s); el('path', { d: 'M 0 14 Q 18 12 20 -6 Q 10 4 0 8 Z', fill: '#C7D0DC', stroke: '#8793A8', 'stroke-width': 1 }, s); return s; });
  const leaves = [0, 1, 2].map((i) => { const l = g({}); el('path', { d: 'M 0 -6 Q 6 0 0 6 Q -6 0 0 -6 Z', fill: i % 2 ? '#E5533D' : '#F2A154' }, l); return l; });
  return {
    update(t) {
      fields.forEach((f, i) => {
        // 腕：振り上げ→刈る→戻す
        let arm = 40;
        f.T.forEach((tc) => { if (t > tc - 0.45 && t < tc + 0.35) { const u = t - tc; arm = u < -0.15 ? lerp(40, 125, easeOut(seg(u, -0.45, -0.15))) : u < 0.05 ? lerp(125, 62, easeIn(seg(u, -0.15, 0.05))) : lerp(62, 40, easeOut(seg(u, 0.05, 0.35))); } });
        const cutting = f.T.some((tc) => Math.abs(t - tc) < 0.4);
        bs[i].pose({ armR: arm, armL: 14, lean: cutting ? 10 : 6, look: 0.4, mood: t < 1.0 ? 'smile' : 'grin', squash: 1 - 0.03 * (cutting ? 1 : 0) });
        const h = hp(bs[i], S, 'R', 28);
        tf(sick[i], h.x, h.y, -arm + 20);
        f.X.forEach((x, j) => {
          const st = groupsRows[i][j], u = t - f.T[j];
          const fall = easeIn(seg(u, 0.0, 0.32));
          st.top.setAttribute('transform', `translate(0 -9) rotate(${(78 * fall).toFixed(1)}) translate(0 9) ${u > 0.3 ? '' : ''}`);
          st.top.setAttribute('transform', `rotate(${(80 * fall + (u > 0.32 && u < 0.5 ? -4 * Math.sin((u - 0.32) * 30) : 0)).toFixed(1)} 0 -9) translate(0 ${(9 * fall).toFixed(1)})`);
          st.stub.setAttribute('opacity', u > 0 ? 1 : 0);
        });
      });
      leaves.forEach((l, i) => { const p = ((t * 0.18 + i / 3) % 1); tf(l, 60 + i * 130 + 30 * Math.sin(p * 9 + i), 20 + 200 * p, 360 * p + i * 50); });
    }
  };
}
