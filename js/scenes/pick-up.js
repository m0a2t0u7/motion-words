// pick up：手が箱に近づく→つかむ→重さを受けて持ち上げる（例文 She picked up the box from the floor.）
import { seg, lerp, easeInOut, easeOut, smooth, wobble } from '../ease.js';

export const meta = { duration: 3.8, beats: [[0, '手を伸ばす'], [1.05, 'つかむ'], [1.75, '持ち上げる']] };

export function create(k) {
  const { THREE, scene, camera, rbox, mat } = k;
  // 床板の線
  for (let i = -6; i <= 6; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.005, 20), mat(0xe2d6c5));
    l.position.set(i * 0.9, 0.003, 0);
    scene.add(l);
  }
  // 箱（段ボール）
  const box = new THREE.Group();
  const cube = rbox(0.82, 0.82, 0.82, 0.06, 0xd9a86c);
  box.add(cube);
  const tape = rbox(0.84, 0.02, 0.2, 0.01, 0xc48f52);
  tape.position.y = 0.41;
  box.add(tape);
  const tapeF = rbox(0.2, 0.3, 0.84, 0.01, 0xc48f52);
  tapeF.position.set(0, 0.27, 0);
  tapeF.scale.set(1, 1, 1.0);
  box.add(tapeF);
  scene.add(box);

  // 手と前腕（手首から左上へ伸びる）
  const S = 1.25;
  const { rig: handRig, hand } = k.armHand(S);
  scene.add(handRig);
  k.ground(0xeadcc8, 60);

  camera.position.set(1.4, 2.6, 6.2);
  camera.lookAt(0, 0.85, 0);
  k.sun.position.set(2, 9, 5);

  const BOX_H = 0.82;
  const wristX = 0.41 - 0.6 * S; // 指の付け根が箱の奥の縁に来る位置
  const palmBottom = 0.1 * S;

  return {
    update(t) {
      // 1) 近づく
      const a = easeInOut(seg(t, 0, 1.0));
      // 2) 下ろして接触
      const d = easeOut(seg(t, 0.9, 1.15));
      // 3) 持ち上げ（つかんでから一瞬ためる）
      const l = seg(t, 1.75, 2.75);
      const lift = easeInOut(l) * 1.25;
      const contactY = BOX_H + palmBottom + 0.02;
      const hoverY = contactY + 0.55;
      let hy = lerp(lerp(2.9, hoverY, a), contactY, d) + lift;
      const hx = lerp(-1.4, wristX, a);
      // 持ち上げ始めに重さで手が少し沈む
      hy -= Math.sin(Math.PI * seg(t, 1.45, 1.85)) * 0.05;
      handRig.position.set(hx, hy, 0.02);
      handRig.rotation.z = -lerp(0.55, 0.1, a) - 0.04 * seg(t, 1.1, 1.5);
      hand.userData.grip(smooth(seg(t, 1.12, 1.5)) * 0.95);
      // 箱は手より少し遅れて上がり、わずかに傾く
      const boxLift = easeInOut(seg(t, 1.82, 2.8)) * 1.25;
      const sway = wobble(seg(t, 2.6, 3.8), 1.6, 4) * 0.05;
      box.position.set(0, BOX_H / 2 + boxLift, 0);
      box.rotation.z = -0.07 * Math.sin(Math.PI * seg(t, 1.82, 2.8)) + sway;
      // 接触の瞬間にわずかにつぶれる
      const sq = Math.sin(Math.PI * seg(t, 1.1, 1.3)) * 0.03;
      box.scale.set(1 + sq, 1 - sq, 1 + sq);
    }
  };
}
