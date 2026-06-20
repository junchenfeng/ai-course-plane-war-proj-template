// 渲染片段库
// 钩子签名：(ctx, enemy) => void — enemy 已 translate 到中心
// 复杂敌人可自定义整个渲染函数

/** 圆（最常用） */
export const circle = (color) => (ctx, e) => {
  ctx.beginPath();
  ctx.arc(0, 0, e.size, 0, Math.PI * 2);
  ctx.fillStyle = color ?? e.color ?? '#ffff00';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
};

/** 圆 + 内部装饰圆（黄色圆敌人风格） */
export const circleWithInner = (color, innerColor) => (ctx, e) => {
  ctx.beginPath();
  ctx.arc(0, 0, e.size, 0, Math.PI * 2);
  ctx.fillStyle = color ?? e.color ?? '#ffcc00';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, e.size * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = innerColor ?? '#ffdd44';
  ctx.fill();
  ctx.shadowBlur = 0;
};

/** 等边三角形 */
export const triangle = (color) => (ctx, e) => {
  const r = e.size;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.lineTo(r * 0.866, r * 0.5);
  ctx.lineTo(-r * 0.866, r * 0.5);
  ctx.closePath();
  ctx.fillStyle = color ?? e.color ?? '#44ff44';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 8;
  ctx.fill();
  ctx.shadowBlur = 0;
};

/** 正多边形 */
export const polygon = (sides, color) => (ctx, e) => {
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const x = Math.cos(angle) * e.size;
    const y = Math.sin(angle) * e.size;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color ?? e.color ?? '#ff4444';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 12;
  ctx.fill();
  ctx.shadowBlur = 0;
};

/** 星形 */
export const star = (points, outer, inner, color) => (ctx, e) => {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (Math.PI * 2 * i) / (points * 2) - Math.PI / 2;
    const x = Math.cos(angle) * e.size * r;
    const y = Math.sin(angle) * e.size * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = color ?? e.color ?? '#ffdd00';
  ctx.shadowColor = ctx.fillStyle;
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
};
