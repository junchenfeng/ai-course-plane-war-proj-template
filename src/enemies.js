// 敌人模块入口（向后兼容层）
// 新代码推荐直接用：import { createEnemy } from './enemies/index.js'
// 本文件保留 Enemy 类的别名，方便现有代码 (levels.js / collision.js) 继续使用
export { createEnemy, BaseEnemy, ENEMY_REGISTRY } from './enemies/index.js';
import { createEnemy, ENEMY_REGISTRY } from './enemies/index.js';

/**
 * 向后兼容的 Enemy 类：内部用 createEnemy 委托，但对外提供
 * `new Enemy(type, x)` 同样的实例化语义
 */
export class Enemy {
  constructor(type, startX) {
    const inst = createEnemy(type, startX);
    if (!inst) throw new Error(`无法创建敌人: ${type}`);

    // 浅拷贝所有 own 属性（包括构造时设置的字段）
    Object.assign(this, inst);

    // 把原型链上的方法（包括 BaseEnemy.isAlive / update / takeDamage
    // 以及子类定义的钩子）全部显式绑定到 this，避免原型方法丢失
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
