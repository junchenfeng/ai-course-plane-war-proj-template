// 粒子效果模块
import { CONFIG } from './config.js';
import { randomRange, randomColor } from './utils.js';

class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.active = true;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.size *= 0.95;
    if (this.life <= 0 || this.size < 0.5) this.active = false;
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  createExplosion(x, y, color = '#ffff00', count = CONFIG.PARTICLE_EXPLOSION_COUNT) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = randomRange(2, 5);
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color, randomRange(3, 6), 40
      ));
    }
  }

  createFlash(x, y, color = '#44ff44') {
    for (let i = 0; i < 8; i++) {
      this.particles.push(new Particle(
        x + randomRange(-10, 10), y + randomRange(-10, 10),
        randomRange(-0.5, 0.5), randomRange(-0.5, 0.5),
        color, randomRange(4, 8), 15
      ));
    }
  }

  createBossExplosion(x, y) {
    for (let layer = 0; layer < 3; layer++) {
      const count = 30;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = randomRange(3 + layer * 2, 8 + layer * 2);
        this.particles.push(new Particle(
          x, y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
          randomColor(), randomRange(5, 12), 50 + layer * 10
        ));
      }
    }
    for (let i = 0; i < 15; i++) {
      this.particles.push(new Particle(
        x + randomRange(-20, 20), y + randomRange(-20, 20),
        randomRange(-2, 2), randomRange(-2, 2),
        '#ffffff', randomRange(6, 10), 30
      ));
    }
  }

  update() {
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => p.active);
  }

  clear() {
    this.particles = [];
  }
}
