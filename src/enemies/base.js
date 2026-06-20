// 敌人基类
// 提供通用血量/更新/死亡机制 + 生命周期钩子
// 新增敌人：1) types/ 加新文件 2) config.js ENEMY_CONFIGS 加一条
//
// 钩子签名约定：(enemy, player, dt) => void
//  - enemy: 当前敌人实例（this 别名）
//  - player: 玩家位置 { x, y }
//  - dt: 帧间时间差（毫秒）
//
// 可用钩子：
//  - _onInit()                        构造后初始化
//  - _onUpdate(enemy, player, dt)     每帧移动逻辑
//  - _onShootTick(enemy, player, dt)  每帧射击逻辑
//  - _onDying(enemy, dt)              死亡动画
//  - _onShoot(enemy, player)          发射子弹时被调用
import { ENEMY_CONFIGS, BulletOwner } from '../config.js';
import { Bullet } from '../player.js';

export class BaseEnemy {
  constructor(type, startX) {
    const cfg = ENEMY_CONFIGS[type] || {};
    this.type = type;
    this.x = startX ?? (50 + Math.random() * (500 - 100));
    this.y = cfg.startY ?? -50;
    this.hp = cfg.hp ?? 1;
    this.maxHp = cfg.hp ?? 1;
    this.size = cfg.size ?? 25;
    this.score = cfg.score ?? 0;
    this.fallSpeed = cfg.fallSpeed ?? 0;
    this.shootInterval = cfg.shootInterval ?? 0;
    this.shootColor = cfg.shootColor ?? '#ffffff';
    this.color = cfg.color ?? '#ffffff';
    this.deathEffect = cfg.deathEffect ?? 'explosion';
    this.shootCooldown = cfg.shootInterval ? Math.random() * cfg.shootInterval : 0;
    this.bullets = [];
    this.active = true;
    this.isDying = false;
    this.deathTimer = 0;
    if (typeof this._onInit === 'function') this._onInit();
  }

  /**
   * 每帧更新
   * 默认：基础下落 + 默认射击
   * 子类/钩子可完全重写
   */
  update(playerPos, dt) {
    if (this.isDying) {
      if (typeof this._onDying === 'function') this._onDying(this, dt);
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) this.active = false;
      return;
    }

    // 移动
    if (typeof this._onUpdate === 'function') {
      this._onUpdate(this, playerPos, dt);
    } else if (this.fallSpeed > 0) {
      this.y += this.fallSpeed;
    }

    // 射击
    if (typeof this._onShootTick === 'function') {
      this._onShootTick(this, playerPos, dt);
    } else if (this.shootInterval > 0) {
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0) {
        if (typeof this._onShoot === 'function') {
          this._onShoot(this, playerPos);
        } else {
          this._defaultShoot();
        }
        this.shootCooldown = this.shootInterval;
      }
    }

    // 出界检测
    if (this.y > 700 + 100) this.active = false;

    // 子弹更新
    if (this.bullets.length > 0) {
      this.bullets.forEach(b => b.update(playerPos));
      this.bullets = this.bullets.filter(b => b.active);
    }
  }

  /**
   * 受伤
   * @returns {string|null} 死亡特效类型
   */
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDying = true;
      this.deathTimer = 500;
      return this.deathEffect;
    }
    return null;
  }

  isAlive() { return this.hp > 0; }

  /**
   * 默认射击：向下发射一颗子弹
   * 子类可重写或通过 _onShoot 钩子覆盖
   */
  _defaultShoot() {
    this.bullets.push(new Bullet(
      this.x,
      this.y + this.size,
      0,
      4,
      BulletOwner.ENEMY,
      this.shootColor,
    ));
  }
}
