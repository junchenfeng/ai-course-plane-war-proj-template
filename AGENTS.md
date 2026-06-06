# 项目上下文

## 技术栈

- **核心**: Vite 6, 纯 JavaScript (ES Module)
- **样式**: 原生 CSS

## 目录结构

```
├── index.html              # HTML 结构和 DOM 元素
├── package.json            # 依赖只有 vite
├── vite.config.js          # Vite 基础配置
├── proj_assets/            # 项目预存资源
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

// 加载并处理图片
const result = await loadAndProcessImage('/images/xxx.webp');

// result.canvas 是去背景后的 HTMLCanvasElement，可直接用于 drawImage
// result.isGreenBackground 表示边缘是否检测到绿色背景
if (!result.isGreenBackground) {
  console.warn('背景色不是绿色，HSV 算法可能失效，建议重新生成绿色背景的图片');
}

// 将处理后的贴图设置到渲染器
renderer.setPlayerTexture(result.canvas);
```

**恢复贴图挂载**：在 `game.js` 中取消注释以下内容：
1. `import { loadAndProcessImage } from './utils.js';`
2. 构造函数中的 `this._loadPlayerTexture();`
3. `_loadPlayerTexture()` 方法体

## BGM 背景音乐

**所在位置**：`src/audio.js`

**核心函数**：

| 函数 | 用途 |
|------|------|
| `initBGM()` | 初始化 BGM（创建 Audio 元素，加载 `/sounds/bgm.mp3`） |
| `playBGM()` | 播放 BGM（循环） |
| `pauseBGM()` | 暂停 BGM |
| `stopBGM()` | 停止并重置 BGM |
| `toggleBGM()` | 切换开关，返回当前状态 |
| `isBGMEnabled()` | 获取当前开关状态 |
| `setBGMVolume(volume)` | 设置音量 (0-1) |

**恢复 BGM 自动播放**：在 `game.js` 的 `startGame()` 中取消注释 `playBGM();`


## 图片生成规范
- 当用户使用genrate_images的工具或者要求生成图片后，将图片下载到本项目的`tmp`文件夹下，并在对话中提供预览