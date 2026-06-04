// 玩家类

import { Position, BulletOwner } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SIZE, PLAYER_SPEED, PLAYER_HP, PLAYER_SHOOT_COOLDOWN, BULLET_SPEED } from './constants';
import { Bullet } from './Bullet';
import { clamp } from './utils';

export class Player {
  private position: Position;
  private hp: number;
  private maxHp: number;
  private shootCooldown: number = 0;
  private active: boolean = true;
  private bullets: Bullet[] = [];

  constructor() {
    this.position = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 80
    };
    this.hp = PLAYER_HP;
    this.maxHp = PLAYER_HP;
  }

  update(
    input: { up: boolean; down: boolean; left: boolean; right: boolean; shoot: boolean; mouseX?: number; mouseY?: number; useMouse?: boolean },
    deltaTime: number
  ): void {
    // 处理移动
    if (input.useMouse && input.mouseX !== undefined && input.mouseY !== undefined) {
      // 鼠标控制
      const dx = input.mouseX - this.position.x;
      const dy = input.mouseY - this.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > PLAYER_SPEED) {
        this.position.x += (dx / dist) * PLAYER_SPEED;
        this.position.y += (dy / dist) * PLAYER_SPEED;
      } else {
        this.position.x = input.mouseX;
        this.position.y = input.mouseY;
      }
    } else {
      // 键盘控制
      if (input.up) this.position.y -= PLAYER_SPEED;
      if (input.down) this.position.y += PLAYER_SPEED;
      if (input.left) this.position.x -= PLAYER_SPEED;
      if (input.right) this.position.x += PLAYER_SPEED;
    }

    // 边界限制
    this.position.x = clamp(this.position.x, PLAYER_SIZE, CANVAS_WIDTH - PLAYER_SIZE);
    this.position.y = clamp(this.position.y, PLAYER_SIZE, CANVAS_HEIGHT - PLAYER_SIZE);

    // 处理射击冷却
    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }

    // 处理射击
    if (input.shoot && this.shootCooldown <= 0) {
      this.shoot();
      this.shootCooldown = PLAYER_SHOOT_COOLDOWN;
    }

    // 更新子弹
    this.bullets.forEach(bullet => bullet.update());
    this.bullets = this.bullets.filter(bullet => bullet.isBulletActive());
  }

  private shoot(): void {
    // 发射子弹（蓝色三角飞机发射白色子弹）
    const bullet = new Bullet(
      { x: this.position.x, y: this.position.y - PLAYER_SIZE },
      { vx: 0, vy: -BULLET_SPEED },
      BulletOwner.PLAYER,
      '#ffffff'
    );
    this.bullets.push(bullet);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    // 绘制蓝色三角飞机
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    
    // 主体三角形
    ctx.beginPath();
    ctx.moveTo(0, -PLAYER_SIZE);
    ctx.lineTo(-PLAYER_SIZE * 0.8, PLAYER_SIZE * 0.5);
    ctx.lineTo(PLAYER_SIZE * 0.8, PLAYER_SIZE * 0.5);
    ctx.closePath();
    
    ctx.fillStyle = '#4488ff';
    ctx.shadowColor = '#4488ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    
    // 内部三角形（装饰）
    ctx.beginPath();
    ctx.moveTo(0, -PLAYER_SIZE * 0.6);
    ctx.lineTo(-PLAYER_SIZE * 0.4, PLAYER_SIZE * 0.3);
    ctx.lineTo(PLAYER_SIZE * 0.4, PLAYER_SIZE * 0.3);
    ctx.closePath();
    ctx.fillStyle = '#66aaff';
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.restore();

    // 绘制子弹
    this.bullets.forEach(bullet => bullet.draw(ctx));
  }

  takeDamage(amount: number): void {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.active = false;
    }
  }

  getBullets(): Bullet[] {
    return this.bullets;
  }

  getPosition(): Position {
    return this.position;
  }

  getSize(): number {
    return PLAYER_SIZE;
  }

  getHp(): number {
    return this.hp;
  }

  getMaxHp(): number {
    return this.maxHp;
  }

  isPlayerActive(): boolean {
    return this.active;
  }

  reset(): void {
    this.position = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 80
    };
    this.hp = PLAYER_HP;
    this.active = true;
    this.bullets = [];
  }
}