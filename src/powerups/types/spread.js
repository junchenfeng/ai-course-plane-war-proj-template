// 散弹道具：可激活持续型
// 拾取后存入背包，玩家按数字键 1 激活，持续 5 秒发射 3 发散射子弹
import { PowerUpType } from '../../config.js';
import { BasePowerUp } from '../base.js';

export class SpreadPowerUp extends BasePowerUp {
  onActivate(player) {
    player.spreadActive = true;
    player.hasSpreadPowerup = true;
    player.spreadTimer = this.cfg.duration;
  }
}

export default {
  type: PowerUpType.SPREAD,
  class: SpreadPowerUp,
};
