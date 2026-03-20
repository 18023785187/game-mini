/**
 * 肉盾渲染器
 * 负责绘制肉盾角色形象 - 侧身盔甲骑士风格
 */

import { CharacterConfig } from '../types/Character';
import { RenderParams, PreviewRenderParams, ICharacterRenderer } from './ICharacterRenderer';

/**
 * 肉盾渲染器 - 侧身盔甲骑士
 */
export class TankRenderer implements ICharacterRenderer {
  /**
   * 渲染战斗场景中的肉盾
   */
  renderBattle(ctx: CanvasRenderingContext2D, _config: CharacterConfig, params: RenderParams): void {
    const { cx, cy, scale, walkCycle, isMoving, attackProgress, swingAngle, isShielding, isArmored, armorProgress } = params;

    // 装甲模式光效
    if (isArmored) {
      this.drawArmorGlow(ctx, cx, cy, scale, armorProgress);
    }

    // 举盾状态特效
    if (isShielding) {
      this.drawShieldGlow(ctx, cx, cy, scale);
    }

    // 腿部动画 - 骑士铠甲风格
    const leftLegOffset = isMoving ? Math.sin(walkCycle) * 5 : 0;
    const rightLegOffset = isMoving ? Math.sin(walkCycle + Math.PI) * 5 : 0;

    // 后腿（左腿）
    ctx.save();
    ctx.translate(cx - 8 * scale, cy + 25 * scale);
    ctx.rotate(isMoving ? Math.sin(walkCycle) * 0.15 : 0);
    
    const backLegGradient = ctx.createLinearGradient(-8 * scale, 0, 8 * scale, 0);
    backLegGradient.addColorStop(0, '#1a1a2a');
    backLegGradient.addColorStop(0.5, '#2a2a3a');
    backLegGradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = backLegGradient;
    
    // 大腿护甲
    ctx.beginPath();
    ctx.ellipse(0, leftLegOffset - 8 * scale, 8 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 小腿护甲
    ctx.fillRect(-6 * scale, leftLegOffset + 4 * scale, 12 * scale, 22 * scale);
    // 脚部铁靴
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.moveTo(-7 * scale, leftLegOffset + 26 * scale);
    ctx.lineTo(8 * scale, leftLegOffset + 26 * scale);
    ctx.lineTo(10 * scale, leftLegOffset + 32 * scale);
    ctx.lineTo(-5 * scale, leftLegOffset + 32 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 前腿（右腿）
    ctx.save();
    ctx.translate(cx + 2 * scale, cy + 25 * scale);
    ctx.rotate(isMoving ? Math.sin(walkCycle + Math.PI) * 0.15 : 0);
    
    const frontLegGradient = ctx.createLinearGradient(-8 * scale, 0, 8 * scale, 0);
    frontLegGradient.addColorStop(0, '#2a2a3a');
    frontLegGradient.addColorStop(0.5, '#3a3a4a');
    frontLegGradient.addColorStop(1, '#2a2a3a');
    ctx.fillStyle = frontLegGradient;
    
    // 大腿护甲
    ctx.beginPath();
    ctx.ellipse(0, rightLegOffset - 8 * scale, 8 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 小腿护甲
    ctx.fillRect(-6 * scale, rightLegOffset + 4 * scale, 12 * scale, 22 * scale);
    // 脚部铁靴
    ctx.fillStyle = '#4a4a5a';
    ctx.beginPath();
    ctx.moveTo(-7 * scale, rightLegOffset + 26 * scale);
    ctx.lineTo(8 * scale, rightLegOffset + 26 * scale);
    ctx.lineTo(10 * scale, rightLegOffset + 32 * scale);
    ctx.lineTo(-5 * scale, rightLegOffset + 32 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 身体 - 重型铠甲
    const bodyGradient = ctx.createRadialGradient(cx + 5 * scale, cy - 5 * scale, 0, cx, cy, 25 * scale);
    bodyGradient.addColorStop(0, '#4a4a6a');
    bodyGradient.addColorStop(0.5, '#3a3a5a');
    bodyGradient.addColorStop(1, '#2a2a4a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 2 * scale, 22 * scale, 30 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 胸甲 - 银色金属质感
    const chestGradient = ctx.createLinearGradient(cx - 15 * scale, 0, cx + 15 * scale, 0);
    chestGradient.addColorStop(0, '#5a5a6a');
    chestGradient.addColorStop(0.3, '#7a7a8a');
    chestGradient.addColorStop(0.5, '#8a8a9a');
    chestGradient.addColorStop(0.7, '#7a7a8a');
    chestGradient.addColorStop(1, '#5a5a6a');
    ctx.fillStyle = chestGradient;
    ctx.beginPath();
    ctx.moveTo(cx - 15 * scale, cy - 25 * scale);
    ctx.lineTo(cx + 15 * scale, cy - 25 * scale);
    ctx.lineTo(cx + 12 * scale, cy + 20 * scale);
    ctx.lineTo(cx, cy + 25 * scale);
    ctx.lineTo(cx - 12 * scale, cy + 20 * scale);
    ctx.closePath();
    ctx.fill();

    // 胸甲边框
    ctx.strokeStyle = '#3a3a4a';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // 胸甲中心装饰 - 十字徽章
    ctx.strokeStyle = isArmored ? '#FFD700' : '#C0C0C0';
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 20 * scale);
    ctx.lineTo(cx, cy + 18 * scale);
    ctx.moveTo(cx - 8 * scale, cy - 5 * scale);
    ctx.lineTo(cx + 8 * scale, cy - 5 * scale);
    ctx.stroke();

    // 胸甲铆钉
    ctx.fillStyle = '#8a8a9a';
    const rivetPositions = [
      { x: cx - 10 * scale, y: cy - 18 * scale },
      { x: cx + 10 * scale, y: cy - 18 * scale },
      { x: cx - 8 * scale, y: cy + 10 * scale },
      { x: cx + 8 * scale, y: cy + 10 * scale },
    ];
    rivetPositions.forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // 护肩 - 大型肩甲
    // 左护肩（后肩）
    ctx.save();
    ctx.translate(cx - 22 * scale, cy - 12 * scale);
    ctx.rotate(-0.3);
    const backShoulderGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15 * scale);
    backShoulderGradient.addColorStop(0, '#5a5a6a');
    backShoulderGradient.addColorStop(1, '#3a3a4a');
    ctx.fillStyle = backShoulderGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    // 肩甲尖刺
    ctx.fillStyle = '#6a6a7a';
    ctx.beginPath();
    ctx.moveTo(-8 * scale, -12 * scale);
    ctx.lineTo(-12 * scale, -20 * scale);
    ctx.lineTo(-4 * scale, -14 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 右护肩（前肩）
    ctx.save();
    ctx.translate(cx + 20 * scale, cy - 10 * scale);
    ctx.rotate(0.3);
    const frontShoulderGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 15 * scale);
    frontShoulderGradient.addColorStop(0, '#6a6a7a');
    frontShoulderGradient.addColorStop(1, '#4a4a5a');
    ctx.fillStyle = frontShoulderGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a5a6a';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    // 肩甲尖刺
    ctx.fillStyle = '#7a7a8a';
    ctx.beginPath();
    ctx.moveTo(8 * scale, -14 * scale);
    ctx.lineTo(14 * scale, -24 * scale);
    ctx.lineTo(4 * scale, -16 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 左臂 - 持盾
    const leftArmAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.15 : 0;
    const shieldRaiseAngle = isShielding ? -0.4 : 0;
    
    ctx.save();
    ctx.translate(cx - 28 * scale, cy - 5 * scale);
    ctx.rotate(leftArmAngle + shieldRaiseAngle);
    
    // 手臂护甲
    const leftArmGradient = ctx.createLinearGradient(-8 * scale, 0, 8 * scale, 0);
    leftArmGradient.addColorStop(0, '#4a4a5a');
    leftArmGradient.addColorStop(0.5, '#5a5a6a');
    leftArmGradient.addColorStop(1, '#4a4a5a');
    ctx.fillStyle = leftArmGradient;
    ctx.beginPath();
    ctx.ellipse(0, 5 * scale, 8 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 手套
    ctx.fillStyle = '#3a3a4a';
    ctx.beginPath();
    ctx.ellipse(0, 18 * scale, 6 * scale, 8 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 盾牌 - 大型骑士盾
    const shieldOffsetX = isShielding ? 5 : 0;
    const shieldOffsetY = isShielding ? -10 : 0;
    
    ctx.save();
    ctx.translate(cx - 45 * scale + shieldOffsetX, cy - 5 * scale + shieldOffsetY);
    ctx.rotate(shieldRaiseAngle);
    
    // 盾牌主体
    const shieldGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 35 * scale);
    shieldGradient.addColorStop(0, '#5a5a7a');
    shieldGradient.addColorStop(0.5, '#4a4a6a');
    shieldGradient.addColorStop(1, '#3a3a5a');
    ctx.fillStyle = shieldGradient;
    
    // 盾牌形状 - 经典骑士盾
    ctx.beginPath();
    ctx.moveTo(0, -35 * scale);
    ctx.bezierCurveTo(25 * scale, -30 * scale, 28 * scale, 0, 25 * scale, 20 * scale);
    ctx.lineTo(0, 35 * scale);
    ctx.lineTo(-25 * scale, 20 * scale);
    ctx.bezierCurveTo(-28 * scale, 0, -25 * scale, -30 * scale, 0, -35 * scale);
    ctx.fill();
    
    // 盾牌边框
    ctx.strokeStyle = '#6a6a7a';
    ctx.lineWidth = 4 * scale;
    ctx.stroke();
    
    // 盾牌内框
    ctx.strokeStyle = '#5a5a6a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(0, -28 * scale);
    ctx.bezierCurveTo(18 * scale, -24 * scale, 20 * scale, 0, 18 * scale, 15 * scale);
    ctx.lineTo(0, 28 * scale);
    ctx.lineTo(-18 * scale, 15 * scale);
    ctx.bezierCurveTo(-20 * scale, 0, -18 * scale, -24 * scale, 0, -28 * scale);
    ctx.stroke();
    
    // 盾牌徽章 - 十字
    ctx.strokeStyle = isShielding ? '#FFD700' : '#C0C0C0';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(0, -20 * scale);
    ctx.lineTo(0, 20 * scale);
    ctx.moveTo(-12 * scale, 0);
    ctx.lineTo(12 * scale, 0);
    ctx.stroke();
    
    // 盾牌铆钉
    ctx.fillStyle = '#7a7a8a';
    const shieldRivets = [
      [0, -30 * scale], [-18 * scale, -15 * scale], [18 * scale, -15 * scale],
      [-20 * scale, 5 * scale], [20 * scale, 5 * scale], [0, 30 * scale]
    ];
    shieldRivets.forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.restore();

    // 右臂 - 持刀
    const rightArmAngle = isMoving ? Math.sin(walkCycle) * 0.15 : 0;
    const attackAngle = attackProgress > 0 ? swingAngle * 0.5 : 0;
    
    ctx.save();
    ctx.translate(cx + 25 * scale, cy - 5 * scale);
    ctx.rotate(rightArmAngle + attackAngle);
    
    // 手臂护甲
    const rightArmGradient = ctx.createLinearGradient(-8 * scale, 0, 8 * scale, 0);
    rightArmGradient.addColorStop(0, '#5a5a6a');
    rightArmGradient.addColorStop(0.5, '#6a6a7a');
    rightArmGradient.addColorStop(1, '#5a5a6a');
    ctx.fillStyle = rightArmGradient;
    ctx.beginPath();
    ctx.ellipse(0, 5 * scale, 9 * scale, 16 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 手套
    ctx.fillStyle = '#4a4a5a';
    ctx.beginPath();
    ctx.ellipse(0, 18 * scale, 7 * scale, 8 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 大刀 - 骑士重剑
    const swordAngle = attackProgress > 0 ? swingAngle : (isMoving ? Math.sin(walkCycle) * 0.1 : 0);
    
    ctx.save();
    ctx.translate(cx + 40 * scale, cy - 10 * scale);
    ctx.rotate(0.5 + swordAngle);
    
    // 刀柄
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-4 * scale, 10 * scale, 8 * scale, 20 * scale);
    
    // 刀柄缠绕
    ctx.strokeStyle = '#2a1a0f';
    ctx.lineWidth = 1.5 * scale;
    for (let i = 0; i < 5; i++) {
      const y = 12 * scale + i * 4 * scale;
      ctx.beginPath();
      ctx.moveTo(-4 * scale, y);
      ctx.lineTo(4 * scale, y);
      ctx.stroke();
    }
    
    // 护手 - 银色金属
    ctx.fillStyle = '#8a8a9a';
    ctx.beginPath();
    ctx.ellipse(0, 10 * scale, 12 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6a6a7a';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    // 刀刃 - 宽大重剑
    const bladeLength = 120 * scale; // 剑长对应射程2单位
    const bladeWidth = 14 * scale;
    
    const bladeGradient = ctx.createLinearGradient(-bladeWidth, -bladeLength, bladeWidth, 10 * scale);
    bladeGradient.addColorStop(0, '#9a9aaa');
    bladeGradient.addColorStop(0.2, '#aaaabb');
    bladeGradient.addColorStop(0.5, '#bbbccc');
    bladeGradient.addColorStop(0.8, '#aaaabb');
    bladeGradient.addColorStop(1, '#8a8a9a');
    
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(-bladeWidth, 10 * scale);
    ctx.lineTo(-bladeWidth * 0.6, -bladeLength + 15 * scale);
    ctx.lineTo(0, -bladeLength);
    ctx.lineTo(bladeWidth * 0.6, -bladeLength + 15 * scale);
    ctx.lineTo(bladeWidth, 10 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 刀刃边缘
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    // 刀刃中线 - 血槽
    ctx.fillStyle = '#6a6a7a';
    ctx.beginPath();
    ctx.moveTo(-4 * scale, 5 * scale);
    ctx.lineTo(0, -bladeLength + 20 * scale);
    ctx.lineTo(4 * scale, 5 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 刀刃纹理
    ctx.strokeStyle = '#7a7a8a';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 4; i++) {
      const y = -10 * scale - i * 20 * scale;
      if (y < -bladeLength + 30) break;
      ctx.beginPath();
      ctx.moveTo(-bladeWidth * 0.7, y);
      ctx.lineTo(bladeWidth * 0.7, y - 3);
      ctx.stroke();
    }
    
    // 攻击时刀刃发光
    if (attackProgress > 0.2 && attackProgress < 0.8) {
      const glowIntensity = Math.sin((attackProgress - 0.2) / 0.6 * Math.PI);
      ctx.shadowColor = isArmored ? '#FFD700' : '#C0C0C0';
      ctx.shadowBlur = 20 * glowIntensity;
      ctx.strokeStyle = isArmored ? '#FFD700' : '#FFFFFF';
      ctx.lineWidth = 3 * scale;
      ctx.beginPath();
      ctx.moveTo(-bladeWidth * 0.5, 5 * scale);
      ctx.lineTo(0, -bladeLength + 10 * scale);
      ctx.lineTo(bladeWidth * 0.5, 5 * scale);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    ctx.restore();

    // 头部 - 骑士头盔
    const headGradient = ctx.createRadialGradient(cx + 3 * scale, cy - 40 * scale, 0, cx, cy - 38 * scale, 18 * scale);
    headGradient.addColorStop(0, '#5a5a6a');
    headGradient.addColorStop(1, '#3a3a4a');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 38 * scale, 16 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 头盔主体
    const helmetGradient = ctx.createLinearGradient(cx - 15 * scale, 0, cx + 15 * scale, 0);
    helmetGradient.addColorStop(0, '#4a4a5a');
    helmetGradient.addColorStop(0.3, '#6a6a7a');
    helmetGradient.addColorStop(0.5, '#7a7a8a');
    helmetGradient.addColorStop(0.7, '#6a6a7a');
    helmetGradient.addColorStop(1, '#4a4a5a');
    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.arc(cx, cy - 38 * scale, 17 * scale, Math.PI, 0);
    ctx.fill();

    // 头盔护面
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(cx - 12 * scale, cy - 45 * scale, 24 * scale, 14 * scale);
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 2 * scale;
    ctx.strokeRect(cx - 12 * scale, cy - 45 * scale, 24 * scale, 14 * scale);

    // 头盔通风孔
    ctx.fillStyle = '#2a2a3a';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cx - 8 * scale + i * 5 * scale, cy - 43 * scale, 3 * scale, 8 * scale);
    }

    // 眼睛 - 发光
    ctx.fillStyle = isArmored ? '#FFD700' : '#00BFFF';
    ctx.shadowColor = isArmored ? '#FFD700' : '#00BFFF';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(cx + 5 * scale, cy - 38 * scale, 3 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 头盔羽饰 - 蓝色
    ctx.fillStyle = isArmored ? '#FFD700' : '#4169E1';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 55 * scale);
    ctx.lineTo(cx - 8 * scale, cy - 42 * scale);
    ctx.lineTo(cx + 8 * scale, cy - 42 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 羽饰高光
    ctx.fillStyle = isArmored ? '#FFEC8B' : '#6495ED';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 55 * scale);
    ctx.lineTo(cx - 4 * scale, cy - 45 * scale);
    ctx.lineTo(cx + 2 * scale, cy - 45 * scale);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 绘制装甲模式光效 - 炫酷版本
   */
  private drawArmorGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, _progress: number): void {
    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 6) * 0.3 + 0.7;
    
    ctx.save();
    
    // 1. 最外层能量波纹
    for (let i = 0; i < 3; i++) {
      const waveProgress = ((time * 0.5 + i * 0.33) % 1);
      const waveRadius = 40 * scale + waveProgress * 60 * scale;
      const waveAlpha = (1 - waveProgress) * 0.5;
      
      ctx.strokeStyle = `rgba(255, 200, 50, ${waveAlpha})`;
      ctx.lineWidth = 3 * scale * (1 - waveProgress);
      ctx.beginPath();
      ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // 2. 大型金色光环
    const outerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70 * scale);
    outerGlow.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
    outerGlow.addColorStop(0.3, `rgba(255, 200, 50, ${0.35 * pulse})`);
    outerGlow.addColorStop(0.6, `rgba(255, 150, 0, ${0.2 * pulse})`);
    outerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 70 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // 3. 能量护盾边缘 - 六边形
    ctx.strokeStyle = `rgba(255, 215, 0, ${0.8 * pulse})`;
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2 + time * 0.5;
      const radius = 55 * scale + Math.sin(time * 3 + i) * 5 * scale;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // 内层六边形
    ctx.strokeStyle = `rgba(255, 180, 0, ${0.5 * pulse})`;
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2 - time * 0.5;
      const radius = 45 * scale + Math.sin(time * 4 + i) * 3 * scale;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    // 4. 旋转能量线条
    for (let i = 0; i < 4; i++) {
      const lineAngle = time * 2 + (i * Math.PI / 2);
      const innerR = 30 * scale;
      const outerR = 50 * scale;
      
      ctx.strokeStyle = `rgba(255, 230, 100, ${0.6 * pulse})`;
      ctx.lineWidth = 2 * scale;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(lineAngle) * innerR, cy + Math.sin(lineAngle) * innerR);
      ctx.lineTo(cx + Math.cos(lineAngle) * outerR, cy + Math.sin(lineAngle) * outerR);
      ctx.stroke();
    }
    
    // 5. 金色粒子 - 更多更亮
    const particleCount = 16;
    for (let i = 0; i < particleCount; i++) {
      const angle = (time * 1.5 + i * (Math.PI * 2 / particleCount)) % (Math.PI * 2);
      const distance = 35 * scale + Math.sin(time * 3 + i * 0.5) * 15 * scale;
      const size = 4 + Math.sin(time * 4 + i) * 2;
      const alpha = 0.7 + Math.sin(time * 5 + i) * 0.3;
      
      // 粒子光晕
      const particleGlow = ctx.createRadialGradient(
        cx + Math.cos(angle) * distance,
        cy + Math.sin(angle) * distance,
        0,
        cx + Math.cos(angle) * distance,
        cy + Math.sin(angle) * distance,
        size * 2 * scale
      );
      particleGlow.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
      particleGlow.addColorStop(0.5, `rgba(255, 215, 0, ${alpha * 0.5})`);
      particleGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = particleGlow;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(angle) * distance,
        cy + Math.sin(angle) * distance,
        size * 2 * scale,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // 粒子核心
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
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
    
    // 6. 上升能量粒子
    for (let i = 0; i < 8; i++) {
      const riseProgress = (time * 2 + i * 0.125) % 1;
      const riseX = cx + Math.sin(time * 3 + i * 2) * 20 * scale;
      const riseY = cy + 50 * scale - riseProgress * 100 * scale;
      const riseAlpha = (1 - riseProgress) * 0.8;
      const riseSize = 3 * scale * (1 - riseProgress * 0.5);
      
      ctx.fillStyle = `rgba(255, 230, 100, ${riseAlpha})`;
      ctx.beginPath();
      ctx.arc(riseX, riseY, riseSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 7. 闪电效果
    for (let i = 0; i < 3; i++) {
      const lightningAngle = time * 4 + i * (Math.PI * 2 / 3);
      const startR = 25 * scale;
      const endR = 55 * scale;
      
      ctx.strokeStyle = `rgba(255, 255, 200, ${0.6 * pulse})`;
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath();
      
      let x = cx + Math.cos(lightningAngle) * startR;
      let y = cy + Math.sin(lightningAngle) * startR;
      ctx.moveTo(x, y);
      
      // 锯齿状闪电
      const segments = 4;
      for (let j = 1; j <= segments; j++) {
        const segProgress = j / segments;
        const segR = startR + (endR - startR) * segProgress;
        const offset = (Math.random() - 0.5) * 10 * scale;
        x = cx + Math.cos(lightningAngle) * segR + offset;
        y = cy + Math.sin(lightningAngle) * segR + offset;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    ctx.restore();
  }

  /**
   * 绘制举盾光效
   */
  private drawShieldGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number): void {
    const pulse = Math.sin(Date.now() / 100) * 0.2 + 0.8;
    
    ctx.save();
    // 盾牌前方的防护光罩
    const shieldGlow = ctx.createRadialGradient(cx - 50 * scale, cy, 0, cx - 50 * scale, cy, 40 * scale);
    shieldGlow.addColorStop(0, `rgba(100, 149, 237, ${0.4 * pulse})`);
    shieldGlow.addColorStop(0.5, `rgba(100, 149, 237, ${0.2 * pulse})`);
    shieldGlow.addColorStop(1, 'rgba(100, 149, 237, 0)');
    ctx.fillStyle = shieldGlow;
    ctx.beginPath();
    ctx.ellipse(cx - 50 * scale, cy, 35 * scale, 50 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * 渲染肉盾预览（用于选角色界面）
   */
  renderPreview(ctx: CanvasRenderingContext2D, _config: CharacterConfig, params: PreviewRenderParams): void {
    const { x, y, scale } = params;

    // 腿部
    const legGradient = ctx.createLinearGradient(x - 14 * scale, 0, x + 14 * scale, 0);
    legGradient.addColorStop(0, '#2a2a3a');
    legGradient.addColorStop(0.5, '#3a3a4a');
    legGradient.addColorStop(1, '#2a2a3a');
    ctx.fillStyle = legGradient;
    ctx.fillRect(x - 10 * scale, y + 24 * scale, 8 * scale, 28 * scale);
    ctx.fillRect(x + 2 * scale, y + 24 * scale, 8 * scale, 28 * scale);

    // 身体
    const bodyGradient = ctx.createRadialGradient(x, y - 5, 0, x, y - 5, 25 * scale);
    bodyGradient.addColorStop(0, '#4a4a6a');
    bodyGradient.addColorStop(1, '#2a2a4a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y - 2 * scale, 22 * scale, 30 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 胸甲
    const chestGradient = ctx.createLinearGradient(x - 15 * scale, 0, x + 15 * scale, 0);
    chestGradient.addColorStop(0, '#5a5a6a');
    chestGradient.addColorStop(0.5, '#8a8a9a');
    chestGradient.addColorStop(1, '#5a5a6a');
    ctx.fillStyle = chestGradient;
    ctx.beginPath();
    ctx.moveTo(x - 15 * scale, y - 25 * scale);
    ctx.lineTo(x + 15 * scale, y - 25 * scale);
    ctx.lineTo(x + 12 * scale, y + 20 * scale);
    ctx.lineTo(x, y + 25 * scale);
    ctx.lineTo(x - 12 * scale, y + 20 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 十字徽章
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 2.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x, y - 20 * scale);
    ctx.lineTo(x, y + 18 * scale);
    ctx.moveTo(x - 8 * scale, y - 5 * scale);
    ctx.lineTo(x + 8 * scale, y - 5 * scale);
    ctx.stroke();

    // 护肩
    ctx.fillStyle = '#6a6a7a';
    ctx.beginPath();
    ctx.ellipse(x - 22 * scale, y - 12 * scale, 12 * scale, 16 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + 20 * scale, y - 10 * scale, 14 * scale, 18 * scale, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 左臂
    ctx.fillStyle = '#5a5a6a';
    ctx.beginPath();
    ctx.ellipse(x - 28 * scale, y, 8 * scale, 16 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 盾牌
    const shieldGradient = ctx.createRadialGradient(x - 45 * scale, y - 5 * scale, 0, x - 45 * scale, y - 5 * scale, 35 * scale);
    shieldGradient.addColorStop(0, '#5a5a7a');
    shieldGradient.addColorStop(1, '#3a3a5a');
    ctx.fillStyle = shieldGradient;
    ctx.beginPath();
    ctx.moveTo(x - 45 * scale, y - 40 * scale);
    ctx.bezierCurveTo(x - 20 * scale, y - 35 * scale, x - 17 * scale, y - 5 * scale, x - 20 * scale, y + 15 * scale);
    ctx.lineTo(x - 45 * scale, y + 30 * scale);
    ctx.lineTo(x - 70 * scale, y + 15 * scale);
    ctx.bezierCurveTo(x - 73 * scale, y - 5 * scale, x - 70 * scale, y - 35 * scale, x - 45 * scale, y - 40 * scale);
    ctx.fill();
    ctx.strokeStyle = '#6a6a7a';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // 盾牌十字
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 45 * scale, y - 25 * scale);
    ctx.lineTo(x - 45 * scale, y + 15 * scale);
    ctx.moveTo(x - 57 * scale, y - 5 * scale);
    ctx.lineTo(x - 33 * scale, y - 5 * scale);
    ctx.stroke();

    // 右臂
    ctx.fillStyle = '#5a5a6a';
    ctx.beginPath();
    ctx.ellipse(x + 25 * scale, y, 9 * scale, 16 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 大刀
    ctx.save();
    ctx.translate(x + 40 * scale, y - 10 * scale);
    ctx.rotate(0.5);
    
    // 刀柄
    ctx.fillStyle = '#3d2817';
    ctx.fillRect(-4 * scale, 10 * scale, 8 * scale, 20 * scale);
    
    // 护手
    ctx.fillStyle = '#8a8a9a';
    ctx.beginPath();
    ctx.ellipse(0, 10 * scale, 12 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 刀刃
    const bladeGradient = ctx.createLinearGradient(-14 * scale, -120 * scale, 14 * scale, 10 * scale);
    bladeGradient.addColorStop(0, '#9a9aaa');
    bladeGradient.addColorStop(0.5, '#bbbccc');
    bladeGradient.addColorStop(1, '#8a8a9a');
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(-14 * scale, 10 * scale);
    ctx.lineTo(-8 * scale, -105 * scale);
    ctx.lineTo(0, -120 * scale);
    ctx.lineTo(8 * scale, -105 * scale);
    ctx.lineTo(14 * scale, 10 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    ctx.restore();

    // 头部
    const headGradient = ctx.createRadialGradient(x + 3 * scale, y - 40 * scale, 0, x, y - 38 * scale, 18 * scale);
    headGradient.addColorStop(0, '#5a5a6a');
    headGradient.addColorStop(1, '#3a3a4a');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(x, y - 38 * scale, 16 * scale, 18 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 头盔
    const helmetGradient = ctx.createLinearGradient(x - 15 * scale, 0, x + 15 * scale, 0);
    helmetGradient.addColorStop(0, '#4a4a5a');
    helmetGradient.addColorStop(0.5, '#7a7a8a');
    helmetGradient.addColorStop(1, '#4a4a5a');
    ctx.fillStyle = helmetGradient;
    ctx.beginPath();
    ctx.arc(x, y - 38 * scale, 17 * scale, Math.PI, 0);
    ctx.fill();

    // 头盔护面
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(x - 12 * scale, y - 45 * scale, 24 * scale, 14 * scale);

    // 眼睛
    ctx.fillStyle = '#00BFFF';
    ctx.shadowColor = '#00BFFF';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(x + 5 * scale, y - 38 * scale, 3 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 头盔羽饰
    ctx.fillStyle = '#4169E1';
    ctx.beginPath();
    ctx.moveTo(x, y - 55 * scale);
    ctx.lineTo(x - 8 * scale, y - 42 * scale);
    ctx.lineTo(x + 8 * scale, y - 42 * scale);
    ctx.closePath();
    ctx.fill();
  }
}
