/**
 * 角色实体类
 * 管理角色的状态、位置、属性等
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
  SKILL_1 = 'skill_1',     // 使用技能1
  SKILL_2 = 'skill_2',     // 使用技能2
  SKILL_3 = 'skill_3',     // 使用技能3
  HURT = 'hurt',           // 受伤
  DEAD = 'dead',           // 死亡
}

/**
 * 技能冷却状态
 */
interface SkillCooldowns {
  skill1: number;  // 技能1冷却剩余时间（秒）
  skill2: number;  // 技能2冷却剩余时间（秒）
  skill3: number;  // 技能3冷却剩余时间（秒）
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
  private _velocityX: number = 0;
  private _velocityY: number = 0;
  private _direction: CharacterDirection = CharacterDirection.RIGHT;

  // 状态
  private _state: CharacterState = CharacterState.IDLE;
  private _stateTimer: number = 0;  // 状态持续时间

  // 生命值
  private _hp: number;
  private _maxHp: number;

  // 技能冷却
  private _skillCooldowns: SkillCooldowns = {
    skill1: 0,
    skill2: 0,
    skill3: 0,
  };

  // 普通攻击冷却
  private _attackCooldown: number = 0;

  // 特殊状态
  private _isInvincible: boolean = false;  // 无敌状态
  private _isDefending: boolean = false;   // 防御状态（肉盾）
  private _isArmored: boolean = false;     // 装甲模式（肉盾）
  private _damageReduction: number = 0;    // 伤害减免比例

  // 强化状态
  private _nextAttackMultiplier: number = 1;  // 下次攻击倍率（狂战士技能1）

  constructor(characterId: CharacterId) {
    this.id = characterId;
    this.config = CHARACTERS[characterId];
    this._maxHp = 100;  // 默认100血量
    this._hp = this._maxHp;
  }

  // Getters
  get x(): number { return this._x; }
  get y(): number { return this._y; }
  get velocityX(): number { return this._velocityX; }
  get velocityY(): number { return this._velocityY; }
  get direction(): CharacterDirection { return this._direction; }
  get state(): CharacterState { return this._state; }
  get hp(): number { return this._hp; }
  get maxHp(): number { return this._maxHp; }
  get isInvincible(): boolean { return this._isInvincible; }
  get isDefending(): boolean { return this._isDefending; }
  get isArmored(): boolean { return this._isArmored; }
  get damageReduction(): number { return this._damageReduction; }
  get attackCooldown(): number { return this._attackCooldown; }
  get skillCooldowns(): SkillCooldowns { return { ...this._skillCooldowns }; }

  // Setters
  set x(value: number) { this._x = value; }
  set y(value: number) { this._y = value; }
  set velocityX(value: number) { this._velocityX = value; }
  set velocityY(value: number) { this._velocityY = value; }

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
  setState(state: CharacterState, duration: number = 0): void {
    this._state = state;
    this._stateTimer = duration;
  }

  /**
   * 设置无敌状态
   */
  setInvincible(value: boolean): void {
    this._isInvincible = value;
  }

  /**
   * 设置防御状态
   */
  setDefending(value: boolean, reduction: number = 0.7): void {
    this._isDefending = value;
    this._damageReduction = value ? reduction : 0;
  }

  /**
   * 设置装甲模式
   */
  setArmored(value: boolean): void {
    this._isArmored = value;
    this._damageReduction = value ? 0.5 : 0;
  }

  /**
   * 设置下次攻击倍率
   */
  setNextAttackMultiplier(multiplier: number): void {
    this._nextAttackMultiplier = multiplier;
  }

  /**
   * 受到伤害
   */
  takeDamage(damage: number): number {
    if (this._isInvincible) {
      return 0;
    }

    // 计算实际伤害（考虑伤害减免）
    const actualDamage = Math.floor(damage * (1 - this._damageReduction));
    this._hp = Math.max(0, this._hp - actualDamage);

    // 设置受伤状态
    if (this._hp > 0) {
      this.setState(CharacterState.HURT, 0.3);
    } else {
      this.setState(CharacterState.DEAD);
    }

    return actualDamage;
  }

  /**
   * 治疗
   */
  heal(amount: number): void {
    this._hp = Math.min(this._maxHp, this._hp + amount);
  }

  /**
   * 检查技能是否可用
   */
  canUseSkill(skillIndex: 1 | 2 | 3): boolean {
    const cooldownKey = `skill${skillIndex}` as keyof SkillCooldowns;
    return this._skillCooldowns[cooldownKey] <= 0 && this._state !== CharacterState.DEAD;
  }

  /**
   * 使用技能
   */
  useSkill(skillIndex: 1 | 2 | 3): boolean {
    if (!this.canUseSkill(skillIndex)) {
      return false;
    }

    const skill = this.config.skills[skillIndex - 1];
    const cooldownKey = `skill${skillIndex}` as keyof SkillCooldowns;
    this._skillCooldowns[cooldownKey] = skill.cooldown;

    // 设置技能状态
    this.setState((`skill_${skillIndex}`) as CharacterState, 0.5);

    return true;
  }

  /**
   * 检查普通攻击是否可用
   */
  canAttack(): boolean {
    return this._attackCooldown <= 0 && this._state !== CharacterState.DEAD;
  }

  /**
   * 执行普通攻击
   */
  attack(): number {
    if (!this.canAttack()) {
      return 0;
    }

    this._attackCooldown = this.config.attackCooldown;
    this.setState(CharacterState.ATTACKING, 0.2);

    // 计算伤害（含强化倍率）
    const damage = this.config.attackDamage * this._nextAttackMultiplier;
    this._nextAttackMultiplier = 1;  // 重置倍率

    return damage;
  }

  /**
   * 获取攻击范围
   */
  getAttackRange(): number {
    return this.config.attackDistance * 60;  // 转换为像素（1单位=60px）
  }

  /**
   * 更新角色状态
   */
  update(deltaTime: number): void {
    // 更新状态计时器
    if (this._stateTimer > 0) {
      this._stateTimer -= deltaTime;
      if (this._stateTimer <= 0) {
        // 状态结束，恢复待机
        if (this._state !== CharacterState.DEAD && this._state !== CharacterState.JUMPING) {
          this._state = CharacterState.IDLE;
        }
      }
    }

    // 更新攻击冷却
    if (this._attackCooldown > 0) {
      this._attackCooldown -= deltaTime;
    }

    // 更新技能冷却
    for (const key of Object.keys(this._skillCooldowns) as Array<keyof SkillCooldowns>) {
      if (this._skillCooldowns[key] > 0) {
        this._skillCooldowns[key] -= deltaTime;
      }
    }

    // 应用物理
    this._x += this._velocityX * deltaTime;
    this._y += this._velocityY * deltaTime;
  }

  /**
   * 重置角色状态
   */
  reset(): void {
    this._x = 0;
    this._y = 0;
    this._velocityX = 0;
    this._velocityY = 0;
    this._direction = CharacterDirection.RIGHT;
    this._state = CharacterState.IDLE;
    this._stateTimer = 0;
    this._hp = this._maxHp;
    this._attackCooldown = 0;
    this._skillCooldowns = { skill1: 0, skill2: 0, skill3: 0 };
    this._isInvincible = false;
    this._isDefending = false;
    this._isArmored = false;
    this._damageReduction = 0;
    this._nextAttackMultiplier = 1;
  }
}
