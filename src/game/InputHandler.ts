// 输入处理器

import { InputState } from './types';

export class InputHandler {
  private state: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    mouseX: 0,
    mouseY: 0,
    useMouse: false
  };

  constructor(private canvas: HTMLCanvasElement) {
    this.setupKeyboardListeners();
    this.setupMouseListeners();
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          this.state.up = true;
          this.state.useMouse = false;
          break;
        case 's':
          this.state.down = true;
          this.state.useMouse = false;
          break;
        case 'a':
          this.state.left = true;
          this.state.useMouse = false;
          break;
        case 'd':
          this.state.right = true;
          this.state.useMouse = false;
          break;
        case ' ':
          this.state.shoot = true;
          break;
      }
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          this.state.up = false;
          break;
        case 's':
          this.state.down = false;
          break;
        case 'a':
          this.state.left = false;
          break;
        case 'd':
          this.state.right = false;
          break;
        case ' ':
          this.state.shoot = false;
          break;
      }
    });
  }

  private setupMouseListeners(): void {
    this.canvas.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      this.state.mouseX = e.clientX - rect.left;
      this.state.mouseY = e.clientY - rect.top;
      this.state.useMouse = true;
    });

    this.canvas.addEventListener('mousedown', (e: MouseEvent) => {
      if (e.button === 0) { // 左键
        this.state.shoot = true;
        this.state.useMouse = true;
      }
    });

    this.canvas.addEventListener('mouseup', (e: MouseEvent) => {
      if (e.button === 0) {
        this.state.shoot = false;
      }
    });

    // 防止右键菜单
    this.canvas.addEventListener('contextmenu', (e: MouseEvent) => {
      e.preventDefault();
    });
  }

  getState(): InputState {
    return this.state;
  }

  reset(): void {
    this.state = {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      mouseX: 0,
      mouseY: 0,
      useMouse: false
    };
  }
}