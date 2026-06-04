// 玩家模块
import { CONFIG, BulletOwner } from './config.js';
import { clamp } from './utils.js';

export class Player {
  constructor() {
    this.x = CONFIG.CANVAS_WIDTH / 2;
    this.y = CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_INITIAL_Y;
    this.hp = CONFIG.PLAYER_HP;
    this.maxHp = CONFIG.PLAYER_HP;
    this.shootCooldown = 0;
    this.invincibleTime = 0;
    this.active = true;
    this.bullets = [];
    this.spreadActive = false;
    this.spreadTimer = 0;
    this.hasSpreadPowerup = false;

    // 道具背包系统（由 powerups.js 驱动）
    this.inventory = {};       // { type: count }
    this.speedBoosted = false;
    this.speedTimer = 0;
    this.magnetActive = false;
    this.magnetTimer = 0;
    this.bombRequested = false; // 标记是否需要清屏
  }

  update(input, deltaTime) {
    // 更新无敌时间
    if (this.invincibleTime > 0) {
      this.invincibleTime -= deltaTime;
    }

    // 移动
    const speed = this.speedBoosted ? CONFIG.PLAYER_SPEED * 1.4 : CONFIG.PLAYER_SPEED;
    if (input.useMouse && input.mouseX !== undefined && input.mouseY !== undefined) {
      const dx = input.mouseX - this.x;
      const dy = input.mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > speed) {
        this.x += (dx / dist) * speed;
        this.y += (dy / dist) * CONFIG.PLAYER_SPEED;
      } else {
        this.x = input.mouseX;
        this.y = input.mouseY;
      }
    } else {
      if (input.up) this.y -= speed;
      if (input.down) this.y += speed;
      if (input.left) this.x -= speed;
      if (input.right) this.x += speed;
    }

    this.x = clamp(this.x, CONFIG.PLAYER_SIZE, CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_SIZE);
    this.y = clamp(this.y, CONFIG.PLAYER_SIZE, CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_SIZE);

    // 射击冷却
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }

    // 散弹计时器
    if (this.spreadActive) {
      this.spreadTimer -= deltaTime;
      if (this.spreadTimer <= 0) {
        this.spreadActive = false;
        this.spreadTimer = 0;
        // 背包中还有散弹则保持持有态
        this.hasSpreadPowerup = !!(this.inventory && this.inventory.spread && this.inventory.spread > 0);
      }
    }

    // 加速计时器
    if (this.speedBoosted) {
      this.speedTimer -= deltaTime;
      if (this.speedTimer <= 0) {
        this.speedBoosted = false;
        this.speedTimer = 0;
      }
    }

    // 磁铁计时器
    if (this.magnetActive) {
      this.magnetTimer -= deltaTime;
      if (this.magnetTimer <= 0) {
        this.magnetActive = false;
        this.magnetTimer = 0;
      }
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
    const speed = CONFIG.BULLET_SPEED;
    const angleRad = Math.PI / 180;

    if (this.spreadActive) {
      // 三发散弹：主弹道 + 左右各15度
      this.bullets.push(new Bullet(this.x, this.y - CONFIG.PLAYER_SIZE, 0, -speed, BulletOwner.PLAYER, '#ffffff'));
      this.bullets.push(new Bullet(this.x, this.y - CONFIG.PLAYER_SIZE, -speed * Math.sin(CONFIG.POWERUP_SPREAD_ANGLE * angleRad), -speed * Math.cos(CONFIG.POWERUP_SPREAD_ANGLE * angleRad), BulletOwner.PLAYER, '#88ccff'));
      this.bullets.push(new Bullet(this.x, this.y - CONFIG.PLAYER_SIZE, speed * Math.sin(CONFIG.POWERUP_SPREAD_ANGLE * angleRad), -speed * Math.cos(CONFIG.POWERUP_SPREAD_ANGLE * angleRad), BulletOwner.PLAYER, '#88ccff'));
    } else {
      this.bullets.push(new Bullet(this.x, this.y - CONFIG.PLAYER_SIZE, 0, -speed, BulletOwner.PLAYER, '#ffffff'));
    }
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
    this.y = CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_INITIAL_Y;
    this.hp = CONFIG.PLAYER_HP;
    this.active = true;
    this.bullets = [];
    this.invincibleTime = 0;
    this.spreadActive = false;
    this.spreadTimer = 0;
    this.hasSpreadPowerup = false;
    this.inventory = {};
    this.speedBoosted = false;
    this.speedTimer = 0;
    this.magnetActive = false;
    this.magnetTimer = 0;
    this.bombRequested = false;
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

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > CONFIG.CANVAS_WIDTH ||
        this.y < 0 || this.y > CONFIG.CANVAS_HEIGHT) {
      this.active = false;
    }
  }
}
