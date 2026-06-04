// 入口文件
import './style.css';
import { Game } from './game.js';

const canvas = document.getElementById('game-canvas');
if (!canvas) {
  throw new Error('Canvas element not found');
}

const game = new Game(canvas);
