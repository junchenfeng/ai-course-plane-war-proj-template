// 子弹类

import { BulletOwner, Position, Velocity } from './types';
import { BULLET_SIZE, BULLET_SPEED } from './constants';
import { normalizeVelocity, calculateDirection } from './utils';

export class Bullet {
  private position: Position;
  private velocity: Velocity;
  private owner: BulletOwner;
  private color: string;
  private size: number;
  private target: Position | null = null;
  private active: boolean = true;

  constructor(
    position: Position,
    velocity: Velocity,
    owner: BulletOwner,
    color: string = '#ffffff',
    target?: Position
  ) {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.owner = owner;
    this.color = color;
    this.size = BULLET_SIZE;
    this.target = target ? { ...target } : null;
  }

  update(playerPosition?: Position): void {
    // 追踪子弹会跟踪玩家
    if (this.owner === BulletOwner.ENEMY_TRACKING && playerPosition) {
      const direction = calculateDirection(this.position, playerPosition);
      this.velocity = {
        vx: direction.vx * BULLET_SPEED * 0.6,
        vy: direction.vy * BULLET_SPEED * 0.6
      };
    }

    this.position.x += this.velocity.vx;
    this.position.y += this.velocity.vy;

    // 检查是否超出边界
    if (
      this.position.x < 0 ||
      this.position.x > 800 ||
      this.position.y < 0 ||
      this.position.y > 600
    ) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    
    // 根据拥有者设置不同的样式
    if (this.owner === BulletOwner.PLAYER) {
      ctx.fillStyle = this.color;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
    } else if (this.owner === BulletOwner.ENEMY_TRACKING) {
      ctx.fillStyle = '#ff8844';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 5;
    }
    
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  getPosition(): Position {
    return this.position;
  }

  getSize(): number {
    return this.size;
  }

  getOwner(): BulletOwner {
    return this.owner;
  }

  isBulletActive(): boolean {
    return this.active;
  }

  deactivate(): void {
    this.active = false;
  }
}