/**
 * 伤害数字显示效果
 * 在角色扣血时显示飘动的伤害数值
 */

/**
 * 单个伤害数字
 */
interface DamageText {
  x: number;          // X坐标
  y: number;          // Y坐标
  damage: number;     // 伤害值
  isCrit: boolean;    // 是否暴击
  alpha: number;      // 透明度
  scale: number;      // 缩放
  velocityY: number;  // Y轴速度（向上飘）
  life: number;       // 剩余生命时间
  maxLife: number;    // 最大生命时间
}

/**
 * 伤害数字管理器
 */
export class DamageNumberManager {
  private ctx: CanvasRenderingContext2D;
  private damageTexts: DamageText[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * 创建伤害数字
   */
  createDamageNumber(x: number, y: number, damage: number, isCrit: boolean = false): void {
    // 随机偏移，避免多个数字重叠
    const offsetX = (Math.random() - 0.5) * 40;
    
    this.damageTexts.push({
      x: x + offsetX,
      y: y - 30,  // 从角色上方开始
      damage,
      isCrit,
      alpha: 1,
      scale: isCrit ? 1.5 : 1,  // 暴击放大
      velocityY: -80,  // 向上飘动
      life: 1.5,       // 1.5秒后消失
      maxLife: 1.5,
    });
  }

  /**
   * 更新所有伤害数字
   */
  update(deltaTime: number): void {
    for (let i = this.damageTexts.length - 1; i >= 0; i--) {
      const text = this.damageTexts[i];
      
      // 更新位置
      text.y += text.velocityY * deltaTime;
      
      // 更新透明度
      text.alpha = text.life / text.maxLife;
      
      // 更新缩放（暴击会先放大后缩小）
      if (text.isCrit) {
        const progress = 1 - text.life / text.maxLife;
        if (progress < 0.3) {
          text.scale = 1.5 + progress * 2;  // 0-0.3秒放大到2.1倍
        } else {
          text.scale = 2.1 - (progress - 0.3) * 0.6;  // 逐渐缩小到1.5倍
        }
      }
      
      // 更新生命时间
      text.life -= deltaTime;
      
      // 移除已消失的
      if (text.life <= 0) {
        this.damageTexts.splice(i, 1);
      }
    }
  }

  /**
   * 绘制所有伤害数字
   */
  draw(cameraX: number = 0): void {
    const ctx = this.ctx;

    this.damageTexts.forEach(text => {
      ctx.save();
      
      const screenX = text.x - cameraX;
      
      ctx.globalAlpha = text.alpha;
      ctx.translate(screenX, text.y);
      ctx.scale(text.scale, text.scale);
      
      // 设置字体
      const fontSize = text.isCrit ? 28 : 20;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 绘制阴影（增强可读性）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillText(`-${Math.floor(text.damage)}`, 2, 2);
      
      // 绘制文字
      if (text.isCrit) {
        // 暴击：红色 + 发光效果
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ff4444';
      } else {
        // 普通伤害：橙色
        ctx.fillStyle = '#ff8800';
      }
      
      ctx.fillText(`-${Math.floor(text.damage)}`, 0, 0);
      
      // 暴击时显示"暴击"文字
      if (text.isCrit) {
        ctx.font = 'bold 14px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.fillText('暴击', 0, -20);
      }
      
      ctx.restore();
    });
  }

  /**
   * 清除所有伤害数字
   */
  clear(): void {
    this.damageTexts = [];
  }
}
