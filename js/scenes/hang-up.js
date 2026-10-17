// hang up：さよならを言い、スマホを耳から下ろして終了ボタンを押し、電話を切る（例文 She said goodbye and hung up.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '話している'], [1.0, 'さよならを言う'], [2.6, '電話を切る']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 250, y: 30, width: 70, height: 50, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 285, y1: 30, x2: 285, y2: 80, stroke: '#FFFFFF', 'stroke-width': 4 });
  const BX = 104;
  const b = k.buddy({ x: BX, y: 236, scale: 1 });

  // スマホを1台描く（原点＝中心、本体 48×94）。通話中の画面と通話終了の画面を重ねる。
  const mkPhone = (parent) => {
    const root = g({}, parent);
    el('rect', { x: -24, y: -47, width: 48, height: 94, rx: 10, fill: '#2A3242' }, root);
    const clipId = k.clip((cp) => el('rect', { x: -20.5, y: -43, width: 41, height: 86, rx: 6.5 }, cp));
    const scr = g({ 'clip-path': clipId }, root);
    const act = g({}, scr), end = g({}, scr);
    el('rect', { x: -22, y: -45, width: 44, height: 90, fill: '#E4F2FB' }, act);
    el('circle', { cx: 0, cy: -20, r: 11, fill: pal.coral }, act);
    el('circle', { cx: -4, cy: -22, r: 1.5, fill: pal.ink }, act); el('circle', { cx: 4, cy: -22, r: 1.5, fill: pal.ink }, act);
    el('path', { d: 'M -3 -17 Q 0 -14 3 -17', stroke: pal.ink, 'stroke-width': 1.3, fill: 'none', 'stroke-linecap': 'round' }, act);
    el('rect', { x: -12, y: -4, width: 24, height: 4, rx: 2, fill: pal.line }, act);
    const timer = k.text(0, 9, '02:14', { 'font-size': 11, fill: pal.ink }, act);
    const btn = g({}, act);
    el('circle', { cx: 0, cy: 0, r: 10, fill: pal.red }, btn);
    el('path', { d: 'M -6 1.5 Q 0 -3.5 6 1.5 L 4.5 4 L 2 2.6 L 2 1 Q 0 0.2 -2 1 L -2 2.6 L -4.5 4 Z', fill: '#FFFFFF' }, btn);
    tf(btn, 0, 29);
    const ring = el('circle', { cx: 0, cy: 29, r: 10, fill: 'none', stroke: pal.red, 'stroke-width': 2, opacity: 0 }, act);
    el('rect', { x: -22, y: -45, width: 44, height: 90, fill: '#EEF0F4' }, end);
    el('circle', { cx: 0, cy: -20, r: 11, fill: '#C3CAD6' }, end);
    el('rect', { x: -12, y: -4, width: 24, height: 4, rx: 2, fill: '#DDE2EA' }, end);
    const timer2 = k.text(0, 9, '02:17', { 'font-size': 11, fill: pal.sub }, end);
    k.text(0, 22.5, 'Call ended', { 'font-size': 6.6, fill: pal.sub }, end);
    el('circle', { cx: 0, cy: 33.5, r: 6.5, fill: '#C3CAD6' }, end);
    el('path', { d: 'M -4 34.3 Q 0 31 4 34.3 L 3 35.9 L 1.4 35 L 1.4 34.1 Q 0 33.6 -1.4 34.1 L -1.4 35 L -3 35.9 Z', fill: '#FFFFFF' }, end);
    el('rect', { x: -9, y: -39, width: 18, height: 3.5, rx: 1.75, fill: '#2A3242' }, root);
    return { root, act, end, timer, timer2, btn, ring };
  };

  // 拡大窓：まめの手元から伸びるしっぽ＋丸い窓。中に大きなスマホと指が入る。
  const MC = [112, -46], MR = 76, PS = 1.4; // 窓の中心（手元からの相対）・半径・窓内のスマホ倍率
  const mag = g({});
  el('path', { d: `M 0 0 L ${MC[0] - 70} ${MC[1] + 44} L ${MC[0] - 58} ${MC[1] + 14} Z`, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 2, 'stroke-linejoin': 'round' }, mag);
  el('circle', { cx: MC[0], cy: MC[1], r: MR + 4, fill: 'rgba(40,52,70,0.10)' }, mag);
  el('circle', { cx: MC[0], cy: MC[1], r: MR, fill: '#FFFFFF', stroke: pal.sub, 'stroke-width': 2.5 }, mag);
  el('circle', { cx: MC[0], cy: MC[1], r: MR - 3, fill: '#F4F7FA' }, mag);
  const clipId = k.clip((cp) => el('circle', { cx: MC[0], cy: MC[1], r: MR - 4 }, cp));
  const inner = g({ 'clip-path': clipId }, mag);
  const big = mkPhone(inner);
  tf(big.root, MC[0], MC[1] + 2, 0, PS);
  const BTN = [MC[0], MC[1] + 2 + 29 * PS];
  const arm = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.mintDark, 'stroke-width': 14, 'stroke-linecap': 'round' }, inner);
  const finger = g({}, inner);
  el('line', { x1: 0, y1: 0, x2: 13, y2: 15, stroke: pal.mintDark, 'stroke-width': 12, 'stroke-linecap': 'round' }, finger);
  el('line', { x1: 0, y1: 0, x2: 13, y2: 15, stroke: pal.mint, 'stroke-width': 6.5, 'stroke-linecap': 'round' }, finger);
  el('circle', { cx: 18, cy: 21, r: 12, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 3 }, finger);

  // まめの手に持つスマホ
  const small = mkPhone(g({}));
  // 吹き出し
  const bub = g({});
  el('path', { d: 'M -10 18 L -18 34 L 4 18 Z', fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bub);
  el('rect', { x: -44, y: -20, width: 88, height: 40, rx: 20, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('rect', { x: -16, y: 14, width: 22, height: 8, fill: '#FFFFFF' }, bub);
  k.text(0, 1, 'Bye!', { 'font-size': 24, fill: pal.coralDark }, bub);
  const waves = [0, 1].map(() => el('path', { d: 'M 0 -9 Q 7 0 0 9', stroke: pal.sub, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }));

  const PRESS = 3.1;
  const fmt = (s) => `0${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return {
    update(t) {
      const down = easeInOut(seg(t, 1.5, 2.1));
      const talking = t > 0.1 && t < 1.4;
      b.pose({
        x: BX, armR: lerp(140, 70, down), armL: 8,
        mood: talking ? (Math.sin(t * 15) > 0 ? 'open' : 'smile') : 'smile',
        look: lerp(0.3, 0.7, down), lean: lerp(-2, 3, down)
      });
      const hp = b.handPos('R');
      // 手に持ったスマホ：耳 → 胸の前（画面がこちらを向く）
      const sc = lerp(0.62, 0.8, down);
      const px = hp.x + lerp(2, 4, down), py = hp.y - lerp(12, 22, down);
      tf(small.root, px, py, lerp(-14, 0, down), sc);
      tf(mag, px, py, 0, Math.max(0.001, backOut(seg(t, 2.1, 2.55), 1.4)));
      mag.setAttribute('opacity', t > 2.1 ? 1 : 0);
      // 吹き出し・声
      const bp = backOut(seg(t, 0.85, 1.2), 1.5) * (1 - easeOut(seg(t, 1.8, 2.1)));
      tf(bub, BX - 10, 92, 0, Math.max(0.001, bp), Math.max(0.001, bp));
      waves.forEach((w, i) => {
        tf(w, hp.x + 20 + i * 8, hp.y - 14, 0, 1 + i * 0.3);
        w.setAttribute('opacity', talking && Math.sin(t * 15 + i) > -0.3 ? 0.8 : 0);
      });
      // 通話時間は押すまで進み、押したら止まる
      const sec = 134 + Math.floor(Math.min(t, PRESS));
      [small, big].forEach((p) => { p.timer.textContent = fmt(sec); p.timer2.textContent = fmt(134 + Math.floor(PRESS)); });
      // 窓の中の指が終了ボタンを押す
      const fin = easeInOut(seg(t, 2.6, 3.0));
      const press = hump(seg(t, 3.0, 3.3));
      const out = easeInOut(seg(t, 3.55, 4.1));
      const tx = lerp(BTN[0] - 70, BTN[0] + 2, fin) - out * 70, ty = lerp(BTN[1] + 70, BTN[1] + 2, fin) + out * 70 + press * 5;
      const vis = t > 2.5 && t < 4.15;
      finger.setAttribute('opacity', vis ? 1 : 0); arm.setAttribute('opacity', vis ? 1 : 0);
      tf(finger, tx, ty, 0, -1.45, 1.45);
      k.set(arm, { x1: tx - 26, y1: ty + 30, x2: tx - 110, y2: ty + 170, 'stroke-width': 19 });
      const bs = 1 - 0.18 * press;
      tf(big.btn, 0, 29, 0, bs, bs);
      const rp = seg(t, 3.05, 3.45);
      big.ring.setAttribute('opacity', rp > 0 && rp < 1 ? 0.8 * (1 - rp) : 0);
      k.set(big.ring, { r: 10 + rp * 12 });
      // 通話終了の画面へ（まめの手のスマホも同じ状態になる）
      const e = easeOut(seg(t, 3.25, 3.55));
      [small, big].forEach((p) => { p.act.setAttribute('opacity', 1 - e); p.end.setAttribute('opacity', e); });
    }
  };
}
