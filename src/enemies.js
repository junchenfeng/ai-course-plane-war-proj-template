// 敌人模块入口（向后兼容层）
// 新代码推荐直接用：import { createEnemy } from './enemies/index.js'
// 本文件保留 Enemy 类的别名，方便现有代码 (levels.js / collision.js) 继续使用
export { createEnemy, BaseEnemy, ENEMY_REGISTRY } from './enemies/index.js';

import { createEnemy } from './enemies/index.js';

// 保留旧 API：默认敌人类型
export class Enemy {
  constructor(type, startX) {
    const inst = createEnemy(type, startX);
    if (!inst) throw new Error(`无法创建敌人: ${type}`);
    // 浅拷贝属性到 this，保持向后兼容
    Object.assign(this, inst);
    // 但 update / takeDamage 方法仍然走原始实例的原型
    // 因此把方法重新绑定到当前 this
    this.update = inst.update.bind(inst);
    this.takeDamage = inst.takeDamage.bind(inst);
  }
}
