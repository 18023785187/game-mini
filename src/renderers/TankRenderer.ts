/**
 * 肉盾渲染器
 * 负责绘制肉盾角色形象
 */

import { CharacterConfig } from '../types/Character';
import { RenderParams, PreviewRenderParams, ICharacterRenderer } from './ICharacterRenderer';

/**
 * 肉盾渲染器
 */
export class TankRenderer implements ICharacterRenderer {
  /**
   * 渲染战斗场景中的肉盾
   */
  renderBattle(ctx: CanvasRenderingContext2D, _config: CharacterConfig, params: RenderParams): void {
    const { cx, cy, scale, walkCycle, isMoving } = params;

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
   * 渲染肉盾预览（用于选角色界面）
   */
  renderPreview(ctx: CanvasRenderingContext2D, _config: CharacterConfig, params: PreviewRenderParams): void {
    const { x, y, scale } = params;

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
