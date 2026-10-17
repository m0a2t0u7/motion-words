// shake：ドレッシングのボトルを速く振って、分かれていた中身が混ざる（例文 Shake the bottle before you open it.）
import { seg, lerp, easeInOut, easeOut } from '../ease.js';

export const meta = { duration: 4.0, beats: [[0, '分かれている'], [1.2, '振る'], [2.9, '混ざった']] };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a, b, p) => {
  const A = hex(a), B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], p)).toString(16).padStart(2, '0')).join('');
};

export function create(k) {
  const { el, g, tf, pal } = k;
  k.backdrop({ floorY: 236, mood: 'indoor' });
  // キッチンのカウンター
  el('rect', { x: 0, y: 236, width: 400, height: 64, fill: '#EBD3B0' });
  el('rect', { x: 0, y: 236, width: 400, height: 10, fill: pal.wood });
  el('rect', { x: 28, y: 40, width: 74, height: 62, rx: 8, fill: '#DDEFFA' });
  el('line', { x1: 65, y1: 40, x2: 65, y2: 102, stroke: '#FFFFFF', 'stroke-width': 4 });

  const S = 1.3;
  const sh = k.shadow(0, 0, 38, 6);
  const FINAL = '#F4A04C';
  // 腕（画面の外から入ってくる）と手
  const armLn = el('line', { x1: -30, y1: 230, x2: 0, y2: 0, stroke: pal.mintDark, 'stroke-width': 15, 'stroke-linecap': 'round' });
  const armRn = el('line', { x1: 430, y1: 230, x2: 0, y2: 0, stroke: pal.mintDark, 'stroke-width': 15, 'stroke-linecap': 'round' });

  // 速く振る動きの線
  const lines = g({});
  const mkLine = (x, y, dir) => el('path', { d: `M ${x} ${y} q ${dir * 8} 22 0 44`, fill: 'none', stroke: pal.sub, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, lines);
  const sl = [mkLine(-60, -20, -1), mkLine(-72, -10, -1), mkLine(60, -20, 1), mkLine(72, -10, 1)];

  // ボトル（原点＝本体の中心）
  const bottle = g({});
  const outline = 'M -9 -52 L 9 -52 L 9 -38 Q 22 -30 22 -14 L 22 38 Q 22 48 12 48 L -12 48 Q -22 48 -22 38 L -22 -14 Q -22 -30 -9 -38 Z';
  el('path', { d: outline, fill: '#F4F8FC' }, bottle);
  const clipId = k.clip((cp) => el('path', { d: outline }, cp));
  const liquid = g({ 'clip-path': clipId }, bottle);
  const bot = el('rect', { x: -30, y: -10, width: 60, height: 74, fill: pal.coral }, liquid);
  const top = el('path', { d: '', fill: pal.yellow }, liquid);
  const bubbles = [0, 1, 2, 3, 4].map((i) => el('circle', { r: 2 + (i % 3), fill: '#FFFFFF', opacity: 0 }, liquid));
  el('path', { d: outline, fill: 'none', stroke: '#C5CEDA', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, bottle);
  el('rect', { x: -16, y: -30, width: 5, height: 52, rx: 2.5, fill: '#FFFFFF', opacity: 0.6 }, bottle);
  el('rect', { x: -12, y: -63, width: 24, height: 14, rx: 5, fill: pal.red }, bottle);
  el('rect', { x: -12, y: -55, width: 24, height: 3, fill: '#D94F43' }, bottle);

  const handL = el('circle', { r: 9, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 3 });
  const handR = el('circle', { r: 9, fill: pal.mint, stroke: pal.mintDark, 'stroke-width': 3 });

  const REST = 178, UP = 128, CXB = 200;
  return {
    update(t) {
      // 腕が入ってきてボトルをつかみ、持ち上げる
      const grab = easeOut(seg(t, 0.35, 1.0));
      const lift = easeInOut(seg(t, 1.0, 1.4));
      // 振る：だんだん速く大きく → 止まる
      const amp = easeOut(seg(t, 1.2, 1.6)) * (1 - easeInOut(seg(t, 2.6, 2.95)));
      const w = Math.sin((t - 1.2) * 21);
      const bx = CXB + 5 * amp * Math.sin((t - 1.2) * 21 + 1.2);
      const by = lerp(REST, UP, lift) + 18 * amp * w;
      const rot = 7 * amp * Math.sin((t - 1.2) * 21 + 0.6);
      tf(bottle, bx, by, rot, S, S);
      const high = Math.max(0, (REST - by) / 90);
      tf(sh, CXB + 4, 238, 0, 1 - high * 0.4, 1);
      sh.setAttribute('opacity', 1 - high * 0.4);

      // 手の位置（ボトルに追従）。最後に左手だけふたの近くへ
      const toCap = easeInOut(seg(t, 3.0, 3.55));
      const loc = (lx, ly) => {
        const a = (rot * Math.PI) / 180;
        return [bx + (lx * Math.cos(a) - ly * Math.sin(a)) * S, by + (lx * Math.sin(a) + ly * Math.cos(a)) * S];
      };
      const [lx0, ly0] = loc(-27, 8);
      const [lx1, ly1] = loc(-27, -56);
      const [rx, ry] = loc(27, 14);
      const lAx = lerp(lx0, lx1, toCap), lAy = lerp(ly0, ly1, toCap);
      const away = 1 - grab;
      const hlx = lerp(-40, lAx, grab), hly = lerp(215, lAy, grab);
      const hrx = lerp(440, rx, grab), hry = lerp(215, ry, grab);
      k.set(handL, { cx: hlx, cy: hly });
      k.set(handR, { cx: hrx, cy: hry });
      k.set(armLn, { x1: -30, y1: 235, x2: hlx, y2: hly });
      k.set(armRn, { x1: 430, y1: 235, x2: hrx, y2: hry });

      // 中身：境目が波打って混ざり、1色になる
      const m = easeInOut(seg(t, 1.3, 2.7));
      const wave = 7 * amp * (1 - m * 0.7);
      let d = 'M -30 -22 L 30 -22 L 30 14';
      for (let x = 30; x >= -30; x -= 6) d += ` L ${x} ${14 + wave * Math.sin(x * 0.22 + (t - 1.2) * 18)}`;
      d += ' Z';
      k.set(top, { d, fill: mix(pal.yellow, FINAL, m) });
      k.set(bot, { fill: mix(pal.coral, FINAL, m) });
      bubbles.forEach((c, i) => {
        const o = amp * Math.sin(Math.PI * seg(t, 1.3, 2.9)) * 0.7;
        k.set(c, { cx: 15 * Math.sin(t * (5 + i * 1.7) + i * 2), cy: 12 + 26 * Math.sin(t * (7 + i) + i * 3), opacity: Math.max(0, o) });
      });

      // 動きの線
      lines.setAttribute('opacity', amp * (0.55 + 0.45 * Math.abs(w)));
      tf(lines, bx, by + 6 * w);
    }
  };
}
