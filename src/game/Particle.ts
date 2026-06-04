// 粒子效果类

import { ParticleConfig } from './types';
import { randomColor, randomRange } from './utils';

export class Particle {
  private position: { x: number; y: number };
  private velocity: { vx: number; vy: number };
  private color: string;
  private size: number;
  private life: number;
  private maxLife: number;
  private active: boolean = true;

  constructor(config: ParticleConfig) {
    this.position = { ...config.position };
    this.velocity = { ...config.velocity };
    this.color = config.color;
    this.size = config.size;
    this.life = config.life;
    this.maxLife = config.life;
  }

  update(): void {
    this.position.x += this.velocity.vx;
    this.position.y += this.velocity.vy;
    this.life--;
    
    // 逐渐缩小
    this.size *= 0.95;
    
    if (this.life <= 0 || this.size < 0.5) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  isParticleActive(): boolean {
    return this.active;
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];

  // 爆炸效果（用于黄色敌人）
  createExplosion(position: { x: number; y: number }, color: string = '#ffff00'): void {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = randomRange(2, 5);
      this.particles.push(new Particle({
        position: { ...position },
        velocity: {
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed
        },
        color: color,
        size: randomRange(3, 6),
        life: 40
      }));
    }
  }

  // 闪烁效果（用于绿色敌人）
  createFlash(position: { x: number; y: number }, color: string = '#00ff00'): void {
    for (let i = 0; i < 8; i++) {
      this.particles.push(new Particle({
        position: {
          x: position.x + randomRange(-10, 10),
          y: position.y + randomRange(-10, 10)
        },
        velocity: {
          vx: randomRange(-0.5, 0.5),
          vy: randomRange(-0.5, 0.5)
        },
        color: color,
        size: randomRange(4, 8),
        life: 15
      }));
    }
  }

  // Boss 彩色粒子爆炸效果
  createBossExplosion(position: { x: number; y: number }): void {
    // 多层爆炸
    for (let layer = 0; layer < 3; layer++) {
      const particleCount = 30;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = randomRange(3 + layer * 2, 8 + layer * 2);
        this.particles.push(new Particle({
          position: { ...position },
          velocity: {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed
          },
          color: randomColor(),
          size: randomRange(5, 12),
          life: 50 + layer * 10
        }));
      }
    }
    
    // 中心闪光
    for (let i = 0; i < 15; i++) {
      this.particles.push(new Particle({
        position: {
          x: position.x + randomRange(-20, 20),
          y: position.y + randomRange(-20, 20)
        },
        velocity: {
          vx: randomRange(-2, 2),
          vy: randomRange(-2, 2)
        },
        color: '#ffffff',
        size: randomRange(6, 10),
        life: 30
      }));
    }
  }

  update(): void {
    this.particles.forEach(particle => particle.update());
    this.particles = this.particles.filter(particle => particle.isParticleActive());
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(particle => particle.draw(ctx));
  }

  clear(): void {
    this.particles = [];
  }
}