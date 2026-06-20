// 道具注册中心
// 通过 Vite 的 import.meta.glob 自动扫描 types/ 目录下所有 .js 文件
// 每个文件需 export default 一个 { type, class, ... } 配置对象
// 加新文件即自动注册，无需修改本文件
import { BasePowerUp } from './base.js';

const modules = import.meta.glob('./types/*.js', { eager: true });

/**
 * PowerUpRegistry: type -> { type, class, ... }
 * class 必须继承 BasePowerUp
 */
const POWERUP_REGISTRY = new Map();

for (const path in modules) {
  const mod = modules[path];
  if (mod.default && mod.default.type) {
    POWERUP_REGISTRY.set(mod.default.type, mod.default);
  }
}

/**
 * 创建指定类型的道具实例
 */
export function createPowerUp(type, x, y) {
  const entry = POWERUP_REGISTRY.get(type);
  if (!entry) {
    console.warn(`未注册的道具类型: ${type}`);
    return null;
  }
  return new entry.class(type, x, y);
}

export { BasePowerUp, POWERUP_REGISTRY };
