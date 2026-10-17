// throw away：丸めた紙を持つ→放る→ごみ箱に入る（例文 He threw the paper away.）
import { seg, lerp, easeInOut, easeOut, easeIn, smooth, wobble } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '紙を持つ'], [0.85, '放る'], [1.9, 'ごみ箱に入る']] };

export function create(k) {
  const { THREE, scene, camera, cyl, C, mat } = k;
  k.ground(0xe9edf2, 60);

  // ごみ箱（上が開いた円筒）
  const bin = new THREE.Group();
  const BIN_H = 1.25, BR = 0.62;
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(BR, BR * 0.82, BIN_H, 40, 1, true), mat(C.blue, { side: THREE.DoubleSide }));
  wall.position.y = BIN_H / 2;
  const base = cyl(BR * 0.82, BR * 0.82, 0.05, C.blue);
  base.position.y = 0.025;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(BR, 0.045, 10, 40), mat(0x4a8be0));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = BIN_H;
  const inner = new THREE.Mesh(new THREE.CircleGeometry(BR * 0.8, 32), mat(0x3e5c8a));
  inner.rotation.x = -Math.PI / 2;
  inner.position.y = 0.06;
  bin.add(wall, base, rim, inner);
  // 中のごみ（入った紙が縁の近くで止まって見えるように）
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(BR * 0.88, BR * 0.74, BIN_H * 0.72, 32), mat(0xdfe6ef, { roughness: 0.95 }));
  fill.position.y = BIN_H * 0.36;
  bin.add(fill);
  k.shade(bin);
  bin.position.set(2.3, 0, -0.2);
  scene.add(bin);

  // 丸めた紙（でこぼこの球）
  const geo = new THREE.IcosahedronGeometry(0.27, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    const n = 1 + 0.16 * Math.sin(v.x * 23 + v.y * 11) * Math.cos(v.z * 17 - v.y * 7);
    v.multiplyScalar(n);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  const paper = new THREE.Mesh(geo, mat(0xf7f4ec, { roughness: 0.9, flatShading: true }));
  paper.castShadow = true;
  scene.add(paper);

  const S = 1.0;
  const { rig, hand } = k.armHand(S, C.coral);
  scene.add(rig);

  camera.position.set(0.4, 3.3, 9.0);
  camera.lookAt(0.4, 1.55, 0);
  k.sun.position.set(2, 9, 5);

  const PR = 0.27;
  const off = PR * 0.9 - 0.6 * S;
  const palm = 0.1 * S;
  const T_REL = 1.05;
  // 放した瞬間の手の位置を計算する関数
  const handAt = (t) => {
    const back = easeInOut(seg(t, 0.15, 0.8));
    const fwd = easeIn(seg(t, 0.8, T_REL));
    const follow = easeOut(seg(t, T_REL, 1.6));
    const x = -1.6 - back * 0.55 + fwd * 1.15 + follow * 0.35 - easeInOut(seg(t, 2.0, 3.0)) * 0.9;
    const y = 1.75 + back * 0.35 - fwd * 0.05 + follow * 0.15 - easeInOut(seg(t, 2.0, 3.0)) * 0.9;
    return { x, y, rot: -0.15 - back * 0.35 + fwd * 0.55 + follow * 0.05 - easeInOut(seg(t, 2.0, 3.0)) * 0.2 };
  };
  const rel = handAt(T_REL);
  const relPaper = { x: rel.x - off, y: rel.y - palm - PR };
  const land = { x: 2.25, y: BIN_H * 0.72 + PR * 0.55, z: -0.15 };

  return {
    update(t) {
      const h = handAt(t);
      rig.position.set(h.x, h.y, 0);
      rig.rotation.z = h.rot;
      hand.userData.grip(0.85 * (1 - smooth(seg(t, T_REL - 0.04, T_REL + 0.12))));
      if (t < T_REL) {
        paper.position.set(h.x - off, h.y - palm - PR, 0);
        paper.rotation.set(0, 0, 0);
      } else {
        // 放物線で飛び、ごみ箱の縁を越えて中へ落ちる
        const p = seg(t, T_REL, 1.95);
        const x = lerp(relPaper.x, land.x, p);
        const z = lerp(0, land.z, p);
        const peak = 1.35;
        const y = lerp(relPaper.y, land.y, p) + peak * 4 * p * (1 - p) * (p < 1 ? 1 : 0);
        paper.position.set(x, y, z);
        paper.rotation.set(p * 5, p * 3, -p * 7);
      }
      // 入った衝撃でごみ箱が少し揺れる
      bin.rotation.z = wobble(seg(t, 1.95, 2.9), 2, 4) * 0.06;
    }
  };
}
