# 飞机大战

纯 JavaScript + Vite 原生飞机大战游戏。

## 运行方式

```bash
pnpm install
pnpm run dev
```

浏览器访问 `http://localhost:5000`

## 操作说明

- **键盘**：WASD 移动，空格射击
- **鼠标**：滑动移动，左键点击射击

## 游戏规则

- 主角机 5HP，显示为 5 颗 ♥，扣到 0 游戏结束
- 三种敌人：
  - 黄色圆形（2HP）：向下发子弹，死亡爆炸效果
  - 绿色箭头（1HP）：追踪玩家，死亡闪烁效果
  - 红色六边形 Boss（20HP）：追踪子弹连发，死亡彩色粒子爆炸
- 两关：测试关（10黄+5绿）、boss来了（5黄+10绿+1Boss）
- 碰撞各扣 1HP

## 项目结构

```
plane-war/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── images/
│   └── sounds/
└── src/
    ├── main.js        # 入口
    ├── config.js      # 配置常量
    ├── audio.js       # 音频管理
    ├── player.js      # 玩家 + 子弹
    ├── enemies.js     # 普通敌人
    ├── boss.js        # Boss
    ├── particles.js   # 粒子特效
    ├── collision.js   # 碰撞检测
    ├── renderer.js    # 渲染绘制
    ├── input.js       # 输入处理
    ├── ui.js          # UI 更新
    ├── levels.js      # 关卡系统
    ├── game.js        # 游戏主循环
    ├── utils.js       # 工具函数
    └── style.css      # 样式
```
