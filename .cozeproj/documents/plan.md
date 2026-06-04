# 计划：将赛博朋克战机作为主角机素材

## 概述
将用户选择的赛博朋克风格太空战机图片作为游戏主角机素材，替换当前 Canvas 几何绘制的三角形战机，涉及图片下载、格式转换和渲染逻辑修改。

## 技术方案

| 维度 | 选择 | 理由 |
|------|------|------|
| 图片格式 | WebP | 符合项目素材规范，体积小、质量高 |
| 渲染方式 | Canvas drawImage | 替换现有几何绘制，保持渲染框架不变 |
| 图片加载 | 预加载到 Renderer | 避免每帧重复加载，提升性能 |

## 功能模块

### 1. 图片素材处理
- 下载赛博朋克战机图片
- 转换为 WebP 格式（单张 ≤200KB）
- 保存到 `public/images/player.webp`

### 2. Renderer 图片加载
- 在 `Renderer` 类中添加 `playerImage` 属性
- 构造时预加载图片，等待加载完成后再渲染

### 3. drawPlayer 方法改造
- 移除现有三角形几何绘制代码
- 使用 `ctx.drawImage()` 绘制战机图片
- 处理无敌状态（闪烁/半透明效果）
- 调整图片尺寸以适配 `CONFIG.PLAYER_SIZE`

## 数据结构

```javascript
// Renderer 类新增属性
this.playerImage = null;        // 玩家战机图片
this.playerImageLoaded = false; // 加载状态标记

// 图片渲染参数（示例）
const imgSize = CONFIG.PLAYER_SIZE * 2;  // 图片渲染尺寸
ctx.drawImage(this.playerImage, -imgSize/2, -imgSize/2, imgSize, imgSize);
```

## 是否有原型设计
否（素材替换任务，不涉及 UI 页面改动）

## 实施步骤

1. 下载赛博朋克战机图片并转换为 WebP 格式，保存到 `public/images/player.webp`
2. 修改 `rende