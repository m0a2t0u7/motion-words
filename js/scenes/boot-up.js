// boot up：ノートパソコンの電源を入れ、起動の文字と砂時計でじれったく待ち、やっとデスクトップが立ち上がる（例文 It takes a long time for my laptop to boot up.）
import { seg, lerp, easeInOut, easeOut, hump } from '../ease.js';

export const meta = { duration: 4.8, beats: [[0, '電源を入れる'], [1.9, '長い起動'], [3.9, 'やっと起動']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 250, y: 40, width: 84, height: 56, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  el('line', { x1: 292, y1: 40, x2: 292, y2: 96, stroke: '#fff', 'stroke-width': 4 });
  // 机
  el('rect', { x: 96, y: 192, width: 304, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: 108, y: 201, width: 8, height: 35, fill: pal.woodDark });
  el('rect', { x: 384, y: 201, width: 8, height: 35, fill: pal.woodDark });
  k.shadow(250, 237, 140, 5);
  // ノートパソコン
  el('rect', { x: 198, y: 94, width: 94, height: 82, rx: 8, fill: '#3C4558' });
  el('rect', { x: 204, y: 100, width: 82, height: 66, rx: 3, fill: '#0F141F' });
  const con = g({});
  const lines = [50, 38, 58, 30, 48, 36].map((w, i) => {
    const l = el('rect', { x: 210, y: 106 + i * 8, width: w, height: 3.5, rx: 1.75, fill: '#7BE0A5' }, con);
    return { l, w };
  });
  el('rect', { x: 210, y: 156, width: 70, height: 5, rx: 2.5, fill: '#2C3548' }, con);
  const bar = el('rect', { x: 210, y: 156, width: 0, height: 5, rx: 2.5, fill: pal.green }, con);
  const cursor = el('rect', { x: 0, y: 0, width: 5, height: 5, fill: '#7BE0A5' }, con);
  const desk = g({});
  el('rect', { x: 204, y: 100, width: 82, height: 66, rx: 3, fill: '#CFE3FA' }, desk);
  el('rect', { x: 212, y: 108, width: 44, height: 30, rx: 3, fill: '#fff' }, desk);
  el('rect', { x: 212, y: 108, width: 44, height: 7, rx: 3, fill: pal.blue }, desk);
  [120, 127].forEach((y, i) => el('rect', { x: 217, y, width: 32 - i * 8, height: 3, rx: 1.5, fill: '#C5CDD9' }, desk));
  [[262, 110, pal.yellow], [262, 124, pal.coral], [262, 138, pal.green]].forEach(([x, y, c]) => el('rect', { x, y, width: 16, height: 11, rx: 3, fill: c }, desk));
  el('rect', { x: 204, y: 158, width: 82, height: 8, fill: '#8FB4E8' }, desk);
  el('path', { d: 'M 210 104 L 240 104 L 210 128 Z', fill: '#fff', opacity: 0.07 });
  el('path', { d: 'M 172 192 L 196 174 L 294 174 L 310 192 Z', fill: '#DDE3EC', stroke: '#C5CDD9', 'stroke-width': 1.5 });
  el('rect', { x: 206, y: 180, width: 70, height: 6, rx: 2, fill: '#C5CDD9', opacity: 0.8 });
  const pb = el('circle', { cx: 184, cy: 184, r: 3.4, fill: '#8D98AA' });
  // 砂時計
  const hg = g({});
  el('rect', { x: 316, y: 142, width: 32, height: 5, rx: 2, fill: pal.woodDark }, hg);
  el('rect', { x: 316, y: 188, width: 32, height: 5, rx: 2, fill: pal.woodDark }, hg);
  const sand1 = el('polygon', { points: '0,0', fill: pal.yellow }, hg);
  const sand2 = el('polygon', { points: '0,0', fill: pal.yellow }, hg);
  const stream = el('line', { x1: 332, y1: 166, x2: 332, y2: 188, stroke: pal.yellow, 'stroke-width': 1.8 }, hg);
  el('path', { d: 'M 320 147 L 344 147 L 335 166 L 344 188 L 320 188 L 329 166 Z', fill: '#DDEFFA', opacity: 0.45, stroke: '#8D98AA', 'stroke-width': 2, 'stroke-linejoin': 'round' }, hg);
  const b = k.buddy({ x: 138, y: FY, scale: 0.85 });
  const dots = [0, 1, 2].map((i) => el('circle', { cx: 130 + i * 10, cy: 150, r: 2.8, fill: pal.sub }));
  const zz = g({});
  k.text(0, 0, 'Z', { 'font-size': 16, fill: pal.violet }, zz);

  return {
    update(t) {
      const press = easeOut(seg(t, 0.55, 0.65));
      const reach = easeOut(seg(t, 0.1, 0.5)), back = easeInOut(seg(t, 0.85, 1.3));
      const yawn = hump(seg(t, 2.3, 3.2));
      const done = t > 3.8;
      let arm = lerp(lerp(8, 120, reach), 8, back) + 5 * press * (1 - back);
      arm = lerp(arm, 150, yawn);
      const cheer = easeOut(seg(t, 3.8, 4.1));
      b.pose({
        x: 138, lift: hump(seg(t, 3.85, 4.4)) * 10, armR: done ? lerp(8, 140, cheer) : arm, armL: done ? lerp(8, 140, cheer) : lerp(8, 150, yawn),
        lean: 3 * reach * (1 - back), mood: done ? 'grin' : yawn > 0.3 ? 'open' : t > 1.3 ? 'flat' : 'smile',
        blink: t > 1.3 && t < 3.8 ? (Math.sin(t * 3) > 0.7 ? 0.9 : 0) + yawn * 0.8 : 0, look: t > 1.3 && yawn < 0.3 ? 0.9 : 0.5
      });
      pb.setAttribute('fill', t > 0.62 ? pal.green : '#8D98AA');
      // 起動中の文字
      const boot = t > 0.9 && t < 3.8;
      con.setAttribute('opacity', boot ? 1 : 0);
      let last = -1;
      lines.forEach((o, i) => {
        const a = seg(t, 1.0 + i * 0.42, 1.0 + i * 0.42 + 0.3);
        o.l.setAttribute('width', o.w * a);
        if (a > 0) last = i;
      });
      cursor.setAttribute('x', 212 + (last >= 0 ? lines[last].w : 0));
      cursor.setAttribute('y', 105 + Math.max(0, last) * 8);
      cursor.setAttribute('opacity', Math.sin(t * 12) > 0 ? 1 : 0.2);
      bar.setAttribute('width', 70 * easeInOut(seg(t, 1.0, 3.7)));
      const dp = easeOut(seg(t, 3.75, 4.05));
      desk.setAttribute('opacity', dp);
      // 砂時計：ゆっくり落ちる
      const p = seg(t, 1.0, 3.7);
      const hs = 18 * (1 - p), hb = 16 * p, w = 10 * (1 - p);
      sand1.setAttribute('points', `${332 - w},${166 - hs} ${332 + w},${166 - hs} 332,166`);
      sand2.setAttribute('points', `332,${188 - hb} ${332 + 11 * Math.min(1, hb / 8)},188 ${332 - 11 * Math.min(1, hb / 8)},188`);
      stream.setAttribute('y2', 188 - hb);
      stream.setAttribute('opacity', p > 0 && p < 1 ? 1 : 0);
      dots.forEach((d, i) => d.setAttribute('opacity', boot && yawn < 0.2 ? (Math.floor(t * 3) % 4 > i ? 1 : 0.2) : 0));
      tf(zz, 170, 150 - 10 * yawn, 0, 0.7 + 0.5 * yawn);
      zz.setAttribute('opacity', yawn > 0.3 ? 1 : 0);
    }
  };
}
