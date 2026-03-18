/**
 * 角色渲染器管理类
 * 负责管理各个角色的渲染器，提供统一的渲染接口
 */

import { CharacterConfig } from '../types/Character';
import { CharacterDirection } from '../entities/Character';
import { ICharacterRenderer, RenderParams, PreviewRenderParams } from './ICharacterRenderer';
import { BerserkerRenderer } from './BerserkerRenderer';
import { GunnerRenderer } from './GunnerRenderer';
import { TankRenderer } from './TankRenderer';

/**
 * 角色渲染器管理类
 * 统一管理各个角色的渲染器
 */
export class CharacterRenderer {
  private ctx: CanvasRenderingContext2D;
  private animationTime: number = 0;
  private isEnchanted: boolean = false; // 附魔状态
  private chargeProgress: number = 0; // 蓄力进度 0-1
  private isRapidFire: boolean = false; // 双枪连射状态
  private rapidFireProgress: number = 0; // 双枪连射进度 0-1
  private rapidFireShotsFired: number = 0; // 已射击次数

  // 各角色的独立渲染器
  private renderers: Map<string, ICharacterRenderer> = new Map();

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    // 初始化各角色渲染器
    this.renderers.set('berserker', new BerserkerRenderer());
    this.renderers.set('gunner', new GunnerRenderer());
    this.renderers.set('tank', new TankRenderer());
  }

  /**
   * 更新动画时间
   */
  update(deltaTime: number): void {
    this.animationTime += deltaTime;
  }

  /**
   * 设置蓄力进度
   */
  setChargeProgress(progress: number): void {
    this.chargeProgress = progress;
  }

  /**
   * 获取蓄力进度
   */
  getChargeProgress(): number {
    return this.chargeProgress;
  }

  /**
   * 设置附魔状态
   */
  setEnchanted(enchanted: boolean): void {
    this.isEnchanted = enchanted;
  }

  /**
   * 获取附魔状态
   */
  getEnchanted(): boolean {
    return this.isEnchanted;
  }

  /**
   * 设置双枪连射状态
   */
  setRapidFire(isRapidFire: boolean, progress: number = 0, shotsFired: number = 0): void {
    this.isRapidFire = isRapidFire;
    this.rapidFireProgress = progress;
    this.rapidFireShotsFired = shotsFired;
  }

  /**
   * 获取双枪连射状态
   */
  getRapidFire(): { isRapidFire: boolean; progress: number; shotsFired: number } {
    return {
      isRapidFire: this.isRapidFire,
      progress: this.rapidFireProgress,
      shotsFired: this.rapidFireShotsFired,
    };
  }

  /**
   * 战斗场景：待机状态
   */
  drawBattleIdle(config: CharacterConfig, size: number): void {
    // 待机状态有轻微的呼吸效果，但不造成跳跃
    const breatheOffset = 0;
    this.drawBattleCharacterBase(config, size, breatheOffset, false);
  }

  /**
   * 战斗场景：移动状态
   */
  drawBattleMoving(config: CharacterConfig, size: number): void {
    // 移动状态有走路动画
    this.drawBattleCharacterBase(config, size, 0, true);
  }

  /**
   * 战斗场景：攻击状态
   * @param config 角色配置
   * @param size 角色尺寸
   * @param direction 角色方向
   * @param progress 攻击进度（0-1）
   * @param isChargedAttack 是否为蓄力攻击
   */
  drawBattleAttacking(config: CharacterConfig, size: number, direction: CharacterDirection, progress: number, isChargedAttack: boolean = false): void {
    // 攻击状态：挥砍动画
    // 根据攻击进度插值动画
    const attackPhase = Math.min(progress * 3, 1); // 加快攻击动画
    // 蓄力攻击挥砍幅度更大
    const swingMultiplier = isChargedAttack ? 3.5 : 2.5;
    const swingAngle = Math.sin(attackPhase * Math.PI) * swingMultiplier; // 挥砍角度

    // 绘制基础角色，传递攻击进度和挥砍角度
    this.drawBattleCharacterBase(config, size, 0, false, progress, swingAngle, direction, isChargedAttack, isChargedAttack ? 1 : 0);
  }

  /**
   * 战斗场景：蓄力状态
   * @param config 角色配置
   * @param size 角色尺寸
   * @param direction 角色方向
   * @param chargeProgress 蓄力进度（0-1）
   */
  drawBattleCharging(config: CharacterConfig, size: number, direction: CharacterDirection, chargeProgress: number): void {
    // 蓄力状态：角色微微颤抖，剑发光增强
    const shake = Math.sin(Date.now() / 50) * 2; // 震动效果
    this.drawBattleCharacterBase(config, size, shake, false, 0, -0.5, direction, true, chargeProgress);

    // 蓄力进度环特效
    this.drawChargingAura(size, chargeProgress);
  }

  /**
   * 战斗场景：冲刺状态
   * @param config 角色配置
   * @param size 角色尺寸
   * @param direction 角色方向
   * @param dashProgress 冲刺进度（0-1）
   */
  drawBattleDashing(config: CharacterConfig, size: number, direction: CharacterDirection, dashProgress: number): void {
    // 冲刺挥砍动画：快速前冲+挥剑
    // 前半段蓄力准备，后半段挥砍
    const isAttackPhase = dashProgress >= 0.3;

    // 准备阶段：身体后仰，剑向后拉
    const prepProgress = Math.min(dashProgress / 0.3, 1);

    // 攻击阶段：身体前倾，剑挥砍
    const attackProgress = isAttackPhase ? Math.min((dashProgress - 0.3) / 0.7, 1) : 0;
    const swingAngle = isAttackPhase ? Math.sin(attackProgress * Math.PI) * 3 : -prepProgress * 0.5;

    // 绘制冲刺残影
    if (dashProgress > 0) {
      this.drawDashTrail(config, size, dashProgress);
    }

    // 绘制基础角色
    this.drawBattleCharacterBase(config, size, 0, false, attackProgress, swingAngle, direction, false, 0);

    // 冲刺特效：速度线
    this.drawDashEffect(size, dashProgress);
  }

  /**
   * 绘制冲刺残影
   */
  private drawDashTrail(config: CharacterConfig, size: number, dashProgress: number): void {
    // 参数验证
    if (!Number.isFinite(dashProgress) || dashProgress < 0 || dashProgress > 1) {
      return;
    }

    const ctx = this.ctx;
    const cx = size * 0.5;
    const cy = size * 0.5;
    const scale = size / 100;

    // 残影数量随进度变化
    const trailCount = Math.floor(3 + dashProgress * 5);
    const trailSpacing = 20; // 残影间距

    for (let i = 1; i <= trailCount; i++) {
      const trailProgress = i / trailCount;
      const alpha = (1 - trailProgress) * 0.3; // 残影透明度

      // 残影位置（始终在后方，朝向由画布翻转处理）
      const offsetX = -trailSpacing * i;

      ctx.save();
      ctx.globalAlpha = alpha;

      // 绘制简化残影
      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.ellipse(cx + offsetX, cy, 15 * scale, 25 * scale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * 绘制冲刺特效
   */
  private drawDashEffect(size: number, dashProgress: number): void {
    // 参数验证
    if (!Number.isFinite(dashProgress) || dashProgress < 0 || dashProgress > 1) {
      return;
    }

    const ctx = this.ctx;
    const cx = size * 0.5;
    const cy = size * 0.5;
    const scale = size / 100;

    ctx.save();

    // 速度线
    const lineCount = 5;
    const lineWidth = 40 + dashProgress * 80;
    const lineAlpha = Math.sin(dashProgress * Math.PI) * 0.6;

    for (let i = 0; i < lineCount; i++) {
      const yOffset = (i - lineCount / 2) * 15 * scale;
      // 速度线始终在角色后方（左侧），朝向由画布翻转处理
      const startX = cx - lineWidth;
      const endX = cx - 20 * scale;

      ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(startX, cy + yOffset);
      ctx.lineTo(endX, cy + yOffset);
      ctx.stroke();
    }

    // 冲刺光晕
    const glowRadius = 30 + dashProgress * 30;
    const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
    glowGradient.addColorStop(0, `rgba(255, 200, 100, ${0.3 * dashProgress})`);
    glowGradient.addColorStop(1, 'rgba(255, 200, 100, 0)');

    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * 绘制蓄力光环特效
   * 注意：使用RGBA格式避免移动端兼容性问题
   */
  private drawChargingAura(size: number, chargeProgress: number): void {
    const ctx = this.ctx;
    const cx = size * 0.5;
    const cy = size * 0.5;

    ctx.save();
    ctx.translate(cx, cy);

    // 蓄力进度 0-1，光环颜色从黄色渐变到红色
    const progress = chargeProgress;
    const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7; // 脉冲效果

    // 根据进度计算颜色：黄色(255, 255, 0) -> 红色(255, 0, 0)
    const red = 255;
    const green = Math.floor(255 * (1 - progress)); // 255 -> 0
    const blue = 0;

    // 外圈光环 - 环形渐变
    const outerRingRadius = size * 0.9 + progress * 60;
    const outerRingWidth = 15 + progress * 20;

    // 确保内半径大于0
    const innerR = Math.max(1, outerRingRadius - outerRingWidth);
    const outerR = Math.max(innerR + 1, outerRingRadius);

    const outerGradient = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
    outerGradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0)`);
    outerGradient.addColorStop(0.5, `rgba(${red}, ${green}, ${blue}, ${0.4 * progress * pulse})`);
    outerGradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, outerR, 0, Math.PI * 2);
    ctx.fill();

    // 能量粒子特效
    this.drawChargingParticles(progress, red, green, blue, outerRingRadius);

    ctx.restore();
  }

  /**
   * 绘制蓄力粒子特效
   * 使用RGBA格式避免移动端兼容性问题
   */
  private drawChargingParticles(progress: number, red: number, green: number, blue: number, radius: number): void {
    const ctx = this.ctx;
    const particleCount = Math.floor(6 + progress * 6); // 6-12个粒子
    const time = Date.now() / 500;

    for (let i = 0; i < particleCount; i++) {
      const angle = (time + i * (Math.PI * 2 / particleCount)) % (Math.PI * 2);
      const distance = radius * (0.5 + 0.5 * Math.sin(time * 2 + i));
      const size = 3 + progress * 5;
      const alpha = (0.6 + Math.sin(time * 3 + i) * 0.4) * progress;

      ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * distance, Math.sin(angle) * distance, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * 战斗场景：绘制角色基础形象
   */
  private drawBattleCharacterBase(
    config: CharacterConfig,
    size: number,
    offset: number,
    isMoving: boolean,
    attackProgress: number = 0,
    swingAngle: number = 0,
    direction: CharacterDirection = CharacterDirection.RIGHT,
    isChargedAttack: boolean = false,
    chargeProgress: number = 0
  ): void {
    const cx = size * 0.5;
    const cy = size * 0.5 + offset;
    const walkCycle = isMoving ? this.animationTime * 0.01 : 0;
    const scale = size / 100;

    // 构建渲染参数
    const renderParams: RenderParams = {
      cx,
      cy,
      size,
      scale,
      walkCycle,
      isMoving,
      attackProgress,
      swingAngle,
      direction,
      isEnchanted: this.isEnchanted,
      isChargedAttack,
      chargeProgress: chargeProgress > 0 ? chargeProgress : this.chargeProgress,
      isRapidFire: this.isRapidFire,
      rapidFireProgress: this.rapidFireProgress,
      rapidFireShotsFired: this.rapidFireShotsFired,
    };

    // 获取对应角色的渲染器
    const renderer = this.renderers.get(config.id);
    if (renderer) {
      renderer.renderBattle(this.ctx, config, renderParams);
    }
  }

  /**
   * 绘制角色预览（用于选角色界面）- 旧版本，已弃用
   * @deprecated 使用 drawBattlePreview 代替，确保与对局渲染一致
   */
  drawPreview(config: CharacterConfig, x: number, y: number, size: number): void {
    const ctx = this.ctx;
    const scale = size / 100;

    ctx.save();

    // 绘制光晕背景
    const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 1.2);
    glowGradient.addColorStop(0, `${config.color}44`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 构建预览渲染参数
    const previewParams: PreviewRenderParams = {
      x,
      y,
      size,
      scale,
      color: config.color,
    };

    // 获取对应角色的渲染器
    const renderer = this.renderers.get(config.id);
    if (renderer) {
      renderer.renderPreview(this.ctx, config, previewParams);
    }

    ctx.restore();
  }

  /**
   * 绘制战斗风格的角色预览（用于选角色界面）
   * 复用战斗场景的渲染逻辑，确保角色选择界面和对局中的角色外观一致
   */
  drawBattlePreview(config: CharacterConfig, x: number, y: number, size: number): void {
    const ctx = this.ctx;
    const cx = x;
    const cy = y;
    const scale = size / 100;
    const walkCycle = this.animationTime * 0.003; // 缓慢的呼吸动画

    ctx.save();

    // 绘制光晕背景
    const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.2);
    glowGradient.addColorStop(0, `${config.color}44`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 构建战斗渲染参数（使用待机状态）
    const renderParams: RenderParams = {
      cx,
      cy,
      size,
      scale,
      walkCycle,
      isMoving: false, // 待机状态
      attackProgress: 0,
      swingAngle: 0,
      direction: CharacterDirection.RIGHT,
      isEnchanted: false,
      isChargedAttack: false,
      chargeProgress: 0,
      isRapidFire: false,
      rapidFireProgress: 0,
      rapidFireShotsFired: 0,
    };

    // 获取对应角色的渲染器，使用战斗渲染方法
    const renderer = this.renderers.get(config.id);
    if (renderer) {
      renderer.renderBattle(this.ctx, config, renderParams);
    }

    ctx.restore();
  }
}
