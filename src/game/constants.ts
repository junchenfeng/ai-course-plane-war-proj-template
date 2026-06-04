// 游戏常量定义

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PLAYER_SIZE = 30;
export const PLAYER_SPEED = 5;
export const PLAYER_HP = 5;
export const PLAYER_SHOOT_COOLDOWN = 150; // ms

export const BULLET_SIZE = 5;
export const BULLET_SPEED = 8;

export const ENEMY_SIZE = 25;
export const BOSS_SIZE = 50; // Boss 是普通敌人的2倍大

export const YELLOW_ENEMY_HP = 2;
export const GREEN_ENEMY_HP = 1;
export const BOSS_HP = 20;

export const YELLOW_ENEMY_SHOOT_INTERVAL = 1000; // ms
export const BOSS_SHOOT_INTERVAL = 5000; // ms
export const BOSS_BURST_COUNT = 10;
export const BOSS_BURST_INTERVAL = 100; // ms (每次发射间隔)

export const ENEMY_SPAWN_INTERVAL_MIN = 1000; // ms
export const ENEMY_SPAWN_INTERVAL_MAX = 2000; // ms

export const GREEN_ENEMY_SPEED = 2;
export const GREEN_ENEMY_TRACKING_SPEED = 1.5;

export const PARTICLE_LIFE = 50; // frames

export const LEVELS: import('./types').LevelConfig[] = [
  {
    yellowEnemies: 10,
    greenEnemies: 5,
    bossCount: 0,
    enemiesPerWave: 1
  },
  {
    yellowEnemies: 5,
    greenEnemies: 10,
    bossCount: 1,
    enemiesPerWave: 2
  }
];