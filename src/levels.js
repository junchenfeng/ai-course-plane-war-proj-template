// 关卡系统模块
import { CONFIG, EnemyType } from './config.js';
import { Enemy } from './enemies.js';
import { Boss } from './boss.js';
import { randomRange } from './utils.js';

export class LevelManager {
  constructor() {
    this.currentLevel = 1;
    this.enemiesToSpawn = [];
    this.spawnTimer = 0;
    this.spawnedCount = 0;
    this.totalEnemies = 0;
    this.bossSpawned = false;
    this.boss = null;
    this.levelComplete = false;
  }

  initLevel(level) {
    this.currentLevel = level;
    this.enemiesToSpawn = [];
    this.spawnTimer = 0;
    this.spawnedCount = 0;
    this.bossSpawned = false;
    this.boss = null;
    this.levelComplete = false;

    if (level === 1) {
      // 10黄 + 5绿
      for (let i = 0; i < 10; i++) this.enemiesToSpawn.push(EnemyType.YELLOW_CIRCLE);
      for (let i = 0; i < 5; i++) this.enemiesToSpawn.push(EnemyType.GREEN_ARROW);
    } else if (level === 2) {
      // 5黄 + 10绿 + 1boss
      for (let i = 0; i < 5; i++) this.enemiesToSpawn.push(EnemyType.YELLOW_CIRCLE);
      for (let i = 0; i < 10; i++) this.enemiesToSpawn.push(EnemyType.GREEN_ARROW);
    }

    // 随机打乱
    for (let i = this.enemiesToSpawn.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.enemiesToSpawn[i], this.enemiesToSpawn[j]] = [this.enemiesToSpawn[j], this.enemiesToSpawn[i]];
    }

    this.totalEnemies = this.enemiesToSpawn.length + (level === 2 ? 1 : 0);
  }

  update(deltaTime, enemies) {
    if (this.levelComplete) return;

    // 生成普通敌人
    if (this.enemiesToSpawn.length > 0) {
      this.spawnTimer -= deltaTime;
      if (this.spawnTimer <= 0) {
        const spawnCount = this.currentLevel === 1 ? 1 : 2;
        for (let i = 0; i < spawnCount && this.enemiesToSpawn.length > 0; i++) {
          const type = this.enemiesToSpawn.shift();
          enemies.push(new Enemy(type));
          this.spawnedCount++;
        }
        this.spawnTimer = randomRange(CONFIG.ENEMY_SPAWN_INTERVAL_MIN, CONFIG.ENEMY_SPAWN_INTERVAL_MAX);
      }
    }

    // 第二关：普通敌人出清后出boss
    if (this.currentLevel === 2 && this.enemiesToSpawn.length === 0 && !this.bossSpawned) {
      const aliveEnemies = enemies.filter(e => e.active && e.isAlive());
      if (aliveEnemies.length === 0) {
        this.boss = new Boss();
        this.bossSpawned = true;
        this.spawnedCount++;
      }
    }
  }

  getActiveEnemyCount(enemies) {
    return enemies.filter(e => e.active && e.isAlive()).length;
  }

  checkLevelComplete(enemies) {
    if (this.levelComplete) return false;
    if (this.enemiesToSpawn.length > 0) return false;

    const aliveEnemies = enemies.filter(e => e.active && e.isAlive());
    if (aliveEnemies.length > 0) return false;

    if (this.currentLevel === 2 && this.boss && this.boss.active && this.boss.isAlive()) return false;

    this.levelComplete = true;
    return true;
  }
}
