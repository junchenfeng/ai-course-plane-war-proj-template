// 敌人注册中心
// 通过 Vite 的 import.meta.glob 自动扫描 types/ 目录
// 加新文件即自动注册
import { BaseEnemy } from './base.js';

const modules = import.meta.glob('./types/*.js', { eager: true });

/**
 * EnemyRegistry: type -> { type, class, ... }
 * class 必须继承 BaseEnemy
 */
const ENEMY_REGISTRY = new Map();

for (const path in modules) {
  const mod = modules[path];
  if (mod.default && mod.default.type) {
    ENEMY_REGISTRY.set(mod.default.type, mod.default);
  }
}

/**
 * 创建指定类型的敌人实例
 */
export function createEnemy(type, startX) {
  const entry = ENEMY_REGISTRY.get(type);
  if (!entry) {
    console.warn(`未注册的敌人类型: ${type}`);
    return null;
  }
  return new entry.class(type, startX);
}

export { BaseEnemy, ENEMY_REGISTRY };
