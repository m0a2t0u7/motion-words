// 共通のイージング・補間関数。シーンは t（秒）だけから描画を決めるため、すべて純関数。
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, p) => a + (b - a) * p;
// t が a→b の区間で 0→1 に進む値（範囲外は 0 / 1 に張り付く）
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const easeIn = (p) => p * p * p;
export const easeOut = (p) => 1 - Math.pow(1 - p, 3);
export const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const smooth = (p) => p * p * (3 - 2 * p);
export const backOut = (p, s = 1.6) => 1 + (s + 1) * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2);
// 減衰する揺れ（着地・接触後の余韻用）
export const wobble = (p, freq = 3, decay = 5) => Math.sin(p * Math.PI * 2 * freq) * Math.exp(-p * decay);
// 2区間をつなぐ（0→1→0 の山型）
export const hump = (p) => Math.sin(clamp(p) * Math.PI);
export const deg = (d) => (d * Math.PI) / 180;
