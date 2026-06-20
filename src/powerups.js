// 道具公共 API
// 架构：types/ 目录每种道具一个文件 + PowerUpRegistry 自动注册
// 新增道具：1) types/ 加新文件 2) config.js POWERUP_CONFIGS 加一条
import { CONFIG, PowerUpType, POWERUP_CONFIGS } from './config.js';
import { circleCollision } from './utils.js';
import { playPowerUpSound } from './audio.js';
import { POWERUP_REGISTRY, createPowerUp } from './powerups/index.js';

/**
 * 道具掉落：按 dropWeight 加权随机生成
 */
export function spawnPowerUp(x, y) {
  if (Math.random() >= CONFIG.POWERUP_DROP_RATE) return null;

  const types = Array.from(POWERUP_REGISTRY.keys());
  if (types.length === 0) return null;

  // 加权随机
  const weights = types.map(t => POWERUP_CONFIGS[t]?.dropWeight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < types.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      return createPowerUp(types[i], x, y);
    }
  }
  return createPowerUp(types[types.length - 1], x, y);
}

/**
 * 把道具加入玩家背包（已激活型才需要）
 */
function addToInventory(player, type) {
  const cfg = POWERUP_CONFIGS[type];
  if (!cfg || !cfg.maxInventory || cfg.maxInventory <= 0) return;
  if (!player.inventory) player.inventory = {};
  if (!player.inventory[type]) player.inventory[type] = 0;
  if (player.inventory[type] < cfg.maxInventory) {
    player.inventory[type]++;
  }
  // 同步 UI 状态标记
  if (type === PowerUpType.SPREAD) {
    player.hasSpreadPowerup = true;
  }
}

/**
 * 玩家拾取道具（碰撞检测）
 */
export function checkPowerUpCollisions(player, powerups) {
  powerups.forEach(p => {
    if (!p.active) return;
    if (circleCollision(p, p.size, player, CONFIG.PLAYER_SIZE)) {
      const consumed = p.onPickup(player);
      if (!consumed) {
        // 未被 onPickup 消耗，进入背包
        addToInventory(player, p.type);
      }
      p.active = false;
      playPowerUpSound();
    }
  });
}

/**
 * 玩家激活背包中的道具
 */
export function activatePowerUp(player, type) {
  const cfg = POWERUP_CONFIGS[type];
  if (!cfg || !cfg.isActivable) return false;
  if (!player.inventory || !player.inventory[type] || player.inventory[type] <= 0) return false;

  // 扣减背包
  player.inventory[type]--;
  if (player.inventory[type] <= 0) {
    if (type === PowerUpType.SPREAD) {
      player.hasSpreadPowerup = false;
    }
  }

  // 触发激活钩子
  const temp = createPowerUp(type, 0, 0);
  if (temp) temp.onActivate(player);
  return true;
}

/**
 * 玩家持续型道具每帧更新（散弹计时器等）
 */
export function updatePlayerPowerUps(player, deltaTime) {
  // 散弹倒计时
  if (player.spreadActive) {
    player.spreadTimer -= deltaTime;
    if (player.spreadTimer <= 0) {
      player.spreadActive = false;
      player.spreadTimer = 0;
      // 背包还有则保持持有态
      player.hasSpreadPowerup = !!(player.inventory && player.inventory[PowerUpType.SPREAD] && player.inventory[PowerUpType.SPREAD] > 0);
    }
  }
}
