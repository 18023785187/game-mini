/**
 * 角色卡片渲染器 - 全新炫酷设计
 * 负责绘制角色选择界面的卡片和详情
 */

import { CharacterConfig } from '../types/Character';

import { CharacterRenderer } from './CharacterRenderer';

/**
 * 卡片渲染器
 */
export class CharacterCardRenderer {
  private ctx: CanvasRenderingContext2D;
  private characterRenderer: CharacterRenderer;
  private animationTime: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.characterRenderer = new CharacterRenderer(ctx);
  }

  /**
   * 更新动画
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime;
    this.characterRenderer.update(deltaTime);
  }

  /**
   * 绘制角色卡片 - 炫酷版
   */
  drawCard(
    config: CharacterConfig,
    x: number,
    y: number,
    cardWidth: number,
    cardHeight: number,
    isSelected: boolean,
    alpha: number = 1
  ): void {
    const ctx = this.ctx;

    ctx.save();
    ctx.globalAlpha = alpha;

    // ===== 卡片背景 =====
    this.drawCardBackground(ctx, config, x, y, cardWidth, cardHeight, isSelected);

    // ===== 角色预览 - 使用战斗场景渲染方法 =====
    const iconSize = Math.min(cardWidth, cardHeight) * 0.45; // 稍微缩小预览尺寸
    this.characterRenderer.drawBattlePreview(config, x, y - cardHeight * 0.1, iconSize); // 复用战斗渲染，确保一致性

    // ===== 角色名称 =====
    this.drawCharacterName(ctx, config, x, y, cardWidth, cardHeight);

    // ===== 角色类型标签 =====
    this.drawTypeTag(ctx, config, x, y, cardWidth, cardHeight);

    // ===== 选中效果 =====
    if (isSelected) {
      this.drawSelectionEffect(ctx, config, x, y, cardWidth, cardHeight);
    }

    ctx.restore();
  }

  /**
   * 绘制卡片背景 - 炫酷渐变
   */
  private drawCardBackground(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    x: number,
    y: number,
    cardWidth: number,
    cardHeight: number,
    isSelected: boolean
  ): void {
    // 外发光效果
    if (isSelected) {
      ctx.save();
      ctx.shadowColor = config.color;
      ctx.shadowBlur = 30;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      this.drawRoundRect(ctx, x - cardWidth / 2 - 10, y - cardHeight / 2 - 10, cardWidth + 20, cardHeight + 20, 20);
      ctx.fill();
      ctx.restore();
    }

    // 主背景渐变
    const bgGradient = ctx.createLinearGradient(
      x - cardWidth / 2,
      y - cardHeight / 2,
      x + cardWidth / 2,
      y + cardHeight / 2
    );
    
    // 根据角色类型设置背景色
    const bgColor1 = this.getBackgroundColor(config, 0.3);
    const bgColor2 = this.getBackgroundColor(config, 0.8);
    
    bgGradient.addColorStop(0, bgColor1);
    bgGradient.addColorStop(0.5, bgColor2);
    bgGradient.addColorStop(1, bgColor1);

    ctx.fillStyle = bgGradient;
    ctx.beginPath();
    this.drawRoundRect(ctx, x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 16);
    ctx.fill();

    // 边框
    const borderGradient = ctx.createLinearGradient(
      x - cardWidth / 2,
      y - cardHeight / 2,
      x + cardWidth / 2,
      y + cardHeight / 2
    );
    
    borderGradient.addColorStop(0, `${config.color}88`);
    borderGradient.addColorStop(0.5, config.color);
    borderGradient.addColorStop(1, `${config.color}88`);

    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.beginPath();
    this.drawRoundRect(ctx, x - cardWidth / 2, y - cardHeight / 2, cardWidth, cardHeight, 16);
    ctx.stroke();

    // 内部装饰线条
    ctx.save();
    ctx.strokeStyle = `${config.color}33`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - cardWidth / 2 + 20, y - cardHeight / 2 + 30);
    ctx.lineTo(x - cardWidth / 2 + 20, y + cardHeight / 2 - 30);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 绘制角色名称
   */
  private drawCharacterName(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    x: number,
    y: number,
    cardWidth: number,
    cardHeight: number
  ): void {
    ctx.save();
    
    // 名称背景光效
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 10;
    
    // 角色名称
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(cardWidth * 0.07)}px Arial`; // 稍微减小字体
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.name, x, y + cardHeight * 0.2); // 向上移动，避免遮挡

    ctx.restore();
  }

  /**
   * 绘制角色类型标签
   */
  private drawTypeTag(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    x: number,
    y: number,
    cardWidth: number,
    cardHeight: number
  ): void {
    const tagY = y + cardHeight * 0.35; // 再往下挪一挪，与名称保持更大间距
    const tagWidth = cardWidth * 0.35;
    const tagHeight = cardHeight * 0.06;

    // 标签背景
    const tagGradient = ctx.createLinearGradient(
      x - tagWidth / 2,
      tagY - tagHeight / 2,
      x + tagWidth / 2,
      tagY + tagHeight / 2
    );
    
    tagGradient.addColorStop(0, `${config.color}cc`);
    tagGradient.addColorStop(1, `${config.color}88`);

    ctx.fillStyle = tagGradient;
    ctx.beginPath();
    this.drawRoundRect(ctx, x - tagWidth / 2, tagY - tagHeight / 2, tagWidth, tagHeight, 8);
    ctx.fill();

    // 标签文字
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.round(cardWidth * 0.045)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.type === 'melee' ? '近战型' : '远程型', x, tagY);
  }

  /**
   * 绘制选中效果
   */
  private drawSelectionEffect(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    x: number,
    y: number,
    cardWidth: number,
    cardHeight: number
  ): void {
    // 动态脉冲效果
    const pulse = Math.sin(this.animationTime * 3) * 0.3 + 0.7;
    
    // 四角装饰
    ctx.save();
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 10 * pulse;

    const cornerSize = 20;
    
    // 左上角
    ctx.beginPath();
    ctx.moveTo(x - cardWidth / 2, y - cardHeight / 2 + cornerSize);
    ctx.lineTo(x - cardWidth / 2, y - cardHeight / 2);
    ctx.lineTo(x - cardWidth / 2 + cornerSize, y - cardHeight / 2);
    ctx.stroke();

    // 右上角
    ctx.beginPath();
    ctx.moveTo(x + cardWidth / 2 - cornerSize, y - cardHeight / 2);
    ctx.lineTo(x + cardWidth / 2, y - cardHeight / 2);
    ctx.lineTo(x + cardWidth / 2, y - cardHeight / 2 + cornerSize);
    ctx.stroke();

    // 左下角
    ctx.beginPath();
    ctx.moveTo(x - cardWidth / 2, y + cardHeight / 2 - cornerSize);
    ctx.lineTo(x - cardWidth / 2, y + cardHeight / 2);
    ctx.lineTo(x - cardWidth / 2 + cornerSize, y + cardHeight / 2);
    ctx.stroke();

    // 右下角
    ctx.beginPath();
    ctx.moveTo(x + cardWidth / 2 - cornerSize, y + cardHeight / 2);
    ctx.lineTo(x + cardWidth / 2, y + cardHeight / 2);
    ctx.lineTo(x + cardWidth / 2, y + cardHeight / 2 - cornerSize);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 获取背景颜色
   */
  private getBackgroundColor(config: CharacterConfig, alpha: number): string {
    switch (config.id) {
    case 'berserker':
      return `rgba(40, 20, 20, ${alpha})`;
    case 'gunner':
      return `rgba(20, 40, 20, ${alpha})`;
    case 'tank':
      return `rgba(20, 20, 40, ${alpha})`;
    default:
      return `rgba(30, 30, 50, ${alpha})`;
    }
  }

  /**
   * 绘制圆角矩形路径
   */
  private drawRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
  }
}
