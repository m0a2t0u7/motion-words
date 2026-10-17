// log in：IDとパスワードを入力して「ログイン」を押すと、画面の中へ入れる（例文 I can't log in to my account.）
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'ID・パスワード'], [1.8, 'ボタンを押す'], [3.0, '中に入れた']] };

export function create(k) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  // 机とノートPC
  el('rect', { x: 120, y: 224, width: 270, height: 14, rx: 5, fill: pal.wood });
  el('rect', { x: 136, y: 238, width: 10, height: 14, fill: pal.woodDark });
  el('rect', { x: 364, y: 238, width: 10, height: 14, fill: pal.woodDark });
  el('rect', { x: 196, y: 52, width: 190, height: 140, rx: 10, fill: pal.ink });
  el('rect', { x: 186, y: 190, width: 210, height: 34, rx: 8, fill: '#C9D2DE' });
  const cp = k.clip((c) => el('rect', { x: 204, y: 60, width: 174, height: 124, rx: 5 }, c));
  const scr = g({ 'clip-path': cp });
  el('rect', { x: 204, y: 60, width: 174, height: 124, fill: '#F4F8FC' }, scr);
  const form = g({}, scr);
  el('circle', { cx: 291, cy: 84, r: 14, fill: '#DCE6F2' }, form);
  el('circle', { cx: 291, cy: 80, r: 5, fill: '#fff' }, form);
  el('path', { d: 'M 281 94 q 10 -10 20 0 Z', fill: '#fff' }, form);
  el('rect', { x: 232, y: 108, width: 118, height: 20, rx: 6, fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 2 }, form);
  el('rect', { x: 232, y: 134, width: 118, height: 20, rx: 6, fill: '#fff', stroke: '#C9D2DE', 'stroke-width': 2 }, form);
  const id = k.text(240, 118, '', { 'text-anchor': 'start', 'font-size': 13 }, form);
  const pw = k.text(240, 145, '', { 'text-anchor': 'start', 'font-size': 14, fill: pal.sub }, form);
  const btn = el('rect', { x: 252, y: 160, width: 78, height: 18, rx: 9, fill: pal.blue }, form);
  k.text(291, 169, 'LOG IN', { 'font-size': 10, fill: '#fff' }, form);
  const welcome = g({}, scr);
  const wbg = el('rect', { x: 204, y: 60, width: 174, height: 124, fill: pal.mint }, welcome);
  const wc = el('circle', { cx: 291, cy: 106, r: 20, fill: '#fff' }, welcome);
  k.text(291, 106, 'OK', { 'font-size': 18, fill: pal.mintDark }, welcome);
  el('rect', { x: 247, y: 140, width: 88, height: 10, rx: 5, fill: '#fff', opacity: 0.8 }, welcome);
  el('rect', { x: 262, y: 156, width: 58, height: 8, rx: 4, fill: '#fff', opacity: 0.5 }, welcome);
  const b = k.buddy({ x: 100, y: FY, scale: 1.05 });
  const cur = el('path', { d: 'M 0 0 L 0 16 L 4 12 L 8 20 L 11 18 L 7 11 L 13 11 Z', fill: '#fff', stroke: pal.ink, 'stroke-width': 1.5, 'stroke-linejoin': 'round' });
  return {
    update(t) {
      const n1 = Math.floor(seg(t, 0.2, 0.8) * 5.01), n2 = Math.floor(seg(t, 0.9, 1.5) * 6.01);
      id.textContent = 'ken'.slice(0, 0) + 'user'.slice(0, Math.min(4, n1));
      pw.textContent = '●●●●●●'.slice(0, n2);
      const press = seg(t, 1.75, 1.9);
      const cx = lerp(300, 292, easeOut(seg(t, 1.5, 1.8))), cy = lerp(130, 170, easeOut(seg(t, 1.5, 1.8)));
      tf(cur, cx, cy + 2 * press);
      cur.setAttribute('opacity', t > 1.4 && t < 3.0 ? 1 : 0);
      btn.setAttribute('fill', press > 0.5 && t < 2.1 ? pal.blueDark : pal.blue);
      // 画面の切り替え：ログインフォームが上へ抜けて、中の画面が現れる
      const open = easeInOut(seg(t, 2.2, 3.0));
      tf(form, 0, -130 * open);
      tf(welcome, 0, 0);
      welcome.setAttribute('opacity', seg(t, 2.2, 2.6));
      const typing = (t > 0.2 && t < 1.5);
      const sw = Math.sin(t * 22);
      b.pose({ armR: typing ? 82 + 6 * sw : lerp(82, 30, seg(t, 3.0, 3.4)), armL: typing ? 70 - 6 * sw : lerp(70, 30, seg(t, 3.0, 3.4)), lean: 6, look: 1, mood: t > 3.0 ? 'grin' : 'smile', squash: 1 + 0.01 * sw * (typing ? 1 : 0) });
    }
  };
}
