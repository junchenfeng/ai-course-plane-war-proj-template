// 敌人注册中心
// 通过 Vite 的 import.meta.glob 自动扫描 types/ 目录
// 加新文件即自动注册
import { BaseEnemy } from './base.js';
import { EnemyType } from '../config.js';

const modules = import.meta.glob('./types/*.js', { eager: true });

/**
 * EnemyRegistry: type -> { type, class, onRender?, onInit? ... }
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

/**
 * 创建 BOSS 敌人（默认 EnemyType.RED_BOSS）
 */
export function createBoss(type = EnemyType.RED_BOSS) {
  return createEnemy(type);
}

export { BaseEnemy, ENEMY_REGISTRY };
