/// <reference types="minigame-api-typings" />

import { GameState, gameState, gameConfig } from './core/GameState';
import { TouchManager } from './ui/Button';
import { HomeScene } from './scenes/HomeScene';

/**
 * 游戏主入口
 * 2.5D横屏微信小游戏 - 类拳皇对战
 */

// 获取canvas上下文
const canvas = wx.createCanvas();
const ctx = canvas.getContext('2d');

// 获取系统信息
const systemInfo = wx.getSystemInfoSync();
const { windowWidth, windowHeight, pixelRatio } = systemInfo;

// 设置canvas尺寸
canvas.width = windowWidth * pixelRatio;
canvas.height = windowHeight * pixelRatio;
ctx.scale(pixelRatio, pixelRatio);

// 游戏核心变量
let lastTime = 0;
let touchManager: TouchManager;
let homeScene: HomeScene | null = null;
let currentScene: any = null;

/**
 * 初始化游戏
 */
function init(): void {
  console.log(`${gameConfig.title} v${gameConfig.version} 初始化中...`);

  // 初始化触摸管理器
  touchManager = new TouchManager();

  // 初始化首页场景
  homeScene = new HomeScene(ctx, touchManager, windowWidth, windowHeight);
  currentScene = homeScene;

  // 监听状态变化
  gameState.addListener(handleStateChange);

  console.log('游戏初始化完成');
}

/**
 * 处理游戏状态变化
 */
function handleStateChange(state: GameState): void {
  console.log(`游戏状态变化: ${state}`);

  switch (state) {
    case GameState.HOME:
      if (!homeScene) {
        homeScene = new HomeScene(ctx, touchManager, windowWidth, windowHeight);
      }
      currentScene = homeScene;
      break;

    case GameState.CHARACTER_SELECT:
      // TODO: 实现角色选择场景
      drawPlaceholder('角色选择');
      break;

    case GameState.PLAYING:
      // TODO: 实现游戏场景
      drawPlaceholder('游戏进行中');
      break;

    case GameState.RESULT:
      // TODO: 实现结算场景
      drawPlaceholder('游戏结算');
      break;
  }
}

/**
 * 绘制占位页面
 */
function drawPlaceholder(text: string): void {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, windowWidth, windowHeight);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(text, windowWidth / 2, windowHeight / 2);

  ctx.font = '16px Arial';
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('功能开发中...', windowWidth / 2, windowHeight / 2 + 40);
}

/**
 * 游戏主循环
 */
function gameLoop(timestamp: number): void {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // 更新当前场景
  if (currentScene && currentScene.update) {
    currentScene.update(deltaTime);
  }

  // 渲染当前场景
  if (currentScene && currentScene.render) {
    currentScene.render();
  }

  // 继续下一帧
  requestAnimationFrame(gameLoop);
}

// 启动游戏
init();
requestAnimationFrame(gameLoop);
