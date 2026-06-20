// 碰撞检测模块
import { CONFIG } from './config.js';
import { circleCollision } from './utils.js';
import { spawnPowerUp } from './powerups.js';
import { playHitSound, playDamageSound } from './audio.js';

/**
 * 击中敌人
 * @returns {string|null} 死亡特效类型（'explosion'|'boss_explosion'），或 null（未死）
 */
function handleKill(enemy, particles, powerups) {
  const effect = enemy.takeDamage(CONFIG.PLAYER_BULLET_DAMAGE);
  if (!effect) return null;
  if (effect === 'explosion') {
    particles.createExplosion(enemy.x, enemy.y, enemy.color ?? '#ffff00');
  } else if (effect === 'boss_explosion') {
    particles.createBossExplosion(enemy.x, enemy.y);
  }
  const pu = spawnPowerUp(enemy.x, enemy.y);
  if (pu) powerups.push(pu);
  return effect;
}

/**
 * 收集击杀得分（通用）
 */
function getScoreByEffect(effect) {
  if (effect === 'boss_explosion') return CONFIG.BOSS_SCORE;
  if (effect === 'explosion') return CONFIG.YELLOW_SCORE;
  return 0;
}

export function checkCollisions(player, enemies, bosses, particles, powerups) {
  let scoreDelta = 0;
  let kills = 0;
  const allEnemies = [...enemies, ...bosses];

  // 玩家子弹 vs 所有敌人
  player.bullets.forEach(bullet => {
    if (!bullet.active) return;
    allEnemies.forEach(enemy => {
      if (!enemy.active || !enemy.isAlive()) return;
      if (circleCollision(bullet, bullet.size, enemy, enemy.size)) {
        const effect = handleKill(enemy, particles, powerups);
        bullet.active = false;
        playHitSound();
        if (effect) {
          scoreDelta += enemy.score ?? getScoreByEffect(effect);
          kills++;
        }
      }
    });
  });

  // 敌人子弹 vs 玩家
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

  // 敌人碰撞 vs 玩家
  allEnemies.forEach(enemy => {
    if (!enemy.active || !enemy.isAlive()) return;
    if (player.isInvincible()) return;
    if (circleCollision(enemy, enemy.size, player, CONFIG.PLAYER_SIZE)) {
      player.takeDamage(CONFIG.ENEMY_COLLISION_DAMAGE);
      playDamageSound();
      const effect = handleKill(enemy, particles, powerups);
      if (effect) {
        scoreDelta += enemy.score ?? getScoreByEffect(effect);
        kills++;
      }
    }
  });

  return { score: scoreDelta, kills };
}
