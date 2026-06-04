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
    const count = Math.floor((CONFIG.CANVAS_WIDTH * CONFIG.CANVAS_HEIGHT) / 3200);
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
      s.y += 0.2;
      if (s.y > CONFIG.CANVAS_HEIGHT) {
        s.y = 0;
        s.x = Math.random() * CONFIG.CANVAS_WIDTH;
      }
    });
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a0a';
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

    const s = CONFIG.PLAYER_SIZE; // 基础尺寸单位

    // === 引擎光晕（先画底层光） ===
    this._drawEngineGlow(ctx, s);

    // === 四片机翼 ===
    this._drawWings(ctx, s);

    // === 引擎喷口 ===
    this._drawEngineNozzles(ctx, s);

    // === 中央机身 ===
    this._drawFuselage(ctx, s);

    // === 驾驶舱 ===
    this._drawCockpit(ctx, s);

    // === 赛博朋克装饰线 ===
    this._drawCyberLines(ctx, s);

    ctx.restore();

    // 子弹
    player.bullets.forEach(b => this.drawBullet(b));
  }

  _drawEngineGlow(ctx, s) {
    // 四个引擎的霓虹光晕
    const enginePositions = [
      { x: -s * 1.05, y: -s * 0.75 },
      { x: s * 1.05, y: -s * 0.75 },
      { x: -s * 1.05, y: s * 0.75 },
      { x: s * 1.05, y: s * 0.75 },
    ];

    enginePositions.forEach(pos => {
      // 外层大光晕
      const glow = ctx.createRadialGradient(pos.x, pos.y, s * 0.08, pos.x, pos.y, s * 0.45);
      glow.addColorStop(0, 'rgba(200, 60, 255, 0.6)');
      glow.addColorStop(0.4, 'rgba(120, 30, 200, 0.25)');
      glow.addColorStop(1, 'rgba(60, 10, 120, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s * 0.45, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  _drawWings(ctx, s) {
    // 四片 X 型机翼，赛博朋克风格
    const wings = [
      // 左上翼
      { sx: 0, sy: -s * 0.25, ex: -s * 1.1, ey: -s * 0.9, color1: '#3a3a4a', color2: '#2a2a38' },
      // 右上翼
      { sx: 0, sy: -s * 0.25, ex: s * 1.1, ey: -s * 0.9, color1: '#3a3a4a', color2: '#2a2a38' },
      // 左下翼
      { sx: 0, sy: s * 0.25, ex: -s * 1.1, ey: s * 0.9, color1: '#3a3a4a', color2: '#2a2a38' },
      // 右下翼
      { sx: 0, sy: s * 0.25, ex: s * 1.1, ey: s * 0.9, color1: '#3a3a4a', color2: '#2a2a38' },
    ];

    wings.forEach(wing => {
      const dx = wing.ex - wing.sx;
      const dy = wing.ey - wing.sy;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = -dy / len;
      const ny = dx / len;
      const halfW = s * 0.22;

      ctx.beginPath();
      ctx.moveTo(wing.sx + nx * halfW * 0.3, wing.sy + ny * halfW * 0.3);
      ctx.lineTo(wing.ex + nx * halfW * 0.6, wing.ey + ny * halfW * 0.6);
      ctx.lineTo(wing.ex + nx * halfW * 0.15, wing.ey + ny * halfW * 0.15);
      ctx.lineTo(wing.ex - nx * halfW * 0.15, wing.ey - ny * halfW * 0.15);
      ctx.lineTo(wing.ex - nx * halfW * 0.6, wing.ey - ny * halfW * 0.6);
      ctx.lineTo(wing.sx - nx * halfW * 0.3, wing.sy - ny * halfW * 0.3);
      ctx.closePath();

      // 渐变填充
      const grad = ctx.createLinearGradient(wing.sx, wing.sy, wing.ex, wing.ey);
      grad.addColorStop(0, '#4a4a5e');
      grad.addColorStop(0.5, '#35354a');
      grad.addColorStop(1, '#252538');
      ctx.fillStyle = grad;
      ctx.fill();

      // 机翼边缘霓虹线
      ctx.strokeStyle = '#c040ff';
      ctx.lineWidth = 1;
      ctx.shadowColor = '#c040ff';
      ctx.shadowBlur = 4;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
  }

  _drawEngineNozzles(ctx, s) {
    const nozzles = [
      { x: -s * 1.05, y: -s * 0.75 },
      { x: s * 1.05, y: -s * 0.75 },
      { x: -s * 1.05, y: s * 0.75 },
      { x: s * 1.05, y: s * 0.75 },
    ];

    nozzles.forEach(pos => {
      // 引擎外壳
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s * 0.18, 0, Math.PI * 2);
      const shellGrad = ctx.createLinearGradient(pos.x - s * 0.18, pos.y, pos.x + s * 0.18, pos.y);
      shellGrad.addColorStop(0, '#555570');
      shellGrad.addColorStop(0.5, '#6a6a85');
      shellGrad.addColorStop(1, '#404058');
      ctx.fillStyle = shellGrad;
      ctx.fill();

      // 引擎内芯（发光）
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, s * 0.1, 0, Math.PI * 2);
      const coreGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, s * 0.1);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.3, '#e080ff');
      coreGrad.addColorStop(0.7, '#a030dd');
      coreGrad.addColorStop(1, '#6010a0');
      ctx.fillStyle = coreGrad;
      ctx.shadowColor = '#c040ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  _drawFuselage(ctx, s) {
    // 机身主体 - 拉长的六边形
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);           // 机头
    ctx.lineTo(s * 0.28, -s * 0.55);    // 右前
    ctx.lineTo(s * 0.35, -s * 0.15);    // 右中前
    ctx.lineTo(s * 0.35, s * 0.15);     // 右中后
    ctx.lineTo(s * 0.28, s * 0.55);     // 右后
    ctx.lineTo(0, s * 0.85);            // 机尾
    ctx.lineTo(-s * 0.28, s * 0.55);    // 左后
    ctx.lineTo(-s * 0.35, s * 0.15);    // 左中后
    ctx.lineTo(-s * 0.35, -s * 0.15);   // 左中前
    ctx.lineTo(-s * 0.28, -s * 0.55);   // 左前
    ctx.closePath();

    const bodyGrad = ctx.createLinearGradient(0, -s * 0.85, 0, s * 0.85);
    bodyGrad.addColorStop(0, '#5a5a72');
    bodyGrad.addColorStop(0.3, '#484860');
    bodyGrad.addColorStop(0.7, '#383850');
    bodyGrad.addColorStop(1, '#2e2e42');
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    // 机身轮廓霓虹线
    ctx.strokeStyle = '#b840ee';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = '#b840ee';
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 机头尖端高亮
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.85);
    ctx.lineTo(s * 0.12, -s * 0.62);
    ctx.lineTo(-s * 0.12, -s * 0.62);
    ctx.closePath();
    const noseGrad = ctx.createLinearGradient(0, -s * 0.85, 0, -s * 0.62);
    noseGrad.addColorStop(0, '#8888aa');
    noseGrad.addColorStop(1, '#5a5a72');
    ctx.fillStyle = noseGrad;
    ctx.fill();
  }

  _drawCockpit(ctx, s) {
    // 驾驶舱底座
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.15, s * 0.22, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#303048';
    ctx.fill();

    // 驾驶舱玻璃
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.18, s * 0.16, s * 0.25, 0, 0, Math.PI * 2);
    const glassGrad = ctx.createLinearGradient(0, -s * 0.43, 0, s * 0.07);
    glassGrad.addColorStop(0, '#80d0ff');
    glassGrad.addColorStop(0.3, '#40a0ee');
    glassGrad.addColorStop(0.7, '#2060cc');
    glassGrad.addColorStop(1, '#103080');
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // 玻璃高光
    ctx.beginPath();
    ctx.ellipse(-s * 0.04, -s * 0.28, s * 0.06, s * 0.1, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fill();

    // 玻璃边框霓虹
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.18, s * 0.16, s * 0.25, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#60d0ff';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#60d0ff';
    ctx.shadowBlur = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  _drawCyberLines(ctx, s) {
    // 机身上的赛博朋克装饰线条
    ctx.strokeStyle = '#d050ff';
    ctx.lineWidth = 0.8;
    ctx.shadowColor = '#d050ff';
    ctx.shadowBlur = 3;

    // 左侧面板线
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.5);
    ctx.lineTo(-s * 0.2, s * 0.45);
    ctx.stroke();

    // 右侧面板线
    ctx.beginPath();
    ctx.moveTo(s * 0.15, -s * 0.5);
    ctx.lineTo(s * 0.2, s * 0.45);
    ctx.stroke();

    // 横向装饰线 - 上
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, -s * 0.3);
    ctx.lineTo(s * 0.25, -s * 0.3);
    ctx.stroke();

    // 横向装饰线 - 下
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, s * 0.2);
    ctx.lineTo(s * 0.22, s * 0.2);
    ctx.stroke();

    ctx.shadowBlur = 0;

    // 小LED点
    const ledColor = '#ff60dd';
    [
      { x: -s * 0.28, y: -s * 0.45 },
      { x: s * 0.28, y: -s * 0.45 },
      { x: -s * 0.3, y: s * 0.1 },
      { x: s * 0.3, y: s * 0.1 },
      { x: 0, y: -s * 0.65 },
    ].forEach(led => {
      ctx.beginPath();
      ctx.arc(led.x, led.y, s * 0.04, 0, Math.PI * 2);
      ctx.fillStyle = ledColor;
      ctx.shadowColor = ledColor;
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
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
