# 飞机大战 - 纯 JavaScript + Vite 重构计划

## 概述

将当前 TypeScript 飞机大战项目重构为纯 JavaScript 原生项目，使用 Vite 作为构建工具。按用户指定的模块化架构重新组织代码，保持现有游戏功能（星空背景、三种敌人、关卡系统、碰撞检测、粒子特效、键盘/鼠标双输入）不变，移除 TypeScript 和 Tailwind CSS 依赖，改为纯 CSS 和原生 JS。

## 技术方案

| 维度 | 选择 | 理由 |
|------|------|------|
| 构建工具 | Vite 7 | 用户指定，支持原生 JS + HMR |
| 语言 | 纯 JavaScript (ES Module) | 用户明确要求不用 TypeScript |
| 样式方案 | 纯 CSS | 移除 Tailwind，保持简洁 |
| 包管理器 | pnpm | 项目规范要求 |
| 模块化 | ES Module 按功能拆分 | 用户指定的架构 |
| 音频 | Web Audio API | 预留音频能力 |

## 功能模块

### 1. `config.js` — 配置中心
导出 `CONFIG` 对象（画布尺寸、玩家属性、敌人属性、子弹属性、关卡配置）、`IMAGES` URL 映射、默认 tuning 参数。

### 2. `audio.js` — 音频管理
创建 `AudioContext`，提供 `playHitSound`、`playBossSound`、`playNote`、`playBgMusic`、`stopBgMusic` 函数。

### 3. `player.js` — 玩家模块
玩家创建、WASD/鼠标移动、空格/点击射击逻辑。数据结构：
```js
{ x, y, hp, maxHp, invincibleTime, bullets: [], shootCooldown }
```

### 4. `enemies.js` — 普通敌人模块
黄色圆形敌人（2HP，向下发子弹）和绿色箭头敌人（1HP，水平追踪+向下移动）的生成、更新、射击逻辑。

### 5. `boss.js` — BOSS 模块
红色六边形 BOSS（20HP，追踪子弹连发）的生成、移动、射击、死亡逻辑。

### 6. `powerups.js` — 道具模块
道具生成与更新逻辑（预留扩展）。

### 7. `particles.js` — 粒子系统
爆炸粒子（黄色敌人）、闪烁粒子（绿色敌人）、彩色粒子爆炸（BOSS）的创建与更新。

### 8. `collision.js` — 碰撞检测
子弹 vs 敌人、敌人子弹 vs 玩家、敌人 vs 玩家、道具 vs 玩家的碰撞检测。

### 9. `renderer.js` — 渲染模块
所有 `draw()` 函数：星空背景、玩家、敌人、BOSS、子弹、粒子、激光、道具的绘制。

### 10. `ui.js` — UI 模块
HP 显示（♥️）、关卡显示、敌人计数、开始/结束界面、关卡过渡界面、调优面板。

### 11. `input.js` — 输入模块
键盘（WASD + 空格）、鼠标（移动 + 点击）、触摸事件监听，导出 `keys`、`mousePos`、`isMouseDown`。

### 12. `levels.js` — 关卡系统
关卡配置（第一关"测试关"：10黄+5绿；第二关"boss来了"：5黄+10绿+1BOSS）、关卡切换、敌人生成调度。

### 13. `game.js` — 游戏主循环
`startGame`、`gameOver`、`winGame`、`update`、`gameLoop`，协调所有模块。

### 14. `main.js` — 入口
导入所有模块，初始化并启动游戏。

## 目录结构

```
plane-war/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── images/.gitkeep
│   └── sounds/.gitkeep
├── src/
│   ├── main.js
│   ├── config.js
│   ├── audio.js
│   ├── player.js
│   ├── enemies.js
│   ├── boss.js
│   ├── powerups.js
│   ├── particles.js
│   ├── collision.js
│   ├── renderer.js
│   ├── ui.js
│   ├── input.js
│   ├── levels.js
│   └── game.js
└── README.md
```

## 是否有原型设计

否

## 实施步骤

1. **清理旧项目，初始化纯 JS + Vite 项目** — 删除旧 src/、server/、scripts/、TypeScript 配置，创建新的 package.json、vite.config.js、index.html、.coze
2. **创建 config.js 和 audio.js 基础模块** — 配置常量、音频管理骨架
3. **创建 player.js、enemies.js、boss.js 游戏实体模块** — 玩家、普通敌人、BOSS 的完整逻辑
4. **创建 particles.js、collision.js、renderer.js 效果与渲染模块** — 粒子系统、碰撞检测、所有绘制函数
5. **创建 input.js、ui.js、levels.js 交互与系统模块** — 输入处理、UI 更新、关卡调度
6. **创建 game.js 和 main.js 入口，组装完整游戏** — 游戏主循环、启动入口
7. **测试验证并生成 README.md** — 静态检查、功能验证、文档
