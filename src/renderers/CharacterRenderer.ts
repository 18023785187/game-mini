/**
 * 角色渲染器
 * 负责绘制角色形象，支持待机和移动状态的动画效果
 */

import { CharacterConfig } from '../types/Character';

/**
 * 角色渲染器
 */
export class CharacterRenderer {
  private ctx: CanvasRenderingContext2D;
  private animationTime: number = 0;

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
   * 战斗场景：绘制角色基础形象
   */
  private drawBattleCharacterBase(config: CharacterConfig, size: number, offset: number, isMoving: boolean): void {
    const cx = size * 0.5;
    const cy = size * 0.5 + offset;
    const walkCycle = isMoving ? this.animationTime * 0.01 : 0;

    if (config.id === 'berserker') {
      this.drawBattleBerserker(config, cx, cy, size, walkCycle, isMoving);
    } else if (config.id === 'gunner') {
      this.drawBattleGunner(config, cx, cy, size, walkCycle, isMoving);
    } else if (config.id === 'tank') {
      this.drawBattleTank(config, cx, cy, size, walkCycle, isMoving);
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
    isMoving: boolean
  ): void {
    const ctx = this.ctx;
    const scale = size / 100;

    // 腿部动画：走路时腿部摆动
    const leftLegAngle = isMoving ? Math.sin(walkCycle) * 0.3 : 0;
    const rightLegAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.3 : 0;
    const leftLegOffset = isMoving ? Math.sin(walkCycle) * 5 : 0;
    const rightLegOffset = isMoving ? Math.sin(walkCycle + Math.PI) * 5 : 0;

    ctx.save();
    ctx.translate(cx - 8 * scale, cy + 30 * scale);
    ctx.rotate(leftLegAngle);
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(-4 * scale, leftLegOffset, 8 * scale, 25 * scale);
    ctx.restore();

    ctx.save();
    ctx.translate(cx + 8 * scale, cy + 30 * scale);
    ctx.rotate(rightLegAngle);
    ctx.fillStyle = '#2a1a1a';
    ctx.fillRect(-4 * scale, rightLegOffset, 8 * scale, 25 * scale);
    ctx.restore();

    // 身体
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 20 * scale, 28 * scale, 0, 0, Math.PI * 2);
    ctx.fill();

    // 护肩
    ctx.fillStyle = '#888899';
    ctx.beginPath();
    ctx.ellipse(cx - 20 * scale, cy - 10 * scale, 8 * scale, 12 * scale, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 20 * scale, cy - 8 * scale, 8 * scale, 12 * scale, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 胸甲 - 更精美的设计
    ctx.fillStyle = '#8B0000';
    ctx.beginPath();
    ctx.moveTo(cx - 12 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 12 * scale, cy - 22 * scale);
    ctx.lineTo(cx + 10 * scale, cy + 18 * scale);
    ctx.lineTo(cx, cy + 22 * scale);
    ctx.lineTo(cx - 10 * scale, cy + 18 * scale);
    ctx.closePath();
    ctx.fill();

    // 胸甲装饰 - 银色纹路
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 22 * scale);
    ctx.lineTo(cx, cy + 22 * scale);
    ctx.moveTo(cx - 8 * scale, cy - 15 * scale);
    ctx.lineTo(cx - 5 * scale, cy + 10 * scale);
    ctx.moveTo(cx + 8 * scale, cy - 15 * scale);
    ctx.lineTo(cx + 5 * scale, cy + 10 * scale);
    ctx.stroke();

    // 手臂动画：走路时手臂摆动
    const leftArmAngle = isMoving ? Math.sin(walkCycle + Math.PI) * 0.2 : 0;
    const rightArmAngle = isMoving ? Math.sin(walkCycle) * 0.2 : 0;

    // 左臂 - 持剑
    ctx.save();
    ctx.translate(cx - 24 * scale, cy - 8 * scale);
    ctx.rotate(leftArmAngle - 0.3);
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * scale, 14 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 剑鞘
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(-3 * scale, -35 * scale, 6 * scale, 25 * scale);
    ctx.restore();

    // 右臂
    ctx.save();
    ctx.translate(cx + 22 * scale, cy - 2 * scale);
    ctx.rotate(rightArmAngle);
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.ellipse(0, 0, 7 * scale, 14 * scale, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 巨剑 - 90单位长度，华丽设计
    const swordAngle = isMoving ? Math.sin(walkCycle) * 0.1 : 0;
    ctx.save();
    ctx.translate(cx - 35 * scale, cy - 45 * scale);
    ctx.rotate(-0.2 + swordAngle);

    // 剑柄
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(-3 * scale, 15 * scale, 6 * scale, 12 * scale);

    // 护手
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(-12 * scale, 10 * scale, 24 * scale, 6 * scale);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(-12 * scale, 10 * scale, 24 * scale, 6 * scale);

    // 剑刃主体
    const bladeGradient = ctx.createLinearGradient(-4 * scale, -90 * scale, 4 * scale, 10 * scale);
    bladeGradient.addColorStop(0, '#E8E8E8');
    bladeGradient.addColorStop(0.3, '#FFFFFF');
    bladeGradient.addColorStop(0.7, '#D0D0D0');
    bladeGradient.addColorStop(1, '#A0A0A0');
    ctx.fillStyle = bladeGradient;
    ctx.beginPath();
    ctx.moveTo(-4 * scale, 10 * scale);
    ctx.lineTo(0, -90 * scale);
    ctx.lineTo(4 * scale, 10 * scale);
    ctx.closePath();
    ctx.fill();

    // 剑刃锋芒
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(0, 10 * scale);
    ctx.lineTo(0, -90 * scale);
    ctx.stroke();

    // 剑刃血槽
    ctx.strokeStyle = '#B8B8B8';
    ctx.lineWidth = 1.5 * scale;
    ctx.beginPath();
    ctx.moveTo(-1.5 * scale, 5 * scale);
    ctx.lineTo(0, -85 * scale);
    ctx.lineTo(1.5 * scale, 5 * scale);
    ctx.stroke();

    // 剑刃发光效果
    ctx.shadowColor = '#C0C0FF';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(200, 200, 255, 0.5)';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.moveTo(-4 * scale, 10 * scale);
    ctx.lineTo(0, -90 * scale);
    ctx.lineTo(4 * scale, 10 * scale);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.restore();

    // 头部
    ctx.fillStyle = '#ddaa88';
    ctx.beginPath();
    ctx.arc(cx, cy - 35 * scale, 14 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 头盔 - 更华丽的设计
    ctx.fillStyle = config.color;
    ctx.beginPath();
    ctx.arc(cx, cy - 38 * scale, 16 * scale, Math.PI, 0);
    ctx.fill();

    // 头盔侧翼
    ctx.beginPath();
    ctx.moveTo(cx - 16 * scale, cy - 38 * scale);
    ctx.lineTo(cx - 20 * scale, cy - 45 * scale);
    ctx.lineTo(cx - 18 * scale, cy - 32 * scale);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 16 * scale, cy - 38 * scale);
    ctx.lineTo(cx + 20 * scale, cy - 45 * scale);
    ctx.lineTo(cx + 18 * scale, cy - 32 * scale);
    ctx.fill();

    // 头盔顶冠
    ctx.beginPath();
    ctx.moveTo(cx, cy - 54 * scale);
    ctx.lineTo(cx - 4 * scale, cy - 44 * scale);
    ctx.lineTo(cx + 4 * scale, cy - 44 * scale);
    ctx.closePath();
    ctx.fill();

    // 护面甲
    ctx.fillStyle = '#666666';
    ctx.fillRect(cx - 8 * scale, cy - 42 * scale, 16 * scale, 8 * scale);
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1 * scale;
    ctx.strokeRect(cx - 8 * scale, cy - 42 * scale, 16 * scale, 8 * scale);

    // 眼睛
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(cx - 5 * scale, cy - 35 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 5 * scale, cy - 35 * scale, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛发光效果
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - 5 * scale, cy - 35 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.arc(cx + 5 * scale, cy - 35 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
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
    isMoving: boolean
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
    isMoving: boolean
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
