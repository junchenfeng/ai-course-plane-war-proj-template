// 游戏主循环模块
import { CONFIG, EnemyType } from './config.js';
import { Player } from './player.js';
import { Enemy } from './enemies.js';
import { Boss } from './boss.js';
import { ParticleSystem } from './particles.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { UI } from './ui.js';
import { LevelManager } from './levels.js';
import { checkCollisions } from './collision.js';

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
    this.bosses = [];
    this.score = 0;
    this.gameState = 'start'; // start, playing, gameover, win
    this.lastTime = 0;

    this._bindButtons();
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

  startGame() {
    this.player.reset();
    this.enemies = [];
    this.bosses = [];
    this.particles.clear();
    this.score = 0;
    this.gameState = 'playing';
    this.levelManager.initLevel(1);
    this.ui.hideAllScreens();
    this.ui.updateLevel(1);
    this.ui.updateHp(this.player.hp);
    this.ui.hideBossHp();
  }

  _loop(timestamp) {
    const deltaTime = this.lastTime ? timestamp - this.lastTime : 16;
    this.lastTime = timestamp;

    if (this.gameState === 'playing') {
      this._update(deltaTime);
    }

    this._render();
    requestAnimationFrame((t) => this._loop(t));
  }

  _update(deltaTime) {
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
    checkCollisions(this.player, this.enemies, allBosses, this.particles);

    // 更新 UI
    this.ui.updateHp(this.player.hp);
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
        this.levelManager.initLevel(2);
        this.ui.updateLevel(2);
        this.player.reset();
        this.player.hp = CONFIG.PLAYER_HP;
        this.enemies = [];
        this.particles.clear();
      } else if (this.levelManager.currentLevel === 2) {
        this.gameState = 'win';
        this.ui.showWinScreen(this.score);
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
    }
  }
}
