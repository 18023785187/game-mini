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
  BOMB = 'bomb',             // 炸弹（神枪手技能1）
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
  explosionRadius?: number;  // 爆炸范围（像素）- 炸弹专用
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
  private startY: number;    // 起始Y坐标（用于计算抛物线）
  private startX: number;    // 起始X坐标（用于计算飞行距离）
  private velocityX: number; // X方向速度
  private velocityY: number; // Y方向速度（抛物线用）
  private gravity: number = 600; // 重力加速度（像素/秒²）

  // 炸弹抛物线专用
  private targetX: number;      // 目标X坐标
  private flightTime: number = 0; // 飞行时间

  // 状态
  private _isActive: boolean = true;
  private _hasHit: boolean = false;
  private trailPositions: { x: number; y: number; alpha: number }[] = []; // 轨迹位置

  // 炸弹专用
  private _isExploding: boolean = false;     // 是否正在爆炸
  private _explosionProgress: number = 0;    // 爆炸进度 0-1
  private _explosionDuration: number = 500;  // 爆炸持续时间（毫秒）
  private _explosionStartTime: number = 0;   // 爆炸开始时间

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
    this.startY = y;
    this.direction = direction;
    this.config = config;
    this.ownerId = ownerId;

    // 计算速度（根据方向）
    this.velocityX = direction === CharacterDirection.RIGHT
      ? config.speed
      : -config.speed;

    // 炸弹使用抛物线运动
    if (config.type === ProjectileType.BOMB) {
      this.targetX = x + (direction === CharacterDirection.RIGHT ? config.range : -config.range);
      // 计算抛物线初速度
      // 假设炸弹飞行时间为1.5秒
      const flightDuration = 1.5;
      this.velocityX = (this.targetX - x) / flightDuration;
      // 计算初始Y速度，使炸弹能够达到最高点后落下
      // 使用公式：h = v0 * t - 0.5 * g * t²
      // 假设最高点在飞行时间的一半时达到
      const maxHeight = 150; // 最高点高度
      this.velocityY = (maxHeight + 0.5 * this.gravity * Math.pow(flightDuration / 2, 2)) / (flightDuration / 2);
    } else {
      this.velocityY = 0;
      this.targetX = 0;
    }
  }

  // Getters
  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get isActive(): boolean { return this._isActive; }
  get hasHit(): boolean { return this._hasHit; }
  get trail(): { x: number; y: number; alpha: number }[] { return this.trailPositions; }
  get isExploding(): boolean { return this._isExploding; }
  get explosionProgress(): number { return this._explosionProgress; }
  get explosionRadius(): number { return this.config.explosionRadius || 0; }

  /**
   * 更新投射物状态
   */
  update(deltaTime: number): void {
    if (!this._isActive) return;

    // 炸弹正在爆炸
    if (this._isExploding) {
      const elapsed = Date.now() - this._explosionStartTime;
      this._explosionProgress = Math.min(elapsed / this._explosionDuration, 1);
      if (this._explosionProgress >= 1) {
        this._isActive = false;
      }
      return;
    }

    const dt = deltaTime / 1000;
    this.flightTime += dt;

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

    // 炸弹使用抛物线运动
    if (this.config.type === ProjectileType.BOMB) {
      // Y方向：抛物线运动
      this._y = this.startY + this.velocityY * this.flightTime - 0.5 * this.gravity * Math.pow(this.flightTime, 2);

      // 检查是否落地（Y坐标降到起始高度或以下）
      if (this._y <= this.startY && this.flightTime > 0.1) {
        this._y = this.startY;
        this.startExplosion();
      }
    } else {
      // 普通投射物：直线运动
      // 检查是否超出射程
      const traveledDistance = Math.abs(this._x - this.startX);
      if (traveledDistance >= this.config.range) {
        this._isActive = false;
      }
    }
  }

  /**
   * 开始爆炸
   */
  private startExplosion(): void {
    this._isExploding = true;
    this._explosionStartTime = Date.now();
    this._explosionProgress = 0;
    // 停止移动
    this.velocityX = 0;
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
   * 检查爆炸范围是否命中目标
   */
  checkExplosionHit(targetX: number, targetY: number): boolean {
    if (!this._isExploding) return false;
    // 爆炸只造成一次伤害
    if (this._hasHit) return false;

    const distance = Math.sqrt(
      Math.pow(this._x - targetX, 2) + Math.pow(this._y - targetY, 2)
    );

    return distance <= this.explosionRadius;
  }

  /**
   * 标记爆炸伤害已造成
   */
  markExplosionDamage(): void {
    this._hasHit = true;
  }

  /**
   * 销毁投射物
   */
  destroy(): void {
    this._isActive = false;
    this.trailPositions = [];
  }
}
