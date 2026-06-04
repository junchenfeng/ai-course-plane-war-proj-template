// 游戏配置常量 — 所有可调整的游戏性数值集中在此
// 修改此文件即可调整游戏平衡性，无需改动业务逻辑

export const CONFIG = {
  // ===== 画布 =====
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // ===== 玩家 =====
  PLAYER_SIZE: 20,
  PLAYER_SPEED: 5,
  PLAYER_HP: 5,
  PLAYER_SHOOT_COOLDOWN: 150,
  PLAYER_INVINCIBLE_TIME: 500,
  PLAYER_INITIAL_Y: 80,

  // ===== 子弹 =====
  BULLET_SIZE: 5,
  BULLET_SPEED: 8,

  // ===== 敌人 =====
  ENEMY_SIZE: 25,
  ENEMY_FALL_SPEED_YELLOW: 1,
  ENEMY_FALL_SPEED_GREEN: 0.5,
  ENEMY_REMOVE_OFFSET: 50,
  ENEMY_DEATH_TIMER: 300,
  ENEMY_FLASH_DURATION: 50,

  // ===== 敌人 HP =====
  YELLOW_ENEMY_HP: 2,
  GREEN_ENEMY_HP: 1,
  BOSS_HP: 20,

  // ===== 射击间隔 =====
  YELLOW_ENEMY_SHOOT_INTERVAL: 3000,
  BOSS_SHOOT_INTERVAL: 2500,
  BOSS_BURST_COUNT: 10,
  BOSS_BURST_INTERVAL: 100,

  // ===== BOSS =====
  BOSS_SIZE: 50,
  BOSS_MOVE_SPEED: 0.5,
  BOSS_ENTRY_Y: -60,
  BOSS_STOP_Y_RATIO: 4,         // CANVAS_HEIGHT / 4 = 停止位
  BOSS_BULLET_SPEED_MULT: 0.6,
  BOSS_DEATH_TIMER: 500,
  BOSS_SCALE_RATE: 0.02,

  // ===== 伤害 =====
  PLAYER_BULLET_DAMAGE: 1,
  ENEMY_COLLISION_DAMAGE: 1,
  ENEMY_BULLET_DAMAGE: 1,

  // ===== 得分 =====
  YELLOW_SCORE: 10,
  GREEN_SCORE: 20,
  BOSS_SCORE: 200,

  // ===== 生成间隔 =====
  ENEMY_SPAWN_INTERVAL_MIN: 1000,
  ENEMY_SPAWN_INTERVAL_MAX: 2000,

  // ===== 追踪速度 =====
  GREEN_ENEMY_TRACKING_SPEED: 2.25,

  // ===== 粒子 =====
  PARTICLE_LIFE: 50,
  PARTICLE_EXPLOSION_COUNT: 20,
  PARTICLE_SPEED_MIN: 1,
  PARTICLE_SPEED_MAX: 4,
  PARTICLE_SIZE_MIN: 2,
  PARTICLE_SIZE_MAX: 6,

  // ===== 星空背景 =====
  STAR_COUNT_DIVISOR: 3200,
  STAR_SPEED: 0.2,
  STAR_TWINKLE_SPEED: 0.003,

  // ===== 道具 =====
  POWERUP_DROP_RATE: 0.1,
  POWERUP_DURATION: 5000,
  POWERUP_SPREAD_ANGLE: 15,
  POWERUP_SIZE: 12,
  POWERUP_FALL_SPEED: 2,

  // ===== 商城（预留） =====
  SHOP_STARTING_COINS: 12580,

  // ===== 关卡过渡 =====
  TRANSITION_FADE_IN: 800,        // 关卡标题淡入 ms
  TRANSITION_DISPLAY: 600,        // 关卡标题停留 ms
  TRANSITION_FADE_OUT: 1500,      // 关卡标题淡出 ms
  TRANSITION_OVERLAY_ALPHA: 0.85, // 过渡层透明度

  // ===== 视觉配色 =====
  PLAYER_COLOR: '#4488ff',
  PLAYER_COLOR_LIGHT: '#66aaff',
  ENGINE_COLOR_1: '#ff6600',
  ENGINE_COLOR_2: '#ffaa00',
  BG_COLOR: '#0a0a0a',

  // ===== 关卡名 =====
  LEVEL_NAMES: {
    1: '测试关',
    2: 'boss来了',
  },
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

// ===== 道具类型（可扩展注册表） =====
// 新增道具只需在此追加一条 definition 即可，无需改动碰撞/渲染逻辑

export const PowerUpType = {
  SPREAD: 'spread',
  SHIELD: 'shield',
  SPEED: 'speed',
  BOMB: 'bomb',
  MAGNET: 'magnet',
  HEART: 'heart',
};

// 道具配置注册表 — 每个道具类型一条
// 新增：加一个条目即可；修改：改这里全局生效
export const POWERUP_CONFIGS = {
  [PowerUpType.SPREAD]: {
    name: '散弹',
    color: '#4488ff',
    icon: 'crosshair',
    description: '发射 3 颗散射子弹',
    price: 500,
    duration: 5000,        // ms, 0=瞬时
    dropWeight: 30,          // 掉落权重
    maxInventory: 1,         // 背包最大持有数
    isActivable: true,      // 可主动激活
  },
  [PowerUpType.SHIELD]: {
    name: '护盾',
    color: '#44ff88',
    icon: 'shield',
    description: '抵挡一次攻击',
    price: 800,
    duration: 0,
    dropWeight: 20,
    maxInventory: 3,
    isActivable: false,     // 被动触发
  },
  [PowerUpType.SPEED]: {
    name: '加速',
    color: '#ffaa00',
    icon: 'zap',
    description: '提升移动速度和射速',
    price: 600,
    duration: 4000,
    dropWeight: 20,
    maxInventory: 1,
    isActivable: true,
  },
  [PowerUpType.BOMB]: {
    name: '炸弹',
    color: '#ff4444',
    icon: 'bomb',
    description: '清除全屏敌人子弹',
    price: 1200,
    duration: 0,
    dropWeight: 10,
    maxInventory: 3,
    isActivable: true,
  },
  [PowerUpType.MAGNET]: {
    name: '磁铁',
    color: '#ff44ff',
    icon: 'magnet',
    description: '自动吸附附近道具',
    price: 700,
    duration: 8000,
    dropWeight: 10,
    maxInventory: 1,
    isActivable: true,
  },
  [PowerUpType.HEART]: {
    name: '生命',
    color: '#ff4488',
    icon: 'heart',
    description: '恢复 1 点生命值',
    price: 1000,
    duration: 0,
    dropWeight: 10,
    maxInventory: 5,
    isActivable: false,     // 拾取即生效
  },
};