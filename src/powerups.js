// 道具模块
import { CONFIG } from './config.js';
import { circleCollision } from './utils.js';

export class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = CONFIG.POWERUP_SIZE;
    this.active = true;
  }

  update() {
    this.y += CONFIG.POWERUP_FALL_SPEED;
    if (this.y > CONFIG.CANVAS_HEIGHT + this.size) {
      this.active = false;
    }
  }

  getType() {
    return 'spread';
  }
}

export function spawnPowerUp(x, y) {
  if (Math.random() < CONFIG.POWERUP_DROP_RATE) {
    return new PowerUp(x, y);
  }
  return null;
}

export function checkPowerUpCollisions(player, powerups) {
  powerups.forEach(p => {
    if (!p.active) return;
    if (circleCollision(p, p.size, player, CONFIG.PLAYER_SIZE)) {
      // 道具触发式：拾取后存储，不自动激活；已持有时不叠加
      if (!player.hasSpreadPowerup && !player.spreadActive) {
        player.hasSpreadPowerup = true;
      }
      p.active = false;
    }
  });
}
