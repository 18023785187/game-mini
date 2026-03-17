/// <reference types="minigame-api-typings" />

import { GameState, gameState, gameConfig, StateData } from './core/GameState';
import { TouchManager } from './ui/Button';
import { HomeScene } from './scenes/HomeScene';
import { RoomScene } from './scenes/RoomScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { BattleScene } from './scenes/BattleScene';

/**
 * 场景接口
 */
interface Scene {
  update(deltaTime: number): void;
  render(): void;
  destroy?(): void;
}

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
let roomScene: RoomScene | null = null;
let characterSelectScene: CharacterSelectScene | null = null;
let battleScene: BattleScene | null = null;
let currentScene: Scene | null = null;

/**
 * 初始化游戏
 */
function init(): void {
  console.log(`${gameConfig.title} v${gameConfig.version} 初始化中...`);

  // 初始化触摸管理器
  touchManager = new TouchManager();

  // 监听状态变化
  gameState.addListener(handleStateChange);

  // 检查启动参数，处理通过分享链接进入的情况
  const launchOptions = wx.getLaunchOptionsSync();
  handleLaunchOptions(launchOptions, true);

  // 监听小游戏切前台事件（处理从分享链接进入）
  wx.onShow((options) => {
    handleLaunchOptions(options, false);
  });

  console.log('游戏初始化完成');
}

/**
 * 微信启动参数类型
 */
interface WxLaunchOptions {
  query?: { [key: string]: string };
  scene?: number;
  roomId?: string;
}

/**
 * 处理启动参数
 */
function handleLaunchOptions(options: WxLaunchOptions, isLaunch: boolean): void {
  console.log('启动参数:', JSON.stringify(options));
  console.log('query:', options?.query);
  console.log('scene:', options?.scene);

  // 兼容不同的参数格式
  let roomId = null;

  // 优先从 query 对象中获取
  if (options?.query?.roomId) {
    roomId = options.query.roomId;
    console.log(`从 query.roomId 获取: ${roomId}`);
  }
  // 兼容直接在 options 上的 roomId
  else if (options?.roomId) {
    roomId = options.roomId;
    console.log(`从 options.roomId 获取: ${roomId}`);
  }

  if (roomId) {
    // 有 roomId，直接进入房间
    console.log(`通过分享链接进入房间: ${roomId}`);
    gameState.setState(GameState.ROOM, { roomId });
  } else if (isLaunch || !currentScene) {
    // 首次启动或没有当前场景时，进入首页
    homeScene = new HomeScene(ctx, touchManager, windowWidth, windowHeight);
    currentScene = homeScene;
  }
}

/**
 * 处理游戏状态变化
 */
function handleStateChange(state: GameState, data?: StateData): void {
  console.log(`游戏状态变化: ${state}`);

  // 销毁当前场景（清理非按钮资源，如事件监听器）
  if (currentScene && currentScene.destroy) {
    currentScene.destroy();
  }

  // 创建新场景（TouchManager 会自动管理按钮）
  switch (state) {
  case GameState.HOME:
    homeScene = new HomeScene(ctx, touchManager, windowWidth, windowHeight);
    currentScene = homeScene;
    break;

  case GameState.ROOM:
    // data 可以是 roomId，用于加入已有房间
    roomScene = new RoomScene(ctx, touchManager, windowWidth, windowHeight, data?.roomId);
    currentScene = roomScene;
    break;

  case GameState.CHARACTER_SELECT:
    // 角色选择场景
    characterSelectScene = new CharacterSelectScene(ctx, touchManager, windowWidth, windowHeight, data);
    currentScene = characterSelectScene;
    break;

  case GameState.PLAYING:
    // 对战场景
    battleScene = new BattleScene(ctx, touchManager, windowWidth, windowHeight, data);
    currentScene = battleScene;
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
