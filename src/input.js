// 输入处理模块
import { initAudio } from './audio.js';

export class InputHandler {
  constructor(canvas) {
    this.up = false;
    this.down = false;
    this.left = false;
    this.right = false;
    this.shoot = false;
    this.mouseX = undefined;
    this.mouseY = undefined;
    this.useMouse = false;
    this.mouseDown = false;
    // 可储存道具数字键绑定：1=散弹, 2=炸弹（与 POWERUP_CONFIGS 中 isActivable 道具对应）
    this.spreadTriggered = false;
    this.bombTriggered = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    canvas.addEventListener('mousemove', this._onMouseMove);
    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('mouseup', this._onMouseUp);
    canvas.addEventListener('touchstart', this._onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', this._onTouchMove, { passive: false });
    canvas.addEventListener('touchend', this._onTouchEnd);
  }

  _onKeyDown(e) {
    initAudio();
    this.useMouse = false;
    switch (e.key.toLowerCase()) {
      case 'w': case 'arrowup': this.up = true; e.preventDefault(); break;
      case 's': case 'arrowdown': this.down = true; e.preventDefault(); break;
      case 'a': case 'arrowleft': this.left = true; e.preventDefault(); break;
      case 'd': case 'arrowright': this.right = true; e.preventDefault(); break;
      case ' ': this.shoot = true; e.preventDefault(); break;
      case '1': this.spreadTriggered = true; e.preventDefault(); break;
      case '2': this.bombTriggered = true; e.preventDefault(); break;
    }
  }

  _onKeyUp(e) {
    switch (e.key.toLowerCase()) {
      case 'w': case 'arrowup': this.up = false; break;
      case 's': case 'arrowdown': this.down = false; break;
      case 'a': case 'arrowleft': this.left = false; break;
      case 'd': case 'arrowright': this.right = false; break;
      case ' ': this.shoot = false; break;
    }
  }

  _onMouseMove(e) {
    this.useMouse = true;
    const rect = e.target.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  }

  _onMouseDown(e) {
    initAudio();
    e.preventDefault();
    this.useMouse = true;
    this.mouseDown = true;
    this.shoot = true;
  }

  _onMouseUp() {
    this.mouseDown = false;
    this.shoot = false;
  }

  _onTouchStart(e) {
    initAudio();
    e.preventDefault();
    this.useMouse = true;
    const rect = e.target.getBoundingClientRect();
    const touch = e.touches[0];
    this.mouseX = touch.clientX - rect.left;
    this.mouseY = touch.clientY - rect.top;
    this.shoot = true;
  }

  _onTouchMove(e) {
    e.preventDefault();
    this.useMouse = true;
    const rect = e.target.getBoundingClientRect();
    const touch = e.touches[0];
    this.mouseX = touch.clientX - rect.left;
    this.mouseY = touch.clientY - rect.top;
  }

  _onTouchEnd() {
    this.shoot = false;
  }

  consumeSpreadTrigger() {
    if (this.spreadTriggered) {
      this.spreadTriggered = false;
      return true;
    }
    return false;
  }

  consumeBombTrigger() {
    if (this.bombTriggered) {
      this.bombTriggered = false;
      return true;
    }
    return false;
  }

  destroy() {
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup', this._onKeyUp);
    this.canvas.removeEventListener('mousemove', this._onMouseMove);
    this.canvas.removeEventListener('mousedown', this._onMouseDown);
    this.canvas.removeEventListener('mouseup', this._onMouseUp);
  }
}
