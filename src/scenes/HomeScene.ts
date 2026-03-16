import { gameState, gameConfig, GameState } from '../core/GameState';
import { Button, TouchManager } from '../ui/Button';

/**
 * 首页场景
 */
export class HomeScene {
  private canvas: any;
  private ctx: CanvasRenderingContext2D;
  private touchManager: TouchManager;
  private startButton: Button;
  private settingsButton: Button;
  private animationTime: number = 0;

  constructor(canvas: any, ctx: CanvasRenderingContext2D, touchManager: TouchManager) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.touchManager = touchManager;

    // 创建按钮
    const centerX = canvas.width / 2;
    const buttonWidth = 200;
    const buttonHeight = 60;

    this.startButton = new Button({
      x: centerX - buttonWidth / 2,
      y: canvas.height / 2 + 50,
      width: buttonWidth,
      height: buttonHeight,
      text: '开始游戏',
      fontSize: 28,
    });

    this.settingsButton = new Button({
      x: centerX - buttonWidth / 2,
      y: canvas.height / 2 + 130,
      width: buttonWidth,
      height: buttonHeight,
      text: '游戏设置',
      fontSize: 24,
      backgroundColor: '#666666',
    });

    // 注册按钮事件
    this.touchManager.addButton(this.startButton, this.handleStart.bind(this));
    this.touchManager.addButton(this.settingsButton, this.handleSettings.bind(this));
  }

  /**
   * 处理开始游戏
   */
  private handleStart(): void {
    console.log('开始游戏');
    gameState.setState(GameState.CHARACTER_SELECT);
  }

  /**
   * 处理设置
   */
  private handleSettings(): void {
    console.log('打开设置');
    // TODO: 实现设置页面
  }

  /**
   * 更新场景
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime;
  }

  /**
   * 渲染场景
   */
  render(): void {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制装饰性元素
    this.drawDecorations();

    // 绘制标题
    this.drawTitle();

    // 绘制按钮
    this.startButton.draw(ctx);
    this.settingsButton.draw(ctx);

    // 绘制版本信息
    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`v${gameConfig.version}`, width / 2, height - 30);
  }

  /**
   * 绘制装饰性元素
   */
  private drawDecorations(): void {
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    // 绘制动态星星
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 137 + this.animationTime * 0.01) % width;
      const y = (i * 89) % (height / 2);
      const size = 1 + (i % 3);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 绘制底部装饰线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.lineTo(width, height * 0.7);
    ctx.stroke();
  }

  /**
   * 绘制标题
   */
  private drawTitle(): void {
    const ctx = this.ctx;
    const { width } = this.canvas;

    // 标题阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(gameConfig.title, width / 2 + 3, 123);

    // 标题主文字
    ctx.fillStyle = '#ffffff';
    ctx.fillText(gameConfig.title, width / 2, 120);

    // 副标题
    ctx.font = '18px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('2.5D横屏对战游戏', width / 2, 160);
  }

  /**
   * 销毁场景
   */
  destroy(): void {
    this.touchManager.clearButtons();
  }
}
