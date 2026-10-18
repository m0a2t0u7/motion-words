// call up：まめが電話を手に取って番号を押し、相手が出たら「テストのこと」を聞く（例文 I called up my friend to ask about the test.）
// 電話系シーンの共有ヘルパーも出す
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, waves, phone, inset, faceAt, hp } from './look-over.js';

// 電話を耳に当てる腕の角度と、手に電話を置く
export const EAR = 150;
export function holdPhone(k, b, S, ph, p) {
  const h = hp(b, S, 'R');
  k.tf(ph.g, h.x - 2 * b.state.facing, h.y - 6 * S, lerp(0, -18 * b.state.facing, p), S);
  return h;
}
// テスト用紙アイコン
export function testIcon(k, parent) {
  const n = k.g({}, parent);
  k.el('rect', { x: -10, y: -13, width: 20, height: 26, rx: 2, fill: '#fff', stroke: k.pal.sub, 'stroke-width': 1.8 }, n);
  k.text(-3, -5, 'A', { 'font-size': 9, fill: k.pal.red }, n);
  [2, 7].forEach((y) => k.el('line', { x1: -6, x2: 6, y1: y, y2: y, stroke: k.pal.sub, 'stroke-width': 1.6 }, n));
  return n;
}
// 相手側の小窓に人を置く。answer(p)：0=待つ 1=電話に出た
export function remote(k, x, y, w, h, color, dark) {
  const box = inset(k, x, y, w, h);
  const o = k.buddy({ parent: box.inner, x: x + w * 0.42, y: box.floor, scale: 0.55, color, dark, facing: -1 });
  const ph = phone(k, box.inner);
  const ring = waves(k, k.pal.yellowDark);
  return { box, o, ph, ring };
}

export const meta = { duration: 4.4, beats: [[0, '電話をかける'], [1.6, '呼び出し中'], [2.8, 'テストのことを聞く']] };

export function create(k) {
  const { el, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  const b = k.buddy({ x: 120, y: FY, scale: S });
  const ph = phone(k);
  const R = remote(k, 232, 40, 150, 110, pal.coral, pal.coralDark);
  const bub = say(k, 56, 40, -1); testIcon(k, bub.g).setAttribute('transform', 'translate(-9 0)'); k.text(13, 1, '?', { 'font-size': 20, fill: pal.blueDark }, bub.g);
  const ring = waves(k, pal.yellowDark);
  return {
    update(t) {
      const lift = easeInOut(seg(t, 0.2, 0.7)), toEar = easeInOut(seg(t, 1.2, 1.6));
      const tap = t > 0.7 && t < 1.2 ? Math.max(0, Math.sin((t - 0.7) * 25)) : 0;
      b.pose({ armR: lerp(lerp(10, 70, lift), EAR, toEar), armL: lerp(10, 60, lift) * (1 - toEar) + 8 * tap, lean: 4 * lift, mood: t > 2.8 && Math.sin(t * 13) > 0 ? 'open' : 'smile', look: 0.6 });
      faceAt(b, 4, lerp(6, 0, toEar) * lift);
      holdPhone(k, b, S, ph, toEar);
      k.set(ph.scr, { fill: tap > 0.3 ? '#fff' : '#9FB4CC' });
      R.box.show(easeOut(seg(t, 1.5, 1.8)));
      const ans = seg(t, 2.4, 2.7), ringing = t > 1.6 && t < 2.5;
      R.o.pose({ armR: lerp(30, EAR, easeInOut(ans)), mood: ans > 0.5 ? 'grin' : 'smile', look: 0.5, lift: 3 * hump(seg(t, 1.8, 2.0)) });
      const h = hp(R.o, 0.55, 'R');
      k.tf(R.ph.g, lerp(328, h.x, easeInOut(ans)), lerp(140, h.y - 3, easeInOut(ans)), lerp(90, 0, ans), 0.55);
      R.ring(ringing ? 1 : 0, (t * 2) % 1, 336, 128, 1, 0.5);
      ring(ringing ? 0.6 : 0, (t * 2) % 1, b.state.x + 50, 150, 1, 0.5);
      bub.show(seg(t, 2.8, 3.05), 196, 120);
    }
  };
}
