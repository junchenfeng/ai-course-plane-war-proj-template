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
    // 可储存道具数字键绑定：1=散弹（后续道具从2开始，炸弹已移除）
    this.spreadTriggered = false;
    // 通用数字键触发：'2','3',... 各自一个 flag
    this._digitFlags = {};

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
    }

    // 通用数字键 2-9：每个数字单独 flag
    if (e.code && /^Digit[2-9]$/.test(e.code)) {
      const num = e.code.slice(5);
      this._digitFlags[num] = true;
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

  /**
   * 注册数字键到道具类型的映射
   * @param {Object} hotkeyMap - { '2': 'bomb', '3': 'laser', ... }
   */
  registerPowerupHotkeys(hotkeyMap) {
    this._hotkeyMap = hotkeyMap || {};
  }

  /**
   * 消费指定数字键的触发（通用）
   * @param {string} num - '1' ~ '9'
   * @returns {boolean}
   */
  consumeDigitTrigger(num) {
    if (num === '1') {
      if (this.spreadTriggered) {
        this.spreadTriggered = false;
        return true;
      }
      return false;
    }
    if (this._digitFlags[num]) {
      this._digitFlags[num] = false;
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
