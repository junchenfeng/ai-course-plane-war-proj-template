// 移动行为片段库
// 全部返回 (enemy, player, dt) => void 钩子
// 复杂敌人可通过多个 moveXxx 组合

/** 直线下落（默认行为） */
export const straight = (speed) => (e, _p, _dt) => {
  e.y += speed;
};

/** 追踪玩家（朝玩家位置移动） */
export const tracking = (speed) => (e, p, _dt) => {
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const dist = Math.hypot(dx, dy) || 1;
  e.x += (dx / dist) * speed;
  e.y += (dy / dist) * speed;
};

/** 正弦摆动（配合直线下落） */
export const sine = (vy, amplitude, freq) => (e, _p, _dt) => {
  e.y += vy;
  e.x = (e._originX ?? (e._originX = e.x)) + Math.sin(e.y * freq) * amplitude;
};

/** 之字形（左右摆动 + 下落） */
export const zigzag = (vy, amplitude) => (e, _p, _dt) => {
  e.y += vy;
  e.x = (e._originX ?? (e._originX = e.x)) + Math.sin(e.y * 0.05) * amplitude;
};

/** 静止（不移动） */
export const staticMove = () => () => {};

/** 飞行到目标 Y 后悬停 */
export const hover = (targetY, vy) => (e, _p, _dt) => {
  if (e.y < targetY) e.y += vy;
};
