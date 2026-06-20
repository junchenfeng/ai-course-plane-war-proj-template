// 红色 BOSS（复杂敌人示例：状态机）
// 演示如何用 class 继承 BaseEnemy 写多阶段行为
import { BaseEnemy } from '../base.js';
import { CONFIG, BulletOwner } from '../../config.js';
import { Bullet } from '../../player.js';
import { randomRange } from '../../utils.js';

class RedBossEnemy extends BaseEnemy {
  constructor(type, startX) {
    super(type, startX);
    // BOSS 初始位置在屏幕上方居中
    this.x = startX ?? randomRange(80, CONFIG.CANVAS_WIDTH - 80);
    this.y = CONFIG.BOSS_ENTRY_Y;
    this.shootCooldown = 0;
    this.burstCount = 0;
    this.burstCooldown = 0;
    this.isBursting = false;
    this.scaleAnimation = 1;
  }

  /**
   * 自定义移动 + 射击逻辑
   * 默认基类行为不适用，完整重写
   * 签名: (self, playerPos, dt) - 与 BaseEnemy.update 匹配
   */
  _onUpdate(self, playerPos, dt) {
    // 阶段 1：进入屏幕，移动到目标 Y
    if (this.y < CONFIG.CANVAS_HEIGHT / CONFIG.BOSS_STOP_Y_RATIO) {
      this.y += CONFIG.BOSS_MOVE_SPEED;
    }

    // 阶段 2：射击（追踪连发）
    if (this.isBursting) {
      this.burstCooldown -= dt;
      if (this.burstCooldown <= 0 && this.burstCount < CONFIG.BOSS_BURST_COUNT) {
        this._shootTracking(playerPos);
        this.burstCount++;
        this.burstCooldown = CONFIG.BOSS_BURST_INTERVAL;
      }
      if (this.burstCount >= CONFIG.BOSS_BURST_COUNT) {
        this.isBursting = false;
        this.burstCount = 0;
        this.shootCooldown = CONFIG.BOSS_SHOOT_INTERVAL;
      }
    } else {
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0) {
        this.isBursting = true;
        this.burstCooldown = 0;
      }
    }
  }

  /**
   * 自定义射击：追踪玩家
   */
  _shootTracking(playerPos) {
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const speed = CONFIG.BULLET_SPEED * CONFIG.BOSS_BULLET_SPEED_MULT;
    this.bullets.push(new Bullet(
      this.x, this.y + this.size,
      (dx / mag) * speed, (dy / mag) * speed,
      BulletOwner.ENEMY, '#ff4444'
    ));
  }

  /**
   * 自定义死亡动画：缩放
   */
  _onDying(dt) {
    this.scaleAnimation -= CONFIG.BOSS_SCALE_RATE;
    if (this.scaleAnimation <= 0) {
      this.scaleAnimation = 0;
      this.active = false;
    }
  }

  /**
   * 重写死亡时长
   */
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDying = true;
      this.deathTimer = CONFIG.BOSS_DEATH_TIMER;
      return this.deathEffect;
    }
    return null;
  }
}

// BOSS 渲染：缩放因子从 instance 读
function drawRedBoss(ctx, enemy) {
  ctx.save();
  ctx.scale(enemy.scaleAnimation, enemy.scaleAnimation);
  ctx.fillStyle = enemy.color;
  ctx.beginPath();
  ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
  ctx.fill();

  // 装饰圈
  ctx.strokeStyle = 'rgba(255, 100, 100, 0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, enemy.size * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export default {
  type: 'red_boss',
  class: RedBossEnemy,
  onRender: drawRedBoss,
};
