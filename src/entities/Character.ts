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
  DASHING = 'dashing',     // 冲刺中（技能2）
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

  // 冲刺相关（技能2）
  private _isDashing: boolean = false;        // 是否在冲刺中
  private _dashStartTime: number = 0;         // 冲刺开始时间（毫秒）
  private _dashDuration: number = 300;        // 冲刺持续时间（毫秒）
  private _dashDistance: number = 480;        // 冲刺距离（像素）= 8单位 × 60像素/单位
  private _dashStartX: number = 0;            // 冲刺起始X坐标
  private _dashTargetX: number = 0;           // 冲刺目标X坐标
  private _isInvincible: boolean = false;     // 是否无敌

  // 双枪连射相关（神枪手技能3）
  private _isRapidFire: boolean = false;       // 是否在双枪连射中
  private _rapidFireStartTime: number = 0;     // 双枪连射开始时间（毫秒）
  private _rapidFireDuration: number = 5000;   // 双枪连射持续时间（毫秒）= 5秒
  private _rapidFireShotsTotal: number = 25;   // 总射击次数 = 5秒 × 5枪/秒
  private _rapidFireShotsFired: number = 0;    // 已射击次数
  private _rapidFireLastShotTime: number = 0;  // 上次射击时间（毫秒）
  private _rapidFireInterval: number = 200;    // 射击间隔（毫秒）= 0.2秒 = 每秒5枪

  // 肉盾技能相关
  private _isShielding: boolean = false;         // 是否举盾防御中（技能1）
  private _isArmored: boolean = false;            // 是否装甲模式（技能3）
  private _armorStartTime: number = 0;            // 装甲模式开始时间（毫秒）
  private _armorDuration: number = 15000;         // 装甲模式持续时间（毫秒）= 15秒
  private _armorDamageReduction: number = 0.5;    // 装甲模式减伤比例
  private _shieldDamageReduction: number = 0.7;   // 举盾减伤比例

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
      // 技能2：冲刺8个单位
      this._dashDistance = 8 * 60; // 480像素
      break;
    case CharacterId.GUNNER:
      // 神枪手：普通攻击伤害5，冷却1秒，射程10单位
      this._attackDamage = 5;
      this._attackCooldown = 1;
      this._attackRange = 10;
      // 技能2：快速向前突进4个单位
      this._dashDistance = 4 * 60; // 240像素
      break;
    case CharacterId.TANK:
      // 肉盾：普通攻击伤害10，冷却0.5秒，射程2单位
      this._attackDamage = 10;
      this._attackCooldown = 0.5;
      this._attackRange = 2;
      // 技能2：向前冲撞8个单位
      this._dashDistance = 8 * 60; // 480像素
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
    // 如果有附魔，伤害翻倍（使用 getter 检查附魔是否过期）
    if (this.isEnchanted) {
      damage = damage * 2;
    }
    return damage;
  }

  // 冲刺相关 getters
  get isDashing(): boolean { return this._isDashing; }
  get isInvincible(): boolean { return this._isInvincible; }
  get dashProgress(): number {
    // 冲刺进度 0-1，用于动画插值
    if (!this._isDashing) return 0;
    const elapsed = Date.now() - this._dashStartTime;
    return Math.min(elapsed / this._dashDuration, 1);
  }

  // 双枪连射相关 getters（神枪手技能3）
  get isRapidFire(): boolean { return this._isRapidFire; }
  get rapidFireProgress(): number {
    // 双枪连射进度 0-1，用于UI显示
    if (!this._isRapidFire) return 0;
    const elapsed = Date.now() - this._rapidFireStartTime;
    return Math.min(elapsed / this._rapidFireDuration, 1);
  }
  get rapidFireShotsFired(): number { return this._rapidFireShotsFired; }
  get rapidFireShotsTotal(): number { return this._rapidFireShotsTotal; }

  // 肉盾技能相关 getters
  get isShielding(): boolean { return this._isShielding; }
  get isArmored(): boolean {
    // 检查装甲模式是否过期
    if (this._isArmored) {
      const elapsed = Date.now() - this._armorStartTime;
      if (elapsed >= this._armorDuration) {
        this._isArmored = false;
      }
    }
    return this._isArmored;
  }
  get armorProgress(): number {
    // 装甲模式进度 0-1，用于UI显示
    if (!this._isArmored) return 0;
    const elapsed = Date.now() - this._armorStartTime;
    return Math.min(elapsed / this._armorDuration, 1);
  }
  get armorDamageReduction(): number { return this._armorDamageReduction; }
  get shieldDamageReduction(): number { return this._shieldDamageReduction; }

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
    // 只有非跳跃状态才切换到攻击状态，跳跃时保持跳跃状态
    if (!this._isJumping) {
      this._state = CharacterState.ATTACKING;
    }

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
        // 如果还在跳跃中，保持跳跃状态
        if (this._isJumping) {
          this._state = CharacterState.JUMPING;
        } else {
          this._state = CharacterState.IDLE;
        }
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

    // 更新冲刺状态
    if (this._isDashing) {
      const elapsed = Date.now() - this._dashStartTime;
      const progress = Math.min(elapsed / this._dashDuration, 1);

      // 使用缓动函数实现平滑冲刺
      // easeOutQuad: 快速启动，缓慢结束
      const easeProgress = 1 - (1 - progress) * (1 - progress);

      // 更新位置
      this._x = this._dashStartX + (this._dashTargetX - this._dashStartX) * easeProgress;

      // 冲刺结束
      if (progress >= 1) {
        this._isDashing = false;
        this._isInvincible = false;
        // 确保最终位置准确
        this._x = this._dashTargetX;
        // 如果还在跳跃中，保持跳跃状态
        if (this._isJumping) {
          this._state = CharacterState.JUMPING;
        } else {
          this._state = CharacterState.IDLE;
        }
      }
    }

    // 更新双枪连射状态
    if (this._isRapidFire) {
      const elapsed = Date.now() - this._rapidFireStartTime;
      // 检查是否超过持续时间或发射完所有子弹
      if (elapsed >= this._rapidFireDuration || this._rapidFireShotsFired >= this._rapidFireShotsTotal) {
        this.stopRapidFire();
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
   * 注意：跳跃时也可以蓄力
   */
  startCharging(): void {
    if (!this._isCharging && !this._isAttacking) {
      this._isCharging = true;
      this._chargeStartTime = Date.now();
      // 只有非跳跃状态才切换到蓄力状态，跳跃时保持跳跃状态
      if (!this._isJumping) {
        this._state = CharacterState.CHARGING;
      }
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
    // 只有非跳跃状态才切换到攻击状态，跳跃时保持跳跃状态
    if (!this._isJumping) {
      this._state = CharacterState.ATTACKING;
    }

    // 蓄力攻击后清除附魔状态
    if (this._isEnchanted) {
      this._isEnchanted = false;
      this._attackDamage = this._originalAttackDamage; // 恢复原始伤害
    }

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
   * 开始冲刺（技能2）
   * @returns 是否成功开始冲刺
   */
  startDash(): boolean {
    if (this._isDashing || this._isCharging) return false;

    this._isDashing = true;
    this._isInvincible = true;
    this._dashStartTime = Date.now();
    this._dashStartX = this._x;

    // 根据朝向计算目标位置
    const dashDirection = this._direction === CharacterDirection.RIGHT ? 1 : -1;
    this._dashTargetX = this._x + dashDirection * this._dashDistance;

    // 切换到冲刺状态
    if (!this._isJumping) {
      this._state = CharacterState.DASHING;
    }

    return true;
  }

  /**
   * 开始双枪连射（神枪手技能3）
   * @returns 是否成功开始双枪连射
   */
  startRapidFire(): boolean {
    // 只有神枪手可以使用双枪连射
    if (this.id !== CharacterId.GUNNER) return false;
    // 如果正在蓄力、冲刺或已经在连射中，则不能开始
    if (this._isCharging || this._isDashing || this._isRapidFire) return false;

    this._isRapidFire = true;
    this._rapidFireStartTime = Date.now();
    this._rapidFireShotsFired = 0;
    this._rapidFireLastShotTime = 0;

    return true;
  }

  /**
   * 检查是否可以发射下一枪
   * @returns 是否可以发射
   */
  canFireRapidShot(): boolean {
    if (!this._isRapidFire) return false;

    const currentTime = Date.now();
    const elapsed = currentTime - this._rapidFireStartTime;

    // 检查是否已经发射完所有子弹
    if (this._rapidFireShotsFired >= this._rapidFireShotsTotal) return false;

    // 检查是否超过持续时间
    if (elapsed >= this._rapidFireDuration) return false;

    // 检查射击间隔
    const timeSinceLastShot = currentTime - this._rapidFireLastShotTime;
    return timeSinceLastShot >= this._rapidFireInterval || this._rapidFireShotsFired === 0;
  }

  /**
   * 记录发射了一枪
   */
  fireRapidShot(): void {
    if (!this._isRapidFire) return;

    this._rapidFireShotsFired++;
    this._rapidFireLastShotTime = Date.now();
  }

  /**
   * 停止双枪连射
   */
  stopRapidFire(): void {
    this._isRapidFire = false;
    this._rapidFireShotsFired = 0;
  }

  /**
   * 开始举盾防御（肉盾技能1）
   * 按住举盾，减少70%伤害，不能攻击
   */
  startShielding(): void {
    if (this.id !== CharacterId.TANK) return;
    this._isShielding = true;
  }

  /**
   * 停止举盾防御
   */
  stopShielding(): void {
    this._isShielding = false;
  }

  /**
   * 开始装甲模式（肉盾技能3）
   * 减少50%伤害，普通攻击造成15点伤害，持续15秒
   * @returns 是否成功开始装甲模式
   */
  startArmor(): boolean {
    if (this.id !== CharacterId.TANK) return false;
    if (this._isArmored) return false;

    this._isArmored = true;
    this._armorStartTime = Date.now();
    this._attackDamage = 15; // 装甲模式下攻击伤害提升到15

    return true;
  }

  /**
   * 停止装甲模式
   */
  stopArmor(): void {
    this._isArmored = false;
    this._attackDamage = 10; // 恢复原始攻击伤害
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
    this._isDashing = false;
    this._isInvincible = false;
    this._isRapidFire = false;
    this._isShielding = false;
    this._isArmored = false;
    this._lastAttackTime = 0;
    this._attackStartTime = 0;
    this._chargeStartTime = 0;
    this._dashStartTime = 0;
    this._rapidFireStartTime = 0;
    this._rapidFireShotsFired = 0;
    this._armorStartTime = 0;
    // 重置攻击伤害
    this.initAttackStats();
  }
}
