// 敌人模块入口
// 推荐用法：import { createEnemy } from './enemies/index.js'
// 本文件保留 Enemy 类（=createEnemy 的薄包装），方便现有代码 (levels.js / collision.js) 继续使用
export { createEnemy, BaseEnemy, ENEMY_REGISTRY } from './enemies/index.js';

import { createEnemy } from './enemies/index.js';

export class Enemy {
  constructor(type, startX) {
    const inst = createEnemy(type, startX);
    if (!inst) throw new Error(`无法创建敌人: ${type}`);
    // 把原型方法也复制到 this 上（兼容历史代码直接当 plain object 用）
    Object.assign(this, inst);
    this.update = inst.update.bind(inst);
    this.takeDamage = inst.takeDamage.bind(inst);
    this.isAlive = inst.isAlive.bind(inst);
  }
}
