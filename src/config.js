// 游戏配置常量 — 所有可调整的游戏性数值集中在此
// 修改此文件即可调整游戏平衡性，无需改动业务逻辑

export const CONFIG = {
  // ===== 画布 =====
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,

  // ===== 玩家 =====
  PLAYER_SIZE: 35,
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
  ENEMY_REMOVE_OFFSET: 50,
  ENEMY_DEATH_TIMER: 300,

  // ===== 敌人 HP =====
  YELLOW_ENEMY_HP: 2,
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
  BOSS_SCORE: 200,

  // ===== 生成间隔 =====
  ENEMY_SPAWN_INTERVAL_MIN: 1000,
  ENEMY_SPAWN_INTERVAL_MAX: 2000,

  // ===== 追踪速度 =====
  // （绿色追踪敌人已移除）

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
  POWERUP_DROP_RATE: 0.66,
  POWERUP_SPREAD_ANGLE: 15,
  POWERUP_SIZE: 12,
  POWERUP_FALL_SPEED: 2,
  PLAYER_MAX_HP: 5,
  BOMB_DAMAGE: 5,

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
    yellowEnemies: 6,
    bossCount: 0,
    enemiesPerWave: 1,
    title: '测试关',
  },
  {
    yellowEnemies: 10,
    bossCount: 1,
    enemiesPerWave: 2,
    title: 'boss来了',
  },
];

// 敌人类型
export const EnemyType = {
  YELLOW_CIRCLE: 'yellow_circle',
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
// ⚠️ 数字键绑定：散弹=数字1, 炸弹=数字2（与 input.js 中 keydown case 对应，新增道具需同步更新 input.js 和 game.js）

export const PowerUpType = {
  SPREAD: 'spread',   // 可储存状态道具：激活后持续发射散弹
  BOMB: 'bomb',       // 可储存消耗品：清屏子弹 + 全体敌人扣血
  HEART: 'heart',     // 瞬间消耗品：拾取即恢复 1HP
};

// 道具配置注册表 — 每个道具类型一条
// 新增：加一个条目即可；修改：改这里全局生效
export const POWERUP_CONFIGS = {
  [PowerUpType.SPREAD]: {
    name: '散弹',
    color: '#4488ff',
    icon: 'crosshair',
    description: '发射 3 颗散射子弹',
    duration: 5000,        // ms, 持续状态时长
    dropWeight: 1,          // 掉落权重（三种等权重）
    maxInventory: 1,         // 背包最大持有数
    isActivable: true,      // 可主动激活
  },
  [PowerUpType.BOMB]: {
    name: '炸弹',
    color: '#ff4444',
    icon: 'bomb',
    description: '清除全屏子弹并伤害所有敌人',
    duration: 0,            // 无持续状态，瞬间生效
    dropWeight: 1,
    maxInventory: 3,
    isActivable: true,
  },
  [PowerUpType.HEART]: {
    name: '生命',
    color: '#ff4488',
    icon: 'heart',
    description: '恢复 1 点生命值',
    duration: 0,            // 拾取即生效
    dropWeight: 1,
    maxInventory: 0,         // 不可储存，拾取即用
    isActivable: false,     // 不可主动激活
  },
};