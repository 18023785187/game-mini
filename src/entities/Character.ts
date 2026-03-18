/**
 * 角色实体类
 * 管理角色的位置、方向等基础属性
 */

import { CharacterId, CharacterConfig, CHARACTERS } from '../types/Character';

/**
 * 角色方向
 */
export enum CharacterDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

/**
 * 角色状态
 */
export enum CharacterState {
  IDLE = 'idle',           // 待机
  MOVING = 'moving',       // 移动中
  JUMPING = 'jumping',     // 跳跃中
  ATTACKING = 'attacking', // 攻击中
  CHARGING = 'charging',   // 蓄力中（技能3）
}

/**
 * 角色实体
 */
export class Character {
  // 基础属性
  readonly id: CharacterId;
  readonly config: CharacterConfig;

  // 位置和移动
  private _x: number = 0;
  private _y: number = 0;
  private _direction: CharacterDirection = CharacterDirection.RIGHT;

  // 跳跃相关
  private _groundY: number = 0;      // 地面Y坐标
  private _velocityY: number = 0;     // 垂直速度
  private _isJumping: boolean = false; // 是否在跳跃中
  private readonly JUMP_FORCE = 400;   // 跳跃力度（正值，因为Y轴向上为正）
  private readonly GRAVITY = -1200;    // 重力加速度（负值，向下拉）
  private readonly JUMP_HEIGHT_LIMIT = 180; // 跳跃高度限制(3个单位,60px/单位)

  // 状态
  private _state: CharacterState = CharacterState.IDLE;

  // 攻击相关
  private _attackDamage: number = 0;     // 攻击伤害
  private _attackCooldown: number = 0;   // 攻击冷却时间（秒）
  private _attackRange: number = 0;      // 攻击范围（单位）
  private _lastAttackTime: number = 0;  // 上次攻击时间（毫秒）
  private _isAttacking: boolean = false;  // 是否正在攻击
  private _attackStartTime: number = 0;   // 攻击开始时间（毫秒）
  private _attackDuration: number = 300;  // 攻击动画持续时间（毫秒）

  // 技能相关
  private _isEnchanted: boolean = false;   // 是否附魔（一技能）
  private _enchantStartTime: number = 0;   // 附魔开始时间（毫秒）
  private _enchantDuration: number = 5000; // 附魔持续时间（毫秒）- 技能1持续5秒
  private _originalAttackDamage: number = 0; // 原始攻击伤害（用于取消附魔时恢复）

  // 蓄力相关（技能3）
  private _isCharging: boolean = false;     // 是否在蓄力
  private _chargeStartTime: number = 0;     // 蓄力开始时间（毫秒）
  private readonly MAX_CHARGE_TIME = 5000;  // 最大蓄力时间（毫秒）

  constructor(characterId: CharacterId) {
    this.id = characterId;
    this.config = CHARACTERS[characterId];
    this.initAttackStats();
  }

  /**
   * 初始化角色攻击属性
   */
  private initAttackStats(): void {
    switch (this.id) {
    case CharacterId.BERSERKER:
      // 狂战士：普通攻击伤害10，冷却0.5秒，射程3单位
      this._attackDamage = 10;
      this._attackCooldown = 0.5;
      this._attackRange = 3;
      break;
    case CharacterId.GUNNER:
      // 神枪手：普通攻击伤害5，冷却1秒，射程10单位
      this._attackDamage = 5;
      this._attackCooldown = 1;
      this._attackRange = 10;
      break;
    case CharacterId.TANK:
      // 肉盾：普通攻击伤害10，冷却0.5秒，射程2单位
      this._attackDamage = 10;
      this._attackCooldown = 0.5;
      this._attackRange = 2;
      break;
    }
  }

  // Getters
  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get direction(): CharacterDirection { return this._direction; }
  get state(): CharacterState { return this._state; }
  get isJumping(): boolean { return this._isJumping; }
  get isAttacking(): boolean { return this._isAttacking; }
  get attackDamage(): number { return this._attackDamage; }
  get attackCooldown(): number { return this._attackCooldown; }
  get attackRange(): number { return this._attackRange; }
  get isEnchanted(): boolean {
    // 检查附魔是否过期
    if (this._isEnchanted) {
      const elapsed = Date.now() - this._enchantStartTime;
      if (elapsed >= this._enchantDuration) {
        this._isEnchanted = false;
        this._attackDamage = this._originalAttackDamage; // 恢复原始伤害
      }
    }
    return this._isEnchanted;
  }
  get attackProgress(): number {
    // 攻击进度 0-1，用于动画插值
    if (!this._isAttacking) return 0;
    const elapsed = Date.now() - this._attackStartTime;
    return Math.min(elapsed / this._attackDuration, 1);
  }

  get isCharging(): boolean { return this._isCharging; }
  get chargeProgress(): number {
    // 蓄力进度 0-1，用于UI显示
    if (!this._isCharging) return 0;
    const elapsed = Date.now() - this._chargeStartTime;
    return Math.min(elapsed / this.MAX_CHARGE_TIME, 1);
  }
  get chargeDamage(): number {
    // 根据蓄力时间计算伤害：10-30点
    if (!this._isCharging) return 0;
    const elapsed = Math.min(Date.now() - this._chargeStartTime, this.MAX_CHARGE_TIME);
    const progress = elapsed / this.MAX_CHARGE_TIME;
    const baseDamage = 10;
    const bonusDamage = Math.floor(progress * 20); // 0-20点额外伤害
    let damage = baseDamage + bonusDamage;
    // 如果有附魔，伤害翻倍
    if (this._isEnchanted) {
      damage = damage * 2;
    }
    return damage;
  }

  // Setters
  set x(value: number) { this._x = value; }
  set y(value: number) { this._y = value; }

  /**
   * 设置位置
   */
  setPosition(x: number, y: number): void {
    this._x = x;
    this._y = y;
  }

  /**
   * 设置方向
   */
  setDirection(direction: CharacterDirection): void {
    this._direction = direction;
  }

  /**
   * 设置状态
   */
  setState(state: CharacterState): void {
    this._state = state;
  }

  /**
   * 触发跳跃
   */
  jump(): void {
    if (!this._isJumping) {
      this._isJumping = true;
      this._velocityY = this.JUMP_FORCE;
      this._state = CharacterState.JUMPING;
    }
  }

  /**
   * 触发攻击
   * @returns 是否成功触发攻击（false表示冷却中）
   */
  attack(): boolean {
    const currentTime = Date.now();

    // 检查冷却
    if (currentTime - this._lastAttackTime < this._attackCooldown * 1000) {
      return false; // 冷却中，无法攻击
    }

    // 触发攻击
    this._isAttacking = true;
    this._attackStartTime = currentTime;
    this._lastAttackTime = currentTime;
    this._state = CharacterState.ATTACKING;

    // 攻击后清除附魔状态
    if (this._isEnchanted) {
      this._isEnchanted = false;
      this._attackDamage = this._originalAttackDamage; // 恢复原始伤害
    }

    return true;
  }

  /**
   * 检查是否可以攻击
   * @returns 是否可以攻击
   */
  canAttack(): boolean {
    const currentTime = Date.now();
    return currentTime - this._lastAttackTime >= this._attackCooldown * 1000 && !this._isAttacking;
  }

  /**
   * 检查目标是否在攻击范围内
   * @param targetX 目标X坐标（世界坐标）
   * @param targetY 目标Y坐标（世界坐标）
   * @returns 目标是否在攻击范围内
   */
  isTargetInRange(targetX: number, targetY: number): boolean {
    const dx = targetX - this._x;
    const dy = targetY - this._y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 攻击范围转换为像素（1单位 = 60px）
    const rangePixels = this._attackRange * 60;

    return distance <= rangePixels;
  }

  /**
   * 设置地面Y坐标
   */
  setGroundY(groundY: number): void {
    this._groundY = groundY;
  }

  /**
   * 获取地面Y坐标
   */
  get groundY(): number {
    return this._groundY;
  }

  /**
   * 更新角色状态
   */
  update(deltaTime: number): void {
    // 更新跳跃物理
    if (this._isJumping) {
      const dt = deltaTime / 1000;
      this._y += this._velocityY * dt;
      this._velocityY += this.GRAVITY * dt;

      // 跳跃高度限制(3个单位 = 180px)
      if (this._y > this._groundY + this.JUMP_HEIGHT_LIMIT) {
        this._y = this._groundY + this.JUMP_HEIGHT_LIMIT;
        this._velocityY = 0; // 达到最大高度后停止上升
      }

      // 落地检测
      if (this._y <= this._groundY) {
        this._y = this._groundY;
        this._isJumping = false;
        this._velocityY = 0;

        // 根据是否在移动更新状态
        if (this._state === CharacterState.JUMPING) {
          this._state = CharacterState.IDLE;
        }
      }
    }

    // 更新攻击状态
    if (this._isAttacking) {
      const currentTime = Date.now();
      if (currentTime - this._attackStartTime >= this._attackDuration) {
        // 攻击动画结束
        this._isAttacking = false;
        this._state = CharacterState.IDLE;
      }
    }

    // 更新蓄力状态
    if (this._isCharging) {
      const elapsed = Date.now() - this._chargeStartTime;
      // 达到最大蓄力时间自动攻击
      if (elapsed >= this.MAX_CHARGE_TIME) {
        this.releaseCharge();
      }
    }
  }

  /**
   * 触发附魔（一技能）
   * @param duration 附魔持续时间（毫秒），默认5000ms
   */
  enchant(duration: number = 5000): void {
    // 保存原始伤害（第一次附魔时）
    if (!this._isEnchanted) {
      this._originalAttackDamage = this._attackDamage;
    }

    // 启动附魔
    this._isEnchanted = true;
    this._enchantStartTime = Date.now();
    this._enchantDuration = duration;

    // 增加攻击力（附魔后伤害翻倍）
    this._attackDamage = Math.floor(this._originalAttackDamage * 2);
  }

  /**
   * 开始蓄力（技能3）
   */
  startCharging(): void {
    if (!this._isCharging && !this._isAttacking) {
      this._isCharging = true;
      this._chargeStartTime = Date.now();
      this._state = CharacterState.CHARGING;
    }
  }

  /**
   * 释放蓄力攻击（技能3）
   * @returns 本次攻击伤害
   */
  releaseCharge(): number {
    if (!this._isCharging) return 0;

    const damage = this.chargeDamage;

    // 触发攻击动画
    this._isAttacking = true;
    this._attackStartTime = Date.now();
    this._lastAttackTime = Date.now();

    // 停止蓄力
    this._isCharging = false;
    this._state = CharacterState.ATTACKING;

    return damage;
  }

  /**
   * 取消蓄力
   */
  cancelCharge(): void {
    if (this._isCharging) {
      this._isCharging = false;
      this._state = CharacterState.IDLE;
    }
  }

  /**
   * 重置角色状态
   */
  reset(): void {
    this._x = 0;
    this._y = 0;
    this._groundY = 0;
    this._velocityY = 0;
    this._isJumping = false;
    this._direction = CharacterDirection.RIGHT;
    this._state = CharacterState.IDLE;
    this._isAttacking = false;
    this._isEnchanted = false;
    this._isCharging = false;
    this._lastAttackTime = 0;
    this._attackStartTime = 0;
    this._chargeStartTime = 0;
  }
}
