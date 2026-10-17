// put down：持っているカップを下ろす→テーブルに着く→手を離して引く（例文 She put the cup down on the table.）
import { seg, lerp, easeInOut, easeOut, smooth, wobble } from '../ease.js';

export const meta = { duration: 3.6, beats: [[0, '持っている'], [0.9, '下ろす'], [2.0, '手を離す']] };

export function create(k) {
  const { THREE, scene, camera, rbox, cyl, C, mat } = k;
  k.ground(0xe9edf2, 60);
  // テーブル
  const table = new THREE.Group();
  const top = rbox(4.2, 0.16, 2.2, 0.06, C.wood);
  top.position.y = 1.0;
  table.add(top);
  [[-1.85, -0.9], [1.85, -0.9], [-1.85, 0.9], [1.85, 0.9]].forEach(([x, z]) => {
    const leg = rbox(0.14, 0.95, 0.14, 0.05, C.woodDark);
    leg.position.set(x, 0.47, z);
    table.add(leg);
  });
  k.shade(table);
  scene.add(table);
  const TOP = 1.08;

  // カップ（取っ手なし。中身入り）
  const cup = new THREE.Group();
  const shell = cyl(0.3, 0.25, 0.62, C.white, {}, 40);
  shell.position.y = 0.31;
  cup.add(shell);
  const tea = cyl(0.27, 0.27, 0.02, 0xc88a52, {}, 32);
  tea.position.y = 0.56;
  cup.add(tea);
  const band = cyl(0.302, 0.29, 0.1, C.coral, {}, 40);
  band.position.y = 0.36;
  cup.add(band);
  k.shade(cup);
  scene.add(cup);

  const S = 1.15;
  const { rig, hand } = k.armHand(S, C.mint);
  scene.add(rig);

  camera.position.set(0.9, 3.4, 7.2);
  camera.lookAt(0, 1.85, 0);
  k.sun.position.set(2, 9, 5);

  const CUP_H = 0.62;
  const wristX = 0.31 - 0.6 * S;
  const palm = 0.1 * S;
  const startY = 1.35; // カップを持ち上げている高さ（テーブル面から）

  return {
    update(t) {
      // 下ろす：最初はゆっくり、着地直前でさらに減速
      const down = easeInOut(seg(t, 0.75, 1.9));
      const cupY = TOP + startY * (1 - down);
      // 着地の小さな沈み込み
      const settle = wobble(seg(t, 1.9, 2.5), 1.5, 6) * 0.015;
      cup.position.set(0, cupY - Math.max(0, settle), 0);
      cup.rotation.z = Math.sin(t * 2.2) * 0.02 * (1 - down);
      // 手を離す
      const release = smooth(seg(t, 2.0, 2.4));
      hand.userData.grip(0.95 * (1 - release));
      // 手は離したあと上へ引き、左へ下がる
      const away = easeOut(seg(t, 2.35, 3.4));
      const hy = cupY + CUP_H + palm + 0.02 + away * 1.2 + Math.sin(t * 2.2) * 0.02 * (1 - down);
      const hx = wristX - away * 1.2;
      rig.position.set(hx, hy, 0.02);
      rig.rotation.z = -0.12 - away * 0.3;
      void lerp;
    }
  };
}
