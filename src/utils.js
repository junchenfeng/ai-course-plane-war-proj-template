// 工具函数
/* global fetch, createImageBitmap */

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

/**
 * RGB 转 HSV
 * @param {number} r - 红色分量 (0-255)
 * @param {number} g - 绿色分量 (0-255)
 * @param {number} b - 蓝色分量 (0-255)
 * @returns {{h: number, s: number, v: number}} HSV 值 (h: 0-360, s: 0-1, v: 0-1)
 */
export function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (d !== 0) {
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / d + 2) * 60;
    } else {
      h = ((r - g) / d + 4) * 60;
    }
  }

  return { h, s, v };
}

/**
 * 检测颜色是否为绿色（基于 HSV）
 * @param {number} h - 色相 (0-360)
 * @param {number} s - 饱和度 (0-1)
 * @param {number} v - 明度 (0-1)
 * @returns {boolean}
 */
export function isGreenColor(h, s, v) {
  // 绿色的色相范围: 60deg - 180deg（包含黄绿、绿、青绿）
  // 需要有一定饱和度和明度才算绿色背景
  return h >= 60 && h <= 180 && s >= 0.15 && v >= 0.15;
}

/**
 * 使用 HSV 色彩空间去除图片背景（针对绿色背景）
 * @param {ImageBitmap|HTMLImageElement} image - 原始图片
 * @returns {{canvas: HTMLCanvasElement, isGreenBackground: boolean}} 处理后的 canvas 和背景检测结果
 */
export function removeBackgroundWithHsv(image) {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');

  // 绘制原始图片
  ctx.drawImage(image, 0, 0);

  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 检测背景色是否为绿色
  let greenPixelCount = 0;
  let totalCheckedPixels = 0;

  // 只检查边缘像素来判断背景色
  const edgePixels = [];
  const w = canvas.width;
  const h = canvas.height;

  // 四条边
  for (let x = 0; x < w; x++) {
    edgePixels.push([x, 0]); // 顶边
    edgePixels.push([x, h - 1]); // 底边
  }
  for (let y = 0; y < h; y++) {
    edgePixels.push([0, y]); // 左边
    edgePixels.push([w - 1, y]); // 右边
  }

  // 检查边缘像素
  for (const [x, y] of edgePixels) {
    const idx = (y * w + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const hsv = rgbToHsv(r, g, b);
    totalCheckedPixels++;
    if (isGreenColor(hsv.h, hsv.s, hsv.v)) {
      greenPixelCount++;
    }
  }

  // 如果边缘超过 30% 是绿色，判定为绿色背景
  const isGreenBackground = greenPixelCount / totalCheckedPixels > 0.3;

  // 遍历所有像素，去除绿色背景
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const hsv = rgbToHsv(r, g, b);

    if (isGreenColor(hsv.h, hsv.s, hsv.v)) {
      // 将绿色背景设为透明
      data[i + 3] = 0;
    }
  }

  // 写回处理后的像素数据
  ctx.putImageData(imageData, 0, 0);

  return { canvas, isGreenBackground };
}

/**
 * 加载图片并创建去背景后的贴图
 * @param {string} src - 图片路径
 * @returns {Promise<{canvas: HTMLCanvasElement, isGreenBackground: boolean}>}
 */
export async function loadAndProcessImage(src) {
  const response = await fetch(src);
  const blob = await response.blob();
  const image = await createImageBitmap(blob);
  return removeBackgroundWithHsv(image);
}
