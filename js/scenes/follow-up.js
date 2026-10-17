// follow up：打ち合わせで握手 → 翌日 → 追ってメールを送り、相手に届く（例文 I'll follow up with an email tomorrow.）
import { seg, lerp, easeInOut, easeOut, backOut, hump, wobble } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '話し合う'], [1.3, '翌日'], [2.7, '追って連絡']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('ellipse', { cx: 200, cy: 262, rx: 190, ry: 18, fill: '#FBE3D8' });
  const S = 1;
  const A = k.buddy({ x: 150, y: FY, scale: S });
  const B = k.buddy({ x: 250, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  A.g.firstChild.setAttribute('display', 'none'); // 影は後で描く（机の後ろに入っても残らないように）
  B.g.firstChild.setAttribute('display', 'none');
  const shA = k.shadow(150, FY + 1, 28, 5), shB = k.shadow(250, FY + 1, 28, 5);
  // 机とノートPC（左右）
  const desk = (x0, x1) => {
    el('rect', { x: x0, y: 206, width: x1 - x0, height: 12, rx: 5, fill: pal.wood });
    el('rect', { x: x0, y: 206, width: x1 - x0, height: 4, rx: 2, fill: '#F0D9B8' });
    el('rect', { x: x0 + 4, y: 218, width: x1 - x0 - 8, height: 24, fill: '#D6B58A' });
    el('rect', { x: x0 + 4, y: 242, width: 10, height: 6, rx: 2, fill: pal.woodDark });
    el('rect', { x: x1 - 14, y: 242, width: 10, height: 6, rx: 2, fill: pal.woodDark });
  };
  const LX = 98, RX = 302;
  const laptop = (cx, parent) => {
    const gg = g({}, parent);
    el('rect', { x: -24, y: -30, width: 48, height: 32, rx: 4, fill: '#3A4358' }, gg);
    el('rect', { x: -20, y: -26, width: 40, height: 24, rx: 2, fill: '#EAF4FB' }, gg);
    el('rect', { x: -28, y: 2, width: 56, height: 5, rx: 2.5, fill: '#8F9BB0' }, gg);
    tf(gg, cx, 205);
    return gg;
  };
  // まめを描いたあとに机とPCを描き、机の後ろに足が隠れるようにする
  desk(0, 124); desk(276, 400);
  laptop(LX); laptop(RX);

  // カレンダー（中央上）
  const cal = g({});
  el('rect', { x: -34, y: -34, width: 68, height: 70, rx: 9, fill: 'rgba(40,52,70,0.12)', transform: 'translate(3 3)' }, cal);
  const page = g({}, cal);
  el('rect', { x: -34, y: -34, width: 68, height: 70, rx: 9, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2.5 }, page);
  el('rect', { x: -34, y: -34, width: 68, height: 18, rx: 9, fill: pal.red }, page);
  el('rect', { x: -34, y: -24, width: 68, height: 8, fill: pal.red }, page);
  [-18, 18].forEach((x) => el('circle', { cx: x, cy: -34, r: 4, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 2 }, page));
  const num = k.text(0, 8, '12', { 'font-size': 34, fill: pal.ink }, page);
  const nextArrow = g({});
  el('path', { d: 'M -14 0 L 12 0 M 4 -9 L 14 0 L 4 9', stroke: pal.blueDark, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, nextArrow);

  // 封筒（飛ぶ）
  const env = g({});
  el('rect', { x: -17, y: -12, width: 34, height: 24, rx: 4, fill: '#FFFFFF', stroke: pal.blueDark, 'stroke-width': 2.5 }, env);
  el('path', { d: 'M -17 -10 L 0 3 L 17 -10', stroke: pal.blueDark, 'stroke-width': 2.5, fill: 'none', 'stroke-linejoin': 'round' }, env);
  // PC画面の中身
  const mkScreen = (cx) => g({ transform: `translate(${cx} 205)` });
  const compose = mkScreen(LX); const inbox = mkScreen(RX);
  [[-14, -18, 28], [-14, -12, 22], [-14, -6, 26]].forEach(([x, y, w]) => el('rect', { x, y, width: w, height: 3, rx: 1.5, fill: pal.line }, compose));
  const sendBtn = el('rect', { x: 2, y: -21, width: 14, height: 6, rx: 3, fill: pal.blue }, compose);
  const okMark = g({}, inbox);
  el('circle', { cx: 0, cy: -14, r: 10, fill: pal.green }, okMark);
  el('path', { d: 'M -5 -14 L -1.5 -10 L 6 -19', stroke: '#FFFFFF', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, okMark);
  const ping = el('circle', { cx: 0, cy: -14, r: 10, fill: 'none', stroke: pal.green, 'stroke-width': 2.5, opacity: 0 }, inbox);

  return {
    update(t) {
      // 握手 → 離れて机へ
      const part = easeInOut(seg(t, 1.2, 2.0));
      const ax = lerp(150, 44, part), bx = lerp(250, 356, part);
      const walking = t > 1.2 && t < 2.0;
      const shake = t < 1.2 ? Math.sin(t * 14) * 7 : 0;
      const hand = t < 1.2 ? 1 : 1 - easeOut(seg(t, 1.2, 1.5));
      const type = t > 2.1 && t < 2.8 ? Math.sin(t * 22) * 6 : 0;
      const wave = Math.max(0, seg(t, 2.8, 3.0));
      A.pose({ x: ax, armR: lerp(8, 92, hand) + shake + (t > 1.5 ? 48 + type : 0) * (1 - hand), armL: 8, walk: walking ? t * 12 : 0, look: t < 1.2 ? 0.5 : 0.8, mood: t > 3.4 ? 'grin' : 'smile', lean: t < 1.2 ? 2 : 0 });
      B.pose({ x: bx, armR: lerp(8, 92, hand) - shake, armL: 8, walk: walking ? t * 12 + 2 : 0, look: t < 1.2 ? 0.5 : 0.8, mood: t > 3.6 ? 'grin' : 'smile', lean: t < 1.2 ? 2 : 0 });
      tf(shA, ax, FY + 1); tf(shB, bx, FY + 1);
      shA.setAttribute('opacity', ax < 90 ? 0 : 1); shB.setAttribute('opacity', bx > 310 ? 0 : 1);
      // カレンダー：12 → 13 にめくれる
      const flip = seg(t, 1.3, 1.9);
      const sy = flip < 0.5 ? 1 - flip * 2 : (flip - 0.5) * 2;
      num.textContent = flip < 0.5 ? '12' : '13';
      tf(cal, 200, 74, 0, 1, 1);
      tf(page, 0, -34, 0, 1, Math.max(0.02, sy));
      page.setAttribute('transform', `translate(0 -34) scale(1 ${Math.max(0.02, sy).toFixed(3)}) translate(0 34)`);
      const cs = Math.max(0.001, backOut(seg(t, 0.9, 1.25), 1.5));
      cal.setAttribute('opacity', t > 0.9 ? 1 : 0);
      tf(nextArrow, 200, 124, 0, cs * easeOut(seg(t, 1.0, 1.3)) * (1 - seg(t, 2.1, 2.4)));
      // 封筒：左PC → 右PC
      const fp = seg(t, 2.85, 3.55);
      const e = easeInOut(fp);
      tf(env, lerp(LX, RX, e), 180 - hump(fp) * 40, lerp(-14, 12, e), 1 - 0.3 * Math.abs(fp - 0.5) * 0, 1);
      env.setAttribute('opacity', fp > 0 && fp < 1 ? 1 : 0);
      sendBtn.setAttribute('fill', t > 2.8 ? pal.green : pal.blue);
      okMark.setAttribute('opacity', easeOut(seg(t, 3.55, 3.8)));
      const pg = seg(t, 3.55, 4.1);
      ping.setAttribute('opacity', pg > 0 && pg < 1 ? 1 - pg : 0);
      k.set(ping, { r: 10 + pg * 14 });
    }
  };
}
