# 项目上下文

## 技术栈

- **核心**: Vite 6, 纯 JavaScript (ES Module)
- **样式**: 原生 CSS

## 目录结构

```
├── index.html              # HTML 结构和 DOM 元素
├── package.json            # 依赖只有 vite
├── vite.config.js          # Vite 基础配置
├── public/
│   ├── images/             # 图片资源目录
│   └── sounds/             # 音频资源目录
├── src/
│   ├── main.js             # 入口，导入所有模块并启动游戏
│   ├── config.js           # 导出 CONFIG、EnemyType、BulletOwner
│   ├── audio.js            # audioCtx 创建、音效播放
│   ├── player.js           # 玩家创建、移动、射击逻辑 + Bullet 类
│   ├── enemies.js          # 敌机生成、更新、射击逻辑
│   ├── boss.js             # BOSS 生成、移动、射击、死亡逻辑
│   ├── particles.js        # 粒子创建、更新逻辑
│   ├── collision.js        # 所有碰撞检测
│   ├── renderer.js         # draw() 函数：星空、玩家、敌机、BOSS、子弹、粒子
│   ├── ui.js               # updateUI、关卡显示更新
│   ├── input.js            # 键盘、鼠标事件监听
│   ├── levels.js           # 关卡系统：敌人生成、关卡切换
│   ├── game.js             # 游戏主循环
│   ├── utils.js            # 工具函数
│   └── style.css           # 全局样式
└── README.md
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。

## 开发规范

- 纯 JavaScript ES Module，无 TypeScript
- 使用原生 CSS 进行样式开发
- 游戏使用 Canvas 2D API 渲染
- 所有模块通过 ES import/export 组织

## 文档维护规范

- 修改代码后，必须检查 `docs/` 目录下的文档是否需要同步更新
- 涉及关卡、道具、数值变动的，必须同步更新对应的 `.md` 文件
- 若文档无需更新，需在提交信息或回复中明确说明

## 素材规范

- 图片素材必须使用 `.webp` 文件格式
- 单张图片大小不得超过 200KB，超限时必须进行压缩或格式转换

## 临时文件规范

- 用户生成或上传的内容统一放到 `tmp/` 目录下
- `tmp/` 已加入 `.gitignore`，不会被提交到版本控制
