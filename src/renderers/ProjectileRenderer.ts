/**
 * 投射物渲染器
 * 负责绘制各种投射物（子弹、箭矢、魔法球等）
 */

import { Projectile, ProjectileType } from '../entities/Projectile';

/**
 * 投射物渲染器
 */
export class ProjectileRenderer {
  /**
   * 渲染投射物
   */
  render(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
    switch (projectile.config.type) {
    case ProjectileType.BULLET:
      this.renderBullet(ctx, projectile);
      break;
    case ProjectileType.ARROW:
      this.renderArrow(ctx, projectile);
      break;
    case ProjectileType.MAGIC_ORB:
      this.renderMagicOrb(ctx, projectile);
      break;
    }
  }

  /**
   * 渲染子弹（神枪手）
   */
  private renderBullet(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
    const config = projectile.config;
    const scale = config.size / 10;

    // 先绘制轨迹（拖尾效果）
    this.renderBulletTrail(ctx, projectile);

    // 注意：不需要再次translate，因为在renderProjectiles中已经translate到了投射物位置
    // 直接从原点(0,0)绘制子弹

    // 外层发光效果（增强可见度）
    const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 15 * scale);
    outerGlow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
    outerGlow.addColorStop(0.3, 'rgba(255, 180, 0, 0.5)');
    outerGlow.addColorStop(0.6, 'rgba(255, 150, 0, 0.2)');
    outerGlow.addColorStop(1, 'rgba(255, 100, 0, 0)');
    
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 15 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 子弹主体 - 金属质感（更大更明显）
    const bulletGradient = ctx.createRadialGradient(
      -2 * scale, -1 * scale, 0,
      0, 0, 8 * scale
    );
    bulletGradient.addColorStop(0, '#ffd700'); // 金色高光
    bulletGradient.addColorStop(0.2, '#ffed4a'); // 亮金色
    bulletGradient.addColorStop(0.5, '#c9a227'); // 金色
    bulletGradient.addColorStop(0.8, '#8b7355'); // 铜色
    bulletGradient.addColorStop(1, '#4a3728'); // 深棕色

    ctx.fillStyle = bulletGradient;
    
    // 子弹形状 - 流线型（加大尺寸）
    ctx.beginPath();
    ctx.moveTo(10 * scale, 0); // 弹头（加大）
    ctx.quadraticCurveTo(8 * scale, -3 * scale, -5 * scale, -3 * scale); // 上边缘
    ctx.lineTo(-8 * scale, -2 * scale); // 尾部上
    ctx.lineTo(-8 * scale, 2 * scale); // 尾部下
    ctx.lineTo(-5 * scale, 3 * scale); // 尾部连接
    ctx.quadraticCurveTo(8 * scale, 3 * scale, 10 * scale, 0); // 下边缘
    ctx.closePath();
    ctx.fill();

    // 子弹高光（更明显）
    ctx.fillStyle = 'rgba(255, 255, 220, 0.8)';
    ctx.beginPath();
    ctx.ellipse(3 * scale, -1 * scale, 3 * scale, 1.2 * scale, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 子弹核心亮点
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4 * scale, -0.5 * scale, 1.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 发光描边（更强烈）
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = '#ffed4a';
    ctx.lineWidth = 2 * scale;
    ctx.stroke();
  }

  /**
   * 渲染子弹轨迹
   */
  private renderBulletTrail(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
    const trail = projectile.trail;
    if (trail.length < 2) return;

    const config = projectile.config;
    const scale = config.size / 10;
    const currentX = projectile.x;
    const currentY = projectile.y;

    // 绘制轨迹发光效果
    // 轨迹点是世界坐标，需要转换为相对于当前投射物位置的坐标
    for (let i = 1; i < trail.length; i++) {
      const pos = trail[i];
      const prevPos = trail[i - 1];
      
      // 计算相对坐标（相对于当前投射物位置）
      const relX = pos.x - currentX;
      const relY = pos.y - currentY;
      const prevRelX = prevPos.x - currentX;
      const prevRelY = prevPos.y - currentY;
      
      // 轨迹透明度渐变
      const alpha = pos.alpha * 0.6;
      
      // 外层发光轨迹
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = '#ffed4a';
      ctx.lineWidth = 6 * scale * pos.alpha;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(prevRelX, prevRelY);
      ctx.lineTo(relX, relY);
      ctx.stroke();
      
      // 核心轨迹
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3 * scale * pos.alpha;
      
      ctx.beginPath();
      ctx.moveTo(prevRelX, prevRelY);
      ctx.lineTo(relX, relY);
      ctx.stroke();
      
      // 内层高光轨迹
      ctx.globalAlpha = alpha * 0.8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5 * scale * pos.alpha;
      
      ctx.beginPath();
      ctx.moveTo(prevRelX, prevRelY);
      ctx.lineTo(relX, relY);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  /**
   * 渲染箭矢（预留）
   */
  private renderArrow(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
    const { x, y, config, direction } = projectile;
    const scale = config.size / 10;

    ctx.save();
    ctx.translate(x, y);

    // 箭身方向
    if (direction === 'left') {
      ctx.scale(-1, 1);
    }

    // 箭杆
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-12 * scale, -1 * scale, 20 * scale, 2 * scale);

    // 箭头
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(12 * scale, 0);
    ctx.lineTo(8 * scale, -3 * scale);
    ctx.lineTo(8 * scale, 3 * scale);
    ctx.closePath();
    ctx.fill();

    // 箭羽
    ctx.fillStyle = '#ff6347';
    ctx.beginPath();
    ctx.moveTo(-12 * scale, 0);
    ctx.lineTo(-10 * scale, -3 * scale);
    ctx.lineTo(-8 * scale, 0);
    ctx.lineTo(-10 * scale, 3 * scale);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * 渲染魔法球（预留）
   */
  private renderMagicOrb(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
    const { x, y, config } = projectile;
    const scale = config.size / 10;

    ctx.save();
    ctx.translate(x, y);

    // 外层光晕
    const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 12 * scale);
    outerGlow.addColorStop(0, config.color);
    outerGlow.addColorStop(0.5, `${config.color}88`);
    outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 12 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 核心
    const coreGradient = ctx.createRadialGradient(
      -2 * scale, -2 * scale, 0,
      0, 0, 5 * scale
    );
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.5, config.color);
    coreGradient.addColorStop(1, '#000000');

    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, 5 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 旋转效果
    const time = Date.now() / 200;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 3; i++) {
      const angle = time + (i * Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.arc(0, 0, 8 * scale, angle, angle + 0.5);
      ctx.stroke();
    }

    ctx.restore();
  }
}
