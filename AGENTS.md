# 项目上下文

## 技术栈

- **核心**: Vite 6, 纯 JavaScript (ES Module)
- **样式**: 原生 CSS
- **架构**: 模块化 + 行为组合（敌人/道具均按文件自动发现）

## 目录结构

```
├── index.html              # HTML 结构和 DOM 元素
├── package.json            # 依赖只有 vite
├── vite.config.js          # Vite 基础配置
├── proj_assets/            # 项目预存资源
├── public/
│   ├── images/             # 图片资源目录
│   └── sounds/             # 音频资源目录
├── docs/                   # 二创教程文档
│   ├── ADD-ENEMY.md        # 添加新敌人教程
│   └── ADD-POWERUP.md      # 添加新道具教程
├── src/
│   ├── main.js             # 入口，导入所有模块并启动游戏
│   ├── config.js           # 导出 CONFIG、EnemyType、PowerUpType、ENEMY_CONFIGS、POWERUP_CONFIGS
│   ├── audio.js            # audioCtx 创建、音效播放（基础版本无 BGM）
│   ├── player.js           # 玩家创建、移动、射击逻辑 + Bullet 类
│   ├── utils.js            # 工具函数 + HSV 去背景算法
│   ├── enemies.js          # 敌人模块入口（createEnemy 工厂）
│   ├── boss.js             # Boss 兼容层（委托给 createEnemy(RED_BOSS)）
│   ├── powerups.js         # 道具模块入口（createPowerUp 工厂 + spawn/manage）
│   ├── particles.js        # 粒子创建、更新逻辑
│   ├── collision.js        # 所有碰撞检测（基于通用 takeDamage 返回值）
│   ├── renderer.js         # draw() 函数：星空、玩家、敌人、BOSS、子弹、粒子、道具
│   ├── ui.js               # updateUI、关卡显示、道具指示器（数据驱动）
│   ├── input.js            # 键盘、鼠标事件监听（通用 consumePowerupTrigger）
│   ├── levels.js           # 关卡系统：敌人生成、关卡切换（数据驱动）
│   ├── game.js             # 游戏主循环
│   ├── style.css           # 全局样式
│   ├── enemies/            # 敌人模块化目录
│   │   ├── base.js         # BaseEnemy 基类（生命周期钩子）
│   │   ├── index.js        # ENEMY_REGISTRY（import.meta.glob 自动发现）
│   │   ├── types/          # 每种敌人一个文件
│   │   │   ├── yellow-circle.js
│   │   │   ├── green-triangle.js
│   │   │   └── red-boss.js
│   │   └── behaviors/      # 行为片段库（乐高式组合）
│   │       ├── movement.js
│   │       ├── shooting.js
│   │       └── render.js
│   └── powerups/           # 道具模块化目录
│       ├── base.js         # BasePowerUp 基类（生命周期钩子）
│       ├── index.js        # POWERUP_REGISTRY（自动发现）
│       └── types/          # 每种道具一个文件
│           ├── spread.js
│           └── heart.js
└── README.md
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

## 开发规范

- 纯 JavaScript ES Module，无 TypeScript
- 使用原生 CSS 进行样式开发
- 游戏使用 Canvas 2D API 渲染
- 所有模块通过 ES import/export 组织
- **添加新敌人/道具**：只需在 `src/enemies/types/` 或 `src/powerups/types/` 新建文件，无需改其他文件（仅需在 `config.js` 注册 type id）

## 文档维护规范

- 修改代码后，必须检查 `docs/` 目录下的文档是否需要同步更新
- 涉及关卡、道具、数值变动的，必须同步更新对应的 `.md` 文件
- 若文档无需更新，需在提交信息或回复中明确说明
- 添加新的钩子/行为片段时，需同步更新 `docs/ADD-ENEMY.md` 或 `docs/ADD-POWERUP.md` 的速查表

## 素材规范
- 服务素材只能来自public
- public/images中的图片素材必须使用 `.webp` 文件格式
- 单张图片大小不得超过 200KB，超限时必须进行压缩或格式转换
- 如果用户从其他地方指定贴图素材，先进行格式转换，再放置到public/images中

## 临时文件规范

- 用户从网上下载/上传/生成的音频/图片/文件都放到 `tmp/` 目录下
- `tmp/` 已加入 `.gitignore`，不会被提交到版本控制

## 图片去背景规范

- 当用户要求使用HSV算法时，把背景色尽可能去掉
- 如果你发现背景色不是绿色(绿色判定可以宽泛一点，不用纯色)，向用户发出报警"背景色不是绿色，算法可能失效，建议重新生成

### HSV 去背景算法

**所在位置**：`src/utils.js`

**核心函数**：

| 函数 | 用途 |
|------|------|
| `rgbToHsv(r, g, b)` | RGB 转 HSV，返回 `{h, s, v}` |
| `isGreenColor(h, s, v)` | 判断是否为绿色（色相 60-180°，饱和度≥0.15，明度≥0.15） |
| `removeBackgroundWithHsv(image)` | 对 ImageBitmap/HTMLImageElement 去绿色背景，返回 `{canvas, isGreenBackground}` |
| `loadAndProcessImage(src)` | 加载图片并调用 `removeBackgroundWithHsv`，返回 `{canvas, isGreenBackground}` |

**使用方法**：
```js
import { loadAndProcessImage } from './utils.js';

const result = await loadAndProcessImage('/images/xxx.webp');
if (!result.isGreenBackground) {
  console.warn('背景色不是绿色，HSV 算法可能失效，建议重新生成绿色背景的图片');
}
renderer.setPlayerTexture(result.canvas);
```

**恢复贴图挂载**：在 `game.js` 中取消注释以下内容：
1. `import { loadAndProcessImage } from './utils.js';`
2. 构造函数中的 `this._loadPlayerTexture();`
3. `_loadPlayerTexture()` 方法体

> 注：基础版本不包含 BGM（背景音乐）。如需 BGM，请参考进阶教程 `docs/ADD-BGM.md` 自行实现（独立模块，不污染基础版本）。

## 敌人模块化架构

**位置**：`src/enemies/`

### BaseEnemy 基类
**位置**：`src/enemies/base.js`

提供生命周期钩子，子类按需重写：

| 钩子 | 触发时机 | 默认实现 |
|------|---------|---------|
| `_onInit()` | 构造时（HP/size 自动设置后） | 无 |
| `_onUpdate(enemy, player, dt)` | 每帧正常状态 | 无 |
| `_onShootTick(enemy, player, dt)` | 每帧检查射击 | 无 |
| `_onDying(enemy, dt)` | 死亡动画期间 | 无 |
| `_onRender(ctx, enemy)` | 渲染时 | 默认基础渲染 |

内置方法：`update()` / `takeDamage(amount)` / `render()` 等（自动调用钩子）。

### ENEMY_REGISTRY
**位置**：`src/enemies/index.js`

使用 Vite 的 `import.meta.glob('./types/*.js', { eager: true })` 自动扫描 `types/` 下所有文件。**孩子只要新建文件就自动注册**，无需改 `index.js`。

### ENEMY_CONFIGS
**位置**：`src/config.js`

注册每种敌人的元数据（HP/size/score/死亡特效等）：

```js
export const ENEMY_CONFIGS = {
  [EnemyType.YELLOW_CIRCLE]: {
    hp: 2, size: 25, score: 10,
    fallSpeed: 1,
    shootInterval: 3000, shootColor: '#ffeb3b',
    color: '#ffeb3b', deathEffect: 'explosion',
  },
};
```

### 行为片段库
**位置**：`src/enemies/behaviors/`

- `movement.js`：`straight()` / `tracking()` / `sine()` / `zigzag()` / `hover()` / `staticMove()`
- `shooting.js`：`down()` / `aimed()` / `ring()` / `spread()` / `noShoot()`
- `render.js`：`circle()` / `circleWithInner()` / `triangle()` / `polygon()` / `star()`

每种敌人**可选**用配置对象（简单）或继承类（复杂 + 状态机）。

## 道具模块化架构

**位置**：`src/powerups/`

### BasePowerUp 基类
**位置**：`src/powerups/base.js`

| 钩子 | 触发时机 |
|------|---------|
| `onPickup(player)` | 玩家捡到瞬间 |
| `onActivate(player)` | 按热键激活 |
| `onUpdate(player, dt)` | 每帧（持续型） |
| `onRender(ctx, player)` | 每帧渲染（玩家身上的护盾等） |

### POWERUP_REGISTRY
**位置**：`src/powerups/index.js`

`import.meta.glob` 自动发现新文件。

### POWERUP_CONFIGS 字段
**位置**：`src/config.js`

| 字段 | 用途 | 必填 |
|------|------|------|
| `type` | 唯一 id | ✅ |
| `name` | 中文名 | ✅ |
| `color` / `icon` / `label` | 视觉 | ✅ |
| `hotkey` | 数字键（'1' / '2'...） | 激活型必填 |
| `indicatorId` | HTML 指示器 id | 激活型必填 |
| `description` | 鼠标 hover 提示 | 否 |
| `duration` | 持续时间(ms) | 否 |
| `dropWeight` | 掉落权重 | 默认 1 |
| `maxInventory` | 背包上限 | 默认 1 |
| `isActivable` | 是否按热键激活 | 默认 false |

**当前热键分配**：`1`=散弹，`2`=空闲（保留），`3`+ 按顺序。

## 图片生成规范
- 当用户使用genrate_images的工具或者要求生成图片后，将图片下载到本项目的`tmp`文件夹下，并在对话中提供预览
