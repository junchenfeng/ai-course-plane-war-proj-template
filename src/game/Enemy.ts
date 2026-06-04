// 敌人类

import { EnemyType, BulletOwner, Position } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  ENEMY_SIZE,
  BOSS_SIZE,
  YELLOW_ENEMY_HP,
  GREEN_ENEMY_HP,
  BOSS_HP,
  YELLOW_ENEMY_SHOOT_INTERVAL,
  BOSS_SHOOT_INTERVAL,
  BOSS_BURST_COUNT,
  BOSS_BURST_INTERVAL,
  BULLET_SPEED,
  GREEN_ENEMY_TRACKING_SPEED
} from './constants';
import { Bullet } from './Bullet';
import { randomRange, calculateDirection } from './utils';

export enum DeathEffect {
  EXPLOSION = 'explosion',
  FLASH = 'flash',
  BOSS_EXPLOSION = 'boss_explosion'
}

export class Enemy {
  private position: Position;
  private type: EnemyType;
  private hp: number;
  private maxHp: number;
  private size: number;
  private shootCooldown: number = 0;
  private burstCount: number = 0;
  private burstCooldown: number = 0;
  private isBursting: boolean = false;
  private bullets: Bullet[] = [];
  private active: boolean = true;
  private flashTimer: number = 0; // 用于死亡闪烁效果
  private scaleAnimation: number = 1; // 用于Boss死亡缩放动画
  private isDying: boolean = false;
  private deathTimer: number = 0;

  constructor(type: EnemyType, startX?: number) {
    this.type = type;
    
    const x = startX ?? randomRange(50, CANVAS_WIDTH - 50);
    this.position = { x, y: -50 };

    // 根据类型设置属性
    switch (type) {
      case EnemyType.YELLOW_CIRCLE:
        this.hp = YELLOW_ENEMY_HP;
        this.maxHp = YELLOW_ENEMY_HP;
        this.size = ENEMY_SIZE;
        this.shootCooldown = randomRange(0, YELLOW_ENEMY_SHOOT_INTERVAL);
        break;
      case EnemyType.GREEN_ARROW:
        this.hp = GREEN_ENEMY_HP;
        this.maxHp = GREEN_ENEMY_HP;
        this.size = ENEMY_SIZE;
        break;
      case EnemyType.RED_BOSS:
        this.hp = BOSS_HP;
        this.maxHp = BOSS_HP;
        this.size = BOSS_SIZE;
        this.shootCooldown = BOSS_SHOOT_INTERVAL;
        this.burstCount = 0;
        break;
    }
  }

  update(playerPosition: Position, deltaTime: number): void {
    if (this.isDying) {
      this.updateDeathAnimation(deltaTime);
      return;
    }

    // 根据类型更新行为
    switch (this.type) {
      case EnemyType.YELLOW_CIRCLE:
        // 黄色圆形敌人向下移动
        this.position.y += 1;
        
        // 间隔1秒发射子弹
        this.shootCooldown -= deltaTime;
        if (this.shootCooldown <= 0) {
          this.shootDownwards();
          this.shootCooldown = YELLOW_ENEMY_SHOOT_INTERVAL;
        }
        break;

      case EnemyType.GREEN_ARROW: {
        // 绿色箭头敌人向主角机位置追踪
        const direction = calculateDirection(this.position, playerPosition);
        this.position.x += direction.vx * GREEN_ENEMY_TRACKING_SPEED;
        this.position.y += direction.vy * GREEN_ENEMY_TRACKING_SPEED + 0.5; // 加一点向下移动
        break;
      }

      case EnemyType.RED_BOSS:
        // Boss 缓慢向下移动，到达一定位置后停止
        if (this.position.y < 100) {
          this.position.y += 0.5;
        }

        // Boss 发射追踪子弹逻辑
        if (this.isBursting) {
          this.burstCooldown -= deltaTime;
          if (this.burstCooldown <= 0 && this.burstCount < BOSS_BURST_COUNT) {
            this.shootTrackingBullet(playerPosition);
            this.burstCount++;
            this.burstCooldown = BOSS_BURST_INTERVAL;
          }
          if (this.burstCount >= BOSS_BURST_COUNT) {
            this.isBursting = false;
            this.burstCount = 0;
            this.shootCooldown = BOSS_SHOOT_INTERVAL;
          }
        } else {
          this.shootCooldown -= deltaTime;
          if (this.shootCooldown <= 0) {
            this.isBursting = true;
            this.burstCooldown = 0;
          }
        }
        break;
    }

    // 检查是否超出下边界（普通敌人）
    if (this.type !== EnemyType.RED_BOSS && this.position.y > CANVAS_HEIGHT + 50) {
      this.active = false;
    }

    // 更新子弹
    this.bullets.forEach(bullet => bullet.update(playerPosition));
    this.bullets = this.bullets.filter(bullet => bullet.isBulletActive());
  }

  private shootDownwards(): void {
    const bullet = new Bullet(
      { x: this.position.x, y: this.position.y + this.size },
      { vx: 0, vy: BULLET_SPEED * 0.5 },
      BulletOwner.ENEMY,
      '#ffff00'
    );
    this.bullets.push(bullet);
  }

  private shootTrackingBullet(playerPosition: Position): void {
    const bullet = new Bullet(
      { x: this.position.x, y: this.position.y + this.size },
      { vx: 0, vy: BULLET_SPEED * 0.3 },
      BulletOwner.ENEMY_TRACKING,
      '#ff4444',
      playerPosition
    );
    this.bullets.push(bullet);
  }

  private updateDeathAnimation(deltaTime: number): void {
    this.deathTimer -= deltaTime;
    
    switch (this.type) {
      case EnemyType.YELLOW_CIRCLE:
        // 爆炸效果立即执行
        if (this.deathTimer <= 0) {
          this.active = false;
        }
        break;
      case EnemyType.GREEN_ARROW:
        // 闪烁效果
        this.flashTimer += deltaTime;
        if (this.flashTimer > 50) {
          this.flashTimer = 0;
        }
        if (this.deathTimer <= 0) {
          this.active = false;
        }
        break;
      case EnemyType.RED_BOSS:
        // 缩放动画
        this.scaleAnimation -= 0.02;
        if (this.scaleAnimation <= 0) {
          this.active = false;
        }
        break;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;

    ctx.save();
    ctx.translate(this.position.x, this.position.y);

    // 处理死亡动画
    if (this.isDying) {
      if (this.type === EnemyType.GREEN_ARROW) {
        // 闪烁效果
        if (this.flashTimer > 25) {
          ctx.globalAlpha = 0.3;
        }
      } else if (this.type === EnemyType.RED_BOSS) {
        // 缩放动画
        ctx.scale(this.scaleAnimation, this.scaleAnimation);
      }
    }

    // 根据类型绘制不同形状
    switch (this.type) {
      case EnemyType.YELLOW_CIRCLE:
        this.drawYellowCircle(ctx);
        break;
      case EnemyType.GREEN_ARROW:
        this.drawGreenArrow(ctx);
        break;
      case EnemyType.RED_BOSS:
        this.drawRedBoss(ctx);
        break;
    }

    ctx.restore();

    // 绘制子弹
    this.bullets.forEach(bullet => bullet.draw(ctx));
  }

  private drawYellowCircle(ctx: CanvasRenderingContext2D): void {
    // 黄色圆形敌人
    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = '#ffcc00';
    ctx.shadowBlur = 10;
    ctx.fill();

    // 内部装饰
    ctx.beginPath();
    ctx.arc(0, 0, this.size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffdd44';
    ctx.fill();
    ctx.shadowBlur = 0;

    // HP 显示
    this.drawHpBar(ctx);
  }

  private drawGreenArrow(ctx: CanvasRenderingContext2D): void {
    // 绿色箭头敌人（向下指的箭头）
    ctx.beginPath();
    ctx.moveTo(0, this.size);
    ctx.lineTo(-this.size * 0.6, -this.size * 0.3);
    ctx.lineTo(0, -this.size * 0.6);
    ctx.lineTo(this.size * 0.6, -this.size * 0.3);
    ctx.closePath();
    ctx.fillStyle = '#44ff44';
    ctx.shadowColor = '#44ff44';
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.shadowBlur = 0;
  }

  private drawRedBoss(ctx: CanvasRenderingContext2D): void {
    // 红色六边形 Boss
    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = Math.cos(angle) * this.size;
      const y = Math.sin(angle) * this.size;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 20;
    ctx.fill();

    // 内部装饰
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = Math.cos(angle) * this.size * 0.6;
      const y = Math.sin(angle) * this.size * 0.6;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fillStyle = '#ff6666';
    ctx.fill();
    ctx.shadowBlur = 0;

    // HP 显示
    this.drawHpBar(ctx);

    // Boss 标签
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', 0, -this.size - 15);
  }

  private drawHpBar(ctx: CanvasRenderingContext2D): void {
    const barWidth = this.size * 1.5;
    const barHeight = 4;
    const y = this.size + 10;

    ctx.fillStyle = '#333333';
    ctx.fillRect(-barWidth / 2, y, barWidth, barHeight);

    const hpRatio = this.hp / this.maxHp;
    ctx.fillStyle = hpRatio > 0.5 ? '#44ff44' : hpRatio > 0.25 ? '#ffcc44' : '#ff4444';
    ctx.fillRect(-barWidth / 2, y, barWidth * hpRatio, barHeight);
  }

  takeDamage(amount: number): DeathEffect | null {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.isDying = true;
      this.deathTimer = 300; // 死亡动画持续时间
      
      // 返回死亡效果类型
      switch (this.type) {
        case EnemyType.YELLOW_CIRCLE:
          return DeathEffect.EXPLOSION;
        case EnemyType.GREEN_ARROW:
          return DeathEffect.FLASH;
        case EnemyType.RED_BOSS:
          return DeathEffect.BOSS_EXPLOSION;
      }
    }
    return null;
  }

  getBullets(): Bullet[] {
    return this.bullets;
  }

  getPosition(): Position {
    return this.position;
  }

  getSize(): number {
    return this.size;
  }

  getType(): EnemyType {
    return this.type;
  }

  getHp(): number {
    return this.hp;
  }

  isEnemyActive(): boolean {
    return this.active;
  }

  isAlive(): boolean {
    return this.hp > 0;
  }

  getDeathPosition(): Position {
    return { ...this.position };
  }
}