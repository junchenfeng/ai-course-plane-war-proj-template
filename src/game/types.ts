// 游戏类型定义

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export enum EnemyType {
  YELLOW_CIRCLE = 'yellow_circle',
  GREEN_ARROW = 'green_arrow',
  RED_BOSS = 'red_boss'
}

export enum BulletOwner {
  PLAYER = 'player',
  ENEMY = 'enemy',
  ENEMY_TRACKING = 'enemy_tracking'
}

export interface BulletConfig {
  owner: BulletOwner;
  position: Position;
  velocity: Velocity;
  color: string;
  size: number;
  target?: Position; // 用于追踪子弹
}

export interface EnemyConfig {
  type: EnemyType;
  position: Position;
}

export interface ParticleConfig {
  position: Position;
  velocity: Velocity;
  color: string;
  size: number;
  life: number;
}

export interface StarConfig {
  position: Position;
  size: number;
  brightness: number;
  twinkleSpeed: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  shoot: boolean;
  mouseX: number;
  mouseY: number;
  useMouse: boolean;
}

export interface LevelConfig {
  yellowEnemies: number;
  greenEnemies: number;
  bossCount: number;
  enemiesPerWave: number;
}