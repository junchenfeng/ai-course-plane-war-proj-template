// BOSS 模块 — 兼容层
// 实际实现已迁移到 src/enemies/types/red-boss.js（继承 BaseEnemy）
// 本文件保留 Boss 类名以维持向后兼容，新代码请直接用 createEnemy(EnemyType.RED_BOSS)
import { createEnemy } from './enemies/index.js';
import { EnemyType } from './config.js';

export class Boss {
  constructor() {
    // 委托给统一的敌人创建器
    const inst = createEnemy(EnemyType.RED_BOSS);
    if (!inst) throw new Error('无法创建 BOSS: red_boss 未注册');
    // 浅拷贝所有 own 属性
    Object.assign(this, inst);
    // 遍历原型链，把所有方法显式绑定到 this
    let proto = Object.getPrototypeOf(inst);
    while (proto && proto !== Object.prototype) {
      for (const name of Object.getOwnPropertyNames(proto)) {
        if (name === 'constructor') continue;
        if (typeof inst[name] === 'function' && this[name] === undefined) {
          this[name] = inst[name].bind(inst);
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
  }
}
