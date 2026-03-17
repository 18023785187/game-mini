/**
 * 微信触摸事件类型
 */
interface WxTouchEvent {
  touches: Array<{ clientX: number; clientY: number }>;
  changedTouches: Array<{ clientX: number; clientY: number }>;
}

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

    // 根据背景色计算按下状态和边框颜色
    const pressedColor = this.darkenColor(backgroundColor, 0.1);
    const borderColor = this.isPressed ? this.darkenColor(backgroundColor, 0.15) : this.lightenColor(backgroundColor, 0.15);

    // 绘制按钮背景
    ctx.fillStyle = this.isPressed ? pressedColor : backgroundColor;
    ctx.beginPath();
    this.drawRoundRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();

    // 绘制按钮边框
    ctx.strokeStyle = borderColor;
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
   * 使颜色变亮
   */
  private lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + Math.round(255 * amount));
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + Math.round(255 * amount));
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * 使颜色变暗
   */
  private darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - Math.round(255 * amount));
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - Math.round(255 * amount));
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - Math.round(255 * amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
 * 支持场景隔离，切换场景时自动清除旧场景的按钮
 */
export class TouchManager {
  private currentSceneId: symbol | null = null;
  private sceneButtons: Map<symbol, { buttons: Button[]; callbacks: Map<Button, () => void> }> = new Map();

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
   * 创建新场景并返回场景ID
   */
  createScene(): symbol {
    const sceneId = Symbol('scene');
    this.sceneButtons.set(sceneId, { buttons: [], callbacks: new Map() });
    return sceneId;
  }

  /**
   * 切换到指定场景（自动销毁其他场景）
   */
  switchScene(sceneId: symbol): void {
    // 销毁其他场景
    for (const [id, data] of this.sceneButtons) {
      if (id !== sceneId) {
        // 重置按钮状态
        data.buttons.forEach(button => button.setPressed(false));
        this.sceneButtons.delete(id);
      }
    }
    this.currentSceneId = sceneId;
  }

  /**
   * 销毁指定场景
   */
  destroyScene(sceneId: symbol): void {
    const data = this.sceneButtons.get(sceneId);
    if (data) {
      data.buttons.forEach(button => button.setPressed(false));
      this.sceneButtons.delete(sceneId);
    }
    if (this.currentSceneId === sceneId) {
      this.currentSceneId = null;
    }
  }

  /**
   * 添加按钮和回调（添加到当前场景）
   */
  addButton(button: Button, callback: () => void): void {
    if (!this.currentSceneId) {
      console.warn('TouchManager: 没有激活的场景，请先调用 switchScene');
      return;
    }
    const data = this.sceneButtons.get(this.currentSceneId);
    if (data) {
      data.buttons.push(button);
      data.callbacks.set(button, callback);
    }
  }

  /**
   * 清除当前场景的所有按钮
   */
  clearButtons(): void {
    if (!this.currentSceneId) return;
    const data = this.sceneButtons.get(this.currentSceneId);
    if (data) {
      data.buttons = [];
      data.callbacks.clear();
    }
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(e: WxTouchEvent): void {
    if (!this.currentSceneId) return;

    const data = this.sceneButtons.get(this.currentSceneId);
    if (!data) return;

    const touch = e.touches[0];
    const point: TouchPoint = { x: touch.clientX, y: touch.clientY };

    for (const button of data.buttons) {
      if (button.containsPoint(point)) {
        button.setPressed(true);
        break;
      }
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(e: WxTouchEvent): void {
    if (!this.currentSceneId) return;

    const data = this.sceneButtons.get(this.currentSceneId);
    if (!data) return;

    const touch = e.changedTouches[0];
    const point: TouchPoint = { x: touch.clientX, y: touch.clientY };

    for (const button of data.buttons) {
      if (button.containsPoint(point) && button['isPressed']) {
        const callback = data.callbacks.get(button);
        callback?.();
        break;
      }
      button.setPressed(false);
    }
  }
}
