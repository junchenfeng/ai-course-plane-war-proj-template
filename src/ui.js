// UI 模块
import { CONFIG } from './config.js';

export class UI {
  constructor() {
    this.hpContainer = document.getElementById('hp-container');
    this.levelDisplay = document.getElementById('level-display');
    this.enemyCount = document.getElementById('enemy-count');
    this.bossHpContainer = document.getElementById('boss-hp-container');
    this.bossHpBar = document.getElementById('boss-hp-bar');
    this.startScreen = document.getElementById('start-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.winScreen = document.getElementById('win-screen');
    this.finalScore = document.getElementById('final-score');
    this.winScore = document.getElementById('win-score');
  }

  updateHp(hp) {
    if (!this.hpContainer) return;
    let html = '';
    for (let i = 0; i < CONFIG.PLAYER_HP; i++) {
      html += i < hp ? '♥' : '♡';
    }
    this.hpContainer.textContent = html;
  }

  updateScore(score) {
    const el = document.getElementById('score-display');
    if (el) el.textContent = `得分：${score}`;
  }

  updateLevel(level) {
    if (!this.levelDisplay) return;
    const names = { 1: '测试关', 2: 'boss来了' };
    this.levelDisplay.textContent = `第${level}关：${names[level] || ''}`;
  }

  updateEnemyCount(current, total) {
    if (!this.enemyCount) return;
    this.enemyCount.textContent = `敌人：${current}/${total}`;
  }

  showBossHp(boss) {
    if (!this.bossHpContainer || !this.bossHpBar) return;
    this.bossHpContainer.style.display = 'block';
    const ratio = boss.hp / boss.maxHp;
    this.bossHpBar.style.width = `${ratio * 100}%`;
  }

  hideBossHp() {
    if (!this.bossHpContainer) return;
    this.bossHpContainer.style.display = 'none';
  }

  showStartScreen() {
    if (this.startScreen) this.startScreen.style.display = 'flex';
    if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
    if (this.winScreen) this.winScreen.style.display = 'none';
  }

  hideStartScreen() {
    if (this.startScreen) this.startScreen.style.display = 'none';
  }

  showGameOver(score) {
    if (this.gameOverScreen) {
      this.gameOverScreen.style.display = 'flex';
      if (this.finalScore) this.finalScore.textContent = score;
    }
  }

  showWinScreen(score) {
    if (this.winScreen) {
      this.winScreen.style.display = 'flex';
      if (this.winScore) this.winScore.textContent = score;
    }
  }

  hideAllScreens() {
    if (this.startScreen) this.startScreen.style.display = 'none';
    if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
    if (this.winScreen) this.winScreen.style.display = 'none';
  }
}
