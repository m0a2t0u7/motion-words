// elbow：食卓でテーブルにひじをついていると、お母さんが首をふって注意。ひじを下ろして座り直す（例文 Don't put your elbows on the table.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { hp, reach, P, blinkAt, bp, limb, spot } from './body.js';
import { sideTable, dish } from './restaurant.js';
import { homeBg } from './furniture.js';
import { mark } from './so-far-so-good.js';
import { say } from './look-over.js';

export const meta = { duration: 4.4, beats: [[0, 'ひじをつく'], [1.2, 'ひじはダメ'], [2.6, '座り直す']] };

export function create(k) {
  const { el, g, tf, pal } = k, S = 1.1, FY = 240;
  homeBg(k, { FY, winX: 160 });
  const A = k.buddy({ x: 112, y: FY - 20, scale: S, facing: 1 });
  A.armR.a.setAttribute('display', 'none');
  const M = k.buddy({ x: 300, y: FY - 4, scale: 1.05, facing: -1, color: pal.coral, dark: pal.coralDark });
  const TOP = FY - 62;
  sideTable(k, 210, TOP, 170, FY, '#FFF3E4');
  const d = dish(k); tf(d.g, 168, TOP - 2);
  const arm = limb(k, pal.mint, pal.mintDark, S);
  const ring = spot(k, pal.red);
  const sm = say(k, 46, 32, 1); mark(k, 'x', sm.g, 0.9);
  return {
    update(t) {
      const fix = easeInOut(seg(t, 2.4, 3.0));
      P(A, { y: FY - 20, lean: lerp(14, 0, fix), look: 0.4, mood: fix > 0.5 ? 'smile' : 'flat', blink: blinkAt(t), armL: 10 });
      const sh = bp(A, S, 27, -46), chin = bp(A, S, 22, -40);
      const elbow0 = { x: sh.x + 18, y: TOP - 2 };
      // ひじをついたほおづえ → 手をひざへ
      const handP = { x: lerp(chin.x + 2, sh.x + 16, fix), y: lerp(chin.y, TOP + 14, fix) };
      const r = arm.set(sh, handP, fix > 0.5 ? 1 : -1);
      void r;
      ring.set(seg(t, 0.3, 0.7) * (1 - seg(t, 2.4, 2.6)), elbow0.x, elbow0.y, 14, t);
      const warn = easeOut(seg(t, 1.0, 1.3)) * (1 - easeInOut(seg(t, 2.8, 3.2)));
      P(M, { look: 0.5, mood: t > 3.2 ? 'smile' : 'flat', blink: blinkAt(t, 1), armR: lerp(10, 150, warn) + 10 * Math.sin(t * 14) * warn, armL: 10 });
      M.body.children[3].setAttribute('transform', `translate(${(3 * Math.sin(t * 9) * warn).toFixed(2)} 0)`);
      sm.show(warn, 284, 104);
    }
  };
}
