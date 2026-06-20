# 添加新敌人教程 🎮

> 适合 8 岁以上小朋友 👶 — 整个过程不需要懂复杂编程，跟着抄就能加新敌人！

## 🎯 目标

让玩家能玩到"紫色星星敌人"，它会**左右摆动下落**，每 3 秒发射**散射子弹**。

---

## 📝 步骤 1：复制模板文件

复制 `src/enemies/types/yellow-circle.js`，重命名为 `src/enemies/types/purple-star.js`。

---

## ✏️ 步骤 2：改三处名字

打开 `purple-star.js`，把 4 处 `yellow_circle` 改成 `purple_star`：

```js
// 改前：
type: 'yellow_circle',

// 改后：
type: 'purple_star',
```

---

## 🎨 步骤 3：换外观和行为

找到这一段，改成"用 star 渲染"：

```js
import { BaseEnemy } from '../base.js';
import { star } from '../behaviors/render.js';  // ← 改成 star

class PurpleStarEnemy extends BaseEnemy {}

export default {
  type: 'purple_star',
  class: PurpleStarEnemy,
  onRender: star(5, 1, 0.4, '#aa44ff'),  // ← 5 角星，颜色紫色
};
```

---

## 🎮 步骤 4：加行为（可选）

如果想让敌人**左右摆动**，加上 `sine`：

```js
import { BaseEnemy } from '../base.js';
import { sine } from '../behaviors/movement.js';  // ← 摆动
import { star } from '../behaviors/render.js';

class PurpleStarEnemy extends BaseEnemy {
  _onUpdate = sine(0.8, 40, 0.05);  // ← 下落速度0.8，摆幅40
}

export default {
  type: 'purple_star',
  class: PurpleStarEnemy,
  onRender: star(5, 1, 0.4, '#aa44ff'),
};
```

---

## ⚙️ 步骤 5：在配置表登记

打开 `src/config.js`：

```js
// 1) 加到 EnemyType
export const EnemyType = {
  YELLOW_CIRCLE: 'yellow_circle',
  GREEN_TRIANGLE: 'green_triangle',
  RED_BOSS: 'red_boss',
  PURPLE_STAR: 'purple_star',       // ← 加这一行
};

// 2) 加到 ENEMY_CONFIGS
export const ENEMY_CONFIGS = {
  // ... 其他敌人 ...
  [EnemyType.PURPLE_STAR]: {        // ← 加这个 block
    hp: 2,                          // 血量
    size: 25,                       // 大小
    score: 20,                      // 打中得多少分
    fallSpeed: 0,                   // 0=用自定义移动
    shootInterval: 3000,            // 几毫秒射一次（3000=3 秒）
    shootColor: '#aa44ff',          // 子弹颜色
    color: '#aa44ff',               // 敌人颜色
    deathEffect: 'explosion',       // 死亡特效
  },
};
```

---

## 🎉 完成！

保存后浏览器会自动刷新，你应该能看到紫色星形敌人在天上摆动了！

要在关卡中放它，修改 `src/levels.js`：

```js
this.enemiesToSpawn = [
  EnemyType.PURPLE_STAR,
  EnemyType.YELLOW_CIRCLE,
  EnemyType.PURPLE_STAR,
];
```

---

## 🧩 行为片段库速查表

打开 `src/enemies/behaviors/` 看完整代码：

### 移动 movement.js
| 名字 | 效果 | 例子 |
|------|------|------|
| `straight(speed)` | 直线下落 | `straight(1.5)` |
| `tracking(speed)` | 追着玩家跑 | `tracking(0.8)` |
| `sine(vy, 幅, 频率)` | 摆动 | `sine(1, 30, 0.05)` |
| `zigzag(vy, 幅)` | 之字形 | `zigzag(1, 50)` |
| `hover(目标Y, vy)` | 飞到位置悬停 | `hover(100, 0.5)` |
| `staticMove()` | 不动 | `staticMove()` |

### 射击 shooting.js
| 名字 | 效果 | 例子 |
|------|------|------|
| `down(倍速, 颜色)` | 向下 | `down(0.5, '#ff0')` |
| `aimed(速度, 颜色)` | 瞄准玩家 | `aimed(5, '#f00')` |
| `ring(数量, 速度, 颜色)` | 环形散射 | `ring(8, 4, '#fa0')` |
| `spread(数量, 角度°, 速度, 颜色)` | 扇形 | `spread(5, 20, 4, '#0f0')` |

### 渲染 render.js
| 名字 | 效果 | 例子 |
|------|------|------|
| `circle(色)` | 圆 | `circle('#ff0')` |
| `circleWithInner(外, 内)` | 圆+装饰圆 | `circleWithInner('#fc0', '#fd4')` |
| `triangle(色)` | 三角 | `triangle('#0f0')` |
| `polygon(边数, 色)` | 多边形 | `polygon(6, '#f00')` |
| `star(角数, 外, 内, 色)` | 星形 | `star(5, 1, 0.4, '#fa0')` |

---

## 🚀 进阶：自定义复杂敌人

如果行为片段不够用，可以**重写**钩子函数：

```js
class MyBoss extends BaseEnemy {
  // 完全自定义移动
  _onUpdate(enemy, player, dt) {
    enemy.y += 0.3;       // 慢慢下落
    enemy.x = player.x;   // 跟着玩家走
  }

  // 自定义射击
  _onShootTick(enemy, player, dt) {
    enemy.shootCooldown = (enemy.shootCooldown || 0) - dt;
    if (enemy.shootCooldown <= 0) {
      enemy.shootCooldown = 1000;  // 1 秒一次
      // 发射 10 发环形
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 * i) / 10;
        enemy.bullets.push(new Bullet(
          enemy.x, enemy.y,
          Math.cos(a) * 3, Math.sin(a) * 3,
          BulletOwner.ENEMY, '#ff0'
        ));
      }
    }
  }

  // 自定义死亡动画
  _onDying(enemy, dt) {
    enemy.size += 0.5;  // 越死越大
  }
}
```

需要用 `Bullet` 类时，记得在文件顶部导入：
```js
import { Bullet } from '../../player.js';
import { BulletOwner } from '../../config.js';
```

---

## ❓ 遇到问题？

- **敌人没出现** → 检查 `config.js` 的 `EnemyType` 和 `ENEMY_CONFIGS` 名字是否一致
- **行为没生效** → 钩子前面要加下划线 `_onUpdate` / `_onShootTick`
- **敌人飞到屏幕外** → 用 `enemy.active = false` 把它关掉
- **想让敌人更猛** → 提高 `hp` 和 `score`，降低 `shootInterval`
