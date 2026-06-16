// 碰撞检测模块
import { CONFIG } from './config.js';
import { circleCollision } from './utils.js';
import { spawnPowerUp } from './powerups.js';
import { playHitSound, playDamageSound } from './audio.js';

function handleKill(enemy, particles, powerups) {
  const effect = enemy.takeDamage(CONFIG.PLAYER_BULLET_DAMAGE);
  if (!effect) return null;
  if (effect === 'explosion') {
    particles.createExplosion(enemy.x, enemy.y, '#ffff00');
  } else if (effect === 'boss_explosion') {
    particles.createBossExplosion(enemy.x, enemy.y);
  }
  const pu = spawnPowerUp(enemy.x, enemy.y);
  if (pu) powerups.push(pu);
  return effect;
}

export function checkCollisions(player, enemies, bosses, particles, powerups) {
  let scoreDelta = 0;
  let kills = 0;

  // 玩家子弹 vs 敌人
  player.bullets.forEach(bullet => {
    if (!bullet.active) return;

    // vs 普通敌人
    enemies.forEach(enemy => {
      if (!enemy.active || !enemy.isAlive()) return;
      if (circleCollision(bullet, bullet.size, enemy, enemy.size)) {
        const effect = handleKill(enemy, particles, powerups);
        bullet.active = false;
        playHitSound();
        if (effect) {
          scoreDelta += effect === 'explosion' ? CONFIG.YELLOW_SCORE : CONFIG.BOSS_SCORE;
          kills++;
        }
      }
    });

    // vs Boss
    bosses.forEach(boss => {
      if (!boss.active || !boss.isAlive()) return;
      if (circleCollision(bullet, bullet.size, boss, boss.size)) {
        const effect = handleKill(boss, particles, powerups);
        bullet.active = false;
        playHitSound();
        if (effect === 'boss_explosion') {
          scoreDelta += CONFIG.BOSS_SCORE;
          kills++;
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
        player.takeDamage(CONFIG.ENEMY_BULLET_DAMAGE);
        bullet.active = false;
        playDamageSound();
      }
    });
  });

  // 敌人碰撞 vs 玩家（各扣1HP）
  allEnemies.forEach(enemy => {
    if (!enemy.active || !enemy.isAlive()) return;
    if (player.isInvincible()) return;
    if (circleCollision(enemy, enemy.size, player, CONFIG.PLAYER_SIZE)) {
      player.takeDamage(CONFIG.ENEMY_COLLISION_DAMAGE);
      playDamageSound();
      const effect = handleKill(enemy, particles, powerups);
      if (effect === 'explosion') {
        scoreDelta += CONFIG.YELLOW_SCORE;
        kills++;
      } else if (effect === 'boss_explosion') {
        scoreDelta += CONFIG.BOSS_SCORE;
        kills++;
      }
    }
  });

  return { score: scoreDelta, kills };
}
