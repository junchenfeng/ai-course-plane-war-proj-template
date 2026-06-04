// 游戏主循环模块
import { CONFIG } from './config.js';
import { Player } from './player.js';
import { Enemy } from './enemies.js';
import { Boss } from './boss.js';
import { ParticleSystem } from './particles.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';
import { LevelManager } from './levels.js';
import { checkCollisions } from './collision.js';
import { PowerUpType } from './config.js';
import { checkPowerUpCollisions, activatePowerUp } from './powerups.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new Renderer(canvas);
    this.input = new InputHandler(canvas);
    this.ui = new UI();
    this.particles = new ParticleSystem();
    this.levelManager = new LevelManager();

    this.player = new Player();
    this.enemies = [];
    this.powerups = [];
    this.score = 0;
    this.killCount = 0;
    this.gameState = 'start'; // start, playing, transitioning, gameover, win
    this.lastTime = 0;

    // 关卡过渡动画
    this.transitionPhase = 0; // 0=无, 1=飞向中间, 2=飞出屏幕, 3=黑屏等待
    this.transitionTimer = 0;
    this.transitionTargetLevel = 0;
    this.transitionPlayerStartX = 0;
    this.transitionPlayerStartY = 0;

    this._bindButtons();
    this._bindPowerupClick();
    this.ui.showStartScreen();
    this._loop(0);
  }

  _bindButtons() {
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const winRestartBtn = document.getElementById('win-restart-btn');

    if (startBtn) startBtn.addEventListener('click', () => this.startGame());
    if (restartBtn) restartBtn.addEventListener('click', () => this.startGame());
    if (winRestartBtn) winRestartBtn.addEventListener('click', () => this.startGame());
  }

  _bindPowerupClick() {
    // 移动端点击道具图标触发背包中的道具
    const spreadEl = document.getElementById('spread-indicator');
    if (spreadEl) {
      spreadEl.addEventListener('click', () => {
        if (this.gameState === 'playing') {
          // 按优先级激活背包中的道具
          activatePowerUp(this.player, PowerUpType.SPREAD) ||
          activatePowerUp(this.player, PowerUpType.SPEED) ||
          activatePowerUp(this.player, PowerUpType.BOMB) ||
          activatePowerUp(this.player, PowerUpType.MAGNET);
        }
      });
      spreadEl.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (this.gameState === 'playing') {
          activatePowerUp(this.player, PowerUpType.SPREAD) ||
          activatePowerUp(this.player, PowerUpType.SPEED) ||
          activatePowerUp(this.player, PowerUpType.BOMB) ||
          activatePowerUp(this.player, PowerUpType.MAGNET);
        }
      });
    }
  }

  startGame() {
    this.player.reset();
    this.enemies = [];
    this.powerups = [];
    this.particles.clear();
    this.score = 0;
    this.killCount = 0;
    this.gameState = 'playing';
    this.transitionPhase = 0;
    this.levelManager.initLevel(1);
    this.ui.hideAllScreens();
    this.ui.updateLevel(1);
    this.ui.updateHp(this.player.hp);
    this.ui.updateScore(0);
    this.ui.hideBossHp();
  }

  _loop(timestamp) {
    const deltaTime = this.lastTime ? timestamp - this.lastTime : 16;
    this.lastTime = timestamp;

    if (this.gameState === 'playing') {
      this._update(deltaTime);
    } else if (this.gameState === 'transitioning') {
      this._updateTransition(deltaTime);
    }

    this._render();
    requestAnimationFrame((t) => this._loop(t));
  }

  _update(deltaTime) {
    // 道具触发（键盘1-4）
    if (this.input.consumeSpreadTrigger()) {
      activatePowerUp(this.player, PowerUpType.SPREAD) ||
      activatePowerUp(this.player, PowerUpType.SPEED) ||
      activatePowerUp(this.player, PowerUpType.BOMB) ||
      activatePowerUp(this.player, PowerUpType.MAGNET);
    }

    // 更新星空
    this.renderer.updateStars();

    // 更新关卡
    this.levelManager.update(deltaTime, this.enemies);

    // 更新玩家
    this.player.update(this.input, deltaTime);

    // 更新敌人
    this.enemies.forEach(e => e.update(this.player, deltaTime));
    this.enemies = this.enemies.filter(e => e.active);

    // 更新 Boss
    if (this.levelManager.boss && this.levelManager.boss.active) {
      this.levelManager.boss.update(this.player, deltaTime);
      if (!this.levelManager.boss.active) {
        this.levelManager.boss = null;
      }
    }

    // 更新粒子
    this.particles.update();

    // 碰撞检测
    const allBosses = this.levelManager.boss ? [this.levelManager.boss] : [];
    const { score: scoreDelta, kills } = checkCollisions(this.player, this.enemies, allBosses, this.particles, this.powerups);
    this.score += scoreDelta;
    this.killCount += kills;

    // 更新道具
    this.powerups.forEach(p => p.update());
    this.powerups = this.powerups.filter(p => p.active);
    checkPowerUpCollisions(this.player, this.powerups);

    // 炸弹清屏（清除所有敌人子弹）
    if (this.player.bombRequested) {
      this.player.bombRequested = false;
      this.enemies.forEach(e => { e.bullets = []; });
      if (this.levelManager.boss && this.levelManager.boss.active) {
        this.levelManager.boss.bullets = [];
      }
      // 炸弹粒子特效
      this.particles.createExplosion(CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2, '#ff4444', 60);
      this.score += 50; // 炸弹奖励分
    }

    // 更新 UI
    this.ui.updateHp(this.player.hp);
    this.ui.updateScore(this.score);
    this.ui.updateSpreadIndicator(this.player.spreadActive, this.player.hasSpreadPowerup);
    this.ui.updateEnemyCount(
      this.levelManager.spawnedCount,
      this.levelManager.totalEnemies
    );

    // Boss HP
    if (this.levelManager.boss && this.levelManager.boss.active) {
      this.ui.showBossHp(this.levelManager.boss);
    } else {
      this.ui.hideBossHp();
    }

    // 游戏结束
    if (!this.player.active) {
      this.gameState = 'gameover';
      this.ui.showGameOver(this.score);
      return;
    }

    // 关卡完成
    if (this.levelManager.checkLevelComplete(this.enemies)) {
      if (this.levelManager.currentLevel === 1) {
        // 开始过渡动画
        this._startTransition(2);
      } else if (this.levelManager.currentLevel === 2) {
        this.gameState = 'win';
        this.ui.showWinScreen(this.score, this.killCount);
      }
    }
  }

  _startTransition(nextLevel) {
    this.gameState = 'transitioning';
    this.transitionPhase = 1;
    this.transitionTimer = 0;
    this.transitionTargetLevel = nextLevel;
    this.transitionPlayerStartX = this.player.x;
    this.transitionPlayerStartY = this.player.y;
  }

  _updateTransition(deltaTime) {
    this.transitionTimer += deltaTime;

    if (this.transitionPhase === 1) {
      // 飞向屏幕中间
      const centerX = CONFIG.CANVAS_WIDTH / 2;
      const centerY = CONFIG.CANVAS_HEIGHT / 2;
      const t = Math.min(this.transitionTimer / CONFIG.TRANSITION_FADE_IN, 1);
      this.player.x = this.transitionPlayerStartX + (centerX - this.transitionPlayerStartX) * t;
      this.player.y = this.transitionPlayerStartY + (centerY - this.transitionPlayerStartY) * t;

      if (t >= 1) {
        this.transitionPhase = 2;
        this.transitionTimer = 0;
      }
    } else if (this.transitionPhase === 2) {
      // 向上飞出屏幕
      const t = Math.min(this.transitionTimer / CONFIG.TRANSITION_DISPLAY, 1);
      this.player.y = CONFIG.CANVAS_HEIGHT / 2 - t * (CONFIG.CANVAS_HEIGHT / 2 + 100);

      if (t >= 1) {
        this.transitionPhase = 3;
        this.transitionTimer = 0;
      }
    } else if (this.transitionPhase === 3) {
      // 黑屏等待，显示下一关提示
      if (this.transitionTimer > CONFIG.TRANSITION_FADE_OUT) {
        // 进入下一关
        this.gameState = 'playing';
        this.transitionPhase = 0;
        this.levelManager.initLevel(this.transitionTargetLevel);
        this.ui.updateLevel(this.transitionTargetLevel);
        this.player.reset();
        this.player.hp = CONFIG.PLAYER_HP;
        this.enemies = [];
        this.powerups = [];
        this.particles.clear();
        this.ui.hideTransitionScreen();
      }
    }
  }

  _render() {
    this.renderer.draw();

    if (this.gameState === 'playing') {
      this.renderer.drawPlayer(this.player);
      this.enemies.forEach(e => this.renderer.drawEnemy(e));
      if (this.levelManager.boss && this.levelManager.boss.active) {
        this.renderer.drawBoss(this.levelManager.boss);
      }
      this.renderer.drawParticles(this.particles.particles);
      this.powerups.forEach(p => this.renderer.drawPowerUp(p));
    } else if (this.gameState === 'transitioning') {
      // 过渡动画中绘制玩家
      this.renderer.drawPlayer(this.player);
      this.renderer.drawParticles(this.particles.particles);

      // 黑屏遮罩
      if (this.transitionPhase >= 3) {
        const ctx = this.renderer.ctx;
        ctx.fillStyle = `rgba(0, 0, 0, ${CONFIG.TRANSITION_OVERLAY_ALPHA})`;
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

        const levelNames = CONFIG.LEVEL_NAMES;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`下一关：${levelNames[this.transitionTargetLevel]}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
        ctx.textAlign = 'start';
      }
    }
  }
}
