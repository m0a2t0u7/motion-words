// drop by：帰り道のまめがカフェにちょっと入り、コーヒーを持って出てきて、また同じ方向へ歩く（例文 I dropped by the café on my way home.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '帰り道'], [1.2, 'ちょっと寄る'], [3.1, 'また歩く']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'evening' });
  // 夕日と遠景
  el('circle', { cx: 70, cy: 96, r: 54, fill: '#FFD9B8', opacity: 0.55 });
  el('circle', { cx: 70, cy: 96, r: 30, fill: '#FFC48C' });
  el('ellipse', { cx: 40, cy: 214, rx: 70, ry: 18, fill: '#F3D9C8' });
  el('ellipse', { cx: 370, cy: 214, rx: 70, ry: 20, fill: '#F3D9C8' });
  el('rect', { x: 0, y: 218, width: 400, height: 18, fill: '#EBDCCF' });
  // カフェの中（ドアの穴の奥）
  const HX = 186, HW = 50, HT = 148, GY = 224, BOT = 234;
  el('rect', { x: HX, y: HT, width: HW, height: BOT - HT, fill: '#8A5A3C' });
  el('rect', { x: HX + 6, y: HT + 8, width: 14, height: 10, rx: 3, fill: '#FFD98E', opacity: 0.9 });
  const back = g({});
  // 店の壁（ドアの穴あき）
  el('path', { d: `M 120 118 L 300 118 L 300 ${BOT} L 120 ${BOT} Z M ${HX} ${HT} L ${HX + HW} ${HT} L ${HX + HW} ${BOT} L ${HX} ${BOT} Z`, fill: '#FBE9DC', 'fill-rule': 'evenodd' });
  el('rect', { x: 112, y: 100, width: 196, height: 20, rx: 6, fill: pal.coralDark });
  el('rect', { x: 150, y: 124, width: 76, height: 14, rx: 4, fill: '#FFFFFF', opacity: 0 });
  // 看板（カップ）
  el('rect', { x: 142, y: 104, width: 112, height: 12, rx: 4, fill: pal.coral, opacity: 0 });
  k.text(166, 110, 'CAFE', { 'font-size': 13, fill: '#FFFFFF' });
  const cupI = g({ transform: 'translate(212 110)' });
  el('rect', { x: -6, y: -5, width: 11, height: 9, rx: 2.5, fill: '#FFFFFF' }, cupI);
  el('path', { d: 'M 5 -3 Q 9 -3 9 0 Q 9 3 5 3', stroke: '#FFFFFF', 'stroke-width': 1.8, fill: 'none' }, cupI);
  // 窓（不透明）
  [[132, 70], [250, 70]].forEach(([x, w]) => { });
  el('rect', { x: 130, y: 144, width: 44, height: 50, rx: 5, fill: '#FFE9C9' });
  el('rect', { x: 248, y: 144, width: 44, height: 50, rx: 5, fill: '#FFE9C9' });
  el('rect', { x: 130, y: 190, width: 44, height: 4, rx: 2, fill: pal.woodDark });
  el('rect', { x: 248, y: 190, width: 44, height: 4, rx: 2, fill: pal.woodDark });
  // ひさし
  const awn = el('path', { d: `M ${HX - 12} 126 L ${HX + HW + 12} 126 L ${HX + HW + 8} 148 L ${HX - 8} 148 Z`, fill: pal.coral });
  [0, 1, 2, 3].forEach((i) => el('rect', { x: HX - 12 + i * 18.5, y: 126, width: 9, height: 22, fill: '#FFFFFF', opacity: 0.85 }));
  // ドア（左端が蝶番）
  const door = g({});
  el('rect', { x: 0, y: 0, width: HW, height: BOT - HT, rx: 3, fill: pal.blue }, door);
  el('rect', { x: 7, y: 8, width: HW - 14, height: 28, rx: 4, fill: '#FFFFFF', opacity: 0.35 }, door);
  el('circle', { cx: HW - 8, cy: 44, r: 3.5, fill: pal.yellow }, door);
  const front = g({});
  // まめ＋コーヒー
  const S0 = 0.9;
  const b = k.buddy({ x: 20, y: FY, scale: S0 });
  const cup = g({});
  el('path', { d: 'M -7 -8 L 7 -8 L 5 7 L -5 7 Z', fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 1.5 }, cup);
  el('rect', { x: -7, y: -4, width: 14, height: 6, fill: pal.coffee }, cup);
  el('rect', { x: -8, y: -10, width: 16, height: 3, rx: 1.5, fill: pal.coffee }, cup);
  const steam = [-3, 3].map((x) => el('path', { d: `M ${x} -13 Q ${x + 3} -18 ${x} -23`, stroke: '#FFFFFF', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }, cup));
  const setLayer = (layer) => { if (b.g.parentNode !== layer) { layer.appendChild(b.g); layer.appendChild(cup); } };
  // 位置：区間ごとの関数
  const pos = (t) => {
    if (t < 1.0) return { x: lerp(20, 184, t / 1.0), y: FY, s: S0, ph: t * 10 };
    if (t < 1.6) { const p = easeInOut(seg(t, 1.0, 1.6)); return { x: lerp(184, 211, p), y: lerp(FY, GY, p), s: lerp(S0, 0.7, p), ph: t * 10 * (1 - p) }; }
    if (t < 2.05) { const p = easeInOut(seg(t, 1.6, 2.05)); return { x: lerp(211, 150, p), y: GY, s: 0.7, ph: t * 10 }; }
    if (t < 2.5) return { x: 150, y: GY, s: 0.7, ph: 0 };
    if (t < 2.9) { const p = easeInOut(seg(t, 2.5, 2.9)); return { x: lerp(150, 211, p), y: GY, s: 0.7, ph: t * 10 }; }
    if (t < 3.3) { const p = easeInOut(seg(t, 2.9, 3.3)); return { x: 211, y: lerp(GY, FY, p), s: lerp(0.7, S0, p), ph: t * 10 * (p < 1 ? 1 : 0) }; }
    const p = seg(t, 3.3, 4.4);
    return { x: lerp(211, 340, easeInOut(p) * 0.4 + p * 0.6), y: FY, s: S0, ph: t * 10 };
  };
  return {
    update(t) {
      const o = pos(t);
      // ドアの開閉：入るとき（1.1〜1.9）に開き、閉まる。出るとき（2.4〜3.4）に開き、閉まる
      const op = Math.max(easeInOut(seg(t, 1.1, 1.5)) * (1 - easeInOut(seg(t, 1.9, 2.25))), easeInOut(seg(t, 2.35, 2.7)) * (1 - easeInOut(seg(t, 3.2, 3.55))));
      tf(door, HX, HT, 0, lerp(1, 0.13, op), 1);
      // まめを前面・背面の層へ（背面のときは壁の後ろに隠れる）
      const inside = t >= 1.55 && t < 3.0;
      setLayer(inside ? back : front);
      const hasCup = t > 2.5;
      const walking = t < 1.6 || (t > 1.6 && t < 2.05) || (t >= 2.5 && t < 4.4);
      const sw = Math.sin(o.ph);
      b.pose({
        x: o.x, y: o.y, scale: o.s,
        armR: hasCup ? 62 : 8 + sw * 16, armL: 8 - sw * 16, walk: walking ? o.ph : 0,
        look: t < 1.0 ? 0.3 : 0.6, lean: walking ? 4 : 0, mood: t > 3.0 ? 'smile' : 'smile'
      });
      b.g.setAttribute('transform', b.g.getAttribute('transform').replace(/scale\([^)]*\)/, `scale(${o.s.toFixed(3)} ${o.s.toFixed(3)})`));
      const hp = b.handPos('R');
      cup.setAttribute('opacity', hasCup ? 1 : 0);
      tf(cup, hp.x + 4, hp.y - 6, 0, o.s * 1.2);
      steam.forEach((s, i) => s.setAttribute('opacity', 0.55 + 0.4 * Math.sin(t * 6 + i * 2)));
    }
  };
}
