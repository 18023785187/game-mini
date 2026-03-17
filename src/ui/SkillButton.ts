/**
 * 技能按钮组件
 * 类似王者荣耀的技能按钮，支持图标、冷却显示等
 */

import { TouchableComponent } from './Button';

/**
 * 技能按钮配置
 */
export interface SkillButtonConfig {
  x: number;
  y: number;
  size: number;            // 按钮大小（直径）
  skillId: string;         // 技能ID
  icon?: string;           // 图标文字（暂时用文字代替图标）
  color?: string;          // 按钮颜色
  cooldown?: number;       // 冷却时间（秒）
}

/**
 * 技能按钮状态
 */
export interface SkillButtonState {
  isPressed: boolean;
  isCooling: boolean;
  cooldownProgress: number; // 0-1，冷却进度
}

/**
 * 技能按钮组件
 */
export class SkillButton implements TouchableComponent {
  private config: Required<SkillButtonConfig>;
  private state: SkillButtonState;
  private cooldownRemaining: number = 0; // 剩余冷却时间（秒）
  private lastUpdateTime: number = 0;

  constructor(config: SkillButtonConfig) {
    this.config = {
      icon: '技',
      color: '#4a90d9',
      cooldown: 5,
      ...config,
    };

    this.state = {
      isPressed: false,
      isCooling: false,
      cooldownProgress: 0,
    };
  }

  /**
   * 绘制技能按钮
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, size, icon, color } = this.config;
    const { isPressed, isCooling, cooldownProgress } = this.state;
    const radius = size / 2;
    const centerX = x + radius;
    const centerY = y + radius;

    // 绘制按钮背景（圆形）
    ctx.save();
    
    // 绘制外圈
    ctx.fillStyle = isPressed ? this.darkenColor(color, 0.2) : color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // 绘制内圈（稍微小一点）
    ctx.fillStyle = isPressed ? this.darkenColor(color, 0.1) : this.lightenColor(color, 0.1);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = isPressed ? this.darkenColor(color, 0.3) : this.lightenColor(color, 0.2);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // 如果正在冷却，绘制冷却遮罩
    if (isCooling) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * cooldownProgress);
      ctx.closePath();
      ctx.fill();

      // 显示冷却时间
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${size * 0.25}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.ceil(this.cooldownRemaining).toString(), centerX, centerY);
    } else {
      // 绘制技能图标（暂时用文字代替）
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${size * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, centerX, centerY);
    }

    // 绘制按钮高光效果
    if (!isCooling) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
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
    if (!this.state.isCooling) {
      this.state.isPressed = pressed;
    }
  }

  /**
   * 触发技能（开始冷却）
   */
  trigger(): boolean {
    if (this.state.isCooling) {
      return false; // 技能还在冷却中
    }

    this.state.isCooling = true;
    this.cooldownRemaining = this.config.cooldown;
    this.lastUpdateTime = Date.now();
    return true;
  }

  /**
   * 更新冷却状态
   */
  update(): void {
    if (!this.state.isCooling) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
    this.lastUpdateTime = currentTime;

    this.cooldownRemaining -= deltaTime;

    if (this.cooldownRemaining <= 0) {
      this.cooldownRemaining = 0;
      this.state.isCooling = false;
      this.state.cooldownProgress = 0;
    } else {
      this.state.cooldownProgress = 1 - (this.cooldownRemaining / this.config.cooldown);
    }
  }

  /**
   * 重置技能状态
   */
  reset(): void {
    this.state.isPressed = false;
    this.state.isCooling = false;
    this.state.cooldownProgress = 0;
    this.cooldownRemaining = 0;
  }

  /**
   * 获取技能ID
   */
  getSkillId(): string {
    return this.config.skillId;
  }

  /**
   * 是否在冷却中
   */
  isCoolingDown(): boolean {
    return this.state.isCooling;
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