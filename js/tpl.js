// 型モーション：1つの型を、語ごとの引数（登場物・向き・変化）で使い回す2D演出。
// 専用シーンを作るまでの間、意味の中心を「前・途中・後」で見せる。
// 引数 p の形：{ t: 型, e: 主役の絵文字, e2: 2つ目, dir / act / ch / mood / rel: 型ごとの種類 }
import { seg, lerp, easeInOut, easeOut, backOut, wobble, hump, clamp } from './ease.js';

const B = { // 型ごとの「前・途中・後」
  move: ['動く前', '動く', '動いた後'],
  act: ['これから', 'する', 'した'],
  change: ['前', '変わる', '後'],
  show: ['これ', '近づく', 'これが'],
  mood: ['ふつう', '気持ちが変わる', 'この気持ち'],
  compare: ['2つ並べる', 'くらべる', 'ちがいが分かる'],
  time: ['時の線', '位置を示す', 'この時']
};

export function metaFor(p) {
  const beats = B[p.t] || B.show;
  return { duration: 3.6, beats: [[0, beats[0]], [0.9, beats[1]], [2.5, beats[2]]] };
}

export function create(k, p) {
  const { el, g, tf, pal } = k;
  const FY = k.backdrop({ floorY: 236, mood: p.t === 'time' || p.t === 'compare' ? 'indoor' : 'outdoor' });
  const emo = (ch, size = 46, parent) => {
    const gg = g({}, parent);
    k.text(0, 0, ch || '⬤', { 'font-size': size, 'font-family': '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif' }, gg);
    return gg;
  };
  const fns = { move, act, change, show, mood, compare, time };
  return (fns[p.t] || show)();

  // 物が向きをもって動く（up/down/in/out/away/toward/across/back/around/off/on/through/over）
  function move() {
    const box = g({});
    const dir = p.dir || 'across';
    if (dir === 'in' || dir === 'out' || dir === 'through') {
      el('rect', { x: 170, y: 120, width: 120, height: 116, rx: 10, fill: '#FBE9DC' }, box);
      el('rect', { x: 205, y: 160, width: 50, height: 76, rx: 6, fill: '#56607A' }, box);
    }
    if (dir === 'on' || dir === 'off') el('rect', { x: 140, y: 196, width: 120, height: 14, rx: 6, fill: pal.wood }, box);
    const sh = k.shadow(0, 0, 26, 6);
    const o = emo(p.e, 64);
    const path = {
      up: [[200, 210], [200, 80]], down: [[200, 70], [200, 210]], across: [[70, 210], [330, 210]],
      away: [[150, 205], [330, 140]], toward: [[330, 140], [200, 215]], back: [[300, 210], [110, 210]],
      in: [[90, 210], [230, 205]], out: [[230, 205], [350, 210]], through: [[90, 210], [350, 210]],
      on: [[200, 90], [200, 175]], off: [[200, 175], [330, 212]], over: [[80, 210], [320, 210]], around: [[200, 140], [200, 140]]
    }[dir] || [[70, 210], [330, 210]];
    return {
      update(t) {
        const q = easeInOut(seg(t, 0.8, 2.5));
        let x = lerp(path[0][0], path[1][0], q), y = lerp(path[0][1], path[1][1], q);
        if (dir === 'over') y -= hump(q) * 120;
        if (dir === 'around') { x = 200 + Math.cos(q * Math.PI * 2 - Math.PI / 2) * 110; y = 140 + Math.sin(q * Math.PI * 2 - Math.PI / 2) * 70; }
        let op = 1;
        if (dir === 'in') op = 1 - seg(q, 0.85, 1);
        if (dir === 'out') op = seg(q, 0, 0.15);
        if (dir === 'through') op = q > 0.4 && q < 0.6 ? 0.25 : 1;
        tf(o, x, y + wobble(seg(t, 2.5, 3.4), 1.5, 5) * 4);
        o.setAttribute('opacity', op);
        tf(sh, x, FY + 4, 0, clamp(1 - (FY - y) / 300), 1);
        sh.setAttribute('opacity', op);
      }
    };
  }

  // まめが物に対して動作する
  function act() {
    const a = p.act || 'hold';
    const two = ['give', 'take', 'talk', 'pay', 'buy', 'show', 'ask', 'help'].includes(a);
    const b = k.buddy({ x: two ? 130 : 170, y: FY });
    const c = two ? k.buddy({ x: 290, y: FY, color: pal.coral, dark: pal.coralDark, facing: -1 }) : null;
    const o = emo(p.e, 50);
    const bub = g({});
    el('rect', { x: -34, y: -26, width: 68, height: 44, rx: 14, fill: '#FFFFFF', stroke: pal.line }, bub);
    const bubE = emo(p.e2 || (a === 'think' ? p.e : a === 'sleep' ? '💤' : '💬'), 26, bub);
    tf(bubE, 0, -3);
    return {
      update(t) {
        const q = easeInOut(seg(t, 0.8, 2.4));
        const hand = b.handPos('R');
        let ox = hand.x + 6, oy = hand.y - 8, armR = lerp(10, 80, easeOut(seg(t, 0.4, 1)));
        let walk = 0, lift = 0, mood = 'smile', blink = 0, look = 0.3;
        bub.setAttribute('opacity', 0);
        if (a === 'give' || a === 'pay') { ox = lerp(hand.x + 8, 262, q); oy = lerp(hand.y - 8, FY - 55, q); }
        else if (a === 'take' || a === 'buy') { ox = lerp(262, hand.x + 8, q); oy = lerp(FY - 55, hand.y - 8, q); }
        else if (a === 'throw') { ox = lerp(hand.x + 8, 350, q); oy = lerp(hand.y - 8, FY - 20, q) - hump(q) * 110; armR = lerp(150, 60, easeOut(seg(t, 0.8, 1.2))); }
        else if (a === 'eat' || a === 'drink') { ox = lerp(hand.x + 6, 186, hump(seg(t, 0.8, 2.6))); oy = lerp(hand.y - 8, FY - 66, hump(seg(t, 0.8, 2.6))); armR = 60 + hump(seg(t, 0.8, 2.6)) * 80; if (t > 2.6) mood = 'grin'; }
        else if (a === 'look') { ox = 320; oy = FY - 90; armR = 90; look = 1; if (t > 1.4) mood = 'open'; }
        else if (a === 'talk' || a === 'ask' || a === 'think' || a === 'sleep') { ox = -100; bub.setAttribute('opacity', seg(t, 0.8, 1.2)); tf(bub, b.state.x + 34, FY - 112, 0, backOut(seg(t, 0.8, 1.2)), backOut(seg(t, 0.8, 1.2))); armR = a === 'think' ? 150 : 30; if (a === 'sleep') { blink = 1; mood = 'flat'; } }
        else if (a === 'run' || a === 'walk' || a === 'carry') { const sp = a === 'run' ? 14 : 9; walk = t * sp; b.pose({ x: lerp(80, 300, q) }); ox = b.handPos('R').x + 8; oy = b.handPos('R').y - 8; }
        else if (a === 'jump') { lift = hump(seg(t, 1, 1.8)) * 70; ox = -100; }
        else if (a === 'wait') { armR = 10; ox = 300; oy = FY - 110; look = 1; }
        b.pose({ armR, walk, lift, mood, blink, look });
        if (c) c.pose({ armR: a === 'give' || a === 'pay' ? 20 + q * 40 : 70 - q * 40, mood: t > 2.4 ? 'grin' : 'smile' });
        tf(o, ox, oy);
      }
    };
  }

  // 状態が変わる（grow/shrink/appear/disappear/break/fix/fill/empty/heat/cool/open/close/more/less/start/stop/clean/dirty）
  function change() {
    const ch = p.ch || 'appear';
    const sh = k.shadow(0, 0, 40, 7);
    const o = emo(p.e, 80);
    const mark = g({});
    const fx = { heat: '🔥', cool: '❄️', break: '💥', fix: '🔧', clean: '✨', dirty: '💦', start: '▶️', stop: '⏹️', more: '➕', less: '➖', fill: '⬆️', empty: '⬇️', open: '🔓', close: '🔒' }[ch];
    if (fx) tf(emo(fx, 30, mark), 0, 0);
    return {
      update(t) {
        const q = easeInOut(seg(t, 0.9, 2.4));
        let s = 1, op = 1, r = 0, y = FY - 40;
        if (ch === 'grow' || ch === 'more' || ch === 'fill') s = lerp(0.55, 1.35, q);
        else if (ch === 'shrink' || ch === 'less' || ch === 'empty') s = lerp(1.35, 0.55, q);
        else if (ch === 'appear' || ch === 'start') { s = backOut(q); op = q; }
        else if (ch === 'disappear' || ch === 'stop') { op = 1 - q; s = 1 - q * 0.3; }
        else if (ch === 'break') { r = Math.sin(t * 40) * 8 * hump(seg(t, 0.9, 1.6)); if (t > 1.6) { r = 25; y += 18; } }
        else if (ch === 'fix') { r = lerp(25, 0, q); y += lerp(18, 0, q); }
        else if (ch === 'heat' || ch === 'cool' || ch === 'clean' || ch === 'dirty' || ch === 'open' || ch === 'close') s = 1 + wobble(seg(t, 0.9, 2.2), 2, 3) * 0.12;
        tf(o, 200, y, r, Math.max(0.01, s), Math.max(0.01, s));
        o.setAttribute('opacity', op);
        tf(sh, 200, FY + 2, 0, Math.max(0.2, s), 1);
        mark.setAttribute('opacity', seg(t, 1.0, 1.4));
        tf(mark, 262, FY - 100 - hump(seg(t, 1, 3.6)) * 10);
      }
    };
  }

  // 物を見せる（名詞の基本）：まめが指さし、物が大きく現れる
  function show() {
    const b = k.buddy({ x: 110, y: FY, scale: 0.85 });
    const stand = g({});
    el('ellipse', { cx: 255, cy: FY - 2, rx: 70, ry: 12, fill: '#E6EBF1' }, stand);
    const rays = g({});
    for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: -58, x2: 0, y2: -72, stroke: pal.yellow, 'stroke-width': 4, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` }, rays);
    const o = emo(p.e, 82);
    return {
      update(t) {
        const q = backOut(seg(t, 0.8, 1.6));
        tf(o, 255, FY - 58 + (1 - q) * 30, 0, Math.max(0.01, q), Math.max(0.01, q));
        tf(rays, 255, FY - 70, t * 20, 1, 1);
        rays.setAttribute('opacity', seg(t, 1.4, 1.9) * 0.8);
        b.pose({ armR: lerp(10, 85, easeOut(seg(t, 0.5, 1.2))), look: 1, mood: t > 1.6 ? 'grin' : 'smile' });
      }
    };
  }

  // 気持ち・様子（happy/sad/angry/surprised/tired/worried/calm/proud/scared/busy/sick）
  function mood() {
    const m = p.mood || 'happy';
    const b = k.buddy({ x: 200, y: FY, scale: 1.15 });
    const sym = g({});
    const s = p.e || { happy: '✨', sad: '💧', angry: '💢', surprised: '❗', tired: '💤', worried: '💦', calm: '🍃', proud: '⭐', scared: '⚡', busy: '⏰', sick: '🤒' }[m] || '✨';
    tf(emo(s, 34, sym), 0, 0);
    const face = { happy: 'grin', sad: 'sad', angry: 'flat', surprised: 'open', tired: 'flat', worried: 'sad', calm: 'smile', proud: 'grin', scared: 'open', busy: 'open', sick: 'sad' }[m] || 'smile';
    return {
      update(t) {
        const q = seg(t, 0.9, 1.6);
        const pose = { mood: q > 0.5 ? face : 'smile', armL: 8, armR: 8, lean: 0, squash: 1, blink: 0 };
        if (m === 'happy' || m === 'proud') { pose.armL = pose.armR = lerp(8, 150, easeOut(q)); pose.lift = hump(seg(t, 1.6, 2.2)) * 20; }
        if (m === 'sad' || m === 'tired' || m === 'sick') { pose.lean = 10 * q; pose.squash = 1 - 0.08 * q; pose.blink = m === 'tired' ? 0.7 * q : 0; }
        if (m === 'angry') { pose.squash = 1 + Math.sin(t * 30) * 0.02 * q; pose.armL = pose.armR = 40 * q; }
        if (m === 'surprised' || m === 'scared') { pose.lift = hump(seg(t, 0.9, 1.3)) * 18; pose.armL = pose.armR = 120 * q; }
        if (m === 'worried' || m === 'busy') pose.look = Math.sin(t * 6) * q;
        b.pose(pose);
        sym.setAttribute('opacity', seg(t, 1.2, 1.6));
        tf(sym, 250, FY - 130 + Math.sin(t * 3) * 4);
      }
    };
  }

  // くらべる（bigger/smaller/faster/more/same/different/near/far/high/low/first/last）
  function compare() {
    const rel = p.rel || 'bigger';
    const A = emo(p.e, 48), Bo = emo(p.e2 || p.e, 48);
    const base = el('line', { x1: 60, y1: FY - 2, x2: 340, y2: FY - 2, stroke: pal.line, 'stroke-width': 3 });
    void base;
    const chk = g({});
    tf(emo('✔️', 26, chk), 0, 0);
    return {
      update(t) {
        const q = easeInOut(seg(t, 0.9, 2.3));
        let ax = 130, bx = 270, ay = FY - 30, by = FY - 30, as = 1, bs = 1, tgt = 'b';
        if (rel === 'bigger') { bs = lerp(1, 1.8, q); }
        else if (rel === 'smaller') { bs = lerp(1, 0.5, q); }
        else if (rel === 'faster' || rel === 'first') { ax = lerp(70, 220, q); bx = lerp(70, 330, q); ay = FY - 110; by = FY - 30; }
        else if (rel === 'high') { by = lerp(FY - 30, FY - 150, q); }
        else if (rel === 'low') { by = FY - 150 + q * 120; ay = FY - 150; }
        else if (rel === 'near') { bx = lerp(330, 175, q); tgt = 'b'; }
        else if (rel === 'far') { bx = lerp(175, 340, q); bs = lerp(1, 0.6, q); }
        else if (rel === 'same') { as = bs = 1; tgt = 'both'; }
        else if (rel === 'different') { bs = 1 + Math.sin(q * Math.PI) * 0.3; }
        tf(A, ax, ay, 0, as, as);
        tf(Bo, bx, by, 0, bs, bs);
        chk.setAttribute('opacity', seg(t, 2.3, 2.7));
        tf(chk, tgt === 'both' ? 200 : bx, Math.min(ay, by) - 60 * Math.max(bs, 1));
      }
    };
  }

  // 時（before/after/now/soon/always/often/never/again/still/already/ago/later）
  function time() {
    const rel = p.rel || 'now';
    el('line', { x1: 40, y1: 170, x2: 360, y2: 170, stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
    el('path', { d: 'M 352 160 L 366 170 L 352 180', fill: 'none', stroke: pal.ink, 'stroke-width': 4, 'stroke-linecap': 'round' });
    const nowM = g({});
    el('line', { x1: 0, y1: -22, x2: 0, y2: 22, stroke: pal.coral, 'stroke-width': 4 }, nowM);
    k.text(0, 40, 'NOW', { 'font-size': 14, fill: pal.coralDark }, nowM);
    tf(nowM, 200, 170);
    const dots = [];
    const pos = { before: [110], ago: [90], already: [140], after: [290], later: [300], soon: [240], now: [200], always: [70, 120, 170, 220, 270, 320], often: [80, 150, 210, 290], again: [140, 260], still: [120, 200], never: [] }[rel] || [200];
    pos.forEach((x) => { const d = emo(p.e, 30); dots.push([d, x]); });
    const no = g({});
    if (rel === 'never') { el('circle', { cx: 0, cy: 0, r: 30, fill: 'none', stroke: pal.red, 'stroke-width': 5 }, no); el('line', { x1: -21, y1: 21, x2: 21, y2: -21, stroke: pal.red, 'stroke-width': 5 }, no); tf(no, 200, 110); }
    return {
      update(t) {
        dots.forEach(([d, x], i) => {
          const q = backOut(seg(t, 0.9 + i * 0.18, 1.3 + i * 0.18));
          tf(d, x, 128, 0, Math.max(0.01, q), Math.max(0.01, q));
        });
        no.setAttribute('opacity', seg(t, 1, 1.4));
      }
    };
  }
}
