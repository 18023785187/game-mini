/**
 * 角色渲染器
 * 负责绘制角色形象，支持待机和移动状态的动画效果
 */

import { CharacterConfig } from '../types/Character';
import { CharacterDirection } from '../entities/Character';

/**
* 角色渲染器
*/
export class CharacterRenderer {
  private ctx: CanvasRenderingContext2D;
  private animationTime: number = 0;
  private isEnchanted: boolean = false; // 附魔状态
  private chargeProgress: number = 0; // 蓄力进度 0-1

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
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
    console.log('[CharacterRenderer] drawBattleCharging被调用, chargeProgress:', chargeProgress);
    // 蓄力状态：角色微微颤抖，剑发光增强
    const shake = Math.sin(Date.now() / 50) * 2; // 震动效果
    this.drawBattleCharacterBase(config, size, shake, false, 0, -0.5, direction, true, chargeProgress);

    // 蓄力进度环特效
    console.log('[CharacterRenderer] 准备绘制光环特效');
    this.drawChargingAura(size, chargeProgress);
  }

  /**
   * 绘制蓄力光环特效
   */
  private drawChargingAura(size: number, chargeProgress: number): void {
    const ctx = this.ctx;
    const cx = size * 0.5;
    const cy = size * 0.5;

    ctx.save();
    ctx.translate(cx, cy);

    // 蓄力进度 0-1，光环颜色从黄色渐变到红色
    const progress = chargeProgress;
    const hue = 60 - progress * 60; // 黄色(60) -> 红色(0)
    const saturation = 100;
    const lightness = 50 + Math.sin(Date.now() / 100) * 10; // 脉冲效果

    // 内圈光环 - 实心渐变
    const innerRadius = size * 0.6 + progress * 30;
    const outerRadius = size * 0.8 + progress * 50;

    const innerGradient = ctx.createRadialGradient(0, 0, innerRadius, 0, 0, outerRadius);
    innerGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.3 * progress})`);
    innerGradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.15 * progress})`);
    innerGradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

    ctx.fillStyle = innerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.fill();

    // 外圈光环 - 环形渐变
    const outerRingRadius = size * 0.9 + progress * 60;
    const outerRingWidth = 15 + progress * 20;

    const outerGradient = ctx.createRadialGradient(0, 0, outerRingRadius - outerRingWidth, 0, 0, outerRingRadius);
    outerGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);
    outerGradient.addColorStop(0.5, `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.4 * progress})`);
    outerGradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`);

    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(0, 0, outerRingRadius, 0, Math.PI * 2);
    ctx.fill();

    // 进度条环 - 显示蓄力进度
    const ringRadius = size * 0.5;
    const ringWidth = 8;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + progress * Math.PI * 2;

    // 背景环
    ctx.strokeStyle = `hsla(${hue}, ${saturation}%, 30%, 0.3)`;
    ctx.lineWidth = ringWidth;
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    // 进度环 - 带发光效果
    ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.shadowBlur = 15 + progress * 20;
    ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.lineWidth = ringWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, ringRadius, startAngle, endAngle);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 能量粒子特效
    this.drawChargingParticles(progress, hue, saturation, lightness, outerRingRadius);

    ctx.restore();
  }

  /**
   * 绘制蓄力粒子特效
   */
  private drawChargingParticles(progress: number, hue: number, saturation: number, lightness: number, radius: number): void {
    const ctx = this.ctx;
    const particleCount = Math.floor(6 + progress * 6); // 6-12个粒子
    const time = Date.now() / 500;

    for (let i = 0; i < particleCount; i++) {
      const angle = (time + i * (Math.PI * 2 / particleCount)) % (Math.PI * 2);
      const distance = radius * (0.5 + 0.5 * Math.sin(time * 2 + i));
      const size = 3 + progress * 5;
      const alpha = 0.6 + Math.sin(time * 3 + i) * 0.4;

      ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha * progress})`;
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

    if (config.id === 'berserker') {
      this.drawBattleBerserker(config, cx, cy, size, walkCycle, isMoving, attackProgress, swingAngle, direction, this.isEnchanted, isChargedAttack, chargeProgress);
    } else if (config.id === 'gunner') {
      this.drawBattleGunner(config, cx, cy, size, walkCycle, isMoving, attackProgress, swingAngle, direction);
    } else if (config.id === 'tank') {
      this.drawBattleTank(config, cx, cy, size, walkCycle, isMoving, attackProgress, swingAngle, direction);
    }
  }

  /**
   * 战斗场景：狂战士
   */
  private drawBattleBerserker(
    config: CharacterConfig,
    cx: number,
    cy: number,
    size: number,
    walkCycle: number,
    isMoving: boolean,
    attackProgress: number = 0,
    swingAngle: number = 0,
    _direction: CharacterDirection = CharacterDirection.RIGHT,
    isEnchanted: boolean = false,
    isChargedAttack: boolean = false,
    chargeProgress: number = 0
  ): void {
    const ctx = this.ctx;
    const scale = size / 100;

    // 腿部动画 - 更自然的行走节奏
    const rightLegAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.25 : 0;
    const leftLegAngle = isMoving ? Math.sin(walkCycle) * 0.25 : 0;
    const leftLegOffset = isMoving ? Math.sin(walkCycle) * 4 : 0;
    const rightLegOffset = isMoving ? Math.sin(walkCycle + Math.PI) * 4 : 0;

    // 后腿(左侧腿,因为向右走,左腿在后面)
    ctx.save();
    ctx.translate(cx - 5 * scale, cy + 28 * scale);
    ctx.rotate(leftLegAngle);
    // 腿部渐变
    const backLegGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    backLegGradient.addColorStop(0, '#2a1a1a');
    backLegGradient.addColorStop(0.5, '#3a2a2a');
    backLegGradient.addColorStop(1, '#1a0a0a');
    ctx.fillStyle = backLegGradient;
    // 大腿 - 更粗更自然
    ctx.beginPath();
    ctx.ellipse(0, leftLegOffset - 5 * scale, 6 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 小腿
    ctx.fillRect(-4 * scale, leftLegOffset + 6 * scale, 8 * scale, 17 * scale);
    // 脚 - 侧视轮廓
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.moveTo(-3 * scale, leftLegOffset + 23 * scale);
    ctx.lineTo(5 * scale, leftLegOffset + 23 * scale);
    ctx.lineTo(5 * scale, leftLegOffset + 28 * scale);
    ctx.lineTo(0 * scale, leftLegOffset + 31 * scale);
    ctx.lineTo(-3 * scale, leftLegOffset + 23 * scale);
    ctx.fill();
    // 脚底
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(-3 * scale, leftLegOffset + 28 * scale, 8 * scale, 2 * scale);
    ctx.restore();

    // 前腿(右侧腿,因为向右走,右腿在前面)
    ctx.save();
    ctx.translate(cx + 5 * scale, cy + 28 * scale);
    ctx.rotate(rightLegAngle);
    // 腿部渐变 - 前腿更亮
    const frontLegGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    frontLegGradient.addColorStop(0, '#3a2a2a');
    frontLegGradient.addColorStop(0.5, '#4a3a3a');
    frontLegGradient.addColorStop(1, '#2a1a1a');
    ctx.fillStyle = frontLegGradient;
    // 大腿 - 更粗更自然
    ctx.beginPath();
    ctx.ellipse(0, rightLegOffset - 5 * scale, 6 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 小腿
    ctx.fillRect(-4 * scale, rightLegOffset + 6 * scale, 8 * scale, 17 * scale);
    // 脚 - 侧视轮廓
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.moveTo(-3 * scale, rightLegOffset + 23 * scale);
    ctx.lineTo(5 * scale, rightLegOffset + 23 * scale);
    ctx.lineTo(5 * scale, rightLegOffset + 28 * scale);
    ctx.lineTo(0 * scale, rightLegOffset + 31 * scale);
    ctx.lineTo(-3 * scale, rightLegOffset + 23 * scale);
    ctx.fill();
    // 脚底高光
    ctx.fillStyle = '#3a2a2a';
    ctx.fillRect(-3 * scale, rightLegOffset + 28 * scale, 8 * scale, 2 * scale);
    ctx.restore();

    // 手臂动画：走路时手臂摆动
    const leftArmAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.2 : 0;
    const rightArmAngle = isMoving ? Math.sin(walkCycle) * 0.2 : 0;

    // 右臂 - 持剑（剑在身体后面）
    ctx.save();
    // 右臂基础位置
    ctx.translate(cx + 22 * scale, cy - 2 * scale);
    // 走路时手臂摆动，攻击时加上挥砍角度
    const armRotation = rightArmAngle - 0.3 + (attackProgress > 0 ? swingAngle : 0);
    ctx.rotate(armRotation);

    // 在手的位置绘制巨剑（手握住剑柄）
    // 巨剑 - 90单位长度，华丽设计
    const swordAngle = isMoving ? Math.sin(walkCycle) * 0.1 : 0;
    ctx.save();
    ctx.rotate(-0.2 + swordAngle); // 剑的基础角度和走路摆动

    // 粗铁剑柄 - 缠绕皮革质感
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-5 * scale, -7 * scale, 10 * scale, 14 * scale);

    // 剑柄纹理
    ctx.strokeStyle = '#2a1a0f';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 4; i++) {
      const y = -5 * scale + i * 3.5 * scale;
      ctx.beginPath();
      ctx.moveTo(-5 * scale, y);
      ctx.lineTo(5 * scale, y);
      ctx.stroke();
    }

    // 护手 - 更厚重的十字护手
    ctx.fillStyle = '#5a4a3a'; // 铁质感
    ctx.fillRect(-16 * scale, -14 * scale, 32 * scale, 8 * scale);
    // 护手阴影
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-16 * scale, -8 * scale, 32 * scale, 2 * scale);

    // 护手高光
    ctx.fillStyle = '#7a6a5a';
    ctx.fillRect(-16 * scale, -14 * scale, 32 * scale, 2 * scale);

    // 护手侧翼装饰
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-18 * scale, -12 * scale, 4 * scale, 4 * scale);
    ctx.fillRect(14 * scale, -12 * scale, 4 * scale, 4 * scale);

    // 粗铁剑刃 - 更宽更厚重，剑长180像素（3单位射程）
    const bladeLength = 180 * scale; // 剑长对应射程3单位
    const bladeWidth = 10 * scale; // 粗剑
    const bladeGradient = ctx.createLinearGradient(-bladeWidth, -bladeLength, bladeWidth, -14 * scale);
    bladeGradient.addColorStop(0, '#5a5a5a'); // 剑尖深色
    bladeGradient.addColorStop(0.2, '#7a7a7a');
    bladeGradient.addColorStop(0.4, '#9a9a9a');
    bladeGradient.addColorStop(0.6, '#8a8a8a');
    bladeGradient.addColorStop(0.8, '#6a6a6a');
    bladeGradient.addColorStop(1, '#4a4a4a'); // 剑根深色

    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth, -14 * scale); // 剑根左侧
    ctx.lineTo(-bladeWidth * 0.7, -bladeLength + 10 * scale); // 中段收窄
    ctx.lineTo(0, -bladeLength); // 剑尖
    ctx.lineTo(bladeWidth * 0.7, -bladeLength + 10 * scale); // 中段收窄
    ctx.lineTo(bladeWidth, -14 * scale); // 剑根右侧
    ctx.closePath();
    ctx.fill();

    // 剑刃边缘 - 打磨效果
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth, -14 * scale);
    ctx.lineTo(-bladeWidth * 0.7, -bladeLength + 10 * scale);
    ctx.lineTo(0, -bladeLength);
    ctx.lineTo(bladeWidth * 0.7, -bladeLength + 10 * scale);
    ctx.lineTo(bladeWidth, -14 * scale);
    ctx.stroke();

    // 剑刃中线 - 血槽
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(-3 * scale, -19 * scale);
    ctx.lineTo(0, -109 * scale);
    ctx.lineTo(3 * scale, -19 * scale);
    ctx.closePath();
    ctx.fill();

    // 剑刃纹理 - 锻造痕迹
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 0.5 * scale;
    for (let i = 0; i < 6; i++) {
      const y = -24 * scale - i * 12 * scale;
      if (y < -104) break;
      ctx.beginPath();
      ctx.moveTo(-bladeWidth * 0.8 + i * 0.5 * scale, y);
      ctx.lineTo(bladeWidth * 0.8 - i * 0.5 * scale, y + 2);
      ctx.stroke();
    }

    // 剑刃锋芒（攻击时发光）
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2 * scale;

    // 蓄力状态 - 剑刃根据蓄力程度发光
    if (isChargedAttack && chargeProgress > 0) {
      // 蓄力时剑刃逐渐变亮变红
      const chargeIntensity = chargeProgress; // 0-1
      const chargePulse = Math.sin(Date.now() / 100) * 0.2 + 0.8; // 蓄力时快速脉冲
      const redComponent = Math.floor(100 + chargeIntensity * 155); // 100-255
      const blurAmount = 15 + chargeIntensity * 25; // 15-40px模糊

      ctx.shadowColor = `rgb(${redComponent}, ${Math.floor(100 - chargeIntensity * 50)}, ${Math.floor(50 - chargeIntensity * 30)})`;
      ctx.shadowBlur = blurAmount * chargePulse;
      ctx.strokeStyle = `rgb(${Math.min(255, redComponent + 50)}, ${Math.floor(150 - chargeIntensity * 50)}, ${Math.floor(100 - chargeIntensity * 30)})`;
    } else if (isEnchanted) {
      // 附魔状态 - 持续发光
      const enchantPulse = Math.sin(Date.now() / 200) * 0.3 + 0.7; // 0.4-1.0之间波动
      ctx.shadowColor = '#ff0000'; // 红色附魔光芒
      ctx.shadowBlur = 30 * enchantPulse;
      ctx.strokeStyle = '#ff3333';
    } else if (attackProgress > 0.3 && attackProgress < 0.8) {
      // 攻击时发光效果 - 铁质光芒
      const glowIntensity = Math.sin((attackProgress - 0.3) / 0.5 * Math.PI);
      ctx.shadowColor = '#ff6644'; // 橙红色光芒
      ctx.shadowBlur = 20 * glowIntensity;
      ctx.strokeStyle = '#fff';
    }

    ctx.beginPath();
    ctx.moveTo(-bladeWidth * 0.5, -16 * scale);
    ctx.lineTo(0, -bladeLength + 5 * scale);
    ctx.lineTo(bladeWidth * 0.5, -16 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore(); // 结束剑的变换

    // 在剑柄位置绘制右手（握住剑）
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * scale, 14 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 手指握住剑柄的细节
    ctx.fillStyle = '#cc9977';
    ctx.beginPath();
    ctx.ellipse(-3 * scale, -2 * scale, 3 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(3 * scale, -2 * scale, 3 * scale, 4 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // 结束右手（和剑）的变换

    // 身体 - 更有质感的渐变
    const bodyGradient = ctx.createRadialGradient(cx - 5 * scale, cy - 10 * scale, 0, cx, cy, 22 * scale);
    bodyGradient.addColorStop(0, '#c43c3c'); // 高光
    bodyGradient.addColorStop(0.5, config.color); // 主色
    bodyGradient.addColorStop(1, '#6b1515'); // 阴影
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 20 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 身体高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.ellipse(cx - 5 * scale, cy - 8 * scale, 8 * scale, 12 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 护肩 - 铁质厚重感
    const shoulderGradient = ctx.createLinearGradient(0, 0, 0, 24 * scale);
    shoulderGradient.addColorStop(0, '#9a9a9a');
    shoulderGradient.addColorStop(0.5, '#6a6a6a');
    shoulderGradient.addColorStop(1, '#4a4a4a');

    // 左护肩
    ctx.save();
    ctx.translate(cx - 20 * scale, cy - 10 * scale);
    ctx.rotate(-0.4);
    ctx.fillStyle = shoulderGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 护肩高光
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 右护肩
    ctx.save();
    ctx.translate(cx + 20 * scale, cy - 8 * scale);
    ctx.rotate(0.4);
    ctx.fillStyle = shoulderGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 护肩高光
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 0, 10 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 胸甲 - 更厚重更有质感
    const chestGradient = ctx.createLinearGradient(cx - 12 * scale, 0, cx + 12 * scale, 0);
    chestGradient.addColorStop(0, '#5a0a0a');
    chestGradient.addColorStop(0.3, '#8B0000');
    chestGradient.addColorStop(0.7, '#8B0000');
    chestGradient.addColorStop(1, '#5a0a0a');

    ctx.fillStyle = chestGradient;
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 12 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 10 * scale, cy + 18 * scale);
    ctx.lineTo(cx, cy + 22 * scale);
    ctx.lineTo(cx - 10 * scale, cy + 18 * scale);
    ctx.closePath();
    ctx.fill();

    // 胸甲边框 - 铁质边缘
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // 胸甲高光边框
    ctx.strokeStyle = '#aa4a4a';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, cy - 18 * scale);
    ctx.lineTo(cx + 10 * scale, cy - 18 * scale);
    ctx.stroke();

    // 胸甲装饰 - 铁质纹路
    ctx.strokeStyle = '#6a6a6a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 22 * scale);
    ctx.lineTo(cx, cy + 22 * scale);
    ctx.stroke();

    // 胸甲铆钉
    const rivetPositions = [
      { x: cx, y: cy - 18 * scale },
      { x: cx, y: cy - 6 * scale },
      { x: cx, y: cy + 6 * scale },
      { x: cx, y: cy + 18 * scale },
    ];
    ctx.fillStyle = '#8a8a8a';
    rivetPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      // 铆钉高光
      ctx.fillStyle = '#aaa';
      ctx.beginPath();
      ctx.arc(pos.x - 0.5 * scale, pos.y - 0.5 * scale, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a8a8a';
    });

    // 后臂(左手,在左护肩下方)
    ctx.save();
    ctx.translate(cx - 22 * scale, cy + 8 * scale);
    ctx.rotate(leftArmAngle + 0.1);

    // 手臂 - 从肩膀到手掌
    const armGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    armGradient.addColorStop(0, '#cc9977');
    armGradient.addColorStop(0.5, '#ddaa88');
    armGradient.addColorStop(1, '#cc9977');
    ctx.fillStyle = armGradient;
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 5 * scale, 12 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 手掌
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 8 * scale, 5 * scale, 6 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 大拇指
    ctx.beginPath();
    ctx.ellipse(-5 * scale, 5 * scale, 2 * scale, 4 * scale, -0.8, 0, Math.PI * 2);
    ctx.fill();

    // 食指
    ctx.beginPath();
    ctx.ellipse(3 * scale, 14 * scale, 2 * scale, 5 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 中指
    ctx.beginPath();
    ctx.ellipse(5 * scale, 13 * scale, 2 * scale, 5.5 * scale, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 无名指
    ctx.beginPath();
    ctx.ellipse(6 * scale, 11 * scale, 1.8 * scale, 5 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 小指
    ctx.beginPath();
    ctx.ellipse(6 * scale, 9 * scale, 1.5 * scale, 4 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 手掌渐变阴影
    const handGradient = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, 0);
    handGradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
    handGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = handGradient;
    ctx.beginPath();
    ctx.ellipse(0, 8 * scale, 5 * scale, 6 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 头部 - 侧脸效果,椭圆更扁
    const headGradient = ctx.createRadialGradient(cx + 3 * scale, cy - 38 * scale, 0, cx, cy - 35 * scale, 12 * scale);
    headGradient.addColorStop(0, '#eec090');
    headGradient.addColorStop(1, '#cc8866');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 35 * scale, 12 * scale, 14 * scale, 0, 0, Math.PI * 2); // 更窄的头部
    ctx.fill();

    // 头盔 - 侧脸效果,只画前面部分
    const helmetGradient = ctx.createLinearGradient(cx - 10 * scale, 0, cx + 10 * scale, 0);
    helmetGradient.addColorStop(0, '#6a0a0a');
    helmetGradient.addColorStop(0.5, config.color);
    helmetGradient.addColorStop(1, '#4a0a0a');

    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.arc(cx, cy - 38 * scale, 14 * scale, Math.PI, 0);
    ctx.fill();

    // 头盔高光(在右侧受光面)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(cx + 3 * scale, cy - 42 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 头盔顶冠 - 侧脸只显示右边
    ctx.save();
    ctx.translate(cx, cy - 52 * scale);
    ctx.fillStyle = '#6a6a6a';
    ctx.beginPath();
    ctx.moveTo(-2 * scale, 8 * scale);
    ctx.lineTo(0, -12 * scale);
    ctx.lineTo(5 * scale, 8 * scale);
    ctx.closePath();
    ctx.fill();

    // 顶冠高光
    ctx.fillStyle = '#9a9a9a';
    ctx.beginPath();
    ctx.moveTo(0, 8 * scale);
    ctx.lineTo(0, -12 * scale);
    ctx.lineTo(2 * scale, 8 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 眼睛 - 侧脸只显示右眼
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(cx + 4 * scale, cy - 35 * scale, 2.5 * scale, 3 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛发光效果
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#FFF8DC';
    ctx.beginPath();
    ctx.arc(cx + 4 * scale, cy - 35 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 眉毛 - 侧脸只显示右眉
    ctx.strokeStyle = '#4a4a4a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 2 * scale, cy - 40 * scale);
    ctx.lineTo(cx + 6 * scale, cy - 38 * scale);
    ctx.stroke();

    // 胡须 - 侧脸,更小
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 28 * scale);
    ctx.lineTo(cx + 5 * scale, cy - 25 * scale);
    ctx.lineTo(cx + 8 * scale, cy - 28 * scale);
    ctx.lineTo(cx + 6 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 3 * scale, cy - 20 * scale);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 战斗场景：神枪手
   */
  private drawBattleGunner(
    _config: CharacterConfig,
    cx: number,
    cy: number,
    size: number,
    walkCycle: number,
    isMoving: boolean,
    _attackProgress: number = 0,
    _swingAngle: number = 0,
    _direction: CharacterDirection = CharacterDirection.RIGHT,
    _isEnchanted: boolean = false
  ): void {
    const ctx = this.ctx;
    const scale = size / 100;

    // 腿部动画 - 神秘暗色
    const leftLegOffset = isMoving ? Math.sin(walkCycle) * 5 : 0;
    const rightLegOffset = isMoving ? Math.sin(walkCycle + Math.PI) * 5 : 0;

    const legGradient = ctx.createLinearGradient(cx - 10 * scale, 0, cx + 10 * scale, 0);
    legGradient.addColorStop(0, '#0a0a1a');
    legGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = legGradient;
    ctx.fillRect(cx - 10 * scale, cy + 25 * scale + leftLegOffset, 7 * scale, 25 * scale);
    ctx.fillRect(cx + 3 * scale, cy + 25 * scale + rightLegOffset, 7 * scale, 25 * scale);

    // 身体 - 神秘深色调
    const bodyGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22 * scale);
    bodyGradient.addColorStop(0, '#2a2a3a');
    bodyGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 15 * scale, 24 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 战术背心 - 霓虹细节
    ctx.fillStyle = '#15151f';
    ctx.fillRect(cx - 11 * scale, cy - 16 * scale, 22 * scale, 32 * scale);
    
    // 霓虹纹路
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(cx - 9 * scale, cy - 14 * scale);
    ctx.lineTo(cx - 5 * scale, cy + 12 * scale);
    ctx.moveTo(cx + 9 * scale, cy - 14 * scale);
    ctx.lineTo(cx + 5 * scale, cy + 12 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 手臂动画
    const leftArmOffset = isMoving ? Math.sin(walkCycle + Math.PI) * 3 : 0;
    const rightArmOffset = isMoving ? Math.sin(walkCycle) * 3 : 0;

    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.ellipse(cx - 18 * scale, cy - 3 * scale + leftArmOffset, 6 * scale, 11 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 18 * scale, cy - 8 * scale + rightArmOffset, 6 * scale, 11 * scale, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 神秘狙击枪
    const gunAngle = isMoving ? Math.sin(walkCycle) * 0.05 : 0;
    ctx.save();
    ctx.translate(cx + 25 * scale, cy - 12 * scale);
    ctx.rotate(0.3 + gunAngle);

    // 枪身 - 科技感设计
    const gunGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    gunGradient.addColorStop(0, '#2a2a3a');
    gunGradient.addColorStop(0.5, '#3a3a4a');
    gunGradient.addColorStop(1, '#2a2a3a');
    ctx.fillStyle = gunGradient;
    ctx.fillRect(-4 * scale, -8 * scale, 35 * scale, 8 * scale);

    // 枪管
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(30 * scale, -6 * scale, 15 * scale, 4 * scale);

    // 霓虹光条
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(28 * scale, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 瞄准镜
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.ellipse(5 * scale, -10 * scale, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // 瞄准镜透镜 - 神秘光芒
    ctx.fillStyle = '#00ffcc';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(5 * scale, -10 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 枪口
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2 * scale;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(45 * scale, -4 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();

    // 头部 - 神秘面罩
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.arc(cx, cy - 32 * scale, 13 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 面罩 - 半透明
    ctx.fillStyle = '#00ffcc';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(cx, cy - 32 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 面罩上的神秘符号
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 4 * scale, cy - 35 * scale);
    ctx.lineTo(cx, cy - 32 * scale);
    ctx.lineTo(cx + 4 * scale, cy - 35 * scale);
    ctx.moveTo(cx - 3 * scale, cy - 30 * scale);
    ctx.lineTo(cx + 3 * scale, cy - 30 * scale);
    ctx.stroke();

    // 披风 - 飘动效果
    const capeAngle = isMoving ? Math.sin(walkCycle) * 0.15 : 0;
    ctx.save();
    ctx.translate(cx - 12 * scale, cy - 15 * scale);
    ctx.rotate(capeAngle);
    
    const capeGradient = ctx.createLinearGradient(-25 * scale, 0, -5 * scale, 0);
    capeGradient.addColorStop(0, 'rgba(20, 20, 30, 0.9)');
    capeGradient.addColorStop(1, 'rgba(0, 255, 204, 0.3)');
    ctx.fillStyle = capeGradient;
    ctx.beginPath();
    ctx.moveTo(-5 * scale, -10 * scale);
    ctx.lineTo(-25 * scale, -8 * scale + (isMoving ? Math.sin(walkCycle) * 8 * scale : 0));
    ctx.lineTo(-28 * scale, 15 * scale + (isMoving ? Math.cos(walkCycle) * 5 * scale : 0));
    ctx.lineTo(-5 * scale, 12 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * 战斗场景：肉盾
   */
  private drawBattleTank(
    _config: CharacterConfig,
    cx: number,
    cy: number,
    size: number,
    walkCycle: number,
    isMoving: boolean,
    _attackProgress: number = 0,
    _swingAngle: number = 0,
    _direction: CharacterDirection = CharacterDirection.RIGHT,
    _isEnchanted: boolean = false
  ): void {
    const ctx = this.ctx;
    const scale = size / 100;

    // 腿部动画：将军风格的腿部，更修长有力
    const leftLegOffset = isMoving ? Math.sin(walkCycle) * 4 : 0;
    const rightLegOffset = isMoving ? Math.sin(walkCycle + Math.PI) * 4 : 0;

    const legGradient = ctx.createLinearGradient(cx - 14 * scale, 0, cx + 14 * scale, 0);
    legGradient.addColorStop(0, '#2a2a3a');
    legGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = legGradient;
    ctx.fillRect(cx - 12 * scale, cy + 24 * scale + leftLegOffset, 8 * scale, 26 * scale);
    ctx.fillRect(cx + 4 * scale, cy + 24 * scale + rightLegOffset, 8 * scale, 26 * scale);

    // 身体 - 将军风格，挺拔威武
    const bodyGradient = ctx.createRadialGradient(cx, cy - 5, 0, cx, cy - 5, 20 * scale);
    bodyGradient.addColorStop(0, '#4a4a6a');
    bodyGradient.addColorStop(0.5, '#3a3a5a');
    bodyGradient.addColorStop(1, '#2a2a4a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 3, 18 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 将军披风 - 金色纹路
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(cx - 18 * scale, cy - 12 * scale, 36 * scale, 28 * scale);
    
    // 披风上的金色徽章
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10 * scale);
    ctx.lineTo(cx, cy + 14 * scale);
    ctx.moveTo(cx - 8 * scale, cy + 2 * scale);
    ctx.lineTo(cx + 8 * scale, cy + 2 * scale);
    ctx.stroke();

    // 将军肩章
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(cx - 18 * scale, cy - 8 * scale, 6 * scale, 8 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 18 * scale, cy - 6 * scale, 6 * scale, 8 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 手臂动画：左臂持盾，右臂持大刀
    const rightArmOffset = isMoving ? Math.sin(walkCycle) * 3 : 0;

    ctx.fillStyle = '#3a3a5a';
    ctx.beginPath();
    ctx.ellipse(cx - 26 * scale, cy - 2, 7 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 24 * scale, cy - 7 * scale + rightArmOffset, 7 * scale, 15 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 木铁盾牌 - 将军风格
    const shieldAngle = isMoving ? Math.sin(walkCycle) * 0.03 : 0;
    ctx.save();
    ctx.translate(cx - 40 * scale, cy - 5);
    ctx.rotate(shieldAngle);

    // 盾牌主体 - 木质感
    const woodGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 * scale);
    woodGradient.addColorStop(0, '#A0522D');
    woodGradient.addColorStop(0.5, '#8B4513');
    woodGradient.addColorStop(1, '#654321');
    ctx.fillStyle = woodGradient;
    ctx.beginPath();
    ctx.moveTo(0, -30 * scale);
    ctx.lineTo(25 * scale, -20 * scale);
    ctx.lineTo(22 * scale, 25 * scale);
    ctx.lineTo(0, 30 * scale);
    ctx.lineTo(-22 * scale, 25 * scale);
    ctx.lineTo(-25 * scale, -20 * scale);
    ctx.closePath();
    ctx.fill();

    // 铁质边框
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 4 * scale;
    ctx.stroke();

    // 铁质边框高光
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // 盾牌上的铁质装饰
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 铁质铆钉
    ctx.fillStyle = '#4a4a6a';
    const rivets = [
      [0, -22 * scale], [-15 * scale, -12 * scale], [15 * scale, -12 * scale],
      [-18 * scale, 5 * scale], [18 * scale, 5 * scale], [0, 22 * scale]
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // 将军徽章
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(0, -8 * scale);
    ctx.lineTo(6 * scale, 0);
    ctx.lineTo(0, 8 * scale);
    ctx.lineTo(-6 * scale, 0);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    // 大刀 - 将军重剑，长度约2个射程单位（60单位）
    const swordAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.08 : 0;
    ctx.save();
    ctx.translate(cx + 45 * scale, cy - 15 * scale);
    ctx.rotate(0.4 + swordAngle);

    // 刀柄
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-4 * scale, 15 * scale, 8 * scale, 18 * scale);
    
    // 护手 - 将军风格
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, 15 * scale, 15 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // 刀刃主体 - 宽大威武
    const bladeGradient = ctx.createLinearGradient(-12 * scale, -60 * scale, 12 * scale, 15 * scale);
    bladeGradient.addColorStop(0, '#C0C0C0');
    bladeGradient.addColorStop(0.3, '#D3D3D3');
    bladeGradient.addColorStop(0.7, '#A9A9A9');
    bladeGradient.addColorStop(1, '#808080');
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(-12 * scale, 15 * scale);
    ctx.lineTo(0, -60 * scale);
    ctx.lineTo(12 * scale, 15 * scale);
    ctx.closePath();
    ctx.fill();

    // 刀刃锋芒
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(0, 15 * scale);
    ctx.lineTo(0, -60 * scale);
    ctx.stroke();

    // 刀刃纹路 - 铁锤锻打痕迹
    ctx.strokeStyle = '#909090';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 5; i++) {
      const y = -5 - i * 12;
      ctx.beginPath();
      ctx.moveTo(-8 * scale, y);
      ctx.lineTo(8 * scale, y - 3);
      ctx.stroke();
    }

    // 刀背加厚
    ctx.fillStyle = '#707070';
    ctx.beginPath();
    ctx.moveTo(-12 * scale, 15 * scale);
    ctx.lineTo(-6 * scale, -55 * scale);
    ctx.lineTo(0, -50 * scale);
    ctx.lineTo(-6 * scale, 15 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12 * scale, 15 * scale);
    ctx.lineTo(6 * scale, -55 * scale);
    ctx.lineTo(0, -50 * scale);
    ctx.lineTo(6 * scale, 15 * scale);
    ctx.closePath();
    ctx.fill();

    // 刀刃发光效果
    ctx.shadowColor = '#C0C0C0';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(200, 200, 220, 0.4)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(-12 * scale, 15 * scale);
    ctx.lineTo(0, -60 * scale);
    ctx.lineTo(12 * scale, 15 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();

    // 头部 - 将军风范
    ctx.fillStyle = '#3a3a5a';
    ctx.beginPath();
    ctx.arc(cx, cy - 38 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 将军头盔
    const helmetGradient = ctx.createRadialGradient(cx, cy - 38 * scale, 0, cx, cy - 38 * scale, 15 * scale);
    helmetGradient.addColorStop(0, '#5a5a7a');
    helmetGradient.addColorStop(1, '#3a3a5a');
    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.arc(cx, cy - 38 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 头盔羽饰
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 53 * scale);
    ctx.lineTo(cx - 3 * scale, cy - 43 * scale);
    ctx.lineTo(cx + 3 * scale, cy - 43 * scale);
    ctx.closePath();
    ctx.fill();

    // 将军面罩
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(cx - 10 * scale, cy - 42 * scale, 20 * scale, 10 * scale);
    ctx.strokeStyle = '#3a3a5a';
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(cx - 10 * scale, cy - 42 * scale, 20 * scale, 10 * scale);

    // 眼睛 - 威严感
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(cx - 4 * scale, cy - 37 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 4 * scale, cy - 37 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
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
    ctx.fillRect(x - 10 * scale, y + 25 * scale, 8 * scale, 25 * scale);
    ctx.fillRect(x + 2 * scale, y + 25 * scale, 8 * scale, 25 * scale);

    // 身体
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.ellipse(x, y, 20 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 护肩
    ctx.fillStyle = '#888899';
    ctx.beginPath();
    ctx.ellipse(x - 20 * scale, y - 10 * scale, 8 * scale, 12 * scale, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 20 * scale, y - 8 * scale, 8 * scale, 12 * scale, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 胸甲
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(x - 12 * scale, y - 22 * scale);
    ctx.lineTo(x + 12 * scale, y - 22 * scale);
    ctx.lineTo(x + 10 * scale, y + 18 * scale);
    ctx.lineTo(x, y + 22 * scale);
    ctx.lineTo(x - 10 * scale, y + 18 * scale);
    ctx.closePath();
    ctx.fill();

    // 胸甲装饰
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y - 22 * scale);
    ctx.lineTo(x, y + 22 * scale);
    ctx.moveTo(x - 8 * scale, y - 15 * scale);
    ctx.lineTo(x - 5 * scale, y + 10 * scale);
    ctx.moveTo(x + 8 * scale, y - 15 * scale);
    ctx.lineTo(x + 5 * scale, y + 10 * scale);
    ctx.stroke();

    // 左臂 - 持剑
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x - 24 * scale, y - 8 * scale, 7 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 剑鞘
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(x - 27 * scale, y - 43 * scale, 6 * scale, 25 * scale);

    // 巨剑
    const bladeGradient = ctx.createLinearGradient(x - 39 * scale, y - 135 * scale, x - 31 * scale, y - 45 * scale);
    bladeGradient.addColorStop(0, '#E8E8E8');
    bladeGradient.addColorStop(0.3, '#FFFFFF');
    bladeGradient.addColorStop(0.7, '#D0D0D0');
    bladeGradient.addColorStop(1, '#A0A0A0');
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(x - 39 * scale, y - 45 * scale);
    ctx.lineTo(x - 35 * scale, y - 135 * scale);
    ctx.lineTo(x - 31 * scale, y - 45 * scale);
    ctx.closePath();
    ctx.fill();

    // 剑刃锋芒
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 35 * scale, y - 45 * scale);
    ctx.lineTo(x - 35 * scale, y - 135 * scale);
    ctx.stroke();

    // 护手
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(x - 47 * scale, y - 60 * scale, 24 * scale, 6 * scale);

    // 剑柄
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(x - 38 * scale, y - 60 * scale, 6 * scale, 12 * scale);

    // 剑刃发光
    ctx.shadowColor = '#C0C0FF';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 39 * scale, y - 45 * scale);
    ctx.lineTo(x - 35 * scale, y - 135 * scale);
    ctx.lineTo(x - 31 * scale, y - 45 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 右臂
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x + 22 * scale, y - 2 * scale, 7 * scale, 14 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 头部
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 16 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 头盔
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 16 * scale, Math.PI, 0);
    ctx.fill();

    // 头盔侧翼
    ctx.beginPath();
    ctx.moveTo(x - 16 * scale, y - 38 * scale);
    ctx.lineTo(x - 20 * scale, y - 45 * scale);
    ctx.lineTo(x - 18 * scale, y - 32 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 16 * scale, y - 38 * scale);
    ctx.lineTo(x + 20 * scale, y - 45 * scale);
    ctx.lineTo(x + 18 * scale, y - 32 * scale);
    ctx.fill();

    // 头盔顶冠
    ctx.beginPath();
    ctx.moveTo(x, y - 54 * scale);
    ctx.lineTo(x - 4 * scale, y - 44 * scale);
    ctx.lineTo(x + 4 * scale, y - 44 * scale);
    ctx.closePath();
    ctx.fill();

    // 护面甲
    ctx.fillStyle = '#666666';
    ctx.fillRect(x - 8 * scale, y - 42 * scale, 16 * scale, 8 * scale);

    // 眼睛
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x - 5 * scale, y - 35 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.arc(x + 5 * scale, y - 35 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛发光
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x - 5 * scale, y - 35 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.arc(x + 5 * scale, y - 35 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  /**
   * 绘制神枪手预览
   */
  private drawGunnerPreview(
    ctx: CanvasRenderingContext2D,
    _config: CharacterConfig,
    x: number,
    y: number,
    size: number
  ): void {
    const scale = size / 100;

    // 腿部
    const legGradient = ctx.createLinearGradient(x - 10 * scale, 0, x + 10 * scale, 0);
    legGradient.addColorStop(0, '#0a0a1a');
    legGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = legGradient;
    ctx.fillRect(x - 10 * scale, y + 25 * scale, 7 * scale, 25 * scale);
    ctx.fillRect(x + 3 * scale, y + 25 * scale, 7 * scale, 25 * scale);

    // 身体
    const bodyGradient = ctx.createRadialGradient(x, y, 0, x, y, 22 * scale);
    bodyGradient.addColorStop(0, '#2a2a3a');
    bodyGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, 15 * scale, 24 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 战术背心
    ctx.fillStyle = '#15151f';
    ctx.fillRect(x - 11 * scale, y - 16 * scale, 22 * scale, 32 * scale);

    // 霓虹纹路
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x - 9 * scale, y - 14 * scale);
    ctx.lineTo(x - 5 * scale, y + 12 * scale);
    ctx.moveTo(x + 9 * scale, y - 14 * scale);
    ctx.lineTo(x + 5 * scale, y + 12 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 左臂
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.ellipse(x - 18 * scale, y - 3 * scale, 6 * scale, 11 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 右臂 - 持枪
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.ellipse(x + 18 * scale, y - 8 * scale, 6 * scale, 11 * scale, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 枪
    const gunGradient = ctx.createLinearGradient(x + 20 * scale, 0, x + 30 * scale, 0);
    gunGradient.addColorStop(0, '#2a2a3a');
    gunGradient.addColorStop(0.5, '#3a3a4a');
    gunGradient.addColorStop(1, '#2a2a3a');
    ctx.fillStyle = gunGradient;
    ctx.fillRect(x + 21 * scale, y - 20 * scale, 35 * scale, 8 * scale);
    ctx.fillStyle = '#1a1a2a';
    ctx.fillRect(x + 56 * scale, y - 18 * scale, 15 * scale, 4 * scale);

    // 霓虹光条
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 1.5 * scale;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(x + 25 * scale, y - 16 * scale);
    ctx.lineTo(x + 53 * scale, y - 16 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 瞄准镜
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.ellipse(x + 30 * scale, y - 28 * scale, 8 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // 瞄准镜透镜
    ctx.fillStyle = '#00ffcc';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(x + 30 * scale, y - 28 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 枪口
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2 * scale;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x + 73 * scale, y - 16 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 头部
    ctx.fillStyle = '#2a2a3a';
    ctx.beginPath();
    ctx.arc(x, y - 32 * scale, 13 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 面罩
    ctx.fillStyle = '#00ffcc';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(x, y - 32 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 面罩符号
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 4 * scale, y - 35 * scale);
    ctx.lineTo(x, y - 32 * scale);
    ctx.lineTo(x + 4 * scale, y - 35 * scale);
    ctx.moveTo(x - 3 * scale, y - 30 * scale);
    ctx.lineTo(x + 3 * scale, y - 30 * scale);
    ctx.stroke();

    // 披风
    const capeGradient = ctx.createLinearGradient(x - 25 * scale, 0, x - 5 * scale, 0);
    capeGradient.addColorStop(0, 'rgba(20, 20, 30, 0.9)');
    capeGradient.addColorStop(1, 'rgba(0, 255, 204, 0.3)');
    ctx.fillStyle = capeGradient;
    ctx.beginPath();
    ctx.moveTo(x - 17 * scale, y - 25 * scale);
    ctx.lineTo(x - 37 * scale, y - 23 * scale);
    ctx.lineTo(x - 40 * scale, y + 10 * scale);
    ctx.lineTo(x - 17 * scale, y + 7 * scale);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 绘制肉盾预览
   */
  private drawTankPreview(
    ctx: CanvasRenderingContext2D,
    _config: CharacterConfig,
    x: number,
    y: number,
    size: number
  ): void {
    const scale = size / 100;

    // 腿部
    const legGradient = ctx.createLinearGradient(x - 14 * scale, 0, x + 14 * scale, 0);
    legGradient.addColorStop(0, '#2a2a3a');
    legGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = legGradient;
    ctx.fillRect(x - 12 * scale, y + 24 * scale, 8 * scale, 26 * scale);
    ctx.fillRect(x + 4 * scale, y + 24 * scale, 8 * scale, 26 * scale);

    // 身体
    const bodyGradient = ctx.createRadialGradient(x, y - 5, 0, x, y - 5, 20 * scale);
    bodyGradient.addColorStop(0, '#4a4a6a');
    bodyGradient.addColorStop(0.5, '#3a3a5a');
    bodyGradient.addColorStop(1, '#2a2a4a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y - 3, 18 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 将军披风
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x - 18 * scale, y - 12 * scale, 36 * scale, 28 * scale);

    // 披风金色徽章
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y - 10 * scale);
    ctx.lineTo(x, y + 14 * scale);
    ctx.moveTo(x - 8 * scale, y + 2 * scale);
    ctx.lineTo(x + 8 * scale, y + 2 * scale);
    ctx.stroke();

    // 将军肩章
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x - 18 * scale, y - 8 * scale, 6 * scale, 8 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 18 * scale, y - 6 * scale, 6 * scale, 8 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 左臂 - 持盾
    ctx.fillStyle = '#3a3a5a';
    ctx.beginPath();
    ctx.ellipse(x - 26 * scale, y - 2, 7 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 木铁盾牌
    const woodGradient = ctx.createRadialGradient(x - 40 * scale, y - 5, 0, x - 40 * scale, y - 5, 30 * scale);
    woodGradient.addColorStop(0, '#A0522D');
    woodGradient.addColorStop(0.5, '#8B4513');
    woodGradient.addColorStop(1, '#654321');
    ctx.fillStyle = woodGradient;
    ctx.beginPath();
    ctx.moveTo(x - 40 * scale, y - 35 * scale);
    ctx.lineTo(x - 15 * scale, y - 25 * scale);
    ctx.lineTo(x - 18 * scale, y + 20 * scale);
    ctx.lineTo(x - 40 * scale, y + 25 * scale);
    ctx.lineTo(x - 62 * scale, y + 10 * scale);
    ctx.lineTo(x - 62 * scale, y - 20 * scale);
    ctx.closePath();
    ctx.fill();

    // 铁质边框
    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // 铁质装饰
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.arc(x - 40 * scale, y - 5, 8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 铁质铆钉
    ctx.fillStyle = '#4a4a6a';
    const rivets = [
      [x - 40 * scale, y - 27 * scale], [x - 55 * scale, y - 17 * scale], [x - 25 * scale, y - 17 * scale],
      [x - 58 * scale, y], [x - 22 * scale, y], [x - 40 * scale, y + 17 * scale]
    ];
    rivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx as number, ry as number, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // 将军徽章
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 40 * scale, y - 13 * scale);
    ctx.lineTo(x - 34 * scale, y - 5);
    ctx.lineTo(x - 40 * scale, y + 3 * scale);
    ctx.lineTo(x - 46 * scale, y - 5);
    ctx.closePath();
    ctx.stroke();

    // 右臂 - 持刀
    ctx.fillStyle = '#3a3a5a';
    ctx.beginPath();
    ctx.ellipse(x + 24 * scale, y - 7 * scale, 7 * scale, 15 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 大刀
    const bladeGradient = ctx.createLinearGradient(x + 38 * scale, y - 75 * scale, x + 62 * scale, y - 45 * scale);
    bladeGradient.addColorStop(0, '#C0C0C0');
    bladeGradient.addColorStop(0.3, '#D3D3D3');
    bladeGradient.addColorStop(0.7, '#A9A9A9');
    bladeGradient.addColorStop(1, '#808080');
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(x + 38 * scale, y - 45 * scale);
    ctx.lineTo(x + 50 * scale, y - 105 * scale);
    ctx.lineTo(x + 62 * scale, y - 45 * scale);
    ctx.closePath();
    ctx.fill();

    // 刀刃锋芒
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 50 * scale, y - 45 * scale);
    ctx.lineTo(x + 50 * scale, y - 105 * scale);
    ctx.stroke();

    // 刀刃纹路
    ctx.strokeStyle = '#909090';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 5; i++) {
      const y1 = y - 50 - i * 12;
      ctx.beginPath();
      ctx.moveTo(x + 42 * scale, y1);
      ctx.lineTo(x + 58 * scale, y1 - 3);
      ctx.stroke();
    }

    // 刀背加厚
    ctx.fillStyle = '#707070';
    ctx.beginPath();
    ctx.moveTo(x + 38 * scale, y - 45 * scale);
    ctx.lineTo(x + 44 * scale, y - 100 * scale);
    ctx.lineTo(x + 50 * scale, y - 95 * scale);
    ctx.lineTo(x + 44 * scale, y - 45 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 62 * scale, y - 45 * scale);
    ctx.lineTo(x + 56 * scale, y - 100 * scale);
    ctx.lineTo(x + 50 * scale, y - 95 * scale);
    ctx.lineTo(x + 56 * scale, y - 45 * scale);
    ctx.closePath();
    ctx.fill();

    // 护手
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(x + 50 * scale, y - 45 * scale, 15 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // 刀柄
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(x + 46 * scale, y - 30 * scale, 8 * scale, 18 * scale);

    // 刀刃发光
    ctx.shadowColor = '#C0C0C0';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = 'rgba(200, 200, 220, 0.4)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 38 * scale, y - 45 * scale);
    ctx.lineTo(x + 50 * scale, y - 105 * scale);
    ctx.lineTo(x + 62 * scale, y - 45 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 头部
    ctx.fillStyle = '#3a3a5a';
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 将军头盔
    const helmetGradient = ctx.createRadialGradient(x, y - 38 * scale, 0, x, y - 38 * scale, 15 * scale);
    helmetGradient.addColorStop(0, '#5a5a7a');
    helmetGradient.addColorStop(1, '#3a3a5a');
    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 15 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 头盔羽饰
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(x, y - 53 * scale);
    ctx.lineTo(x - 3 * scale, y - 43 * scale);
    ctx.lineTo(x + 3 * scale, y - 43 * scale);
    ctx.closePath();
    ctx.fill();

    // 将军面罩
    ctx.fillStyle = '#2a2a4a';
    ctx.fillRect(x - 10 * scale, y - 42 * scale, 20 * scale, 10 * scale);
    ctx.strokeStyle = '#3a3a5a';
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(x - 10 * scale, y - 42 * scale, 20 * scale, 10 * scale);

    // 眼睛
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x - 4 * scale, y - 37 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.arc(x + 4 * scale, y - 37 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
}
