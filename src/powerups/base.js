// 道具基类
// 提供通用下落 / 碰撞 / 钩子机制
// 新增道具：继承 BasePowerUp + 重写 onPickup / onActivate，导出 default 即可自动注册
import { CONFIG, POWERUP_CONFIGS } from '../config.js';

export class BasePowerUp {
  constructor(type, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.cfg = POWERUP_CONFIGS[type] || {};
    this.size = this.cfg.size || CONFIG.POWERUP_SIZE;
    this.color = this.cfg.color || '#ffffff';
    this.active = true;
    this._onInit?.();
  }

  /**
   * 每帧更新（默认下落 + 边界检测）
   * 子类可重写以实现特殊运动（如漂浮、追踪）
   */
  update() {
    this._onUpdate?.(this);
    if (!this.active) return;
    // 默认下落
    this.y += CONFIG.POWERUP_FALL_SPEED;
    if (this.y > CONFIG.CANVAS_HEIGHT + this.size) {
      this.active = false;
    }
  }

  /**
   * 玩家拾取瞬间（默认：进入背包，由子类实现具体效果）
   * 返回 true 表示已消耗（不再入背包）
   */
  onPickup(_player) {
    return false;
  }

  /**
   * 玩家主动激活（仅可激活型道具）
   */
  onActivate(_player) {
    // 默认空实现
  }
}
