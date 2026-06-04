// 工具函数

import { Position, Velocity } from './types';

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function distance(a: Position, b: Position): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function normalizeVelocity(v: Velocity): Velocity {
  const magnitude = Math.sqrt(v.vx ** 2 + v.vy ** 2);
  if (magnitude === 0) return { vx: 0, vy: 0 };
  return {
    vx: v.vx / magnitude,
    vy: v.vy / magnitude
  };
}

export function calculateDirection(from: Position, to: Position): Velocity {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  return normalizeVelocity({ vx: dx, vy: dy });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function circleCollision(
  pos1: Position,
  size1: number,
  pos2: Position,
  size2: number
): boolean {
  return distance(pos1, pos2) < size1 + size2;
}

export function randomColor(): string {
  const colors = ['#ff4444', '#ff8844', '#ffff44', '#44ff44', '#44ffff', '#4444ff', '#ff44ff'];
  return colors[Math.floor(Math.random() * colors.length)];
}