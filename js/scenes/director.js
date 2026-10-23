// director：会議室で責任者のまめが立ち上がって開会を告げ、画面に議題が映り、皆がまめを見る（例文 The director opened the meeting.）
import { seg, lerp, easeInOut, easeOut, hump, clamp } from '../ease.js';
import { CO, BL, YE, P, blinkAt, walkTo, path, wear, deskFront, pop } from './member.js';
import { cue, talk } from './in-common.js';

export const meta = { duration: 4.4, beats: [[0, '会議室'], [1.4, '開会を告げる'], [3.0, '会議が始まる']] };

export function create(k) {
  const { el, g, tf, pal } = k, FY = 236;
  k.backdrop({ floorY: FY, mood: 'indoor' });
  el('rect', { x: 0, y: FY - 14, width: 400, height: 14, fill: '#E4E8EE' });
  // スクリーン
  el('rect', { x: 230, y: 26, width: 150, height: 92, rx: 4, fill: '#2B3446' });
  const scr = el('rect', { x: 236, y: 32, width: 138, height: 80, rx: 2, fill: '#3A465C' });
  const ag = g({});
  k.text(305, 46, 'MEETING', { 'font-size': 12, fill: pal.blueDark }, ag);
  [0, 1, 2].forEach((i) => { el('circle', { cx: 252, cy: 64 + i * 14, r: 3, fill: pal.blueDark }, ag); el('rect', { x: 260, y: 61 + i * 14, width: 80 - i * 14, height: 6, rx: 3, fill: '#9FB4CC' }, ag); });
  // 座っている参加者（机の奥）
  const ppl = [[60, CO(k)], [120, BL(k)], [180, YE(k)]].map(([x, c], i) => k.buddy({ x, y: FY - 14, scale: 0.78, facing: 1, ...c }));
  const b = k.buddy({ x: 420, y: FY, scale: 1, facing: -1 }); wear(k, b, 'tie', pal.red);
  deskFront(k, 24, 206, FY - 46, FY);
  [60, 120, 180].forEach((x) => { el('rect', { x: x - 8, y: FY - 52, width: 16, height: 6, rx: 1, fill: '#fff', stroke: pal.line }); });
  const chat = [cue(k, '', 34, 22, 1), cue(k, '', 34, 22, -1)];
  const go = cue(k, "Let's begin!", 96, 30, 1, 13);
  const bx = path([[0.2, 420], [1.2, 300]]);
  return {
    update(t) {
      const w = walkTo(bx, t, 420, -1), open = seg(t, 1.5, 2.0), up = hump(seg(t, 1.4, 2.4));
      P(b, { x: w.x, walk: w.walk, armL: w.armL, armR: lerp(w.armR, 8 + 150 * up, clamp(t - 1.3)), lean: w.lean - 4 * up, facing: -1, blink: blinkAt(t), look: 0.5, mood: talk(t, 1.5, 2.3) || (t > 2.4 ? 'grin' : 'smile') });
      go.show(seg(t, 1.5, 1.8) - seg(t, 3.2, 3.4), 250, 140);
      scr.setAttribute('fill', t > 2.2 ? '#EAF3FF' : '#3A465C');
      tf(ag, 0, 0, 0, 1); ag.setAttribute('opacity', easeOut(seg(t, 2.2, 2.6)));
      ppl.forEach((p, i) => {
        const att = easeInOut(seg(t, 1.5 + i * 0.12, 1.9 + i * 0.12));
        const chatting = t < 1.4 ? Math.sin(t * 6 + i) : 0;
        P(p, { look: lerp(i === 1 ? -0.8 : 0.6, 1, att), facing: att > 0.3 || i !== 1 ? 1 : -1, blink: blinkAt(t, i * 0.7), mood: t < 1.4 ? (i !== 2 && Math.sin(t * 20 + i) > 0 ? 'open' : 'smile') : 'flat', lean: 3 * chatting * (1 - att) });
      });
      chat[0].show(1 - seg(t, 1.3, 1.5), 74, 128); chat[1].show(1 - seg(t, 1.3, 1.5), 108, 120);
    }
  };
}
