// 図解：絵1枚で意味を出しにくい語（時間・頻度・確からしさ・程度・頭の中・伝える・評価・比べる）を、
// 動く図で見せる形式。データの zu:{ t: 型, ... } で語ごとの違いを出す。動作主はいつも緑のまめ。
// 絵文字は「物・記号」としてだけ使う（人物の絵文字は使わない）。
//   time   : v(-1〜1 の位置) / span:[a,b](範囲) / rep(くり返し回数)
//   freq   : v(0〜1 の割合) / e(くり返す物)
//   sure   : v(0〜1 の確からしさ)
//   degree : v(0〜1.4。1=ちょうど足りる線。1を超えると「多すぎ」)
//   mind   : act('get'|'lose'|'back'|'doubt'|'firm'|'dream'|'pick') / e(頭の中の物)
//   tell   : act('say'|'teach'|'offer'|'no'|'cheer'|'ask'|'loud'|'yes') / e(伝える物)
//   judge  : act('good'|'bad'|'star'|'key'|'ok'|'ng') / v(星の数 1〜5) / e(評価する物)
//   compare: rel('same'|'diff'|'one'|'many'|'near'|'far'|'easy'|'hard') / e, e2
import { seg, lerp, easeInOut, easeOut, backOut, hump, clamp } from './ease.js';

const EF = '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
export const TYPES = ['time', 'freq', 'sure', 'degree', 'mind', 'tell', 'judge', 'compare'];
const BEATS = {
  time: ['いま', '時間をたどる', 'この時'], freq: ['0回から', 'くり返す', 'この割合'], sure: ['どのくらい？', '針がふれる', 'この確かさ'],
  degree: ['からっぽ', 'たまっていく', 'この程度'], mind: ['頭の中', '考える', 'こうなる'], tell: ['相手に', '伝える', '伝わった'],
  judge: ['見てみる', '確かめる', '判定'], compare: ['2つ並べる', '見くらべる', 'こう違う']
};
const DUR = 4.0;

export function metaFor(p) {
  const L = BEATS[p.t] || BEATS.judge;
  return { duration: DUR, beats: [[0, L[0]], [1.0, L[1]], [2.6, L[2]]] };
}

export function create(k, p, item = {}) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 252, mood: 'indoor' });
  const C = { mint: pal.mint, coral: pal.coral, ink: pal.ink, sub: pal.sub, red: '#E5534B', green: '#3FB27F', blue: '#4A8FE0', yellow: '#F2C14E' };
  const emo = (ch, size, parent) => { const gg = g({}, parent); k.text(0, 0, ch, { 'font-size': size, 'font-family': EF, 'text-anchor': 'middle', 'dominant-baseline': 'central' }, gg); return gg; };
  const label = (x, y, s, o = {}) => k.text(x, y, s, { 'font-size': o.size || 13, fill: o.fill || C.sub, 'text-anchor': 'middle', 'font-weight': o.bold ? 700 : 400 });
  // 上の見出し：対象の語
  const chip = g({});
  const w = Math.max(80, (item.en || '').length * 11 + 34);
  el('rect', { x: 200 - w / 2, y: 14, width: w, height: 30, rx: 15, fill: '#FFFFFF', stroke: C.mint, 'stroke-width': 2 }, chip);
  k.text(200, 35, item.en || '', { 'font-size': 18, 'font-weight': 700, fill: C.ink, 'text-anchor': 'middle' }, chip);
  const me = k.buddy({ x: 70, y: FY, scale: 0.8 });
  let mePose = { x: 70, y: FY, armL: 8, armR: 8, lean: 0, squash: 1, walk: 0, look: 0.6, mood: 'smile', blink: 0, lift: 0, facing: 1 };
  const P = (q) => me.pose({ ...mePose, ...q });
  const blink = (t) => (Math.abs(((t + 0.7) % 2.6) - 0.1) < 0.08 ? 1 : 0);
  const v = p.v ?? 0.5;
  let up = () => {};

  if (p.t === 'time') {
    const X = (q) => 200 + q * 140, Y = 150;
    el('line', { x1: 50, y1: Y, x2: 350, y2: Y, stroke: C.ink, 'stroke-width': 3, 'stroke-linecap': 'round' });
    el('path', { d: `M 350 ${Y} l -10 -6 v 12 z`, fill: C.ink });
    label(60, Y + 26, 'past'); label(340, Y + 26, 'future');
    el('line', { x1: 200, y1: Y - 12, x2: 200, y2: Y + 12, stroke: C.mint, 'stroke-width': 4 });
    label(200, Y - 20, 'NOW', { fill: C.mint, bold: true });
    const span = p.span ? el('rect', { x: X(p.span[0]), y: Y - 7, width: 0, height: 14, rx: 7, fill: C.yellow, opacity: 0.8 }) : null;
    const n = p.rep || 1, dots = [];
    for (let i = 0; i < n; i++) dots.push(el('circle', { r: 9, cx: 200, cy: Y, fill: C.coral, stroke: '#fff', 'stroke-width': 2 }));
    up = (t) => {
      const q = easeInOut(seg(t, 0.6, 2.4));
      dots.forEach((d, i) => {
        const tgt = n > 1 ? lerp(-0.8, 0.8, i / (n - 1)) * Math.abs(v || 1) : v;
        const qi = easeOut(seg(t, 0.6 + i * 0.25, 2.2 + i * 0.25));
        k.set(d, { cx: X(lerp(0, tgt, qi)), r: 9 + 3 * hump(seg(t, 2.2 + i * 0.25, 2.8 + i * 0.25)) });
      });
      if (span) { const a = Math.min(p.span[0], p.span[1]), b = Math.max(p.span[0], p.span[1]); k.set(span, { x: X(a), width: (X(b) - X(a)) * q }); }
      const mx = lerp(200, X(n > 1 ? 0 : v), q);
      P({ x: mx - 20, look: v < 0 ? -0.6 : 0.6, armR: 40 + 60 * q, mood: 'smile', blink: blink(t), walk: q > 0 && q < 1 ? t * 9 : 0 });
    };
    mePose.y = FY;
  } else if (p.t === 'freq') {
    const slots = [];
    for (let i = 0; i < 10; i++) {
      const x = 92 + i * 26;
      el('circle', { cx: x, cy: 130, r: 11, fill: '#fff', stroke: '#CFD6DE', 'stroke-width': 2 });
      slots.push(emo(p.e || '⭐', 18));
      tf(slots[i], x, 130, 0, 0);
    }
    label(92, 160, '0%'); label(326, 160, '100%');
    const pct = label(209, 186, '', { size: 20, fill: C.ink, bold: true });
    const N = Math.round(v * 10);
    up = (t) => {
      let shown = 0;
      slots.forEach((s, i) => { const q = backOut(clamp((t - 0.8 - i * 0.16) / 0.3, 0, 1)); const on = i < N ? q : 0; if (on > 0.5) shown++; tf(s, 92 + i * 26, 130, 0, on); });
      pct.textContent = Math.round(shown * 10) + '%';
      P({ x: 50, armR: 30 + 40 * Math.abs(Math.sin(t * 5)) * (t > 0.8 && t < 0.8 + N * 0.16 ? 1 : 0), look: 0.8, blink: blink(t) });
    };
  } else if (p.t === 'sure') {
    const cx = 210, cy = 170, R = 90;
    const arc = (a0, a1, col) => el('path', { d: `M ${cx + R * Math.cos(a0)} ${cy - R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy - R * Math.sin(a1)}`, stroke: col, 'stroke-width': 16, fill: 'none' });
    arc(Math.PI, Math.PI * 2 / 3, '#F2A0A0'); arc(Math.PI * 2 / 3, Math.PI / 3, '#F5D58A'); arc(Math.PI / 3, 0, '#9ED9B8');
    label(cx - R, cy + 24, '0%'); label(cx + R, cy + 24, '100%');
    const nd = g({}); el('line', { x1: 0, y1: 0, x2: R - 14, y2: 0, stroke: C.ink, 'stroke-width': 4, 'stroke-linecap': 'round' }, nd); el('circle', { r: 7, fill: C.ink }, nd);
    const pct = label(cx, cy - 26, '', { size: 18, fill: C.ink, bold: true });
    up = (t) => {
      const q = easeOut(seg(t, 0.8, 2.6)), wob = Math.sin(t * 14) * 6 * (1 - q) * (t > 0.8 ? 1 : 0);
      const ang = 180 - 180 * v * q + wob;
      tf(nd, cx, cy, -ang);
      pct.textContent = Math.round(v * 100 * q) + '%';
      P({ x: 56, armR: 20 + 90 * easeInOut(seg(t, 2.4, 3.0)), look: 0.7, mood: q > 0.9 ? (v > 0.6 ? 'grin' : v < 0.35 ? 'flat' : 'smile') : 'open', blink: blink(t) });
    };
  } else if (p.t === 'degree') {
    const x0 = 140, y0 = 220, H = 150, Wd = 70;
    el('rect', { x: x0, y: y0 - H, width: Wd, height: H, rx: 8, fill: '#fff', stroke: '#CFD6DE', 'stroke-width': 3 });
    const fill = el('rect', { x: x0 + 4, y: y0, width: Wd - 8, height: 0, rx: 5, fill: C.blue });
    const over = el('rect', { x: x0 + 4, y: y0 - H, width: Wd - 8, height: 0, rx: 5, fill: C.red });
    const ly = y0 - H * 0.72;
    el('line', { x1: x0 - 14, y1: ly, x2: x0 + Wd + 14, y2: ly, stroke: C.green, 'stroke-width': 3, 'stroke-dasharray': '6 4' });
    label(x0 + Wd + 50, ly + 5, 'OK', { fill: C.green, bold: true });
    up = (t) => {
      const q = easeInOut(seg(t, 0.6, 2.6)), lv = Math.min(v, 1.38) * q;
      const h = Math.min(lv * 0.72, 1) * (H - 8);
      k.set(fill, { y: y0 - 4 - h, height: h, fill: lv > 1.12 ? C.red : lv >= 0.97 ? C.green : C.blue });
      const oh = lv > 1.38 ? 0 : 0;
      k.set(over, { height: oh });
      const done = t > 2.6;
      P({ x: 290, facing: -1, look: -0.7, armR: 30 + 60 * (done ? 1 : 0), mood: done ? (v > 1.12 ? 'sad' : v >= 0.97 ? 'grin' : v < 0.5 ? 'flat' : 'smile') : 'open', blink: blink(t) });
    };
  } else if (p.t === 'mind') {
    const bub = g({});
    [[0, 0, 62], [-50, 10, 34], [52, 12, 36], [0, 34, 40]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r * 1.2, ry: r * 0.8, fill: '#fff', stroke: '#D7DEE6', 'stroke-width': 2 }, bub));
    tf(bub, 220, 120);
    const dots = [el('circle', { cx: 140, cy: 196, r: 6, fill: '#fff', stroke: '#D7DEE6', 'stroke-width': 2 }), el('circle', { cx: 158, cy: 172, r: 9, fill: '#fff', stroke: '#D7DEE6', 'stroke-width': 2 })];
    const it = emo(p.e || '💡', 52), q2 = emo(p.act === 'pick' ? (p.e2 || '❓') : '❓', 30), q3 = emo(p.e2 || '✨', 28);
    const act = p.act || 'get';
    up = (t) => {
      const a = seg(t, 0.4, 1.2), b = seg(t, 1.4, 2.6);
      let s = 0, o = 1, x = 220, rot = 0;
      if (act === 'get') s = backOut(b);
      else if (act === 'lose') { s = backOut(a); o = 1 - easeInOut(b); }
      else if (act === 'back') { s = backOut(a) * (t < 1.4 ? 1 : 0) + backOut(seg(t, 2.2, 2.8)) * (t >= 1.4 ? 1 : 0); o = t < 1.4 ? 0.35 : 1; }
      else if (act === 'doubt') { s = backOut(a); rot = Math.sin(t * 8) * 12 * (t > 1.2 ? 1 : 0); }
      else if (act === 'firm') { s = backOut(a) * (1 + 0.15 * hump(b)); }
      else if (act === 'dream') { s = backOut(a); o = 0.5 + 0.5 * Math.sin(t * 3); x = 220 + 10 * Math.sin(t * 2); }
      else if (act === 'pick') { s = backOut(a); x = lerp(190, 220, easeInOut(b)); }
      tf(it, x, 120, rot, s); it.setAttribute('opacity', o);
      const qs = act === 'doubt' || act === 'pick' ? backOut(seg(t, 1.6, 2.2)) : 0;
      tf(q2, 280, 92, 0, qs);
      tf(q3, 165, 90, 0, act === 'firm' || act === 'get' ? backOut(seg(t, 2.4, 2.9)) : 0);
      tf(bub, 220, 120, 0, easeOut(seg(t, 0, 0.5)));
      dots.forEach((d, i) => d.setAttribute('opacity', seg(t, 0.1 * i, 0.3 + 0.1 * i)));
      const md = act === 'lose' && t > 2 ? 'open' : act === 'doubt' ? 'flat' : act === 'firm' || act === 'get' ? (t > 2.4 ? 'grin' : 'smile') : 'smile';
      P({ x: 110, look: 0.5, armR: act === 'doubt' ? 150 : act === 'firm' ? 120 * seg(t, 2, 2.4) : 10, mood: md, blink: blink(t) });
    };
  } else if (p.t === 'tell') {
    const you = k.buddy({ x: 320, y: FY, scale: 0.8, facing: -1, color: pal.coral, dark: pal.coralDark });
    const act = p.act || 'say';
    const crowd = act === 'loud' ? [250, 290, 340].map((x, i) => k.buddy({ x, y: FY + (i % 2) * 4, scale: 0.55, facing: -1, color: [pal.blue, pal.yellow, pal.violet][i], dark: [pal.blueDark, pal.yellowDark, pal.violet][i] })) : [];
    if (act === 'loud') you.pose({ x: 1000, y: FY });
    const bub = g({});
    el('rect', { x: -38, y: -28, width: 76, height: 56, rx: 18, fill: '#fff', stroke: '#D7DEE6', 'stroke-width': 2 }, bub);
    const ICON = { no: '❌', ask: '❓', offer: p.e || '💡', cheer: '⭐', yes: '⭕' };
    emo(ICON[act] || p.e || '💬', 30, bub);
    const lines = act === 'teach' ? [0, 1, 2].map((i) => el('rect', { x: 0, y: 0, width: 0, height: 6, rx: 3, fill: '#B8C4D1' })) : [];
    const hearts = act === 'cheer' ? [0, 1, 2].map(() => emo('✨', 18)) : [];
    up = (t) => {
      const q = easeInOut(seg(t, 1.0, 2.2));
      const bx = lerp(130, act === 'loud' ? 280 : 250, q), by = lerp(150, 140, q) - 14 * hump(q);
      const back = act === 'no' ? 1 : 0;
      tf(bub, bx, by, 0, backOut(seg(t, 0.4, 0.9)));
      lines.forEach((l, i) => k.set(l, { x: 200, y: 196 + i * 12, width: 70 * easeOut(seg(t, 2.2 + i * 0.25, 2.6 + i * 0.25)) }));
      hearts.forEach((h, i) => { const s = seg(t, 2.3 + i * 0.15, 3.3 + i * 0.15); tf(h, 300 + (i - 1) * 24, 175 - 40 * s, 0, hump(s)); });
      P({ x: 90, look: 0.6, armR: lerp(20, act === 'loud' ? 150 : 95, easeOut(seg(t, 0.3, 1.0))), armL: act === 'teach' ? 40 + 20 * Math.sin(t * 6) : 8, mood: act === 'no' ? 'flat' : 'open', blink: blink(t), lean: 4 * q });
      const got = t > 2.2;
      const ym = act === 'no' ? 'flat' : act === 'ask' && got ? 'open' : got ? 'grin' : 'smile';
      if (act !== 'loud') you.pose({ x: 320, y: FY, facing: -1, look: -0.6, armL: 8, armR: got && (act === 'yes' || act === 'cheer' || act === 'offer') ? 150 : 8, lean: back * -6, squash: 1, walk: 0, mood: ym, blink: 0, lift: act === 'cheer' && got ? 6 * Math.abs(Math.sin(t * 6)) : 0 });
      crowd.forEach((c, i) => c.pose({ x: [250, 290, 340][i], y: FY, facing: -1, look: -0.6, armL: 8, armR: got ? 120 : 8, lean: 0, squash: 1, walk: 0, mood: got ? 'open' : 'smile', blink: 0, lift: 0 }));
      if (act === 'loud') you.pose({ x: 1000, y: FY });
    };
  } else if (p.t === 'judge') {
    el('rect', { x: 160, y: 196, width: 150, height: 12, rx: 4, fill: pal.wood });
    el('rect', { x: 172, y: 208, width: 10, height: FY - 208, fill: pal.woodDark }); el('rect', { x: 288, y: 208, width: 10, height: FY - 208, fill: pal.woodDark });
    const obj = emo(p.e || '📦', 60); tf(obj, 235, 160);
    const act = p.act || 'good';
    const stamp = g({});
    if (act === 'good' || act === 'ok') el('circle', { r: 34, fill: 'none', stroke: C.green, 'stroke-width': 7 }, stamp);
    if (act === 'bad' || act === 'ng') { el('line', { x1: -28, y1: -28, x2: 28, y2: 28, stroke: C.red, 'stroke-width': 8, 'stroke-linecap': 'round' }, stamp); el('line', { x1: 28, y1: -28, x2: -28, y2: 28, stroke: C.red, 'stroke-width': 8, 'stroke-linecap': 'round' }, stamp); }
    if (act === 'key') emo('❗', 40, stamp);
    const glow = act === 'key' ? el('circle', { cx: 235, cy: 160, r: 50, fill: C.yellow, opacity: 0 }) : null;
    if (glow) glow.parentNode.insertBefore(glow, glow.parentNode.firstChild.nextSibling);
    const stars = act === 'star' ? [0, 1, 2, 3, 4].map(() => emo('⭐', 24)) : [];
    const blanks = act === 'star' ? [0, 1, 2, 3, 4].map((i) => el('circle', { cx: 175 + i * 30, cy: 82, r: 11, fill: '#E6EAEF' })) : [];
    up = (t) => {
      const s = backOut(seg(t, 2.0, 2.4));
      tf(stamp, act === 'key' ? 285 : 235, act === 'key' ? 110 : 160, act === 'key' ? 0 : -8, act === 'star' ? 0 : s * (1 + 0.6 * (1 - seg(t, 2.0, 2.2))));
      stars.forEach((st, i) => tf(st, 175 + i * 30, 82, 0, i < (p.v || 3) ? backOut(seg(t, 1.8 + i * 0.2, 2.1 + i * 0.2)) : 0));
      if (glow) glow.setAttribute('opacity', 0.45 * seg(t, 1.8, 2.3) * (0.8 + 0.2 * Math.sin(t * 6)));
      const walk = easeInOut(seg(t, 0.2, 1.4));
      const done = t > 2.3;
      const md = done ? (act === 'bad' || act === 'ng' ? 'sad' : act === 'star' ? ((p.v || 3) >= 4 ? 'grin' : (p.v || 3) <= 2 ? 'flat' : 'smile') : act === 'key' ? 'open' : 'grin') : 'smile';
      P({ x: lerp(40, 120, walk), walk: walk > 0 && walk < 1 ? t * 9 : 0, look: 0.7, armR: lerp(10, 80, easeOut(seg(t, 1.4, 1.9))), lean: 6 * seg(t, 1.4, 1.9), mood: md, blink: blink(t) });
    };
  } else {
    // compare
    const rel = p.rel || 'diff';
    const L = [], many = rel === 'one' || rel === 'many';
    const xs = many ? [120, 170, 220, 270, 320] : [160, 290];
    xs.forEach((x, i) => {
      const box = g({});
      el('rect', { x: -26, y: -26, width: 52, height: 52, rx: 12, fill: '#fff', stroke: '#D7DEE6', 'stroke-width': 2 }, box);
      const ch = rel === 'same' || rel === 'many' ? (p.e || '🍎') : rel === 'one' ? (i === 2 ? (p.e2 || '⭐') : (p.e || '🔵')) : i === 0 ? (p.e || '🍎') : (p.e2 || '🍊');
      emo(ch, many ? 30 : 38, box);
      L.push(box);
    });
    const mark = g({});
    if (rel === 'same' || rel === 'many') k.text(0, 10, '=', { 'font-size': 34, fill: C.green, 'font-weight': 700, 'text-anchor': 'middle' }, mark);
    else if (rel === 'diff') k.text(0, 10, '≠', { 'font-size': 34, fill: C.red, 'font-weight': 700, 'text-anchor': 'middle' }, mark);
    else if (rel === 'near' || rel === 'far') { el('line', { x1: -50, y1: 0, x2: 50, y2: 0, stroke: C.sub, 'stroke-width': 3, 'stroke-dasharray': '5 5' }, mark); }
    else if (rel === 'easy' || rel === 'hard') emo(rel === 'easy' ? '⭕' : '❗', 26, mark);
    const ring = rel === 'one' ? el('circle', { cx: 220, cy: 150, r: 34, fill: 'none', stroke: C.yellow, 'stroke-width': 5, opacity: 0 }) : null;
    up = (t) => {
      L.forEach((b, i) => {
        let x = xs[i];
        if (rel === 'far' && i === 1) x = lerp(xs[i], 360, easeInOut(seg(t, 1.2, 2.4)));
        if (rel === 'near' && i === 1) x = lerp(xs[i], 230, easeInOut(seg(t, 1.2, 2.4)));
        tf(b, x, 150 + (many ? 0 : 0), 0, backOut(seg(t, 0.2 + i * 0.15, 0.6 + i * 0.15)));
      });
      tf(mark, many ? 220 : 225, many ? 210 : 150, 0, backOut(seg(t, 1.8, 2.3)));
      if (ring) ring.setAttribute('opacity', seg(t, 2.0, 2.4));
      P({ x: 60, look: 0.7, armR: 20 + 90 * easeOut(seg(t, 1.6, 2.2)), mood: t > 2.3 ? 'grin' : 'smile', blink: blink(t) });
    };
  }

  return { update(t) { up(t); } };
}
