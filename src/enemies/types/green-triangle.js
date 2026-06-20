// 绿色三角敌人 — 行为片段库组合示例（中等复杂度）
// 演示如何用 behaviors/ 库快速拼装：
//   行为：sine 摆动 + 下落
//   射击：扇形散射
//   渲染：三角 + 内部高亮
import { BaseEnemy } from '../base.js';
import { sine } from '../behaviors/movement.js';
import { spread } from '../behaviors/shooting.js';
import { triangle } from '../behaviors/render.js';

class GreenTriangleEnemy extends BaseEnemy {
  // 使用行为片段：sine(下落速度, 摆幅, 频率)
  _onUpdate = sine(0.8, 30, 0.05);

  // 使用行为片段：spread(子弹数, 角度间隔°, 速度, 颜色)
  _onShoot = spread(3, 25, 4, '#44ff88');

  // 自定义射击冷却：shootInterval 设的冷却 → 调成 2 秒
  // 在 ENEMY_CONFIGS 中配置
}

export default {
  type: 'green_triangle',
  class: GreenTriangleEnemy,
  onRender: triangle('#44ff44'),
};
