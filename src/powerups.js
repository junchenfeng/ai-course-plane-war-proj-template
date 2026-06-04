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

// 随机生成道具 — 按权重从所有已注册类型中挑选
export function spawnPowerUp(x, y) {
  if (Math.random() >= CONFIG.POWERUP_DROP_RATE) return null;

  // 按权重选道具类型
  const types = Object.values(PowerUpType);
  const totalWeight = types.reduce((sum, t) => sum + POWERUP_CONFIGS[t].dropWeight, 0);
  let rand = Math.random() * totalWeight;
  for (const t of types) {
    rand -= POWERUP_CONFIGS[t].dropWeight;
    if (rand <= 0) return new PowerUp(x, y, t);
  }
  return new PowerUp(x, y, PowerUpType.SPREAD);
}

// 玩家拾取道具 — 加入背包（不自动激活）
export function checkPowerUpCollisions(player, powerups) {
  powerups.forEach(p => {
    if (!p.active) return;
    if (circleCollision(p, p.size, player, CONFIG.PLAYER_SIZE)) {
      const cfg = p.cfg;

      // 生命道具：拾取即时生效
      if (p.type === PowerUpType.HEART) {
        player.hp = Math.min(player.hp + 1, CONFIG.PLAYER_HP);
        p.active = false;
        playPowerUpSound();
        return;
      }

      // 其他道具：存入背包
      if (!player.inventory) player.inventory = {};
      if (!player.inventory[p.type]) player.inventory[p.type] = 0;
      if (player.inventory[p.type] < cfg.maxInventory) {
        player.inventory[p.type]++;
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
      setTimeout(() => { player.spreadActive = false; }, cfg.duration);
      break;
    case PowerUpType.SPEED:
      player.speedBoosted = true;
      setTimeout(() => { player.speedBoosted = false; }, cfg.duration);
      break;
    case PowerUpType.BOMB:
      // 清除全屏敌人子弹（由 game.js 调用实现）
      player.bombRequested = true;
      break;
    case PowerUpType.MAGNET:
      player.magnetActive = true;
      setTimeout(() => { player.magnetActive = false; }, cfg.duration);
      break;
  }
  return true;
}