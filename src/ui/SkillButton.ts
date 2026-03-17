/**
 * 技能按钮组件
 * 右侧攻击和技能按钮
 */

/**
 * 微信触摸事件类型
 */
interface WxTouchEvent {
  touches: Array<{ clientX: number; clientY: number; identifier: number }>;
  changedTouches: Array<{ clientX: number; clientY: number; identifier: number }>;
}

/**
 * 技能按钮配置
 */
export interface SkillButtonConfig {
  x: number;
  y: number;
  radius: number;
  label: string;
  cooldown: number;        // 冷却时间（秒）
  color: string;
  icon?: 'attack' | 'skill' | 'jump' | 'ultimate';  // 图标类型
}

/**
 * 技能按钮状态
 */
export interface SkillButtonState {
  isPressed: boolean;
  isOnCooldown: boolean;
  cooldownRemaining: number;  // 剩余冷却时间
  progress: number;           // 蓄力进度（0-1）
}

/**
 * 技能按钮
 */
export class SkillButton {
  private config: SkillButtonConfig;
  private isPressed: boolean = false;
  private activeTouchId: number | null = null;
  private cooldownRemaining: number = 0;
  private pressStartTime: number = 0;
  private progress: number = 0;
  private isCharging: boolean = false;

  // 按钮回调
  private onPress: (() => void) | null = null;
  private onRelease: ((chargeTime: number) => void) | null = null;

  constructor(config: SkillButtonConfig) {
    this.config = config;
    this.init();
  }

  /**
   * 初始化触摸事件
   */
  private init(): void {
    wx.onTouchStart(this.handleTouchStart.bind(this));
    wx.onTouchMove(this.handleTouchMove.bind(this));
    wx.onTouchEnd(this.handleTouchEnd.bind(this));
  }

  /**
   * 设置按钮回调
   */
  setCallbacks(onPress: () => void, onRelease: (chargeTime: number) => void): void {
    this.onPress = onPress;
    this.onRelease = onRelease;
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(e: WxTouchEvent): void {
    for (const touch of e.touches) {
      const dist = Math.sqrt(
        Math.pow(touch.clientX - this.config.x, 2) +
        Math.pow(touch.clientY - this.config.y, 2)
      );

      if (dist <= this.config.radius && this.activeTouchId === null && this.cooldownRemaining <= 0) {
        this.activeTouchId = touch.identifier;
        this.isPressed = true;
        this.pressStartTime = Date.now();
        this.isCharging = true;
        this.onPress?.();
      }
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(e: WxTouchEvent): void {
    if (this.activeTouchId === null) return;

    for (const touch of e.touches) {
      if (touch.identifier === this.activeTouchId) {
        const dist = Math.sqrt(
          Math.pow(touch.clientX - this.config.x, 2) +
          Math.pow(touch.clientY - this.config.y, 2)
        );

        // 如果手指移出按钮区域，取消按压
        if (dist > this.config.radius * 1.5) {
          this.isPressed = false;
          this.isCharging = false;
          this.progress = 0;
        }
        break;
      }
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(e: WxTouchEvent): void {
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.activeTouchId) {
        if (this.isPressed && this.isCharging) {
          const chargeTime = (Date.now() - this.pressStartTime) / 1000;
          this.onRelease?.(chargeTime);
        }
        this.activeTouchId = null;
        this.isPressed = false;
        this.isCharging = false;
        this.progress = 0;
        break;
      }
    }
  }

  /**
   * 触发冷却
   */
  triggerCooldown(): void {
    this.cooldownRemaining = this.config.cooldown;
  }

  /**
   * 更新按钮状态
   */
  update(deltaTime: number): void {
    // 更新冷却
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining -= deltaTime / 1000;
      if (this.cooldownRemaining < 0) {
        this.cooldownRemaining = 0;
      }
    }

    // 更新蓄力进度（最大5秒）
    if (this.isCharging) {
      const chargeTime = (Date.now() - this.pressStartTime) / 1000;
      this.progress = Math.min(1, chargeTime / 5);
    }
  }

  /**
   * 获取当前状态
   */
  getState(): SkillButtonState {
    return {
      isPressed: this.isPressed,
      isOnCooldown: this.cooldownRemaining > 0,
      cooldownRemaining: this.cooldownRemaining,
      progress: this.progress,
    };
  }

  /**
   * 绘制按钮
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const { x, y, radius, color, icon } = this.config;

    // 绘制发光效果
    if (this.isPressed) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
    }

    // 绘制按钮外圈光晕
    const glowGradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 1.3);
    glowGradient.addColorStop(0, this.isPressed ? color : `${color}33`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // 绘制按钮背景
    const bgGradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.3, 0, x, y, radius);
    if (this.cooldownRemaining > 0) {
      bgGradient.addColorStop(0, '#555555');
      bgGradient.addColorStop(1, '#333333');
    } else if (this.isPressed) {
      bgGradient.addColorStop(0, this.lightenColor(color, 0.3));
      bgGradient.addColorStop(1, color);
    } else {
      bgGradient.addColorStop(0, this.lightenColor(color, 0.2));
      bgGradient.addColorStop(1, this.darkenColor(color, 0.2));
    }

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = bgGradient;
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = this.isPressed ? '#ffffff' : `${color}aa`;
    ctx.lineWidth = this.isPressed ? 3 : 2;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // 绘制冷却遮罩
    if (this.cooldownRemaining > 0) {
      const angle = (this.cooldownRemaining / this.config.cooldown) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + angle);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill();

      // 显示冷却时间
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${radius * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.ceil(this.cooldownRemaining).toString(), x, y);
    } else {
      // 绘制图标
      this.drawIcon(ctx, x, y, radius, icon);
    }

    // 绘制蓄力进度环
    if (this.isCharging && this.progress > 0) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 5, -Math.PI / 2, -Math.PI / 2 + this.progress * Math.PI * 2);
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }

  /**
   * 绘制按钮图标
   */
  private drawIcon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, icon?: string): void {
    const iconColor = this.isPressed ? '#000000' : '#ffffff';
    ctx.fillStyle = iconColor;
    ctx.strokeStyle = iconColor;
    ctx.lineWidth = 2;

    const size = radius * 0.5;

    switch (icon) {
    case 'attack':
      // 剑图标
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-Math.PI / 4);
      ctx.fillRect(-size * 0.15, -size * 0.8, size * 0.3, size * 1.6);
      ctx.beginPath();
      ctx.moveTo(-size * 0.4, -size * 0.6);
      ctx.lineTo(0, -size * 0.8);
      ctx.lineTo(size * 0.4, -size * 0.6);
      ctx.lineTo(0, -size * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;

    case 'skill':
      // 闪电图标
      ctx.beginPath();
      ctx.moveTo(x + size * 0.1, y - size * 0.7);
      ctx.lineTo(x - size * 0.3, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x - size * 0.1, y + size * 0.7);
      ctx.lineTo(x + size * 0.3, y);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      break;

    case 'jump':
      // 向上箭头
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.6);
      ctx.lineTo(x - size * 0.5, y + size * 0.1);
      ctx.lineTo(x - size * 0.2, y + size * 0.1);
      ctx.lineTo(x - size * 0.2, y + size * 0.5);
      ctx.lineTo(x + size * 0.2, y + size * 0.5);
      ctx.lineTo(x + size * 0.2, y + size * 0.1);
      ctx.lineTo(x + size * 0.5, y + size * 0.1);
      ctx.closePath();
      ctx.fill();
      break;

    case 'ultimate':
      // 星星图标（大招）
      this.drawStar(ctx, x, y, 5, size * 0.6, size * 0.3);
      ctx.fill();
      break;

    default:
      // 默认显示标签
      ctx.fillStyle = iconColor;
      ctx.font = `bold ${radius * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.config.label, x, y);
    }
  }

  /**
   * 绘制星形
   */
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
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
   * 销毁按钮
   */
  destroy(): void {
    wx.offTouchStart(this.handleTouchStart.bind(this));
    wx.offTouchMove(this.handleTouchMove.bind(this));
    wx.offTouchEnd(this.handleTouchEnd.bind(this));
  }
}

/**
 * 跳跃按钮
 */
export class JumpButton {
  private x: number;
  private y: number;
  private radius: number;
  private isPressed: boolean = false;
  private activeTouchId: number | null = null;

  // 回调
  private onJump: (() => void) | null = null;

  constructor(x: number, y: number, radius: number = 50) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.init();
  }

  /**
   * 初始化触摸事件
   */
  private init(): void {
    wx.onTouchStart(this.handleTouchStart.bind(this));
    wx.onTouchMove(this.handleTouchMove.bind(this));
    wx.onTouchEnd(this.handleTouchEnd.bind(this));
  }

  /**
   * 设置跳跃回调
   */
  setCallback(onJump: () => void): void {
    this.onJump = onJump;
  }

  /**
   * 处理触摸开始
   */
  private handleTouchStart(e: WxTouchEvent): void {
    for (const touch of e.touches) {
      const dist = Math.sqrt(
        Math.pow(touch.clientX - this.x, 2) +
        Math.pow(touch.clientY - this.y, 2)
      );

      if (dist <= this.radius && this.activeTouchId === null) {
        this.activeTouchId = touch.identifier;
        this.isPressed = true;
        this.onJump?.();
      }
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(e: WxTouchEvent): void {
    // 跳跃按钮不需要处理移动
    void e;
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(e: WxTouchEvent): void {
    for (const touch of e.changedTouches) {
      if (touch.identifier === this.activeTouchId) {
        this.activeTouchId = null;
        this.isPressed = false;
        break;
      }
    }
  }

  /**
   * 绘制跳跃按钮
   */
  draw(ctx: CanvasRenderingContext2D): void {
    const color = '#44aaff';

    // 绘制发光效果
    if (this.isPressed) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 25;
    }

    // 绘制按钮外圈光晕
    const glowGradient = ctx.createRadialGradient(this.x, this.y, this.radius * 0.5, this.x, this.y, this.radius * 1.3);
    glowGradient.addColorStop(0, this.isPressed ? `${color}66` : `${color}22`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // 绘制按钮背景
    const bgGradient = ctx.createRadialGradient(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      0,
      this.x,
      this.y,
      this.radius
    );
    if (this.isPressed) {
      bgGradient.addColorStop(0, '#66ccff');
      bgGradient.addColorStop(1, color);
    } else {
      bgGradient.addColorStop(0, '#5599dd');
      bgGradient.addColorStop(1, '#3377aa');
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = bgGradient;
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = this.isPressed ? '#ffffff' : `${color}aa`;
    ctx.lineWidth = this.isPressed ? 3 : 2;
    ctx.stroke();

    ctx.shadowBlur = 0;

    // 绘制向上箭头
    ctx.fillStyle = this.isPressed ? '#000000' : '#ffffff';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - this.radius * 0.4);
    ctx.lineTo(this.x - this.radius * 0.35, this.y + this.radius * 0.1);
    ctx.lineTo(this.x - this.radius * 0.15, this.y + this.radius * 0.1);
    ctx.lineTo(this.x - this.radius * 0.15, this.y + this.radius * 0.35);
    ctx.lineTo(this.x + this.radius * 0.15, this.y + this.radius * 0.35);
    ctx.lineTo(this.x + this.radius * 0.15, this.y + this.radius * 0.1);
    ctx.lineTo(this.x + this.radius * 0.35, this.y + this.radius * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 销毁按钮
   */
  destroy(): void {
    wx.offTouchStart(this.handleTouchStart.bind(this));
    wx.offTouchMove(this.handleTouchMove.bind(this));
    wx.offTouchEnd(this.handleTouchEnd.bind(this));
  }
}

/**
 * 攻击按钮组
 */
export class AttackButtonGroup {
  private attackButton: SkillButton;
  private skillButtons: SkillButton[] = [];
  private jumpButton: JumpButton;

  // 回调
  private onAttack: (() => void) | null = null;
  private onSkill: ((skillIndex: 1 | 2 | 3, chargeTime: number) => void) | null = null;
  private onJump: (() => void) | null = null;

  constructor(x: number, y: number, buttonRadius: number = 40) {
    // 跳跃按钮（最上方）
    this.jumpButton = new JumpButton(x, y - buttonRadius * 3.5, buttonRadius * 0.9);

    // 技能3按钮（大招，技能按钮上方）
    this.skillButtons.push(new SkillButton({
      x: x - buttonRadius * 1.2,
      y: y - buttonRadius * 2,
      radius: buttonRadius * 1.0,
      label: '3',
      cooldown: 30,
      color: '#ffaa44',
      icon: 'ultimate',
    }));

    // 技能1按钮（左上）
    this.skillButtons.push(new SkillButton({
      x: x - buttonRadius * 2.2,
      y: y - buttonRadius * 0.8,
      radius: buttonRadius * 0.9,
      label: '1',
      cooldown: 5,
      color: '#44dd44',
      icon: 'skill',
    }));

    // 技能2按钮（左下）
    this.skillButtons.push(new SkillButton({
      x: x - buttonRadius * 1.8,
      y: y + buttonRadius * 0.8,
      radius: buttonRadius * 0.9,
      label: '2',
      cooldown: 5,
      color: '#4488ff',
      icon: 'skill',
    }));

    // 普通攻击按钮（最大，右下角）
    this.attackButton = new SkillButton({
      x: x,
      y: y,
      radius: buttonRadius * 1.3,
      label: '攻',
      cooldown: 0,
      color: '#ff4444',
      icon: 'attack',
    });

    this.setupCallbacks();
  }

  /**
   * 设置回调
   */
  private setupCallbacks(): void {
    // 普通攻击
    this.attackButton.setCallbacks(
      () => this.onAttack?.(),
      () => { /* 普通攻击不需要蓄力 */ }
    );

    // 技能
    this.skillButtons.forEach((btn, index) => {
      btn.setCallbacks(
        () => { /* 技能按下 */ },
        (chargeTime) => this.onSkill?.((index + 1) as 1 | 2 | 3, chargeTime)
      );
    });

    // 跳跃
    this.jumpButton.setCallback(() => { this.onJump?.(); });
  }

  /**
   * 设置回调
   */
  setCallbacks(
    onAttack: () => void,
    onSkill: (skillIndex: 1 | 2 | 3, chargeTime: number) => void,
    onJump?: () => void
  ): void {
    this.onAttack = onAttack;
    this.onSkill = onSkill;
    this.onJump = onJump ?? null;
  }

  /**
   * 更新技能冷却
   */
  updateSkillCooldown(skillIndex: 1 | 2 | 3, cooldown: number): void {
    if (skillIndex >= 1 && skillIndex <= 3) {
      const btn = this.skillButtons[skillIndex - 1];
      (btn as unknown as { config: SkillButtonConfig }).config.cooldown = cooldown;
      btn.triggerCooldown();
    }
  }

  /**
   * 触发攻击冷却
   */
  triggerAttackCooldown(cooldown: number): void {
    (this.attackButton as unknown as { config: SkillButtonConfig }).config.cooldown = cooldown;
    this.attackButton.triggerCooldown();
  }

  /**
   * 更新所有按钮
   */
  update(deltaTime: number): void {
    this.attackButton.update(deltaTime);
    this.skillButtons.forEach(btn => btn.update(deltaTime));
  }

  /**
   * 绘制所有按钮
   */
  draw(ctx: CanvasRenderingContext2D): void {
    this.jumpButton.draw(ctx);
    this.skillButtons.forEach(btn => btn.draw(ctx));
    this.attackButton.draw(ctx);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.attackButton.destroy();
    this.jumpButton.destroy();
    this.skillButtons.forEach(btn => btn.destroy());
  }
}
