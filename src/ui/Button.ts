/**
 * 触摸事件类型
 */
export interface TouchPoint {
  x: number;
  y: number;
}

export interface TouchEvent {
  type: 'start' | 'move' | 'end';
  touches: TouchPoint[];
}

/**
 * 按钮配置（完整配置）
 */
interface ButtonConfigFull {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  backgroundColor: string;
  textColor: string;
  fontSize: number;
  borderRadius: number;
}

/**
 * 按钮配置（用户传入）
 */
export interface ButtonConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  borderRadius?: number;
}

/**
 * UI按钮组件
 */
export class Button {
  private config: ButtonConfigFull;
  private isPressed: boolean = false;

  constructor(config: ButtonConfig) {
    this.config = {
      backgroundColor: '#4a90d9',
      textColor: '#ffffff',
      fontSize: 24,
      borderRadius: 8,
      ...config,
    };
  }

  /**
   * 绘制按钮
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height, text, backgroundColor, textColor, fontSize, borderRadius } = this.config;

    // 绘制按钮背景
    ctx.fillStyle = this.isPressed ? '#3a7bc8' : backgroundColor;
    ctx.beginPath();
    this.drawRoundRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();

    // 绘制按钮边框
    ctx.strokeStyle = this.isPressed ? '#2a6ab8' : '#5aa0e9';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制按钮文字
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + width / 2, y + height / 2);
  }

  /**
   * 绘制圆角矩形路径
   */
  private drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  /**
   * 检测点是否在按钮内
   */
  containsPoint(point: TouchPoint): boolean {
    const { x, y, width, height } = this.config;
    return point.x >= x && point.x <= x + width &&
           point.y >= y && point.y <= y + height;
  }

  /**
   * 设置按下状态
   */
  setPressed(pressed: boolean): void {
    this.isPressed = pressed;
  }

  /**
   * 获取按钮配置
   */
  getConfig(): ButtonConfigFull {
    return this.config;
  }
}

/**
 * 触摸事件管理器
 */
export class TouchManager {
  private buttons: Button[] = [];
  private buttonCallbacks: Map<Button, () => void> = new Map();

  constructor() {
    this.init();
  }

  /**
   * 初始化触摸事件监听
   */
  private init(): void {
    wx.onTouchStart(this.handleTouchStart.bind(this));
    wx.onTouchEnd(this.handleTouchEnd.bind(this));
  }

  /**
   * 添加按钮和回调
   */
  addButton(button: Button, callback: () => void): void {
    this.buttons.push(button);
    this.buttonCallbacks.set(button, callback);
  }

  /**
   * 清除所有按钮
   */
  clearButtons(): void {
    this.buttons = [];
    this.buttonCallbacks.clear();
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(e: any): void {
    const touch = e.touches[0];
    const point: TouchPoint = { x: touch.clientX, y: touch.clientY };

    for (const button of this.buttons) {
      if (button.containsPoint(point)) {
        button.setPressed(true);
        break;
      }
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(e: any): void {
    const touch = e.changedTouches[0];
    const point: TouchPoint = { x: touch.clientX, y: touch.clientY };

    for (const button of this.buttons) {
      if (button.containsPoint(point) && button['isPressed']) {
        const callback = this.buttonCallbacks.get(button);
        callback?.();
        break;
      }
      button.setPressed(false);
    }
  }
}
