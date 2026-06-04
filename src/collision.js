// 碰撞检测模块
import { CONFIG, EnemyType } from './config.js';
import { circleCollision } from './utils.js';
import { spawnPowerUp } from './powerups.js';

export function checkCollisions(player, enemies, bosses, particles, powerups) {
  let scoreDelta = 0;

  // 玩家子弹 vs 敌人
  player.bullets.forEach(bullet => {
    if (!bullet.active) return;

    // vs 普通敌人
    enemies.forEach(enemy => {
      if (!enemy.active || !enemy.isAlive()) return;
      if (circleCollision(bullet, bullet.size, enemy, enemy.size)) {
        const effect = enemy.takeDamage(1);
        bullet.active = false;
        if (effect) {
          if (effect === 'explosion') {
            particles.createExplosion(enemy.x, enemy.y, '#ffff00');
            scoreDelta += CONFIG.YELLOW_SCORE;
            const pu = spawnPowerUp(enemy.x, enemy.y);
            if (pu) powerups.push(pu);
          }
          if (effect === 'flash') {
            particles.createFlash(enemy.x, enemy.y, '#44ff44');
            scoreDelta += CONFIG.GREEN_SCORE;
            const pu = spawnPowerUp(enemy.x, enemy.y);
            if (pu) powerups.push(pu);
          }
        }
      }
    });

    // vs Boss
    bosses.forEach(boss => {
      if (!boss.active || !boss.isAlive()) return;
      if (circleCollision(bullet, bullet.size, boss, boss.size)) {
        const effect = boss.takeDamage(1);
        bullet.active = false;
        if (effect === 'boss_explosion') {
          particles.createBossExplosion(boss.x, boss.y);
          scoreDelta += CONFIG.BOSS_SCORE;
        }
      }
    });
  });

  // 敌人子弹 vs 玩家
  const allEnemies = [...enemies, ...bosses];
  allEnemies.forEach(enemy => {
    if (!enemy.active) return;
    enemy.bullets.forEach(bullet => {
      if (!bullet.active) return;
      if (player.isInvincible()) return;
      if (circleCollision(bullet, bullet.size, player, CONFIG.PLAYER_SIZE)) {
        player.takeDamage(1);
        bullet.active = false;
      }
    });
  });

  // 敌人碰撞 vs 玩家（各扣1HP）
  allEnemies.forEach(enemy => {
    if (!enemy.active || !enemy.isAlive()) return;
    if (player.isInvincible()) return;
    if (circleCollision(enemy, enemy.size, player, CONFIG.PLAYER_SIZE)) {
      player.takeDamage(1);
      const effect = enemy.takeDamage(1);
      if (effect) {
        if (effect === 'explosion') {
          particles.createExplosion(enemy.x, enemy.y, '#ffff00');
          scoreDelta += CONFIG.YELLOW_SCORE;
        }
        if (effect === 'flash') {
          particles.createFlash(enemy.x, enemy.y, '#44ff44');
          scoreDelta += CONFIG.GREEN_SCORE;
        }
        if (effect === 'boss_explosion') {
          particles.createBossExplosion(enemy.x, enemy.y);
          scoreDelta += CONFIG.BOSS_SCORE;
        }
      }
    }
  });

  return scoreDelta;
}
