// 渲染模块
import { CONFIG, EnemyType, BulletOwner, PowerUpType, POWERUP_CONFIGS } from './config.js';
import { ENEMY_REGISTRY } from './enemies/index.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.playerTexture = null; // 玩家贴图（去背景后的 canvas）
    this.initStars();
  }

  resize() {
    this.stars = [];
    this.initStars();
  }

  /**
   * 设置玩家贴图
   * @param {HTMLCanvasElement} texture - 去背景后的 canvas
   */
  setPlayerTexture(texture) {
    this.playerTexture = texture;
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

    // 如果有贴图，使用图片绘制
    if (this.playerTexture) {
      const size = CONFIG.PLAYER_SIZE;
      const textureWidth = this.playerTexture.width;
      const textureHeight = this.playerTexture.height;
      // 缩放贴图以适应玩家大小，保持原始宽高比
      const scale = (size * 2) / Math.max(textureWidth, textureHeight);
      const drawWidth = textureWidth * scale;
      const drawHeight = textureHeight * scale;
      // 居中绘制，图片顶部指向玩家前方
      ctx.drawImage(
        this.playerTexture,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
    } else {
      // 无贴图时使用原有的三角形绘制
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
    }

    ctx.restore();

    // 子弹
    player.bullets.forEach(b => this.drawBullet(b));
  }

  /**
   * 通用敌人渲染（数据驱动）
   * 从 ENEMY_REGISTRY 读取 onRender 函数
   */
  drawEnemy(enemy) {
    const ctx = this.ctx;
    if (!enemy.active) return;

    const entry = ENEMY_REGISTRY.get(enemy.type);
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (entry && typeof entry.onRender === 'function') {
      entry.onRender(ctx, enemy);
    } else {
      // 兜底：黄色圆
      ctx.beginPath();
      ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
      ctx.fillStyle = enemy.color ?? '#ffff00';
      ctx.fill();
    }

    ctx.restore();
    this.drawHpBar(enemy);
    enemy.bullets.forEach(b => this.drawBullet(b));
  }

  /**
   * BOSS 渲染 — 现在复用 drawEnemy（BOSS 也是敌人一种）
   * 保留此方法仅为向后兼容，内部委托 drawEnemy
   */
  drawBoss(boss) {
    this.drawEnemy(boss);
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
    const cfg = powerup.cfg;
    ctx.save();
    ctx.translate(powerup.x, powerup.y);

    // 外发光
    ctx.beginPath();
    ctx.arc(0, 0, powerup.size + 4, 0, Math.PI * 2);
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = cfg.color;
    ctx.fill();
    ctx.globalAlpha = 1;

    // 主体菱形
    ctx.beginPath();
    ctx.moveTo(0, -powerup.size);
    ctx.lineTo(powerup.size, 0);
    ctx.lineTo(0, powerup.size);
    ctx.lineTo(-powerup.size, 0);
    ctx.closePath();
    ctx.fillStyle = cfg.color;
    ctx.shadowColor = cfg.color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 内部标识字母
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${powerup.size * 1.1}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cfg.label || '?', 0, 1);

    ctx.restore();
  }
}
