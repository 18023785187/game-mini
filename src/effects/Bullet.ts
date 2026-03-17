/**
 * 子弹系统
 * 处理远程攻击的子弹飞行和碰撞
 */

import { Character } from '../entities/Character';
import { CharacterId } from '../types/Character';

/**
 * 子弹类型
 */
export enum BulletType {
  NORMAL = 'normal',      // 普通子弹
  SPREAD = 'spread',      // 散弹
  HOMING = 'homing',      // 追踪弹
}

/**
 * 子弹配置
 */
export interface BulletConfig {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  range: number;
  type: BulletType;
  color: string;
  ownerId: CharacterId;
  ownerDirection: 'left' | 'right';
}

/**
 * 子弹实体
 */
export class Bullet {
  private x: number;
  private y: number;
  private startX: number;
  private startY: number;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private speed: number;
  private damage: number;
  private range: number;
  private type: BulletType;
  private color: string;
  private ownerId: CharacterId;
  private direction: 'left' | 'right';
  private isAlive: boolean = true;
  private trail: Array<{ x: number; y: number; alpha: number }> = [];
  private lifetime: number = 0;

  constructor(config: BulletConfig) {
    this.x = config.x;
    this.y = config.y;
    this.startX = config.x;
    this.startY = config.y;
    this.speed = config.speed;
    this.damage = config.damage;
    this.range = config.range;
    this.type = config.type;
    this.color = config.color;
    this.ownerId = config.ownerId;
    this.direction = config.ownerDirection;

    // 计算速度方向
    const dx = config.targetX - config.x;
    const dy = config.targetY - config.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      this.velocityX = (dx / dist) * this.speed;
      this.velocityY = (dy / dist) * this.speed;
    } else {
      // 默认朝角色朝向发射
      this.velocityX = this.direction === 'right' ? this.speed : -this.speed;
      this.velocityY = 0;
    }
  }

  /**
   * 更新子弹状态
   */
  update(deltaTime: number): void {
    if (!this.isAlive) return;

    // deltaTime 是毫秒，转换为秒
    const dt = deltaTime / 1000;

    // 保存轨迹
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > 10) {
      this.trail.shift();
    }

    // 更新轨迹透明度
    this.trail.forEach((point, index) => {
      point.alpha = (index + 1) / this.trail.length;
    });

    // 移动
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.lifetime += dt;

    // 检查是否超出范围
    const traveledDist = Math.sqrt(
      Math.pow(this.x - this.startX, 2) +
      Math.pow(this.y - this.startY, 2)
    );

    if (traveledDist > this.range) {
      this.isAlive = false;
    }

    // 超时销毁（5秒）
    if (this.lifetime > 5) {
      this.isAlive = false;
    }
  }

  /**
   * 检查是否命中目标
   */
  checkHit(target: Character): boolean {
    if (!this.isAlive || target.id === this.ownerId) return false;

    const hitRadius = 40; // 命中判定半径
    // 目标的Y坐标是脚底，子弹Y坐标是身体中间
    // 需要将目标的Y坐标调整到身体中心位置进行比较
    const targetCenterY = target.y + 25;
    const dx = this.x - target.x;
    const dy = this.y - targetCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < hitRadius) {
      this.isAlive = false;
      console.log(`子弹命中! 距离=${dist}`);
      return true;
    }

    return false;
  }

  /**
   * 获取伤害值
   */
  getDamage(): number {
    return this.damage;
  }

  /**
   * 是否存活
   */
  getIsAlive(): boolean {
    return this.isAlive;
  }

  /**
   * 销毁子弹
   */
  destroy(): void {
    this.isAlive = false;
  }

  /**
   * 将十六进制颜色转换为rgba格式
   */
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  /**
   * 绘制子弹
   */
  draw(ctx: CanvasRenderingContext2D, cameraX: number = 0, screenHeight: number = 0): void {
    if (!this.isAlive) return;

    const screenX = this.x - cameraX;
    // 世界坐标Y是从下往上，屏幕坐标Y是从上往下，需要转换
    const screenY = screenHeight > 0 ? screenHeight - this.y : this.y;

    // 绘制轨迹
    this.trail.forEach((point, index) => {
      const trailX = point.x - cameraX;
      const trailY = screenHeight > 0 ? screenHeight - point.y : point.y;
      const size = 3 + index * 0.5;

      ctx.beginPath();
      ctx.arc(trailX, trailY, size, 0, Math.PI * 2);
      ctx.fillStyle = this.hexToRgba(this.color, point.alpha * 0.5);
      ctx.fill();
    });

    // 绘制子弹主体
    ctx.save();

    // 发光效果
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    // 子弹核心
    const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, 12);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, this.hexToRgba(this.color, 0));

    ctx.beginPath();
    ctx.arc(screenX, screenY, 8, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // 子弹尾巴（运动模糊效果）
    const tailLength = this.speed * 0.02;
    const angle = Math.atan2(this.velocityY, this.velocityX);

    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(
      screenX - Math.cos(angle) * tailLength,
      screenY - Math.sin(angle) * tailLength
    );
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }
}

/**
 * 子弹管理器
 */
export class BulletManager {
  private bullets: Bullet[] = [];
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * 创建子弹
   */
  createBullet(config: BulletConfig): void {
    console.log(`BulletManager.createBullet: x=${config.x}, y=${config.y}, damage=${config.damage}`);
    this.bullets.push(new Bullet(config));
    console.log(`子弹已添加，当前子弹数: ${this.bullets.length}`);
  }

  /**
   * 创建散射子弹
   */
  createSpreadBullets(
    x: number,
    y: number,
    direction: 'left' | 'right',
    count: number,
    spreadAngle: number,
    config: Omit<BulletConfig, 'x' | 'y' | 'targetX' | 'targetY' | 'ownerDirection'>
  ): void {
    const baseAngle = direction === 'right' ? 0 : Math.PI;
    const startAngle = baseAngle - spreadAngle / 2;
    const angleStep = spreadAngle / (count - 1);

    for (let i = 0; i < count; i++) {
      const angle = startAngle + angleStep * i;
      const targetX = x + Math.cos(angle) * config.range;
      const targetY = y + Math.sin(angle) * config.range;

      this.createBullet({
        ...config,
        x,
        y,
        targetX,
        targetY,
        ownerDirection: direction,
      });
    }
  }

  /**
   * 更新所有子弹
   */
  update(deltaTime: number): void {
    this.bullets.forEach(bullet => bullet.update(deltaTime));
    this.bullets = this.bullets.filter(bullet => bullet.getIsAlive());
  }

  /**
   * 检查所有子弹的命中
   */
  checkHits(target: Character): { hit: boolean; damage: number } {
    let totalDamage = 0;
    let hit = false;

    this.bullets.forEach(bullet => {
      if (bullet.checkHit(target)) {
        totalDamage += bullet.getDamage();
        hit = true;
      }
    });

    return { hit, damage: totalDamage };
  }

  /**
   * 绘制所有子弹
   */
  draw(cameraX: number = 0, screenHeight: number = 0): void {
    this.bullets.forEach(bullet => bullet.draw(this.ctx, cameraX, screenHeight));
  }

  /**
   * 清除所有子弹
   */
  clear(): void {
    this.bullets = [];
  }

  /**
   * 获取子弹数量
   */
  getBulletCount(): number {
    return this.bullets.length;
  }
}
