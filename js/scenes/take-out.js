// take out：ふたの開いた箱に手を入れる→ボールをつかむ→箱の外へ取り出す（例文 He took a ball out of the box.）
import { seg, lerp, easeInOut, easeOut, smooth, wobble } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '箱の中にある'], [0.9, '手を入れる'], [2.0, '外へ取り出す']] };

export function create(k) {
  const { THREE, scene, camera, rbox, sphere, C } = k;
  k.ground(0xe9edf2, 60);
  // ふたの開いた箱（側面4枚と底）。手前の側面は低くして中が少し見えるように
  const box = new THREE.Group();
  const W = 1.6, D = 1.3, H = 0.95, T = 0.07;
  const col = 0xd9a86c;
  const bottom = rbox(W, T, D, 0.02, col);
  bottom.position.y = T / 2;
  const back = rbox(W, H, T, 0.02, col);
  back.position.set(0, H / 2, -D / 2);
  const front = rbox(W, H * 0.78, T, 0.02, 0xcf9b5e);
  front.position.set(0, (H * 0.78) / 2, D / 2);
  const left = rbox(T, H, D, 0.02, 0xc89255);
  left.position.set(-W / 2, H / 2, 0);
  const right = rbox(T, H, D, 0.02, 0xc89255);
  right.position.set(W / 2, H / 2, 0);
  // 開いたふた
  const flapB = rbox(W, T, 0.55, 0.02, 0xe2b57c);
  flapB.position.set(0, H + 0.2, -D / 2 - 0.12);
  flapB.rotation.x = -1.1;
  const flapL = rbox(0.5, T, D, 0.02, 0xe2b57c);
  flapL.position.set(-W / 2 - 0.2, H + 0.16, 0);
  flapL.rotation.z = 1.05;
  const flapR = flapL.clone();
  flapR.position.x = W / 2 + 0.2;
  flapR.rotation.z = -1.05;
  box.add(bottom, back, front, left, right, flapB, flapL, flapR);
  box.position.set(0.3, 0, 0);
  scene.add(box);

  // ボール
  const R = 0.3;
  const ball = new THREE.Group();
  const b = sphere(R, C.coral);
  ball.add(b);
  const stripe = new THREE.Mesh(new THREE.TorusGeometry(R * 1.002, 0.03, 8, 40), k.mat(C.white));
  stripe.rotation.y = Math.PI / 2;
  ball.add(stripe);
  k.shade(ball);
  scene.add(ball);

  const S = 1.05;
  const { rig, hand } = k.armHand(S, C.blue);
  scene.add(rig);

  camera.position.set(0.6, 3.6, 5.6);
  camera.lookAt(0.2, 0.75, 0);
  k.sun.position.set(1.5, 9, 4);

  const restY = T + R;
  const wristOff = R * 0.9 - 0.6 * S; // 指の付け根がボールの奥側の縁に来る
  const palm = 0.1 * S;

  return {
    update(t) {
      const ballX = 0.3;
      // 手：箱の上→中へ下ろす→つかむ→持ち上げて箱の外（左上）へ
      const a = easeInOut(seg(t, 0, 0.9));
      const dn = easeInOut(seg(t, 0.85, 1.45));
      const g = smooth(seg(t, 1.45, 1.75));
      const up = easeInOut(seg(t, 1.95, 2.9));
      const out = easeOut(seg(t, 2.6, 3.5));
      const aboveY = H + 0.9;
      const graspY = restY + R + palm;
      const hy = lerp(lerp(2.8, aboveY, a), graspY, dn) + up * (aboveY + 0.4 - graspY);
      const hx = lerp(-1.5, ballX + wristOff, a) - out * 1.35;
      rig.position.set(hx, hy, 0.05);
      rig.rotation.z = -lerp(0.5, 0.15, a) + out * 0.08;
      hand.userData.grip(g * 0.9);
      // ボールは握られてから手と一緒に動く
      const by = g > 0.5 ? hy - palm - R : restY;
      const bx = g > 0.5 ? hx - wristOff : ballX;
      const settle = wobble(seg(t, 3.5, 3.8), 1, 5) * 0.03;
      ball.position.set(bx, by + settle, 0.05);
      ball.rotation.z = -out * 0.6;
    }
  };
}
