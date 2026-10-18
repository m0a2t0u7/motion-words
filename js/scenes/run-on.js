// run on：会議が予定の終了時刻を過ぎても話が続き、さらに1時間のびる（例文 The meeting ran on for another hour.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';
import { P, blinkAt, clock, win } from './run-after.js';
import { bubble } from './weigh.js';

export const meta = { duration: 4.2, beats: [[0, '終わる時刻'], [1.6, 'まだ続く'], [3.6, '1時間のびた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  const w = win(k, 28, 44, 92, 70, '#DDEFFA'); w.frame();
  // ホワイトボード
  el('rect', { x: 266, y: 40, width: 110, height: 70, rx: 5, fill: '#fff', stroke: pal.line, 'stroke-width': 3 });
  [[0, 70, pal.blue], [1, 54, pal.coral], [2, 64, pal.green]].forEach(([i, l, c]) => el('rect', { x: 278, y: 54 + i * 16, width: l, height: 5, rx: 2.5, fill: c, opacity: 0.8 }));
  // 予定の終了時刻のメモと時計
  el('rect', { x: 168, y: 92, width: 64, height: 22, rx: 4, fill: pal.yellow });
  k.text(200, 104, 'END 3:00', { 'font-size': 11 });
  const ck = clock(k, 200, 58, 26);
  const plus = k.text(244, 58, '+1h', { 'font-size': 18, fill: pal.coralDark, opacity: 0 });
  const S = 0.85;
  const a = k.buddy({ x: 128, y: FY, scale: S });
  const c = k.buddy({ x: 272, y: FY, scale: S, facing: -1, color: pal.coral, dark: pal.coralDark });
  // 机（手前）
  el('rect', { x: 110, y: 186, width: 180, height: 10, rx: 4, fill: pal.wood });
  el('rect', { x: 122, y: 196, width: 8, height: 40, fill: pal.woodDark }); el('rect', { x: 270, y: 196, width: 8, height: 40, fill: pal.woodDark });
  el('rect', { x: 150, y: 180, width: 26, height: 6, rx: 1, fill: '#fff', stroke: pal.line });
  el('rect', { x: 226, y: 180, width: 26, height: 6, rx: 1, fill: '#fff', stroke: pal.line });
  k.shadow(200, 237, 92, 5);
  const bA = bubble(k, 44, 26), bC = bubble(k, 44, 26);
  [bA, bC].forEach((bb) => [-8, 0, 8].forEach((x) => el('circle', { cx: x, cy: 0, r: 2.6, fill: pal.sub }, bb)));
  return {
    update(t) {
      ck.set(3, 60 * easeInOut(seg(t, 0.6, 3.5)));
      const turn = Math.floor(t / 0.7) % 2; // 交互に話す
      const talkA = !turn, ph = t * 14;
      P(a, { x: 128, armR: talkA ? 60 + 20 * Math.sin(ph * 0.5) : 20, armL: 10, mood: talkA && Math.sin(ph) > 0 ? 'open' : 'smile', look: 0.6, lean: talkA ? 4 : 0, blink: blinkAt(t) });
      P(c, { x: 272, facing: -1, armR: !talkA ? 60 + 20 * Math.sin(ph * 0.5) : 20, armL: 10, mood: !talkA && Math.sin(ph) > 0 ? 'open' : 'smile', look: 0.6, lean: !talkA ? 4 : 0, blink: blinkAt(t, 1.3) });
      const lt = (t % 0.7) / 0.7;
      tf(bA, 104, 110 - 4 * easeOut(lt)); bA.setAttribute('opacity', talkA ? hump(lt) : 0);
      tf(bC, 296, 110 - 4 * easeOut(lt), 0, -1, 1); bC.setAttribute('opacity', !talkA ? hump(lt) : 0);
      const q = easeOut(seg(t, 3.5, 3.9));
      plus.setAttribute('opacity', q); tf(plus, 0, 6 * (1 - q));
    }
  };
}
