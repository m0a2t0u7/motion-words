// clear out：引き出しの中身をひとつずつ取り出して箱へ移し、空にする（例文 I cleared out the drawer.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '物がいっぱい'], [1.7, '取り出す'], [3.9, '空になった']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  // 窓
  el('rect', { x: 290, y: 50, width: 70, height: 66, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 325, y1: 50, x2: 325, y2: 116, stroke: '#fff', 'stroke-width': 4 });
  // たんす
  el('rect', { x: 40, y: 112, width: 108, height: 124, rx: 6, fill: pal.wood });
  el('rect', { x: 40, y: 112, width: 108, height: 8, rx: 4, fill: pal.woodDark });
  [196, 218].forEach((y) => { el('rect', { x: 52, y: y - 20, width: 84, height: 18, rx: 4, fill: pal.woodDark, opacity: 0.45 }); el('rect', { x: 86, y: y - 13, width: 16, height: 4, rx: 2, fill: pal.yellowDark }); });
  k.shadow(94, 237, 56, 5);
  // 引き出し（手前に引き出した状態）：奥の面
  el('rect', { x: 146, y: 162, width: 100, height: 30, rx: 4, fill: pal.woodDark });
  // 中身
  const mk = (kind) => {
    const n = g({});
    if (kind === 'sock') {
      el('path', { d: 'M -6 -12 L 6 -12 L 6 2 Q 14 4 12 10 Q 8 14 0 10 L -6 4 Z', fill: pal.red }, n);
      el('rect', { x: -7, y: -14, width: 14, height: 6, rx: 2, fill: '#fff' }, n);
    } else if (kind === 'book') {
      el('rect', { x: -9, y: -13, width: 18, height: 26, rx: 2, fill: pal.blue }, n);
      el('rect', { x: -9, y: -13, width: 4, height: 26, fill: pal.blueDark }, n);
      el('rect', { x: -1, y: -6, width: 7, height: 3, rx: 1, fill: '#fff', opacity: 0.8 }, n);
    } else {
      el('circle', { r: 11, fill: pal.yellow }, n);
      el('path', { d: 'M -11 0 Q 0 -6 11 0', stroke: pal.yellowDark, 'stroke-width': 2.5, fill: 'none' }, n);
    }
    return n;
  };
  const items = [mk('sock'), mk('book'), mk('ball')];
  const rest = [{ x: 232, y: 173 }, { x: 219, y: 173 }, { x: 205, y: 173 }];
  const land = [{ x: 190, y: 207 }, { x: 178, y: 203 }, { x: 166, y: 208 }];
  // 引き出しの手前の縁
  el('rect', { x: 142, y: 176, width: 108, height: 18, rx: 4, fill: pal.wood });
  el('rect', { x: 182, y: 182, width: 28, height: 5, rx: 2.5, fill: pal.yellowDark });
  // 人物
  const b = k.buddy({ x: 273, y: FY, scale: 0.85, facing: -1 });
  // 手前に置いた箱
  const boxBack = g({});
  const itemsLayer = g({});
  const box = g({});
  el('path', { d: 'M 150 206 L 214 206 L 210 236 L 154 236 Z', fill: '#DDB98A' }, box);
  el('rect', { x: 148, y: 203, width: 72, height: 6, rx: 2, fill: '#C9A06F' }, box);
  el('rect', { x: 176, y: 214, width: 16, height: 8, rx: 2, fill: '#C9A06F' }, box);
  k.shadow(182, 237, 36, 4, boxBack);
  items.forEach((n) => itemsLayer.appendChild(n));
  // 順序：影 → 中身 → 箱の前面
  k.root.insertBefore(boxBack, b.g); k.root.insertBefore(itemsLayer, b.g); k.root.appendChild(box);
  const star = g({});
  el('path', { d: 'M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z', fill: pal.yellow }, star);

  const S = [0.3, 1.5, 2.7], XS = [273, 260, 246];
  return {
    update(t) {
      let x = XS[0], arm = 20, walking = false, wph = 0;
      items.forEach((n, i) => {
        const s = S[i], hxR = XS[i] - 43.7, hyR = 196;
        const r = s + 0.85;
        let p = rest[i];
        if (t >= r + 0.0) {
          const f = seg(t, r, r + 0.4);
          const fy = lerp(hyR, land[i].y, f) - 4 * 24 * f * (1 - f);
          p = { x: lerp(hxR, land[i].x, f), y: fy };
        } else if (t >= s + 0.38) {
          p = { x: null };
        }
        n.dataset.mode = p.x === null ? 'hand' : 'free';
        n.__p = p;
      });
      // 腕と足取り
      for (let i = 0; i < 3; i++) {
        const s = S[i];
        if (t >= s - 0.01) {
          x = XS[i];
          if (t < s + 0.4) arm = lerp(i === 0 ? 20 : 70, 125, easeOut(seg(t, s, s + 0.4)));
          else if (t < s + 0.5) arm = 125;
          else if (t < s + 0.85) arm = lerp(125, 70, easeInOut(seg(t, s + 0.5, s + 0.85)));
          else arm = 70;
          if (i < 2 && t > s + 0.9) {
            const w = seg(t, s + 0.9, s + 1.2);
            x = lerp(XS[i], XS[i + 1], easeInOut(w));
            walking = w > 0 && w < 1; wph = (t - s) * 10;
          }
        }
      }
      if (t > 3.6) arm = lerp(70, 12, easeInOut(seg(t, 3.6, 4.0)));
      b.pose({ x, armR: arm, armL: 8 + (walking ? Math.sin(wph) * 12 : 0), walk: walking ? wph : 0, mood: t > 3.8 ? 'grin' : 'flat', look: 0.5, lean: 0 });
      const h = b.handPos('R');
      items.forEach((n) => {
        const p = n.__p.x === null ? h : n.__p;
        tf(n, p.x, p.y, n.__p.x === null ? 0 : 0);
      });
      const sp = seg(t, 3.85, 4.4);
      tf(star, 196, 140 - 6 * sp, sp * 90, 0.3 + 0.9 * hump(sp));
      star.setAttribute('opacity', sp > 0 ? 1 : 0);
    }
  };
}
