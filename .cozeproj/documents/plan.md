# 飞机大战：可扩展性架构重构方案

## 概述

将基础二创项目从"硬编码分支式"重构为"配置+钩子+自动发现"的模块化架构，使孩子**只需新增 1 个文件**就能添加新敌人或新道具（包括复杂的多状态/复合行为敌人）。同步删除炸弹道具、释放数字键 2 给后续道具。

**平台**：Web（Vite 6 + 纯 JS + Canvas 2D）
**核心机制**：`import.meta.glob` 自动发现 + `BaseEnemy`/`BasePowerUp` 生命周期钩子 + 可选行为片段库

## 技术方案

| 维度 | 选择 | 理由 |
|------|------|------|
| 模块组织 | 每个敌人/道具独立文件 + `types/` 目录 | 单一职责，Git diff 干净 |
| 自动发现 | Vite `import.meta.glob('./types/*.js', { eager: true })` | 加文件即注册，零配置改动 |
| 行为扩展 | 基类钩子（`_onUpdate`/`_onShoot`/`_onRender` 等） | 简单配置 or 类继承 二选一 |
| 行为复用 | 行为片段库（movement/shooting/render） | 乐高式组合，避免重复 |
| 状态管理 | BOSS 等复杂敌人用 class 继承 + 状态机 | 多阶段行为可读性高 |
| 渲染/碰撞 | 通用遍历，不再按 type 分支 | 增删类型不影响核心循环 |
| 数字键 | 散弹=1，2/3/4 留给后续道具 | 序列化分配，零冲突 |
| 文档沉淀 | `docs/ADD-ENEMY.md` + `docs/ADD-POWERUP.md` + AGENTS.md | 降低二创门槛 |

## 功能模块

### 模块 A：清理（删除炸弹 + 释放数字键 2）
- `config.js`：移除 `PowerUpType.BOMB` + `POWERUP_CONFIGS.BOMB` 条目 + `BOMB_DAMAGE` 字段
- `player.js`：移除 `bombRequested` / `hasBombPowerup` 字段及其重置
- `game.js`：移除 `_update()` 中炸弹清屏逻辑块、`_bindPowerupClick` 中炸弹绑定
- `input.js`：移除 `bombTriggered` 字段、`case '2'` 分支、`consumeBombTrigger` 方法
- `ui.js`：移除 `bombIndicator` 字段、`updateBombIndicator` 方法
- `index.html`：移除 `#bomb-indicator` 节点 + 移除帮助栏炸弹行 + 更新开始页文案
- `style.css`：移除 `.bomb-indicator` 相关样式（如有）

### 模块 B：道具系统重构（模块化 + 自动发现）
新建目录结构：
```
src/powerups/
├── base.js           # BasePowerUp 基类（生命周期：onPickup/onActivate/onDeactivate/onUpdate/onRender）
├── index.js          # 注册中心 + 自动发现（import.meta.glob）
├── types/            # 每种道具一个文件
│   ├── spread.js     # 散弹（可激活持续型）
│   └── heart.js      # 生命（瞬间消耗型，拾取即生效）
└── powerups.js       # 公共 API：spawnPowerUp() / checkPowerUpCollisions() / activatePowerUp()
```

**POWERUP_CONFIGS 扩展字段**（每条含完整定义）：
```js
{
  type, name, color, icon, hotkey, indicatorId, dropWeight,
  maxInventory, isActivable, duration,
  onPickup,   // 拾取瞬间效果（heart 用）
  onActivate, // 玩家按键激活（spread 用）
  onDeactivate,
  onUpdate,   // 每帧（持续型）
  onRender,   // UI 指示器更新
  label,      // 道具上显示的字母
}
```

**数据驱动改造**：
- `input.js`：通过 `consumePowerupTrigger(type)` 通用方法替代 `consumeSpreadTrigger`/`consumeBombTrigger`
- `game.js _bindPowerupClick`：遍历 `POWERUP_CONFIGS` 自动绑定
- `game.js _update`：遍历注册表自动调用激活钩子
- `ui.js updateXxxIndicator`：统一为 `updateIndicator(type, state, hasPowerup)`
- `player.js`：通用 `inventory[type]++` + 钩子调用，移除 `bombRequested` / `hasBombPowerup` 等具体字段
- `renderer.js drawPowerUp`：通过 `cfg.label` 渲染字母，不再硬编码 labels 表

### 模块 C：敌人系统重构（模块化 + 自动发现）
新建目录结构：
```
src/enemies/
├── base.js           # BaseEnemy 基类（钩子：_init/_onUpdate/_onShootTick/_onDying/_onRender）
├── index.js          # 注册中心 + 自动发现
├── types/            # 每种敌人一个文件
│   ├── yellow-circle.js  # 黄色圆（基础型：直线下落+向下射击）
│   └── red-boss.js       # 红色 BOSS（复杂型：状态机+burst 射击）
└── enemies.js        # 公共 API：Enemy 工厂 / 工厂导出
```

**BaseEnemy 接口**：
```js
class BaseEnemy {
  constructor(type, startX)   // 自动加载 ENEMY_CONFIGS[type] 到实例
  update(player, dt)          // 调度 _onUpdate + _onShootTick + 子弹更新
  takeDamage(amount)          // 通用血量逻辑 + 触发 _onDeath 钩子
  isAlive() / isDying
}
```

**ENEMY_CONFIGS 字段**（每条含完整定义）：
```js
{
  type, name, hp, maxHp, size, score,
  fallSpeed, shootInterval, shootColor,
  movement,        // 'straight' | 'tracking' | 'sine' | 'custom'
  shootPattern,    // 'down' | 'aim' | 'burst' | 'ring' | 'custom'
  onInit,          // 初始化钩子
  onUpdate,        // 自定义移动
  onShootTick,     // 自定义射击
  onDying,         // 死亡动画
  onRender,        // 自定义绘制（不填则用 default 形状）
  deathEffect,     // 'explosion' | 'flash' | 'boss_explosion'
}
```

**数据驱动改造**：
- `levels.js initLevel()`：从 `LEVELS[i].enemyQueue` 读取敌人列表，**不再硬编码数字**
- `levels.js update()`：从配置读取 `enemiesPerWave`
- `renderer.js drawEnemy()`：通过 `cfg.onRender` 钩子渲染，移除 `if (enemy.type === ...)` 分支
- `collision.js handleKill()`：通过 `cfg.deathEffect` + `cfg.score` 通用化，移除 `effect === 'explosion'` 硬编码分支
- `boss.js`：迁移为 `types/red-boss.js` 的类实现（继承 `BaseEnemy`）

### 模块 D：行为片段库（高级，可选扩展点）
```
src/enemies/behaviors/
├── movement.js    # straight(tracking/sine/wobble → 返回函数)
├── shooting.js    # down/aim/burst/ring/fan → 返回函数)
├── render.js      # drawCircle/drawTriangle/drawHexagon/drawStar → 返回函数)
```

复杂敌人可"乐高式"组合：
```js
// types/green-triangle.js
import * as Move from '../behaviors/movement.js';
import * as Shoot from '../behaviors/shooting.js';
import { drawTriangle } from '../behaviors/render.js';

export default {
  type: 'green_triangle',
  hp: 1, size: 22, score: 20, color: '#44ff44',
  movement: 'tracking',
  _onUpdate: Move.tracking(1.5),
  _onShootTick: Shoot.aimShot('#88ff88', 4),
  onRender: drawTriangle('#44ff44'),
};
```

### 模块 E：二创教程文档
- `docs/ADD-ENEMY.md`：3 步添加新敌人（复制模板 → 改字段 → 在 LEVELS 注册）
- `docs/ADD-POWERUP.md`：3 步添加新道具（含激活型/持续型/瞬间型三种模板）
- `AGENTS.md`：补充新的目录结构说明、行为片段库用法、自动发现机制

## 是否有原型设计

否（属于纯架构重构，UI/玩法不变，无新页面/视觉改动；`select_design_style` 工具不可用，"设计引导"未在系统提示中开启）

## 实施步骤

1. **删除炸弹，释放数字键 2**
   - 涉及文件：`config.js`、`player.js`、`input.js`、`ui.js`、`game.js`、`index.html`、`style.css`
   - 验证：`pnpm lint` + 服务探活 + 浏览器确认 1=散弹仍可激活、炸弹已无任何痕迹

2. **建立道具模块化架构（BasePowerUp + 自动发现 + 散弹/生命迁移）**
   - 新建：`src/powerups/base.js`、`src/powerups/index.js`、`src/powerups/types/spread.js`、`src/powerups/types/heart.js`
   - 改造：`powerups.js`（统一 spawn/check/activate API）、`config.js`（扩展 POWERUP_CONFIGS 字段）、`player.js`（inventory 通用化 + 钩子调用）、`input.js`（通用 `consumePowerupTrigger`）、`ui.js`（通用 `updateIndicator`）、`renderer.js`（drawPowerUp 通用化）
   - 验证：散弹正常激活、生命可拾取、UI 指示器正常切换

3. **建立敌人模块化架构（BaseEnemy + 自动发现 + 黄色圆/红色 BOSS 迁移）**
   - 新建：`src/enemies/base.js`、`src/enemies/index.js`、`src/enemies/types/yellow-circle.js`、`src/enemies/types/red-boss.js`
   - 改造：`enemies.js`（工厂模式导出）、`boss.js`（迁移到 types/red-boss.js，继承 BaseEnemy）、`config.js`（新增 ENEMY_CONFIGS）、`renderer.js`（drawEnemy 通用化）、`collision.js`（handleKill 通用化）、`levels.js`（从配置读取 enemyQueue）、`game.js`（移除 BOSS 特判）
   - 验证：第 1 关 6 黄敌正常、第 2 关 10 黄 + 1 BOSS 正常

4. **行为片段库（高级复用）+ 行为复合示例验证**
   - 新建：`src/enemies/behaviors/movement.js`、`shooting.js`、`render.js`
   - 重构：`types/yellow-circle.js` 使用 `Move.straight` + `Shoot.down` + `drawCircle` 复合（验证乐高模式可用）
   - 验证：行为片段组合出的敌人与原版行为一致

5. **编写二创教程文档**
   - 新建：`docs/ADD-ENEMY.md`（3 步教程 + 模板代码）、`docs/ADD-POWERUP.md`（3 种类型模板）
   - 更新：`AGENTS.md`（补充新目录结构、ENEMY_CONFIGS/POWERUP_CONFIGS 字段说明、行为片段库用法）
   - 验证：按教程逐步骤可成功添加一个新敌人/新道具

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| 重构过程中游戏崩溃 | 每步结束跑 `test_run`（含服务探活），失败立即回滚 |
| BOSS 迁移后状态机行为偏差 | 单元/集成测试关卡 2 完整流程，对比迁移前后行为 |
| 自动发现可能扫到非预期文件 | `types/` 目录隔离 + 每个类型文件需 `export default` 才被注册 |
| 现有游戏平衡被破坏 | 关键数值（HP/速度/分数/掉率）从 `CONFIG` 直接读取，重构不改变数值 |

## 验收标准

- [ ] 删除炸弹后，游戏中无任何炸弹相关痕迹（DOM/代码/UI/音效）
- [ ] 添加一个新敌人**只需 1 个新文件** + `LEVELS` 数组加 1 行
- [ ] 添加一个新道具**只需 1 个新文件** + `POWERUP_CONFIGS` 加 1 条
- [ ] 复杂敌人（如多阶段 BOSS）可用 class 继承 + 状态机实现
- [ ] 行为片段库支持至少 3 种移动模式 + 3 种射击模式 + 3 种渲染形状
- [ ] 教程文档可独立完成"添加新敌人"和"添加新道具"两个练习
- [ ] 所有 `test_run` 检查通过（lint + ts-check + 服务探活）
