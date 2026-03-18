/**
 * 神枪手渲染器
 * 负责绘制神枪手角色形象
 */

import { CharacterConfig } from '../types/Character';
import { RenderParams, PreviewRenderParams, ICharacterRenderer } from './ICharacterRenderer';

/**
 * 神枪手渲染器
 */
export class GunnerRenderer implements ICharacterRenderer {
  /**
   * 渲染战斗场景中的神枪手
   */
  renderBattle(ctx: CanvasRenderingContext2D, _config: CharacterConfig, params: RenderParams): void {
    const { cx, cy, scale, walkCycle, isMoving } = params;

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
   * 渲染神枪手预览（用于选角色界面）
   */
  renderPreview(ctx: CanvasRenderingContext2D, _config: CharacterConfig, params: PreviewRenderParams): void {
    const { x, y, scale } = params;

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
}
