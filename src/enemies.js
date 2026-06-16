// 普通敌人模块
import { CONFIG, EnemyType, BulletOwner } from './config.js';
import { Bullet } from './player.js';
import { randomRange } from './utils.js';

export class Enemy {
  constructor(type, startX) {
    this.type = type;
    this.x = startX ?? randomRange(50, CONFIG.CANVAS_WIDTH - 50);
    this.y = -50;
    this.shootCooldown = 0;
    this.bullets = [];
    this.active = true;
    this.isDying = false;
    this.deathTimer = 0;

    switch (type) {
      case EnemyType.YELLOW_CIRCLE:
        this.hp = CONFIG.YELLOW_ENEMY_HP;
        this.maxHp = CONFIG.YELLOW_ENEMY_HP;
        this.size = CONFIG.ENEMY_SIZE;
        this.shootCooldown = randomRange(0, CONFIG.YELLOW_ENEMY_SHOOT_INTERVAL);
        break;
    }
  }

  update(playerPos, deltaTime) {
    if (this.isDying) {
      this.deathTimer -= deltaTime;
      if (this.deathTimer <= 0) this.active = false;
      return;
    }

    if (this.type === EnemyType.YELLOW_CIRCLE) {
      this.y += CONFIG.ENEMY_FALL_SPEED_YELLOW;
      this.shootCooldown -= deltaTime;
      if (this.shootCooldown <= 0) {
        this.shootDownwards();
        this.shootCooldown = CONFIG.YELLOW_ENEMY_SHOOT_INTERVAL;
      }
    }

    if (this.y > CONFIG.CANVAS_HEIGHT + CONFIG.ENEMY_REMOVE_OFFSET) {
      this.active = false;
    }

    this.bullets.forEach(b => b.update(playerPos));
    this.bullets = this.bullets.filter(b => b.active);
  }

  shootDownwards() {
    this.bullets.push(new Bullet(
      this.x, this.y + this.size,
      0, CONFIG.BULLET_SPEED * 0.5,
      BulletOwner.ENEMY, '#ffff00'
    ));
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDying = true;
      this.deathTimer = CONFIG.ENEMY_DEATH_TIMER;
      if (this.type === EnemyType.YELLOW_CIRCLE) return 'explosion';
    }
    return null;
  }

  isAlive() { return this.hp > 0; }
}
