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
    case ProjectileType.BOMB:
      this.renderBomb(ctx, projectile);
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

  /**
   * 渲染炸弹（神枪手技能1）
   */
  private renderBomb(ctx: CanvasRenderingContext2D, projectile: Projectile): void {
    const config = projectile.config;
    const scale = config.size / 10;

    // 如果正在爆炸，渲染爆炸效果
    if (projectile.isExploding) {
      this.renderExplosion(ctx, projectile, scale);
      return;
    }

    // 绘制轨迹
    this.renderBulletTrail(ctx, projectile);

    // 炸弹主体 - 圆形炸弹
    const bombRadius = 8 * scale;

    // 外层阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // 炸弹外壳 - 深灰色金属质感
    const bombGradient = ctx.createRadialGradient(
      -bombRadius * 0.3, -bombRadius * 0.3, 0,
      0, 0, bombRadius
    );
    bombGradient.addColorStop(0, '#5a5a5a');
    bombGradient.addColorStop(0.5, '#3a3a3a');
    bombGradient.addColorStop(1, '#2a2a2a');

    ctx.fillStyle = bombGradient;
    ctx.beginPath();
    ctx.arc(0, 0, bombRadius, 0, Math.PI * 2);
    ctx.fill();

    // 清除阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 炸弹高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-2 * scale, -3 * scale, 3 * scale, 2 * scale, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // 引线
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2 * scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, -bombRadius);
    ctx.quadraticCurveTo(3 * scale, -bombRadius - 5 * scale, 0, -bombRadius - 8 * scale);
    ctx.stroke();

    // 引线火花（闪烁效果）
    const sparkTime = Date.now() / 100;
    const sparkIntensity = Math.sin(sparkTime * 3) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 150, 50, ${sparkIntensity})`;
    ctx.beginPath();
    ctx.arc(0, -bombRadius - 8 * scale, 3 * scale * sparkIntensity, 0, Math.PI * 2);
    ctx.fill();

    // 火花光芒
    ctx.strokeStyle = `rgba(255, 200, 100, ${sparkIntensity * 0.8})`;
    ctx.lineWidth = 1 * scale;
    for (let i = 0; i < 4; i++) {
      const angle = (sparkTime + i * Math.PI / 2) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(0, -bombRadius - 8 * scale);
      ctx.lineTo(
        Math.cos(angle) * 5 * scale,
        -bombRadius - 8 * scale + Math.sin(angle) * 5 * scale
      );
      ctx.stroke();
    }
  }

  /**
   * 渲染爆炸效果
   */
  private renderExplosion(ctx: CanvasRenderingContext2D, projectile: Projectile, scale: number): void {
    const progress = projectile.explosionProgress;
    const explosionRadius = projectile.explosionRadius;

    // 爆炸扩展效果
    const currentRadius = explosionRadius * progress;

    // 外层爆炸光环
    const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
    const alpha = 1 - progress;
    outerGlow.addColorStop(0, `rgba(255, 200, 50, ${alpha * 0.8})`);
    outerGlow.addColorStop(0.3, `rgba(255, 150, 0, ${alpha * 0.6})`);
    outerGlow.addColorStop(0.6, `rgba(255, 100, 0, ${alpha * 0.3})`);
    outerGlow.addColorStop(1, 'rgba(255, 50, 0, 0)');

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // 爆炸核心
    const coreRadius = currentRadius * 0.4;
    const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
    coreGlow.addColorStop(0, `rgba(255, 255, 200, ${alpha})`);
    coreGlow.addColorStop(0.5, `rgba(255, 200, 100, ${alpha * 0.8})`);
    coreGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');

    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // 爆炸粒子
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = currentRadius * 0.8;
      const particleX = Math.cos(angle) * distance;
      const particleY = Math.sin(angle) * distance;
      const particleSize = (1 - progress) * 8 * scale;

      ctx.fillStyle = `rgba(255, ${150 + Math.random() * 50}, 50, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // 爆炸烟雾
    const smokeAlpha = alpha * 0.3;
    ctx.fillStyle = `rgba(100, 100, 100, ${smokeAlpha})`;
    for (let i = 0; i < 5; i++) {
      const smokeAngle = (i / 5) * Math.PI * 2 + progress * 2;
      const smokeDistance = currentRadius * 0.6;
      const smokeX = Math.cos(smokeAngle) * smokeDistance;
      const smokeY = Math.sin(smokeAngle) * smokeDistance;
      const smokeRadius = (1 - progress) * 15 * scale;

      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
