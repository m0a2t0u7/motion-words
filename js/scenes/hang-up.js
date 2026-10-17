// hang up：さよならを言って、通話の終了ボタンを押して電話を切る（例文 She said goodbye and hung up.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';

const R = 5.0 / 4.4; // 内部の時間割は 5.0 秒分。表示は 4.4 秒に収める
export const meta = { duration: 4.4, beats: [[0, '話している'], [1.1, 'さよならを言う'], [3.1, '電話を切る']].map(([a, n]) => [+(a / R).toFixed(2), n]) };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 250, y: 40, width: 70, height: 58, rx: 6, fill: '#D6EDF8' });
  el('line', { x1: 285, y1: 40, x2: 285, y2: 98, stroke: '#FFFFFF', 'stroke-width': 4 });
  const BX = 132;
  const b = k.buddy({ x: BX, y: 236, scale: 1 });
  // 吹き出し
  const bub = g({});
  el('path', { d: 'M -10 18 L -20 34 L 4 18 Z', fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2, 'stroke-linejoin': 'round' }, bub);
  el('rect', { x: -44, y: -20, width: 88, height: 40, rx: 20, fill: '#FFFFFF', stroke: pal.line, 'stroke-width': 2 }, bub);
  el('rect', { x: -16, y: 14, width: 22, height: 8, fill: '#FFFFFF' }, bub);
  k.text(0, 1, 'Bye!', { 'font-size': 24, fill: pal.coralDark }, bub);
  const waves = [0, 1].map((i) => el('path', { d: 'M 0 -9 Q 7 0 0 9', stroke: pal.sub, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' }));

  // スマホ（原点＝中心、本体 46×90）
  const ph = g({});
  const pbody = g({}, ph);
  el('rect', { x: -24, y: -47, width: 48, height: 94, rx: 10, fill: '#2A3242' }, pbody);
  const clipId = k.clip((cp) => el('rect', { x: -20.5, y: -43, width: 41, height: 86, rx: 6.5 }, cp));
  const scr = g({ 'clip-path': clipId }, pbody);
  const act = g({}, scr), end = g({}, scr);
  // 通話中
  el('rect', { x: -22, y: -45, width: 44, height: 90, fill: '#E4F2FB' }, act);
  el('circle', { cx: 0, cy: -20, r: 11, fill: pal.coral }, act);
  el('circle', { cx: -4, cy: -22, r: 1.5, fill: pal.ink }, act); el('circle', { cx: 4, cy: -22, r: 1.5, fill: pal.ink }, act);
  el('path', { d: 'M -3 -17 Q 0 -14 3 -17', stroke: pal.ink, 'stroke-width': 1.3, fill: 'none', 'stroke-linecap': 'round' }, act);
  el('rect', { x: -12, y: -4, width: 24, height: 4, rx: 2, fill: pal.line }, act);
  const timer = k.text(0, 9, '02:14', { 'font-size': 11, fill: pal.ink }, act);
  const endBtn = g({}, act);
  el('circle', { cx: 0, cy: 0, r: 10, fill: pal.red }, endBtn);
  el('path', { d: 'M -6 1.5 Q 0 -3.5 6 1.5 L 4.5 4 L 2 2.6 L 2 1 Q 0 0.2 -2 1 L -2 2.6 L -4.5 4 Z', fill: '#FFFFFF' }, endBtn);
  tf(endBtn, 0, 29);
  const ring = el('circle', { cx: 0, cy: 29, r: 10, fill: 'none', stroke: pal.red, 'stroke-width': 2, opacity: 0 }, act);
  // 通話終了
  el('rect', { x: -22, y: -45, width: 44, height: 90, fill: '#EEF0F4' }, end);
  el('circle', { cx: 0, cy: -20, r: 11, fill: '#C3CAD6' }, end);
  el('rect', { x: -12, y: -4, width: 24, height: 4, rx: 2, fill: '#DDE2EA' }, end);
  const timer2 = k.text(0, 9, '02:17', { 'font-size': 11, fill: pal.sub }, end);
  k.text(0, 22.5, 'Call ended', { 'font-size': 6.6, fill: pal.sub }, end);
  el('circle', { cx: 0, cy: 33.5, r: 6.5, fill: '#C3CAD6' }, end);
  el('path', { d: 'M -4 34.3 Q 0 31 4 34.3 L 3 35.9 L 1.4 35 L 1.4 34.1 Q 0 33.6 -1.4 34.1 L -1.4 35 L -3 35.9 Z', fill: '#FFFFFF' }, end);
  el('rect', { x: -9, y: -39, width: 18, height: 3.5, rx: 1.75, fill: '#2A3242' }, pbody);
  // 指
  const arm = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: pal.mintDark, 'stroke-width': 13, 'stroke-linecap': 'round' });
  const finger = g({});
  el('line', { x1: 0, y1: 0, x2: 13, y2: 15, stroke: pal.mintDark, 'stroke-width': 11, 'stroke-linecap': 'round' }, finger);
  el('line', { x1: 0, y1: 0, x2: 13, y2: 15, stroke: pal.mint, 'stroke-width': 6, 'stroke-linecap': 'round' }, finger);
  el('circle', { cx: 18, cy: 21, r: 11, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 3 }, finger);

  const PS = 2.1, PX = 290, PY = 146;
  const btnW = [PX, PY + 29 * PS];
  const PRESS = 3.15;

  return {
    update(tt) {
      const t = tt * R;
      const away = easeInOut(seg(t, 1.25, 2.0));
      // 腕と口
      const talking = t < 1.3 && t > 0.1;
      const armR = lerp(140, 70, away) * (1 - easeInOut(seg(t, 1.9, 2.4))) + 8 * easeInOut(seg(t, 1.9, 2.4));
      b.pose({
        x: BX, armR, armL: 8, mood: talking ? (Math.sin(t * 15) > 0 ? 'open' : 'smile') : 'smile', look: 0.3,
        lean: -2 * (1 - away)
      });
      const hp = b.handPos('R');
      // スマホ：耳 → 画面中央へ拡大
      const px = lerp(hp.x + 2, PX, away), py = lerp(hp.y - 12, PY, away);
      tf(ph, px, py, lerp(-14, 0, away), lerp(0.62, PS, away) * (1 + 0.03 * hump(seg(t, 1.25, 2.0))));
      // 吹き出し
      const bp = backOut(seg(t, 0.75, 1.1), 1.5) * (1 - easeOut(seg(t, 1.5, 1.8)));
      tf(bub, BX - 14, 100, 0, Math.max(0.001, bp), Math.max(0.001, bp));
      waves.forEach((w, i) => {
        const q = seg(t, 0.15 + i * 0.2, 0.75 + i * 0.2) % 1;
        tf(w, hp.x + 20 + i * 8, hp.y - 14, 0, 1 + i * 0.3);
        w.setAttribute('opacity', t > 0.1 && t < 1.3 && Math.sin(t * 15 + i) > -0.3 ? 0.8 : 0);
      });
      // 通話時間（押すまで進む）
      const sec = 134 + Math.floor(Math.min(t, PRESS) * 1.0);
      const fmt = (s) => `0${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      timer.textContent = fmt(sec);
      timer2.textContent = fmt(134 + Math.floor(PRESS));
      // 指で終了ボタンを押す
      const fin = easeInOut(seg(t, 2.2, 3.0));
      const press = hump(seg(t, 3.0, 3.35));
      const out = easeInOut(seg(t, 3.55, 4.1));
      const tipX = lerp(190, btnW[0] + 2, fin) - out * 110, tipY = lerp(310, btnW[1] + 2, fin) + out * 100 + press * 5;
      const vis = t > 2.2 && t < 4.15;
      finger.setAttribute('opacity', vis ? 1 : 0); arm.setAttribute('opacity', vis ? 1 : 0);
      tf(finger, tipX, tipY, 0, -1, 1);
      k.set(arm, { x1: tipX - 18, y1: tipY + 21, x2: tipX - 110, y2: tipY + 150 });
      tf(endBtn, 0, 29, 0, 1 - 0.18 * press, 1 - 0.18 * press);
      const rp = seg(t, 3.1, 3.5);
      ring.setAttribute('opacity', rp > 0 && rp < 1 ? 0.8 * (1 - rp) : 0);
      k.set(ring, { r: 10 + rp * 12 });
      // 画面が終了状態へ
      const e = easeOut(seg(t, 3.3, 3.6));
      act.setAttribute('opacity', 1 - e);
      end.setAttribute('opacity', e);
    }
  };
}
