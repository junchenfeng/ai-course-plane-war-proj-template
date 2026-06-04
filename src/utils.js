// 工具函数
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function normalizeVelocity(v) {
  const mag = Math.sqrt(v.vx ** 2 + v.vy ** 2);
  if (mag === 0) return { vx: 0, vy: 0 };
  return { vx: v.vx / mag, vy: v.vy / mag };
}

export function calculateDirection(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return normalizeVelocity({ vx: dx, vy: dy });
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function circleCollision(pos1, size1, pos2, size2) {
  return distance(pos1, pos2) < size1 + size2;
}

export function randomColor() {
  const colors = ['#ff4444', '#ff8844', '#ffff44', '#44ff44', '#44ffff', '#4444ff', '#ff44ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}
