// ring back：会議中に電話が震える→まめは出ずに会議を続ける→会議が終わって皆が去り、まめから電話を鳴らし返す（例文 I'll ring you back after the meeting.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { roomBg, say, waves, phone, faceAt, hp, desk, walkPose } from './look-over.js';
import { EAR, holdPhone, remote } from './call-up.js';

export const meta = { duration: 4.8, beats: [[0, '会議中に着信'], [1.8, '会議が終わる'], [3.4, 'かけ直す']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 0.85;
  const FY = roomBg(k, 'office', 240);
  el('rect', { x: 20, y: 46, width: 120, height: 70, rx: 4, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  el('path', { d: 'M 36 100 L 60 80 L 80 92 L 110 64 L 124 70', fill: 'none', stroke: pal.blue, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const P = [k.buddy({ x: 60, y: 226, scale: S, color: pal.blue, dark: pal.blueDark }), k.buddy({ x: 250, y: 226, scale: S, color: pal.yellow, dark: pal.yellowDark, facing: -1 })];
  const b = k.buddy({ x: 156, y: 226, scale: S });
  desk(k, 30, 260, 196);
  const ph = phone(k);
  const R = remote(k, 250, 34, 136, 100, pal.coral, pal.coralDark);
  const buzz = waves(k, pal.yellowDark);
  return {
    update(t) {
      const vib = t > 0.4 && t < 1.4;
      // 会議：交互にうなずく→終わって二人が去る
      P.forEach((p, i) => {
        const xf = (tt) => lerp(i ? 250 : 60, i ? 440 : -60, easeInOut(seg(tt, 1.8 + i * 0.15, 3.0 + i * 0.15)));
        const w = walkPose(xf, t, i ? 250 : 60);
        p.pose({ x: w.x, walk: w.walk, facing: t > 1.8 ? (i ? 1 : -1) : (i ? -1 : 1), armR: t < 1.8 ? 8 + 25 * Math.max(0, Math.sin(t * 4 + i * 3)) : w.armR, armL: w.armL, mood: t < 1.8 && Math.sin(t * 12 + i) > 0.3 ? 'open' : 'smile', look: 0.5 });
      });
      const up = easeInOut(seg(t, 3.1, 3.5));
      b.pose({ armR: lerp(40, EAR, up), armL: vib ? 50 : 10, mood: t > 3.6 ? 'smile' : 'flat', look: t > 0.5 && t < 1.0 ? -0.2 : 0.5 });
      faceAt(b, t > 0.5 && t < 1.0 ? 0 : 4, t > 0.5 && t < 1.0 ? 6 : 0);
      if (up > 0.01) holdPhone(k, b, S, ph, up); else tf(ph.g, 190 + (vib ? Math.sin(t * 70) * 1.5 : 0), 192, 90, S);
      buzz(vib ? 0.8 : 0, (t * 3) % 1, 198, 186, 1, 0.4);
      R.box.show(easeOut(seg(t, 3.5, 3.8)));
      const ans = seg(t, 4.0, 4.3);
      R.o.pose({ armR: lerp(30, EAR, easeInOut(ans)), mood: ans > 0.5 ? 'grin' : 'smile', look: 0.5 });
      const h = hp(R.o, 0.55, 'R');
      tf(R.ph.g, lerp(328, h.x, easeInOut(ans)), lerp(124, h.y - 3, easeInOut(ans)), lerp(90, 0, ans), 0.55);
      R.ring(t > 3.6 && t < 4.1 ? 1 : 0, (t * 2) % 1, 332, 112, 1, 0.5);
    }
  };
}
