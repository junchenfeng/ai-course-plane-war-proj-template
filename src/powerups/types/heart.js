// 生命道具：瞬间消耗型
// 拾取即恢复 1 点生命，不入背包
import { CONFIG, PowerUpType } from '../../config.js';
import { BasePowerUp } from '../base.js';

export class HeartPowerUp extends BasePowerUp {
  onPickup(player) {
    player.hp = Math.min(player.hp + 1, CONFIG.PLAYER_MAX_HP);
    this.active = false; // 标记已消耗
    return true; // 返回 true 表示已消耗
  }
}

export default {
  type: PowerUpType.HEART,
  class: HeartPowerUp,
};
