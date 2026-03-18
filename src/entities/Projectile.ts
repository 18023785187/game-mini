/**
 * 投射物实体类
 * 管理投射物的飞行、渲染和碰撞检测
 */

import { CharacterDirection } from './Character';

/**
 * 投射物类型
 */
export enum ProjectileType {
  BULLET = 'bullet',         // 普通子弹（神枪手）
  ARROW = 'arrow',           // 箭矢
  MAGIC_ORB = 'magic_orb',   // 魔法球
}

/**
 * 投射物配置
 */
export interface ProjectileConfig {
  type: ProjectileType;
  damage: number;            // 伤害值
  speed: number;             // 飞行速度（像素/秒）
  range: number;             // 射程（像素）
  size: number;              // 投射物大小
  color: string;             // 主题色
}

/**
 * 投射物实体
 */
export class Projectile {
  // 基础属性
  readonly config: ProjectileConfig;
  readonly ownerId: string;  // 发射者ID
  readonly direction: CharacterDirection;

  // 位置和移动
  private _x: number;
  private _y: number;
  private startX: number;    // 起始X坐标（用于计算飞行距离）
  private velocityX: number; // X方向速度

  // 状态
  private _isActive: boolean = true;
  private _hasHit: boolean = false;
  private trailPositions: { x: number; y: number; alpha: number }[] = []; // 轨迹位置

  constructor(
    x: number,
    y: number,
    direction: CharacterDirection,
    config: ProjectileConfig,
    ownerId: string
  ) {
    this._x = x;
    this._y = y;
    this.startX = x;
    this.direction = direction;
    this.config = config;
    this.ownerId = ownerId;

    // 计算速度（根据方向）
    this.velocityX = direction === CharacterDirection.RIGHT 
      ? config.speed 
      : -config.speed;
  }

  // Getters
  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get isActive(): boolean { return this._isActive; }
  get hasHit(): boolean { return this._hasHit; }
  get trail(): { x: number; y: number; alpha: number }[] { return this.trailPositions; }

  /**
   * 更新投射物状态
   */
  update(deltaTime: number): void {
    if (!this._isActive) return;

    const dt = deltaTime / 1000;

    // 保存轨迹位置（用于绘制拖尾效果）
    this.trailPositions.unshift({
      x: this._x,
      y: this._y,
      alpha: 1,
    });

    // 限制轨迹长度（增加到12个点，让轨迹更长更明显）
    if (this.trailPositions.length > 12) {
      this.trailPositions.pop();
    }

    // 更新轨迹透明度
    this.trailPositions.forEach((pos, index) => {
      pos.alpha = 1 - index / this.trailPositions.length;
    });

    // 更新位置
    this._x += this.velocityX * dt;

    // 检查是否超出射程
    const traveledDistance = Math.abs(this._x - this.startX);
    if (traveledDistance >= this.config.range) {
      this._isActive = false;
    }
  }

  /**
   * 标记命中
   */
  markHit(): void {
    this._hasHit = true;
    this._isActive = false;
  }

  /**
   * 检查是否命中目标
   */
  checkCollision(targetX: number, targetY: number, targetWidth: number, targetHeight: number): boolean {
    if (!this._isActive || this._hasHit) return false;

    // 简单的矩形碰撞检测
    const halfWidth = targetWidth / 2;
    const halfHeight = targetHeight / 2;

    const inX = this._x >= targetX - halfWidth && this._x <= targetX + halfWidth;
    const inY = this._y >= targetY - halfHeight && this._y <= targetY + halfHeight;

    return inX && inY;
  }

  /**
   * 销毁投射物
   */
  destroy(): void {
    this._isActive = false;
    this.trailPositions = [];
  }
}
