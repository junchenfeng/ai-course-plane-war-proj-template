// 星空背景效果

import { StarConfig } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { randomRange } from './utils';

export class Star {
  private position: { x: number; y: number };
  private size: number;
  private brightness: number;
  private twinkleSpeed: number;
  private twinklePhase: number = 0;

  constructor(config: StarConfig) {
    this.position = config.position;
    this.size = config.size;
    this.brightness = config.brightness;
    this.twinkleSpeed = config.twinkleSpeed;
  }

  update(): void {
    this.twinklePhase += this.twinkleSpeed;
    // 星星缓慢向下移动，创造流动感
    this.position.y += 0.2;
    if (this.position.y > CANVAS_HEIGHT) {
      this.position.y = 0;
      this.position.x = randomRange(0, CANVAS_WIDTH);
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const twinkle = Math.sin(this.twinklePhase) * 0.3 + 0.7;
    const alpha = this.brightness * twinkle;
    
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fill();
    
    // 添加光晕效果
    if (this.size > 1.5) {
      ctx.beginPath();
      ctx.arc(this.position.x, this.position.y, this.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.3})`;
      ctx.fill();
    }
  }
}

export class StarField {
  private stars: Star[] = [];

  constructor(count: number = 150) {
    for (let i = 0; i < count; i++) {
      const isLargeStar = Math.random() < 0.1;
      this.stars.push(new Star({
        position: {
          x: randomRange(0, CANVAS_WIDTH),
          y: randomRange(0, CANVAS_HEIGHT)
        },
        size: isLargeStar ? randomRange(1.5, 2.5) : randomRange(0.5, 1.5),
        brightness: isLargeStar ? randomRange(0.8, 1) : randomRange(0.3, 0.7),
        twinkleSpeed: randomRange(0.02, 0.08)
      }));
    }
  }

  update(): void {
    this.stars.forEach(star => star.update());
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.stars.forEach(star => star.draw(ctx));
  }
}