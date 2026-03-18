/**
 * 神枪手渲染器
 * 负责绘制神枪手角色形象
 * 西部牛仔风格，侧身双枪
 */

import { CharacterConfig } from '../types/Character';
import { RenderParams, PreviewRenderParams, ICharacterRenderer } from './ICharacterRenderer';

/**
 * 神枪手渲染器
 */
export class GunnerRenderer implements ICharacterRenderer {
  /**
   * 渲染战斗场景中的神枪手 - 侧身西部牛仔风格
   */
  renderBattle(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: RenderParams): void {
    const { cx, cy, scale, walkCycle, isMoving, direction } = params;

    // 腿部动画 - 侧身视图，前后腿分离
    const rightLegAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.2 : 0;
    const leftLegAngle = isMoving ? Math.sin(walkCycle) * 0.2 : 0;

    // 后腿（左腿）- 牛仔靴
    ctx.save();
    ctx.translate(cx - 5 * scale, cy + 28 * scale);
    ctx.rotate(leftLegAngle);
    
    const backLegGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    backLegGradient.addColorStop(0, '#1a1510');
    backLegGradient.addColorStop(0.5, '#2a2520');
    backLegGradient.addColorStop(1, '#1a1510');
    ctx.fillStyle = backLegGradient;
    
    // 牛仔裤
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 5 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-4 * scale, 6 * scale, 8 * scale, 15 * scale);
    
    // 牛仔靴 - 棕色皮革
    ctx.fillStyle = '#5a3a20';
    ctx.beginPath();
    ctx.moveTo(-4 * scale, 21 * scale);
    ctx.lineTo(5 * scale, 21 * scale);
    ctx.lineTo(7 * scale, 28 * scale);
    ctx.lineTo(-2 * scale, 28 * scale);
    ctx.lineTo(-4 * scale, 21 * scale);
    ctx.fill();
    
    // 靴子跟部高光
    ctx.fillStyle = '#7a5a40';
    ctx.fillRect(0, 21 * scale, 5 * scale, 3 * scale);
    ctx.restore();

    // 前腿（右腿）- 更亮
    ctx.save();
    ctx.translate(cx + 5 * scale, cy + 28 * scale);
    ctx.rotate(rightLegAngle);
    
    const frontLegGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    frontLegGradient.addColorStop(0, '#2a2520');
    frontLegGradient.addColorStop(0.5, '#3a3530');
    frontLegGradient.addColorStop(1, '#2a2520');
    ctx.fillStyle = frontLegGradient;
    
    // 牛仔裤
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 5 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-4 * scale, 6 * scale, 8 * scale, 15 * scale);
    
    // 牛仔靴
    ctx.fillStyle = '#6a4a30';
    ctx.beginPath();
    ctx.moveTo(-4 * scale, 21 * scale);
    ctx.lineTo(5 * scale, 21 * scale);
    ctx.lineTo(7 * scale, 28 * scale);
    ctx.lineTo(-2 * scale, 28 * scale);
    ctx.lineTo(-4 * scale, 21 * scale);
    ctx.fill();
    
    // 靴子装饰
    ctx.fillStyle = '#8a6a50';
    ctx.fillRect(0, 21 * scale, 5 * scale, 3 * scale);
    ctx.restore();

    // 披风 - 西部牛仔风格，从肩膀向后飘动
    ctx.save();
    const capeWave = isMoving ? Math.sin(walkCycle) * 0.2 : Math.sin(Date.now() / 1000) * 0.1; // 飘动效果
    ctx.translate(cx - 8 * scale, cy - 18 * scale); // 从左肩位置开始
    ctx.rotate(capeWave - 0.15); // 向后倾斜
    
    // 披风主体 - 深棕色皮革
    const capeGradient = ctx.createLinearGradient(0, 0, -30 * scale, 50 * scale);
    capeGradient.addColorStop(0, '#4a3020');
    capeGradient.addColorStop(0.3, '#3a2515');
    capeGradient.addColorStop(0.7, '#2a1a0a');
    capeGradient.addColorStop(1, '#1a1005');
    
    ctx.fillStyle = capeGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8 * scale, 5 * scale);
    ctx.quadraticCurveTo(-25 * scale, 15 * scale + (isMoving ? Math.sin(walkCycle) * 10 * scale : 0), 
      -28 * scale, 35 * scale + (isMoving ? Math.cos(walkCycle) * 8 * scale : 0));
    ctx.quadraticCurveTo(-30 * scale, 50 * scale, -25 * scale, 60 * scale + (isMoving ? Math.sin(walkCycle + 1) * 5 * scale : 0));
    ctx.lineTo(-20 * scale, 55 * scale);
    ctx.quadraticCurveTo(-15 * scale, 45 * scale, -12 * scale, 35 * scale);
    ctx.lineTo(-8 * scale, 20 * scale);
    ctx.lineTo(0, 8 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 披风边缘装饰 - 皮革边缘
    ctx.strokeStyle = '#5a4030';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    // 披风纹理 - 褶皱纹理
    ctx.strokeStyle = '#3a2515';
    ctx.lineWidth = 1 * scale;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = 10 * scale + i * 10 * scale;
      ctx.beginPath();
      ctx.moveTo(-5 * scale, y);
      ctx.quadraticCurveTo(-15 * scale, y + 5 * scale, -20 * scale, y + 8 * scale);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // 披风扣子 - 连接肩膀的扣子
    ctx.fillStyle = '#8a7a60';
    ctx.beginPath();
    ctx.arc(0, 2 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.arc(-0.5 * scale, 1.5 * scale, 0.8 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // 后手（左手）持枪 - 左轮手枪
    ctx.save();
    ctx.translate(cx - 16 * scale, cy + 2 * scale);

    // 手臂走路摆动角度
    const leftArmAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.15 : 0;

    // 手臂旋转 = 走路摆动 + 基础举枪角度(90度,枪水平)
    ctx.rotate(leftArmAngle + Math.PI / 2);

    // 左臂 - 牛仔衬衫袖子
    const armGradient = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
    armGradient.addColorStop(0, '#3a3530');
    armGradient.addColorStop(0.5, '#4a4540');
    armGradient.addColorStop(1, '#3a3530');
    ctx.fillStyle = armGradient;
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 5 * scale, 11 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // 手（简化手掌）
    ctx.save();
    ctx.translate(0, 8 * scale);
    ctx.fillStyle = '#ddaa88';
    // 手掌
    ctx.beginPath();
    ctx.ellipse(0, 0, 4 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 手指（简化）
    ctx.fillRect(-1 * scale, -4 * scale, 1 * scale, 3 * scale);  // 拇指
    ctx.fillRect(0 * scale, -5 * scale, 1 * scale, 4 * scale);   // 食指
    ctx.fillRect(1 * scale, -5 * scale, 1 * scale, 4 * scale);   // 中指
    ctx.restore();

    // 枪（始终完整绘制）
    ctx.save();
    ctx.translate(0, 15 * scale);
    // 枪的枪口向上(y=-20),朝左时直接绘制(枪口向左)
    this.drawRevolver(ctx, 0, 0, scale, 0);
    ctx.restore();

    ctx.restore();

    // 身体 - 侧身视图
    const bodyGradient = ctx.createRadialGradient(cx - 3 * scale, cy - 5 * scale, 0, cx, cy, 22 * scale);
    bodyGradient.addColorStop(0, '#4a4540');
    bodyGradient.addColorStop(0.5, config.color);
    bodyGradient.addColorStop(1, '#2a2520');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 16 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 牛仔马甲
    ctx.fillStyle = '#3a2520';
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, cy - 20 * scale);
    ctx.lineTo(cx + 10 * scale, cy - 20 * scale);
    ctx.lineTo(cx + 8 * scale, cy + 20 * scale);
    ctx.lineTo(cx, cy + 22 * scale);
    ctx.lineTo(cx - 10 * scale, cy + 18 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 马甲装饰 - 银色扣子
    ctx.fillStyle = '#8a8a8a';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy - 12 * scale + i * 10 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 马甲边缘装饰
    ctx.strokeStyle = '#5a4a40';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx - 8 * scale, cy - 18 * scale);
    ctx.lineTo(cx - 6 * scale, cy + 16 * scale);
    ctx.stroke();

    // 披风 - 牛仔围巾（系在脖子上）
    ctx.fillStyle = '#5a2a20';
    ctx.beginPath();
    ctx.moveTo(cx - 8 * scale, cy - 22 * scale);
    ctx.quadraticCurveTo(cx + 5 * scale, cy - 20 * scale, cx + 8 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 5 * scale, cy - 15 * scale);
    ctx.lineTo(cx - 5 * scale, cy - 15 * scale);
    ctx.closePath();
    ctx.fill();

    // 前手（右手）持枪 - 左轮手枪
    ctx.save();
    ctx.translate(cx + 22 * scale, cy + 2 * scale);

    // 手臂走路摆动角度
    const rightArmAngle = isMoving ? Math.sin(walkCycle) * 0.15 : 0;

    // 手臂旋转 = 走路摆动 + 基础举枪角度(-90度,枪水平)
    ctx.rotate(rightArmAngle - Math.PI / 2);

    // 右臂
    ctx.fillStyle = armGradient;
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 5 * scale, 11 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 手（简化手掌）
    ctx.save();
    ctx.translate(0, 8 * scale);
    ctx.fillStyle = '#ddaa88';
    // 手掌
    ctx.beginPath();
    ctx.ellipse(0, 0, 4 * scale, 4 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    // 手指（简化）
    ctx.fillRect(-1 * scale, -4 * scale, 1 * scale, 3 * scale);  // 拇指
    ctx.fillRect(0 * scale, -5 * scale, 1 * scale, 4 * scale);   // 食指
    ctx.fillRect(1 * scale, -5 * scale, 1 * scale, 4 * scale);   // 中指
    ctx.restore();

    // 枪（始终完整绘制）
    ctx.save();
    ctx.translate(0, 15 * scale);
    // 枪的枪口向上(y=-20),朝右时旋转180度(枪口向右)
    const gunRotation = direction === 'right' ? Math.PI : 0;
    this.drawRevolver(ctx, 0, 0, scale, gunRotation);
    ctx.restore();

    ctx.restore();

    // 头部 - 侧脸效果
    const headGradient = ctx.createRadialGradient(cx + 3 * scale, cy - 38 * scale, 0, cx, cy - 35 * scale, 11 * scale);
    headGradient.addColorStop(0, '#eec090');
    headGradient.addColorStop(1, '#cc8866');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 35 * scale, 10 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 牛仔帽 - 经典宽边帽
    ctx.save();
    ctx.translate(cx, cy - 48 * scale);
    
    // 帽顶
    const hatGradient = ctx.createLinearGradient(-8 * scale, -10 * scale, 8 * scale, 0);
    hatGradient.addColorStop(0, '#3a2a20');
    hatGradient.addColorStop(0.5, '#4a3a30');
    hatGradient.addColorStop(1, '#2a1a10');
    ctx.fillStyle = hatGradient;
    
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 帽檐 - 宽边
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 帽带装饰
    ctx.strokeStyle = '#5a4a40';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 8 * scale, 10 * scale, 0, Math.PI * 0.8, Math.PI * 1.2);
    ctx.stroke();
    
    // 帽子金属装饰
    ctx.fillStyle = '#8a7a60';
    ctx.beginPath();
    ctx.arc(0, -12 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 眼睛 - 侧脸只显示右眼
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.ellipse(cx + 4 * scale, cy - 36 * scale, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 眼白
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx + 4 * scale, cy - 36 * scale, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 瞳孔
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(cx + 4.5 * scale, cy - 36 * scale, 0.8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 眉毛 - 粗犷风格
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(cx + 2 * scale, cy - 40 * scale);
    ctx.lineTo(cx + 6 * scale, cy - 38 * scale);
    ctx.stroke();

    // 下巴胡茬
    ctx.fillStyle = '#5a4a3a';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(cx + 5 * scale, cy - 24 * scale, 4 * scale, 3 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * 绘制左轮手枪
   */
  private drawRevolver(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, angle: number): void {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // 枪管（长枪管）
    const barrelGradient = ctx.createLinearGradient(-2 * scale, -20 * scale, 2 * scale, 5 * scale);
    barrelGradient.addColorStop(0, '#7a7a7a');
    barrelGradient.addColorStop(0.5, '#9a9a9a');
    barrelGradient.addColorStop(1, '#5a5a5a');
    ctx.fillStyle = barrelGradient;
    ctx.fillRect(-2 * scale, -20 * scale, 4 * scale, 22 * scale);

    // 枪身主体
    const bodyGradient = ctx.createLinearGradient(-5 * scale, 0, 5 * scale, 0);
    bodyGradient.addColorStop(0, '#6a6a6a');
    bodyGradient.addColorStop(0.5, '#8a8a8a');
    bodyGradient.addColorStop(1, '#5a5a5a');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.moveTo(-5 * scale, 2 * scale);
    ctx.lineTo(5 * scale, 2 * scale);
    ctx.lineTo(5 * scale, 8 * scale);
    ctx.lineTo(-5 * scale, 8 * scale);
    ctx.closePath();
    ctx.fill();

    // 握把（木质）
    const gripGradient = ctx.createLinearGradient(-4 * scale, 0, 4 * scale, 0);
    gripGradient.addColorStop(0, '#5a3a20');
    gripGradient.addColorStop(0.5, '#7a5a40');
    gripGradient.addColorStop(1, '#5a3a20');
    ctx.fillStyle = gripGradient;
    ctx.beginPath();
    ctx.moveTo(-4 * scale, 8 * scale);
    ctx.lineTo(4 * scale, 8 * scale);
    ctx.lineTo(3 * scale, 18 * scale);
    ctx.lineTo(-3 * scale, 18 * scale);
    ctx.closePath();
    ctx.fill();

    // 转轮（左侧圆柱形）
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.ellipse(-6 * scale, 5 * scale, 3 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 转轮弹孔（6个）
    ctx.fillStyle = '#2a2a2a';
    for (let i = 0; i < 6; i++) {
      const holeAngle = (i / 6) * Math.PI * 2;
      const holeX = -6 * scale + Math.cos(holeAngle) * 2 * scale;
      const holeY = 5 * scale + Math.sin(holeAngle) * 3.5 * scale;
      ctx.beginPath();
      ctx.arc(holeX, holeY, 0.8 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // 扳机
    ctx.strokeStyle = '#5a5a5a';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(0, 9 * scale);
    ctx.quadraticCurveTo(2 * scale, 10 * scale, 1 * scale, 12 * scale);
    ctx.stroke();

    // 枪口火焰 - 不绘制动画

    ctx.restore();
  }

  /**
   * 渲染神枪手预览（用于选角色界面）- 侧身西部牛仔风格
   */
  renderPreview(ctx: CanvasRenderingContext2D, config: CharacterConfig, params: PreviewRenderParams): void {
    const { x, y, scale } = params;

    // 腿部 - 侧身视图
    // 后腿
    ctx.fillStyle = '#1a1510';
    ctx.beginPath();
    ctx.ellipse(x - 5 * scale, y + 23 * scale, 5 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 9 * scale, y + 34 * scale, 8 * scale, 15 * scale);
    
    // 牛仔靴
    ctx.fillStyle = '#5a3a20';
    ctx.beginPath();
    ctx.moveTo(x - 9 * scale, y + 49 * scale);
    ctx.lineTo(x, y + 49 * scale);
    ctx.lineTo(x + 2 * scale, y + 56 * scale);
    ctx.lineTo(x - 7 * scale, y + 56 * scale);
    ctx.closePath();
    ctx.fill();

    // 前腿
    ctx.fillStyle = '#2a2520';
    ctx.beginPath();
    ctx.ellipse(x + 5 * scale, y + 23 * scale, 5 * scale, 12 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 1 * scale, y + 34 * scale, 8 * scale, 15 * scale);
    
    // 牛仔靴
    ctx.fillStyle = '#6a4a30';
    ctx.beginPath();
    ctx.moveTo(x + 1 * scale, y + 49 * scale);
    ctx.lineTo(x + 10 * scale, y + 49 * scale);
    ctx.lineTo(x + 12 * scale, y + 56 * scale);
    ctx.lineTo(x + 3 * scale, y + 56 * scale);
    ctx.closePath();
    ctx.fill();

    // 披风 - 西部牛仔风格
    ctx.save();
    ctx.translate(x - 8 * scale, y - 18 * scale);
    ctx.rotate(-0.15);
    
    const capeGradient = ctx.createLinearGradient(0, 0, -30 * scale, 50 * scale);
    capeGradient.addColorStop(0, '#4a3020');
    capeGradient.addColorStop(0.3, '#3a2515');
    capeGradient.addColorStop(0.7, '#2a1a0a');
    capeGradient.addColorStop(1, '#1a1005');
    
    ctx.fillStyle = capeGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8 * scale, 5 * scale);
    ctx.quadraticCurveTo(-25 * scale, 15 * scale, -28 * scale, 35 * scale);
    ctx.quadraticCurveTo(-30 * scale, 50 * scale, -25 * scale, 60 * scale);
    ctx.lineTo(-20 * scale, 55 * scale);
    ctx.quadraticCurveTo(-15 * scale, 45 * scale, -12 * scale, 35 * scale);
    ctx.lineTo(-8 * scale, 20 * scale);
    ctx.lineTo(0, 8 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 披风边缘装饰
    ctx.strokeStyle = '#5a4030';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
    
    // 披风纹理
    ctx.strokeStyle = '#3a2515';
    ctx.lineWidth = 1 * scale;
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 4; i++) {
      const y = 10 * scale + i * 10 * scale;
      ctx.beginPath();
      ctx.moveTo(-5 * scale, y);
      ctx.quadraticCurveTo(-15 * scale, y + 5 * scale, -20 * scale, y + 8 * scale);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    
    // 披风扣子
    ctx.fillStyle = '#8a7a60';
    ctx.beginPath();
    ctx.arc(0, 2 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#aaa';
    ctx.beginPath();
    ctx.arc(-0.5 * scale, 1.5 * scale, 0.8 * scale, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();

    // 后手（左手）持枪
    ctx.save();
    ctx.translate(x - 22 * scale, y + 2 * scale);
    ctx.rotate(-0.3);
    
    // 左臂
    ctx.fillStyle = '#3a3530';
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 5 * scale, 11 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 手
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 7 * scale, 4 * scale, 5 * scale, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 左轮手枪
    this.drawRevolver(ctx, 0, 12 * scale, scale, 0.1);
    ctx.restore();

    // 身体
    const bodyGradient = ctx.createRadialGradient(x - 3 * scale, y - 5 * scale, 0, x, y, 22 * scale);
    bodyGradient.addColorStop(0, '#4a4540');
    bodyGradient.addColorStop(0.5, config.color);
    bodyGradient.addColorStop(1, '#2a2520');
    ctx.fillStyle = bodyGradient;
    ctx.beginPath();
    ctx.ellipse(x, y, 16 * scale, 26 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 牛仔马甲
    ctx.fillStyle = '#3a2520';
    ctx.beginPath();
    ctx.moveTo(x - 12 * scale, y - 20 * scale);
    ctx.lineTo(x + 10 * scale, y - 20 * scale);
    ctx.lineTo(x + 8 * scale, y + 20 * scale);
    ctx.lineTo(x, y + 22 * scale);
    ctx.lineTo(x - 10 * scale, y + 18 * scale);
    ctx.closePath();
    ctx.fill();
    
    // 马甲扣子
    ctx.fillStyle = '#8a8a8a';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(x, y - 12 * scale + i * 10 * scale, 1.5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 披风围巾
    ctx.fillStyle = '#5a2a20';
    ctx.beginPath();
    ctx.moveTo(x - 8 * scale, y - 22 * scale);
    ctx.quadraticCurveTo(x + 5 * scale, y - 20 * scale, x + 8 * scale, y - 22 * scale);
    ctx.lineTo(x + 5 * scale, y - 15 * scale);
    ctx.lineTo(x - 5 * scale, y - 15 * scale);
    ctx.closePath();
    ctx.fill();

    // 前手（右手）持枪
    ctx.save();
    ctx.translate(x + 22 * scale, y + 2 * scale);
    ctx.rotate(0.3);
    
    // 右臂
    ctx.fillStyle = '#3a3530';
    ctx.beginPath();
    ctx.ellipse(0, -3 * scale, 5 * scale, 11 * scale, -0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 手
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 7 * scale, 4 * scale, 5 * scale, -0.1, 0, Math.PI * 2);
    ctx.fill();
    
    // 左轮手枪
    this.drawRevolver(ctx, 0, 12 * scale, scale, -0.1);
    ctx.restore();

    // 头部
    const headGradient = ctx.createRadialGradient(x + 3 * scale, y - 38 * scale, 0, x, y - 35 * scale, 11 * scale);
    headGradient.addColorStop(0, '#eec090');
    headGradient.addColorStop(1, '#cc8866');
    ctx.fillStyle = headGradient;
    ctx.beginPath();
    ctx.ellipse(x, y - 35 * scale, 10 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 牛仔帽
    ctx.save();
    ctx.translate(x, y - 48 * scale);
    
    const hatGradient = ctx.createLinearGradient(-8 * scale, -10 * scale, 8 * scale, 0);
    hatGradient.addColorStop(0, '#3a2a20');
    hatGradient.addColorStop(0.5, '#4a3a30');
    hatGradient.addColorStop(1, '#2a1a10');
    ctx.fillStyle = hatGradient;
    
    // 帽顶
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 帽檐
    ctx.beginPath();
    ctx.ellipse(0, 0, 18 * scale, 5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 帽带
    ctx.strokeStyle = '#5a4a40';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.ellipse(0, -5 * scale, 8 * scale, 10 * scale, 0, Math.PI * 0.8, Math.PI * 1.2);
    ctx.stroke();
    
    // 帽子装饰
    ctx.fillStyle = '#8a7a60';
    ctx.beginPath();
    ctx.arc(0, -12 * scale, 2 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 眼睛 - 侧脸
    ctx.fillStyle = '#5a4a3a';
    ctx.beginPath();
    ctx.ellipse(x + 4 * scale, y - 36 * scale, 2 * scale, 2.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + 4 * scale, y - 36 * scale, 1.2 * scale, 1.5 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(x + 4.5 * scale, y - 36 * scale, 0.8 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 眉毛
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(x + 2 * scale, y - 40 * scale);
    ctx.lineTo(x + 6 * scale, y - 38 * scale);
    ctx.stroke();

    // 胡茬
    ctx.fillStyle = '#5a4a3a';
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.ellipse(x + 5 * scale, y - 24 * scale, 4 * scale, 3 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
