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
  GREEN_TRIANGLE: 'green_triangle',
  RED_BOSS: 'red_boss',
};

// 子弹归属
export const BulletOwner = {
  PLAYER: 'player',
  ENEMY: 'enemy',
  ENEMY_TRACKING: 'enemy_tracking',
};

// ===== 敌人配置注册表 =====
// 新增敌人：1) src/enemies/types/ 加新文件 2) 此处加一条
// 字段说明：shootInterval=0 表示该敌人不射击；deathEffect 控制死亡特效
export const ENEMY_CONFIGS = {
  [EnemyType.YELLOW_CIRCLE]: {
    hp: CONFIG.YELLOW_ENEMY_HP,
    size: CONFIG.ENEMY_SIZE,
    score: CONFIG.YELLOW_SCORE,
    fallSpeed: CONFIG.ENEMY_FALL_SPEED_YELLOW,
    shootInterval: CONFIG.YELLOW_ENEMY_SHOOT_INTERVAL,
    shootColor: '#ffff00',
    color: '#ffff00',
    deathEffect: 'explosion',
  },
  [EnemyType.RED_BOSS]: {
    hp: CONFIG.BOSS_HP,
    size: CONFIG.BOSS_SIZE,
    score: CONFIG.BOSS_SCORE,
    fallSpeed: 0,                        // BOSS 用 _onUpdate 自定义移动
    shootInterval: 0,                    // BOSS 用 _onShootTick 自定义射击
    shootColor: '#ff4444',
    color: '#ff4444',
    deathEffect: 'boss_explosion',
  },
  [EnemyType.GREEN_TRIANGLE]: {
    hp: 2,
    size: 22,
    score: 15,
    fallSpeed: 0,                        // 用 _onUpdate 自定义
    shootInterval: 2000,                 // 2 秒射击一次
    shootColor: '#44ff88',
    color: '#44ff44',
    deathEffect: 'explosion',
  },
};

// ===== 道具类型（可扩展注册表） =====
// 新增道具只需在此追加一条 definition 即可，无需改动碰撞/渲染逻辑
// ⚠️ 数字键绑定：散弹=数字1，后续道具从数字2 开始（与 input.js 中 keydown case 对应，新增道具需同步更新 input.js 和 game.js）

export const PowerUpType = {
  SPREAD: 'spread',   // 可储存状态道具：激活后持续发射散弹
  HEART: 'heart',     // 瞬间消耗品：拾取即恢复 1HP
};

// 道具配置注册表 — 每个道具类型一条
// 新增：1) src/powerups/types/ 加新文件 2) 此处加一条 definition
// 字段说明：hotkey 留空表示该道具无需手动激活（瞬间型）
export const POWERUP_CONFIGS = {
  [PowerUpType.SPREAD]: {
    type: PowerUpType.SPREAD,
    name: '散弹',
    color: '#4488ff',
    icon: 'crosshair',
    label: 'S',
    hotkey: '1',                 // 绑定的数字键
    indicatorId: 'spread-indicator',
    description: '发射 3 颗散射子弹',
    duration: 5000,        // ms, 持续状态时长
    dropWeight: 1,          // 掉落权重
    maxInventory: 1,         // 背包最大持有数
    isActivable: true,      // 可主动激活
  },
  [PowerUpType.HEART]: {
    type: PowerUpType.HEART,
    name: '生命',
    color: '#ff4488',
    icon: 'heart',
    label: 'H',
    hotkey: '',                  // 瞬间型，无热键
    indicatorId: '',             // 瞬间型，无指示器
    description: '恢复 1 点生命值',
    duration: 0,            // 拾取即生效
    dropWeight: 1,
    maxInventory: 0,         // 不可储存，拾取即用
    isActivable: false,     // 不可主动激活
  },
};