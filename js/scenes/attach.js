// attach：まめがファイルのアイコンを持ち上げてメールに重ねると、クリップ付きの「file.pdf」添付チップになる（例文 I've attached the file to this email.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.3, beats: [[0, 'メール'], [1.0, 'ファイルを付ける'], [3.0, '添付した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 250, mood: 'indoor' });

  // メール作成画面
  const WX = 140, WY = 24, WW = 250, WH = 212;
  el('rect', { x: WX + 4, y: WY + 6, width: WW, height: WH, rx: 14, fill: pal.shadow });
  el('rect', { x: WX, y: WY, width: WW, height: WH, rx: 14, fill: '#FFFFFF', stroke: '#E1E6EE', 'stroke-width': 2 });
  el('path', { d: `M ${WX} ${WY + 26} L ${WX} ${WY + 14} Q ${WX} ${WY} ${WX + 14} ${WY} L ${WX + WW - 14} ${WY} Q ${WX + WW} ${WY} ${WX + WW} ${WY + 14} L ${WX + WW} ${WY + 26} Z`, fill: pal.blue });
  [0, 1, 2].forEach((i) => el('circle', { cx: WX + 16 + i * 14, cy: WY + 13, r: 4, fill: '#FFFFFF', opacity: 0.8 }));
  k.text(WX + 140, WY + 13, 'New mail', { 'font-size': 11, fill: '#FFFFFF' });
  k.text(WX + 20, WY + 46, 'To', { 'font-size': 11, fill: pal.sub });
  el('rect', { x: WX + 44, y: WY + 38, width: 72, height: 16, rx: 8, fill: '#E4F1FF' });
  el('line', { x1: WX + 14, y1: WY + 62, x2: WX + WW - 14, y2: WY + 62, stroke: '#EDF0F5', 'stroke-width': 2 });
  k.text(WX + 30, WY + 76, 'Subject', { 'font-size': 11, fill: pal.sub });
  el('line', { x1: WX + 66, y1: WY + 76, x2: WX + 150, y2: WY + 76, stroke: '#C8D2E0', 'stroke-width': 4, 'stroke-linecap': 'round' });
  el('line', { x1: WX + 14, y1: WY + 90, x2: WX + WW - 14, y2: WY + 90, stroke: '#EDF0F5', 'stroke-width': 2 });
  [0, 1, 2, 3].forEach((i) => el('line', { x1: WX + 18, y1: WY + 108 + i * 16, x2: WX + WW - 30 - (i % 2) * 40 - (i === 3 ? 60 : 0), y2: WY + 108 + i * 16, stroke: '#DCE2EB', 'stroke-width': 4, 'stroke-linecap': 'round' }));
  // 添付の置き場（点線）
  const zone = el('rect', { x: WX + 14, y: WY + 168, width: 124, height: 32, rx: 8, fill: 'none', stroke: '#C8D2E0', 'stroke-width': 2, 'stroke-dasharray': '5 5' });

  // 添付チップ（クリップつき）
  const CHX = WX + 18, CHY = WY + 172;
  const chip = g({});
  tf(chip, CHX, CHY);
  el('rect', { width: 116, height: 26, rx: 8, fill: '#F1F5FB', stroke: pal.blue, 'stroke-width': 2 }, chip);
  el('rect', { x: 6, y: 4, width: 17, height: 18, rx: 3, fill: pal.red }, chip);
  k.text(14.5, 13.5, 'PDF', { 'font-size': 7, fill: '#FFFFFF' }, chip);
  k.text(66, 14, 'file.pdf', { 'font-size': 12, fill: pal.ink }, chip);
  const clip = g({ transform: 'translate(112 3) rotate(18)' }, chip);
  el('path', { d: 'M -3 9 L -3 -7 Q -3 -14 3 -14 Q 9 -14 9 -7 L 9 11 Q 9 18 2 18 Q -5 18 -5 11 L -5 -3', fill: 'none', stroke: '#8795AB', 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, clip);
  const ck = g({});
  el('circle', { r: 11, fill: pal.green, stroke: '#FFFFFF', 'stroke-width': 3 }, ck);
  el('path', { d: 'M -5 1 L -1 5 L 6 -4', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 3.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ck);

  // 持ち運ぶファイルのアイコン（原点＝中央）
  const file = g({});
  el('rect', { x: -17, y: -23, width: 36, height: 48, rx: 5, fill: pal.shadow }, file);
  el('path', { d: 'M -19 -25 L 8 -25 L 19 -14 L 19 23 Q 19 25 17 25 L -17 25 Q -19 25 -19 23 Z', fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 2.2, 'stroke-linejoin': 'round' }, file);
  el('path', { d: 'M 8 -25 L 8 -16 Q 8 -14 10 -14 L 19 -14', fill: '#E4E9F1', stroke: '#CBD3DE', 'stroke-width': 2 }, file);
  el('rect', { x: -13, y: 2, width: 26, height: 12, rx: 3, fill: pal.red }, file);
  k.text(0, 8.5, 'PDF', { 'font-size': 9, fill: '#FFFFFF' }, file);
  [-12, -6].forEach((y) => el('line', { x1: -12, y1: y - 1, x2: 8, y2: y - 1, stroke: '#C8D2E0', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, file));

  const MS = 0.85;
  const b = k.buddy({ x: 106, y: 262, scale: MS, facing: -1 });
  const sparks = [[330, 30], [300, 214], [200, 218]].map(([x, y], i) => {
    const s = g({});
    el('path', { d: 'M 0 -8 Q 1.5 -1.5 8 0 Q 1.5 1.5 0 8 Q -1.5 1.5 -8 0 Q -1.5 -1.5 0 -8 Z', fill: i % 2 ? pal.yellow : pal.mint }, s);
    return { s, x, y };
  });

  const FLOORP = [56, 232];
  return {
    update(t) {
      const grab = easeInOut(seg(t, 0.85, 1.3));
      const lift = easeInOut(seg(t, 1.3, 1.8));
      const turn = t >= 1.55;
      const walkP = easeInOut(seg(t, 1.8, 2.55));
      const x = lerp(106, 132, walkP);
      const walking = t > 1.8 && t < 2.55;
      const w = walking ? (t - 1.8) * 9 : 0;
      const down = easeInOut(seg(t, 2.85, 3.3));
      let a;
      if (t < 1.3) a = lerp(8, 78, grab);
      else if (t < 2.85) a = lerp(78, 112, lift);
      else a = lerp(112, 8, down);
      const happy = t >= 3.3;
      b.pose({
        x, facing: turn ? 1 : -1, walk: w, armR: a, armL: happy ? 125 + 10 * Math.sin((t - 3.3) * 11) : walking ? 8 - Math.sin(w) * 12 : 8,
        look: 0.8, lean: t < 1.3 ? 12 * grab : lerp(12, 0, lift), mood: happy ? 'grin' : 'smile',
        lift: happy ? 7 * Math.abs(Math.sin((t - 3.3) * 7)) * (1 - seg(t, 3.3, 4.3)) : 0
      });
      const hp = b.handPos('R');
      const bob = walking ? Math.abs(Math.sin(w)) * 3 * MS : 0;
      const hand = [hp.x, hp.y - bob];
      // ファイル：床 → 手 → メール上 → チップ
      let pos, sc = 1, rot = 0;
      if (t < 1.05) { pos = FLOORP; }
      else if (t < 1.3) { const u = easeOut(seg(t, 1.05, 1.3)); pos = [lerp(FLOORP[0], hand[0] - 2, u), lerp(FLOORP[1], hand[1] - 20, u) - 10 * hump(u)]; }
      else if (t < 2.65) { pos = [hand[0] + 6 * (turn ? 1 : -1), hand[1] - 22]; rot = turn ? 8 : -8; }
      else {
        const u = easeInOut(seg(t, 2.65, 3.0));
        pos = [lerp(hand[0] + 6, CHX + 22, u), lerp(hand[1] - 22, CHY + 13, u)];
        sc = lerp(1, 0.5, u);
        rot = lerp(8, 0, u);
      }
      const gone = t >= 3.0;
      tf(file, pos[0], pos[1], rot, sc, sc);
      file.setAttribute('opacity', gone ? 0 : 1);
      // 添付チップ
      const cp = t < 2.95 ? 0 : backOut(seg(t, 2.95, 3.3), 2);
      tf(chip, CHX, CHY + 13 * (1 - cp), 0, 1, Math.max(0.001, cp));
      chip.setAttribute('opacity', cp > 0 ? 1 : 0);
      tf(clip, 0, 0);
      clip.setAttribute('transform', `translate(112 ${3 - 10 * (1 - seg(t, 3.1, 3.4))}) rotate(${18 - 30 * (1 - seg(t, 3.1, 3.4))})`);
      zone.setAttribute('opacity', 1 - cp);
      const kp = t < 3.3 ? 0 : backOut(seg(t, 3.3, 3.6), 2.2);
      tf(ck, CHX + 126, CHY + 4, 0, kp, kp);
      sparks.forEach((q, i) => {
        const u = seg(t, 3.3 + i * 0.1, 3.8 + i * 0.1);
        const sc2 = u <= 0 ? 0 : u >= 1 ? 0.9 + 0.15 * Math.sin(t * 8 + i) : easeOut(u);
        tf(q.s, q.x, q.y, t * 40, sc2, sc2);
      });
    }
  };
}
