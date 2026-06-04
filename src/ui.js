// UI 模块
import { CONFIG } from './config.js';

const isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);

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
    this.transitionScreen = document.getElementById('transition-screen');
    this.transitionText = document.getElementById('transition-text');
    this.finalScore = document.getElementById('final-score');
    this.winScore = document.getElementById('win-score');
    this.winKills = document.getElementById('win-kills');
    this.spreadIndicator = document.getElementById('spread-indicator');
    this.bombIndicator = document.getElementById('bomb-indicator');
    this.controlsHelp = document.getElementById('controls-help');

    this._initControlsHelp();
  }

  _initControlsHelp() {
    const moveEl = document.getElementById('help-move');
    const shootEl = document.getElementById('help-shoot');
    const spreadEl = document.getElementById('help-spread');
    if (!moveEl || !shootEl || !spreadEl) return;
    if (isMobile) {
      moveEl.textContent = '滑动';
      shootEl.textContent = '点击';
      spreadEl.textContent = '点击图标';
    } else {
      moveEl.textContent = 'WASD';
      shootEl.textContent = '空格';
      spreadEl.textContent = '数字1';
    }
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
    const names = CONFIG.LEVEL_NAMES;
    this.levelDisplay.textContent = `第${level}关：${names[level] || ''}`;
  }

  updateEnemyCount(current, total) {
    if (!this.enemyCount) return;
    this.enemyCount.textContent = `敌人：${current}/${total}`;
  }

  updateSpreadIndicator(active, hasPowerup) {
    if (!this.spreadIndicator) return;
    if (active) {
      this.spreadIndicator.className = 'powerup-indicator active';
    } else if (hasPowerup) {
      this.spreadIndicator.className = 'powerup-indicator has-powerup';
    } else {
      this.spreadIndicator.className = 'powerup-indicator';
    }
  }

  updateBombIndicator(hasPowerup) {
    if (!this.bombIndicator) return;
    if (hasPowerup) {
      this.bombIndicator.className = 'powerup-indicator has-powerup';
    } else {
      this.bombIndicator.className = 'powerup-indicator';
    }
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
    if (this.transitionScreen) this.transitionScreen.style.display = 'none';
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

  showWinScreen(score, kills) {
    if (this.winScreen) {
      this.winScreen.style.display = 'flex';
      if (this.winScore) this.winScore.textContent = score;
      if (this.winKills) this.winKills.textContent = kills;
    }
  }

  showTransitionScreen(levelName) {
    if (this.transitionScreen) {
      this.transitionScreen.style.display = 'flex';
      if (this.transitionText) {
        this.transitionText.textContent = `下一关：${levelName}`;
      }
    }
  }

  hideTransitionScreen() {
    if (this.transitionScreen) this.transitionScreen.style.display = 'none';
  }

  hideAllScreens() {
    if (this.startScreen) this.startScreen.style.display = 'none';
    if (this.gameOverScreen) this.gameOverScreen.style.display = 'none';
    if (this.winScreen) this.winScreen.style.display = 'none';
    if (this.transitionScreen) this.transitionScreen.style.display = 'none';
  }
}
