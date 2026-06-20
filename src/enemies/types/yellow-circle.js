// 黄色圆敌人（最简单：配置式）
// 这是 children 二创的入门模板
// 复制此文件 → 改 type 名字 → 在 config.js ENEMY_CONFIGS 加一条 → 完成！
import { BaseEnemy } from '../base.js';
import { circleWithInner } from '../behaviors/render.js';

// 不写任何钩子 → 使用基类默认行为（ENEMY_CONFIGS 中配置：fallSpeed + 射击）
class YellowCircleEnemy extends BaseEnemy {}

export default {
  type: 'yellow_circle',
  class: YellowCircleEnemy,
  onRender: circleWithInner('#ffcc00', '#ffdd44'),
};
