# 道具系统调整计划

## 概述

暂时屏蔽炸弹和血包道具的掉落与显示，仅保留散弹道具，同时将道具掉率从 25% 提升至 33%。

## 技术方案

| 维度 | 选择 | 理由 |
|------|------|------|
| 掉率调整 | `POWERUP_DROP_RATE` 改为 0.33 | 配置集中管理，改一处全局生效 |
| 屏蔽炸弹/血包 | `spawnPowerUp()` 中 types 数组仅保留 SPREAD | 最小改动，后续恢复只需加回数组元素 |
| UI 隐藏 | 移除 `index.html` 中炸弹指示器 | 炸弹不掉落则指示器无意义 |

## 功能模块

### 道具掉落（powerups.js）
- `spawnPowerUp()`：types 数组从 `[SPREAD, BOMB, HEART]` 改为 `[SPREAD]`
- 炸弹和血包不再生成，自然也不显示

### 配置（config.js）
- `POWERUP_DROP_RATE`：`0.25` → `0.33`

### UI（index.html）
- 移除 `#bomb-indicator` 元素（炸弹不掉落，指示器无存在必要）
- 移除操作说明中炸弹相关行

## 是否有原型设计

否（属于小功能迭代，无需原型设计）

## 实施步骤

1. 修改 `config.js`：将 `POWERUP_DROP_RATE` 从 0.25 改为 0.33
2. 修改 `powerups.js`：`spawnPowerUp()` 中 types 数组仅保留 SPREAD
3. 修改 `index.html`：移除炸弹指示器 DOM 和操作说明中的炸弹行
4. 执行代码检查与验证
