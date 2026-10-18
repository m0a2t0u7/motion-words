// install：携帯の画面で入手ボタンを押すと進行バーが満ち、新しいアプリのアイコンがホーム画面に加わる（例文 I installed a new app on my phone.）
import { seg, lerp, easeInOut, easeOut, backOut, hump } from '../ease.js';
import { hp, reach } from './dig.js';

export const meta = { duration: 5.2, beats: [[0, 'アプリの画面'], [1.4, '入れている'], [3.6, 'ホームに追加']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: 'indoor' });
  el('rect', { x: 0, y: 200, width: 400, height: 14, fill: '#F2DDBB' });
  el('rect', { x: 0, y: 200, width: 400, height: 2, fill: '#fff', opacity: 0.6 });
  // 机の上に立てた携帯（大きめ）
  const PX = 214, PY = 36, PW = 84, PH = 164;
  k.shadow(PX + PW / 2, 202, 44, 5);
  el('rect', { x: PX, y: PY, width: PW, height: PH, rx: 14, fill: '#2A3242' });
  el('rect', { x: PX + 5, y: PY + 6, width: PW - 10, height: PH - 12, rx: 10, fill: '#fff' });
  // 画面1：ストア画面
  const s1 = g({});
  const ic = (parent, x, y, s, c = pal.violet) => {
    const n = g({}, parent); tf(n, x, y, 0, s);
    el('rect', { x: -14, y: -14, width: 28, height: 28, rx: 8, fill: c }, n);
    el('path', { d: 'M 0 -8 L 2.4 -2.5 L 8 -2.2 L 3.6 1.4 L 5 7 L 0 3.8 L -5 7 L -3.6 1.4 L -8 -2.2 L -2.4 -2.5 Z', fill: '#fff' }, n);
    return n;
  };
  ic(s1, PX + PW / 2, PY + 56, 1.7);
  el('rect', { x: PX + 22, y: PY + 94, width: 40, height: 5, rx: 2.5, fill: pal.sub }, s1);
  el('rect', { x: PX + 28, y: PY + 104, width: 28, height: 4, rx: 2, fill: pal.line }, s1);
  const btn = el('rect', { x: PX + 10, y: PY + 122, width: 52, height: 20, rx: 10, fill: pal.blue }, s1);
  const btnT = k.text(PX + 36, PY + 132, 'GET', { 'font-size': 10, fill: '#fff' }, s1);
  const bar = el('rect', { x: PX + 10, y: PY + 130, width: 0, height: 4, rx: 2, fill: pal.blue }, s1);
  const barBg = el('rect', { x: PX + 10, y: PY + 130, width: 52, height: 4, rx: 2, fill: pal.line, opacity: 0 }, s1);
  s1.insertBefore(barBg, bar);
  // 画面2：ホーム画面
  const s2 = g({});
  const cols = ['#FFCF5C', '#5FCDB8', '#FF8E77', '#6AA8F7', '#B8C2CF', '#FFCF5C'];
  let ni = 0;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
    const x = PX + 22 + c * 20 * 1.0 + c * 0, y = PY + 24 + r * 30;
    if (r === 1 && c === 1) continue;
    const n = g({}, s2); tf(n, x + 4, y, 0, 0.8);
    el('rect', { x: -10, y: -10, width: 20, height: 20, rx: 6, fill: cols[(ni++) % cols.length], opacity: 0.55 }, n);
  }
  const newIc = ic(s2, PX + 46, PY + 54, 1);
  const badge = g({}, s2); tf(badge, PX + 54, PY + 44);
  el('circle', { r: 7, fill: pal.green }, badge);
  el('path', { d: 'M -3.4 0 L -1 2.6 L 3.6 -2.6', stroke: '#fff', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, badge);
  const S = 1.0;
  const me = k.buddy({ x: 178, y: FY, scale: S });
  el('rect', { x: 0, y: 214, width: 400, height: 40, fill: pal.wood });
  el('rect', { x: 0, y: 214, width: 400, height: 3, fill: pal.woodDark, opacity: 0.4 });
  const hand = el('circle', { r: 6.5 * S, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 2.4 });
  const BX = PX + 36, BY = PY + 132;

  return {
    update(t) {
      const reachP = easeInOut(seg(t, 0.5, 1.2)), tap = hump(seg(t, 1.1, 1.5)), away = easeInOut(seg(t, 1.7, 2.3));
      me.pose({ x: 178, armL: 8, lean: 3, look: 0.5, mood: t > 3.6 ? 'grin' : 'smile', squash: 1, armR: 30 });
      const ty = lerp(BY, PY + 70, 0) - 0;
      const a = lerp(30, reach(me, S, 'R', PX + 14, BY - 10 * (1 - tap)), reachP);
      me.pose({ armR: lerp(a, 24, away) });
      const h = hp(me, S, 'R', 26);
      k.set(hand, { cx: h.x, cy: h.y });
      const p = seg(t, 1.6, 3.2);
      bar.setAttribute('width', 52 * easeInOut(p));
      barBg.setAttribute('opacity', t > 1.55 ? 1 : 0);
      btn.setAttribute('opacity', t > 1.55 ? 0 : 1); btnT.setAttribute('opacity', t > 1.55 ? 0 : 1);
      btn.setAttribute('fill', tap > 0.3 ? pal.blueDark : pal.blue);
      const home = t >= 3.3;
      s1.setAttribute('opacity', home ? 0 : 1);
      s2.setAttribute('opacity', home ? 1 : 0);
      const pop = seg(t, 3.3, 4.0);
      tf(newIc, PX + 46, PY + 54, 0, backOut(pop) * 1.0 + 0.001);
      tf(badge, PX + 54, PY + 44, 0, backOut(seg(t, 3.8, 4.3)) + 0.001);
    }
  };
}
