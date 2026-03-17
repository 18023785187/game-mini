/**
 * 攻击按钮组件
 * 类似王者荣耀的普通攻击按钮，较大圆形，位于右下角
 */

import { TouchableComponent } from './Button';

/**
 * 攻击按钮配置
 */
export interface AttackButtonConfig {
  x: number;
  y: number;
  size: number;            // 按钮大小（直径）
  icon?: string;           // 图标文字
  color?: string;          // 按钮颜色
}

/**
 * 攻击按钮状态
 */
export interface AttackButtonState {
  isPressed: boolean;
  isAutoAttacking: boolean; // 是否在自动攻击
  attackInterval: number;   // 攻击间隔（毫秒）
  lastAttackTime: number;   // 上次攻击时间
}

/**
 * 攻击按钮组件
 */
export class AttackButton implements TouchableComponent {
  private config: Required<AttackButtonConfig>;
  private state: AttackButtonState;

  constructor(config: AttackButtonConfig) {
    this.config = {
      icon: '攻',
      color: '#ff6b6b',
      ...config,
    };

    this.state = {
      isPressed: false,
      isAutoAttacking: false,
      attackInterval: 500, // 默认攻击间隔500ms
      lastAttackTime: 0,
    };
  }

  /**
   * 绘制攻击按钮
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, size, icon, color } = this.config;
    const { isPressed } = this.state;
    const radius = size / 2;
    const centerX = x + radius;
    const centerY = y + radius;

    ctx.save();

    // 绘制外圈（带阴影效果）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillStyle = isPressed ? this.darkenColor(color, 0.2) : color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 清除阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 绘制内圈（渐变效果）
    const gradient = ctx.createRadialGradient(
      centerX - radius * 0.3, centerY - radius * 0.3, 0,
      centerX, centerY, radius * 0.7
    );
    gradient.addColorStop(0, isPressed ? this.darkenColor(color, 0.1) : this.lightenColor(color, 0.2));
    gradient.addColorStop(1, isPressed ? this.darkenColor(color, 0.3) : color);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 绘制边框（带高光）
    ctx.strokeStyle = isPressed ? this.darkenColor(color, 0.4) : this.lightenColor(color, 0.3);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制内边框
    ctx.strokeStyle = isPressed ? this.darkenColor(color, 0.2) : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.65, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制攻击图标
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 图标阴影效果
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    ctx.fillText(icon, centerX, centerY);
    
    // 清除阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 绘制中心高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(centerX - radius * 0.2, centerY - radius * 0.2, radius * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 如果正在攻击，绘制攻击效果
    if (this.state.isAutoAttacking) {
      const pulseSize = radius * (1 + Math.sin(Date.now() / 200) * 0.1);
      ctx.strokeStyle = 'rgba(255, 100, 100, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * 检测点是否在按钮内
   */
  containsPoint(point: { x: number; y: number }): boolean {
    const { x, y, size } = this.config;
    const radius = size / 2;
    const centerX = x + radius;
    const centerY = y + radius;
    
    const dx = point.x - centerX;
    const dy = point.y - centerY;
    return dx * dx + dy * dy <= radius * radius;
  }

  /**
   * 设置按下状态
   */
  setPressed(pressed: boolean): void {
    this.state.isPressed = pressed;
    this.state.isAutoAttacking = pressed; // 按下时开始自动攻击
  }

  /**
   * 更新攻击状态
   */
  update(): boolean {
    if (!this.state.isAutoAttacking) {
      return false;
    }

    const currentTime = Date.now();
    if (currentTime - this.state.lastAttackTime >= this.state.attackInterval) {
      this.state.lastAttackTime = currentTime;
      return true; // 可以攻击
    }
    
    return false; // 攻击间隔未到
  }

  /**
   * 设置攻击间隔
   */
  setAttackInterval(interval: number): void {
    this.state.attackInterval = interval;
  }

  /**
   * 重置按钮状态
   */
  reset(): void {
    this.state.isPressed = false;
    this.state.isAutoAttacking = false;
    this.state.lastAttackTime = 0;
  }

  /**
   * 是否正在攻击
   */
  isAttacking(): boolean {
    return this.state.isAutoAttacking;
  }

  /**
   * 获取按下状态（为了TouchManager兼容性）
   */
  get isPressed(): boolean {
    return this.state.isPressed;
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
}