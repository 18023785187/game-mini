/**
 * 角色渲染器
 * 负责绘制角色形象，支持不同状态的动画效果
 */

import { Character, CharacterState, CharacterDirection } from '../entities/Character';
import { CharacterConfig } from '../types/Character';

/**
 * 角色渲染器配置
 */
interface RendererConfig {
  unitSize: number;  // 单位大小（1单位=60px）
}

/**
 * 角色渲染器
 */
export class CharacterRenderer {
  private ctx: CanvasRenderingContext2D;
  private config: RendererConfig;
  private animationTime: number = 0;

  constructor(ctx: CanvasRenderingContext2D, unitSize: number = 60) {
    this.ctx = ctx;
    this.config = { unitSize };
  }

  /**
   * 更新动画时间
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime;
  }

  /**
   * 绘制角色
   */
  draw(character: Character): void {
    const ctx = this.ctx;
    const { x, y, state, direction } = character;
    const unit = this.config.unitSize;

    ctx.save();

    // 根据方向翻转
    if (direction === CharacterDirection.LEFT) {
      ctx.translate(x + unit, y);
      ctx.scale(-1, 1);
      ctx.translate(0, 0);
    } else {
      ctx.translate(x, y);
    }

    // 根据状态绘制不同效果
    switch (state) {
    case CharacterState.ATTACKING:
      this.drawAttackingCharacter(character);
      break;
    case CharacterState.HURT:
      this.drawHurtCharacter(character);
      break;
    case CharacterState.DEAD:
      this.drawDeadCharacter(character);
      break;
    case CharacterState.JUMPING:
      this.drawJumpingCharacter(character);
      break;
    case CharacterState.MOVING:
      this.drawMovingCharacter(character);
      break;
    case CharacterState.SKILL_1:
    case CharacterState.SKILL_2:
    case CharacterState.SKILL_3:
      this.drawSkillCharacter(character);
      break;
    default:
      this.drawIdleCharacter(character);
    }

    // 绘制状态特效
    this.drawStateEffects(character);

    ctx.restore();
  }

  /**
   * 绘制待机状态角色
   */
  private drawIdleCharacter(character: Character): void {
    const ctx = this.ctx;
    const config = character.config;
    const unit = this.config.unitSize;

    // 呼吸动画
    const breathe = Math.sin(this.animationTime * 2) * 2;

    // 身体
    this.drawBody(ctx, config, unit, breathe);

    // 武器
    this.drawWeapon(ctx, config, unit, 0);

    // 头部
    this.drawHead(ctx, config, unit, breathe);
  }

  /**
   * 绘制移动状态角色
   */
  private drawMovingCharacter(character: Character): void {
    const ctx = this.ctx;
    const config = character.config;
    const unit = this.config.unitSize;

    // 走路动画
    const walkCycle = Math.sin(this.animationTime * 10) * 5;

    // 身体
    this.drawBody(ctx, config, unit, walkCycle);

    // 武器
    this.drawWeapon(ctx, config, unit, walkCycle * 0.5);

    // 头部
    this.drawHead(ctx, config, unit, 0);
  }

  /**
   * 绘制跳跃状态角色
   */
  private drawJumpingCharacter(character: Character): void {
    const ctx = this.ctx;
    const config = character.config;
    const unit = this.config.unitSize;

    // 跳跃姿势
    const jumpOffset = -5;

    // 身体
    this.drawBody(ctx, config, unit, jumpOffset);

    // 武器（举起）
    this.drawWeapon(ctx, config, unit, -15);

    // 头部
    this.drawHead(ctx, config, unit, jumpOffset);
  }

  /**
   * 绘制攻击状态角色
   */
  private drawAttackingCharacter(character: Character): void {
    const ctx = this.ctx;
    const config = character.config;
    const unit = this.config.unitSize;

    // 攻击动画
    const attackProgress = (this.animationTime * 5) % 1;
    const swing = Math.sin(attackProgress * Math.PI) * 30;

    // 身体
    this.drawBody(ctx, config, unit, swing * 0.2);

    // 武器（挥动）
    this.drawWeapon(ctx, config, unit, swing);

    // 头部
    this.drawHead(ctx, config, unit, 0);

    // 攻击特效
    this.drawAttackEffect(ctx, config, unit, swing);
  }

  /**
   * 绘制技能状态角色
   */
  private drawSkillCharacter(character: Character): void {
    const ctx = this.ctx;
    const config = character.config;
    const unit = this.config.unitSize;

    // 技能蓄力动画
    const chargePhase = (this.animationTime * 3) % 1;

    // 身体发光
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 20 + chargePhase * 10;

    // 身体
    this.drawBody(ctx, config, unit, 0);

    // 武器
    this.drawWeapon(ctx, config, unit, 0);

    // 头部
    this.drawHead(ctx, config, unit, 0);

    // 技能光环
    this.drawSkillAura(ctx, config, unit, chargePhase);
  }

  /**
   * 绘制受伤状态角色
   */
  private drawHurtCharacter(character: Character): void {
    const ctx = this.ctx;
    const config = character.config;
    const unit = this.config.unitSize;

    // 受伤闪烁
    const flash = Math.sin(this.animationTime * 20) > 0;

    if (flash) {
      ctx.globalAlpha = 0.5;
    }

    // 身体
    this.drawBody(ctx, config, unit, 0);

    // 武器
    this.drawWeapon(ctx, config, unit, 0);

    // 头部
    this.drawHead(ctx, config, unit, 0);
  }

  /**
   * 绘制死亡状态角色
   */
  private drawDeadCharacter(character: Character): void {
    const ctx = this.ctx;
    const config = character.config;
    const unit = this.config.unitSize;

    // 灰色效果
    ctx.filter = 'grayscale(100%)';
    ctx.globalAlpha = 0.5;

    // 倒地
    ctx.rotate(-Math.PI / 2);
    ctx.translate(0, -unit);

    // 身体
    this.drawBody(ctx, config, unit, 0);
  }

  /**
   * 绘制身体
   */
  private drawBody(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    unit: number,
    offset: number
  ): void {
    const centerX = unit / 2;
    const centerY = unit / 2;

    // 根据角色类型绘制不同体型
    ctx.fillStyle = config.color;

    if (config.id === 'berserker') {
      // 狂战士 - 健壮体型
      this.drawBerserkerBody(ctx, centerX, centerY, unit, offset);
    } else if (config.id === 'gunner') {
      // 神枪手 - 瘦长体型
      this.drawGunnerBody(ctx, centerX, centerY, unit, offset);
    } else if (config.id === 'tank') {
      // 肉盾 - 魁梧体型
      this.drawTankBody(ctx, centerX, centerY, unit, offset);
    }
  }

  /**
   * 绘制狂战士身体
   */
  private drawBerserkerBody(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    unit: number,
    offset: number
  ): void {
    // 躯干
    ctx.fillStyle = '#cc3333';
    ctx.beginPath();
    ctx.ellipse(cx, cy + offset, unit * 0.25, unit * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 装甲线条
    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - unit * 0.15, cy - unit * 0.2 + offset);
    ctx.lineTo(cx - unit * 0.15, cy + unit * 0.2 + offset);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx + unit * 0.15, cy - unit * 0.2 + offset);
    ctx.lineTo(cx + unit * 0.15, cy + unit * 0.2 + offset);
    ctx.stroke();

    // 腿部
    ctx.fillStyle = '#442222';
    ctx.fillRect(cx - unit * 0.2, cy + unit * 0.3, unit * 0.12, unit * 0.2);
    ctx.fillRect(cx + unit * 0.08, cy + unit * 0.3, unit * 0.12, unit * 0.2);
  }

  /**
   * 绘制神枪手身体
   */
  private drawGunnerBody(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    unit: number,
    offset: number
  ): void {
    // 躯干
    ctx.fillStyle = '#33cc33';
    ctx.beginPath();
    ctx.ellipse(cx, cy + offset, unit * 0.18, unit * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 战术背心
    ctx.fillStyle = '#226622';
    ctx.beginPath();
    ctx.roundRect(cx - unit * 0.15, cy - unit * 0.15 + offset, unit * 0.3, unit * 0.35, 5);
    ctx.fill();

    // 腿部
    ctx.fillStyle = '#222244';
    ctx.fillRect(cx - unit * 0.15, cy + unit * 0.3, unit * 0.1, unit * 0.2);
    ctx.fillRect(cx + unit * 0.05, cy + unit * 0.3, unit * 0.1, unit * 0.2);
  }

  /**
   * 绘制肉盾身体
   */
  private drawTankBody(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    unit: number,
    offset: number
  ): void {
    // 躯干 - 更宽大
    ctx.fillStyle = '#3333cc';
    ctx.beginPath();
    ctx.ellipse(cx, cy + offset, unit * 0.3, unit * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // 盾牌纹章
    ctx.strokeStyle = '#6666ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - unit * 0.25 + offset);
    ctx.lineTo(cx + unit * 0.2, cy - unit * 0.1 + offset);
    ctx.lineTo(cx + unit * 0.15, cy + unit * 0.2 + offset);
    ctx.lineTo(cx, cy + unit * 0.15 + offset);
    ctx.lineTo(cx - unit * 0.15, cy + unit * 0.2 + offset);
    ctx.lineTo(cx - unit * 0.2, cy - unit * 0.1 + offset);
    ctx.closePath();
    ctx.stroke();

    // 腿部
    ctx.fillStyle = '#222244';
    ctx.fillRect(cx - unit * 0.22, cy + unit * 0.32, unit * 0.14, unit * 0.18);
    ctx.fillRect(cx + unit * 0.08, cy + unit * 0.32, unit * 0.14, unit * 0.18);
  }

  /**
   * 绘制武器
   */
  private drawWeapon(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    unit: number,
    swing: number
  ): void {
    const cx = unit / 2;
    const cy = unit / 2;

    ctx.save();

    if (config.iconShape === 'sword') {
      // 长剑
      this.drawSword(ctx, cx, cy, unit, swing);
    } else if (config.iconShape === 'gun') {
      // 手枪
      this.drawGun(ctx, cx, cy, unit, swing);
    } else if (config.iconShape === 'shield') {
      // 刀和盾
      this.drawSwordAndShield(ctx, cx, cy, unit, swing);
    }

    ctx.restore();
  }

  /**
   * 绘制长剑
   */
  private drawSword(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    unit: number,
    swing: number
  ): void {
    ctx.translate(cx + unit * 0.3, cy - unit * 0.1);
    ctx.rotate((swing * Math.PI) / 180);

    // 剑身
    ctx.fillStyle = '#dddddd';
    ctx.beginPath();
    ctx.moveTo(0, -unit * 0.4);
    ctx.lineTo(unit * 0.03, 0);
    ctx.lineTo(0, unit * 0.15);
    ctx.lineTo(-unit * 0.03, 0);
    ctx.closePath();
    ctx.fill();

    // 剑柄
    ctx.fillStyle = '#884422';
    ctx.fillRect(-unit * 0.02, unit * 0.15, unit * 0.04, unit * 0.12);

    // 护手
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(-unit * 0.06, unit * 0.12, unit * 0.12, unit * 0.04);

    // 发光效果
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 5;
  }

  /**
   * 绘制手枪
   */
  private drawGun(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    unit: number,
    swing: number
  ): void {
    ctx.translate(cx + unit * 0.35, cy);
    ctx.rotate((swing * Math.PI) / 180);

    // 枪身
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, -unit * 0.04, unit * 0.25, unit * 0.08);

    // 枪管
    ctx.fillStyle = '#222222';
    ctx.fillRect(unit * 0.2, -unit * 0.03, unit * 0.1, unit * 0.06);

    // 握把
    ctx.fillStyle = '#442222';
    ctx.beginPath();
    ctx.roundRect(-unit * 0.02, unit * 0.04, unit * 0.08, unit * 0.12, 2);
    ctx.fill();

    // 瞄准器
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(unit * 0.28, -unit * 0.02, unit * 0.015, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 绘制刀和盾
   */
  private drawSwordAndShield(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    unit: number,
    swing: number
  ): void {
    // 盾牌
    ctx.save();
    ctx.translate(cx - unit * 0.3, cy);
    ctx.rotate((-swing * Math.PI) / 180);

    ctx.fillStyle = '#4466ff';
    ctx.beginPath();
    ctx.moveTo(0, -unit * 0.25);
    ctx.lineTo(unit * 0.15, -unit * 0.15);
    ctx.lineTo(unit * 0.12, unit * 0.2);
    ctx.lineTo(0, unit * 0.15);
    ctx.lineTo(-unit * 0.12, unit * 0.2);
    ctx.lineTo(-unit * 0.15, -unit * 0.15);
    ctx.closePath();
    ctx.fill();

    // 盾牌边框
    ctx.strokeStyle = '#6688ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    // 刀
    ctx.save();
    ctx.translate(cx + unit * 0.25, cy - unit * 0.05);
    ctx.rotate((swing * Math.PI) / 180);

    ctx.fillStyle = '#aaaaaa';
    ctx.beginPath();
    ctx.moveTo(0, -unit * 0.2);
    ctx.lineTo(unit * 0.02, 0);
    ctx.lineTo(0, unit * 0.1);
    ctx.lineTo(-unit * 0.02, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * 绘制头部
   */
  private drawHead(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    unit: number,
    offset: number
  ): void {
    const cx = unit / 2;
    const cy = unit * 0.15 + offset;

    // 头部轮廓
    ctx.fillStyle = '#ffddbb';
    ctx.beginPath();
    ctx.arc(cx, cy, unit * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - unit * 0.05, cy - unit * 0.02, unit * 0.02, 0, Math.PI * 2);
    ctx.arc(cx + unit * 0.05, cy - unit * 0.02, unit * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // 头盔/发型（根据角色）
    ctx.fillStyle = config.color;
    if (config.id === 'berserker') {
      // 狂战士头盔
      ctx.beginPath();
      ctx.arc(cx, cy - unit * 0.05, unit * 0.18, Math.PI, 0);
      ctx.fill();
    } else if (config.id === 'gunner') {
      // 神枪手帽子
      ctx.fillRect(cx - unit * 0.18, cy - unit * 0.22, unit * 0.36, unit * 0.08);
    } else if (config.id === 'tank') {
      // 肉盾全盔
      ctx.beginPath();
      ctx.arc(cx, cy, unit * 0.17, 0, Math.PI * 2);
      ctx.fill();
      // 面罩透明部分
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(cx - unit * 0.1, cy - unit * 0.05, unit * 0.2, unit * 0.08);
    }
  }

  /**
   * 绘制攻击特效
   */
  private drawAttackEffect(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    unit: number,
    swing: number
  ): void {
    if (swing < 20) return;

    ctx.strokeStyle = config.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 10;

    // 挥砍弧线
    ctx.beginPath();
    ctx.arc(unit * 0.7, unit * 0.3, unit * 0.3, -Math.PI * 0.5, Math.PI * 0.2);
    ctx.stroke();
  }

  /**
   * 绘制技能光环
   */
  private drawSkillAura(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    unit: number,
    phase: number
  ): void {
    const cx = unit / 2;
    const cy = unit / 2;
    const radius = unit * 0.6 * (0.8 + phase * 0.4);

    // 发光光环
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5 - phase * 0.3;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }

  /**
   * 绘制状态特效
   */
  private drawStateEffects(character: Character): void {
    const ctx = this.ctx;
    const unit = this.config.unitSize;
    const cx = unit / 2;
    const cy = unit / 2;

    // 无敌状态特效
    if (character.isInvincible) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.5 + Math.sin(this.animationTime * 10) * 0.3;
      ctx.beginPath();
      ctx.arc(cx, cy, unit * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // 装甲模式特效
    if (character.isArmored) {
      ctx.strokeStyle = '#6666ff';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, unit * 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  /**
   * 绘制角色预览（用于选角色界面）
   */
  drawPreview(config: CharacterConfig, x: number, y: number, size: number): void {
    const ctx = this.ctx;

    ctx.save();

    // 绘制光晕背景
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.2);
    glowGradient.addColorStop(0, `${config.color}44`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 根据角色类型绘制人物形象
    if (config.id === 'berserker') {
      this.drawBerserkerPreview(ctx, config, x, y, size);
    } else if (config.id === 'gunner') {
      this.drawGunnerPreview(ctx, config, x, y, size);
    } else if (config.id === 'tank') {
      this.drawTankPreview(ctx, config, x, y, size);
    }

    ctx.restore();
  }

  /**
   * 绘制狂战士预览
   */
  private drawBerserkerPreview(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    x: number,
    y: number,
    size: number
  ): void {
    const scale = size / 100;

    // 腿部
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(x - 12 * scale, y + 25 * scale, 8 * scale, 25 * scale);
    ctx.fillRect(x + 4 * scale, y + 25 * scale, 8 * scale, 25 * scale);

    // 身体 - 健壮型
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.ellipse(x, y, 18 * scale, 25 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 胸甲装饰
    ctx.fillStyle = '#aa2222';
    ctx.beginPath();
    ctx.moveTo(x - 10 * scale, y - 20 * scale);
    ctx.lineTo(x + 10 * scale, y - 20 * scale);
    ctx.lineTo(x + 8 * scale, y + 15 * scale);
    ctx.lineTo(x, y + 20 * scale);
    ctx.lineTo(x - 8 * scale, y + 15 * scale);
    ctx.closePath();
    ctx.fill();

    // 左臂 - 持剑
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x - 22 * scale, y - 5 * scale, 6 * scale, 12 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 剑
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 30 * scale, y - 25 * scale);
    ctx.lineTo(x - 35 * scale, y - 50 * scale);
    ctx.stroke();

    // 剑刃发光
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 30 * scale, y - 25 * scale);
    ctx.lineTo(x - 35 * scale, y - 50 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 右臂
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x + 20 * scale, y, 6 * scale, 12 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 头部
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.arc(x, y - 35 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 头盔
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 15 * scale, Math.PI, 0);
    ctx.fill();

    // 头盔装饰（角）
    ctx.beginPath();
    ctx.moveTo(x - 12 * scale, y - 50 * scale);
    ctx.lineTo(x - 15 * scale, y - 60 * scale);
    ctx.lineTo(x - 8 * scale, y - 52 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 12 * scale, y - 50 * scale);
    ctx.lineTo(x + 15 * scale, y - 60 * scale);
    ctx.lineTo(x + 8 * scale, y - 52 * scale);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 5 * scale, y - 35 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.arc(x + 5 * scale, y - 35 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x - 5 * scale, y - 35 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.arc(x + 5 * scale, y - 35 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * 绘制神枪手预览
   */
  private drawGunnerPreview(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    x: number,
    y: number,
    size: number
  ): void {
    const scale = size / 100;

    // 腿部
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(x - 10 * scale, y + 25 * scale, 7 * scale, 25 * scale);
    ctx.fillRect(x + 3 * scale, y + 25 * scale, 7 * scale, 25 * scale);

    // 身体 - 瘦长型
    ctx.fillStyle = '#2a4a2a';
    ctx.beginPath();
    ctx.ellipse(x, y, 14 * scale, 22 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 战术背心
    ctx.fillStyle = '#1a3a1a';
    ctx.fillRect(x - 10 * scale, y - 15 * scale, 20 * scale, 30 * scale);

    // 弹药带
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 8 * scale, y - 12 * scale);
    ctx.lineTo(x + 8 * scale, y + 8 * scale);
    ctx.stroke();

    // 左臂
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x - 18 * scale, y - 3 * scale, 5 * scale, 10 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 右臂 - 持枪
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x + 18 * scale, y - 8 * scale, 5 * scale, 10 * scale, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 枪
    ctx.fillStyle = '#333333';
    ctx.fillRect(x + 20 * scale, y - 15 * scale, 25 * scale, 6 * scale);
    ctx.fillRect(x + 42 * scale, y - 12 * scale, 8 * scale, 3 * scale);

    // 枪口闪光
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(x + 52 * scale, y - 12 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 头部
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.arc(x, y - 32 * scale, 12 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 帽子
    ctx.fillStyle = config.color;
    ctx.fillRect(x - 18 * scale, y - 45 * scale, 36 * scale, 8 * scale);
    ctx.fillRect(x - 12 * scale, y - 50 * scale, 24 * scale, 8 * scale);

    // 护目镜
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.ellipse(x, y - 32 * scale, 10 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 嘴
    ctx.strokeStyle = '#aa8866';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.arc(x, y - 25 * scale, 3 * scale, 0, Math.PI);
    ctx.stroke();
  }

  /**
   * 绘制肉盾预览
   */
  private drawTankPreview(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    x: number,
    y: number,
    size: number
  ): void {
    const scale = size / 100;

    // 腿部 - 粗壮
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(x - 14 * scale, y + 22 * scale, 10 * scale, 28 * scale);
    ctx.fillRect(x + 4 * scale, y + 22 * scale, 10 * scale, 28 * scale);

    // 身体 - 魁梧型
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.ellipse(x, y, 22 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 盾牌纹章
    ctx.strokeStyle = '#8888ff';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y - 22 * scale);
    ctx.lineTo(x + 15 * scale, y - 10 * scale);
    ctx.lineTo(x + 12 * scale, y + 18 * scale);
    ctx.lineTo(x, y + 12 * scale);
    ctx.lineTo(x - 12 * scale, y + 18 * scale);
    ctx.lineTo(x - 15 * scale, y - 10 * scale);
    ctx.closePath();
    ctx.stroke();

    // 左臂 - 持盾
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x - 28 * scale, y, 7 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 盾牌
    ctx.fillStyle = '#4466aa';
    ctx.beginPath();
    ctx.moveTo(x - 35 * scale, y - 25 * scale);
    ctx.lineTo(x - 20 * scale, y - 20 * scale);
    ctx.lineTo(x - 18 * scale, y + 20 * scale);
    ctx.lineTo(x - 30 * scale, y + 25 * scale);
    ctx.lineTo(x - 42 * scale, y + 15 * scale);
    ctx.lineTo(x - 42 * scale, y - 15 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6688cc';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 右臂 - 持刀
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x + 26 * scale, y - 5 * scale, 7 * scale, 14 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 刀
    ctx.strokeStyle = '#aaaaaa';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 30 * scale, y - 15 * scale);
    ctx.lineTo(x + 45 * scale, y - 35 * scale);
    ctx.stroke();

    // 头部
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 全盔
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 面罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(x - 10 * scale, y - 42 * scale, 20 * scale, 10 * scale);

    // 眼睛发光
    ctx.shadowColor = config.color;
    ctx.shadowBlur = 5;
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(x - 5 * scale, y - 38 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.arc(x + 5 * scale, y - 38 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
