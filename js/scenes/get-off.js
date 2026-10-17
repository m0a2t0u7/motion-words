// get off：電車のドアが開く→ステップを下りてホームへ→電車は発車する（例文 I got off the train at Osaka.）
import { seg, lerp, easeInOut, easeOut, easeIn } from '../ease.js';

export const meta = { duration: 4.4, beats: [[0, '乗っている'], [0.75, '降りる'], [1.85, 'ホームに立つ']] };

export function create(k) {
  const { THREE, scene, camera, rbox, cyl, C, mat } = k;
  k.ground(0xd9dee6, 80);
  // ホーム
  const platform = rbox(16, 0.3, 3.2, 0.05, 0xeef1f5);
  platform.position.set(0, 0.15, 1.2);
  scene.add(platform);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(16, 0.012, 0.18), mat(C.yellow));
  edge.position.set(0, 0.307, -0.25);
  scene.add(edge);
  // 駅名標
  const pole = cyl(0.05, 0.05, 2.2, C.grayDark);
  pole.position.set(-1.7, 1.2, 2.3);
  const board = k.label('OSAKA', { w: 1.5, h: 0.5, bg: '#ffffff', fg: '#2a3242', size: 110 });
  board.position.set(-1.7, 2.25, 2.33);
  const boardBack = rbox(1.6, 0.6, 0.06, 0.03, C.mint);
  boardBack.position.set(-1.7, 2.25, 2.28);
  scene.add(pole, boardBack, board);

  // 線路
  [-0.55, 0.55].forEach((dz) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(80, 0.08, 0.08), mat(0x8a93a3, { metalness: 0.4, roughness: 0.4 }));
    r.position.set(0, 0.04, -1.25 + dz);
    scene.add(r);
  });
  for (let x = -40; x < 40; x += 0.7) {
    const sl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 1.6), mat(0xb7a48d));
    sl.position.set(x, 0.02, -1.25);
    scene.add(sl);
  }
  // 電車
  const train = k.vehicle({ len: 7.2, color: C.mint, doorAt: 0.8, windows: 6, rail: true });
  const opening = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.42), mat(0x2f3a4f, { roughness: 1 }));
  opening.position.set(0.8, 0.38 + 0.83, 0.9 + 0.024);
  train.add(opening);
  train.position.set(0, 0, -1.25);
  scene.add(train);

  const b = k.buddy(C.coral, 0xe86f57);
  b.scale.setScalar(0.62);
  scene.add(b);
  camera.position.set(0.6, 3.1, 9.6);
  camera.lookAt(0.4, 1.2, 0);
  k.sun.position.set(2, 9, 7);

  const FLOOR = 0.3; // ホーム面
  const DOOR_X = 0.8, DOOR_Z = -1.25 + 0.9;
  return {
    update(t) {
      // ドアが開く→降りたあと閉まる
      const open = easeInOut(seg(t, 0.15, 0.65)) * (1 - easeInOut(seg(t, 2.5, 2.95)));
      train.userData.door(open);
      opening.visible = open > 0.02;
      // 中から出てきて、一段下りてホームへ
      const out = easeInOut(seg(t, 0.75, 1.75));
      const z = lerp(DOOR_Z - 1.0, DOOR_Z + 1.3, out);
      const stepDown = Math.sin(Math.PI * seg(t, 1.05, 1.5)) * 0.18;
      const y = FLOOR + 0.12 * (1 - seg(t, 1.05, 1.5)) + stepDown;
      // ホームに降りたら右を向いて少し歩く
      const turn = easeInOut(seg(t, 1.9, 2.3));
      const walk = seg(t, 2.2, 3.6);
      const x = DOOR_X + easeOut(walk) * 1.8;
      b.position.set(x, y, z);
      b.rotation.y = lerp(0, Math.PI / 2, turn);
      b.visible = out > 0.12;
      const moving = (out > 0 && out < 1) || (walk > 0 && walk < 1);
      b.userData.pose({ walk: moving ? t * 9 : 0, walkAmp: moving ? 0.8 : 0 });
      // 電車が発車して左へ
      const dep = easeIn(seg(t, 3.05, 4.4));
      train.position.x = -dep * 9;
    }
  };
}
