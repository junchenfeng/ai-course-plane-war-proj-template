// BOSS 模块
import { CONFIG, EnemyType, BulletOwner } from './config.js';
import { Bullet } from './player.js';
import { randomRange } from './utils.js';

export class Boss {
  constructor() {
    this.type = EnemyType.RED_BOSS;
    this.x = randomRange(80, CONFIG.CANVAS_WIDTH - 80);
    this.y = -60;
    this.hp = CONFIG.BOSS_HP;
    this.maxHp = CONFIG.BOSS_HP;
    this.size = CONFIG.BOSS_SIZE;
    this.shootCooldown = 0;
    this.burstCount = 0;
    this.burstCooldown = 0;
    this.isBursting = false;
    this.bullets = [];
    this.active = true;
    this.isDying = false;
    this.deathTimer = 0;
    this.scaleAnimation = 1;
  }

  update(playerPos, deltaTime) {
    if (this.isDying) {
      this.scaleAnimation -= 0.02;
      this.deathTimer -= deltaTime;
      if (this.scaleAnimation <= 0) this.active = false;
      return;
    }

    // 移动到屏幕 1/4 位置
    if (this.y < CONFIG.CANVAS_HEIGHT / 4) {
      this.y += 0.5;
    }

    // 射击逻辑
    if (this.isBursting) {
      this.burstCooldown -= deltaTime;
      if (this.burstCooldown <= 0 && this.burstCount < CONFIG.BOSS_BURST_COUNT) {
        this.shootTrackingBullet(playerPos);
        this.burstCount++;
        this.burstCooldown = CONFIG.BOSS_BURST_INTERVAL;
      }
      if (this.burstCount >= CONFIG.BOSS_BURST_COUNT) {
        this.isBursting = false;
        this.burstCount = 0;
        this.shootCooldown = CONFIG.BOSS_SHOOT_INTERVAL;
      }
    } else {
      this.shootCooldown -= deltaTime;
      if (this.shootCooldown <= 0) {
        this.isBursting = true;
        this.burstCooldown = 0;
      }
    }

    this.bullets.forEach(b => b.update());
    this.bullets = this.bullets.filter(b => b.active);
  }

  shootTrackingBullet(playerPos) {
    // 发射时计算方向，之后子弹沿固定方向飞行
    const dx = playerPos.x - this.x;
    const dy = playerPos.y - this.y;
    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
    const vx = (dx / mag) * CONFIG.BULLET_SPEED * 0.6;
    const vy = (dy / mag) * CONFIG.BULLET_SPEED * 0.6;
    this.bullets.push(new Bullet(
      this.x, this.y + this.size,
      vx, vy,
      BulletOwner.ENEMY, '#ff4444'
    ));
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDying = true;
      this.deathTimer = 500;
      return 'boss_explosion';
    }
    return null;
  }

  isAlive() { return this.hp > 0; }
}
