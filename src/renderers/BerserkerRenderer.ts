/**
 * 狂战士渲染器
 * 负责绘制狂战士角色形象
 * 狂暴战士风格 - 战争图腾
 */

import { CharacterConfig } from '../types/Character';
import { RenderParams, PreviewRenderParams, ICharacterRenderer } from './ICharacterRenderer';

export class BerserkerRenderer implements ICharacterRenderer {
  renderBattle(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: RenderParams): void {
    const { cx, cy, scale, walkCycle, isMoving, attackProgress, swingAngle, chargeProgress, isEnchanted } = params;
    const time = Date.now() / 1000;

    // 附魔状态特效
    if (isEnchanted) {
      this.drawEnchantEffect(ctx, cx, cy, scale, time);
    }

    // 蓄力状态特效
    if (chargeProgress > 0) {
      this.drawChargeEffect(ctx, cx, cy, scale, chargeProgress, time);
    }

    // 腿部动画
    const rightLegAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.3 : 0;
    const leftLegAngle = isMoving ? Math.sin(walkCycle) * 0.3 : 0;

    // 后腿
    ctx.save();
    ctx.translate(cx - 6 * scale, cy + 28 * scale);
    ctx.rotate(leftLegAngle);
    
    const backLegGradient = ctx.createLinearGradient(-7 * scale, 0, 7 * scale, 0);
    backLegGradient.addColorStop(0, '#1a1a1a');
    backLegGradient.addColorStop(0.5, '#2a2a2a');
    backLegGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = backLegGradient;
    
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 7 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-5 * scale, 8 * scale, 10 * scale, 20 * scale);
    
    // 战靴
    const bootGradient = ctx.createLinearGradient(-6 * scale, 27 * scale, 6 * scale, 38 * scale);
    bootGradient.addColorStop(0, '#3a3a3a');
    bootGradient.addColorStop(0.3, '#4a4a4a');
    bootGradient.addColorStop(0.7, '#3a3a3a');
    bootGradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = bootGradient;
    ctx.beginPath();
    ctx.moveTo(-6 * scale, 27 * scale);
    ctx.lineTo(7 * scale, 27 * scale);
    ctx.lineTo(10 * scale, 38 * scale);
    ctx.lineTo(-4 * scale, 38 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 靴子金属装饰
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(-4 * scale, 28 * scale, 8 * scale, 4 * scale);
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(0, 30 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 前腿
    ctx.save();
    ctx.translate(cx + 6 * scale, cy + 28 * scale);
    ctx.rotate(rightLegAngle);
    
    const frontLegGradient = ctx.createLinearGradient(-7 * scale, 0, 7 * scale, 0);
    frontLegGradient.addColorStop(0, '#2a2a2a');
    frontLegGradient.addColorStop(0.5, '#3a3a3a');
    frontLegGradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = frontLegGradient;
    
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 7 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-5 * scale, 8 * scale, 10 * scale, 20 * scale);
    
    const frontBootGradient = ctx.createLinearGradient(-6 * scale, 27 * scale, 6 * scale, 38 * scale);
    frontBootGradient.addColorStop(0, '#4a4a4a');
    frontBootGradient.addColorStop(0.3, '#5a5a5a');
    frontBootGradient.addColorStop(0.7, '#4a4a4a');
    frontBootGradient.addColorStop(1, '#3a3a3a');
    ctx.fillStyle = frontBootGradient;
    ctx.beginPath();
    ctx.moveTo(-6 * scale, 27 * scale);
    ctx.lineTo(7 * scale, 27 * scale);
    ctx.lineTo(10 * scale, 38 * scale);
    ctx.lineTo(-4 * scale, 38 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#A50000';
    ctx.fillRect(-4 * scale, 28 * scale, 8 * scale, 4 * scale);
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 30 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 腰带
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(cx - 22 * scale, cy + 18 * scale, 44 * scale, 6 * scale);
    
    // 腰带扣 - 骷髅装饰
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(cx, cy + 21 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(cx - 2 * scale, cy + 19 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 2 * scale, cy + 19 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 2 * scale, cy + 22 * scale);
    ctx.lineTo(cx + 2 * scale, cy + 22 * scale);
    ctx.lineTo(cx, cy + 25 * scale);
    ctx.closePath();
    ctx.fill();

    // 身体
    const bodyGradient = ctx.createRadialGradient(cx - 3 * scale, cy - 8 * scale, 0, cx, cy, 28 * scale);
    bodyGradient.addColorStop(0, '#5a4a4a');
    bodyGradient.addColorStop(0.5, '#3a2a2a');
    bodyGradient.addColorStop(1, '#2a1a1a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22 * scale, 30 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 肌肉线条
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 15 * scale, cy - 10 * scale);
    ctx.quadraticCurveTo(cx - 10 * scale, cy, cx - 15 * scale, cy + 15 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 15 * scale, cy - 10 * scale);
    ctx.quadraticCurveTo(cx + 10 * scale, cy, cx + 15 * scale, cy + 15 * scale);
    ctx.stroke();

    // 胸甲 - 骷髅图案
    const chestGradient = ctx.createLinearGradient(cx - 18 * scale, 0, cx + 18 * scale, 0);
    chestGradient.addColorStop(0, '#2a0a0a');
    chestGradient.addColorStop(0.3, '#4a1a1a');
    chestGradient.addColorStop(0.5, '#5a2a2a');
    chestGradient.addColorStop(0.7, '#4a1a1a');
    chestGradient.addColorStop(1, '#2a0a0a');
    ctx.fillStyle = chestGradient;
    ctx.beginPath();
    ctx.moveTo(cx - 18 * scale, cy - 24 * scale);
    ctx.lineTo(cx + 16 * scale, cy - 24 * scale);
    ctx.lineTo(cx + 14 * scale, cy + 20 * scale);
    ctx.lineTo(cx, cy + 24 * scale);
    ctx.lineTo(cx - 14 * scale, cy + 20 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 胸甲骷髅图案
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.arc(cx, cy - 8 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(cx - 4 * scale, cy - 10 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 4 * scale, cy - 10 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 4 * scale, cy - 2 * scale);
    ctx.lineTo(cx + 4 * scale, cy - 2 * scale);
    ctx.lineTo(cx, cy + 6 * scale);
    ctx.closePath();
    ctx.fill();

    // 护肩 - 尖刺设计
    this.drawShoulder(ctx, cx - 22 * scale, cy - 12 * scale, scale, -0.4, false);
    this.drawShoulder(ctx, cx + 22 * scale, cy - 10 * scale, scale, 0.4, true);

    // 后臂
    ctx.save();
    ctx.translate(cx - 24 * scale, cy + 5 * scale);
    const leftArmAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.2 : 0;
    ctx.rotate(leftArmAngle + 0.15);
    
    const leftArmGradient = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, 0);
    leftArmGradient.addColorStop(0, '#cc9977');
    leftArmGradient.addColorStop(0.5, '#ddaa88');
    leftArmGradient.addColorStop(1, '#cc9977');
    ctx.fillStyle = leftArmGradient;
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 6 * scale, 14 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 护腕
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-5 * scale, 5 * scale, 10 * scale, 8 * scale);
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(-4 * scale, 6 * scale, 8 * scale, 2 * scale);
    
    // 拳头
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 16 * scale, 6 * scale, 7 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 前臂 - 持巨剑（先绘制手臂，剑在最后绘制）
    ctx.save();
    ctx.translate(cx + 18 * scale, cy - 2 * scale);
    const rightArmAngle = isMoving ? Math.sin(walkCycle) * 0.2 : 0;
    const armRotation = rightArmAngle - 0.5 + (attackProgress > 0 ? swingAngle + 0.2 : 0);
    ctx.rotate(armRotation);

    // 保存剑的绘制参数，稍后在最上层绘制
    const swordParams = {
      rotation: -0.6 + (isMoving ? Math.sin(walkCycle) * 0.08 : 0),
      cx: cx + 18 * scale,
      cy: cy - 2 * scale,
      armRotation: armRotation,
    };

    // 手臂
    const rightArmGradient = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, 0);
    rightArmGradient.addColorStop(0, '#cc9977');
    rightArmGradient.addColorStop(0.5, '#eebb99');
    rightArmGradient.addColorStop(1, '#cc9977');
    ctx.fillStyle = rightArmGradient;
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 7 * scale, 14 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 护腕
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-6 * scale, 5 * scale, 12 * scale, 8 * scale);
    ctx.fillStyle = '#A50000';
    ctx.fillRect(-5 * scale, 6 * scale, 10 * scale, 2 * scale);
    
    // 握剑的手
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 14 * scale, 7 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 头部
    const headGradient = ctx.createRadialGradient(cx + 4 * scale, cy - 40 * scale, 0, cx, cy - 38 * scale, 16 * scale);
    headGradient.addColorStop(0, '#f5d0a0');
    headGradient.addColorStop(1, '#d4a070');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(cx + 2 * scale, cy - 38 * scale, 14 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 战纹 - 面部彩绘
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 8 * scale, cy - 45 * scale);
    ctx.lineTo(cx + 12 * scale, cy - 38 * scale);
    ctx.lineTo(cx + 8 * scale, cy - 32 * scale);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 6 * scale, cy - 48 * scale);
    ctx.lineTo(cx + 4 * scale, cy - 42 * scale);
    ctx.stroke();

    // 眼睛 - 红色发光
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.ellipse(cx + 8 * scale, cy - 40 * scale, 3 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.ellipse(cx + 8 * scale, cy - 40 * scale, 1.5 * scale, 2 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 眉毛 - 狂野
    ctx.strokeStyle = '#2a1a0a';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 4 * scale, cy - 46 * scale);
    ctx.lineTo(cx + 12 * scale, cy - 44 * scale);
    ctx.stroke();

    // 下巴胡须
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.moveTo(cx + 4 * scale, cy - 26 * scale);
    ctx.quadraticCurveTo(cx + 12 * scale, cy - 22 * scale, cx + 10 * scale, cy - 18 * scale);
    ctx.quadraticCurveTo(cx + 6 * scale, cy - 20 * scale, cx + 4 * scale, cy - 22 * scale);
    ctx.closePath();
    ctx.fill();

    // 头发 - 火焰状
    this.drawFlameHair(ctx, cx, cy, scale, time, isEnchanted || chargeProgress > 0);

    // 头带
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(cx - 12 * scale, cy - 52 * scale, 28 * scale, 5 * scale);
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(cx + 10 * scale, cy - 49.5 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 最后绘制巨剑 - 确保在所有其他元素之上
    ctx.save();
    ctx.translate(swordParams.cx, swordParams.cy);
    ctx.rotate(swordParams.armRotation);
    ctx.rotate(swordParams.rotation);
    this.drawGreatSword(ctx, 0, 0, scale, chargeProgress, isEnchanted, attackProgress, time);
    ctx.restore();
  }

  /**
   * 绘制护肩
   */
  private drawShoulder(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, rotation: number, isFront: boolean): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    const shoulderGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15 * scale);
    shoulderGradient.addColorStop(0, '#5a5a5a');
    shoulderGradient.addColorStop(0.5, '#3a3a3a');
    shoulderGradient.addColorStop(1, '#2a2a2a');
    ctx.fillStyle = shoulderGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    // 尖刺
    ctx.fillStyle = '#4a4a4a';
    const spikePositions = isFront ? [-8, 0, 8] : [-6, 6];
    spikePositions.forEach((sx, i) => {
      ctx.save();
      ctx.translate(sx * scale, -12 * scale);
      ctx.rotate(rotation * 0.5);
      ctx.beginPath();
      ctx.moveTo(-3 * scale, 0);
      ctx.lineTo(0, -10 * scale - i * 2 * scale);
      ctx.lineTo(3 * scale, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
    
    ctx.restore();
  }

  /**
   * 绘制巨剑
   */
  private drawGreatSword(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, chargeProgress: number, isEnchanted: boolean, attackProgress: number, time: number): void {
    const bladeLength = 200 * scale;
    const bladeWidth = 14 * scale;

    // 剑柄
    const hiltGradient = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, 0);
    hiltGradient.addColorStop(0, '#3a2a1a');
    hiltGradient.addColorStop(0.5, '#5a4a3a');
    hiltGradient.addColorStop(1, '#3a2a1a');
    ctx.fillStyle = hiltGradient;
    ctx.fillRect(-5 * scale, -8 * scale, 10 * scale, 16 * scale);
    
    // 剑柄缠绕
    ctx.strokeStyle = '#1a0a0a';
    ctx.lineWidth = 1.5 * scale;
    for (let i = 0; i < 5; i++) {
      const yPos = -6 * scale + i * 3 * scale;
      ctx.beginPath();
      ctx.moveTo(-5 * scale, yPos);
      ctx.lineTo(5 * scale, yPos);
      ctx.stroke();
    }

    // 护手 - 恶魔翅膀造型
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.moveTo(-20 * scale, -12 * scale);
    ctx.lineTo(-8 * scale, -8 * scale);
    ctx.lineTo(-8 * scale, 0);
    ctx.lineTo(8 * scale, 0);
    ctx.lineTo(8 * scale, -8 * scale);
    ctx.lineTo(20 * scale, -12 * scale);
    ctx.lineTo(18 * scale, -8 * scale);
    ctx.lineTo(8 * scale, -4 * scale);
    ctx.lineTo(-8 * scale, -4 * scale);
    ctx.lineTo(-18 * scale, -8 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(0, -6 * scale, 4 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(0, -6 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 剑刃
    const bladeGradient = ctx.createLinearGradient(-bladeWidth, -bladeLength, bladeWidth, -16 * scale);
    bladeGradient.addColorStop(0, '#6a6a6a');
    bladeGradient.addColorStop(0.2, '#8a8a8a');
    bladeGradient.addColorStop(0.4, '#aaaaaa');
    bladeGradient.addColorStop(0.6, '#9a9a9a');
    bladeGradient.addColorStop(0.8, '#7a7a7a');
    bladeGradient.addColorStop(1, '#5a5a5a');
    
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth, -16 * scale);
    ctx.lineTo(-bladeWidth * 0.6, -bladeLength + 15 * scale);
    ctx.lineTo(0, -bladeLength);
    ctx.lineTo(bladeWidth * 0.6, -bladeLength + 15 * scale);
    ctx.lineTo(bladeWidth, -16 * scale);
    ctx.closePath();
    ctx.fill();

    // 剑刃边缘
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 血槽
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.moveTo(-4 * scale, -20 * scale);
    ctx.lineTo(0, -bladeLength + 20 * scale);
    ctx.lineTo(4 * scale, -20 * scale);
    ctx.closePath();
    ctx.fill();

    // 剑刃纹路
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 8; i++) {
      const y = -25 * scale - i * 18 * scale;
      if (y < -bladeLength + 30) break;
      ctx.beginPath();
      ctx.moveTo(-bladeWidth * 0.7, y);
      ctx.lineTo(bladeWidth * 0.7, y - 3 * scale);
      ctx.stroke();
    }

    // 剑刃发光效果
    let bladeHighlight = '#fff';
    
    if (chargeProgress > 0) {
      const intensity = chargeProgress;
      const pulse = Math.sin(time * 8) * 0.3 + 0.7;
      bladeHighlight = `rgb(255, ${Math.floor(200 - intensity * 100)}, ${Math.floor(100 - intensity * 50)})`;
      ctx.shadowColor = `rgb(255, ${Math.floor(150 - intensity * 100)}, 0)`;
      ctx.shadowBlur = 30 * intensity * pulse;
    } else if (isEnchanted) {
      const pulse = Math.sin(time * 5) * 0.3 + 0.7;
      bladeHighlight = '#ff6644';
      ctx.shadowColor = '#ff3300';
      ctx.shadowBlur = 25 * pulse;
    } else if (attackProgress > 0.2 && attackProgress < 0.8) {
      const intensity = Math.sin((attackProgress - 0.2) / 0.6 * Math.PI);
      bladeHighlight = '#ffcc88';
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 20 * intensity;
    }

    ctx.strokeStyle = bladeHighlight;
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth * 0.4, -18 * scale);
    ctx.lineTo(0, -bladeLength + 10 * scale);
    ctx.lineTo(bladeWidth * 0.4, -18 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /**
   * 绘制火焰状头发
   */
  private drawFlameHair(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, time: number, isActive: boolean): void {
    const hairColor = isActive ? '#FF4500' : '#8B0000';
    const highlightColor = isActive ? '#FFD700' : '#D4AF37';
    
    ctx.save();
    ctx.translate(cx + 2 * scale, cy - 52 * scale);
    
    // 多层火焰状头发
    for (let i = 0; i < 5; i++) {
      const wave = Math.sin(time * 3 + i * 0.5) * 3 * scale;
      const height = 20 * scale + i * 5 * scale + wave;
      const width = 8 * scale - i * 0.8 * scale;
      const xOffset = -8 * scale + i * 4 * scale;
      
      ctx.fillStyle = i < 2 ? highlightColor : hairColor;
      ctx.beginPath();
      ctx.moveTo(xOffset, 0);
      ctx.quadraticCurveTo(xOffset - width * 0.5, height * 0.3, xOffset - wave * 0.5, height);
      ctx.quadraticCurveTo(xOffset + width * 0.3, height * 0.7, xOffset + width, height * 0.2);
      ctx.lineTo(xOffset + width * 0.5, 0);
      ctx.closePath();
      ctx.fill();
    }
    
    // 顶部火焰
    const topWave = Math.sin(time * 4) * 4 * scale;
    ctx.fillStyle = highlightColor;
    ctx.beginPath();
    ctx.moveTo(-2 * scale, -5 * scale);
    ctx.quadraticCurveTo(-5 * scale, -15 * scale, topWave, -30 * scale);
    ctx.quadraticCurveTo(5 * scale, -15 * scale, 2 * scale, -5 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  /**
   * 绘制附魔特效
   */
  private drawEnchantEffect(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, time: number): void {
    ctx.save();
    
    const pulse = Math.sin(time * 5) * 0.3 + 0.7;
    
    // 火焰光环
    const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * scale);
    glowGradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
    glowGradient.addColorStop(0.5, `rgba(255, 50, 0, ${0.3 * pulse})`);
    glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 60 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // 火焰粒子
    for (let i = 0; i < 12; i++) {
      const angle = (time * 2 + i * (Math.PI / 6)) % (Math.PI * 2);
      const distance = 35 * scale + Math.sin(time * 4 + i) * 10 * scale;
      const size = 3 + Math.sin(time * 5 + i) * 2;
      
      ctx.fillStyle = `rgba(255, ${150 + Math.sin(time * 3 + i) * 50}, 0, ${0.8 * pulse})`;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * distance,
        cy + Math.sin(angle) * distance,
        size * scale,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // 上升火焰
    for (let i = 0; i < 6; i++) {
      const riseProgress = (time * 1.5 + i * 0.17) % 1;
      const riseX = cx + Math.sin(time * 2 + i * 2) * 15 * scale;
      const riseY = cy + 40 * scale - riseProgress * 80 * scale;
      const riseAlpha = (1 - riseProgress) * 0.7;
      const riseSize = 4 * scale * (1 - riseProgress * 0.3);
      
      ctx.fillStyle = `rgba(255, ${100 + riseProgress * 100}, 0, ${riseAlpha})`;
      ctx.beginPath();
      ctx.arc(riseX, riseY, riseSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * 绘制蓄力特效
   */
  private drawChargeEffect(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, progress: number, time: number): void {
    ctx.save();
    
    const pulse = Math.sin(time * 10) * 0.3 + 0.7;
    const intensity = progress;
    
    // 能量漩涡
    for (let i = 0; i < 3; i++) {
      const radius = 30 * scale + i * 15 * scale;
      const rotation = time * (3 - i) * (i % 2 === 0 ? 1 : -1);
      
      ctx.strokeStyle = `rgba(255, ${Math.floor(150 - intensity * 100)}, 0, ${(0.5 - i * 0.1) * intensity * pulse})`;
      ctx.lineWidth = 3 * scale * (1 - i * 0.2);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, rotation, rotation + Math.PI * 1.5);
      ctx.stroke();
    }
    
    // 能量聚集到剑
    for (let i = 0; i < 8; i++) {
      const angle = (time * 3 + i * (Math.PI / 4)) % (Math.PI * 2);
      const startDistance = 50 * scale;
      const endDistance = 20 * scale;
      const currentDistance = startDistance - intensity * (startDistance - endDistance);
      
      ctx.fillStyle = `rgba(255, ${Math.floor(200 - intensity * 100)}, 0, ${0.8 * pulse})`;
      ctx.beginPath();
      ctx.arc(
        cx + 25 * scale + Math.cos(angle) * currentDistance,
        cy + Math.sin(angle) * currentDistance,
        3 * scale * intensity,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    
    // 爆裂光芒
    if (intensity > 0.8) {
      const burstIntensity = (intensity - 0.8) / 0.2;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const length = 20 * scale * burstIntensity * pulse;
        
        ctx.strokeStyle = `rgba(255, 200, 0, ${burstIntensity * pulse})`;
        ctx.lineWidth = 2 * scale;
        ctx.beginPath();
        ctx.moveTo(cx + 25 * scale, cy);
        ctx.lineTo(
          cx + 25 * scale + Math.cos(angle) * length,
          cy + Math.sin(angle) * length
        );
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }

  /**
   * 渲染预览
   */
  renderPreview(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: PreviewRenderParams): void {
    const { x, y, scale } = params;

    // 腿部
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(x - 10 * scale, y + 25 * scale, 10 * scale, 28 * scale);
    ctx.fillRect(x, y + 25 * scale, 10 * scale, 28 * scale);
    
    // 战靴
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.moveTo(x - 10 * scale, y + 52 * scale);
    ctx.lineTo(x + 2 * scale, y + 52 * scale);
    ctx.lineTo(x + 5 * scale, y + 62 * scale);
    ctx.lineTo(x - 8 * scale, y + 62 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y + 52 * scale);
    ctx.lineTo(x + 12 * scale, y + 52 * scale);
    ctx.lineTo(x + 15 * scale, y + 62 * scale);
    ctx.lineTo(x + 2 * scale, y + 62 * scale);
    ctx.closePath();
    ctx.fill();

    // 身体
    const bodyGradient = ctx.createRadialGradient(x - 3 * scale, y - 8 * scale, 0, x, y, 28 * scale);
    bodyGradient.addColorStop(0, '#5a4a4a');
    bodyGradient.addColorStop(0.5, '#3a2a2a');
    bodyGradient.addColorStop(1, '#2a1a1a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, 22 * scale, 30 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 胸甲
    const chestGradient = ctx.createLinearGradient(x - 18 * scale, 0, x + 18 * scale, 0);
    chestGradient.addColorStop(0, '#2a0a0a');
    chestGradient.addColorStop(0.5, '#5a2a2a');
    chestGradient.addColorStop(1, '#2a0a0a');
    ctx.fillStyle = chestGradient;
    ctx.beginPath();
    ctx.moveTo(x - 18 * scale, y - 24 * scale);
    ctx.lineTo(x + 16 * scale, y - 24 * scale);
    ctx.lineTo(x + 14 * scale, y + 20 * scale);
    ctx.lineTo(x, y + 24 * scale);
    ctx.lineTo(x - 14 * scale, y + 20 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 骷髅图案
    ctx.fillStyle = '#1a0a0a';
    ctx.beginPath();
    ctx.arc(x, y - 8 * scale, 10 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.arc(x - 4 * scale, y - 10 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.arc(x + 4 * scale, y - 10 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 护肩
    ctx.fillStyle = '#3a3a3a';
    ctx.beginPath();
    ctx.ellipse(x - 22 * scale, y - 12 * scale, 12 * scale, 16 * scale, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 22 * scale, y - 10 * scale, 12 * scale, 16 * scale, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 后臂
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(x - 26 * scale, y + 5 * scale, 6 * scale, 14 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 前臂
    ctx.save();
    ctx.translate(x + 26 * scale, y - 2 * scale);
    ctx.rotate(-0.3);
    
    ctx.fillStyle = '#eebb99';
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 7 * scale, 14 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 巨剑预览
    ctx.save();
    ctx.rotate(-0.2);
    
    const bladeGradient = ctx.createLinearGradient(-14 * scale, -200 * scale, 14 * scale, -16 * scale);
    bladeGradient.addColorStop(0, '#6a6a6a');
    bladeGradient.addColorStop(0.4, '#aaaaaa');
    bladeGradient.addColorStop(1, '#5a5a5a');
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(-14 * scale, -16 * scale);
    ctx.lineTo(-8 * scale, -185 * scale);
    ctx.lineTo(0, -200 * scale);
    ctx.lineTo(8 * scale, -185 * scale);
    ctx.lineTo(14 * scale, -16 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    // 护手
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.moveTo(-20 * scale, -12 * scale);
    ctx.lineTo(20 * scale, -12 * scale);
    ctx.lineTo(18 * scale, -4 * scale);
    ctx.lineTo(-18 * scale, -4 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
    ctx.restore();

    // 头部
    const headGradient = ctx.createRadialGradient(x + 4 * scale, y - 40 * scale, 0, x, y - 38 * scale, 16 * scale);
    headGradient.addColorStop(0, '#f5d0a0');
    headGradient.addColorStop(1, '#d4a070');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(x + 2 * scale, y - 38 * scale, 14 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 战纹
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 8 * scale, y - 45 * scale);
    ctx.lineTo(x + 12 * scale, y - 38 * scale);
    ctx.lineTo(x + 8 * scale, y - 32 * scale);
    ctx.stroke();

    // 眼睛
    ctx.fillStyle = '#FF0000';
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(x + 8 * scale, y - 40 * scale, 3 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 头发
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(x - 10 * scale, y - 52 * scale);
    ctx.quadraticCurveTo(x - 5 * scale, y - 75 * scale, x + 5 * scale, y - 55 * scale);
    ctx.quadraticCurveTo(x + 15 * scale, y - 70 * scale, x + 15 * scale, y - 52 * scale);
    ctx.lineTo(x - 10 * scale, y - 52 * scale);
    ctx.fill();
    
    // 火焰头发高光
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(x - 5 * scale, y - 55 * scale);
    ctx.quadraticCurveTo(x, y - 70 * scale, x + 8 * scale, y - 55 * scale);
    ctx.lineTo(x - 5 * scale, y - 55 * scale);
    ctx.fill();

    // 头带
    ctx.fillStyle = '#8B0000';
    ctx.fillRect(x - 12 * scale, y - 52 * scale, 28 * scale, 5 * scale);
  }
}
