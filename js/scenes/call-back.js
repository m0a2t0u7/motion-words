// call back：料理中に電話が鳴る→「10分後にかけ直すね」と切る→時計が10分進み、まめの方から電話をかけ直す（例文 I'll call you back in ten minutes.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, waves, phone, faceAt, hp } from './look-over.js';
import { EAR, holdPhone, remote } from './call-up.js';

export const meta = { duration: 4.8, beats: [[0, '電話が鳴る'], [1.4, '10分後に'], [3.4, 'かけ直す']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.95;
  const FY = roomBg(k, 'home', 240);
  // キッチン台と鍋
  el('rect', { x: 20, y: 196, width: 150, height: 44, fill: '#F2DDBB' }); el('rect', { x: 20, y: 192, width: 150, height: 6, rx: 2, fill: pal.wood });
  el('path', { d: 'M 40 192 L 44 172 L 84 172 L 88 192 Z', fill: pal.sub });
  // 壁の時計
  const C = g({}); tf(C, 196, 70);
  el('circle', { r: 20, fill: '#fff', stroke: pal.ink, 'stroke-width': 3 }, C);
  el('line', { x1: 0, y1: 0, x2: 0, y2: -10, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round', transform: 'rotate(90)' }, C);
  const mh = el('line', { x1: 0, y1: 0, x2: 0, y2: -15, stroke: pal.ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, C);
  const arc = el('path', { d: '', fill: pal.yellow, opacity: 0.5 }, C);
  const b = k.buddy({ x: 130, y: FY, scale: S });
  const ph = phone(k);
  const R = remote(k, 236, 40, 146, 106, pal.coral, pal.coralDark);
  const bub = say(k, 48, 34, -1); k.text(0, 1, '10', { 'font-size': 18, fill: pal.blueDark }, bub.g);
  const ring = waves(k, pal.yellowDark);
  return {
    update(t) {
      const ring1 = t > 0.1 && t < 0.7, up1 = easeInOut(seg(t, 0.6, 0.9)), down1 = easeInOut(seg(t, 1.7, 2.0));
      const up2 = easeInOut(seg(t, 2.9, 3.3));
      const ear = Math.max(up1 * (1 - down1), up2);
      b.pose({ armR: lerp(lerp(70, 40, up1), EAR, ear), armL: t < 0.6 ? 60 + 10 * Math.sin(t * 12) : 10, lift: 3 * hump(seg(t, 0.15, 0.35)), mood: t > 0.9 && t < 1.7 && Math.sin(t * 13) > 0 ? 'open' : t > 3.6 ? 'grin' : 'smile', look: 0.6 });
      faceAt(b, 4, 0);
      if (ear > 0.01) holdPhone(k, b, S, ph, ear); else tf(ph.g, 150, 188, 90, S);
      if (t < 0.6) tf(ph.g, 150 + Math.sin(t * 60) * 1.5, 188, 90, S);
      ring(ring1 ? 1 : 0, (t * 2.4) % 1, 156, 180, 1, 0.5);
      bub.show(seg(t, 1.0, 1.2) * (1 - seg(t, 1.8, 2.0)), 190, 124);
      const m = 10 * easeInOut(seg(t, 2.0, 2.9));
      tf(mh, 0, 0, m * 6);
      const a = (m * 6) * Math.PI / 180;
      k.set(arc, { d: m > 0.5 ? `M 0 0 L 0 -16 A 16 16 0 0 1 ${16 * Math.sin(a)} ${-16 * Math.cos(a)} Z` : '' });
      R.box.show(easeOut(seg(t, 3.3, 3.6)));
      const ans = seg(t, 3.9, 4.2);
      R.o.pose({ armR: lerp(30, EAR, easeInOut(ans)), mood: ans > 0.5 ? 'grin' : 'smile', look: 0.5 });
      const h = hp(R.o, 0.55, 'R');
      k.tf(R.ph.g, lerp(328, h.x, easeInOut(ans)), lerp(136, h.y - 3, easeInOut(ans)), lerp(90, 0, ans), 0.55);
      R.ring(t > 3.4 && t < 4.0 ? 1 : 0, (t * 2) % 1, 336, 124, 1, 0.5);
    }
  };
}
