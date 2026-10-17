// spill：まめの腕がうっかりカップに当たり、コーヒーがテーブルにこぼれる（例文 I spilled coffee on the table.）
import { seg, lerp, easeInOut, easeOut, easeIn, wobble, clamp } from '../ease.js';

export const meta = { duration: 3.9, beats: [[0, '置いてある'], [1.2, 'ぶつかる'], [2.2, 'こぼれる']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 262, mood: 'indoor' });
  // 窓
  el('rect', { x: 36, y: 34, width: 76, height: 70, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 74, y1: 34, x2: 74, y2: 104, stroke: '#FFFFFF', 'stroke-width': 4 });
  // テーブル（天板の面・手前の厚み・脚）
  const BASE = 224, PX = 256; // カップの底の高さ、倒れるときの支点（右下の角）
  el('rect', { x: 205, y: 244, width: 12, height: 26, rx: 3, fill: pal.woodDark });
  el('rect', { x: 372, y: 244, width: 12, height: 26, rx: 3, fill: pal.woodDark });
  el('rect', { x: 186, y: 208, width: 230, height: 28, rx: 6, fill: '#F1DDBB' });
  el('rect', { x: 186, y: 234, width: 230, height: 12, rx: 4, fill: pal.wood });
  k.shadow(290, 272, 110, 6);

  // こぼれたコーヒー
  const puddle = el('ellipse', { cx: PX + 38, cy: BASE + 3, rx: 1, ry: 1, fill: pal.coffee });
  const puddleHi = el('ellipse', { cx: PX + 20, cy: BASE + 1, rx: 1, ry: 1, fill: '#B07A57', opacity: 0.55 });
  const cupSh = k.shadow(PX - 22, BASE + 3, 30, 5);

  // カップ（原点＝右下の角。倒れるときはここを支点に回る）
  const cup = g({});
  const body = g({}, cup);
  el('path', { d: 'M -44 -40 Q -66 -40 -64 -26 Q -62 -12 -44 -14', fill: 'none', stroke: pal.coral, 'stroke-width': 7, 'stroke-linecap': 'round' }, body);
  const bodyD = 'M -44 -52 L 0 -52 L 0 -9 Q 0 0 -9 0 L -35 0 Q -44 0 -44 -9 Z';
  el('path', { d: bodyD, fill: '#FFFFFF', stroke: '#CBD3DE', 'stroke-width': 3, 'stroke-linejoin': 'round' }, body);
  const clipId = k.clip((cp) => el('path', { d: 'M -41 -50 L -3 -50 L -3 -9 Q -3 -3 -9 -3 L -35 -3 Q -41 -3 -41 -9 Z' }, cp));
  const inner = g({ 'clip-path': clipId }, body);
  const cof = g({}, inner);
  el('rect', { x: -200, y: 0, width: 400, height: 220, fill: pal.coffee }, cof);
  el('rect', { x: -200, y: 0, width: 400, height: 4, fill: '#A87350' }, cof);
  const mouthRim = el('ellipse', { cx: -22, cy: -52, rx: 22, ry: 5, fill: '#EEF1F5', stroke: '#CBD3DE', 'stroke-width': 3 }, body);
  el('rect', { x: -38, y: -34, width: 36, height: 8, rx: 4, fill: pal.coral, opacity: 0.22 }, body);
  el('ellipse', { cx: -33, cy: -26, rx: 3, ry: 10, fill: '#FFFFFF', opacity: 0.8 }, body);

  // 湯気
  const steams = [0, 1].map(() => {
    const s = g({});
    el('path', { d: 'M 0 0 C 8 -8 -8 -17 0 -26 S 8 -42 0 -50', fill: 'none', stroke: '#BFCBDA', 'stroke-width': 4, 'stroke-linecap': 'round' }, s);
    return s;
  });
  const burst = g({});
  [-50, 0, 50].forEach((a) => el('line', { x1: 8, y1: 0, x2: 22, y2: 0, stroke: pal.coralDark, 'stroke-width': 3.5, 'stroke-linecap': 'round', transform: `rotate(${a - 180})` }, burst));
  const stream = el('path', { d: '', fill: 'none', stroke: pal.coffee, 'stroke-width': 6, 'stroke-linecap': 'round' });

  const b = k.buddy({ x: 60, y: 272, scale: 1 });
  const bang = k.text(0, 0, '!', { 'font-size': 30, fill: pal.coralDark });

  const rad = Math.PI / 180;
  return {
    update(t) {
      // ---- まめ：横を向いたまま歩いてきて、腕がカップに当たる ----
      const wk = seg(t, 0.25, 1.35);
      const hit = seg(t, 1.05, 1.36);
      const recoil = easeOut(seg(t, 1.4, 1.85));
      const x = lerp(60, 144, easeInOut(wk)) - 10 * recoil;
      const walking = t > 0.25 && t < 1.38;
      const sw = Math.sin((t - 0.25) * 9) * 18;
      const arm = lerp(8 + sw, 125, easeIn(hit));
      const surprised = t > 1.45;
      const up = easeOut(seg(t, 1.45, 1.8));
      b.pose({
        x,
        walk: walking ? (t - 0.25) * 9 : 0,
        armR: surprised ? lerp(125, 138, up) : walking ? arm : 8,
        armL: surprised ? lerp(8, 122, up) : walking ? 8 - sw : 8,
        look: surprised ? 0.8 : -0.8,
        lean: surprised ? -9 * recoil : 3 * hit,
        mood: surprised ? 'open' : 'smile',
        squash: surprised ? 1 - 0.05 * wobble(seg(t, 1.45, 2.3), 2, 3) : 1
      });
      const bs = easeOut(seg(t, 1.55, 1.75));
      tf(bang, x - 6, 150 - 10 * bs, 0, bs * 1.0, bs * 1.0);
      bang.setAttribute('opacity', t < 1.55 ? 0 : 1 - seg(t, 3.1, 3.5) * 0.0);

      // ---- カップ：当たられて、支点を中心にゆっくり→加速して倒れる ----
      const fall = easeIn(seg(t, 1.34, 2.1));
      const th = 90 * fall + (t > 2.1 ? -5 * wobble(seg(t, 2.1, 2.8), 2, 4) * (1 - 0) : 0);
      const slide = 6 * easeOut(seg(t, 1.34, 2.3));
      tf(cup, PX + slide, BASE);
      tf(body, 0, 0, th);
      // コーヒーの水面は水平のまま。倒れるにつれ量が減る
      const fl = lerp(33, 3, easeInOut(seg(t, 1.5, 2.45)));
      tf(cof, 0, 0, -th);
      k.set(cof.firstChild, { y: -fl });
      k.set(cof.children[1], { y: -fl });
      const cx = PX + slide - 22 + 26 * fall;
      tf(cupSh, cx, BASE + 3, 0, 1 + 0.15 * fall, 1);

      k.set(mouthRim, { opacity: seg(th, 40, 75) });
      const bq = seg(t, 1.34, 1.7);
      tf(burst, 186, 190, 0, 0.6 + bq * 0.8, 0.6 + bq * 0.8);
      burst.setAttribute('opacity', bq > 0 && bq < 1 ? 1 - bq : 0);
      // 湯気は倒れるまで
      steams.forEach((s, i) => {
        const ph = (t * 0.5 + i / 2) % 1;
        tf(s, PX - 22 + (i ? 9 : -9), BASE - 58 - ph * 10);
        s.setAttribute('opacity', (1 - seg(t, 1.3, 1.6)) * Math.sin(Math.PI * ph) * 0.9);
      });

      // ふちから流れ出るコーヒー
      const lx = PX + slide + 52 * Math.sin(th * rad);
      const ly = BASE - 52 * Math.cos(th * rad);
      const flow = seg(th, 30, 48) * (1 - seg(t, 2.35, 2.9));
      if (flow > 0.02) {
        const ex = lx + 26 * (1 - flow * 0.2);
        k.set(stream, { d: `M ${lx} ${ly} Q ${lx + 14} ${ly + 2} ${ex} ${BASE + 2}`, opacity: 1, 'stroke-width': 3 + 4 * flow });
      } else k.set(stream, { opacity: 0 });

      // 広がる水たまり
      const pp = easeOut(seg(t, 1.75, 3.3));
      k.set(puddle, { cx: PX + 50 + 14 * pp, rx: 2 + 54 * pp, ry: 1 + 9 * pp });
      puddle.setAttribute('opacity', pp > 0 ? 1 : 0);
      puddleHi.setAttribute('opacity', pp > 0 ? 0.55 : 0);
      k.set(puddleHi, { cx: PX + 62 + 12 * pp, rx: 1 + 24 * pp, ry: 0.5 + 2.6 * pp });
    }
  };
}
