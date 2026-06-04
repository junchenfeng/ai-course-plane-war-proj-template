// 玩家模块
import { CONFIG, BulletOwner } from './config.js';
import { clamp } from './utils.js';

export class Player {
  constructor() {
    this.x = CONFIG.CANVAS_WIDTH / 2;
    this.y = CONFIG.CANVAS_HEIGHT - 80;
    this.hp = CONFIG.PLAYER_HP;
    this.maxHp = CONFIG.PLAYER_HP;
    this.shootCooldown = 0;
    this.invincibleTime = 0;
    this.active = true;
    this.bullets = [];
  }

  update(input, deltaTime) {
    // 更新无敌时间
    if (this.invincibleTime > 0) {
      this.invincibleTime -= deltaTime;
    }

    // 移动
    if (input.useMouse && input.mouseX !== undefined && input.mouseY !== undefined) {
      const dx = input.mouseX - this.x;
      const dy = input.mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > CONFIG.PLAYER_SPEED) {
        this.x += (dx / dist) * CONFIG.PLAYER_SPEED;
        this.y += (dy / dist) * CONFIG.PLAYER_SPEED;
      } else {
        this.x = input.mouseX;
        this.y = input.mouseY;
      }
    } else {
      if (input.up) this.y -= CONFIG.PLAYER_SPEED;
      if (input.down) this.y += CONFIG.PLAYER_SPEED;
      if (input.left) this.x -= CONFIG.PLAYER_SPEED;
      if (input.right) this.x += CONFIG.PLAYER_SPEED;
    }

    this.x = clamp(this.x, CONFIG.PLAYER_SIZE, CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_SIZE);
    this.y = clamp(this.y, CONFIG.PLAYER_SIZE, CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE);

    // 射击冷却
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }

    // 射击
    if (input.shoot && this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = CONFIG.PLAYER_SHOOT_COOLDOWN;
    }

    // 更新子弹
    this.bullets.forEach(b => b.update());
    this.bullets = this.bullets.filter(b => b.active);
  }

  shoot() {
    this.bullets.push(new Bullet(
      this.x, this.y - CONFIG.PLAYER_SIZE,
      0, -CONFIG.BULLET_SPEED,
      BulletOwner.PLAYER, '#ffffff'
    ));
  }

  takeDamage(amount) {
    if (this.invincibleTime > 0) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.active = false;
    }
    this.invincibleTime = CONFIG.PLAYER_INVINCIBLE_TIME;
  }

  isInvincible() {
    return this.invincibleTime > 0;
  }

  reset() {
    this.x = CONFIG.CANVAS_WIDTH / 2;
    this.y = CONFIG.CANVAS_HEIGHT - 80;
    this.hp = CONFIG.PLAYER_HP;
    this.active = true;
    this.bullets = [];
    this.invincibleTime = 0;
  }
}

// 子弹类（被 player 和 enemies 共用）
export class Bullet {
  constructor(x, y, vx, vy, owner, color = '#ffffff', target = null) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.owner = owner;
    this.color = color;
    this.size = CONFIG.BULLET_SIZE;
    this.target = target;
    this.active = true;
  }

  update(playerPos = null) {
    // 追踪子弹
    if (this.owner === BulletOwner.ENEMY_TRACKING && playerPos) {
      const dx = playerPos.x - this.x;
      const dy = playerPos.y - this.y;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;
      this.vx = (dx / mag) * CONFIG.BULLET_SPEED * 0.6;
      this.vy = (dy / mag) * CONFIG.BULLET_SPEED * 0.6;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > CONFIG.CANVAS_WIDTH ||
        this.y < 0 || this.y > CONFIG.CANVAS_HEIGHT) {
      this.active = false;
    }
  }
}
