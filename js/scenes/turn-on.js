// turn on：暗い部屋→指がスタンドのスイッチを押す→明かりがつく（例文 Could you turn on the light?）
import { seg, lerp, easeInOut, easeOut, smooth } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '暗い'], [0.9, 'スイッチを押す'], [1.45, '明かりがつく']] };

export function create(k) {
  const { THREE, scene, camera, rbox, cyl, sphere, C, mat, hemi, sun } = k;
  k.ground(0xe6e1d8, 60);
  const dark = new THREE.Color(0x343b4f);
  const bg = new THREE.Color();
  const bright = new THREE.Color(0xf4efe6);
  scene.fog = null;

  // 机
  const desk = rbox(5, 0.16, 2.4, 0.06, C.wood);
  desk.position.set(0, 0.92, 0);
  scene.add(desk);
  [[-2.3, -1], [2.3, -1], [-2.3, 1], [2.3, 1]].forEach(([x, z]) => {
    const l = rbox(0.14, 0.86, 0.14, 0.05, C.woodDark);
    l.position.set(x, 0.43, z);
    scene.add(l);
  });
  const TOP = 1.0;
  // 卓上スタンド
  const lamp = new THREE.Group();
  const base = cyl(0.55, 0.62, 0.14, C.coral);
  base.position.y = 0.07;
  const btnHousing = rbox(0.34, 0.08, 0.26, 0.03, 0xe86f57);
  btnHousing.position.set(-0.05, 0.16, 0.22);
  const btn = rbox(0.22, 0.1, 0.16, 0.04, C.white);
  btn.position.set(-0.05, 0.22, 0.22);
  const stem1 = cyl(0.06, 0.06, 1.3, C.grayDark);
  stem1.position.set(0.15, 0.75, -0.1);
  stem1.rotation.z = -0.25;
  const joint = sphere(0.1, C.grayDark);
  joint.position.set(0.32, 1.38, -0.1);
  const stem2 = cyl(0.055, 0.055, 0.9, C.grayDark);
  stem2.position.set(0.0, 1.6, -0.1);
  stem2.rotation.z = 1.05;
  const shadeM = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.55, 0.6, 40, 1, true), mat(C.coral, { side: THREE.DoubleSide }));
  shadeM.position.set(-0.45, 1.62, -0.1);
  shadeM.rotation.z = 0.35;
  const bulbMat = mat(0xfff3c4, { unique: true, emissive: 0xffd76a, emissiveIntensity: 0, roughness: 0.3 });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), bulbMat);
  bulb.position.set(-0.53, 1.45, -0.1);
  // 光の円錐（ほのかなグロー）
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const glow = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.1, 40, 1, true), glowMat);
  glow.position.set(-0.75, 0.95, -0.1);
  glow.rotation.z = 0.35;
  lamp.add(base, btnHousing, btn, stem1, joint, stem2, shadeM, bulb, glow);
  k.shade(lamp);
  glow.castShadow = false;
  bulb.castShadow = false;
  lamp.position.set(0.4, TOP, 0);
  scene.add(lamp);
  const point = new THREE.PointLight(0xffd88a, 0, 9, 1.6);
  point.position.set(0.4 - 0.6, TOP + 1.35, 0.1);
  scene.add(point);
  // 机の上の本（明るくなると見える物）
  const book = rbox(0.9, 0.12, 0.65, 0.03, C.blue);
  book.position.set(-1.0, TOP + 0.06, 0.3);
  book.rotation.y = 0.25;
  scene.add(book);

  const S = 0.85;
  const { rig, hand } = k.armHand(S, C.mint);
  scene.add(rig);

  camera.position.set(0.2, 3.1, 6.2);
  camera.lookAt(0, 1.55, 0);

  // ボタン上面の位置（ワールド）
  const BX = 0.4 - 0.05, BY = TOP + 0.27, BZ = 0.22;
  const T_PRESS = 1.2;

  return {
    update(t) {
      // 手：右上から来て、指先でボタンを押し、離れる
      const a = easeInOut(seg(t, 0.1, 0.95));
      const press = Math.sin(Math.PI * seg(t, 0.95, 1.45)); // 押して戻る
      const away = easeOut(seg(t, 1.7, 2.6));
      const tipLen = 0.92 * S; // 手首から指先まで
      const hx = lerp(-2.6, BX - tipLen * 0.92, a) - away * 1.4;
      const hy = lerp(2.9, BY + 0.22, a) - press * 0.1 + away * 0.9;
      rig.position.set(hx, hy, BZ + 0.05);
      rig.rotation.z = -0.32 + away * 0.2;
      hand.userData.grip(0.35 + press * 0.15);
      btn.position.y = 0.22 - press * 0.05;
      // 明かり：押した瞬間に少しちらついてから点灯
      let on = smooth(seg(t, T_PRESS, T_PRESS + 0.35));
      if (t > T_PRESS && t < T_PRESS + 0.25) on *= 0.6 + 0.4 * Math.abs(Math.sin(t * 70));
      bulbMat.emissiveIntensity = on * 2.2;
      glowMat.opacity = on * 0.07;
      point.intensity = on * 14;
      hemi.intensity = lerp(0.28, 1.15, on);
      sun.intensity = lerp(0.15, 1.6, on);
      scene.background = bg.copy(dark).lerp(bright, on);
    }
  };
}
