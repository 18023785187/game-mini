/**
 * 神枪手渲染器
 * 负责绘制神枪手角色形象
 * 炫酷西部牛仔风格 - 赏金猎人
 */

import { CharacterConfig } from '../types/Character';
import { RenderParams, PreviewRenderParams, ICharacterRenderer } from './ICharacterRenderer';

export class GunnerRenderer implements ICharacterRenderer {
  renderBattle(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: RenderParams): void {
    const { cx, cy, scale, walkCycle, isMoving, attackProgress, isRapidFire, rapidFireShotsFired, rapidFireProgress } = params;

    const time = Date.now() / 1000;
    
    let leftGunRecoil = 0;
    let rightGunRecoil = 0;
    if (isRapidFire) {
      const recoilIntensity = Math.sin(time * 15) * 0.4;
      if (rapidFireShotsFired % 2 === 0) {
        rightGunRecoil = recoilIntensity;
      } else {
        leftGunRecoil = recoilIntensity;
      }
    }

    // 双枪连射特效
    if (isRapidFire) {
      this.drawRapidFireEffect(ctx, cx, cy, scale, rapidFireProgress, time);
    }

    // 攻击时枪口火焰
    const showMuzzleFlash = attackProgress > 0.1 && attackProgress < 0.5;

    // 斗篷 - 更大更飘逸
    ctx.save();
    const capeWave = isMoving ? Math.sin(walkCycle) * 0.25 : Math.sin(time * 2) * 0.15;
    ctx.translate(cx - 12 * scale, cy - 15 * scale);
    ctx.rotate(capeWave - 0.2);
    
    const capeGradient = ctx.createLinearGradient(0, 0, -40 * scale, 70 * scale);
    capeGradient.addColorStop(0, '#8B0000');
    capeGradient.addColorStop(0.3, '#6B0000');
    capeGradient.addColorStop(0.7, '#4B0000');
    capeGradient.addColorStop(1, '#2B0000');
    
    ctx.fillStyle = capeGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15 * scale, 10 * scale, -35 * scale, 25 * scale, -40 * scale, 45 * scale);
    ctx.bezierCurveTo(-42 * scale, 60 * scale, -38 * scale, 75 * scale, -30 * scale, 85 * scale);
    ctx.lineTo(-20 * scale, 80 * scale);
    ctx.bezierCurveTo(-10 * scale, 65 * scale, -5 * scale, 45 * scale, 0, 25 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#A00000';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    ctx.strokeStyle = 'rgba(139, 0, 0, 0.3)';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 5; i++) {
      const y = 15 * scale + i * 12 * scale;
      ctx.beginPath();
      ctx.moveTo(-5 * scale, y);
      ctx.quadraticCurveTo(-20 * scale, y + 8 * scale, -30 * scale, y + 15 * scale);
      ctx.stroke();
    }
    ctx.restore();

    // 腿部
    const rightLegAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.25 : 0;
    const leftLegAngle = isMoving ? Math.sin(walkCycle) * 0.25 : 0;

    // 后腿（左腿）
    ctx.save();
    ctx.translate(cx - 6 * scale, cy + 28 * scale);
    ctx.rotate(leftLegAngle);
    
    const backLegGradient = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, 0);
    backLegGradient.addColorStop(0, '#1a1510');
    backLegGradient.addColorStop(0.5, '#2a2520');
    backLegGradient.addColorStop(1, '#1a1510');
    ctx.fillStyle = backLegGradient;
    
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 6 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-5 * scale, 8 * scale, 10 * scale, 18 * scale);
    
    // 蛇皮牛仔靴
    const bootGradient = ctx.createLinearGradient(-5 * scale, 25 * scale, 5 * scale, 35 * scale);
    bootGradient.addColorStop(0, '#8B4513');
    bootGradient.addColorStop(0.3, '#A0522D');
    bootGradient.addColorStop(0.6, '#8B4513');
    bootGradient.addColorStop(1, '#654321');
    ctx.fillStyle = bootGradient;
    ctx.beginPath();
    ctx.moveTo(-5 * scale, 25 * scale);
    ctx.lineTo(6 * scale, 25 * scale);
    ctx.lineTo(10 * scale, 35 * scale);
    ctx.lineTo(-3 * scale, 35 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 靴子蛇纹
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 0.8 * scale;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-1 * scale + i * 2 * scale, 28 * scale, 1.5 * scale, 0, Math.PI);
      ctx.stroke();
    }
    
    // 马刺
    ctx.fillStyle = '#C0C0C0';
    ctx.beginPath();
    ctx.arc(8 * scale, 32 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#A0A0A0';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(8 * scale, 30 * scale);
    ctx.lineTo(8 * scale, 34 * scale);
    ctx.stroke();
    ctx.restore();

    // 前腿（右腿）
    ctx.save();
    ctx.translate(cx + 6 * scale, cy + 28 * scale);
    ctx.rotate(rightLegAngle);
    
    const frontLegGradient = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, 0);
    frontLegGradient.addColorStop(0, '#2a2520');
    frontLegGradient.addColorStop(0.5, '#3a3530');
    frontLegGradient.addColorStop(1, '#2a2520');
    ctx.fillStyle = frontLegGradient;
    
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 6 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-5 * scale, 8 * scale, 10 * scale, 18 * scale);
    
    // 蛇皮牛仔靴
    const frontBootGradient = ctx.createLinearGradient(-5 * scale, 25 * scale, 5 * scale, 35 * scale);
    frontBootGradient.addColorStop(0, '#A0522D');
    frontBootGradient.addColorStop(0.3, '#B8860B');
    frontBootGradient.addColorStop(0.6, '#A0522D');
    frontBootGradient.addColorStop(1, '#8B4513');
    ctx.fillStyle = frontBootGradient;
    ctx.beginPath();
    ctx.moveTo(-5 * scale, 25 * scale);
    ctx.lineTo(6 * scale, 25 * scale);
    ctx.lineTo(10 * scale, 35 * scale);
    ctx.lineTo(-3 * scale, 35 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 0.8 * scale;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-1 * scale + i * 2 * scale, 28 * scale, 1.5 * scale, 0, Math.PI);
      ctx.stroke();
    }
    
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(8 * scale, 32 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(8 * scale, 30 * scale);
    ctx.lineTo(8 * scale, 34 * scale);
    ctx.stroke();
    ctx.restore();

    // 身体
    const bodyGradient = ctx.createRadialGradient(cx - 2 * scale, cy - 5 * scale, 0, cx, cy, 25 * scale);
    bodyGradient.addColorStop(0, '#4a4540');
    bodyGradient.addColorStop(0.5, config.color);
    bodyGradient.addColorStop(1, '#2a2520');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 18 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 皮夹克
    const jacketGradient = ctx.createLinearGradient(cx - 18 * scale, 0, cx + 18 * scale, 0);
    jacketGradient.addColorStop(0, '#2a1a10');
    jacketGradient.addColorStop(0.2, '#3a2a20');
    jacketGradient.addColorStop(0.5, '#4a3a30');
    jacketGradient.addColorStop(0.8, '#3a2a20');
    jacketGradient.addColorStop(1, '#2a1a10');
    ctx.fillStyle = jacketGradient;
    ctx.beginPath();
    ctx.moveTo(cx - 16 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 14 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 12 * scale, cy + 22 * scale);
    ctx.lineTo(cx, cy + 25 * scale);
    ctx.lineTo(cx - 14 * scale, cy + 20 * scale);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#5a4a40';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // 夹克拉链
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 2 * scale, cy - 20 * scale);
    ctx.lineTo(cx - 2 * scale, cy + 20 * scale);
    ctx.stroke();
    
    // 拉链齿
    ctx.fillStyle = '#A0A0A0';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(cx - 3 * scale, cy - 18 * scale + i * 5 * scale, 2 * scale, 2 * scale);
    }

    // 子弹带（斜跨）
    ctx.save();
    ctx.translate(cx, cy - 15 * scale);
    ctx.rotate(0.15);
    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(-18 * scale, -5 * scale);
    ctx.lineTo(15 * scale, 30 * scale);
    ctx.stroke();
    
    // 子弹
    ctx.fillStyle = '#D4AF37';
    for (let i = 0; i < 6; i++) {
      const bx = -15 * scale + i * 5.5 * scale;
      const by = -2 * scale + i * 5.5 * scale;
      ctx.beginPath();
      ctx.ellipse(bx, by, 2 * scale, 3 * scale, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#B8860B';
      ctx.fillRect(bx - 1 * scale, by + 2 * scale, 2 * scale, 3 * scale);
      ctx.fillStyle = '#D4AF37';
    }
    ctx.restore();

    // 腰带和枪套
    ctx.fillStyle = '#654321';
    ctx.fillRect(cx - 20 * scale, cy + 18 * scale, 40 * scale, 5 * scale);
    
    // 腰带扣
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.moveTo(cx - 4 * scale, cy + 18 * scale);
    ctx.lineTo(cx + 4 * scale, cy + 18 * scale);
    ctx.lineTo(cx + 5 * scale, cy + 23 * scale);
    ctx.lineTo(cx - 5 * scale, cy + 23 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.arc(cx, cy + 20.5 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 右侧枪套
    ctx.save();
    ctx.translate(cx + 18 * scale, cy + 20 * scale);
    ctx.rotate(0.1);
    ctx.fillStyle = '#5a3a20';
    ctx.beginPath();
    ctx.moveTo(-4 * scale, 0);
    ctx.lineTo(4 * scale, 0);
    ctx.lineTo(5 * scale, 20 * scale);
    ctx.lineTo(-3 * scale, 20 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7a5a40';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    ctx.restore();

    // 后手（左手）持枪
    ctx.save();
    ctx.translate(cx - 10 * scale, cy + 5 * scale);
    const leftArmAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.18 : 0;
    ctx.rotate(leftArmAngle + Math.PI / 2 + leftGunRecoil);
    
    const leftArmGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    leftArmGradient.addColorStop(0, '#3a2a20');
    leftArmGradient.addColorStop(0.5, '#4a3a30');
    leftArmGradient.addColorStop(1, '#3a2a20');
    ctx.fillStyle = leftArmGradient;
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 6 * scale, 12 * scale, 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.save();
    ctx.translate(0, 10 * scale);
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#cc9977';
    ctx.fillRect(-1 * scale, -5 * scale, 1.5 * scale, 4 * scale);
    ctx.fillRect(0.5 * scale, -5 * scale, 1.5 * scale, 4 * scale);
    ctx.restore();
    
    ctx.save();
    ctx.translate(0, 18 * scale);
    this.drawColtRevolver(ctx, 0, 0, scale, 0, showMuzzleFlash && !isRapidFire);
    ctx.restore();
    ctx.restore();

    // 前手（右手）持枪
    ctx.save();
    ctx.translate(cx + 20 * scale, cy + 5 * scale);
    const rightArmAngle = isMoving ? Math.sin(walkCycle) * 0.18 : 0;
    ctx.rotate(rightArmAngle - Math.PI / 2 + rightGunRecoil);
    
    const rightArmGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    rightArmGradient.addColorStop(0, '#3a2a20');
    rightArmGradient.addColorStop(0.5, '#5a4a40');
    rightArmGradient.addColorStop(1, '#3a2a20');
    ctx.fillStyle = rightArmGradient;
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 6 * scale, 12 * scale, -0.15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.save();
    ctx.translate(0, 10 * scale);
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.5 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#cc9977';
    ctx.fillRect(-1 * scale, -5 * scale, 1.5 * scale, 4 * scale);
    ctx.fillRect(0.5 * scale, -5 * scale, 1.5 * scale, 4 * scale);
    ctx.restore();
    
    ctx.save();
    ctx.translate(0, 18 * scale);
    this.drawColtRevolver(ctx, 0, 0, scale, Math.PI, showMuzzleFlash && !isRapidFire);
    ctx.restore();
    ctx.restore();

    // 头部
    const headGradient = ctx.createRadialGradient(cx + 4 * scale, cy - 40 * scale, 0, cx, cy - 38 * scale, 14 * scale);
    headGradient.addColorStop(0, '#f5d0a0');
    headGradient.addColorStop(1, '#d4a070');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(cx + 2 * scale, cy - 38 * scale, 12 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 墨镜
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(cx + 6 * scale, cy - 40 * scale, 5 * scale, 3.5 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 1 * scale, cy - 40 * scale);
    ctx.lineTo(cx + 11 * scale, cy - 40 * scale);
    ctx.stroke();
    
    // 墨镜反光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.ellipse(cx + 4 * scale, cy - 41 * scale, 2 * scale, 1 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 胡茬
    ctx.fillStyle = '#5a4a3a';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(cx + 8 * scale, cy - 26 * scale, 5 * scale, 4 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // 牛仔帽 - 更炫酷
    ctx.save();
    ctx.translate(cx, cy - 52 * scale);
    
    const hatGradient = ctx.createLinearGradient(-12 * scale, -15 * scale, 12 * scale, 5 * scale);
    hatGradient.addColorStop(0, '#1a1a1a');
    hatGradient.addColorStop(0.3, '#2a2a2a');
    hatGradient.addColorStop(0.5, '#3a3a3a');
    hatGradient.addColorStop(0.7, '#2a2a2a');
    hatGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = hatGradient;
    
    // 帽顶
    ctx.beginPath();
    ctx.ellipse(0, -8 * scale, 10 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 帽檐 - 宽边翘起
    ctx.beginPath();
    ctx.moveTo(-22 * scale, 0);
    ctx.quadraticCurveTo(-25 * scale, -3 * scale, -20 * scale, -5 * scale);
    ctx.quadraticCurveTo(-10 * scale, -8 * scale, 0, -2 * scale);
    ctx.quadraticCurveTo(10 * scale, -8 * scale, 20 * scale, -5 * scale);
    ctx.quadraticCurveTo(25 * scale, -3 * scale, 22 * scale, 0);
    ctx.quadraticCurveTo(15 * scale, 3 * scale, 0, 2 * scale);
    ctx.quadraticCurveTo(-15 * scale, 3 * scale, -22 * scale, 0);
    ctx.fill();
    
    // 帽带 - 金色
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.ellipse(0, -8 * scale, 10 * scale, 12 * scale, 0, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();
    
    // 帽带装饰 - 鹰羽
    ctx.fillStyle = '#8B0000';
    ctx.save();
    ctx.translate(8 * scale, -15 * scale);
    ctx.rotate(-0.3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8 * scale, -5 * scale, 15 * scale, -8 * scale);
    ctx.quadraticCurveTo(8 * scale, -3 * scale, 0, 3 * scale);
    ctx.fill();
    ctx.restore();
    
    // 帽子金属徽章
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(-8 * scale, -10 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#B8860B';
    ctx.beginPath();
    ctx.arc(-8 * scale, -10 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // 围巾
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(cx - 10 * scale, cy - 25 * scale);
    ctx.quadraticCurveTo(cx + 5 * scale, cy - 22 * scale, cx + 12 * scale, cy - 25 * scale);
    ctx.lineTo(cx + 8 * scale, cy - 18 * scale);
    ctx.lineTo(cx - 6 * scale, cy - 18 * scale);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 绘制柯尔特左轮手枪
   */
  private drawColtRevolver(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, angle: number, showFlash: boolean): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // 枪管
    const barrelGradient = ctx.createLinearGradient(-3 * scale, -25 * scale, 3 * scale, 5 * scale);
    barrelGradient.addColorStop(0, '#4a4a4a');
    barrelGradient.addColorStop(0.3, '#6a6a6a');
    barrelGradient.addColorStop(0.5, '#8a8a8a');
    barrelGradient.addColorStop(0.7, '#6a6a6a');
    barrelGradient.addColorStop(1, '#4a4a4a');
    ctx.fillStyle = barrelGradient;
    
    // 枪管主体
    ctx.beginPath();
    ctx.moveTo(-3 * scale, -25 * scale);
    ctx.lineTo(3 * scale, -25 * scale);
    ctx.lineTo(3.5 * scale, 2 * scale);
    ctx.lineTo(-3.5 * scale, 2 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 枪管顶部瞄准器
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-1 * scale, -27 * scale, 2 * scale, 3 * scale);

    // 枪身
    const bodyGradient = ctx.createLinearGradient(-6 * scale, 0, 6 * scale, 10 * scale);
    bodyGradient.addColorStop(0, '#5a5a5a');
    bodyGradient.addColorStop(0.5, '#7a7a7a');
    bodyGradient.addColorStop(1, '#4a4a4a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(-6 * scale, 2 * scale);
    ctx.lineTo(6 * scale, 2 * scale);
    ctx.lineTo(6 * scale, 10 * scale);
    ctx.lineTo(-6 * scale, 10 * scale);
    ctx.closePath();
    ctx.fill();

    // 转轮
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.ellipse(-7 * scale, 6 * scale, 4 * scale, 6 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 转轮弹孔
    ctx.fillStyle = '#2a2a2a';
    for (let i = 0; i < 6; i++) {
      const holeAngle = (i / 6) * Math.PI * 2;
      const holeX = -7 * scale + Math.cos(holeAngle) * 2.5 * scale;
      const holeY = 6 * scale + Math.sin(holeAngle) * 4 * scale;
      ctx.beginPath();
      ctx.arc(holeX, holeY, 1 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 转轮中心
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.arc(-7 * scale, 6 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 握把 - 珍珠质感
    const gripGradient = ctx.createRadialGradient(0, 15 * scale, 0, 0, 18 * scale, 8 * scale);
    gripGradient.addColorStop(0, '#f5f5dc');
    gripGradient.addColorStop(0.3, '#faebd7');
    gripGradient.addColorStop(0.6, '#f5deb3');
    gripGradient.addColorStop(1, '#deb887');
    ctx.fillStyle = gripGradient;
    ctx.beginPath();
    ctx.moveTo(-5 * scale, 10 * scale);
    ctx.lineTo(5 * scale, 10 * scale);
    ctx.lineTo(4 * scale, 22 * scale);
    ctx.quadraticCurveTo(0, 25 * scale, -4 * scale, 22 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 握把纹理
    ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
    ctx.lineWidth = 0.5 * scale;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-3 * scale + i * 1.5 * scale, 12 * scale);
      ctx.lineTo(-3 * scale + i * 1.5 * scale, 20 * scale);
      ctx.stroke();
    }

    // 扳机护圈
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(0, 14 * scale, 4 * scale, 5 * scale, 0, Math.PI * 0.3, Math.PI * 0.7);
    ctx.stroke();
    
    // 扳机
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.moveTo(0, 11 * scale);
    ctx.quadraticCurveTo(2 * scale, 13 * scale, 1.5 * scale, 16 * scale);
    ctx.lineTo(-0.5 * scale, 16 * scale);
    ctx.quadraticCurveTo(-1 * scale, 13 * scale, 0, 11 * scale);
    ctx.fill();

    // 枪口火焰
    if (showFlash) {
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FF4500';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-4 * scale, -25 * scale);
      ctx.lineTo(4 * scale, -25 * scale);
      ctx.lineTo(0, -35 * scale);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = '#FF4500';
      ctx.beginPath();
      ctx.moveTo(-2 * scale, -25 * scale);
      ctx.lineTo(2 * scale, -25 * scale);
      ctx.lineTo(0, -30 * scale);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  /**
   * 绘制双枪连射特效
   */
  private drawRapidFireEffect(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, progress: number, time: number): void {
    ctx.save();
    
    // 能量光环
    const pulse = Math.sin(time * 10) * 0.3 + 0.7;
    
    const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50 * scale);
    glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0)');
    glowGradient.addColorStop(0.5, `rgba(255, 165, 0, ${0.3 * pulse})`);
    glowGradient.addColorStop(1, 'rgba(255, 69, 0, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 50 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // 弹壳飞溅效果
    for (let i = 0; i < 6; i++) {
      const shellAngle = time * 8 + i * (Math.PI / 3);
      const shellDistance = 30 * scale + Math.sin(time * 5 + i) * 10 * scale;
      const shellX = cx + Math.cos(shellAngle) * shellDistance;
      const shellY = cy - 20 * scale + Math.sin(shellAngle) * shellDistance * 0.5;
      
      ctx.fillStyle = '#D4AF37';
      ctx.save();
      ctx.translate(shellX, shellY);
      ctx.rotate(shellAngle * 3);
      ctx.fillRect(-1.5 * scale, -4 * scale, 3 * scale, 8 * scale);
      ctx.restore();
    }
    
    // 火花粒子
    for (let i = 0; i < 12; i++) {
      const sparkAngle = time * 15 + i * (Math.PI / 6);
      const sparkDistance = 20 * scale + Math.sin(time * 8 + i) * 15 * scale;
      const sparkX = cx + Math.cos(sparkAngle) * sparkDistance;
      const sparkY = cy + Math.sin(sparkAngle) * sparkDistance * 0.6;
      const sparkSize = 2 + Math.sin(time * 12 + i) * 1.5;
      
      ctx.fillStyle = `rgba(255, 200, 50, ${0.8 * pulse})`;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, sparkSize * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * 渲染预览
   */
  renderPreview(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: PreviewRenderParams): void {
    const { x, y, scale } = params;

    // 斗篷
    ctx.save();
    ctx.translate(x - 12 * scale, y - 15 * scale);
    ctx.rotate(-0.2);
    
    const capeGradient = ctx.createLinearGradient(0, 0, -40 * scale, 70 * scale);
    capeGradient.addColorStop(0, '#8B0000');
    capeGradient.addColorStop(0.5, '#5B0000');
    capeGradient.addColorStop(1, '#3B0000');
    
    ctx.fillStyle = capeGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-15 * scale, 15 * scale, -35 * scale, 35 * scale, -30 * scale, 60 * scale);
    ctx.lineTo(-15 * scale, 55 * scale);
    ctx.quadraticCurveTo(-5 * scale, 35 * scale, 0, 20 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 腿部
    ctx.fillStyle = '#1a1510';
    ctx.beginPath();
    ctx.ellipse(x - 6 * scale, y + 23 * scale, 6 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 11 * scale, y + 36 * scale, 10 * scale, 18 * scale);
    
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(x - 11 * scale, y + 53 * scale);
    ctx.lineTo(x, y + 53 * scale);
    ctx.lineTo(x + 4 * scale, y + 62 * scale);
    ctx.lineTo(x - 7 * scale, y + 62 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2a2520';
    ctx.beginPath();
    ctx.ellipse(x + 6 * scale, y + 23 * scale, 6 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 1 * scale, y + 36 * scale, 10 * scale, 18 * scale);
    
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(x + 1 * scale, y + 53 * scale);
    ctx.lineTo(x + 12 * scale, y + 53 * scale);
    ctx.lineTo(x + 16 * scale, y + 62 * scale);
    ctx.lineTo(x + 5 * scale, y + 62 * scale);
    ctx.closePath();
    ctx.fill();

    // 身体
    const bodyGradient = ctx.createRadialGradient(x - 2 * scale, y - 5 * scale, 0, x, y, 25 * scale);
    bodyGradient.addColorStop(0, '#4a4540');
    bodyGradient.addColorStop(0.5, config.color);
    bodyGradient.addColorStop(1, '#2a2520');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, 18 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 皮夹克
    ctx.fillStyle = '#3a2a20';
    ctx.beginPath();
    ctx.moveTo(x - 16 * scale, y - 22 * scale);
    ctx.lineTo(x + 14 * scale, y - 22 * scale);
    ctx.lineTo(x + 12 * scale, y + 22 * scale);
    ctx.lineTo(x, y + 25 * scale);
    ctx.lineTo(x - 14 * scale, y + 20 * scale);
    ctx.closePath();
    ctx.fill();

    // 子弹带
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(x - 18 * scale, y - 20 * scale);
    ctx.lineTo(x + 15 * scale, y + 15 * scale);
    ctx.stroke();
    
    ctx.fillStyle = '#D4AF37';
    for (let i = 0; i < 6; i++) {
      const bx = x - 15 * scale + i * 5.5 * scale;
      const by = y - 17 * scale + i * 5.5 * scale;
      ctx.beginPath();
      ctx.ellipse(bx, by, 2 * scale, 3 * scale, 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // 腰带
    ctx.fillStyle = '#654321';
    ctx.fillRect(x - 20 * scale, y + 18 * scale, 40 * scale, 5 * scale);
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(x, y + 20.5 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 后手
    ctx.save();
    ctx.translate(x - 22 * scale, y + 5 * scale);
    ctx.rotate(-0.3);
    ctx.fillStyle = '#3a2a20';
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 6 * scale, 12 * scale, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 10 * scale, 4.5 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    this.drawColtRevolver(ctx, 0, 18 * scale, scale, 0.1, false);
    ctx.restore();

    // 前手
    ctx.save();
    ctx.translate(x + 22 * scale, y + 5 * scale);
    ctx.rotate(0.3);
    ctx.fillStyle = '#4a3a30';
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 6 * scale, 12 * scale, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 10 * scale, 4.5 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    this.drawColtRevolver(ctx, 0, 18 * scale, scale, Math.PI - 0.1, false);
    ctx.restore();

    // 头部
    const headGradient = ctx.createRadialGradient(x + 4 * scale, y - 40 * scale, 0, x, y - 38 * scale, 14 * scale);
    headGradient.addColorStop(0, '#f5d0a0');
    headGradient.addColorStop(1, '#d4a070');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(x + 2 * scale, y - 38 * scale, 12 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 墨镜
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(x + 6 * scale, y - 40 * scale, 5 * scale, 3.5 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 1 * scale, y - 40 * scale);
    ctx.lineTo(x + 11 * scale, y - 40 * scale);
    ctx.stroke();

    // 牛仔帽
    ctx.save();
    ctx.translate(x, y - 52 * scale);
    
    const hatGradient = ctx.createLinearGradient(-12 * scale, -15 * scale, 12 * scale, 5 * scale);
    hatGradient.addColorStop(0, '#1a1a1a');
    hatGradient.addColorStop(0.5, '#3a3a3a');
    hatGradient.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = hatGradient;
    
    ctx.beginPath();
    ctx.ellipse(0, -8 * scale, 10 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-22 * scale, 0);
    ctx.quadraticCurveTo(-25 * scale, -3 * scale, -20 * scale, -5 * scale);
    ctx.quadraticCurveTo(-10 * scale, -8 * scale, 0, -2 * scale);
    ctx.quadraticCurveTo(10 * scale, -8 * scale, 20 * scale, -5 * scale);
    ctx.quadraticCurveTo(25 * scale, -3 * scale, 22 * scale, 0);
    ctx.quadraticCurveTo(15 * scale, 3 * scale, 0, 2 * scale);
    ctx.quadraticCurveTo(-15 * scale, 3 * scale, -22 * scale, 0);
    ctx.fill();
    
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3 * scale;
    ctx.beginPath();
    ctx.ellipse(0, -8 * scale, 10 * scale, 12 * scale, 0, Math.PI * 0.7, Math.PI * 1.3);
    ctx.stroke();
    
    ctx.fillStyle = '#8B0000';
    ctx.save();
    ctx.translate(8 * scale, -15 * scale);
    ctx.rotate(-0.3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8 * scale, -5 * scale, 15 * scale, -8 * scale);
    ctx.quadraticCurveTo(8 * scale, -3 * scale, 0, 3 * scale);
    ctx.fill();
    ctx.restore();
    
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(-8 * scale, -10 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // 围巾
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(x - 10 * scale, y - 25 * scale);
    ctx.quadraticCurveTo(x + 5 * scale, y - 22 * scale, x + 12 * scale, y - 25 * scale);
    ctx.lineTo(x + 8 * scale, y - 18 * scale);
    ctx.lineTo(x - 6 * scale, y - 18 * scale);
    ctx.closePath();
    ctx.fill();
  }
}
