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
    this.shootCooldown = CONFIG.BOSS_SHOOT_INTERVAL;
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

    this.bullets.forEach(b => b.update(playerPos));
    this.bullets = this.bullets.filter(b => b.active);
  }

  shootTrackingBullet(playerPos) {
    this.bullets.push(new Bullet(
      this.x, this.y + this.size,
      0, CONFIG.BULLET_SPEED * 0.3,
      BulletOwner.ENEMY_TRACKING, '#ff4444',
      { x: playerPos.x, y: playerPos.y }
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
