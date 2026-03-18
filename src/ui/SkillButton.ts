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
  isCharging?: boolean;    // 是否为蓄力技能
  onPress?: () => void;    // 按下时回调（仅蓄力技能）
  onRelease?: () => void;  // 松开时回调（仅蓄力技能）
}

/**
 * 技能按钮状态
 */
export interface SkillButtonState {
  isPressed: boolean;
  isCooling: boolean;
  cooldownProgress: number; // 0-1，冷却进度
  chargeProgress: number;   // 0-1，蓄力进度（仅蓄力技能）
}

/**
 * 技能按钮组件
 */
export class SkillButton implements TouchableComponent {
  private config: Required<SkillButtonConfig>;
  private state: SkillButtonState;
  private cooldownRemaining: number = 0; // 剩余冷却时间（秒）
  private lastUpdateTime: number = 0;
  private pressStartTime: number = 0; // 按下开始时间（毫秒）
  private chargeStartTime: number = 0; // 蓄力开始时间（毫秒）

  constructor(config: SkillButtonConfig) {
    this.config = {
      icon: '技',
      color: '#4a90d9',
      cooldown: 5,
      isCharging: false,
      onPress: () => {},
      onRelease: () => {},
      ...config,
    };

    this.state = {
      isPressed: false,
      isCooling: false,
      cooldownProgress: 0,
      chargeProgress: 0,
    };
  }

  /**
   * 绘制技能按钮
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, size, icon, color, isCharging } = this.config;
    const { isPressed, isCooling, cooldownProgress, chargeProgress } = this.state;
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

    // 蓄力技能：显示蓄力进度环
    if (isCharging && chargeProgress > 0 && !isCooling) {
      // 绘制蓄力进度环（从上方开始顺时针）
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * chargeProgress);
      ctx.stroke();

      // 蓄力发光效果
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 10 * chargeProgress;
      ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 + chargeProgress * 0.5})`;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

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
    } else if (isCharging) {
      // 蓄力中：显示蓄力进度百分比
      const chargePercent = Math.floor(chargeProgress * 100);
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${size * 0.2}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${chargePercent}%`, centerX, centerY);
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
    if (this.state.isCooling) {
      // 冷却中，不处理按下状态
      return;
    }

    const wasPressed = this.state.isPressed;
    this.state.isPressed = pressed;

    // 蓄力技能：按下和松开时触发回调
    if (this.config.isCharging) {
      if (pressed && !wasPressed) {
        // 按下时触发
        this.config.onPress?.();
        this.chargeStartTime = Date.now();
      } else if (!pressed && wasPressed) {
        // 松开时触发
        this.config.onRelease?.();
        this.state.chargeProgress = 0;
      }
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
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // 转换为秒
    this.lastUpdateTime = currentTime;

    // 更新冷却状态
    if (this.state.isCooling) {
      this.cooldownRemaining -= deltaTime;

      if (this.cooldownRemaining <= 0) {
        this.cooldownRemaining = 0;
        this.state.isCooling = false;
        this.state.cooldownProgress = 0;
      } else {
        this.state.cooldownProgress = 1 - (this.cooldownRemaining / this.config.cooldown);
      }
    }

    // 更新蓄力进度（仅蓄力技能）
    if (this.config.isCharging && this.state.isPressed && !this.state.isCooling) {
      const chargeDuration = currentTime - this.chargeStartTime;
      const maxChargeTime = 5000; // 5秒最大蓄力时间
      this.state.chargeProgress = Math.min(chargeDuration / maxChargeTime, 1);
    } else if (!this.state.isPressed) {
      // 未按下时重置蓄力进度
      this.state.chargeProgress = 0;
    }
  }

  /**
   * 重置技能状态
   */
  reset(): void {
    this.state.isPressed = false;
    this.state.isCooling = false;
    this.state.cooldownProgress = 0;
    this.state.chargeProgress = 0;
    this.cooldownRemaining = 0;
    this.pressStartTime = 0;
    this.chargeStartTime = 0;
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
   * 是否为蓄力技能
   */
  isChargingSkill(): boolean {
    return this.config.isCharging;
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