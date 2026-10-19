// phone：友だちに電話しようと画面をタップするが、電池切れで画面が暗くなる。かけられずしょんぼり（例文 My phone is out of battery, so I can't call you now.）
import { seg, lerp, easeInOut, easeOut, hump, clamp, wobble } from '../ease.js';
import { hp, reach, P, blinkAt, face, homeBg } from './bag.js';
import { cloud } from './look-over.js';

// 大きめのスマホ（中心原点）。screen 内に表示を切り替える
export function bigPhone(k, parent) {
  const { el, pal } = k, g = k.g({}, parent);
  el('rect', { x: -14, y: -26, width: 28, height: 52, rx: 6, fill: pal.ink }, g);
  const on = k.g({}, g);
  el('rect', { x: -11, y: -21, width: 22, height: 40, rx: 3, fill: '#DFF1FB' }, on);
  el('circle', { cx: 0, cy: -8, r: 6, fill: pal.coral }, on);
  el('rect', { x: -7, y: 2, width: 14, height: 3, rx: 1.5, fill: pal.sub }, on);
  el('circle', { cx: 0, cy: 12, r: 4.5, fill: pal.green }, on);
  const off = k.g({}, g);
  el('rect', { x: -11, y: -21, width: 22, height: 40, rx: 3, fill: '#1E2430' }, off);
  const bat = k.g({}, off);
  el('rect', { x: -7, y: -4, width: 13, height: 8, rx: 1.5, fill: 'none', stroke: '#fff', 'stroke-width': 1.5 }, bat);
  el('rect', { x: 6, y: -2, width: 2, height: 4, fill: '#fff' }, bat);
  el('rect', { x: -5.5, y: -2.5, width: 2.5, height: 5, fill: pal.red }, bat);
  return { g, set(isOn, blink) { on.setAttribute('opacity', isOn ? 1 : 0); off.setAttribute('opacity', isOn ? 0 : 1); bat.setAttribute('opacity', blink); } };
}

export const meta = { duration: 4.4, beats: [[0, '電話をかける'], [1.5, '電池が切れた'], [2.8, 'かけられない']] };

export function create(k) {
  const { tf, pal } = k, S = 1.2, FY = 236, X = 160;
  homeBg(k, { FY, winX: 290, winW: 84 });
  const b = k.buddy({ x: X, y: FY, scale: S });
  const ph = bigPhone(k);
  const th = cloud(k, 84, 60, -1);
  const fr = k.buddy({ x: 0, y: 22, scale: 0.42, facing: -1, color: pal.coral, dark: pal.coralDark, parent: th.g });
  return {
    update(t) {
      const raise = easeInOut(seg(t, 0.1, 0.6));
      const dead = t > 1.5;
      const show = easeInOut(seg(t, 2.6, 3.1));
      P(b, { x: X, look: 0.8, blink: blinkAt(t), mood: dead ? (t > 2.4 ? 'sad' : 'open') : 'smile', lean: dead ? 4 * (1 - show) : 6, squash: 1 - 0.04 * seg(t, 2.4, 3.0) });
      face(b, 5, dead ? 2 : 0);
      const px = lerp(X + 46, X + 58, show), py = lerp(FY - 40, FY - 82, raise) + 6 * show;
      b.pose({ armR: reach(b, S, 'R', px, py + 14) });
      tf(ph.g, px, py, lerp(-8, 0, show), 1 + 0.15 * show);
      const tapQ = t > 0.7 && t < 1.5 ? hump(((t - 0.7) * 3) % 1) : 0;
      // 左手の指でタップ
      b.pose({ armL: lerp(8, reach(b, S, 'L', px, py - 4 + 4 * tapQ), seg(t, 0.6, 0.8) * (1 - seg(t, 1.5, 1.8))) });
      ph.set(!dead, 0.4 + 0.6 * (Math.sin(t * 9) > 0 ? 1 : 0));
      th.show(seg(t, 0.4, 0.8) * (1 - seg(t, 1.6, 2.0)), 290, 96);
      P(fr, { x: 0, y: 22, facing: -1, mood: 'smile', blink: blinkAt(t, 1) });
    }
  };
}
