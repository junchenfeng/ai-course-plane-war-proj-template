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
    // 浅拷贝属性 + 方法绑定
    for (const key of Object.keys(inst)) {
      this[key] = inst[key];
    }
    this.update = inst.update.bind(inst);
    this.takeDamage = inst.takeDamage.bind(inst);
    this.isAlive = inst.isAlive.bind(inst);
  }
}
