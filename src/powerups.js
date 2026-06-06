// 道具模块
// 架构：PowerUpType 枚举 + POWERUP_CONFIGS 注册表（定义在 config.js）
// 新增道具类型 → 只在 config.js 的 POWERUP_CONFIGS 中追加一条即可
import { CONFIG, PowerUpType, POWERUP_CONFIGS } from './config.js';
import { circleCollision } from './utils.js';
import { playPowerUpSound } from './audio.js';

export class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type || PowerUpType.SPREAD;
    this.cfg = POWERUP_CONFIGS[this.type];
    this.size = CONFIG.POWERUP_SIZE;
    this.active = true;
  }

  update() {
    this.y += CONFIG.POWERUP_FALL_SPEED;
    if (this.y > CONFIG.CANVAS_HEIGHT + this.size) {
      this.active = false;
    }
  }
}

// 随机生成道具 — 三种等权重
export function spawnPowerUp(x, y) {
  if (Math.random() >= CONFIG.POWERUP_DROP_RATE) return null;

  const types = [PowerUpType.SPREAD];
  const idx = Math.floor(Math.random() * types.length);
  return new PowerUp(x, y, types[idx]);
}

// 玩家拾取道具
export function checkPowerUpCollisions(player, powerups) {
  powerups.forEach(p => {
    if (!p.active) return;
    if (circleCollision(p, p.size, player, CONFIG.PLAYER_SIZE)) {

      // 生命：瞬间消耗品，拾取即生效，不存背包
      if (p.type === PowerUpType.HEART) {
        player.hp = Math.min(player.hp + 1, CONFIG.PLAYER_MAX_HP);
        p.active = false;
        playPowerUpSound();
        return;
      }

      // 散弹/炸弹：存入背包
      if (!player.inventory) player.inventory = {};
      if (!player.inventory[p.type]) player.inventory[p.type] = 0;
      if (player.inventory[p.type] < p.cfg.maxInventory) {
        player.inventory[p.type]++;
      }
      // 同步持有态标志（UI 需要感知背包状态）
      if (p.type === PowerUpType.SPREAD) {
        player.hasSpreadPowerup = true;
      } else if (p.type === PowerUpType.BOMB) {
        player.hasBombPowerup = true;
      }
      p.active = false;
      playPowerUpSound();
    }
  });
}

// 主动激活背包中的道具（由玩家触发）
export function activatePowerUp(player, type) {
  if (!player.inventory || !player.inventory[type] || player.inventory[type] <= 0) return false;
  const cfg = POWERUP_CONFIGS[type];
  if (!cfg.isActivable) return false;

  player.inventory[type]--;

  switch (type) {
    case PowerUpType.SPREAD:
      player.spreadActive = true;
      player.hasSpreadPowerup = true;
      player.spreadTimer = cfg.duration;
      break;
    case PowerUpType.BOMB:
      // 瞬间效果：由 game.js 检测 bombRequested 后处理
      player.bombRequested = true;
      player.hasBombPowerup = !!(player.inventory && player.inventory[type] && player.inventory[type] > 0);
      break;
  }
  return true;
}
