// 游戏配置常量

export const CONFIG = {
  // 画布（运行时动态设置）
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // 玩家
  PLAYER_SIZE: 20,
  PLAYER_SPEED: 5,
  PLAYER_HP: 5,
  PLAYER_SHOOT_COOLDOWN: 150,
  PLAYER_INVINCIBLE_TIME: 500,

  // 子弹
  BULLET_SIZE: 5,
  BULLET_SPEED: 8,

  // 敌人
  ENEMY_SIZE: 25,
  BOSS_SIZE: 50,

  // 敌人 HP
  YELLOW_ENEMY_HP: 2,
  GREEN_ENEMY_HP: 1,
  BOSS_HP: 20,

  // 射击间隔
  YELLOW_ENEMY_SHOOT_INTERVAL: 3000,
  BOSS_SHOOT_INTERVAL: 5000,
  BOSS_BURST_COUNT: 10,
  BOSS_BURST_INTERVAL: 100,

  // 得分
  YELLOW_SCORE: 10,
  GREEN_SCORE: 20,
  BOSS_SCORE: 200,

  // 生成间隔
  ENEMY_SPAWN_INTERVAL_MIN: 1000,
  ENEMY_SPAWN_INTERVAL_MAX: 2000,

  // 追踪速度
  GREEN_ENEMY_TRACKING_SPEED: 2.25,

  // 粒子
  PARTICLE_LIFE: 50,
};

// 关卡配置
export const LEVELS = [
  {
    yellowEnemies: 10,
    greenEnemies: 5,
    bossCount: 0,
    enemiesPerWave: 1,
    title: '测试关',
  },
  {
    yellowEnemies: 5,
    greenEnemies: 10,
    bossCount: 1,
    enemiesPerWave: 2,
    title: 'boss来了',
  },
];

// 敌人类型
export const EnemyType = {
  YELLOW_CIRCLE: 'yellow_circle',
  GREEN_ARROW: 'green_arrow',
  RED_BOSS: 'red_boss',
};

// 子弹归属
export const BulletOwner = {
  PLAYER: 'player',
  ENEMY: 'enemy',
  ENEMY_TRACKING: 'enemy_tracking',
};

// 死亡效果
export const DeathEffect = {
  EXPLOSION: 'explosion',
  FLASH: 'flash',
  BOSS_EXPLOSION: 'boss_explosion',
};

// 图片 URL 映射（预留）
export const IMAGES = {};
