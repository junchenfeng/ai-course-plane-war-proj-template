// 游戏主类

import { EnemyType, BulletOwner, LevelConfig } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, LEVELS, ENEMY_SPAWN_INTERVAL_MIN, ENEMY_SPAWN_INTERVAL_MAX, GREEN_ENEMY_HP } from './constants';
import { randomRange, circleCollision } from './utils';
import { StarField } from './Star';
import { Player } from './Player';
import { Enemy, DeathEffect } from './Enemy';
import { Bullet } from './Bullet';
import { ParticleSystem } from './Particle';
import { InputHandler } from './InputHandler';

type GameStatus = 'start' | 'playing' | 'level_transition' | 'game_over';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private starField: StarField;
  private player: Player;
  private enemies: Enemy[] = [];
  private particles: ParticleSystem;
  private inputHandler: InputHandler;

  private currentLevel: number = 0;
  private levelConfig: LevelConfig;
  private spawnedYellow: number = 0;
  private spawnedGreen: number = 0;
  private spawnedBoss: number = 0;
  private spawnTimer: number = 0;
  private spawnInterval: number = 0;

  private status: GameStatus = 'start';
  private lastTime: number = 0;
  private animationId: number = 0;

  // UI 元素
  private hpDisplay: HTMLElement | null;
  private levelDisplay: HTMLElement | null;
  private enemyCountDisplay: HTMLElement | null;
  private gameOverScreen: HTMLElement | null;
  private levelTransitionScreen: HTMLElement | null;
  private levelTitle: HTMLElement | null;
  private levelDesc: HTMLElement | null;
  private startScreen: HTMLElement | null;
  private restartBtn: HTMLElement | null;
  private startBtn: HTMLElement | null;
  private finalScore: HTMLElement | null;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.starField = new StarField(150);
    this.player = new Player();
    this.particles = new ParticleSystem();
    this.inputHandler = new InputHandler(this.canvas);

    this.levelConfig = LEVELS[0];

    // 获取 UI 元素
    this.hpDisplay = document.getElementById('hp-display');
    this.levelDisplay = document.getElementById('level-display');
    this.enemyCountDisplay = document.getElementById('enemy-count-display');
    this.gameOverScreen = document.getElementById('game-over');
    this.levelTransitionScreen = document.getElementById('level-transition');
    this.levelTitle = document.getElementById('level-title');
    this.levelDesc = document.getElementById('level-desc');
    this.startScreen = document.getElementById('start-screen');
    this.restartBtn = document.getElementById('restart-btn');
    this.startBtn = document.getElementById('start-btn');
    this.finalScore = document.getElementById('final-score');

    // 绑定按钮事件
    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => this.startGame());
    }
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.restartGame());
    }

    this.setupNextSpawn();
  }

  private setupNextSpawn(): void {
    this.spawnInterval = randomRange(ENEMY_SPAWN_INTERVAL_MIN, ENEMY_SPAWN_INTERVAL_MAX);
    this.spawnTimer = 0;
  }

  private startGame(): void {
    if (this.startScreen) {
      this.startScreen.classList.add('hidden');
    }
    this.status = 'playing';
    this.currentLevel = 0;
    this.initLevel(0);
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private restartGame(): void {
    if (this.gameOverScreen) {
      this.gameOverScreen.classList.add('hidden');
    }
    this.player.reset();
    this.enemies = [];
    this.particles.clear();
    this.currentLevel = 0;
    this.initLevel(0);
    this.status = 'playing';
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private initLevel(levelIndex: number): void {
    this.currentLevel = levelIndex;
    this.levelConfig = LEVELS[levelIndex];
    this.spawnedYellow = 0;
    this.spawnedGreen = 0;
    this.spawnedBoss = 0;
    this.enemies = [];
    this.particles.clear();
    this.setupNextSpawn();

    // 显示关卡过渡
    this.showLevelTransition(levelIndex + 1);
  }

  private showLevelTransition(level: number): void {
    this.status = 'level_transition';
    
    if (this.levelTitle) {
      this.levelTitle.textContent = `第 ${level} 关`;
    }
    if (this.levelDesc) {
      if (level === 1) {
        this.levelDesc.textContent = '10个黄色敌人，5个绿色敌人';
      } else {
        this.levelDesc.textContent = '5个黄色敌人，10个绿色敌人，1个BOSS';
      }
    }

    if (this.levelTransitionScreen) {
      this.levelTransitionScreen.classList.remove('hidden');
    }

    // 2秒后开始游戏
    setTimeout(() => {
      if (this.levelTransitionScreen) {
        this.levelTransitionScreen.classList.add('hidden');
      }
      this.status = 'playing';
      this.player.reset();
      this.lastTime = performance.now();
      this.gameLoop();
    }, 2000);
  }

  private gameLoop(): void {
    if (this.status !== 'playing') return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    // 更新星空
    this.starField.update();

    // 更新玩家
    const inputState = this.inputHandler.getState();
    this.player.update(inputState, deltaTime);

    // 敌人生成逻辑
    this.spawnTimer += deltaTime;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnEnemies();
      this.setupNextSpawn();
    }

    // 更新敌人
    this.enemies.forEach(enemy => enemy.update(this.player.getPosition(), deltaTime));

    // 粒子效果更新
    this.particles.update();

    // 碰撞检测
    this.checkCollisions();

    // 检查关卡完成
    this.checkLevelComplete();

    // 检查游戏结束
    if (!this.player.isPlayerActive()) {
      this.endGame();
    }

    // 更新 UI
    this.updateUI();
  }

  private spawnEnemies(): void {
    const config = this.levelConfig;
    const waveSize = config.enemiesPerWave;
    const enemiesToSpawn: EnemyType[] = [];

    // 确定可以生成哪些敌人
    const remainingYellow = config.yellowEnemies - this.spawnedYellow;
    const remainingGreen = config.greenEnemies - this.spawnedGreen;
    const allNormalEnemiesDone = remainingYellow === 0 && remainingGreen === 0;
    const remainingBoss = config.bossCount - this.spawnedBoss;

    // 随机选择敌人类型
    for (let i = 0; i < waveSize; i++) {
      if (allNormalEnemiesDone && remainingBoss > 0) {
        // 普通敌人全部出清后生成Boss
        enemiesToSpawn.push(EnemyType.RED_BOSS);
      } else {
        // 随机生成普通敌人
        const canSpawnYellow = remainingYellow > 0;
        const canSpawnGreen = remainingGreen > 0;

        if (canSpawnYellow && canSpawnGreen) {
          enemiesToSpawn.push(Math.random() < 0.5 ? EnemyType.YELLOW_CIRCLE : EnemyType.GREEN_ARROW);
        } else if (canSpawnYellow) {
          enemiesToSpawn.push(EnemyType.YELLOW_CIRCLE);
        } else if (canSpawnGreen) {
          enemiesToSpawn.push(EnemyType.GREEN_ARROW);
        }
      }
    }

    // 实际生成敌人
    enemiesToSpawn.forEach(type => {
      if (type === EnemyType.YELLOW_CIRCLE && this.spawnedYellow < config.yellowEnemies) {
        this.enemies.push(new Enemy(EnemyType.YELLOW_CIRCLE));
        this.spawnedYellow++;
      } else if (type === EnemyType.GREEN_ARROW && this.spawnedGreen < config.greenEnemies) {
        this.enemies.push(new Enemy(EnemyType.GREEN_ARROW));
        this.spawnedGreen++;
      } else if (type === EnemyType.RED_BOSS && this.spawnedBoss < config.bossCount) {
        this.enemies.push(new Enemy(EnemyType.RED_BOSS));
        this.spawnedBoss++;
      }
    });
  }

  private checkCollisions(): void {
    // 玩家子弹 vs 敌人
    const playerBullets = this.player.getBullets();
    playerBullets.forEach(bullet => {
      if (!bullet.isBulletActive()) return;
      
      this.enemies.forEach(enemy => {
        if (!enemy.isEnemyActive() || !enemy.isAlive()) return;
        
        if (circleCollision(
          bullet.getPosition(),
          bullet.getSize(),
          enemy.getPosition(),
          enemy.getSize()
        )) {
          const deathEffect = enemy.takeDamage(1);
          bullet.deactivate();
          
          if (deathEffect) {
            this.createDeathEffect(deathEffect, enemy.getDeathPosition());
          }
        }
      });
    });

    // 敌人子弹 vs 玩家
    this.enemies.forEach(enemy => {
      enemy.getBullets().forEach(bullet => {
        if (!bullet.isBulletActive()) return;
        
        if (circleCollision(
          bullet.getPosition(),
          bullet.getSize(),
          this.player.getPosition(),
          this.player.getSize()
        )) {
          this.player.takeDamage(1);
          bullet.deactivate();
        }
      });
    });

    // 绿色敌人（碰撞）vs 玩家
    this.enemies.forEach(enemy => {
      if (!enemy.isEnemyActive() || enemy.getType() !== EnemyType.GREEN_ARROW) return;
      
      if (circleCollision(
        enemy.getPosition(),
        enemy.getSize(),
        this.player.getPosition(),
        this.player.getSize()
      )) {
        this.player.takeDamage(2);
        const deathEffect = enemy.takeDamage(GREEN_ENEMY_HP);
        if (deathEffect) {
          this.createDeathEffect(deathEffect, enemy.getDeathPosition());
        }
      }
    });

    // 清理不活跃的敌人
    this.enemies = this.enemies.filter(enemy => enemy.isEnemyActive());
  }

  private createDeathEffect(effect: DeathEffect, position: { x: number; y: number }): void {
    switch (effect) {
      case DeathEffect.EXPLOSION:
        this.particles.createExplosion(position, '#ffff00');
        break;
      case DeathEffect.FLASH:
        this.particles.createFlash(position, '#44ff44');
        break;
      case DeathEffect.BOSS_EXPLOSION:
        this.particles.createBossExplosion(position);
        break;
    }
  }

  private checkLevelComplete(): void {
    const config = this.levelConfig;
    const remainingEnemies = this.enemies.filter(e => e.isAlive()).length;
    const allSpawned = 
      this.spawnedYellow >= config.yellowEnemies &&
      this.spawnedGreen >= config.greenEnemies &&
      this.spawnedBoss >= config.bossCount;

    if (remainingEnemies === 0 && allSpawned) {
      // 关卡完成
      this.currentLevel++;
      
      if (this.currentLevel < LEVELS.length) {
        // 进入下一关
        cancelAnimationFrame(this.animationId);
        this.initLevel(this.currentLevel);
      } else {
        // 游戏通关（简单处理为结束游戏）
        this.endGame(true);
      }
    }
  }

  private updateUI(): void {
    // HP 显示（♥️）
    if (this.hpDisplay) {
      const hp = this.player.getHp();
      const hearts = '♥'.repeat(hp) + '♡'.repeat(this.player.getMaxHp() - hp);
      this.hpDisplay.textContent = hearts;
    }

    // 关卡显示
    if (this.levelDisplay) {
      this.levelDisplay.textContent = `第 ${this.currentLevel + 1} 关`;
    }

    // 敌人计数显示
    if (this.enemyCountDisplay) {
      const config = this.levelConfig;
      const remainingYellow = config.yellowEnemies - this.spawnedYellow;
      const remainingGreen = config.greenEnemies - this.spawnedGreen;
      const remainingBoss = config.bossCount - this.spawnedBoss;
      const activeEnemies = this.enemies.filter(e => e.isAlive()).length;
      
      let text = `剩余敌人: ${activeEnemies}`;
      if (remainingBoss > 0) {
        text += ` (Boss: ${remainingBoss})`;
      }
      this.enemyCountDisplay.textContent = text;
    }
  }

  private endGame(win: boolean = false): void {
    this.status = 'game_over';
    cancelAnimationFrame(this.animationId);

    if (this.finalScore) {
      if (win) {
        this.finalScore.textContent = '恭喜通关！你完成了所有关卡！';
      } else {
        this.finalScore.textContent = `到达第 ${this.currentLevel + 1} 关`;
      }
    }

    if (this.gameOverScreen) {
      const gameOverTitle = this.gameOverScreen.querySelector('h1');
      if (gameOverTitle) {
        gameOverTitle.textContent = win ? '通关成功' : '游戏结束';
      }
      this.gameOverScreen.classList.remove('hidden');
    }
  }

  private draw(): void {
    // 清空画布
    this.ctx.fillStyle = '#0a0a0a';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 绘制星空背景
    this.starField.draw(this.ctx);

    // 绘制敌人
    this.enemies.forEach(enemy => enemy.draw(this.ctx));

    // 绘制粒子效果
    this.particles.draw(this.ctx);

    // 绘制玩家
    this.player.draw(this.ctx);
  }
}