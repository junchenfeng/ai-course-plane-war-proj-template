// 入口文件
import './style.css';
import { CONFIG } from './config.js';
import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');
if (!canvas) {
  throw new Error('Canvas element not found');
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  CONFIG.CANVAS_WIDTH = canvas.width;
  CONFIG.CANVAS_HEIGHT = canvas.height;
}

resizeCanvas();

const game = new Game(canvas);

window.addEventListener('resize', () => {
  resizeCanvas();
  game.renderer.resize();
});
