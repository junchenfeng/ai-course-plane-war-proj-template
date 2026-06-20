// 射击行为片段库
// 钩子签名：(enemy, player) => void — 每发射一次触发
// 注意：基类会自动管理射击冷却（通过 shootInterval），无需自己计时

import { Bullet } from '../../player.js';
import { BulletOwner } from '../../config.js';

/** 向下直线射击 */
export const down = (speedMult = 0.5, color) => (e, _p) => {
  const c = color ?? e.shootColor ?? '#ffff00';
  e.bullets.push(new Bullet(
    e.x, e.y + e.size,
    0, speedMult * 8,
    BulletOwner.ENEMY, c
  ));
};

/** 瞄准玩家射击 */
export const aimed = (speed = 5, color) => (e, p) => {
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const dist = Math.hypot(dx, dy) || 1;
  const c = color ?? e.shootColor ?? '#ff4444';
  e.bullets.push(new Bullet(
    e.x, e.y + e.size,
    (dx / dist) * speed, (dy / dist) * speed,
    BulletOwner.ENEMY_TRACKING, c
  ));
};

/** 环形散射（向四周发射） */
export const ring = (count, speed, color) => (e, _p) => {
  const c = color ?? e.shootColor ?? '#ff8844';
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    e.bullets.push(new Bullet(
      e.x, e.y,
      Math.cos(angle) * speed, Math.sin(angle) * speed,
      BulletOwner.ENEMY, c
    ));
  }
};

/** 扇形散射（向玩家方向） */
export const spread = (count, angleStepDeg, speed, color) => (e, p) => {
  const c = color ?? e.shootColor ?? '#ffaa44';
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const baseAngle = Math.atan2(dy, dx);
  const step = (angleStepDeg * Math.PI) / 180;
  const start = -((count - 1) / 2) * step;
  for (let i = 0; i < count; i++) {
    const a = baseAngle + start + i * step;
    e.bullets.push(new Bullet(
      e.x, e.y,
      Math.cos(a) * speed, Math.sin(a) * speed,
      BulletOwner.ENEMY, c
    ));
  }
};

/** 不发射 */
export const none = () => () => {};
