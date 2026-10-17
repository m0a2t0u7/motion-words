// start up：電源ボタンを押し、待ち時間のあいだ時計の秒針が1周して、デスクトップが立ち上がる（例文 The computer takes a minute to start up.）
import { seg, lerp, easeInOut, easeOut, easeIn, hump, wobble } from '../ease.js';

export const meta = { duration: 4.6, beats: [[0, '電源を押す'], [1.8, '1分待つ'], [3.7, '起動した']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 30, y: 50, width: 64, height: 50, rx: 6, fill: '#DDEFFA', stroke: '#fff', 'stroke-width': 5 });
  const clock = g({});
  tf(clock, 118, 92);
  el('circle', { r: 24, fill: '#fff', stroke: pal.coral, 'stroke-width': 4 }, clock);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: Math.sin(a) * 19, y1: -Math.cos(a) * 19, x2: Math.sin(a) * 22, y2: -Math.cos(a) * 22, stroke: pal.sub, 'stroke-width': 1.6 }, clock); }
  el('line', { x1: 0, y1: 0, x2: 0, y2: -13, stroke: pal.ink, 'stroke-width': 3, 'stroke-linecap': 'round' }, clock);
  const sec = g({}, clock);
  el('line', { x1: 0, y1: 4, x2: 0, y2: -19, stroke: pal.red, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, sec);
  el('circle', { r: 2.5, fill: pal.red }, clock);
  // 机
  el('rect', { x: 180, y: 192, width: 220, height: 9, rx: 3, fill: pal.wood });
  el('rect', { x: 190, y: 201, width: 8, height: 35, fill: pal.woodDark });
  el('rect', { x: 384, y: 201, width: 8, height: 35, fill: pal.woodDark });
  k.shadow(300, 237, 100, 5);
  // 本体（左：電源ボタンに手が届く位置）
  el('rect', { x: 188, y: 132, width: 38, height: 60, rx: 6, fill: '#E3E8F0', stroke: '#C5CDD9', 'stroke-width': 2 });
  el('rect', { x: 194, y: 140, width: 26, height: 5, rx: 2, fill: '#B8C2D0' });
  el('rect', { x: 194, y: 148, width: 26, height: 5, rx: 2, fill: '#B8C2D0' });
  const pled = el('circle', { cx: 201, cy: 183, r: 3.5, fill: '#59647A' });
  const ring = el('circle', { cx: 201, cy: 183, r: 6.5, fill: 'none', stroke: '#B8C2D0', 'stroke-width': 1.5 });
  // モニター
  el('rect', { x: 296, y: 170, width: 12, height: 22, fill: '#A9B4C4' });
  el('rect', { x: 278, y: 188, width: 48, height: 5, rx: 2.5, fill: '#8D98AA' });
  el('rect', { x: 250, y: 98, width: 104, height: 76, rx: 8, fill: '#3C4558' });
  el('rect', { x: 256, y: 104, width: 92, height: 62, rx: 3, fill: '#0F141F' });
  const content = g({});
  tf(content, 302, 135);
  el('rect', { x: -46, y: -31, width: 92, height: 62, rx: 3, fill: '#CFE3FA' }, content);
  el('rect', { x: -38, y: -24, width: 48, height: 32, rx: 3, fill: '#fff' }, content);
  el('rect', { x: -38, y: -24, width: 48, height: 7, rx: 3, fill: pal.blue }, content);
  [-12, -5, 2].forEach((y, i) => el('rect', { x: -33, y, width: 38 - i * 8, height: 3, rx: 1.5, fill: '#C5CDD9' }, content));
  el('rect', { x: 14, y: -20, width: 26, height: 22, rx: 3, fill: pal.yellow }, content);
  el('rect', { x: 18, y: -12, width: 8, height: 10, rx: 2, fill: pal.coral }, content);
  el('rect', { x: 29, y: -8, width: 8, height: 6, rx: 2, fill: pal.green }, content);
  el('rect', { x: -46, y: 24, width: 92, height: 7, fill: '#8FB4E8' }, content);
  const boot = g({});
  const spin = el('path', { d: 'M 302 118 A 10 10 0 1 1 292 128', fill: 'none', stroke: '#fff', 'stroke-width': 3, 'stroke-linecap': 'round' }, boot);
  el('rect', { x: 272, y: 148, width: 60, height: 6, rx: 3, fill: '#2C3548' }, boot);
  const bar = el('rect', { x: 272, y: 148, width: 0, height: 6, rx: 3, fill: pal.green }, boot);
  el('path', { d: 'M 262 108 L 290 108 L 262 130 Z', fill: '#fff', opacity: 0.07 });
  const mled = el('circle', { cx: 302, cy: 170, r: 1.8, fill: pal.green });
  el('rect', { x: 262, y: 186, width: 60, height: 6, rx: 2, fill: '#F2F4F8', stroke: '#D5DBE5', 'stroke-width': 1 });
  const b = k.buddy({ x: 150, y: FY, scale: 0.85 });
  const dots = [0, 1, 2].map((i) => el('circle', { cx: 140 + i * 10, cy: 150, r: 2.8, fill: pal.sub }));
  const PB = { x: 199, y: 183 };
  return {
    update(t) {
      const press = easeOut(seg(t, 0.55, 0.65));
      const reach = easeOut(seg(t, 0.1, 0.5)), back = easeInOut(seg(t, 0.85, 1.3));
      const arm = lerp(lerp(8, 100, reach), 8, back) + 6 * press * (1 - back);
      const done = t > 3.5;
      const hop = hump(seg(t, 3.55, 4.1)) * 10;
      const wait = t > 1.0 && t < 3.5;
      b.pose({ x: 150, lift: hop, armR: done ? lerp(8, 140, easeOut(seg(t, 3.5, 3.8))) : arm, armL: done ? lerp(8, 140, easeOut(seg(t, 3.5, 3.8))) : 8, lean: 3 * reach * (1 - back), mood: done ? 'grin' : wait ? 'flat' : 'smile', look: wait ? Math.sin(t * 2.4) * 0.9 : 0.7 });
      pled.setAttribute('fill', t > 0.62 ? pal.green : '#59647A');
      // 起動画面：スピナーと進行バー → デスクトップ
      const on = t > 0.95 ? 1 : 0;
      const prog = easeInOut(seg(t, 1.0, 3.4));
      const bootOn = on && t < 3.5 ? 1 : 0;
      boot.setAttribute('opacity', bootOn);
      bar.setAttribute('width', 60 * prog);
      tf(spin, 0, 0, 0);
      spin.setAttribute('transform', `rotate(${(t * 420) % 360} 302 128)`);
      const dp = easeOut(seg(t, 3.45, 3.75));
      tf(content, 302, 135, 0, 0.9 + 0.1 * dp, 0.9 + 0.1 * dp);
      content.setAttribute('opacity', dp);
      mled.setAttribute('fill', t > 0.95 ? pal.green : '#59647A');
      // 時計の秒針：待ち時間で1周
      sec.setAttribute('transform', `rotate(${360 * seg(t, 1.0, 3.4)})`);
      dots.forEach((d, i) => d.setAttribute('opacity', wait ? (Math.floor(t * 3) % 4 > i ? 1 : 0.2) : 0));
      tf(content, 302, 135, 0, 0.9 + 0.1 * dp, 0.9 + 0.1 * dp);
    }
  };
}
