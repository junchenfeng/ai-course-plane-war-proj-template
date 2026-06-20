# 添加新道具教程 🎁

> 跟添加新敌人一样简单，跟着抄就能加新道具！

## 🎯 目标

添加一个"护盾"道具：捡到后按 **数字 2** 激活，主角周围出现一圈**蓝色护盾**持续 5 秒。

---

## 📝 步骤 1：复制模板文件

复制 `src/powerups/types/heart.js`，重命名为 `src/powerups/types/shield.js`。

---

## ✏️ 步骤 2：定义道具

打开 `shield.js`：

```js
import { BasePowerUp } from '../base.js';
import { Bullet } from '../../player.js';

class ShieldPowerUp extends BasePowerUp {
  constructor() {
    super('shield');
  }

  // 拾取瞬间：什么都不做，等玩家激活
  onPickup(_player) {}

  // 激活：开护盾
  onActivate(player) {
    player.shieldActive = true;
    player.shieldTimer = 5000;  // 5 秒
  }

  // 持续型：每帧检查
  onUpdate(player, dt) {
    if (player.shieldActive) {
      player.shieldTimer -= dt;
      if (player.shieldTimer <= 0) {
        player.shieldActive = false;
        return false;  // 通知系统从背包扣减
      }
    }
    return true;
  }

  // 在主角周围画护盾
  onRender(ctx, player) {
    if (!player.shieldActive) return;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 25, 0, Math.PI * 2);
    ctx.strokeStyle = '#44ffff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

export default {
  type: 'shield',
  class: ShieldPowerUp,
  name: '护盾',
  color: '#44ffff',
  icon: '🛡️',
  label: 'D',
  hotkey: '2',                 // ← 接替原炸弹的数字 2
  indicatorId: 'shield-indicator',
  description: '5 秒内免疫一次伤害',
  duration: 5000,
  dropWeight: 1,
  maxInventory: 1,
  isActivable: true,
};
```

---

## ⚙️ 步骤 3：在配置表登记

打开 `src/config.js`：

```js
// 1) 加到 PowerUpType
export const PowerUpType = {
  SPREAD: 'spread',
  HEART: 'heart',
  SHIELD: 'shield',       // ← 加这一行
};

// 2) 加到 POWERUP_CONFIGS
export const POWERUP_CONFIGS = {
  // ... 其他道具 ...
  [PowerUpType.SHIELD]: {     // ← 加这个 block
    type: PowerUpType.SHIELD,
    name: '护盾',
    color: '#44ffff',
    label: 'D',
    hotkey: '2',
    indicatorId: 'shield-indicator',
    description: '5 秒内免疫一次伤害',
    duration: 5000,
    dropWeight: 1,
    maxInventory: 1,
    isActivable: true,
  },
};
```

---

## 🎨 步骤 4：在 HTML 加指示器

打开 `index.html`，在散弹指示器后面加：

```html
<div id="shield-indicator" class="powerup-indicator">
  <span class="powerup-key">2</span>
  <span class="powerup-label">护盾</span>
</div>
```

---

## 🎉 完成！

刷新浏览器。掉落护盾后按 **数字 2** 激活，主角周围会出现蓝色圈！

---

## 🧩 三种道具类型

### 1️⃣ 瞬间型（拾取即生效）
例：生命 (heart) — 捡到加 1 HP

```js
class MyConsumable extends BasePowerUp {
  onPickup(player) {
    player.hp = Math.min(player.hp + 1, player.maxHp);
  }
  // onActivate 不需要
}

export default {
  type: 'my_consumable',
  class: MyConsumable,
  hotkey: '',                // 没有热键
  indicatorId: '',           // 没有指示器
  isActivable: false,
  maxInventory: 0,
};
```

### 2️⃣ 持续型（按热键激活 + 持续时间）
例：散弹 (spread) — 按 1 持续 5 秒

```js
class MySustained extends BasePowerUp {
  onActivate(player) {
    player.myActive = true;
    player.myTimer = 5000;
  }

  onUpdate(player, dt) {
    if (player.myActive) {
      player.myTimer -= dt;
      // 持续期间的逻辑...
      if (player.myTimer <= 0) {
        player.myActive = false;
        return false;
      }
    }
    return true;
  }
}
```

### 3️⃣ 切换型（按一次开，按一次关）
例：护盾 (shield) — 按 2 开，再按 2 关

```js
class MyToggle extends BasePowerUp {
  onActivate(player) {
    player.myActive = !player.myActive;  // 翻转
  }
  // onUpdate 可以不写
}
```

---

## 🔑 热键分配规则

| 数字键 | 现有 | 备注 |
|--------|------|------|
| `1` | 散弹 | 已占用 |
| `2` | _空闲_ | 给新道具用 |
| `3`, `4`... | 空闲 | 按顺序 |

要占用哪个热键，就在道具配置里写 `hotkey: '3'` 等。

---

## ❓ 遇到问题？

- **按数字键不响应** → 检查 `hotkey` 字段和 `input.js` 是否识别
- **道具没掉下来** → 检查 `POWERUP_DROP_RATE`（在 `CONFIG` 里，默认 0.66）
- **背包满了不捡** → 调高 `maxInventory` 字段
- **激活后没效果** → 检查 `onActivate` 是否设置了玩家属性，且 `onUpdate` 中是否处理
