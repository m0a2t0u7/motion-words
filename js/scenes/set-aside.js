// set aside：お皿のクッキーから2枚を、脇の小皿へ移して取っておく（例文 She set aside two cookies for her brother.）
import { seg, lerp, easeInOut, easeOut, smooth, wobble } from '../ease.js';

export const meta = { duration: 4.2, beats: [[0, 'お皿のクッキー'], [0.6, '2枚を脇へ'], [3.0, '取っておいた']] };

export function create(k) {
  const { THREE, scene, camera, rbox, cyl, C, mat } = k;
  k.ground(0xe9edf2, 60);
  // テーブル
  const top = rbox(6, 0.16, 3, 0.06, C.wood);
  top.position.y = 0.92;
  scene.add(top);
  const TOP = 1.0;
  // 大皿と小皿
  const plate = cyl(1.05, 0.9, 0.08, C.white, {}, 48);
  plate.position.set(-0.9, TOP + 0.04, 0);
  const side = cyl(0.62, 0.54, 0.07, 0xbfe3f5, {}, 48);
  side.position.set(1.7, TOP + 0.035, 0.1);
  scene.add(plate, side);
  // 小皿の名札
  const tag = k.label('for him', { w: 0.62, h: 0.24, bg: '#ffffff', fg: '#3b7ff0', size: 92 });
  tag.position.set(1.7, TOP + 0.32, -0.62);
  tag.rotation.x = -0.2;
  const tagStand = rbox(0.66, 0.28, 0.03, 0.02, 0xd9dfe7);
  tagStand.position.set(1.7, TOP + 0.32, -0.64);
  tagStand.rotation.x = -0.2;
  scene.add(tagStand, tag);

  // クッキー（チョコチップ付き）
  const cookieGeo = new THREE.CylinderGeometry(0.27, 0.27, 0.09, 28);
  const chip = new THREE.SphereGeometry(0.035, 8, 6);
  const mkCookie = () => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(cookieGeo, mat(0xd9a86c, { roughness: 0.85 }));
    g.add(m);
    [[0.1, 0.05], [-0.09, 0.08], [0.02, -0.12], [-0.12, -0.06]].forEach(([x, z]) => {
      const c = new THREE.Mesh(chip, mat(0x6b4a33));
      c.position.set(x, 0.045, z);
      c.scale.y = 0.5;
      g.add(c);
    });
    return k.shade(g);
  };
  const H = 0.09;
  const spots = [[-1.25, -0.25], [-0.6, -0.3], [-1.3, 0.35], [-0.95, 0.05], [-0.5, 0.35], [-0.85, 0.55]];
  const cookies = spots.map(([x, z]) => {
    const c = mkCookie();
    c.position.set(x, TOP + 0.08 + H / 2, z);
    scene.add(c);
    return c;
  });
  // 移す2枚と、置き先
  const moves = [
    { c: cookies[1], from: spots[1], to: [1.5, -0.08], t0: 0.6 },
    { c: cookies[4], from: spots[4], to: [1.9, 0.2], t0: 1.9 }
  ];

  const S = 0.8;
  const { rig, hand } = k.armHand(S, C.coral);
  scene.add(rig);
  camera.position.set(0.3, 3.9, 5.6);
  camera.lookAt(0.3, 1.0, 0);
  k.sun.position.set(1, 9, 5);

  const off = 0.24 - 0.6 * S; // 指の付け根がクッキーの奥側の縁に来る
  const palm = 0.1 * S;
  const baseY = TOP + 0.08 + H;
  // 1枚を運ぶ動き（つかむ→持ち上げる→横へ→下ろす→離す）
  const carry = (t, m) => {
    const p = seg(t, m.t0, m.t0 + 1.3);
    const reach = easeInOut(seg(p, 0, 0.25));
    const grip = smooth(seg(p, 0.22, 0.32)) * (1 - smooth(seg(p, 0.82, 0.92)));
    const move = easeInOut(seg(p, 0.32, 0.8));
    const lift = Math.sin(Math.PI * move) * 0.7;
    const x = lerp(m.from[0], m.to[0], move);
    const z = lerp(m.from[1], m.to[1], move);
    return { p, reach, grip, x, z, lift, move };
  };

  return {
    update(t) {
      let hx = -2.6, hy = TOP + 1.6, hz = 0, g = 0;
      moves.forEach((m, i) => {
        const s = carry(t, m);
        if (t >= m.t0 && s.p < 1) {
          const tx = s.x + off, tz = s.z;
          const ty = baseY + palm + 0.02 + s.lift;
          // 前の位置から近づく
          const prevX = i === 0 ? -2.6 : moves[0].to[0] + off;
          const prevY = i === 0 ? TOP + 1.6 : baseY + palm + 0.4;
          hx = lerp(prevX, tx, s.reach);
          hy = lerp(prevY, ty, s.reach) + (s.move >= 1 ? smooth(seg(s.p, 0.9, 1)) * 0.4 : 0);
          hz = lerp(i === 0 ? 0 : moves[0].to[1], tz, s.reach);
          g = s.grip;
        }
        // クッキー：つかまれている間は手と一緒に動く
        const onIt = s.p > 0.3;
        const x = onIt ? s.x : m.from[0];
        const z = onIt ? s.z : m.from[1];
        const y = TOP + 0.08 + H / 2 + (onIt ? s.lift : 0) + (s.p >= 0.8 ? wobble(seg(s.p, 0.8, 1), 1, 6) * 0.01 : 0);
        m.c.position.set(x, y, z);
      });
      // 2枚目を置いたあとは手が離れていく
      const away = easeOut(seg(t, 3.2, 4.0));
      if (t >= 3.2) {
        hx = moves[1].to[0] + off - away * 2.4;
        hy = baseY + palm + 0.4 + away * 0.9;
        hz = moves[1].to[1];
        g = 0;
      }
      rig.position.set(hx, hy, hz);
      rig.rotation.z = -0.15;
      hand.userData.grip(g * 0.85);
    }
  };
}
