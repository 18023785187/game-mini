/**
 * 虚拟摇杆组件
 * 用于控制角色移动和跳跃
 * 向左滑：左移
 * 向右滑：右移
 * 向上滑：跳跃
 */

/**
 * 摇杆方向
 */
export interface JoystickDirection {
  x: number;  // -1 ~ 1，负数表示左，正数表示右
  y: number;  // -1 ~ 1，负数表示下，正数表示上
}

/**
 * 摇杆状态
 */
export interface JoystickState {
  direction: JoystickDirection;
  isJumping: boolean;     // 是否触发了跳跃
  isMoving: boolean;      // 是否正在移动
}

/**
 * 微信触摸事件类型
 */
interface WxTouchEvent {
  touches: Array<{ clientX: number; clientY: number; identifier: number }>;
  changedTouches: Array<{ clientX: number; clientY: number; identifier: number }>;
}

/**
 * 虚拟摇杆
 */
export class Joystick {
  private x: number;              // 摇杆中心X坐标
  private y: number;              // 摇杆中心Y坐标
  private radius: number;         // 摇杆外圈半径
  private knobRadius: number;     // 摇杆内圈半径
  private knobX: number;          // 摇杆内圈当前X坐标
  private knobY: number;          // 摇杆内圈当前Y坐标
  private activeTouchId: number | null = null;  // 当前活跃的触摸ID
  private jumpTriggered: boolean = false;       // 跳跃是否已触发（防连跳）
  private glowIntensity: number = 0;            // 发光强度
  private animationTime: number = 0;           // 动画时间

  // 摇杆状态
  private direction: JoystickDirection = { x: 0, y: 0 };
  private isJumping: boolean = false;

  constructor(x: number, y: number, radius: number = 60) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.knobRadius = radius * 0.35;
    this.knobX = x;
    this.knobY = y;

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
   * 处理触摸开始
   */
  private handleTouchStart(e: WxTouchEvent): void {
    for (const touch of e.touches) {
      // 检查是否触摸在摇杆区域（扩大触摸范围便于操作）
      const dist = Math.sqrt(
        Math.pow(touch.clientX - this.x, 2) +
        Math.pow(touch.clientY - this.y, 2)
      );

      if (dist <= this.radius * 2 && this.activeTouchId === null) {
        this.activeTouchId = touch.identifier;
        this.updateKnobPosition(touch.clientX, touch.clientY);
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
        this.updateKnobPosition(touch.clientX, touch.clientY);
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
        this.resetKnob();
        this.activeTouchId = null;
        this.isJumping = false;
        break;
      }
    }
  }

  /**
   * 更新摇杆内圈位置
   */
  private updateKnobPosition(touchX: number, touchY: number): void {
    const dx = touchX - this.x;
    const dy = touchY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= this.radius) {
      this.knobX = touchX;
      this.knobY = touchY;
    } else {
      // 限制在外圈内
      this.knobX = this.x + (dx / dist) * this.radius;
      this.knobY = this.y + (dy / dist) * this.radius;
    }

    // 计算方向（-1 到 1）
    this.direction.x = (this.knobX - this.x) / this.radius;
    this.direction.y = (this.knobY - this.y) / this.radius;

    // 检测跳跃（向上滑动超过阈值）
    const jumpThreshold = 0.4;
    if (this.direction.y < -jumpThreshold) {
      this.isJumping = true;
      this.glowIntensity = 1.0; // 触发跳跃时增加发光强度
    } else {
      this.isJumping = false;
    }
  }

  /**
   * 重置摇杆位置
   */
  private resetKnob(): void {
    this.knobX = this.x;
    this.knobY = this.y;
    this.direction = { x: 0, y: 0 };
    this.isJumping = false;
  }

  /**
   * 获取当前状态
   */
  getState(): JoystickState {
    return {
      direction: { ...this.direction },
      isJumping: this.isJumping,
      isMoving: Math.abs(this.direction.x) > 0.1,
    };
  }



  /**
   * 更新动画
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime / 1000;

    // 发光强度衰减
    if (this.glowIntensity > 0) {
      this.glowIntensity -= deltaTime / 200;
      if (this.glowIntensity < 0) {
        this.glowIntensity = 0;
      }
    }

    // 呼吸动画
    if (Math.abs(this.direction.x) < 0.1 && Math.abs(this.direction.y) < 0.1) {
      // 待机时呼吸效果
      const breatheScale = 1 + Math.sin(this.animationTime * 2) * 0.05;
      this.knobX = this.x + (this.knobX - this.x) * breatheScale;
      this.knobY = this.y + (this.knobY - this.y) * breatheScale;
    }
  }

  /**
   * 绘制摇杆
   */
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // 计算基础发光
    const baseGlow = this.isJumping ? 20 : 15;
    const glowStrength = baseGlow + this.glowIntensity * 30;

    // 绘制摇杆外圈
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    // 外圈渐变
    const outerGradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius
    );
    outerGradient.addColorStop(0, 'rgba(0, 200, 255, 0.15)');
    outerGradient.addColorStop(0.7, 'rgba(0, 150, 200, 0.1)');
    outerGradient.addColorStop(1, 'rgba(0, 100, 150, 0.05)');

    ctx.fillStyle = outerGradient;
    ctx.shadowColor = 'rgba(0, 200, 255, 0.5)';
    ctx.shadowBlur = glowStrength;
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制方向指示线（装饰性）
    if (Math.abs(this.direction.x) > 0.1 || Math.abs(this.direction.y) > 0.1) {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.knobX, this.knobY);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 绘制方向指示箭头（上下左右）
    this.drawDirectionArrows(ctx);

    // 绘制摇杆内圈
    ctx.beginPath();
    ctx.arc(this.knobX, this.knobY, this.knobRadius, 0, Math.PI * 2);

    // 内圈渐变
    const innerGradient = ctx.createRadialGradient(
      this.knobX - this.knobRadius * 0.3, this.knobY - this.knobRadius * 0.3, 0,
      this.knobX, this.knobY, this.knobRadius
    );

    if (this.isJumping) {
      innerGradient.addColorStop(0, 'rgba(0, 255, 200, 0.9)');
      innerGradient.addColorStop(1, 'rgba(0, 200, 150, 0.7)');
      ctx.shadowColor = 'rgba(0, 255, 200, 0.8)';
      ctx.shadowBlur = 25;
    } else {
      innerGradient.addColorStop(0, 'rgba(0, 200, 255, 0.85)');
      innerGradient.addColorStop(1, 'rgba(0, 150, 200, 0.65)');
      ctx.shadowColor = 'rgba(0, 200, 255, 0.6)';
      ctx.shadowBlur = 20 + this.glowIntensity * 20;
    }

    ctx.fillStyle = innerGradient;
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制内圈高光
    ctx.beginPath();
    ctx.arc(
      this.knobX - this.knobRadius * 0.25,
      this.knobY - this.knobRadius * 0.25,
      this.knobRadius * 0.3,
      0, Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();

    ctx.restore();
  }

  /**
   * 绘制方向指示箭头
   */
  private drawDirectionArrows(ctx: CanvasRenderingContext2D): void {
    const arrowSize = this.radius * 0.15;
    const arrowOffset = this.radius * 0.65;

    ctx.save();
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
    ctx.fillStyle = 'rgba(0, 200, 255, 0.4)';
    ctx.lineWidth = 2;

    // 左箭头
    this.drawArrow(ctx, this.x - arrowOffset, this.y, Math.PI, arrowSize);

    // 右箭头
    this.drawArrow(ctx, this.x + arrowOffset, this.y, 0, arrowSize);

    // 上箭头（跳跃指示）
    this.drawArrow(ctx, this.x, this.y - arrowOffset, -Math.PI / 2, arrowSize);

    // 下箭头
    this.drawArrow(ctx, this.x, this.y + arrowOffset, Math.PI / 2, arrowSize);

    ctx.restore();
  }

  /**
   * 绘制单个箭头
   */
  private drawArrow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    size: number
  ): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(size, 0);
    ctx.lineTo(-size * 0.6, -size * 0.6);
    ctx.lineTo(-size * 0.6, size * 0.6);
    ctx.closePath();

    ctx.fill();
    ctx.restore();
  }

  /**
   * 销毁摇杆
   */
  destroy(): void {
    wx.offTouchStart(this.handleTouchStart.bind(this));
    wx.offTouchMove(this.handleTouchMove.bind(this));
    wx.offTouchEnd(this.handleTouchEnd.bind(this));
  }
}
