# 飞机大战 - 数值整理 / 重构 / 文档 / 道具架构

## 概述

对飞机大战项目进行四项系统性改进：将散落各模块的硬编码数值统一收敛到 `config.js`；清理冗余代码与死代码；补写 `docs/UI设计.md`；为道具系统设计可扩展的类型注册架构，支撑未来多种道具与商城。

## 技术方案

| 维度 | 选择 | 理由 |
|------|------|------|
| 数值收敛 | 所有可调参数迁入 `config.js`，按域分组 | 用户/Agent 改一处即可调平衡，无需翻多个文件 |
| 重构策略 | 删除死代码 + 合并重复逻辑 + 统一命名 | 减少未来 Agent 理解成本，降低改错概率 |
| 道具架构 | `PowerUpType` 枚举 + `POWERUP_DEFS` 注册表 + 数据驱动渲染 | 新增道具只需注册一条配置，不改碰撞/渲染核心逻辑 |
| 文档 | 直接补写 `docs/UI设计.md` | 已有空文件，填内容即可 |

## 功能模块

### 1. config.js 数值收敛

将以下散落在各模块的硬编码值迁入 `CONFIG` 对象，按域分块：

```
CONFIG
├── 画布
│   └── BG_COLOR: '#0a0a0a'
├── 玩家
│   ├── PLAYER_SIZE: 40 (已存在，值需与当前一致)
│   ├── PLAYER_START_Y_OFFSET: 80
│   └── PLAYER_IMAGE_PATH: '/images/player-fighter.webp'
├── 子弹 (已有 BULLET_SIZE / BULLET_SPEED)
│   └── BOSS_BULLET_SPEED_RATIO: 0.6
├── 敌人
│   ├── ENEMY_SPAWN_Y: -50
│   ├── YELLOW_FALL_SPEED: 1
│   ├── GREEN_FALL_SPEED_MIN: 0.5
│   ├── ENEMY_DEATH_DURATION: 300
│   └── ENEMY_BULLET_SPEED_RATIO: 0.5
├── BOSS
│   ├── BOSS_SPAWN_Y: -60
│   ├── BOSS_TARGET_Y_RATIO: 0.25
│   ├── BOSS_MOVE_SPEED: 0.5
│   ├── BOSS_DEATH_DURATION: 500
│   └── BOSS_SCALE_DECAY: 0.02
├── 粒子
│   ├── EXPLOSION_PARTICLE_COUNT: 20
│   ├── FLASH_PARTICLE_COUNT: 8
│   ├── BOSS_EXPLOSION_LAYERS: 3
│   ├── BOSS_EXPLOSION_PER_LAYER: 30
│   └── BOSS_EXPLOSION_EXTRA: 15
├── 星空
│   ├── STAR_DENSITY_DIVISOR: 3200
│   └── STAR_SCROLL_SPEED: 0.2
├── 过渡动画
│   ├── TRANSITION_PHASE1_DURATION: 800
│   ├── TRANSITION_PHASE2_DURATION: 600
│   └── TRANSITION_PHASE3_DURATION: 1500
├── 道具 (已有部分)
│   └── 新增 POWERUP_TYPE: 见下方道具架构
└── 伤害
    └── DAMAGE_PER_HIT: 1
```

### 2. 冗余代码清理清单

| 位置 | 问题 | 处理 |
|------|------|------|
| `renderer.js` | `playerImage`/`playerImageLoaded` 属性定义了但 drawPlayer 只用几何绘制 | 删除图片加载相关死代码 |
| `config.js` | `IMAGES = {}` 空对象从未使用 | 删除 |
| `config.js` | `DeathEffect` 枚举导出但无人引用 | 删除 |
| `game.js` | `this.bosses = []` 初始化但全程用 `levelManager.boss` | 删除 |
| `audio.js` | `playBossSound` / `playBgMusic` / `stopBgMusic` 定义但从未调用 | 删除 |
| `enemies.js` | `isAlive()` 方法与 `active` 检查语义重叠 | 保留但加注释说明 |
| `collision.js` | 敌人碰撞玩家时重复的 effect 处理逻辑 | 抽取为 `applyKillEffect()` 辅助函数 |

### 3. 道具系统架构设计

#### 3.1 类型枚举

```js
export const PowerUpType = {
  SPREAD: 'spread',       // 散弹
  // 未来扩展：
  // HEAL: 'heal',        // 回血
  // SHIELD: 'shield',    // 护盾
  // RAPID: 'rapid',      // 速射
  // BOMB: 'bomb',        // 全屏炸弹
};
```

#### 3.2 道具注册表 (POWERUP_DEFS)

```js
// 每种道具的静态配置，新增道具只需在此注册
export const POWERUP_DEFS = {
  [PowerUpType.SPREAD]: {
    id: 'spread',
    label: '散弹',
    icon: 'S',
    color: '#4488ff',
    dropRate: 0.10,
    duration: 5000,
    stackable: false,
    onActivate(player) { player.activateSpread(); },
  },
};
```

#### 3.3 PowerUp 类改造

- `getType()` 返回类型字符串
- 构造函数接收 `type` 参数
- 渲染时从 `POWERUP_DEFS[type]` 取颜色/图标

#### 3.4 碰撞处理通用化

- `checkPowerUpCollisions` 改为从 `POWERUP_DEFS` 查表调用 `onActivate`
- 不再硬编码 `hasSpreadPowerup` 判断

### 4. docs/UI设计.md 补写

记录当前 UI 的布局规则、颜色、字体、动画、响应式断点等。

## 是否有原型设计

是

## 实施步骤

1. **阶段一：原型设计** — 加载 `design-canvas` 技能，为未来的道具商城设计 HTML 原型页面（包含道具列表、道具详情、货币显示等），完成后提示用户确认 — 涉及 `.cozeproj/prototype/web/`
2. **阶段二：数值收敛** — 扫描所有模块，将硬编码数值迁入 `config.js`，各模块改为引用 `CONFIG.*` — 涉及 `config.js`、`renderer.js`、`enemies.js`、`boss.js`、`player.js`、`particles.js`、`game.js`、`collision.js`
3. **阶段二：代码重构** — 删除死代码、合并重复逻辑、统一道具碰撞处理 — 涉及 `config.js`、`renderer.js`、`game.js`、`audio.js`、`collision.js`
4. **阶段二：道具架构** — 定义 `PowerUpType` 枚举 + `POWERUP_DEFS` 注册表，改造 `PowerUp` 类和碰撞逻辑 — 涉及 `config.js`、`powerups.js`、`renderer.js`
5. **阶段二：补写文档** — 填充 `docs/UI设计.md`，同步更新 `docs/数值设置.md` 反映新 config 结构 — 涉及 `docs/UI设计.md`、`docs/数值设置.md`
6. **阶段二：执行代码检查与验证** — 通过 `test_run` 完成静态检查
