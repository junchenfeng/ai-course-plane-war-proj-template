// 渲染模块
import { CONFIG, EnemyType, BulletOwner } from './config.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.initStars();
  }

  resize() {
    this.stars = [];
    this.initStars();
  }

  initStars() {
    const count = Math.floor((CONFIG.CANVAS_WIDTH * CONFIG.CANVAS_HEIGHT) / CONFIG.STAR_COUNT_DIVISOR);
    for (let i = 0; i < count; i++) {
      const isLarge = Math.random() < 0.1;
      this.stars.push({
        x: Math.random() * CONFIG.CANVAS_WIDTH,
        y: Math.random() * CONFIG.CANVAS_HEIGHT,
        size: isLarge ? Math.random() * 1 + 1.5 : Math.random() * 1 + 0.5,
        brightness: isLarge ? Math.random() * 0.2 + 0.8 : Math.random() * 0.4 + 0.3,
        twinkleSpeed: Math.random() * 0.06 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  updateStars() {
    this.stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      s.y += CONFIG.STAR_SPEED;
      if (s.y > CONFIG.CANVAS_HEIGHT) {
        s.y = 0;
        s.x = Math.random() * CONFIG.CANVAS_WIDTH;
      }
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = CONFIG.BG_COLOR;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    this.drawStars();
  }

  drawStars() {
    const ctx = this.ctx;
    this.stars.forEach(s => {
      const twinkle = Math.sin(s.twinklePhase) * 0.3 + 0.7;
      const alpha = s.brightness * twinkle;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
      if (s.size > 1.5) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha * 0.3})`;
        ctx.fill();
      }
    });
  }

  drawPlayer(player) {
    const ctx = this.ctx;
    if (!player.active) return;

    ctx.save();
    if (player.isInvincible()) ctx.globalAlpha = 0.5;
    ctx.translate(player.x, player.y);

    // 主体三角形
    ctx.beginPath();
    ctx.moveTo(0, -CONFIG.PLAYER_SIZE);
    ctx.lineTo(-CONFIG.PLAYER_SIZE * 0.8, CONFIG.PLAYER_SIZE * 0.5);
    ctx.lineTo(CONFIG.PLAYER_SIZE * 0.8, CONFIG.PLAYER_SIZE * 0.5);
    ctx.closePath();
    ctx.fillStyle = CONFIG.PLAYER_COLOR;
    ctx.shadowColor = CONFIG.PLAYER_COLOR;
    ctx.shadowBlur = 15;
    ctx.fill();

    // 内部装饰
    ctx.beginPath();
    ctx.moveTo(0, -CONFIG.PLAYER_SIZE * 0.6);
    ctx.lineTo(-CONFIG.PLAYER_SIZE * 0.4, CONFIG.PLAYER_SIZE * 0.3);
    ctx.lineTo(CONFIG.PLAYER_SIZE * 0.4, CONFIG.PLAYER_SIZE * 0.3);
    ctx.closePath();
    ctx.fillStyle = CONFIG.PLAYER_COLOR_LIGHT;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();

    // 子弹
    player.bullets.forEach(b => this.drawBullet(b));
  }

  drawEnemy(enemy) {
    const ctx = this.ctx;
    if (!enemy.active) return;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (enemy.isDying) {
      if (enemy.type === EnemyType.GREEN_ARROW && enemy.flashTimer > 25) {
        ctx.globalAlpha = 0.3;
      }
    }

    if (enemy.type === EnemyType.YELLOW_CIRCLE) {
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ffcc00';
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffdd44';
      ctx.fill();
      ctx.shadowBlur = 0;
      this.drawHpBar(enemy);
    } else if (enemy.type === EnemyType.GREEN_ARROW) {
      ctx.beginPath();
      ctx.moveTo(0, enemy.size);
      ctx.lineTo(-enemy.size * 0.6, -enemy.size * 0.3);
      ctx.lineTo(0, -enemy.size * 0.6);
      ctx.lineTo(enemy.size * 0.6, -enemy.size * 0.3);
      ctx.closePath();
      ctx.fillStyle = '#44ff44';
      ctx.shadowColor = '#44ff44';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    enemy.bullets.forEach(b => this.drawBullet(b));
  }

  drawBoss(boss) {
    const ctx = this.ctx;
    if (!boss.active) return;

    ctx.save();
    ctx.translate(boss.x, boss.y);

    if (boss.isDying) {
      ctx.scale(boss.scaleAnimation, boss.scaleAnimation);
    }

    const sides = 6;
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = Math.cos(angle) * boss.size;
      const y = Math.sin(angle) * boss.size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 20;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
      const x = Math.cos(angle) * boss.size * 0.6;
      const y = Math.sin(angle) * boss.size * 0.6;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#ff6666';
    ctx.fill();
    ctx.shadowBlur = 0;

    this.drawHpBar(boss);

    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', 0, -boss.size - 15);

    ctx.restore();

    boss.bullets.forEach(b => this.drawBullet(b));
  }

  drawHpBar(entity) {
    const ctx = this.ctx;
    const barWidth = entity.size * 1.5;
    const barHeight = 4;
    const y = entity.size + 10;
    ctx.fillStyle = '#333333';
    ctx.fillRect(-barWidth / 2, y, barWidth, barHeight);
    const ratio = entity.hp / entity.maxHp;
    ctx.fillStyle = ratio > 0.5 ? '#44ff44' : ratio > 0.25 ? '#ffcc44' : '#ff4444';
    ctx.fillRect(-barWidth / 2, y, barWidth * ratio, barHeight);
  }

  drawBullet(bullet) {
    const ctx = this.ctx;
    if (!bullet.active) return;
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.size, 0, Math.PI * 2);
    if (bullet.owner === BulletOwner.PLAYER) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
    } else if (bullet.owner === BulletOwner.ENEMY_TRACKING) {
      ctx.fillStyle = '#ff8844';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = bullet.color;
      ctx.shadowColor = bullet.color;
      ctx.shadowBlur = 5;
    }
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawParticles(particles) {
    const ctx = this.ctx;
    particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  drawPowerUp(powerup) {
    const ctx = this.ctx;
    if (!powerup.active) return;
    ctx.save();
    ctx.translate(powerup.x, powerup.y);

    // 外发光
    ctx.beginPath();
    ctx.arc(0, 0, powerup.size + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(68, 136, 255, 0.2)';
    ctx.fill();

    // 主体菱形
    ctx.beginPath();
    ctx.moveTo(0, -powerup.size);
    ctx.lineTo(powerup.size, 0);
    ctx.lineTo(0, powerup.size);
    ctx.lineTo(-powerup.size, 0);
    ctx.closePath();
    ctx.fillStyle = '#4488ff';
    ctx.shadowColor = '#4488ff';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 内部 S 标识
    ctx.fillStyle = '#ffffff';
    ctx.font = `${powerup.size * 1.2}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', 0, 1);

    ctx.restore();
  }
}
