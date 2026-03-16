/// <reference types="minigame-api-typings" />

/**
 * 游戏主入口
 * 2.5D横屏微信小游戏 - 类拳皇对战
 */

// 获取canvas上下文
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 屏幕尺寸
const { windowWidth, windowHeight } = wx.getSystemInfoSync();

// 游戏状态
let lastTime = 0;

/**
 * 游戏主循环
 */
function gameLoop(timestamp: number): void {
  lastTime = timestamp;

  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制提示文字
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('游戏加载完成', canvas.width / 2, canvas.height / 2);
  ctx.font = '16px Arial';
  ctx.fillText('2.5D横屏对战游戏', canvas.width / 2, canvas.height / 2 + 30);

  // 继续下一帧
  requestAnimationFrame(gameLoop);
}

// 设置canvas尺寸
canvas.width = windowWidth;
canvas.height = windowHeight;

// 启动游戏
requestAnimationFrame(gameLoop);

console.log('游戏初始化完成');
